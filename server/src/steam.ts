import axios from 'axios';
import fs from 'fs';
import path from 'path';
import type { Game } from './types';

const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const CACHE_FILE = path.join(__dirname, '..', '.cache', 'games.json');
const CATALOG_SIZE = Number(process.env.CATALOG_SIZE || 100);
const REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24;
const REQUEST_DELAY_MS = Number(process.env.STEAM_REQUEST_DELAY_MS || 400);

let catalog: Game[] = [];
let byId: Record<string, Game> = {};
let lastRefresh = 0;
let bootstrapping = false;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchMostPlayed(): Promise<number[]> {
  const url = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/';
  const res = await axios.get(url, {
    params: STEAM_API_KEY ? { key: STEAM_API_KEY } : {},
    timeout: 15_000,
  });
  const ranks = res.data?.response?.ranks || [];
  return ranks.map((r: { appid: number }) => r.appid);
}

async function fetchAppDetails(appid: number): Promise<any | null> {
  const url = 'https://store.steampowered.com/api/appdetails';
  const res = await axios.get(url, {
    params: { appids: appid, cc: 'us', l: 'en' },
    timeout: 15_000,
  });
  const entry = res.data?.[String(appid)];
  if (!entry?.success) return null;
  return entry.data;
}

async function fetchAppReviewSummary(appid: number): Promise<any | null> {
  const url = `https://store.steampowered.com/appreviews/${appid}`;
  const res = await axios.get(url, {
    params: { json: 1, language: 'all', purchase_type: 'all' },
    timeout: 15_000,
  });
  return res.data?.query_summary || null;
}

function parseReleaseYear(dateStr?: string): number {
  if (!dateStr) return 0;
  const match = dateStr.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function normalizeGame(appid: number, details: any, reviewSummary: any): Game | null {
  if (!details?.name) return null;
  if (details.type && details.type !== 'game') return null;

  const totalPos = reviewSummary?.total_positive || 0;
  const totalReviews = reviewSummary?.total_reviews || 0;
  const rating =
    totalReviews > 0 ? Math.round((totalPos / totalReviews) * 100) / 10 : 0;

  const platforms: string[] = [];
  if (details.platforms?.windows) platforms.push('Windows');
  if (details.platforms?.mac) platforms.push('Mac');
  if (details.platforms?.linux) platforms.push('Linux');

  const genres = (details.genres || []).map(
    (g: { description: string }) => g.description
  );

  return {
    id: String(appid),
    appid,
    name: details.name,
    genre: genres,
    platforms,
    releaseYear: parseReleaseYear(details.release_date?.date),
    rating,
    image: details.header_image || '',
    description: details.short_description || '',
  };
}

function loadCacheFromDisk(): Game[] | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.games) && typeof parsed.lastRefresh === 'number') {
      lastRefresh = parsed.lastRefresh;
      return parsed.games;
    }
  } catch (e) {
    console.warn('[steam] cache read failed', e);
  }
  return null;
}

function saveCacheToDisk(games: Game[]): void {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ lastRefresh: Date.now(), games }, null, 2)
    );
  } catch (e) {
    console.warn('[steam] cache write failed', e);
  }
}

async function buildCatalog(): Promise<Game[]> {
  console.log(`[steam] bootstrapping catalog (target ~${CATALOG_SIZE})...`);
  let appids: number[] = [];
  try {
    appids = await fetchMostPlayed();
  } catch (e: any) {
    console.error('[steam] GetMostPlayedGames failed:', e.message);
  }
  appids = appids.slice(0, CATALOG_SIZE);
  console.log(`[steam] resolved ${appids.length} appids, fetching details...`);

  const games: Game[] = [];
  for (let i = 0; i < appids.length; i++) {
    const appid = appids[i];
    try {
      const details = await fetchAppDetails(appid);
      await sleep(REQUEST_DELAY_MS);
      const reviewSummary = await fetchAppReviewSummary(appid);
      await sleep(REQUEST_DELAY_MS);
      const game = normalizeGame(appid, details, reviewSummary);
      if (game) {
        games.push(game);
        console.log(`[steam] ${i + 1}/${appids.length} ${game.name}`);
      } else {
        console.log(`[steam] ${i + 1}/${appids.length} appid ${appid} skipped`);
      }
    } catch (e: any) {
      console.warn(`[steam] appid ${appid} failed: ${e.message}`);
      if (e.response?.status === 429) {
        console.log('[steam] rate-limited, backing off 60s...');
        await sleep(60_000);
      }
    }
  }
  return games;
}

function rebuildById(): void {
  byId = {};
  for (const g of catalog) byId[g.id] = g;
}

