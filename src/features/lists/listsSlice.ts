import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as listsAPI from './listsAPI';
import type { ListEntry } from './listsAPI';

interface ListsState {
  entries: ListEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ListsState = {
  entries: [],
  status: 'idle',
  error: null,
};

export const fetchListEntries = createAsyncThunk('lists/fetchListEntries', async () => {
  return await listsAPI.fetchListEntries();
});

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
      .addCase(addToList.fulfilled, (state, action: PayloadAction<ListEntry>) => {
        state.entries.push(action.payload);
      })
      .addCase(updateListEntry.fulfilled, (state, action: PayloadAction<ListEntry>) => {
        const index = state.entries.findIndex((entry) => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      })
      .addCase(removeFromList.fulfilled, (state, action: PayloadAction<string>) => {
        state.entries = state.entries.filter((entry) => entry.id !== action.payload);
      });
  },
});

export default listsSlice.reducer;
