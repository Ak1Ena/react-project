import mockApi from '../../api/mockApi';

export interface Game {
  id: string;
  title: string;
  genre: string;
  platform: string;
  releaseYear: number;
  rating: number;
  coverImage: string;
  description: string;
}

export const fetchGames = async () => {
  const response = await mockApi.get<Game[]>('/games');
  return response.data;
};

export const fetchGameById = async (id: string) => {
  const response = await mockApi.get<Game>(`/games/${id}`);
  return response.data;
};

export const createGame = async (game: Omit<Game, 'id'>) => {
  const response = await mockApi.post<Game>('/games', game);
  return response.data;
};

export const updateGame = async (id: string, game: Partial<Game>) => {
  const response = await mockApi.put<Game>(`/games/${id}`, game);
  return response.data;
};

export const deleteGame = async (id: string) => {
  const response = await mockApi.delete(`/games/${id}`);
  return response.data;
};
