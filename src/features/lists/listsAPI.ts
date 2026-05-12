import mockApi from '../../api/mockApi';

export type ListStatus = 'playing' | 'completed' | 'backlog' | 'wishlist';

export interface ListEntry {
  id: string;
  gameId: string;
  status: ListStatus;
  notes: string;
  personalRating: number;
  dateAdded: string;
}

export const fetchListEntries = async () => {
  const response = await mockApi.get<ListEntry[]>('/listEntries');
  return response.data;
};

export const addToList = async (entry: Omit<ListEntry, 'id' | 'dateAdded'>) => {
  const newEntry = {
    ...entry,
    dateAdded: new Date().toISOString(),
  };
  const response = await mockApi.post<ListEntry>('/listEntries', newEntry);
  return response.data;
};

export const updateListEntry = async (id: string, entry: Partial<ListEntry>) => {
  const response = await mockApi.put<ListEntry>(`/listEntries/${id}`, entry);
  return response.data;
};

export const removeFromList = async (id: string) => {
  const response = await mockApi.delete(`/listEntries/${id}`);
  return response.data;
};
