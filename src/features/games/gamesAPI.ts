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
  image: string;
  description: string;
}

export const fetchGames = async () => {
  const response = await axios.get<Game[]>(`${BACKEND_BASE}/featured`);
  return response.data;
};

export const fetchGameById = async (id: string) => {
  const response = await axios.get<any>(`${BACKEND_BASE}/game-details/${id}`);
  
  // Steam API returns a success wrapper
  const gameData = response.data;
  
  return {
    id: gameData.steam_appid.toString(),
    appid: gameData.steam_appid,
    name: gameData.name,
    genre: gameData.genres?.map((g: any) => g.description) || [],
    platforms: Object.keys(gameData.platforms).filter(p => gameData.platforms[p]),
    releaseYear: parseInt(gameData.release_date?.date?.split(',').pop()?.trim()) || 0,
    rating: gameData.metacritic?.score / 10 || 0,
    image: gameData.header_image,
    description: gameData.short_description || gameData.about_the_game
  } as Game;
};

export const searchGames = async (query: string) => {
  const response = await axios.get<Game[]>(`${BACKEND_BASE}/search`, {
    params: { q: query }
  });
  return response.data;
};

// These are no longer needed as we are using live Steam data, 
// but we keep them for interface compatibility (though they won't work on the store)
export const createGame = async (game: Omit<Game, 'id'>) => { return { ...game, id: '0' } as Game; };
export const updateGame = async (id: string, game: Partial<Game>) => { return { ...game, id } as Game; };
export const deleteGame = async (id: string) => { return id; };
