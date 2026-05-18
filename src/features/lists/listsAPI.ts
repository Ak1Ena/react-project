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
}
