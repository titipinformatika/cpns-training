import { useState, useEffect } from 'react';
import { sosialApi } from '../../api/sosial';
import type { LaporanSoal } from '../../types';
import { 
  Calendar, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ExternalLink,
  ImageIcon,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const LABEL_JENIS: Record<string, string> = {
  JAWABAN_SALAH: 'Jawaban Salah',
  SOAL_SALAH: 'Soal Salah',
  TYPO: 'Typo / Salah Ketik',
  PEMBAHASAN_SALAH: 'Pembahasan Salah',
  GAMBAR_RUSAK: 'Gambar Rusak',
  DUPLIKAT: 'Soal Duplikat',
  LAINNYA: 'Lainnya',
};

export default function RiwayatLaporanPage() {
  const [data, setData] = useState<LaporanSoal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiwayat = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await sosialApi.getRiwayatLaporan({ page, limit: 10 });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      setError('Gagal mengambil data riwayat laporan. Silakan coba lagi.');
      toast.error('Gagal mengambil data riwayat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat(currentPage);
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-yellow-100 italic">Menunggu</span>;
      case 'DITINJAU':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-blue-100">Sedang Ditinjau</span>;
      case 'DIPERBAIKI':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-emerald-100">Sudah Diperbaiki ✅</span>;
      case 'DITOLAK':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-red-100">Ditolak ❌</span>;
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Memuat riwayat laporan..." />;
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <EmptyState
          title="Terjadi Kesalahan"
          description={error}
          icon={AlertCircle}
          actionLabel="Coba Lagi"
          onClickAction={() => fetchRiwayat(currentPage)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Riwayat Laporan</h1>
          <p className="text-gray-500 font-medium">Laporan masalah soal yang telah Anda kirimkan</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          {data.length === 0 ? (
            <EmptyState
              title="Belum ada laporan"
              description="Anda belum pernah melaporkan masalah pada soal ujian mana pun."
              icon={Inbox}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Detail Laporan</th>
                    <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Bukti</th>
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
                      <td className="px-8 py-8 max-w-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                             <div className="p-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">
                                {LABEL_JENIS[item.jenis_laporan] || item.jenis_laporan}
                             </div>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soal #{item.soal_id}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800 leading-relaxed line-clamp-2">
                            "{item.deskripsi}"
                          </p>
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
                        {item.bukti_screenshot ? (
                          <div className="relative group/thumb cursor-pointer" onClick={() => window.open(`/static/${item.bukti_screenshot}`, '_blank')}>
                            <img 
                              src={`/static/${item.bukti_screenshot}`} 
                              alt="Bukti" 
                              className="w-16 h-12 object-cover rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover/thumb:scale-105 transition-all" 
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                               <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-16 h-12 rounded-xl bg-gray-50 border border-dotted border-gray-200">
                             <ImageIcon className="w-4 h-4 text-gray-300" />
                             <span className="text-[8px] font-bold text-gray-300">N/A</span>
                          </div>
                        )}
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
                <div className="flex items-center gap-2 mx-2">
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
