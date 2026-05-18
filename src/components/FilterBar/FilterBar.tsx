import { useMemo, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import type { RootState } from '../../app/store';
import {
  setSearchQuery,
  setGenre,
  setPlatform,
  setYear,
  setMinRating,
  setSortBy,
  resetFilters,
} from '../../features/filters/filtersSlice';
import { selectGames } from '../../features/games/gamesSlice';
import styles from './FilterBar.module.css';

const FilterBar: FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);
  const games = useSelector(selectGames);

  const genresList = useMemo(() => {
    const allGenres = games.flatMap(g => g.genre || []);
    const uniqueGenres = Array.from(new Set(allGenres));
    return ['All', ...uniqueGenres.sort()];
  }, [games]);

  const platformsList = useMemo(() => {
    const allPlatforms = games.flatMap(g => g.platforms || []);
    const uniquePlatforms = Array.from(new Set(allPlatforms));
    return ['All', ...uniquePlatforms.sort()];
  }, [games]);
  
  const yearsList = useMemo(() => {
    const uniqueYears = Array.from(new Set(games.map(g => g.releaseYear.toString())));
    return ['All', ...uniqueYears.sort((a, b) => b.localeCompare(a))];
  }, [games]);

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search all of Steam..."
          value={filters.searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className={styles.searchInput}
        />
        {filters.searchQuery && (
          <button onClick={() => dispatch(setSearchQuery(''))} className={styles.clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>

      {filters.searchQuery.trim().length <= 2 ? (
        <div className={styles.filtersControls}>
          <div className={styles.filterGroup}>
            <label>Genre</label>
            <select value={filters.genre} onChange={(e) => dispatch(setGenre(e.target.value))}>
              {genresList.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Platform</label>
            <select value={filters.platform} onChange={(e) => dispatch(setPlatform(e.target.value))}>
              {platformsList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Year</label>
            <select value={filters.year} onChange={(e) => dispatch(setYear(e.target.value))}>
              {yearsList.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Min Rating: {filters.minRating}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => dispatch(setMinRating(Number(e.target.value)))}
              className={styles.ratingRange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select value={filters.sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="year-desc">Release Year (Newest)</option>
              <option value="year-asc">Release Year (Oldest)</option>
            </select>
          </div>

          <button onClick={() => dispatch(resetFilters())} className={styles.resetButton}>
            Reset
          </button>
        </div>
      ) : (
        <div className={styles.searchStatus}>
          <p>Showing live results from Steam for "<strong>{filters.searchQuery}</strong>"</p>
          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select value={filters.sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))}>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
