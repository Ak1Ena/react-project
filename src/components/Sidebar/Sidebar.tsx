import { type FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Library, 
  Circle,
  LogOut
} from 'lucide-react';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { selectListEntries } from '../../features/lists/listsSlice';
import styles from './Sidebar.module.css';

const Sidebar: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const entries = useSelector(selectListEntries);

  const getCount = (status: string) => {
    return entries.filter(e => e.status === status).length;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Circle size={24} fill="var(--primary)" stroke="var(--primary)" />
        </div>
        <span className={styles.logoText}>gamelibrary</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/library" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <Library size={20} />
            <span>Library</span>
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <h3 className={styles.groupTitle}>LISTS</h3>
          <div className={styles.navSection}>
            <NavLink to="/my-list/playing" className={styles.navLink}>
              <Circle size={8} fill="var(--primary)" stroke="var(--primary)" />
              <span>Playing</span>
              <span className={styles.count}>{getCount('playing')}</span>
            </NavLink>
            <NavLink to="/my-list/completed" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-green)" stroke="var(--accent-green)" />
              <span>Completed</span>
              <span className={styles.count}>{getCount('completed')}</span>
            </NavLink>
            <NavLink to="/my-list/backlog" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-purple)" stroke="var(--accent-purple)" />
              <span>Backlog</span>
              <span className={styles.count}>{getCount('backlog')}</span>
            </NavLink>
            <NavLink to="/my-list/wishlist" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-orange)" stroke="var(--accent-orange)" />
              <span>Wishlist</span>
              <span className={styles.count}>{getCount('wishlist')}</span>
            </NavLink>
            <NavLink to="/my-list/dropped" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-red)" stroke="var(--accent-red)" />
              <span>Dropped</span>
              <span className={styles.count}>{getCount('dropped')}</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {user && (
        <div className={styles.footer}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.username}</span>
            </div>
            <button 
              className={styles.logoutBtn} 
              onClick={() => dispatch(logout())}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
