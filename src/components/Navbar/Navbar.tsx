import { type FC } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Gamepad2, ListChecks, PlusCircle, Home, LogIn, User, LogOut } from 'lucide-react';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

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
          
          <div className={styles.navDivider}></div>

          {user ? (
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <User size={20} />
                <span>{user.username}</span>
              </div>
              <button onClick={() => dispatch(logout())} className={styles.logoutBtn} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
              <LogIn size={20} />
              <span>Login</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
