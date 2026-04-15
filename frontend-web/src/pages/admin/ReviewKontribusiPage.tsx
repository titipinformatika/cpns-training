import { useState, useEffect } from 'react';
import { adminReviewApi, adminBankSoalApi } from '../../api/admin';
import { GitPullRequest, Loader2, X, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_FILTER = ['', 'PENDING', 'APPROVED', 'REJECTED'];
const STATUS_OPTIONS = ['APPROVED', 'REJECTED'];

const statusColor = (s: string) => {
  switch (s) {
    case 'PENDING': return 'bg-yellow-900/30 text-yellow-400';
    case 'APPROVED': return 'bg-emerald-900/30 text-emerald-400';
    case 'REJECTED': return 'bg-red-900/30 text-red-400';
    default: return 'bg-gray-700 text-gray-400';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'PENDING': return 'Menunggu';
    case 'APPROVED': return 'Disetujui';
    case 'REJECTED': return 'Ditolak';
    default: return s;
  }
};

const levelColor = (l: string) => {
  switch (l) {
    case 'MUDAH': return 'bg-emerald-900/30 text-emerald-400';
    case 'SEDANG': return 'bg-amber-900/30 text-amber-400';
    case 'SULIT': return 'bg-red-900/30 text-red-400';
    case 'HOST': return 'bg-purple-900/30 text-purple-400';
    default: return 'bg-gray-700 text-gray-400';
  }
};

export default function ReviewKontribusiPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewNote, setReviewNote] = useState('');
  const [selectedBankSoalId, setSelectedBankSoalId] = useState('');
  const [bankSoalList, setBankSoalList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const res = await adminReviewApi.getKontribusi(params);
      setData(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch {
      toast.error('Gagal memuat kontribusi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filterStatus]);

  const openReview = async (item: any) => {
    setSelectedItem(item);
    setReviewStatus('APPROVED');
    setReviewNote(item.review_note || '');
    setSelectedBankSoalId('');
    try {
      const res = await adminBankSoalApi.getAll({ limit: 100 });
      setBankSoalList(res.data.data || []);
    } catch {
      setBankSoalList([]);
    }
    setShowModal(true);
  };

  const handleReview = async () => {
    if (!selectedItem) return;
    if (reviewStatus === 'APPROVED' && !selectedBankSoalId) {
      toast.error('Pilih bank soal tujuan untuk menyetujui kontribusi');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminReviewApi.updateKontribusi(selectedItem.id, {
        status: reviewStatus,
        review_note: reviewNote || undefined,
        bank_soal_id: reviewStatus === 'APPROVED' ? Number(selectedBankSoalId) : undefined,
      });
      toast.success(`Kontribusi berhasil ${reviewStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GitPullRequest className="w-6 h-6 text-emerald-400" /> Review Kontribusi Soal</h1>
          <p className="text-gray-400 text-sm mt-1">Tinjau dan setujui kontribusi soal dari pengguna</p>
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm">
          <option value="">Semua Status</option>
          {STATUS_FILTER.filter(Boolean).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">Tidak ada kontribusi</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Pertanyaan</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Level</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {data.map(item => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                      <td className="px-4 py-3 max-w-xs"><p className="truncate">{item.pertanyaan}</p></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.kategori_soal?.nama || '-'}</td>
                      <td className="px-4 py-3"><span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md", levelColor(item.level))}>{item.level === 'HOST' ? 'HOTS' : item.level}</span></td>
                      <td className="px-4 py-3"><span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md", statusColor(item.status))}>{statusLabel(item.status)}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Review Kontribusi</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 font-bold text-xs mb-1">Pertanyaan:</p>
                  <p className="text-white">{selectedItem.pertanyaan}</p>
                </div>
                {selectedItem.pertanyaan_gambar && (
                  <img src={`/static/${selectedItem.pertanyaan_gambar}`} alt="Gambar" className="rounded-lg max-h-32 object-contain" />
                )}
                <div className="grid grid-cols-1 gap-1">
                  {['A', 'B', 'C', 'D', 'E'].map(label => {
                    const key = `opsi_${label.toLowerCase()}`;
                    const value = selectedItem[key];
                    if (!value) return null;
                    const isCorrect = selectedItem.jawaban_benar === label;
                    return (
                      <div key={label} className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs",
                        isCorrect ? "bg-emerald-900/30 text-emerald-300 font-bold" : "text-gray-300"
                      )}>
                        <span className="font-bold text-gray-500">{label}.</span>
                        <span>{value}</span>
                        {isCorrect && <span className="ml-auto text-[10px] text-emerald-500">✓ Benar</span>}
                      </div>
                    );
                  })}
                </div>
                {selectedItem.pembahasan && (
                  <div>
                    <p className="text-gray-400 font-bold text-xs mb-1">Pembahasan:</p>
                    <p className="text-gray-300 text-xs">{selectedItem.pembahasan}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Keputusan</label>
                <select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'APPROVED' ? 'Setujui' : 'Tolak'}</option>)}
                </select>
              </div>

              {reviewStatus === 'APPROVED' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Bank Soal Tujuan <span className="text-red-400">*</span></label>
                  <select value={selectedBankSoalId} onChange={e => setSelectedBankSoalId(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                    <option value="">Pilih Bank Soal</option>
                    {bankSoalList.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Catatan Review (opsional)</label>
                <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none resize-none" placeholder="Tulis catatan..." />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600">Batal</button>
              <button onClick={handleReview} disabled={isSubmitting} className={clsx(
                "flex-1 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2",
                reviewStatus === 'APPROVED' ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"
              )}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {reviewStatus === 'APPROVED' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
