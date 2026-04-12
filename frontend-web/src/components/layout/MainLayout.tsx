import { useState } from 'react';
import { useLocation, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  History,
  Trophy,
  PenSquare,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Daftar Ujian', path: '/ujian', icon: FileText },
  { label: 'Riwayat Ujian', path: '/riwayat', icon: History },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Kontribusi Soal', path: '/kontribusi', icon: PenSquare },
  { label: 'Profil Saya', path: '/profil', icon: UserIcon },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 md:hidden bg-gray-50 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl italic mt-0.5">CP</span>
            </div>
            <span className="hidden sm:block font-black text-lg tracking-tight text-gray-900">
              TRAINING <span className="text-indigo-600">CPNS</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pl-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all active:scale-[0.98]"
            >
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-xs font-black text-gray-900 leading-none">{user?.nama}</span>
                <Badge variant={user?.kategori === 'PREMIUM' ? 'info' : 'neutral'} className="mt-1 scale-75 origin-right">
                  {user?.kategori}
                </Badge>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={`/static/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.nama.charAt(0).toUpperCase()
                )}
              </div>
              <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", isUserDropdownOpen && "rotate-180")} />
            </button>

            {isUserDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsUserDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 py-3 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-2 md:hidden mb-2 border-b border-gray-50 pb-4">
                    <p className="font-black text-gray-900 truncate">{user?.nama}</p>
                    <Badge variant={user?.kategori === 'PREMIUM' ? 'info' : 'neutral'} className="mt-1">
                      {user?.kategori}
                    </Badge>
                  </div>
                  <Link 
                    to="/profil" 
                    className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profil Saya
                  </Link>
                  <button 
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsLogoutDialogOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Sesi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-72 bg-gray-900 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:top-16",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-gray-900 p-6">
          <div className="md:hidden flex items-center gap-3 mb-10 pb-6 border-b border-gray-800">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black italic">CP</span>
            </div>
            <span className="font-black text-lg text-white">TRAINING</span>
          </div>

          <div className="flex-1 space-y-2">
            <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Navigasi Utama</p>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={clsx(
                    "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                    active 
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/50" 
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3 font-bold">
                    <item.icon className={clsx("w-5 h-5", active ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-white/50" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto border-t border-gray-800 pt-6">
            <button 
              onClick={() => setIsLogoutDialogOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-4 text-gray-500 hover:text-red-400 font-bold transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-72 pt-16 min-h-screen">
        <div className="p-4 md:p-10 pb-20 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Yakin ingin keluar?"
        description="Sesi Anda akan berakhir dan Anda harus masuk kembali untuk mengakses data simulasi."
        confirmLabel="Ya, Keluar"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}
