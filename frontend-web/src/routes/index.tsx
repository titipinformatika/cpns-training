import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChangePasswordPage from '../pages/profil/ChangePasswordPage';
import ProfilPage from '../pages/profil/ProfilPage';
import EditBiodataPage from '../pages/profil/EditBiodataPage';
import DaftarUjianPage from '../pages/ujian/DaftarUjianPage';
import DetailUjianPage from '../pages/ujian/DetailUjianPage';
import SimulasiUjianPage from '../pages/ujian/SimulasiUjianPage';
import HasilUjianPage from '../pages/ujian/HasilUjianPage';

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
        
        {/* Profil Section */}
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/profil/edit" element={<EditBiodataPage />} />
        <Route path="/profil/password" element={<ChangePasswordPage />} />

        {/* Ujian Section */}
        {/* PENTING: /ujian/simulasi harus SEBELUM /ujian/:id */}
        <Route path="/ujian" element={<DaftarUjianPage />} />
        <Route path="/ujian/simulasi" element={<SimulasiUjianPage />} />
        <Route path="/ujian/:id" element={<DetailUjianPage />} />
        <Route path="/ujian/hasil/:id" element={<HasilUjianPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-20 text-center font-sans">Halaman Tidak Ditemukan (404)</div>} />
    </Routes>
  );
}
