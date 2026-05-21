# 🎮 Game Library Browser with Personal Lists

A React + Redux Toolkit web application for browsing video games and organizing them into personal lists (Playing, Completed, Backlog, Wishlist). Built as a frontend-only project backed by MockAPI, with an optional Steam catalog loader.

## 📖 Description

Game Library Browser is a single-page web application that allows users to:
- Explore a pre-filled catalog of video games
- Search, filter, and sort games by various criteria
- Organize games into four personal lists
- Add personal notes and ratings to tracked games
- Import their Steam library to seed personal lists
- Optionally contribute new games to the catalog (admin only)
- Perform full CRUD (Create, Read, Update, Delete) operations on their game lists

## 👥 Target Users

This website is designed for **gamers who want a personal tool to organize, track, and discover video games** — think of it as a "Goodreads for games" or a personal Letterboxd for gaming.

**Ideal users include:**
- 🎮 **Gamers** with libraries across Steam, PlayStation, Xbox, or Switch
- 📚 **Game collectors** who own many games and need to track them
- 🎯 **Backlog strugglers** who buy games faster than they finish them
- 🔍 **Game discoverers** looking for new games by genre, platform, or rating

**Example user persona:**
> **Alex, 24** — plays games 10+ hours a week, owns 150+ games across multiple platforms. Uses Game Library Browser to track which games are finished, which are in progress, and what to play next.

## 🧭 How It Works

The website uses a **hybrid catalog approach**:

- 📦 **Pre-filled catalog** — The site comes pre-loaded with games in MockAPI, so users see a populated catalog right away.
- ➕ **Admin contributions** — Admin users can add new games to the catalog via the `/add-game` page.
- 🎮 **Steam import** — Signed-in users can pull their Steam library to populate personal lists in bulk.
- 📋 **Personal lists** — Users primarily interact with the site by adding games to their own four lists: **Playing**, **Completed**, **Backlog**, **Wishlist**.
- ⭐ **Personal data** — Each list entry can have personal notes and a personal rating, separate from the catalog rating.

## ✨ Features

- 🔐 **Auth** — Register/login with role-based access (regular user vs. admin)
- 🔍 **Browse & Search** — Explore the full game catalog with real-time search and pagination
- 🎯 **Filter & Sort** — Filter by genre, platform, release year, and rating
- 📋 **Four Personal Lists** — Playing, Completed, Backlog, Wishlist
- ⭐ **Personal Ratings & Notes** — Add your own score and notes for each game
- 🔄 **Move Between Lists** — Easily change a game's status
- 🎮 **Steam Library Import** — Bulk-import games from a Steam account
- ➕ **Add New Games (admin)** — Contribute new games to the catalog
- ✏️ **Edit & Delete** — Full control over personal list entries
- 🛠️ **Admin Page** — Manage catalog entries

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite |
| State Management | Redux Toolkit + RTK Query |
| UI State | React Context (`UIContext`) |
| Routing | React Router v7 |
| Icons | lucide-react |
| Mock Backend | MockAPI |
| Styling | CSS Modules |
| Testing | Vitest |
| Linting | ESLint (typescript-eslint) |
| Deployment | Docker + Nginx, Vercel |

## 📁 Project Structure

