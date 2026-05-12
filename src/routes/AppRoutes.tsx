import { type FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import GameDetailPage from '../pages/GameDetailPage';
import ListPage from '../pages/ListPage';
import AddGamePage from '../pages/AddGamePage';

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/:id" element={<GameDetailPage />} />
      <Route path="/my-list/:status" element={<ListPage />} />
      <Route path="/add-game" element={<AddGamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
