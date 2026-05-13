import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as listsAPI from './listsAPI';
import type { ListEntry } from './listsAPI';
import * as steamAPI from '../steam/steamAPI';
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

export const syncSteamLibrary = createAsyncThunk(
  'lists/syncSteamLibrary',
  async (steamInput: string, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    if (!user) return rejectWithValue('User not authenticated');

    try {
      let steamId = steamInput;
      // If it looks like a vanity URL name (not all digits), resolve it
      if (!/^\d+$/.test(steamInput)) {
        steamId = await steamAPI.resolveVanityURL(steamInput);
      }

      const steamGames = await steamAPI.getOwnedGames(steamId);
      const existingEntries = state.lists.entries;
      
      // Filter out games already in list
      const newGamesToSync = steamGames.filter(
        sg => !existingEntries.some(ee => ee.gameId === sg.appid.toString())
      );

      // To keep it simple and avoid hitting rate limits or creating too many requests, 
      // we'll only sync the top 10 played games that are new
      const topGames = [...newGamesToSync]
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .slice(0, 10);

      for (const sg of topGames) {
        await dispatch(addToList({
          gameId: sg.appid.toString(),
          userId: user.id,
          status: sg.playtime_forever > 0 ? 'playing' : 'backlog',
          notes: `Synced from Steam. Playtime: ${Math.round(sg.playtime_forever / 60)}h`,
          review: '',
          personalRating: 0,
        }));
      }

      return topGames.length;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Steam sync failed';
      return rejectWithValue(message);
    }
  }
);

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

export const selectEntriesByStatus = createSelector(
  [selectListEntries, (_state: RootState, status: string | undefined) => status],
  (entries, status) => entries.filter((entry) => entry.status === status)
);

export default listsSlice.reducer;
