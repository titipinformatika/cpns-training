import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/user';
import type { RiwayatUjianItem } from '../../types';
import { 
  Loader2, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Trophy, 
  AlertCircle,
  ChevronLeft,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RiwayatUjianPage() {
  const [data, setData] = useState<RiwayatUjianItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRiwayat(currentPage);
  }, [currentPage]);

  const fetchRiwayat = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await userApi.getRiwayatUjian({ page, limit: 10 });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      toast.error('Gagal mengambil data riwayat');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDurasi = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
             <h1 className="text-5xl font-black text-gray-900 tracking-tight">Riwayat Ujian</h1>
             <p className="text-gray-500 font-medium text-lg">Rekaman seluruh perjuangan Anda menuju ASN.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Selesai</p>
                <p className="text-lg font-black text-gray-900">{data.length} <span className="text-gray-300 ml-1">Simulasi</span></p>
             </div>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-6">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Riwayat...</p>
             </div>
           ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-40 text-center px-10">
                <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mb-8">
                   <Inbox className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Belum ada riwayat</h3>
                <p className="text-gray-500 max-w-sm mb-10 font-medium">Sepertinya Anda belum pernah mengikuti simulasi ujian. Mulai sekarang untuk melihat progres!</p>
                <Link to="/ujian" className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
                   Daftar Sekarang
                </Link>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-50/50">
                         <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sesi Ujian</th>
                         <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Tipe</th>
                         <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                         <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Skor Total</th>
                         <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Durasi</th>
                         <th className="px-10 py-8"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50/50">
                      {data.map((item) => (
                        <tr key={item.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => window.location.href = `/riwayat/${item.id}`}>
                           <td className="px-10 py-10">
                              <div className="space-y-1">
                                 <h4 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.ujian.nama}</h4>
                                 <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(item.waktu_selesai)}
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-10 text-center">
                              <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                 {item.ujian.tipe}
                              </span>
                           </td>
                           <td className="px-10 py-10 text-center">
                              {item.is_lulus ? (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">
                                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                   Lulus PG
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm shadow-red-50">
                                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                   Gagal PG
                                </span>
                              )}
                           </td>
                           <td className="px-10 py-10 text-right">
                              <span className="text-2xl font-black text-gray-900 group-hover:scale-110 transition-transform block">{item.skor_total}</span>
                           </td>
                           <td className="px-10 py-10 text-right">
                              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-gray-400">
                                 <Clock className="w-3.5 h-3.5" />
                                 {formatDurasi(item.durasi_detik)}
                              </div>
                           </td>
                           <td className="px-10 py-10 text-right">
                              <Link 
                                to={`/riwayat/${item.id}`}
                                className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-all shadow-sm"
                              >
                                 <ChevronRight className="w-6 h-6" />
                              </Link>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* Pagination */}
           {!isLoading && totalPages > 1 && (
             <div className="p-10 border-t border-gray-50 flex items-center justify-between">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Halaman {currentPage} dari {totalPages}</p>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl disabled:opacity-30 transition-all shadow-sm"
                   >
                      <ChevronLeft className="w-6 h-6" />
                   </button>
                   <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl disabled:opacity-30 transition-all shadow-sm"
                   >
                      <ChevronRight className="w-6 h-6" />
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Warning Section */}
        <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-10 flex items-start gap-8">
           <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-[1.5rem] flex items-center justify-center shrink-0">
              <AlertCircle className="w-8 h-8" />
           </div>
           <div className="space-y-2">
              <h5 className="font-black text-amber-900 uppercase tracking-wider text-sm">Review & Evaluasi</h5>
              <p className="text-amber-800 font-medium leading-relaxed">
                Gunakan fitur "Detail Review" untuk melihat jawaban yang salah dan mempelajari pembahasannya. 
                Evaluasi adalah langkah terpenting untuk meningkatkan skor di simulasi berikutnya.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
