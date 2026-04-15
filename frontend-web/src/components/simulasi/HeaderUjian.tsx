import { Clock, BookOpen, LogOut, Menu, X } from 'lucide-react';
import type { User } from '../../types';

interface HeaderUjianProps {
  sisaWaktu: number;
  maxWaktu: number;
  user: User | null;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  onOpenSubmitModal: () => void;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
}

export function HeaderUjian({
  sisaWaktu,
  maxWaktu,
  user,
  sidebarOpen,
  toggleSidebar,
  onOpenSubmitModal,
  answeredCount,
  flaggedCount,
  unansweredCount,
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
      <div className="flex items-center justify-between px-3 h-14 w-full">
        {/* Left: Branding & Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <BookOpen size={14} />
            </div>
            <span className="text-sm font-bold tracking-wide">CAT BKN</span>
          </div>
        </div>

        {/* Center: Global Stats & Timer */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-full px-4 py-1 backdrop-blur-sm border border-white/10 shadow-inner">
            <div className="flex items-center gap-1.5 label text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>{answeredCount} <span className="hidden xl:inline">Dijawab</span></span>
            </div>
            <div className="w-px h-3 bg-white/20"></div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span>{flaggedCount} <span className="hidden xl:inline">Ragu</span></span>
            </div>
            <div className="w-px h-3 bg-white/20"></div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <span>{unansweredCount} <span className="hidden xl:inline">Belum</span></span>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full font-mono transition-all ${
              isTimeCritical ? 'bg-red-500 animate-pulse shadow-md border-red-400' : 'bg-white/15 backdrop-blur-sm border-white/10'
            } border`}
          >
            <Clock size={14} className="text-white/90" />
            <span className="text-[13px] font-bold tracking-wider">{formatWaktu(sisaWaktu)}</span>
          </div>
        </div>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-indigo-800/40 px-3 py-1 rounded-full">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm uppercase">
              {user?.nama?.substring(0, 2) || 'UU'}
            </div>
            <span className="text-xs font-semibold max-w-[100px] truncate">{user?.nama || 'Anonim'}</span>
          </div>
          
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-700 text-xs rounded-full hover:bg-slate-50 font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <LogOut size={12} className="hidden sm:block" />
            <span className="tracking-wide">SELESAI</span>
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
