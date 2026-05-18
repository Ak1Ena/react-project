import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal/Modal';
import Toast from './components/Toast/Toast';
import { UIProvider } from './context/UIContext';
import styles from './App.module.css';

function App() {
  return (
    <UIProvider>
      <div className={styles.appWrapper}>
        <Sidebar />
        <div className={styles.mainLayout}>
          <Navbar />
          <main className={styles.mainContent}>
            <AppRoutes />
          </main>
        </div>
        <Modal />
        <Toast />
      </div>
    </UIProvider>
  );
}

export default App;
