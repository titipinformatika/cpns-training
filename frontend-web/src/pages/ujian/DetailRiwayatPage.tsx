import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../../api/user';
import type { DetailRiwayatResponse } from '../../types';
import { 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  Target,
  FileText,
  HelpCircle,
  ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function DetailRiwayatPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailRiwayatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id]);

  const fetchDetail = async (rid: number) => {
    setIsLoading(true);
    try {
      const res = await userApi.getRiwayatDetail(rid);
      setData(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil detail riwayat');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDurasi = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Memuat Detail Evaluasi...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Top Navigation */}
        <Link to="/riwayat" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest group">
           <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
           Kembali ke Riwayat
        </Link>

        {/* Header Summary Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
           <div className="p-12 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="space-y-3">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                       Evaluasi Hasil
                    </span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{data.ujian_nama}</h1>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                       <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDurasi(data.durasi_pengerjaan_detik)}</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full" />
                       <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {data.total_soal} Soal</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skor Akhir</p>
                       <p className="text-5xl font-black text-gray-900 tracking-tighter">{data.skor_total}</p>
                    </div>
                    {data.is_lulus ? (
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                         <Target className="w-8 h-8" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200">
                         <AlertCircle className="w-8 h-8" />
                      </div>
                    )}
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Benar', value: data.jumlah_benar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                   { label: 'Salah', value: data.jumlah_salah, color: 'text-red-500', bg: 'bg-red-50' },
                   { label: 'Kosong', value: data.jumlah_kosong, color: 'text-gray-400', bg: 'bg-gray-50' },
                   { label: 'TIU/TWK/TKP', value: `${data.skor_tiu}/${data.skor_twk}/${data.skor_tkp}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                 ].map((stat, i) => (
                   <div key={i} className={clsx("p-6 rounded-3xl border border-transparent transition-all", stat.bg)}>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{stat.label}</p>
                      <p className={clsx("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Kategori Passing Grade */}
           <div className="border-t border-gray-50 bg-gray-50/50 p-12 grid md:grid-cols-3 gap-8">
              {data.detail_kategori.map((kat) => (
                <div key={kat.kode} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kat.nama}</p>
                      <p className="text-xl font-black text-gray-900">{kat.skor} <span className="text-xs font-bold text-gray-400">/ {kat.passing_grade}</span></p>
                   </div>
                   {kat.lulus ? (
                     <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                     </div>
                   ) : (
                     <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-4">
           <div className="w-2 h-8 bg-indigo-600 rounded-full" />
           <h2 className="text-3xl font-black text-gray-900 tracking-tight">Review Soal</h2>
        </div>

        {/* Questions Review List */}
        <div className="space-y-8">
           {data.detail_soal.map((soal, idx) => (
             <div key={soal.soal_id} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Question Header */}
                <div className="px-10 py-6 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
                   <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Pertanyaan #{idx + 1}</span>
                   {soal.is_benar ? (
                     <div className="flex items-center gap-2 text-emerald-600 px-4 py-2 bg-emerald-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" /> Benar
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-red-600 px-4 py-2 bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                        <XCircle className="w-4 h-4" /> {soal.jawaban_user ? 'Salah' : 'Tidak Dijawab'}
                     </div>
                   )}
                </div>

                <div className="p-10 space-y-8">
                   <div className="space-y-6">
                      <p className="text-lg font-bold text-gray-800 leading-relaxed font-sans">{soal.pertanyaan}</p>
                      {soal.pertanyaan_gambar && (
                        <div className="relative group max-w-md">
                           <img 
                              src={`/static/${soal.pertanyaan_gambar}`} 
                              alt="Gambar Soal" 
                              className="rounded-3xl border border-gray-100 shadow-sm"
                           />
                        </div>
                      )}
                   </div>

                   {/* Options Review */}
                   <div className="grid gap-4">
                      {soal.opsi.map((opt) => {
                        const isChosen = soal.jawaban_user === opt.label;
                        const isCorrect = soal.jawaban_benar === opt.label;
                        
                        return (
                          <div 
                            key={opt.label}
                            className={clsx(
                              "flex items-center gap-5 p-5 rounded-2xl border-2 transition-all",
                              isCorrect ? "bg-emerald-50 border-emerald-200" : 
                              isChosen ? "bg-red-50 border-red-200" : "bg-gray-50 border-transparent"
                            )}
                          >
                             <div className={clsx(
                               "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                               isCorrect ? "bg-emerald-500 text-white" : 
                               isChosen ? "bg-red-500 text-white" : "bg-white text-gray-400"
                             )}>
                                {opt.label}
                             </div>
                             <p className={clsx(
                               "text-sm font-bold flex-1",
                               isCorrect ? "text-emerald-900" : isChosen ? "text-red-900" : "text-gray-600"
                             )}>{opt.teks}</p>
                             
                             {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                             {!isCorrect && isChosen && <XCircle className="w-5 h-5 text-red-500" />}
                          </div>
                        );
                      })}
                   </div>

                   {/* Pembahasan Section */}
                   <div className="pt-8 border-t border-gray-50 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5" />
                         </div>
                         <h4 className="text-xl font-black text-gray-900 tracking-tight">Pembahasan</h4>
                      </div>
                      
                      <div className="bg-indigo-50/30 rounded-3xl p-8 space-y-6">
                         <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                            {soal.pembahasan || 'Tidak ada pembahasan tertulis untuk soal ini.'}
                         </p>
                         
                         {soal.pembahasan_gambar && (
                           <div className="space-y-3">
                             <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                <ImageIcon className="w-4 h-4" /> Gambar Pembahasan
                             </div>
                             <img 
                                src={`/static/${soal.pembahasan_gambar}`} 
                                alt="Gambar Pembahasan" 
                                className="max-w-md rounded-2xl border-2 border-white shadow-lg"
                             />
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
