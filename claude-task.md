# Claude Task — Steam Integration

## Goal
Replace the mockapi-backed catalog with a Steam-backed one, with `{limit, offset}` pagination, and let users link their Steam library into their personal lists.

## Decisions taken (with user)
- **Rating source:** Steam review % → 0–10 (positive_reviews / total_reviews × 10).
- **Filter strategy:** server-side filters, client-side sort.
- **Pagination UX:** numbered pages, 24 per page.
- **Catalog strategy (Option A):** bounded, pre-indexed catalog of ~100 most-played games (env-tunable via `CATALOG_SIZE`). Lazy-fetched on demand when an unknown appid is requested (e.g. by Steam library import).

## Architecture

```
Browser ──► Express server (:3001) ──► Steam APIs
            Catalog
            ├─ GET  /api/v1/games?limit=&offset=&search=&genre=&platform=&year=&minRating=
            ├─ GET  /api/v1/games/:id
            ├─ GET  /api/v1/games/by-ids?ids=…    (lazy-ensures unknown appids)
            ├─ GET  /api/v1/facets                (genres / platforms / years)
            └─ GET  /api/v1/health
            Auth (passport-steam OpenID + express-session)
            ├─ GET  /auth/steam                   (begins OpenID flow)
            ├─ GET  /auth/steam/return            (OpenID callback, sets session)
            ├─ GET  /auth/me                      (returns the linked Steam user)
            └─ POST /auth/logout                  (clears the session)
            Steam library
            └─ GET  /api/v1/steam/library/me      (uses session steamid)
```

Why a server proxy: Steam endpoints don't send CORS headers and the API key must stay off the client. The proxy also caches/normalizes Steam data so the frontend sees a consistent `Game` shape. The Steam OpenID flow also requires server-side validation of the signed assertion, which is why it can't be done from the browser alone.

## Files added

### Server (`server/`)
| File | Purpose |
|---|---|
| `package.json` | express, axios, cors, dotenv, ts-node |
| `tsconfig.json` | Loose TS config for ts-node |
| `.gitignore` | Ignores `.cache/`, `.env`, `dist/`, `node_modules` |
| `src/index.ts` | Express app + routes |
| `src/steam.ts` | Steam client, in-memory + disk cache, query/facets/ensure logic |
| `src/types.ts` | Shared `Game` interface |

### Frontend
| File | Purpose |
|---|---|
| `src/components/Pagination/Pagination.tsx` + `.module.css` | Numbered pager (prev / 1 … N / next + range summary) |
| `src/components/SteamLibraryImport/SteamLibraryImport.tsx` + `.module.css` | Collapsible panel to paste SteamID64, fetch owned games, multi-select, pick target status, bulk-import |

## Files modified

### Env / infra
- `.env` — dropped `VITE_STEAM_API_KEY` (was leaking to browser), added server-only `STEAM_API_KEY`, `CATALOG_SIZE`, `STEAM_REQUEST_DELAY_MS`, `FRONTEND_URL`, and `VITE_STEAM_CATALOG_URL=http://localhost:3001` for the frontend axios baseURL.
- `server/.env` — mirrors the relevant server-only vars for local dev.

### Frontend
| File | Change |
|---|---|
| `src/api/mockApi.ts` | Added `steamCatalogApi` axios instance pointing at `VITE_STEAM_CATALOG_URL` |
| `src/features/games/gamesAPI.ts` | `fetchGames` takes `{limit, offset, search, genre, platform, year, minRating}`; added `fetchFacets`, `fetchGamesByIds`, `fetchSteamLibrary`; old mockApi CRUD left intact |
| `src/features/games/gamesSlice.ts` | New state: `byId`, `total`, `currentPage`, `pageSize=24`, `facets`. New thunks: `fetchFacets`, `fetchGamesByIds`. New action: `setCurrentPage`. Selector renamed to `selectSortedPageGames` (sort-only — filtering moved server-side) |
| `src/pages/HomePage.tsx` | Refetches on filter or page change; resets to page 1 on filter changes; renders `<Pagination />` |
| `src/components/FilterBar/FilterBar.tsx` | Dropdowns now driven by `/facets` (full catalog) instead of the current page |
| `src/pages/ListPage.tsx` | Looks up games via `byId`; dispatches `fetchGamesByIds` for entries whose game isn't cached yet; mounts `<SteamLibraryImport />` |
| `src/components/Navbar/Navbar.tsx` | Hid "Add Game" link (Steam catalog is read-only). Route + CRUD thunks remain intact — easy to delete later if desired |

## How rating / filter / search work on the server
- **Search:** case-insensitive substring on game name
- **Genre / Platform / Year:** exact filters against the normalized arrays
- **minRating:** `g.rating >= n` (rating is `Math.round(positive/total*100)/10`)
- **Sort:** still client-side over the loaded page (title / rating / release-year, asc/desc)

## Lazy on-demand catalog expansion
`GET /api/v1/games/by-ids?ids=…`:
1. Returns any ids already cached immediately.
2. For unknown ids (cap **30 per call**), calls `appdetails` + `appreviews`, normalizes, **persists to disk cache**, and returns them too.
3. ListPage uses this to fill in metadata for Steam-imported games whose appids aren't part of the default catalog.

