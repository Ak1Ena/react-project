import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as gamesAPI from './gamesAPI';
import type { Game } from './gamesAPI';
import type { RootState } from '../../app/store';

interface GamesState {
  items: Game[];
  byId: Record<string, Game>;
  selectedGame: Game | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isSearching: boolean;
  error: string | null;
}

const initialState: GamesState = {
  items: [],
  byId: {},
  selectedGame: null,
  status: 'idle',
  isSearching: false,
  error: null,
};

export const fetchGames = createAsyncThunk('games/fetchGames', async () => {
  return await gamesAPI.fetchGames();
});

export const fetchGameById = createAsyncThunk('games/fetchGameById', async (id: string) => {
  return await gamesAPI.fetchGameById(id);
});

export const fetchGamesByIds = createAsyncThunk('games/fetchGamesByIds', async (ids: string[]) => {
  return await gamesAPI.fetchGamesByIds(ids);
});

export const searchGames = createAsyncThunk('games/searchGames', async (query: string) => {
  return await gamesAPI.searchGames(query);
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
        state.isSearching = false;
      })
      .addCase(fetchGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        action.payload.forEach(game => {
          state.byId[game.id] = game;
        });
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
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch game details';
      })
      .addCase(fetchGamesByIds.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGamesByIds.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.status = 'succeeded';
        action.payload.forEach(game => {
          state.byId[game.id] = game;
        });
      })
      .addCase(fetchGamesByIds.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch games by IDs';
      })
      .addCase(searchGames.pending, (state) => {
        state.status = 'loading';
        state.isSearching = true;
      })
      .addCase(searchGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        action.payload.forEach(game => {
          state.byId[game.id] = game;
        });
      })
      .addCase(searchGames.rejected, (state, action) => {
        state.status = 'failed';
        state.isSearching = false;
        state.error = action.error.message || 'Search failed';
      })
      .addCase(createGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.items.push(action.payload);
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(updateGame.fulfilled, (state, action: PayloadAction<Game>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.byId[action.payload.id] = action.payload;
        if (state.selectedGame?.id === action.payload.id) {
          state.selectedGame = action.payload;
        }
      })
      .addCase(deleteGame.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        delete state.byId[action.payload];
      });
  },
});

export const { clearSelectedGame } = gamesSlice.actions;

export const selectGames = (state: RootState) => state.games.items;
export const selectGamesById = (state: RootState) => state.games.byId;
export const selectFilters = (state: RootState) => state.filters;

export const selectFilteredGames = createSelector(
  [selectGames, selectFilters],
  (games, filters) => {
    const isSearching = filters.searchQuery.trim().length > 2;
    
    // If there is a meaningful search query, we display the results from Steam directly.
    if (isSearching) {
      return [...games].sort((a, b) => {
        if (filters.sortBy === 'title-asc') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'title-desc') return b.name.localeCompare(a.name);
        return 0;
      });
    }

    // Default: local filtering on the curated/featured catalog
    return games
      .filter((game) => {
        const matchesSearch = !filters.searchQuery.trim() || 
          game.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
          
        const matchesGenre = filters.genre === 'All' || game.genre.includes(filters.genre);
        const matchesPlatform = filters.platform === 'All' || game.platforms.some(p => p.includes(filters.platform));
        const matchesYear = filters.year === 'All' || game.releaseYear.toString() === filters.year;
        const matchesRating = game.rating >= filters.minRating;
        return matchesSearch && matchesGenre && matchesPlatform && matchesYear && matchesRating;
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

export const selectGamesStatus = (state: RootState) => state.games.status;
export const selectGamesError = (state: RootState) => state.games.error;

export default gamesSlice.reducer;
