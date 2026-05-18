import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Game } from '../games/gamesAPI';
import type { ListEntry } from '../lists/listsAPI';

interface FiltersState {
  searchQuery: string;
  genre: string;
  platform: string;
  year: string;
  minRating: number;
  sortBy: string;
}

const initialState: FiltersState = {
  searchQuery: '',
  genre: 'All',
  platform: 'All',
  year: 'All',
  minRating: 0,
  sortBy: 'title-asc',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setGenre: (state, action: PayloadAction<string>) => {
      state.genre = action.payload;
    },
    setPlatform: (state, action: PayloadAction<string>) => {
      state.platform = action.payload;
    },
    setYear: (state, action: PayloadAction<string>) => {
      state.year = action.payload;
    },
    setMinRating: (state, action: PayloadAction<number>) => {
      state.minRating = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearchQuery,
  setGenre,
  setPlatform,
  setYear,
  setMinRating,
  setSortBy,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

interface FilterableState {
  filters: FiltersState;
}

const selectFilters = (state: FilterableState) => state.filters;
const selectGamesArg = (_: FilterableState, games: Game[]) => games;
const selectEntriesArg = (_: FilterableState, _g: Game[], entries: ListEntry[]) => entries;
const selectStatusArg = (_: FilterableState, _g: Game[], _e: ListEntry[], status?: string) =>
  status;

export const selectFilteredGames = createSelector(
  [selectGamesArg, selectEntriesArg, selectStatusArg, selectFilters],
  (games, entries, status, filters) => {
    const query = filters.searchQuery.toLowerCase();
    return games.filter((game) => {
      if (status) {
        const entry = entries.find((e) => e.gameId === String(game.id) && e.status === status);
        if (!entry) return false;
      }
      if (query && !game.name.toLowerCase().includes(query)) return false;
      if (filters.genre !== 'All' && !game.genre.includes(filters.genre)) return false;
      if (
        filters.platform !== 'All' &&
        !game.platforms.some((p) => p.includes(filters.platform))
      ) {
        return false;
      }
      if (filters.year !== 'All') {
        if (filters.year === '≤2022') {
          if (game.releaseYear > 2022) return false;
        } else if (game.releaseYear.toString() !== filters.year) {
          return false;
        }
      }
      if (game.rating < filters.minRating) return false;
      return true;
    });
  },
);
