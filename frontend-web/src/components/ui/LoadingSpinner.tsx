import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ text = 'Memuat data...', fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex py-20 items-center justify-center">
      {content}
    </div>
  );
}
