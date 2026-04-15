import type { User, SoalSimulasi } from '../../types';
import { CATEGORY_CONFIG } from '../../utils/constants';

interface SidebarUjianProps {
  sidebarOpen: boolean;
  user: User | null;
  sesiUjianId: number;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  categoriesPresent: string[];
  soalList: SoalSimulasi[];
  answers: Map<number, string>;
  raguList: Set<number>;
  activeQuestionId: number | null;
  scrollToQuestion: (id: number) => void;
}

export function SidebarUjian({
  sidebarOpen,
  user,
  sesiUjianId,
  answeredCount,
  flaggedCount,
  unansweredCount,
  categoriesPresent,
  soalList,
  answers,
  raguList,
  activeQuestionId,
  scrollToQuestion,
}: SidebarUjianProps) {
  const getNavStyle = (id: number, cat: string) => {
    const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['TWK'];
    const isActive = id === activeQuestionId;
    const isAnswered = answers.has(id);
    const isFlagged = raguList.has(id);

    if (isActive) return `${cfg.navActive} ring-2 ring-white/50 scale-105 shadow`;
    if (isFlagged) return "bg-amber-400 text-white";
    if (isAnswered) return "bg-emerald-500 text-white";
    return "bg-slate-100 text-slate-600 hover:bg-slate-200";
  };

  return (
    <aside
      className={`absolute md:relative ${
        sidebarOpen ? 'w-64' : 'w-0'
      } flex-shrink-0 bg-white border-r border-slate-200 overflow-hidden transition-all duration-300 z-[19] flex flex-col h-full shadow-2xl md:shadow-none`}
    >
      <div className="h-full overflow-y-auto flex flex-col w-64">
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-slate-200 flex-shrink-0">
          <div className="md:hidden flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase">
              {user?.nama?.substring(0, 2) || 'UU'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {user?.nama || 'Anonim'}
              </p>
              <p className="text-xs text-slate-400 truncate">Sesi #{sesiUjianId}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-white rounded-xl py-2 shadow-sm border border-emerald-100">
              <p className="font-bold text-emerald-600">{answeredCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Dijawab</p>
            </div>
            <div className="bg-white rounded-xl py-2 shadow-sm border border-amber-100">
              <p className="font-bold text-amber-500">{flaggedCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Ragu</p>
            </div>
            <div className="bg-white rounded-xl py-2 shadow-sm border border-slate-100">
              <p className="font-bold text-slate-500">{unansweredCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Belum</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3 space-y-4">
          {categoriesPresent.map((catString) => {
            const cfg =
              CATEGORY_CONFIG[catString as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['TWK'];
            const catQs = soalList.filter((q) => q.kategori_soal.kode === catString);
            const catAnswered = catQs.filter((q) => answers.has(q.ujian_soal_id)).length;
            
            return (
              <div key={catString}>
                <div
                  className={`${cfg.navHeader} rounded-xl px-3 py-2 mb-2 flex items-center justify-between`}
                >
                  <div>
                    <p className="text-white text-xs font-bold">{catString}</p>
                    <p className="text-white/70 text-[10px] leading-tight">{cfg.fullLabel}</p>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {catAnswered}/{catQs.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {catQs.map((q) => (
                    <button
                      key={q.ujian_soal_id}
                      onClick={() => scrollToQuestion(q.ujian_soal_id)}
                      className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all duration-150 ${getNavStyle(
                        q.ujian_soal_id,
                        catString
                      )}`}
                    >
                      {q.nomor_urut}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Keterangan
          </p>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
            {[
              { color: 'bg-emerald-500', label: 'Dijawab' },
              { color: 'bg-amber-400', label: 'Ragu-ragu' },
              { color: 'bg-slate-200', label: 'Belum' },
              { color: 'bg-indigo-600', label: 'Aktif' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className={`w-3 h-3 rounded flex-shrink-0 border border-black/10 ${item.color}`}
                />
                <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
