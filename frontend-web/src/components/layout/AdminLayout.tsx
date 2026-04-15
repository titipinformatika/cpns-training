import { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Database,
  BookOpen,
  FileText,
  Flag,
  GitPullRequest,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Users
} from 'lucide-react';
import clsx from 'clsx';
import ConfirmDialog from '../ui/ConfirmDialog';

const adminMenuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manajemen User', path: '/admin/users', icon: Users },
  { label: 'Master Data', path: '/admin/master', icon: Database },
  { label: 'Bank Soal', path: '/admin/bank-soal', icon: BookOpen },
  { label: 'Paket Ujian', path: '/admin/paket-ujian', icon: FileText },
  { label: 'Review Laporan', path: '/admin/laporan', icon: Flag },
  { label: 'Review Kontribusi', path: '/admin/kontribusi', icon: GitPullRequest },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 z-50 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 md:hidden bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block font-bold text-sm tracking-tight text-white">
              ADMIN <span className="text-emerald-400">PANEL</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {admin?.nama?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-xs font-bold text-gray-300 hidden md:block">{admin?.nama}</span>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-64 bg-gray-900 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:top-14 border-r border-gray-800",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="md:hidden flex items-center gap-2 mb-8 pb-4 border-b border-gray-800">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">ADMIN PANEL</span>
          </div>

          <div className="flex-1 space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">Menu Utama</p>
            {adminMenuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group text-sm",
                    active
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                      : "text-gray-400 hover:bg-gray-800/70 hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2.5 font-semibold">
                    <item.icon className={clsx("w-4 h-4", active ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto border-t border-gray-800 pt-4">
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-3 text-gray-500 hover:text-red-400 font-semibold transition-all group text-sm"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 pt-14 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Keluar dari Admin?"
        description="Sesi admin Anda akan berakhir."
        confirmLabel="Ya, Keluar"
        onConfirm={logout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}