```
adv-js/
├── public/
├── src/
│   ├── api/                       # (none — API code lives under features/api)
│   ├── app/
│   │   └── store.ts               # Redux store configuration
│   ├── components/
│   │   ├── FilterBar/
│   │   ├── GameCard/
│   │   ├── GameGrid/
│   │   ├── ListEntryCard/
│   │   ├── Modal/
│   │   ├── Navbar/
│   │   ├── Pagination/
│   │   ├── Sidebar/
│   │   ├── Spinner/
│   │   ├── SteamLibraryImport/
│   │   └── Toast/
│   ├── context/
│   │   ├── UIContext.tsx          # Modal + Toast UI state (React Context)
│   │   ├── UIContextDef.ts
│   │   └── useUI.ts
│   ├── features/
│   │   ├── api/
│   │   │   ├── gameApi.ts         # RTK Query — games + lists
│   │   │   └── userApi.ts         # RTK Query — users / auth
│   │   ├── auth/
│   │   │   ├── authAPI.ts         # Auth helpers (admin role check, etc.)
│   │   │   └── authSlice.ts       # Current user state
│   │   ├── filters/
│   │   │   └── filtersSlice.ts    # Search query, filters, sort
│   │   ├── games/
│   │   │   └── gamesAPI.ts
│   │   └── lists/
│   │       └── listsAPI.ts
│   ├── hooks/
│   │   └── redux.ts               # Typed useAppSelector / useAppDispatch
│   ├── pages/
│   │   ├── AddGamePage.tsx        # Admin-only
│   │   ├── AdminPage.tsx          # Admin-only
│   │   ├── GameDetailPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ListPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── RegisterPage.tsx
│   ├── routes/
│   │   └── AppRoutes.tsx          # Route table + ProtectedRoute / AdminRoute / PublicRoute
│   ├── App.tsx
│   └── main.tsx
├── .env
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── vercel.json
├── vite.config.ts
├── tsconfig.json
├── API-SPEC.md
├── REQUIREMENT.md
├── RULESET.md
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ak1Ena/react-project.git
   cd react-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MockAPI**
   - Sign up at [mockapi.io](https://mockapi.io)
   - Create two projects (or one project with two resources): `games`/`lists` and `users`
   - Copy the base URLs

4. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_GAME_API_URL=https://YOUR_GAME_PROJECT_ID.mockapi.io
   VITE_USER_API_URL=https://YOUR_USER_PROJECT_ID.mockapi.io
   VITE_STEAM_CATALOG_URL=http://localhost:3001
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🐳 Docker

A `Dockerfile`, `docker-compose.yml`, and `nginx.conf` are included for containerized deployment.

```bash
docker compose up --build
```

The Nginx config also handles SPA route refresh by falling back to `index.html`.

## ☁️ Vercel

`vercel.json` is included for one-click deployment to Vercel.

## 🔌 MockAPI Setup

### Resource: `games` (endpoint: `/api/v1/games`)

| Field | Type | Description |
|-------|------|-------------|
| id | String | Auto-generated |
| steamAppId | Number | Steam App ID (optional) |
| name | String | Game title |
| genre | Array | Array of genres |
| platforms | Array | Array of platforms |
| releaseYear | Number | Year of release |
| rating | Number | Average rating (0–10) |
| image | String | Image URL |
| description | String | Game description |

### Resource: `lists` (endpoint: `/api/v1/lists`)

| Field | Type | Description |
|-------|------|-------------|
| id | String | Auto-generated |
| gameid | String | Reference to game id |
| userid | String | User ID |
| status | String | playing / completed / backlog / wishlist |
| notes | String | User's personal notes |
| personalRating | Number | User's rating (0–10) |
| dateAdded | String | ISO date string |

See `API-SPEC.md` for the full API contract.

## 🌐 Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/` | Auth | Home / Browse catalog |
| `/games/:id` | Auth | Game detail page |
| `/library` | Auth | Combined personal library view |
| `/my-list/:status` | Auth | Filtered view (`playing` / `completed` / `backlog` / `wishlist`) |
| `/add-game` | Admin | Add a new game to the catalog |
| `/admin` | Admin | Admin management page |
| `*` | — | 404 Not Found |

Route guards (`ProtectedRoute`, `AdminRoute`, `PublicRoute`) are defined in `src/routes/AppRoutes.tsx`.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server (alias for `vite`) |
| `npm run dev` | Run development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest |
| `npm run lint` | Run ESLint |

## 🧩 Redux State

The Redux store (`src/app/store.ts`) combines local slices with RTK Query API caches:

- **`filters`** (`filtersSlice`) — Search query, filters, and sort options
- **`auth`** (`authSlice`) — Current authenticated user
- **`gameApi`** (RTK Query) — Catalog + lists endpoints
- **`userApi`** (RTK Query) — User / auth endpoints

UI ephemeral state (modals, toasts) is handled separately via React Context in `src/context/UIContext.tsx`.

## 🎨 Screenshots

_Add screenshots of your finished project here._

## 🌟 Stretch Goals

- 📊 Stats dashboard (games per list, favorite genre, total hours)
- 🖱️ Drag-and-drop to move games between lists
- 🌙 Dark mode toggle
- 💾 Export lists as JSON or CSV

## 📚 Learning Outcomes

By building this project, you will practice:
- React 19 + TypeScript component architecture
- State management with Redux Toolkit and RTK Query
- Routing and route guards with React Router v7
- RESTful CRUD with a mock backend
- Auth flow with role-based access control
- Form handling and validation
- Containerized deployment with Docker + Nginx

## 👤 Author

**Ak1Ena**
- GitHub: [@Ak1Ena](https://github.com/Ak1Ena)

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [MockAPI](https://mockapi.io) for the free mock backend service
- [Redux Toolkit](https://redux-toolkit.js.org) documentation
- Game cover images sourced from [SteamGridDB](https://www.steamgriddb.com) / [RAWG](https://rawg.io)
