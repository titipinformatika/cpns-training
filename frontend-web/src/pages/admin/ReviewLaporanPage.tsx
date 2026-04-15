import { useState, useEffect } from 'react';
import { adminReviewApi } from '../../api/admin';
import { Flag, Loader2, X, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_FILTER = ['', 'PENDING', 'DITINJAU', 'DIPERBAIKI', 'DITOLAK'];
const STATUS_OPTIONS = ['DITINJAU', 'DIPERBAIKI', 'DITOLAK'];

const statusColor = (s: string) => {
  switch (s) {
    case 'PENDING': return 'bg-yellow-900/30 text-yellow-400';
    case 'DITINJAU': return 'bg-blue-900/30 text-blue-400';
    case 'DIPERBAIKI': return 'bg-emerald-900/30 text-emerald-400';
    case 'DITOLAK': return 'bg-red-900/30 text-red-400';
    default: return 'bg-gray-700 text-gray-400';
  }
};

const jenisLaporanLabel = (j: string) => {
  const map: Record<string, string> = {
    JAWABAN_SALAH: 'Jawaban Salah', SOAL_SALAH: 'Soal Salah', TYPO: 'Typo',
    PEMBAHASAN_SALAH: 'Pembahasan Salah', GAMBAR_RUSAK: 'Gambar Rusak',
    DUPLIKAT: 'Duplikat', LAINNYA: 'Lainnya',
  };
  return map[j] || j;
};

export default function ReviewLaporanPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState('DITINJAU');
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const res = await adminReviewApi.getLaporan(params);
      setData(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch {
      toast.error('Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filterStatus]);

  const openReview = (item: any) => {
    setSelectedItem(item);
    setReviewStatus(item.status === 'PENDING' ? 'DITINJAU' : item.status);
    setReviewNote(item.review_note || '');
    setShowModal(true);
  };

  const handleReview = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await adminReviewApi.updateLaporan(selectedItem.id, {
        status: reviewStatus,
        review_note: reviewNote || undefined,
      });
      toast.success('Laporan berhasil direview');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mereview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Flag className="w-6 h-6 text-emerald-400" /> Review Laporan Soal</h1>
          <p className="text-gray-400 text-sm mt-1">Tinjau dan tanggapi laporan dari pengguna</p>
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm">
          <option value="">Semua Status</option>
          {STATUS_FILTER.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">Tidak ada laporan</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">ID Soal</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Jenis</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Deskripsi</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Screenshot</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {data.map(item => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{item.soal_id}</td>
                      <td className="px-4 py-3"><span className="text-[10px] font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{jenisLaporanLabel(item.jenis_laporan)}</span></td>
                      <td className="px-4 py-3 max-w-xs"><p className="truncate text-gray-400">{item.deskripsi}</p></td>
                      <td className="px-4 py-3">
                        {item.bukti_screenshot ? (
                          <a href={`/static/${item.bukti_screenshot}`} target="_blank" className="text-emerald-400 hover:underline text-xs">Lihat</a>
                        ) : <span className="text-gray-600 text-xs">-</span>}
                      </td>
                      <td className="px-4 py-3"><span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md", statusColor(item.status))}>{item.status}</span></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openReview(item)} className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-lg">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-800">
                {Array.from({ length: meta.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-lg text-xs font-bold ${page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Review Laporan #{selectedItem.id}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                <p><span className="text-gray-400 font-bold">Soal ID:</span> <span className="text-white">#{selectedItem.soal_id}</span></p>
                <p><span className="text-gray-400 font-bold">Jenis:</span> <span className="text-white">{jenisLaporanLabel(selectedItem.jenis_laporan)}</span></p>
                <p><span className="text-gray-400 font-bold">Deskripsi:</span></p>
                <p className="text-gray-300">{selectedItem.deskripsi}</p>
                {selectedItem.bukti_screenshot && (
                  <div>
                    <p className="text-gray-400 font-bold mb-1">Screenshot:</p>
                    <img src={`/static/${selectedItem.bukti_screenshot}`} alt="Bukti" className="rounded-lg max-h-48 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Status</label>
                <select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Catatan Review (opsional)</label>
                <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none resize-none" placeholder="Tulis catatan untuk laporan ini..." />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600">Batal</button>
              <button onClick={handleReview} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
