import { type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import type { RootState } from '../../app/store';
import {
  setSearchQuery,
  setGenre,
  setPlatform,
  setSortBy,
  resetFilters,
} from '../../features/filters/filtersSlice';
import styles from './FilterBar.module.css';

const FilterBar: FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);

  const genres = ['All', 'Action', 'RPG', 'FPS', 'Strategy', 'Adventure', 'Sports', 'Simulation'];
  const platforms = ['All', 'PC', 'PS5', 'Xbox', 'Switch', 'Mobile'];

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search games..."
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

      <div className={styles.filtersControls}>
        <div className={styles.filterGroup}>
          <label>Genre</label>
          <select value={filters.genre} onChange={(e) => dispatch(setGenre(e.target.value))}>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Platform</label>
          <select value={filters.platform} onChange={(e) => dispatch(setPlatform(e.target.value))}>
            {platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
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
    </div>
  );
};

export default FilterBar;
