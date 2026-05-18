import {
  gameMockApi,
  steamCatalogApi,
  STEAM_CATALOG_BASE_URL,
} from '../../api/mockApi';

export interface Game {
  id: string;
  appid: number;
  name: string;
  genre: string[];
  platforms: string[];
  releaseYear: number;
  rating: number;
  image: string;
  description: string;
}

export interface GamesQuery {
  limit: number;
  offset: number;
  search?: string;
  genre?: string;
  platform?: string;
  year?: string;
  minRating?: number;
}

export interface GamesPage {
  items: Game[];
  total: number;
  limit: number;
  offset: number;
}

export interface CatalogFacets {
  genres: string[];
  platforms: string[];
  years: number[];
}

const trimQuery = (q: GamesQuery): Record<string, string | number> => {
  const out: Record<string, string | number> = {
    limit: q.limit,
    offset: q.offset,
  };
  if (q.search && q.search.trim()) out.search = q.search.trim();
  if (q.genre && q.genre !== 'All') out.genre = q.genre;
  if (q.platform && q.platform !== 'All') out.platform = q.platform;
  if (q.year && q.year !== 'All') out.year = q.year;
  if (typeof q.minRating === 'number' && q.minRating > 0) out.minRating = q.minRating;
  return out;
};

export const fetchGames = async (query: GamesQuery): Promise<GamesPage> => {
  const response = await steamCatalogApi.get<GamesPage>('/api/v1/games', {
    params: trimQuery(query),
  });
  return response.data;
};

export const fetchGameById = async (id: string): Promise<Game> => {
  const response = await steamCatalogApi.get<Game>(`/api/v1/games/${id}`);
  return response.data;
};

export const fetchGamesByIds = async (ids: string[]): Promise<Game[]> => {
  if (ids.length === 0) return [];
  const response = await steamCatalogApi.get<Game[]>('/api/v1/games/by-ids', {
    params: { ids: ids.join(',') },
  });
  return response.data;
};

export const fetchFacets = async (): Promise<CatalogFacets> => {
  const response = await steamCatalogApi.get<CatalogFacets>('/api/v1/facets');
  return response.data;
};

export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
}

export interface SteamLibraryResponse {
  steamid: string;
  count: number;
  games: SteamOwnedGame[];
}

export interface SteamUser {
  steamid: string;
  displayName?: string;
  avatar?: string;
  profileUrl?: string;
}

export const fetchSteamLibrary = async (
  steamid: string
): Promise<SteamLibraryResponse> => {
  const response = await steamCatalogApi.get<SteamLibraryResponse>(
    `/api/v1/steam/library/${steamid}`
  );
  return response.data;
};

export const fetchSteamMe = async (): Promise<SteamUser | null> => {
  try {
    const response = await steamCatalogApi.get<SteamUser>('/auth/me');
    return response.data;
  } catch (e: any) {
    if (e.response?.status === 401) return null;
    throw e;
  }
};

export const signOutSteam = async (): Promise<void> => {
  await steamCatalogApi.post('/auth/logout');
};

export const steamSignInUrl = (returnTo = '/'): string => {
  const base = `${STEAM_CATALOG_BASE_URL}/auth/steam`;
  return returnTo === '/' ? base : `${base}?returnTo=${encodeURIComponent(returnTo)}`;
};

export const createGame = async (game: Omit<Game, 'id'>) => {
  const response = await gameMockApi.post<Game>('/api/v1/games', game);
  return {
    ...response.data,
    id: response.data.id || response.data.appid?.toString(),
  };
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  const response = await gameMockApi.put<Game>(`/api/v1/games/${id}`, game);
  return {
    ...response.data,
    id: response.data.id || response.data.appid?.toString(),
  };
};

export const deleteGame = async (id: string) => {
  const response = await gameMockApi.delete(`/api/v1/games/${id}`);
  return response.data;
};
