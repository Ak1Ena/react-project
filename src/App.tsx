import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal/Modal';
import Toast from './components/Toast/Toast';
import SteamCallbackHandler from './components/SteamCallbackHandler/SteamCallbackHandler';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.appWrapper}>
      <SteamCallbackHandler />
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
