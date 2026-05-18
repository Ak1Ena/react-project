import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogIn } from 'lucide-react';
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
      <h1>Login</h1>
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

        <button type="submit" disabled={isLoading} className="btn-primary">
          <LogIn size={20} />
          {isLoading ? 'Logging in...' : 'Login'}
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
