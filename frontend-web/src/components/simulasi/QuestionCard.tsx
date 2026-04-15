import { CheckCircle2, Flag } from 'lucide-react';
import type { SoalSimulasi } from '../../types';

interface QuestionCardProps {
  q: SoalSimulasi;
  catString: string;
  cfg: any; // Using any for simplicity or extract interface from CATEGORY_CONFIG
  activeQuestionId: number | null;
  isAnswered: boolean;
  isFlagged: boolean;
  selectedKey: string | undefined;
  toggleRagu: (id: number) => void;
  handleOptionSelect: (id: number, option: string) => void;
  innerRef: (el: HTMLDivElement | null) => void;
}

export function QuestionCard({
  q,
  catString,
  cfg,
  activeQuestionId,
  isAnswered,
  isFlagged,
  selectedKey,
  toggleRagu,
  handleOptionSelect,
  innerRef,
}: QuestionCardProps) {
  const optionsList = ['A', 'B', 'C', 'D', 'E'].map(opt => ({
    key: opt,
    text: q[`opsi_${opt.toLowerCase()}` as keyof SoalSimulasi] as string,
    img: q[`opsi_${opt.toLowerCase()}_gambar` as keyof SoalSimulasi] as string | null
  })).filter(o => o.text || o.img);

  return (
    <div
      ref={innerRef}
      id={`question-${q.ujian_soal_id}`}
      className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 overflow-hidden ${
        activeQuestionId === q.ujian_soal_id
          ? `${cfg.border} shadow-md`
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className={`flex items-center justify-between px-4 sm:px-5 py-3 border-b ${activeQuestionId === q.ujian_soal_id ? cfg.lightBg : "bg-slate-50"} border-slate-100`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white text-sm font-bold flex items-center justify-center shadow-sm flex-shrink-0`}>
            {q.nomor_urut}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className={`text-xs font-semibold ${cfg.navText}`}>{catString}</span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">{q.jenis_soal?.nama || 'Umum'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                q.level === 'MUDAH' ? 'bg-green-100 text-green-700' :
                q.level === 'SULIT' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>{q.level}</span>
            </div>
            <span className="text-[11px] text-slate-400">Soal #{q.nomor_urut}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAnswered && (
            <span className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
              <CheckCircle2 size={12} /> <span className="hidden md:inline">Terjawab</span>
            </span>
          )}
          <button
            onClick={() => toggleRagu(q.ujian_soal_id)}
            className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full border transition-all ${
              isFlagged
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-500"
            }`}
          >
            <Flag size={12} className={isFlagged ? "fill-amber-400" : ""} />
            {isFlagged ? "Ragu-ragu" : "Tandai Ragu"}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-3 space-y-3">
        {q.pertanyaan_gambar && (
          <img src={`/static/${q.pertanyaan_gambar}`} alt="Gambar Soal" className="max-w-full h-auto rounded border border-slate-200" />
        )}
        <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-wrap">{q.pertanyaan}</p>
      </div>

      <div className="px-4 sm:px-5 pb-5 space-y-2">
        {optionsList.map((opt) => {
          const isSelected = selectedKey === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleOptionSelect(q.ujian_soal_id, opt.key)}
              className={`w-full flex items-start gap-3 px-3 sm:px-4 py-3 rounded-xl text-left border-2 transition-all duration-150 ${
                isSelected
                  ? cfg.selectedBorder + " shadow-sm"
                  : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all mt-0.5 ${
                isSelected ? cfg.selectedKey + " shadow-sm" : "bg-white border border-slate-200 text-slate-500"
              }`}>
                {opt.key}
              </div>
              <div className={`flex-1 space-y-2 ${isSelected ? "text-slate-800" : "text-slate-600"}`}>
                {opt.text && <p className="text-sm sm:text-base leading-relaxed pt-1">{opt.text}</p>}
                {opt.img && <img src={`/static/${opt.img}`} className="max-h-40 rounded border border-slate-200" alt={`Opsi ${opt.key}`}/>}
              </div>
              {isSelected && (
                <CheckCircle2 size={18} className={`flex-shrink-0 mt-1.5 ${cfg.check}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
