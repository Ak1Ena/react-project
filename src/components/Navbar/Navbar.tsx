import { type FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { setSearchQuery } from '../../features/filters/filtersSlice';
import type { RootState } from '../../app/store';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.filters.searchQuery);

  const isDashboard = location.pathname === '/';
  const isAddGame = location.pathname === '/add-game';
  const showSearch = !isDashboard && !isAddGame;

  return (
    <header className={styles.navbar}>
      {showSearch ? (
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search 50,000+ games, studios, genres..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
          <div className={styles.searchShortcut}>
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </div>
        </div>
      ) : (
        <div />
      )}

      <div className={styles.actions}>
        {/* Actions removed - moved to Admin Dashboard */}
      </div>
    </header>
  );
};

export default Navbar;
