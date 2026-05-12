import { gameMockApi } from '../../api/mockApi';

export type ListStatus = 'playing' | 'completed' | 'backlog' | 'wishlist';

export interface ListEntry {
  id: string;
  gameid: string;
  userid: string;
  status: ListStatus;
  notes: string;
  personalRating: number;
  dateAdded: string;
}

export const fetchListEntries = async (userId: string) => {
  const response = await gameMockApi.get<ListEntry[]>(`/api/v1/lists/?userid=${userId}`);
  return response.data;
};

export const addToList = async (entry: Omit<ListEntry, 'id' | 'dateAdded'>) => {
  const newEntry = {
    ...entry,
    dateAdded: new Date().toISOString(),
  };
  const response = await gameMockApi.post<ListEntry>('/api/v1/lists', newEntry);
  return response.data;
};

export const updateListEntry = async (id: string, entry: Partial<ListEntry>) => {
  const response = await gameMockApi.put<ListEntry>(`/api/v1/lists/${id}`, entry);
  return response.data;
};

export const removeFromList = async (id: string) => {
  const response = await gameMockApi.delete(`/api/v1/lists/${id}`);
  return response.data;
};
