import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
        <Route path="/login" element={<div className="p-8 text-center">Halaman Login (Placeholder)</div>} />
        <Route path="/register" element={<div className="p-8 text-center">Halaman Register (Placeholder)</div>} />
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<div className="p-8 text-center text-2xl font-bold">Dashboard (Coming Soon)</div>} />
        <Route path="/profil" element={<div className="p-8 text-center">Profil (Coming Soon)</div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-20 text-center">Halaman Tidak Ditemukan (404)</div>} />
    </Routes>
  );
}
