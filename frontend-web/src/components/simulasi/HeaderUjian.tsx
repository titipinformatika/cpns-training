import { Clock, BookOpen, LogOut, Menu, X } from 'lucide-react';
import type { User } from '../../types';

interface HeaderUjianProps {
  sisaWaktu: number;
  maxWaktu: number;
  user: User | null;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  onOpenSubmitModal: () => void;
}

export function HeaderUjian({
  sisaWaktu,
  maxWaktu,
  user,
  sidebarOpen,
  toggleSidebar,
  onOpenSubmitModal,
}: HeaderUjianProps) {
  const timePercent = Math.min(100, Math.max(0, (sisaWaktu / maxWaktu) * 100));
  const isTimeCritical = sisaWaktu < 600;

  const formatWaktu = (detik: number) => {
    const jam = Math.floor(detik / 3600);
    const menit = Math.floor((detik % 3600) / 60);
    const dtk = detik % 60;
    return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(dtk).padStart(2, '0')}`;
  };

  return (
    <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-lg flex-shrink-0 z-20">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <BookOpen size={16} />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-indigo-200 leading-none">Sistem Seleksi CPNS</p>
              <p className="text-sm font-semibold leading-tight">CAT · BKN Simulasi Ujian</p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono transition-all ${
            isTimeCritical ? 'bg-red-500 animate-pulse shadow-lg' : 'bg-white/15 backdrop-blur-sm'
          }`}
        >
          <Clock size={15} className="text-white/80" />
          <span className="text-base font-bold tracking-widest">{formatWaktu(sisaWaktu)}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold uppercase">
              {user?.nama?.substring(0, 2) || 'UU'}
            </div>
            <div className="leading-none text-right">
              <p className="text-xs text-indigo-200">Peserta Ujian</p>
              <p className="text-sm font-semibold">{user?.nama || 'Anonim'}</p>
            </div>
          </div>
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm rounded-lg hover:bg-indigo-50 font-semibold shadow transition-colors"
          >
            <LogOut size={14} className="hidden sm:block" />
            <span>Selesai</span>
          </button>
        </div>
      </div>
      <div className="h-1 bg-white/20">
        <div
          className={`h-full transition-all duration-1000 ${
            isTimeCritical ? 'bg-red-400' : 'bg-white/70'
          }`}
          style={{ width: `${timePercent}%` }}
        />
      </div>
    </header>
  );
}
