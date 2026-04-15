import { AlertCircle, Loader2 } from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitLoading: boolean;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
}

export function SubmitModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitLoading,
  answeredCount,
  flaggedCount,
  unansweredCount,
}: SubmitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-500 mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Akhiri Sesi Ujian?</h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          Anda tidak dapat mengubah jawaban setelah mengumpulkan.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{answeredCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-800/60 mt-0.5 uppercase tracking-wider">
              Dijawab
            </p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3 text-center border border-amber-100">
            <p className="text-xl sm:text-2xl font-black text-amber-500">{flaggedCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-amber-800/60 mt-0.5 uppercase tracking-wider">
              Ragu
            </p>
          </div>
          <div
            className={`rounded-2xl p-3 text-center border ${
              unansweredCount > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <p
              className={`text-xl sm:text-2xl font-black ${
                unansweredCount > 0 ? 'text-red-500' : 'text-slate-500'
              }`}
            >
              {unansweredCount}
            </p>
            <p
              className={`text-[10px] sm:text-xs font-bold mt-0.5 uppercase tracking-wider ${
                unansweredCount > 0 ? 'text-red-800/60' : 'text-slate-500/60'
              }`}
            >
              Belum
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSubmit}
            disabled={isSubmitLoading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold transition-colors hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Memproses...
              </>
            ) : (
              'Ya, Kumpulkan'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitLoading}
            className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors"
          >
            Batal, Kembali Cek
          </button>
        </div>
      </div>
    </div>
  );
}
