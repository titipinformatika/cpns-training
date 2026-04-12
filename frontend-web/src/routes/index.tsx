import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChangePasswordPage from '../pages/profil/ChangePasswordPage';

// Hanya bisa diakses jika BELUM login
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Hanya bisa diakses jika SUDAH login
export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<div className="p-8 text-center text-2xl font-bold font-sans">Dashboard (Coming Soon)</div>} />
        <Route path="/profil" element={<div className="p-8 text-center font-sans">Profil (Coming Soon)</div>} />
        <Route path="/profil/password" element={<ChangePasswordPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-20 text-center font-sans">Halaman Tidak Ditemukan (404)</div>} />
    </Routes>
  );
}
