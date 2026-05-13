import { gameMockApi } from '../../api/mockApi';

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
  const response = await gameMockApi.get<Game[]>('/api/v1/games');
  return response.data.map(game => ({
    ...game,
    id: game.id || game.appid?.toString()
  }));
};

export const fetchGameById = async (id: string) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // First try fetching by primary ID
    const response = await gameMockApi.get<Game[]>(`/api/v1/games?id=${id}`);
    if (response.data && response.data.length > 0) {
      return {
        ...response.data[0],
        id: response.data[0].id || response.data[0].appid?.toString()
      };
    }
  } catch (error) {
    // If that fails, try searching by appid query parameter
    console.warn(`Game with appid ${id} not found, trying fallback search by appid query...`);
    throw error;
  }
};

export const createGame = async (game: Omit<Game, 'id'>) => {
  const response = await gameMockApi.post<Game>('/api/v1/games', game);
  return {
    ...response.data,
    id: response.data.id || response.data.appid?.toString()
  };
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  const response = await gameMockApi.put<Game>(`/api/v1/games/${id}`, game);
  return {
    ...response.data,
    id: response.data.id || response.data.appid?.toString()
  };
};

export const deleteGame = async (id: string) => {
  const response = await gameMockApi.delete(`/api/v1/games/${id}`);
  return response.data;
};
