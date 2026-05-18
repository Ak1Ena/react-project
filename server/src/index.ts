import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
// passport-steam ships no types; use require to skip the TS noise.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SteamStrategy = require('passport-steam').Strategy;

import {
  initCatalog,
  queryGames,
  getGameById,
  getGamesByIds,
  getFacets,
  getStatus,
  fetchSteamLibrary,
} from './steam';

const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'dev-secret-change-in-production';

interface SteamUser {
  steamid: string;
  displayName?: string;
  avatar?: string;
  profileUrl?: string;
}

declare global {
  namespace Express {
    interface User extends SteamUser {}
  }
}

passport.serializeUser((user: Express.User, done) => done(null, user));
passport.deserializeUser((obj: Express.User, done) => done(null, obj));

passport.use(
  new SteamStrategy(
    {
      returnURL: `${SERVER_URL}/auth/steam/return`,
      realm: `${SERVER_URL}/`,
      apiKey: STEAM_API_KEY,
    },
    (_identifier: string, profile: any, done: any) => {
      const user: SteamUser = {
        steamid: profile.id,
        displayName: profile.displayName,
        avatar:
          profile.photos?.[2]?.value ||
          profile.photos?.[1]?.value ||
          profile.photos?.[0]?.value,
        profileUrl: profile._json?.profileurl,
      };
      done(null, user);
    }
  )
);

const app = express();
app.set('trust proxy', 1);
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

function requireSteam(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.steamid) {
    res.status(401).json({ error: 'Not signed in with Steam' });
    return;
  }
  next();
}

function safeReturnTo(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return '/';
  // Reject protocol-relative URLs like //evil.com to avoid open redirects.
  if (raw.startsWith('//')) return '/';
  return raw;
}

app.get('/auth/steam', (req: Request, res: Response, next: NextFunction) => {
  const returnTo = safeReturnTo(req.query.returnTo);
  (req.session as any).postAuthReturnTo = returnTo;
  passport.authenticate('steam')(req, res, next);
});

app.get(
  '/auth/steam/return',
  passport.authenticate('steam', {
    failureRedirect: `${FRONTEND_URL}/login?steam=error`,
  }),
  (req: Request, res: Response) => {
    const returnTo = safeReturnTo((req.session as any).postAuthReturnTo);
    delete (req.session as any).postAuthReturnTo;
    const sep = returnTo.includes('?') ? '&' : '?';
    res.redirect(`${FRONTEND_URL}${returnTo}${sep}steam=ok`);
  }
);

app.get('/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not signed in with Steam' });
    return;
  }
  res.json(req.user);
});

app.post('/auth/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    req.session?.destroy(() => res.status(204).end());
  });
});

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json(getStatus());
});

app.get('/api/v1/facets', (_req: Request, res: Response) => {
  res.json(getFacets());
});

app.get('/api/v1/games', (req: Request, res: Response) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const minRating =
    req.query.minRating !== undefined ? Number(req.query.minRating) : undefined;
  const result = queryGames({
    limit,
    offset,
    search: req.query.search as string | undefined,
    genre: req.query.genre as string | undefined,
    platform: req.query.platform as string | undefined,
    year: req.query.year as string | undefined,
    minRating,
  });
  res.json({ ...result, limit, offset });
});

app.get('/api/v1/games/by-ids', async (req: Request, res: Response) => {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  try {
    const games = await getGamesByIds(ids);
    res.json(games);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/v1/steam/library/me', requireSteam, async (req: Request, res: Response) => {
  try {
    const steamid = req.user!.steamid;
    const games = await fetchSteamLibrary(steamid);
    res.json({ steamid, count: games.length, games });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/v1/steam/library/:steamid', async (req: Request, res: Response) => {
  const steamid = req.params.steamid;
  if (!/^\d{17}$/.test(steamid)) {
    res.status(400).json({
      error: 'steamid must be a 17-digit SteamID64',
    });
    return;
  }
  try {
    const games = await fetchSteamLibrary(steamid);
    res.json({ steamid, count: games.length, games });
  } catch (e: any) {
    const status = e.response?.status === 401 || e.response?.status === 403 ? 403 : 500;
    res.status(status).json({
      error:
        status === 403
          ? 'Steam profile is private or the API key is invalid'
          : e.message,
    });
  }
});

app.get('/api/v1/games/:id', (req: Request, res: Response) => {
  const game = getGameById(req.params.id);
  if (!game) {
    res.status(404).json({ error: 'Game not found in Steam catalog cache' });
    return;
  }
  res.json(game);
});

app.listen(PORT, () => {
  console.log(`[server] listening on ${SERVER_URL}`);
  if (!STEAM_API_KEY) {
    console.warn('[server] WARNING: STEAM_API_KEY is empty — Steam OpenID will fail');
  }
  initCatalog().catch((e) => console.error('[server] init failed', e));
});
