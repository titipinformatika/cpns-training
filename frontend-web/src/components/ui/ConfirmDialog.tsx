import { AlertTriangle, Loader2, X } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-600 hover:bg-red-700 shadow-red-100',
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
    },
    info: {
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
    },
  };

  const theme = themes[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center relative animate-in zoom-in duration-300">
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={clsx("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", theme.iconBg, theme.iconColor)}>
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-500 mb-8 leading-relaxed text-sm">{description}</p>}
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              "w-full text-white font-bold py-4 rounded-2xl shadow-xl min-h-[56px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70",
              theme.buttonBg
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
          
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
