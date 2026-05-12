import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal';
import Toast from './components/Toast';
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
