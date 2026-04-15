import { CheckCircle2, Flag } from 'lucide-react';
import type { SoalSimulasi } from '../../types';

interface QuestionCardProps {
  q: SoalSimulasi;
  catString: string;
  cfg: any; // Using any for simplicity or extract interface from CATEGORY_CONFIG
  activeQuestionId: number | null;
  isAnswered: boolean;
  isFlagged: boolean;
  selectedKey?: string;
  toggleRagu: (id: number) => void;
  handleOptionSelect: (ujian_soal_id: number, opsi_key: string) => void;
  innerRef?: (el: HTMLDivElement | null) => void;
  fontSize?: 'small' | 'normal' | 'large';
  onFontSizeChange?: (size: 'small' | 'normal' | 'large') => void;
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
  fontSize = 'normal',
  onFontSizeChange,
}: QuestionCardProps) {
  const options = [
    { key: 'A', text: q.opsi_a, gambar: q.opsi_a_gambar },
    { key: 'B', text: q.opsi_b, gambar: q.opsi_b_gambar },
    { key: 'C', text: q.opsi_c, gambar: q.opsi_c_gambar },
    { key: 'D', text: q.opsi_d, gambar: q.opsi_d_gambar },
    { key: 'E', text: q.opsi_e, gambar: q.opsi_e_gambar },
  ];

  const textSize = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  const optionSize = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  const pySize = fontSize === 'large' ? 'py-4' : 'py-3';

  return (
    <div
      ref={innerRef}
      className={`bg-white rounded-2xl shadow-sm border ${
        isAnswered ? "border-emerald-100" : isFlagged ? "border-amber-100" : "border-slate-200"
      } w-full h-full flex flex-col`}
    >
      <div className={`flex items-center justify-between px-3 sm:px-4 py-1.5 border-b ${activeQuestionId === q.ujian_soal_id ? cfg.lightBg : "bg-slate-50"} border-slate-100`}>
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
          {onFontSizeChange && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-lg p-1 mr-2 border border-slate-200">
              <button 
                onClick={() => onFontSizeChange('small')}
                className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${fontSize === 'small' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}
              >A-</button>
              <button 
                onClick={() => onFontSizeChange('normal')}
                className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm ${fontSize === 'normal' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}
              >A</button>
              <button 
                onClick={() => onFontSizeChange('large')}
                className={`w-7 h-7 rounded flex items-center justify-center font-bold text-base ${fontSize === 'large' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}
              >A+</button>
            </div>
          )}
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

      <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
        {q.pertanyaan_gambar && (
          <div className="mb-6 flex justify-center bg-slate-50 border border-slate-100 rounded-xl p-4">
            <img
              src={`http://localhost:5000/uploads/soal/${q.pertanyaan_gambar}`}
              alt={`Soal ${q.nomor_urut}`}
              className="max-h-[350px] object-contain rounded-lg"
            />
          </div>
        )}

        <div
          className={`text-slate-800 leading-relaxed mb-8 ${textSize}`}
          dangerouslySetInnerHTML={{ __html: q.pertanyaan }}
        />

        <div className="space-y-3.5">
          {options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleOptionSelect(q.ujian_soal_id, opt.key)}
                className={`w-full flex items-stretch rounded-xl border-2 transition-all duration-150 overflow-hidden text-left ${
                  isSelected
                    ? cfg.selectedBorder + " shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className={`w-12 flex-shrink-0 flex items-center justify-start px-4 border-r font-bold text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200"
                }`}>
                  {opt.key}
                </div>
                <div className={`px-4 sm:px-5 flex-1 flex flex-col justify-center gap-3 ${pySize}`}>
                  {opt.gambar && (
                    <img
                      src={`http://localhost:5000/uploads/opsi/${opt.gambar}`}
                      alt={`Opsi ${opt.key}`}
                      className="max-h-32 object-contain rounded border border-slate-100 bg-white p-1 shadow-sm"
                    />
                  )}
                  <div
                    className={`leading-relaxed text-slate-700 ${optionSize} transition-colors ${
                      isSelected ? "font-medium" : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: opt.text }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
