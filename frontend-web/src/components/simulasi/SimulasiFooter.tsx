import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import type { SoalSimulasi } from '../../types';

interface SimulasiFooterProps {
  activeQuestionId: number | null;
  soalList: SoalSimulasi[];
  scrollToPrevious: () => void;
  scrollToNext: () => void;
  toggleRagu: (id: number) => void;
  isFlagged: boolean;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
}

export function SimulasiFooter({
  activeQuestionId,
  soalList,
  scrollToPrevious,
  scrollToNext,
  toggleRagu,
  isFlagged,
  answeredCount,
  unansweredCount,
  flaggedCount,
}: SimulasiFooterProps) {
  const currentIndex = soalList.findIndex((q) => q.ujian_soal_id === activeQuestionId);
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === soalList.length - 1 || currentIndex === -1;

  return (
    <div className="bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-4 py-3 flex-shrink-0 z-10 hidden md:flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Statistik</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {answeredCount} Terjawab
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {flaggedCount} Ragu
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {unansweredCount} Belum
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={scrollToPrevious}
          disabled={isFirst}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-slate-500 hover:bg-slate-600 border border-slate-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Sebelumnya
        </button>

        {activeQuestionId && (
          <button
            onClick={() => toggleRagu(activeQuestionId)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
              isFlagged
                ? 'bg-amber-500 hover:bg-amber-600 border border-amber-600 text-white'
                : 'bg-white border border-amber-500 text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Flag size={14} className={isFlagged ? 'text-white fill-white' : ''} />
            Ragu-ragu
          </button>
        )}

        <button
          onClick={scrollToNext}
          disabled={isLast}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Selanjutnya <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
