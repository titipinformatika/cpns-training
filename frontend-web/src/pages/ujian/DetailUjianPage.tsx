import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ujianApi } from '../../api/ujian';
import type { Ujian } from '../../types';
import { 
  ArrowLeft, 
  Timer, 
  ClipboardList, 
  Info, 
  Play, 
  Loader2, 
  AlertTriangle,
  FileText,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function DetailUjianPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ujian, setUjian] = useState<Ujian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ujianApi.getDetail(Number(id));
      setUjian(res.data.data);
    } catch (err) {
      setError('Gagal mengambil detail ujian. Silakan coba lagi.');
      toast.error('Gagal mengambil detail ujian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleMulai = async () => {
    if (!ujian) return;
    setIsStarting(true);
    try {
      const res = await ujianApi.mulai(ujian.id);
      // Simpan data simulasi ke sessionStorage
      sessionStorage.setItem('simulasi_data', JSON.stringify(res.data.data));
      toast.success('Ujian dimulai! Semoga sukses.');
      navigate('/ujian/simulasi');
    } catch (err: any) {
      if (err.response?.status === 400) {
        const msg = err.response.data.message;
        if (msg.includes('berlangsung')) {
          toast.error('Ada ujian yang masih berlangsung.');
        } else {
          toast.error(msg);
        }
      } else {
        toast.error('Gagal memulai ujian. Silakan coba lagi.');
      }
    } finally {
      setIsStarting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat detail ujian..." />;
  }

  if (error || !ujian) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <EmptyState
          title="Gagal Memuat Detail"
          description={error || 'Ujian tidak ditemukan'}
          icon={AlertCircle}
          actionLabel="Kembali ke Daftar"
          actionHref="/ujian"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-10">
      <Link 
        to="/ujian" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar
      </Link>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden animate-in fade-in duration-700">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border border-white/10">
              <Info className="w-3 h-3" />
              Detail Informasi Ujian
            </div>
            <h1 className="text-4xl font-extrabold mb-4">{ujian.nama}</h1>
            <p className="text-indigo-50/80 text-lg max-w-2xl leading-relaxed">
              {ujian.deskripsi || 'Silakan baca instruksi dengan teliti sebelum memulai simulasi ini.'}
            </p>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Durasi</p>
                <p className="text-xl font-extrabold text-gray-900">{ujian.durasi_menit} Menit</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-50">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jumlah Soal</p>
                <p className="text-xl font-extrabold text-gray-900">{ujian._count.ujian_soal} Soal</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-gray-50">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tipe Konten</p>
                <p className="text-xl font-extrabold text-gray-900">{ujian.tipe}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex gap-5 items-start mb-12">
            <div className="shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-amber-900 font-bold text-lg mb-1">Penting untuk Diketahui</h4>
              <ul className="text-amber-800/80 text-sm space-y-2 list-disc list-inside">
                <li>Timer akan langsung berjalan setelah Anda menekan tombol mulai.</li>
                <li>Jawaban akan tersimpan secara otomatis setiap kali Anda pindah soal.</li>
                <li>Pastikan koneksi internet stabil selama proses ujian berlangsung.</li>
                <li>Jangan me-refresh halaman secara berlebihan untuk menjaga sinkronisasi waktu.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-5 rounded-3xl shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xl"
          >
            <Play className="w-6 h-6 fill-current" />
            Mulai Simulasi Sekarang
          </button>
        </div>
      </div>

      {/* Custom Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Siap Memulai Ujian?</h3>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Anda akan memiliki waktu <span className="text-indigo-600 font-bold">{ujian.durasi_menit} menit</span> untuk menyelesaikan <span className="text-indigo-600 font-bold">{ujian._count.ujian_soal} soal</span>. Pastikan Anda berada di tempat yang tenang.
            </p>
            <div className="flex flex-col gap-3">
              <button
                disabled={isStarting}
                onClick={handleMulai}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyiapkan Soal...
                  </>
                ) : (
                  'Ya, Mulai Sekarang!'
                )}
              </button>
              <button
                disabled={isStarting}
                onClick={() => setShowConfirm(false)}
                className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-transparent transition-all"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
