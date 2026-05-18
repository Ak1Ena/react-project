import { gameMockApi } from '../../api/mockApi';

export type ListStatus = 'playing' | 'completed' | 'backlog' | 'wishlist';

export interface ListEntry {
  id: string;
  gameId: string;
  userId: string;
  status: ListStatus;
  notes: string;
  review: string;
  personalRating: number;
  dateAdded: string;
  playtime?: number; // in minutes
  lastPlayed?: number; // unix timestamp
}

// Helper to normalize data from MockAPI (handles gameid/gameId and userid/userId)
const normalizeEntry = (entry: any): ListEntry => ({
  ...entry,
  gameId: entry.gameId || entry.gameid,
  userId: entry.userId || entry.userid,
  playtime: entry.playtime || entry.playtime_forever,
  lastPlayed: entry.lastPlayed || entry.rtime_last_played,
});

export const fetchListEntries = async (userId: string) => {
  // Removing /api/v1 as it's often not configured in MockAPI prefix settings
  const response = await gameMockApi.get<any[]>(`/lists?userid=${userId}`);
  return response.data.map(normalizeEntry);
};

export const fetchEntriesByGameId = async (gameId: string) => {
  const response = await gameMockApi.get<any[]>(`/lists?gameid=${gameId}`);
  return response.data.map(normalizeEntry);
};

export const addToList = async (entry: Omit<ListEntry, 'id' | 'dateAdded'>) => {
  const newEntry = {
    ...entry,
    gameid: entry.gameId, 
    userid: entry.userId,
    dateAdded: new Date().toISOString(),
  };
  const response = await gameMockApi.post<any>('/lists', newEntry);
  return normalizeEntry(response.data);
};

export const updateListEntry = async (id: string, entry: Partial<ListEntry>) => {
  const updateData: any = { ...entry };
  if (entry.gameId) updateData.gameid = entry.gameId;
  if (entry.userId) updateData.userid = entry.userId;
  
  const response = await gameMockApi.put<any>(`/lists/${id}`, updateData);
  return normalizeEntry(response.data);
};

export const removeFromList = async (id: string) => {
  const response = await gameMockApi.delete(`/lists/${id}`);
  return response.data;
};
