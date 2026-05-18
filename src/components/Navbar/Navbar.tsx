import { type FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Gamepad2, ListChecks, PlusCircle, Home, LogOut, BarChart2, Moon, Sun } from 'lucide-react';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { toggleTheme } from '../../features/ui/uiSlice';
import type { RootState } from '../../app/store';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const theme = useSelector((state: RootState) => state.ui.theme);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navItem}${isActive ? ` ${styles.active}` : ''}`;

  return (
    <nav className={styles.sidebar}>
      {/* ── Brand ── */}
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <Gamepad2 size={16} />
        </div>
        <span className={styles.brandName}>
          Game<em>Lib</em>
        </span>
      </div>

      {/* ── Nav items ── */}
      <div className={styles.navGroup}>
        <span className={styles.navLabel}>Discover</span>
        <NavLink to="/" end className={navClass}>
          <Home size={16} />
          <span>Browse</span>
        </NavLink>
        <NavLink to="/my-list/playing" className={navClass}>
          <ListChecks size={16} />
          <span>My Lists</span>
        </NavLink>
        <NavLink to="/stats" className={navClass}>
          <BarChart2 size={16} />
          <span>Stats</span>
        </NavLink>
        <NavLink to="/add-game" className={navClass}>
          <PlusCircle size={16} />
          <span>Add Game</span>
        </NavLink>
      </div>

      {/* ── Footer ── */}
      <div className={styles.sidebarFoot}>
        <div className={styles.avatar}>
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className={styles.footMeta}>
          <span className={styles.footName}>{user?.username}</span>
          <span className={styles.footSub}>Member</span>
        </div>
        <button
          onClick={() => dispatch(toggleTheme())}
          className={styles.themeToggle}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={() => dispatch(logout())}
          className={styles.logoutBtn}
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
