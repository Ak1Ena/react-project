import { type FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import GameDetailPage from '../features/games/GameDetailPage';
import ListPage from '../features/lists/ListPage';
import AddGamePage from '../features/games/AddGamePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/:id" element={<GameDetailPage />} />
      <Route path="/my-list/:status" element={<ListPage />} />
      <Route path="/add-game" element={<AddGamePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
