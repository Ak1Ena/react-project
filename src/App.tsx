import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from './app/store';
import { selectCurrentUser } from './features/auth/authSlice';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal/Modal';
import Toast from './components/Toast/Toast';
import styles from './App.module.css';

function App() {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={user ? styles.shell : styles.authShell}>
      {user && <Navbar />}
      <main className={styles.mainContent}>
        <AppRoutes />
      </main>
      <Modal />
      <Toast />
    </div>
  );
}

export default App;
