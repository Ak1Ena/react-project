import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as gamesAPI from './gamesAPI';
import type { Game, GamesPage, CatalogFacets } from './gamesAPI';
import type { RootState } from '../../app/store';

export const PAGE_SIZE = 24;

interface GamesState {
  items: Game[];
  byId: Record<string, Game>;
  selectedGame: Game | null;
  total: number;
  currentPage: number;
  pageSize: number;
  facets: CatalogFacets;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GamesState = {
  items: [],
  byId: {},
  selectedGame: null,
  total: 0,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  facets: { genres: [], platforms: [], years: [] },
  status: 'idle',
  error: null,
};

interface FetchGamesArgs {
  page: number;
  search?: string;
  genre?: string;
  platform?: string;
  year?: string;
  minRating?: number;
}

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (args: FetchGamesArgs): Promise<GamesPage & { page: number }> => {
    const page = Math.max(args.page, 1);
    const offset = (page - 1) * PAGE_SIZE;
    const result = await gamesAPI.fetchGames({
      limit: PAGE_SIZE,
      offset,
      search: args.search,
      genre: args.genre,
      platform: args.platform,
      year: args.year,
      minRating: args.minRating,
    });
    return { ...result, page };
  }
);

export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (id: string) => {
    return await gamesAPI.fetchGameById(id);
  }
);

export const fetchGamesByIds = createAsyncThunk(
  'games/fetchGamesByIds',
  async (ids: string[]) => {
    return await gamesAPI.fetchGamesByIds(ids);
  }
);

export const fetchFacets = createAsyncThunk('games/fetchFacets', async () => {
  return await gamesAPI.fetchFacets();
});

export const createGame = createAsyncThunk(
  'games/createGame',
  async (game: Omit<Game, 'id'>) => {
    return await gamesAPI.createGame(game);
  }
);

export const updateGame = createAsyncThunk(
  'games/updateGame',
  async ({ id, game }: { id: string; game: Partial<Game> }) => {
    return await gamesAPI.updateGame(id, game);
  }
);

export const deleteGame = createAsyncThunk(
  'games/deleteGame',
  async (id: string) => {
    await gamesAPI.deleteGame(id);
    return id;
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    clearSelectedGame: (state) => {
      state.selectedGame = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = Math.max(action.payload, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        for (const g of action.payload.items) state.byId[g.id] = g;
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
        if (action.payload) state.byId[action.payload.id] = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch game details';
      })
      .addCase(fetchGamesByIds.fulfilled, (state, action: PayloadAction<Game[]>) => {
        for (const g of action.payload) state.byId[g.id] = g;
      })
      .addCase(fetchFacets.fulfilled, (state, action: PayloadAction<CatalogFacets>) => {
        state.facets = action.payload;
      })
      .addCase(createGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.byId[action.payload.id] = action.payload;
      })
      .addCase(updateGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.byId[action.payload.id] = action.payload;
        if (state.selectedGame?.id === action.payload.id) {
          state.selectedGame = action.payload;
        }
      })
      .addCase(deleteGame.fulfilled, (state, action: PayloadAction<string>) => {
        delete state.byId[action.payload];
        state.items = state.items.filter((g) => g.id !== action.payload);
      });
  },
});

export const { clearSelectedGame, setCurrentPage } = gamesSlice.actions;

export const selectGames = (state: RootState) => state.games.items;
export const selectGamesById = (state: RootState) => state.games.byId;
export const selectGameById = (id: string) => (state: RootState) =>
  state.games.byId[id];
export const selectTotal = (state: RootState) => state.games.total;
export const selectCurrentPage = (state: RootState) => state.games.currentPage;
export const selectPageSize = (state: RootState) => state.games.pageSize;
export const selectFacets = (state: RootState) => state.games.facets;
export const selectFilters = (state: RootState) => state.filters;

export const selectSortedPageGames = createSelector(
  [selectGames, selectFilters],
  (games, filters) => {
    return [...games].sort((a, b) => {
      switch (filters.sortBy) {
        case 'title-asc':
          return a.name.localeCompare(b.name);
        case 'title-desc':
          return b.name.localeCompare(a.name);
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'year-desc':
          return b.releaseYear - a.releaseYear;
        case 'year-asc':
          return a.releaseYear - b.releaseYear;
        default:
          return 0;
      }
    });
  }
);

export default gamesSlice.reducer;
