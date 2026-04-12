import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sosialApi } from '../../api/sosial';
import type { KontribusiSoal } from '../../types';
import { 
  Plus, 
  Loader2, 
  Calendar, 
  Tag, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function RiwayatKontribusiPage() {
  const [data, setData] = useState<KontribusiSoal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRiwayat(currentPage);
  }, [currentPage]);

  const fetchRiwayat = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await sosialApi.getRiwayatKontribusi({ page, limit: 10 });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      toast.error('Gagal mengambil data riwayat kontribusi');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-yellow-100 italic">Menunggu Review</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-emerald-100">Disetujui ✅</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-red-100">Ditolak ❌</span>;
      default:
        return status;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'MUDAH': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 rounded-md text-[9px] font-bold border border-emerald-50">MUDAH</span>;
      case 'SEDANG': return <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-md text-[9px] font-bold border border-amber-50">SEDANG</span>;
      case 'SULIT': return <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-md text-[9px] font-bold border border-red-50">SULIT</span>;
      case 'HOST': return <span className="px-2 py-0.5 bg-purple-50 text-purple-500 rounded-md text-[9px] font-bold border border-purple-50">HOTS</span>;
      default: return level;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Riwayat Kontribusi</h1>
            <p className="text-gray-500 font-medium">Pantau status validasi soal-soal yang Anda kirimkan</p>
          </div>
          <Link
            to="/kontribusi"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-extrabold shadow-xl shadow-indigo-100 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Kontribusi Baru
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
               <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
               <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Memuat Data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-10">
               <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada kontribusi</h3>
               <p className="text-gray-500 max-w-xs mb-8">Anda belum pernah mengontribusikan soal. Ayo mulai kontribusi sekarang!</p>
               <Link 
                to="/kontribusi"
                className="bg-indigo-50 text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-100 transition-all"
               >
                 Buat Kontribusi Pertama
               </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Detail Soal</th>
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((item, i) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-all">
                      <td className="px-8 py-8 align-top">
                        <span className="text-sm font-extrabold text-gray-400">
                          {(currentPage - 1) * 10 + i + 1}
                        </span>
                      </td>
                      <td className="px-8 py-8 max-w-md">
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-gray-800 leading-relaxed line-clamp-2">
                            "{item.pertanyaan}"
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                               <Tag className="w-3 h-3" />
                               {item.kategori_soal.nama}
                            </div>
                            {getLevelBadge(item.level)}
                          </div>
                          {item.review_note && (
                            <div className="flex items-start gap-2 bg-pink-50/50 p-3 rounded-xl border border-pink-100/50">
                               <MessageSquare className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                               <p className="text-xs font-bold text-pink-600 italic leading-snug">
                                 Note Admin: {item.review_note}
                               </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-8 align-top">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-8 py-8 text-right align-top">
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-xs font-extrabold text-gray-900">{formatDate(item.created_at)}</span>
                           <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                              <Calendar className="w-3 h-3" />
                              WIB
                           </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-8 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                   {[...Array(totalPages)].map((_, i) => (
                     <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={clsx(
                        "w-10 h-10 rounded-xl text-xs font-extrabold transition-all",
                        currentPage === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-400 hover:bg-gray-100"
                      )}
                     >
                        {i + 1}
                     </button>
                   ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
