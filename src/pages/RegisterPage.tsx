import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Circle, Loader2 } from 'lucide-react';
import { useRegisterUserMutation } from '../features/api/userApi';
import { setUser, setAuthError, clearError, selectAuthError } from '../features/auth/authSlice';
import styles from './Auth.module.css';

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useSelector(selectAuthError);
  const [registerUser, { isLoading }] = useRegisterUserMutation();

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
      const user = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }).unwrap();
      dispatch(setUser(user));
      navigate('/');
    } catch {
      dispatch(setAuthError('Registration failed. Please try again.'));
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
        <h1 className={styles.authTitle}>Create your account</h1>
        <p className={styles.authSubtitle}>Start curating your personal game library</p>
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
            placeholder="Choose a username"
            className={styles.input}
            autoComplete="username"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={styles.input}
            autoComplete="email"
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
            placeholder="Create a password"
            className={styles.input}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Type it again"
            className={styles.input}
            autoComplete="new-password"
          />
        </div>

        {(error || validationError) && (
          <div className={styles.errorBanner}>{error || validationError}</div>
        )}

        <button type="submit" disabled={isLoading} className={styles.submitBtn}>
          {isLoading ? <Loader2 size={18} className={styles.spin} /> : <UserPlus size={18} />}
          <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
        </button>
      </form>

      <div className={styles.authFooter}>
        Already have an account?<Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
