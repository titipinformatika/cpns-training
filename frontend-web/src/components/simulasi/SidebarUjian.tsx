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
        sidebarOpen ? 'w-80' : 'w-0'
      } flex-shrink-0 bg-white border-r border-slate-200 overflow-hidden transition-all duration-300 z-[19] flex flex-col h-full shadow-2xl md:shadow-none`}
    >
      <div className="h-full flex flex-col w-80">
        {/* Scrollable Questions Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
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
                </div>
                <div className="grid grid-cols-7 gap-1.5">
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

        {/* Sticky Legend Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Keterangan
          </p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-2">
            {[
              { color: 'bg-emerald-500', label: 'Dijawab' },
              { color: 'bg-amber-400', label: 'Ragu-ragu' },
              { color: 'bg-slate-200 border-black/10', label: 'Belum' },
              { color: 'bg-indigo-600', label: 'Aktif' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-md flex-shrink-0 border border-black/5 shadow-sm ${item.color}`}
                />
                <span className="text-[11px] text-slate-600 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
