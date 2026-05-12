import { type FC, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import HomePage from '../pages/HomePage';
import GameDetailPage from '../features/games/GameDetailPage';
import ListPage from '../features/lists/ListPage';
import AddGamePage from '../features/games/AddGamePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

interface RouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<RouteProps> = ({ children }) => {
  const user = useAppSelector(selectCurrentUser);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: FC<RouteProps> = ({ children }) => {
  const user = useAppSelector(selectCurrentUser);
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:id"
        element={
          <ProtectedRoute>
            <GameDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-list/:status"
        element={
          <ProtectedRoute>
            <ListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-game"
        element={
          <ProtectedRoute>
            <AddGamePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
