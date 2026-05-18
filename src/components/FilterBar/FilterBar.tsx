import { type FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutGrid, List } from 'lucide-react';
import type { RootState } from '../../app/store';
import { selectGames } from '../../features/games/gamesSlice';
import {
  setGenre,
  setPlatform,
  setYear,
  setMinRating,
  setSortBy,
} from '../../features/filters/filtersSlice';
import styles from './FilterBar.module.css';

const FilterBar: FC<{ totalResults: number }> = ({ totalResults }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);
  const games = useSelector(selectGames);

  const genres = useMemo(() => {
    const allGenres = games.flatMap(game => game.genre);
    return Array.from(new Set(allGenres)).sort().slice(0, 8);
  }, [games]);

  const platforms = useMemo(() => {
    const allPlatforms = games.flatMap(game => game.platforms);
    return Array.from(new Set(allPlatforms)).sort();
  }, [games]);

  const years = ['2025', '2024', '2023', '≤2022'];
  const ratings = [
    { label: '9+', value: 9 },
    { label: '8+', value: 8 },
    { label: '7+', value: 7 },
  ];

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroups}>
        <div className={styles.filterRow}>
          <span className={styles.label}>GENRE</span>
          <div className={styles.tags}>
            {genres.map(g => (
              <button 
                key={g} 
                className={filters.genre === g ? `${styles.tag} ${styles.active}` : styles.tag}
                onClick={() => dispatch(setGenre(filters.genre === g ? 'All' : g))}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.label}>PLATFORM</span>
          <div className={styles.tags}>
            {platforms.map(p => (
              <button 
                key={p} 
                className={filters.platform === p ? `${styles.tag} ${styles.active}` : styles.tag}
                onClick={() => dispatch(setPlatform(filters.platform === p ? 'All' : p))}
              >
                {p}
              </button>
            ))}
          </div>
          
          <div className={styles.divider}></div>
          
          <span className={styles.label}>YEAR</span>
          <div className={styles.tags}>
            {years.map(y => (
              <button 
                key={y} 
                className={filters.year === y ? `${styles.tag} ${styles.active}` : styles.tag}
                onClick={() => dispatch(setYear(filters.year === y ? 'All' : y))}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.label}>RATING</span>
          <div className={styles.tags}>
            {ratings.map(r => (
              <button 
                key={r.label} 
                className={filters.minRating === r.value ? `${styles.tag} ${styles.active}` : styles.tag}
                onClick={() => dispatch(setMinRating(filters.minRating === r.value ? 0 : r.value))}
              >
                {r.label}
              </button>
            ))}
          </div>
          
          <div className={styles.resultsInfo}>
            <span className={styles.count}>{totalResults} results</span>
            <select 
              className={styles.sortSelect}
              value={filters.sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
            >
              <option value="updated">Recently updated</option>
              <option value="rating-desc">Highest rated</option>
              <option value="title-asc">A-Z</option>
            </select>
            <div className={styles.viewModes}>
              <button className={`${styles.viewBtn} ${styles.active}`}>
                <LayoutGrid size={16} />
              </button>
              <button className={styles.viewBtn}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
