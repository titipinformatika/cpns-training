import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { HasilUjianResponse } from '../../types';
import { 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  LayoutDashboard, 
  Clock, 
  FileText,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function HasilUjianPage() {
  const navigate = useNavigate();
  const [hasil, setHasil] = useState<HasilUjianResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rawHasil = sessionStorage.getItem('hasil_ujian');
    if (!rawHasil) {
      setIsLoading(false);
      return;
    }

    try {
      const data: HasilUjianResponse = JSON.parse(rawHasil);
      setHasil(data);
    } catch (err) {
      toast.error('Gagal memuat hasil');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Menghitung Skor Anda..." />;
  }

  if (!hasil) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <EmptyState
          title="Data Hasil Tidak Ditemukan"
          description="Maaf, hasil ujian Anda tidak dapat ditemukan. Silakan cek riwayat ujian Anda."
          icon={AlertCircle}
          actionLabel="Ke Daftar Ujian"
          actionHref="/ujian"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <div className={clsx(
          "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl",
          hasil.is_lulus ? "bg-emerald-100 text-emerald-600 shadow-emerald-200" : "bg-red-100 text-red-600 shadow-red-200"
        )}>
          {hasil.is_lulus ? <Trophy className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hasil Ujian
        </h1>
        <p className="text-gray-500 font-medium">Sesi pemeriksaan selesai dilakukan</p>
      </div>

      {/* Hero Score Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-6 mb-8 overflow-hidden relative">
        <div className={clsx(
          "absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 rounded-full opacity-5 blur-3xl",
          hasil.is_lulus ? "bg-emerald-500" : "bg-red-500"
        )}></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-2 block">Skor Keseluruhan</span>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-extrabold text-gray-900 tracking-tight">{hasil.skor_total}</span>
              <span className="text-gray-300 font-bold">/ 550</span>
            </div>
            <div className={clsx(
              "mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-extrabold uppercase",
              hasil.is_lulus ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}>
              {hasil.is_lulus ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Dinyatakan Lulus
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Belum Lulus
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center min-w-[140px]">
              <TrendingUp className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <p className="text-[10px] text-gray-400 font-bold uppercase">Akurasi</p>
              <p className="text-xl font-extrabold text-gray-900">
                {Math.round((hasil.jumlah_benar / hasil.total_soal) * 100)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center min-w-[140px]">
              <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <p className="text-[10px] text-gray-400 font-bold uppercase">Waktu</p>
              <p className="text-xl font-extrabold text-gray-900">
                {Math.floor(hasil.durasi_pengerjaan_detik / 60)}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {hasil.detail_kategori.map((kat) => (
          <div key={kat.kode} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-gray-400 uppercase mb-1">{kat.nama}</h4>
              <p className={clsx("text-2xl font-black", kat.lulus ? "text-indigo-600" : "text-gray-400")}>
                {kat.skor}
              </p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                Passing: {kat.passing_grade}
              </p>
            </div>
            <div className={clsx(
              "p-2 rounded-xl",
              kat.lulus ? "bg-emerald-50 text-emerald-500" : "bg-gray-50 text-gray-300"
            )}>
              {kat.lulus ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-50 p-6 mb-12">
        <h3 className="text-lg font-bold text-gray-900 mb-8 border-b border-gray-50 pb-4">Statistik Jawaban</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase">Total Soal</p>
            <p className="text-2xl font-black text-gray-900">{hasil.total_soal}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-emerald-500 font-bold uppercase">Benar</p>
            <p className="text-2xl font-black text-emerald-600">{hasil.jumlah_benar}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-red-400 font-bold uppercase">Salah</p>
            <p className="text-2xl font-black text-red-500">{hasil.jumlah_salah}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-300 font-bold uppercase">Kosong</p>
            <p className="text-2xl font-black text-gray-300">{hasil.jumlah_kosong}</p>
          </div>
        </div>
        
        {/* Progress Visual */}
        <div className="mt-10 h-3 w-full bg-gray-100 rounded-full flex overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(hasil.jumlah_benar / hasil.total_soal) * 100}%` }}></div>
          <div className="bg-red-400 h-full transition-all duration-1000" style={{ width: `${(hasil.jumlah_salah / hasil.total_soal) * 100}%` }}></div>
          <div className="bg-gray-200 h-full transition-all duration-1000" style={{ width: `${(hasil.jumlah_kosong / hasil.total_soal) * 100}%` }}></div>
        </div>
      </div>

      {/* Recommendations / Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/riwayat/' + hasil.hasil_ujian_id)}
          className="flex-1 group bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-5 rounded-2xl shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <FileText className="w-5 h-5" />
          Lihat Pembahasan
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <Link 
          to="/ujian" 
          className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-extrabold py-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-3 transition-all"
        >
          <LayoutDashboard className="w-5 h-5 text-gray-400" />
          Kembali ke Daftar
        </Link>
      </div>
    </div>
  );
}
