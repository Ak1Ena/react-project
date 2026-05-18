import axios from 'axios';

const BACKEND_BASE = 'http://localhost:3001/api/steam';

export interface Game {
  id: string;
  appid: number;
  name: string;
  genre: string[];
  platforms: string[];
  releaseYear: number;
  rating: number;
  positive?: number;
  negative?: number;
  image: string;
  description: string;
}

export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

export interface SteamLibraryResponse {
  steamid: string;
  count: number;
  games: SteamOwnedGame[];
}

export const fetchGames = async () => {
  const response = await axios.get<Game[]>(`${BACKEND_BASE}/featured`);
  return response.data;
};

export const fetchGameById = async (id: string): Promise<Game> => {
  const response = await axios.get<any>(`${BACKEND_BASE}/game-details/${id}`);
  
  // Steam API returns a success wrapper
  const gameData = response.data;
  
  const positive = gameData.total_positive || 0;
  const negative = gameData.total_negative || 0;
  
  // Calculate rating: (positive / total) * 10
  // Fallback to Metacritic if available, otherwise use our calculation
  let rating = (gameData.metacritic?.score / 10) || 0;
  if (rating === 0 && (positive + negative) > 0) {
    rating = parseFloat(((positive / (positive + negative)) * 10).toFixed(1));
  }

  return {
    id: (gameData.steam_appid || id).toString(),
    appid: gameData.steam_appid || parseInt(id),
    name: gameData.name,
    genre: gameData.genres?.map((g: any) => g.description) || [],
    platforms: Object.keys(gameData.platforms || {}).filter(p => gameData.platforms[p]),
    releaseYear: parseInt(gameData.release_date?.date?.split(',').pop()?.trim()) || 0,
    rating,
    positive,
    negative,
    image: gameData.header_image,
    description: gameData.short_description || gameData.about_the_game
  } as Game;
};

export const fetchGamesByIds = async (ids: string[]): Promise<Game[]> => {
  const requests = ids.map(id => fetchGameById(id));
  return Promise.all(requests);
};

export const searchGames = async (query: string) => {
  const response = await axios.get<Game[]>(`${BACKEND_BASE}/search`, {
    params: { q: query }
  });
  return response.data;
};

export const fetchSteamLibrary = async (steamid: string): Promise<SteamLibraryResponse> => {
  const response = await axios.get<SteamLibraryResponse>(`${BACKEND_BASE}/owned-games/${steamid}`);
  // Normalize backend response to match our interface
  return {
    steamid,
    count: (response.data as any).game_count || 0,
    games: (response.data as any).games || []
  };
};

export const steamSignInUrl = (returnTo: string = '/'): string => {
  return `http://localhost:3001/auth/steam?returnTo=${encodeURIComponent(returnTo)}`;
};

export const createGame = async (game: Omit<Game, 'id'>) => { return { ...game, id: '0' } as Game; };
export const updateGame = async (id: string, game: Partial<Game>) => { return { ...game, id } as Game; };
export const deleteGame = async (id: string) => { return id; };