## Steam as a primary login method
**User model**: `User` extended with optional `steamid`, `displayName`, `avatar` (mockapi accepts the extra fields).

**Flow**:
1. From **LoginPage** or **RegisterPage**, user clicks the official "Sign in through Steam" button → `window.location` to `${SERVER}/auth/steam?returnTo=/`.
2. Server stashes `returnTo` in the session (validated against open-redirect: only paths starting with `/`, not `//`) and triggers `passport.authenticate('steam')`.
3. Steam OpenID round-trip lands at `/auth/steam/return`. Server stores `{ steamid, displayName, avatar, profileUrl }` in session and redirects to `${FRONTEND_URL}${returnTo}?steam=ok`.
4. A top-level `<SteamCallbackHandler />` (mounted in `App.tsx`) detects `?steam=ok`, strips it from the URL, and dispatches `loginWithSteam()`:
   - Calls `/auth/me` → SteamUser.
   - Looks up an existing app user with that `steamid` in mockapi.
   - **Link** path: if no user matches the steamid but there's a current app user without `steamid`, PUTs the patch to mockapi (merging Steam into the current account).
   - **Create** path: if no user matches and no current user, POSTs a new user `{ username, email: steam-{steamid}@gamelib.local, password: '', steamid, displayName, avatar }`. Username collisions get a `_xxxx` (last 4 of steamid) suffix.
   - **Login** path: if a match is found, just loads it.
   - Persists to `localStorage` (`user`) — the rest of the app sees this user the same as any other.
5. Toast confirms `Signed in as <name>`.

**Logout** is now a thunk: clears localStorage AND calls `POST /auth/logout` so the server session goes away too.

**Navbar**: shows the user's avatar (round) and `displayName || username`.

## Steam library import flow
On **My Lists**, the `<SteamLibraryImport />` panel reads `currentUser.steamid`:
- If the user has no `steamid` (signed in via email/password), the panel shows **Link Steam** → triggers OpenID with `returnTo=/my-list/playing`. After the round-trip the SteamCallbackHandler merges the steamid onto the current account.
- If the user already has a `steamid`, the panel shows **Fetch My Library** → calls `GET /api/v1/steam/library/:steamid` (public endpoint, server-side API key) → renders the library sorted by playtime → user picks a status + selections → bulk-imports via `addToList`.
- ListPage's `fetchGamesByIds` effect lazily ensures the imported appids in the Steam catalog cache so their cards have name + image + metadata.

The session cookie (`connect.sid`) is `httpOnly; sameSite=lax`. Cross-origin XHRs from `localhost:5173` to `localhost:3001` carry it because both ports share the `localhost` site under SameSite rules.

## Verification done
- `tsc -p tsconfig.app.json --noEmit` — clean
- `npm run build` — clean, 350 KB bundle
- Live Steam smoke test:
  - Boot with `CATALOG_SIZE=5` → got Counter-Strike 2, PUBG, Dota 2, Wallpaper Engine, Subnautica 2 with real ratings (8.6, 6.0, …)
  - `/facets` returned populated genres/platforms/years
  - `/games?limit=3&offset=0` returned the page slice with `total`
  - `/games/by-ids?ids=271590` lazily fetched GTA V Legacy from Steam, persisted to cache, returned it
  - `/steam/library/abc` correctly returns 400 with a helpful message

## How to run
```bash
# Terminal 1 — server (first boot fetches the catalog, ~60–90s for size 100)
cd server && npm install && npm start

# Terminal 2 — frontend
npm run dev
```

## Notable security fix
`VITE_STEAM_API_KEY` was being bundled into the client JS — anyone could read it with DevTools. It now lives only on the server as `STEAM_API_KEY`. Rotate the key on Steam if you want, since the old one was committed.

## Known limitations / follow-ups
- **AddGamePage** route still exists but is unlinked from the nav. CRUD thunks still hit the old mockApi. Decide whether to delete the route entirely.
- **Catalog size** is capped at 100 by default — Steam has ~150k apps and rate-limits us. Increase `CATALOG_SIZE` for a larger seed, or rely on lazy-ensure to grow it organically.
- **Cold boot** does Steam calls serially with a 400 ms throttle. Bumping `CATALOG_SIZE` to 500 means a ~7-minute cold boot. The disk cache makes subsequent boots instant.
- **Numbered pagination + server-side filters** assumes the catalog is bounded. If you ever switch to "index all of Steam," filters will need a different approach (search-only on the server, others client-side).
- **Reviews** for `appreviews` are fetched per app on first import — if Steam rate-limits us during a big import, the rating defaults to 0 for that game. Re-fetching later fills it in.
- **Session store** is express-session's default in-memory `MemoryStore` — fine for dev, but loses sessions on every server restart and leaks under load. For production, swap in `connect-redis` or similar.
- **Production cookies**: session cookie is currently `secure: false, sameSite: lax` for localhost dev. Behind HTTPS in production, set `secure: true` and verify the cross-origin setup (or put nginx in front to make the frontend + server same-origin).
- **Steam profile must be Public** for `GetOwnedGames` to return data. A private profile yields a 403 with a friendly message.
