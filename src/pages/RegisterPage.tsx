import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus } from 'lucide-react';
import type { AppDispatch } from '../app/store';
import { register, selectAuthStatus, selectAuthError, clearError } from '../features/auth/authSlice';
import styles from './Auth.module.css';

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      await dispatch(register(registerData)).unwrap();
      navigate('/');
    } catch {
      // Error is handled in the slice
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1>Register</h1>
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
            placeholder="Choose a username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
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
            placeholder="Create a password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />
        </div>

        {(error || validationError) && (
          <div className="error-message">{error || validationError}</div>
        )}

        <button type="submit" disabled={status === 'loading'} className="btn-primary">
          <UserPlus size={20} />
          {status === 'loading' ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
