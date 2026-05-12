import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal/Modal';
import Toast from './components/Toast/Toast';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <AppRoutes />
      </main>
      <Modal />
      <Toast />
    </div>
  );
}

export default App;
