import { useNavigate } from 'react-router-dom';
import { Search, Home, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="w-40 h-40 bg-indigo-50 rounded-[3rem] rotate-12 flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-20 h-20 text-indigo-200 -rotate-12" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <span className="text-8xl font-black text-indigo-600/10 tracking-tighter">404</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-gray-500 font-bold leading-relaxed">
            Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan ke alamat lain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-500 border border-gray-100 rounded-2xl font-black hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <ChevronLeft className="w-5 h-5" />
            Ke Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
