import { type FC } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Gamepad2, ListChecks, PlusCircle, Home, LogIn, User, LogOut, Link2 } from 'lucide-react';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { linkSteamAccount, logoutSteam } from '../../features/steam/steamSlice';
import type { AppDispatch, RootState } from '../../app/store';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const { steamId, summary } = useSelector((state: RootState) => state.steam);

  const handleLinkSteam = () => {
    const input = window.prompt('Enter your Steam ID or Vanity URL name:');
    if (input) {
      dispatch(linkSteamAccount(input));
    }
  };

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
              {steamId ? (
                <div className={styles.steamInfo} title={`Connected to Steam: ${summary?.personaname || steamId}`}>
                  <img 
                    src={summary?.avatarfull || 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'} 
                    alt="Steam Avatar" 
                    className={styles.steamAvatar}
                    onClick={() => { if(window.confirm('Disconnect Steam?')) dispatch(logoutSteam()) }}
                  />
                  {summary?.gameextrainfo && (
                    <span className={styles.playingDot} title={`Playing: ${summary.gameextrainfo}`}></span>
                  )}
                </div>
              ) : (
                <button onClick={handleLinkSteam} className={styles.linkSteamBtn} title="Connect Steam Account">
                  <Link2 size={20} />
                </button>
              )}
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
