import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as gamesAPI from './gamesAPI';
import type { Game, GamesResponse } from './gamesAPI';
import type { RootState } from '../../app/store';

interface GamesState {
  catalogItems: Game[];
  searchResults: Game[];
  byId: Record<string, Game>;
  selectedGame: Game | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  searchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalCatalog: number;
  catalogLimit: number;
  catalogOffset: number;
  hasMoreCatalog: boolean;
  error: string | null;
}

const initialState: GamesState = {
  catalogItems: [],
  searchResults: [],
  byId: {},
  selectedGame: null,
  status: 'idle',
  searchStatus: 'idle',
  totalCatalog: 0,
  catalogLimit: 24,
  catalogOffset: 0,
  hasMoreCatalog: true,
  error: null,
};

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async ({ limit, offset }: { limit?: number; offset?: number } = {}) => {
    return await gamesAPI.fetchGames(limit, offset);
  }
);

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
    resetCatalog: (state) => {
      state.catalogItems = [];
      state.catalogOffset = 0;
      state.hasMoreCatalog = true;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGames.fulfilled, (state, action: PayloadAction<GamesResponse>) => {
        state.status = 'succeeded';
        // Infinite scroll: append items
        const newItems = action.payload.items.filter(
          item => !state.catalogItems.some(existing => existing.id === item.id)
        );
        state.catalogItems = [...state.catalogItems, ...newItems];
        state.totalCatalog = action.payload.total;
        state.catalogOffset = action.payload.offset + action.payload.items.length;
        state.hasMoreCatalog = state.catalogItems.length < action.payload.total;
        
        action.payload.items.forEach(game => {
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
        state.searchStatus = 'loading';
      })
      .addCase(searchGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
        action.payload.forEach(game => {
          state.byId[game.id] = game;
        });
      })
      .addCase(searchGames.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.error = action.error.message || 'Search failed';
      })
      .addCase(createGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.catalogItems.unshift(action.payload);
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(updateGame.fulfilled, (state, action: PayloadAction<Game>) => {
        const index = state.catalogItems.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.catalogItems[index] = action.payload;
        }
        state.byId[action.payload.id] = action.payload;
        if (state.selectedGame?.id === action.payload.id) {
          state.selectedGame = action.payload;
        }
      })
      .addCase(deleteGame.fulfilled, (state, action: PayloadAction<string>) => {
        state.catalogItems = state.catalogItems.filter((item) => item.id !== action.payload);
        delete state.byId[action.payload];
      });
  },
});

export const { clearSelectedGame, resetCatalog, clearSearch } = gamesSlice.actions;

export const selectCatalog = (state: RootState) => state.games.catalogItems;
export const selectSearchResults = (state: RootState) => state.games.searchResults;
export const selectGamesById = (state: RootState) => state.games.byId;
export const selectFilters = (state: RootState) => state.filters;

export const selectFilteredCatalog = createSelector(
  [selectCatalog, selectFilters],
  (games, filters) => {
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

export const selectMockApiGames = createSelector(
  [selectFilteredCatalog],
  (games) => games.filter(g => g.source === 'mockapi')
);

export const selectSteamFeaturedGames = createSelector(
  [selectFilteredCatalog],
  (games) => games.filter(g => g.source === 'steam')
);



export const selectGamesStatus = (state: RootState) => state.games.status;
export const selectSearchStatus = (state: RootState) => state.games.searchStatus;
export const selectGamesError = (state: RootState) => state.games.error;
export const selectCatalogPagination = (state: RootState) => ({
  total: state.games.totalCatalog,
  limit: state.games.catalogLimit,
  offset: state.games.catalogOffset,
  hasMore: state.games.hasMoreCatalog
});

export default gamesSlice.reducer;
