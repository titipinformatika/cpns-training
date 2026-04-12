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
import UserDashboardPage from '../pages/dashboard/UserDashboardPage';
import RiwayatUjianPage from '../pages/ujian/RiwayatUjianPage';
import DetailRiwayatPage from '../pages/ujian/DetailRiwayatPage';
import KontribusiSoalPage from '../pages/sosial/KontribusiSoalPage';
import RiwayatKontribusiPage from '../pages/sosial/RiwayatKontribusiPage';
import RiwayatLaporanPage from '../pages/sosial/RiwayatLaporanPage';
import LeaderboardPage from '../pages/leaderboard/LeaderboardPage';

// Layouts & Components
import MainLayout from '../components/layout/MainLayout';
import NotFoundPage from '../pages/NotFoundPage';

// Hanya bisa diakses jika BELUM login
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600 font-black animate-pulse uppercase tracking-[0.2em]">Memuat...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Hanya bisa diakses jika SUDAH login
export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600 font-black animate-pulse uppercase tracking-[0.2em]">Memuat...</div>;
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

      {/* Private Routes - FULLSCREEN (No Sidebar) */}
      <Route element={<PrivateRoute />}>
        <Route path="/ujian/simulasi" element={<SimulasiUjianPage />} />
        <Route path="/ujian/hasil/:id" element={<HasilUjianPage />} />
      </Route>

      {/* Private Routes - WITH MAIN LAYOUT */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/riwayat" element={<RiwayatUjianPage />} />
          <Route path="/riwayat/:id" element={<DetailRiwayatPage />} />
          
          {/* Profil Section */}
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/profil/edit" element={<EditBiodataPage />} />
          <Route path="/profil/password" element={<ChangePasswordPage />} />

          {/* Ujian Section */}
          <Route path="/ujian" element={<DaftarUjianPage />} />
          <Route path="/ujian/:id" element={<DetailUjianPage />} />

          {/* Sosial Section */}
          <Route path="/kontribusi" element={<KontribusiSoalPage />} />
          <Route path="/kontribusi/riwayat" element={<RiwayatKontribusiPage />} />
          <Route path="/laporan/riwayat" element={<RiwayatLaporanPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
