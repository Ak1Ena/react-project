import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal/Modal';
import Toast from './components/Toast/Toast';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.appWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        <AppRoutes />
      </main>
      <Modal />
      <Toast />
    </div>
  );
}

export default App;
