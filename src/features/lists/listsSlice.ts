import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as listsAPI from './listsAPI';
import type { ListEntry } from './listsAPI';
import type { RootState } from '../../app/store';

interface ListsState {
  entries: ListEntry[];
  publicReviews: ListEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ListsState = {
  entries: [],
  publicReviews: [],
  status: 'idle',
  error: null,
};

export const fetchListEntries = createAsyncThunk(
  'lists/fetchListEntries',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) {
      return rejectWithValue('User not authenticated');
    }

    try {
      return await listsAPI.fetchListEntries(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch list entries';
      return rejectWithValue(message);
    }
  }
);

export const fetchGameReviews = createAsyncThunk(
  'lists/fetchGameReviews',
  async (gameId: string, { rejectWithValue }) => {
    try {
      return await listsAPI.fetchEntriesByGameId(gameId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch game reviews';
      return rejectWithValue(message);
    }
  }
);

export const addToList = createAsyncThunk(
  'lists/addToList',
  async (entry: Omit<ListEntry, 'id' | 'dateAdded'>) => {
    return await listsAPI.addToList(entry);
  }
);

export const updateListEntry = createAsyncThunk(
  'lists/updateListEntry',
  async ({ id, entry }: { id: string; entry: Partial<ListEntry> }) => {
    return await listsAPI.updateListEntry(id, entry);
  }
);

export const removeFromList = createAsyncThunk('lists/removeFromList', async (id: string) => {
  await listsAPI.removeFromList(id);
  return id;
});

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListEntries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchListEntries.fulfilled, (state, action: PayloadAction<ListEntry[]>) => {
        state.status = 'succeeded';
        state.entries = action.payload;
      })
      .addCase(fetchListEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch list entries';
      })
      .addCase(fetchGameReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGameReviews.fulfilled, (state, action: PayloadAction<ListEntry[]>) => {
        state.status = 'succeeded';
        state.publicReviews = action.payload;
      })
      .addCase(fetchGameReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch game reviews';
      })
      .addCase(addToList.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToList.fulfilled, (state, action: PayloadAction<ListEntry>) => {
        state.status = 'succeeded';
        state.entries.push(action.payload);
      })
      .addCase(addToList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add entry to list';
      })
      .addCase(updateListEntry.pending, () => {
        // Do nothing to status to avoid global loading UI for single item updates
      })
      .addCase(updateListEntry.fulfilled, (state, action: PayloadAction<ListEntry>) => {
        state.status = 'succeeded';
        const index = state.entries.findIndex((entry) => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(updateListEntry.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update list entry';
      })
      .addCase(removeFromList.pending, () => {
        // Do nothing to status to avoid global loading UI
      })
      .addCase(removeFromList.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.entries = state.entries.filter((entry) => entry.id !== action.payload);
      })
      .addCase(removeFromList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to remove entry from list';
      });
  },
});

export const selectListEntries = (state: RootState) => state.lists.entries;
export const selectPublicReviews = (state: RootState) => state.lists.publicReviews;

export const selectEntriesByStatus = createSelector(
  [selectListEntries, (_state: RootState, status: string | undefined) => status],
  (entries, status) => entries.filter((entry) => entry.status === status)
);

// Merge the snapshot from fetchGameReviews (publicReviews) with the live
// user's entries. Entries take precedence on duplicate ids so the current
// user's just-saved review appears immediately without re-fetching.
export const selectCommunityReviewsForGame = createSelector(
  [
    selectPublicReviews,
    selectListEntries,
    (_state: RootState, gameId: string | undefined) => gameId,
  ],
  (publicReviews, entries, gameId) => {
    if (!gameId) return [];

    const byId = new Map<string, ListEntry>();
    for (const r of publicReviews) {
      if (r.gameId === gameId) byId.set(r.id, r);
    }
    // Overwrite with live entries (fresh review text/rating).
    for (const e of entries) {
      if (e.gameId === gameId) byId.set(e.id, e);
    }

    return Array.from(byId.values())
      .filter((r) => (r.review || '').trim().length > 0)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }
);

export default listsSlice.reducer;
