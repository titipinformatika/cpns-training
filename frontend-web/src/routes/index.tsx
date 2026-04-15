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
import UserManagementPage from '../pages/admin/UserManagementPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import MasterDataPage from '../pages/admin/MasterDataPage';
import BankSoalPage from '../pages/admin/BankSoalPage';
import BankSoalDetailPage from '../pages/admin/BankSoalDetailPage';
import PaketUjianPage from '../pages/admin/PaketUjianPage';
import PaketUjianDetailPage from '../pages/admin/PaketUjianDetailPage';
import ReviewLaporanPage from '../pages/admin/ReviewLaporanPage';
import ReviewKontribusiPage from '../pages/admin/ReviewKontribusiPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';

// Layouts & Components
import MainLayout from '../components/layout/MainLayout';
import NotFoundPage from '../pages/NotFoundPage';
import AdminLayout from '../components/layout/AdminLayout';

// Admin Context & Components
import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext';

// Hanya bisa diakses jika BELUM login (User)
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600 font-black animate-pulse uppercase tracking-[0.2em]">Memuat...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Hanya bisa diakses jika SUDAH login (User)
export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600 font-black animate-pulse uppercase tracking-[0.2em]">Memuat...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ======== ADMIN ROUTE GUARDS ========

export function AdminPublicRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-950 text-emerald-500 font-black animate-pulse uppercase tracking-[0.2em]">Memuat Admin...</div>;
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

export function AdminPrivateRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-950 text-emerald-500 font-black animate-pulse uppercase tracking-[0.2em]">Memuat Admin...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* ================= USER ROUTES ================= */}
      {/* Public Routes (Login/Register) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Private Routes (Fullscreen) */}
      <Route element={<PrivateRoute />}>
        <Route path="/ujian/simulasi" element={<SimulasiUjianPage />} />
        <Route path="/ujian/hasil/:id" element={<HasilUjianPage />} />
      </Route>

      {/* Private Routes (Main Layout - Sidebar) */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/riwayat" element={<RiwayatUjianPage />} />
          <Route path="/riwayat/:id" element={<DetailRiwayatPage />} />
          
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/profil/edit" element={<EditBiodataPage />} />
          <Route path="/profil/password" element={<ChangePasswordPage />} />

          <Route path="/ujian" element={<DaftarUjianPage />} />
          <Route path="/ujian/:id" element={<DetailUjianPage />} />

          <Route path="/kontribusi" element={<KontribusiSoalPage />} />
          <Route path="/kontribusi/riwayat" element={<RiwayatKontribusiPage />} />
          <Route path="/laporan/riwayat" element={<RiwayatLaporanPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route element={<AdminAuthProvider><Outlet /></AdminAuthProvider>}>
        {/* Admin Public Route (Login) */}
        <Route element={<AdminPublicRoute />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Admin Private Routes (Protected) */}
        <Route element={<AdminPrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/master" element={<MasterDataPage />} />
            
            {/* Backoffice Section */}
            <Route path="/admin/backoffice/bank-soal" element={<BankSoalPage />} />
            <Route path="/admin/backoffice/bank-soal/:id" element={<BankSoalDetailPage />} />
            <Route path="/admin/backoffice/paket-ujian" element={<PaketUjianPage />} />
            <Route path="/admin/backoffice/paket-ujian/:id" element={<PaketUjianDetailPage />} />
            <Route path="/admin/backoffice/laporan-soal" element={<ReviewLaporanPage />} />
            <Route path="/admin/backoffice/kontribusi-soal" element={<ReviewKontribusiPage />} />
            
            {/* Aliases/Legacy paths if any */}
            <Route path="/admin/bank-soal" element={<BankSoalPage />} />
            <Route path="/admin/bank-soal/:id" element={<BankSoalDetailPage />} />
            <Route path="/admin/paket-ujian" element={<PaketUjianPage />} />
            <Route path="/admin/paket-ujian/:id" element={<PaketUjianDetailPage />} />
            <Route path="/admin/laporan" element={<ReviewLaporanPage />} />
            <Route path="/admin/kontribusi" element={<ReviewKontribusiPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