export async function initCatalog(): Promise<void> {
  const disk = loadCacheFromDisk();
  if (disk && disk.length > 0) {
    catalog = disk;
    rebuildById();
    console.log(
      `[steam] loaded ${catalog.length} games from disk cache (lastRefresh ${new Date(
        lastRefresh
      ).toISOString()})`
    );
  }

  const needsRefresh = !disk || Date.now() - lastRefresh > REFRESH_INTERVAL_MS;
  if (needsRefresh && !bootstrapping) {
    bootstrapping = true;
    buildCatalog()
      .then((games) => {
        if (games.length > 0) {
          catalog = games;
          lastRefresh = Date.now();
          rebuildById();
          saveCacheToDisk(catalog);
          console.log(`[steam] catalog refreshed: ${catalog.length} games`);
        } else {
          console.warn('[steam] refresh produced 0 games — keeping previous cache');
        }
      })
      .catch((e) => console.error('[steam] catalog refresh failed', e))
      .finally(() => {
        bootstrapping = false;
      });
  }
}

export interface QueryParams {
  limit: number;
  offset: number;
  search?: string;
  genre?: string;
  platform?: string;
  year?: string;
  minRating?: number;
}

export function queryGames(params: QueryParams) {
  let filtered = catalog;
  const s = params.search?.trim().toLowerCase();
  if (s) filtered = filtered.filter((g) => g.name.toLowerCase().includes(s));
  if (params.genre && params.genre !== 'All') {
    filtered = filtered.filter((g) => g.genre.includes(params.genre as string));
  }
  if (params.platform && params.platform !== 'All') {
    filtered = filtered.filter((g) =>
      g.platforms.some((p) => p.includes(params.platform as string))
    );
  }
  if (params.year && params.year !== 'All') {
    filtered = filtered.filter((g) => String(g.releaseYear) === params.year);
  }
  if (typeof params.minRating === 'number' && params.minRating > 0) {
    filtered = filtered.filter((g) => g.rating >= (params.minRating as number));
  }
  const total = filtered.length;
  const items = filtered.slice(params.offset, params.offset + params.limit);
  return { items, total };
}

export function getGameById(id: string): Game | null {
  return byId[id] || null;
}

const MAX_ENSURE_PER_CALL = 30;
const ensureInFlight: Set<string> = new Set();

async function ensureOne(id: string): Promise<Game | null> {
  if (byId[id]) return byId[id];
  if (ensureInFlight.has(id)) return null;
  ensureInFlight.add(id);
  try {
    const appid = Number(id);
    if (!Number.isFinite(appid)) return null;
    const details = await fetchAppDetails(appid);
    await sleep(REQUEST_DELAY_MS);
    let reviewSummary: any = null;
    try {
      reviewSummary = await fetchAppReviewSummary(appid);
      await sleep(REQUEST_DELAY_MS);
    } catch {
      // Reviews are optional; rating will default to 0.
    }
    const game = normalizeGame(appid, details, reviewSummary);
    if (game) {
      byId[game.id] = game;
      // Append to catalog if not present so facets/queries see it on next refresh.
      if (!catalog.find((g) => g.id === game.id)) catalog.push(game);
      saveCacheToDisk(catalog);
      return game;
    }
    return null;
  } catch (e: any) {
    console.warn(`[steam] ensureOne(${id}) failed: ${e.message}`);
    return null;
  } finally {
    ensureInFlight.delete(id);
  }
}

export async function getGamesByIds(ids: string[]): Promise<Game[]> {
  const known: Game[] = [];
  const missing: string[] = [];
  for (const id of ids) {
    if (byId[id]) known.push(byId[id]);
    else missing.push(id);
  }
  const toEnsure = missing.slice(0, MAX_ENSURE_PER_CALL);
  const resolved: Game[] = [];
  for (const id of toEnsure) {
    const game = await ensureOne(id);
    if (game) resolved.push(game);
  }
  return [...known, ...resolved];
}

interface OwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
}

export async function fetchSteamLibrary(steamid: string): Promise<OwnedGame[]> {
  if (!STEAM_API_KEY) throw new Error('STEAM_API_KEY not configured on server');
  const url = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/';
  const res = await axios.get(url, {
    params: {
      key: STEAM_API_KEY,
      steamid,
      include_appinfo: 1,
      include_played_free_games: 1,
      format: 'json',
    },
    timeout: 15_000,
  });
  const games = res.data?.response?.games || [];
  return games as OwnedGame[];
}

export function getFacets() {
  const genres = new Set<string>();
  const platforms = new Set<string>();
  const years = new Set<number>();
  for (const g of catalog) {
    g.genre.forEach((x) => genres.add(x));
    g.platforms.forEach((x) => platforms.add(x));
    if (g.releaseYear) years.add(g.releaseYear);
  }
  return {
    genres: Array.from(genres).sort(),
    platforms: Array.from(platforms).sort(),
    years: Array.from(years).sort((a, b) => b - a),
  };
}

export function getStatus() {
  return {
    ok: true,
    cacheSize: catalog.length,
    lastRefresh,
    bootstrapping,
  };
}
