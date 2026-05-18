import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
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

const app = express();
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: false,
  })
);
app.use(express.json());

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

app.get('/api/v1/steam/library/:steamid', async (req: Request, res: Response) => {
  const steamid = req.params.steamid;
  if (!/^\d{17}$/.test(steamid)) {
    res.status(400).json({
      error: 'steamid must be a 17-digit SteamID64 (find yours at steamid.io)',
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
  console.log(`[server] listening on http://localhost:${PORT}`);
  initCatalog().catch((e) => console.error('[server] init failed', e));
});
