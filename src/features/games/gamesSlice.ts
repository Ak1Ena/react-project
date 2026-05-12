import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as gamesAPI from './gamesAPI';
import type { Game } from './gamesAPI';

interface GamesState {
  items: Game[];
  selectedGame: Game | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GamesState = {
  items: [],
  selectedGame: null,
  status: 'idle',
  error: null,
};

export const fetchGames = createAsyncThunk('games/fetchGames', async () => {
  return await gamesAPI.fetchGames();
});

export const fetchGameById = createAsyncThunk('games/fetchGameById', async (id: string) => {
  return await gamesAPI.fetchGameById(id);
});

export const createGame = createAsyncThunk('games/createGame', async (game: Omit<Game, 'id'>) => {
  return await gamesAPI.createGame(game);
});

export const updateGame = createAsyncThunk(
  'games/updateGame',
  async ({ id, game }: { id: string; game: Partial<Game> }) => {
    return await gamesAPI.updateGame(id, game);
  }
);

export const deleteGame = createAsyncThunk('games/deleteGame', async (id: string) => {
  await gamesAPI.deleteGame(id);
  return id;
});

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    clearSelectedGame: (state) => {
      state.selectedGame = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch games';
      })
      .addCase(fetchGameById.fulfilled, (state, action: PayloadAction<Game>) => {
        state.selectedGame = action.payload;
      })
      .addCase(createGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.items.push(action.payload);
      })
      .addCase(updateGame.fulfilled, (state, action: PayloadAction<Game>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedGame?.id === action.payload.id) {
          state.selectedGame = action.payload;
        }
      })
      .addCase(deleteGame.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearSelectedGame } = gamesSlice.actions;
export default gamesSlice.reducer;
