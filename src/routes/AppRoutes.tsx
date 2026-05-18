import { type FC, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { isAdminUser } from '../features/auth/authAPI';
import HomePage from '../pages/HomePage';
import GameDetailPage from '../pages/GameDetailPage';
import ListPage from '../pages/ListPage';
import AddGamePage from '../pages/AddGamePage';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

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

const AdminRoute: FC<RouteProps> = ({ children }) => {
  const user = useAppSelector(selectCurrentUser);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdminUser(user)) {
    return <NotFoundPage />;
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
        path="/library"
        element={
          <ProtectedRoute>
            <ListPage />
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
          <AdminRoute>
            <AddGamePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
