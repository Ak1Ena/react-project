import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as gamesAPI from './gamesAPI';
import type { Game } from './gamesAPI';
import type { RootState } from '../../app/store';

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
      .addCase(fetchGameById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGameById.fulfilled, (state, action: PayloadAction<Game>) => {
        state.status = 'succeeded';
        state.selectedGame = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch game details';
      })
      .addCase(createGame.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createGame.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create game';
      })
      .addCase(updateGame.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.status = 'succeeded';
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedGame?.id === action.payload.id) {
          state.selectedGame = action.payload;
        }
      })
      .addCase(updateGame.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update game';
      })
      .addCase(deleteGame.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteGame.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteGame.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete game';
      });
  },
});

export const { clearSelectedGame } = gamesSlice.actions;

export const selectGames = (state: RootState) => state.games.items;
export const selectFilters = (state: RootState) => state.filters;

export const selectFilteredGames = createSelector(
  [selectGames, selectFilters],
  (games, filters) => {
    return games
      .filter((game) => {
        const matchesSearch = game.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
        const matchesGenre = filters.genre === 'All' || game.genre.includes(filters.genre);
        const matchesPlatform = filters.platform === 'All' || game.platforms.some(p => p.includes(filters.platform));
        return matchesSearch && matchesGenre && matchesPlatform;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'title-asc': return a.name.localeCompare(b.name);
          case 'title-desc': return b.name.localeCompare(a.name);
          case 'rating-desc': return b.rating - a.rating;
          case 'rating-asc': return a.rating - b.rating;
          case 'year-desc': return b.releaseYear - a.releaseYear;
          case 'year-asc': return a.releaseYear - b.releaseYear;
          default: return 0;
        }
      });
  }
);

export default gamesSlice.reducer;
