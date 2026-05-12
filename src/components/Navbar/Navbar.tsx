import { type FC } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Gamepad2, ListChecks, PlusCircle, Home } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          <Gamepad2 size={32} />
          <span>GameLib</span>
        </Link>
        <div className={styles.navLinks}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <Home size={20} />
            <span>Browse</span>
          </NavLink>
          <NavLink to="/my-list/playing" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <ListChecks size={20} />
            <span>My Lists</span>
          </NavLink>
          <NavLink to="/add-game" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <PlusCircle size={20} />
            <span>Add Game</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
