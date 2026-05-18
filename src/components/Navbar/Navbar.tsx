import { type FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Plus } from 'lucide-react';
import { setSearchQuery } from '../../features/filters/filtersSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { isAdminUser } from '../../features/auth/authAPI';
import type { RootState } from '../../app/store';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.filters.searchQuery);
  const user = useSelector(selectCurrentUser);
  const isAdmin = isAdminUser(user);

  const isDashboard = location.pathname === '/';
  const isAddGame = location.pathname === '/add-game';
  const showSearch = !isDashboard && !isAddGame;
  const showAddBtn = !isDashboard && !isAddGame && isAdmin;

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
        {showAddBtn && (
          <button
            className={styles.addBtn}
            onClick={() => navigate('/add-game')}
          >
            <Plus size={18} />
            <span>Add game</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
