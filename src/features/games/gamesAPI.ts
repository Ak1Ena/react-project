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
  return response.data;
};

export const fetchGameById = async (id: string) => {
  const response = await gameMockApi.get<Game>(`/api/v1/games/${id}`);
  return response.data;
};

export const createGame = async (game: Omit<Game, 'id'>) => {
  const response = await gameMockApi.post<Game>('/api/v1/games', game);
  return response.data;
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  const response = await gameMockApi.put<Game>(`/api/v1/games/${id}`, game);
  return response.data;
};

export const deleteGame = async (id: string) => {
  const response = await gameMockApi.delete(`/api/v1/games/${id}`);
  return response.data;
};
