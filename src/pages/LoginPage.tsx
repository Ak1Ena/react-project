import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogIn, Circle, Loader2 } from 'lucide-react';
import { useLazyGetUsersQuery } from '../features/api/userApi';
import { setUser, setAuthError, clearError, selectAuthError } from '../features/auth/authSlice';
import styles from './Auth.module.css';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useSelector(selectAuthError);
  const [fetchUsers, { isLoading }] = useLazyGetUsersQuery();

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
      const users = await fetchUsers().unwrap();
      const user = users.find(
        (u) => u.username === formData.username && u.password === formData.password
      );
      if (!user) {
        dispatch(setAuthError('Invalid username or password'));
        return;
      }
      dispatch(setUser(user));
      navigate('/');
    } catch {
      dispatch(setAuthError('Login failed. Please try again.'));
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBrand}>
        <div className={styles.authBrandIcon}>
          <Circle size={18} fill="currentColor" stroke="currentColor" />
        </div>
        <span className={styles.authBrandText}>gamelibrary</span>
      </div>

      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Welcome back</h1>
        <p className={styles.authSubtitle}>Sign in to keep tracking your library</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="Your username"
            className={styles.input}
            autoComplete="username"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            className={styles.input}
            autoComplete="current-password"
          />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <button type="submit" disabled={isLoading} className={styles.submitBtn}>
          {isLoading ? <Loader2 size={18} className={styles.spin} /> : <LogIn size={18} />}
          <span>{isLoading ? 'Logging in...' : 'Login'}</span>
        </button>
      </form>

      <div className={styles.authFooter}>
        Don't have an account?<Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default LoginPage;
