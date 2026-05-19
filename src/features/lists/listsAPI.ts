export type ListStatus = 'playing' | 'completed' | 'backlog' | 'wishlist';

export interface ListEntry {
  id: string;
  gameId: string;
  userId: string;
  status: ListStatus;
  notes: string;
  review: string;
  // Snapshot of `status` taken the first time a review was posted.
  // Stays frozen so the badge shown next to a community comment reflects
  // how the user was engaging with the game when they wrote it.
  reviewStatus?: ListStatus | null;
  personalRating: number;
  dateAdded: string;
}
