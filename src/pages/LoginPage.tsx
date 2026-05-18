import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogIn } from 'lucide-react';
import type { AppDispatch } from '../app/store';
import { login, selectAuthStatus, selectAuthError, clearError } from '../features/auth/authSlice';
import { steamSignInUrl } from '../features/games/gamesAPI';
import styles from './Auth.module.css';

const STEAM_SIGN_IN_BUTTON =
  'https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate('/');
    } catch {
      // Error is handled in the slice and displayed via selector
    }
  };

  const handleSteamSignIn = () => {
    window.location.href = steamSignInUrl('/');
  };

  return (
    <div className={styles.authContainer}>
      <h1>Login</h1>

      <button
        type="button"
        onClick={handleSteamSignIn}
        className={styles.steamSignInBtn}
        aria-label="Sign in through Steam"
      >
        <img src={STEAM_SIGN_IN_BUTTON} alt="Sign in through Steam" />
      </button>

      <div className={styles.divider}>or</div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={status === 'loading'} className="btn-primary">
          <LogIn size={20} />
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
