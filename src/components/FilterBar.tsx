import { type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import type { RootState } from '../app/store';
import {
  setSearchQuery,
  setGenre,
  setPlatform,
  setSortBy,
  resetFilters,
} from '../features/filters/filtersSlice';

const FilterBar: FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);

  const genres = ['All', 'Action', 'RPG', 'FPS', 'Strategy', 'Adventure', 'Sports', 'Simulation'];
  const platforms = ['All', 'PC', 'PS5', 'Xbox', 'Switch', 'Mobile'];

  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search games..."
          value={filters.searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="search-input"
        />
        {filters.searchQuery && (
          <button onClick={() => dispatch(setSearchQuery(''))} className="clear-search">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filters-controls">
        <div className="filter-group">
          <label>Genre</label>
          <select value={filters.genre} onChange={(e) => dispatch(setGenre(e.target.value))}>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Platform</label>
          <select value={filters.platform} onChange={(e) => dispatch(setPlatform(e.target.value))}>
            {platforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
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

        <button onClick={() => dispatch(resetFilters())} className="reset-button">
          Reset
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
