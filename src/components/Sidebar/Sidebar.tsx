import { type FC } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  Compass, 
  BarChart3, 
  Settings,
  Circle
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: FC = () => {
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
          <NavLink 
            to="/discover" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <Compass size={20} />
            <span>Discover</span>
          </NavLink>
          <NavLink 
            to="/stats" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <h3 className={styles.groupTitle}>LISTS</h3>
          <div className={styles.navSection}>
            <NavLink to="/my-list/playing" className={styles.navLink}>
              <Circle size={8} fill="var(--primary)" stroke="var(--primary)" />
              <span>Playing</span>
              <span className={styles.count}>6</span>
            </NavLink>
            <NavLink to="/my-list/completed" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-green)" stroke="var(--accent-green)" />
              <span>Completed</span>
              <span className={styles.count}>8</span>
            </NavLink>
            <NavLink to="/my-list/backlog" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-purple)" stroke="var(--accent-purple)" />
              <span>Backlog</span>
              <span className={styles.count}>3</span>
            </NavLink>
            <NavLink to="/my-list/wishlist" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-orange)" stroke="var(--accent-orange)" />
              <span>Wishlist</span>
              <span className={styles.count}>5</span>
            </NavLink>
            <NavLink to="/my-list/dropped" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-red)" stroke="var(--accent-red)" />
              <span>Dropped</span>
              <span className={styles.count}>2</span>
            </NavLink>
            <NavLink to="/my-list/favorites" className={styles.navLink}>
              <Circle size={8} fill="var(--accent-purple)" stroke="var(--accent-purple)" />
              <span>Favorites</span>
              <span className={styles.count}>9</span>
            </NavLink>
          </div>
        </div>

        <div className={styles.navGroup}>
          <h3 className={styles.groupTitle}>ACCOUNT</h3>
          <div className={styles.navSection}>
            <NavLink to="/settings" className={styles.navLink}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>AM</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Alex Marrow</span>
            <span className={styles.userLevel}>Lv 14 · 312h tracked</span>
          </div>
          <button className={styles.logoutBtn}>
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
