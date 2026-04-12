import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminPaketUjianApi, adminBankSoalApi, adminSoalApi } from '../../api/admin';
import { ArrowLeft, Plus, Trash2, Loader2, X, Search, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function PaketUjianDetailPage() {
  const { id } = useParams();
  const ujianId = Number(id);

  const [ujianInfo, setUjianInfo] = useState<any>(null);
  const [mappedSoal, setMappedSoal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add soal modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [bankSoalList, setBankSoalList] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [availableSoal, setAvailableSoal] = useState<any[]>([]);
  const [isLoadingSoal, setIsLoadingSoal] = useState(false);
  const [selectedSoalIds, setSelectedSoalIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchSoal, setSearchSoal] = useState('');

  const fetchMappedSoal = async () => {
    setIsLoading(true);
    try {
      const res = await adminPaketUjianApi.getSoal(ujianId);
      setMappedSoal(res.data.data || []);
    } catch {
      toast.error('Gagal memuat daftar soal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMappedSoal();
    // Load basic ujian info from getAll (since there's no direct getById for paket ujian)
    adminPaketUjianApi.getAll({ limit: 100 }).then(r => {
      const found = (r.data.data || []).find((u: any) => u.id === ujianId);
      setUjianInfo(found);
    }).catch(() => {});
  }, [ujianId]);

  const openAddModal = () => {
    setSelectedSoalIds(new Set());
    setSelectedBankId('');
    setAvailableSoal([]);
    setSearchSoal('');
    adminBankSoalApi.getAll({ limit: 100 }).then(r => setBankSoalList(r.data.data || [])).catch(() => {});
    setShowAddModal(true);
  };

  useEffect(() => {
    if (!selectedBankId) { setAvailableSoal([]); return; }
    setIsLoadingSoal(true);
    const params: any = { limit: 50 };
    if (searchSoal) params.search = searchSoal;
    adminSoalApi.getByBankSoal(Number(selectedBankId), params)
      .then(r => setAvailableSoal(r.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoadingSoal(false));
  }, [selectedBankId, searchSoal]);

  const toggleSoalSelection = (soalId: number) => {
    setSelectedSoalIds(prev => {
      const next = new Set(prev);
      if (next.has(soalId)) next.delete(soalId);
      else next.add(soalId);
      return next;
    });
  };

  const handleAddSoal = async () => {
    if (selectedSoalIds.size === 0) { toast.error('Pilih minimal 1 soal'); return; }
    setIsSubmitting(true);
    try {
      await adminPaketUjianApi.addSoal(ujianId, { soal_ids: Array.from(selectedSoalIds) });
      toast.success(`${selectedSoalIds.size} soal ditambahkan ke paket`);
      setShowAddModal(false);
      fetchMappedSoal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan soal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSoal = async (mappingId: number) => {
    if (!confirm('Hapus soal ini dari paket ujian?')) return;
    try {
      await adminPaketUjianApi.removeSoal(mappingId);
      toast.success('Soal dihapus dari paket');
      fetchMappedSoal();
    } catch {
      toast.error('Gagal menghapus soal');
    }
  };

  const mappedSoalIds = new Set(mappedSoal.map((m: any) => m.soal_id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/paket-ujian" className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{ujianInfo?.nama || 'Paket Ujian'}</h1>
          <p className="text-gray-400 text-sm">{ujianInfo?.durasi_menit || 0} menit · {ujianInfo?.tipe} · {ujianInfo?.peruntukan} · {mappedSoal.length} soal</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Tambah Soal
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : mappedSoal.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">Belum ada soal di paket ini</p>
            <p className="text-xs mt-1">Klik "Tambah Soal" untuk memulai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">No Urut</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Pertanyaan</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Level</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {mappedSoal.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                    <td className="px-4 py-3 text-gray-500 font-bold">{m.nomor_urut}</td>
                    <td className="px-4 py-3 max-w-xs"><p className="truncate">{m.soal?.pertanyaan || '-'}</p></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{m.soal?.kategori_soal?.nama || '-'}</td>
                    <td className="px-4 py-3"><span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md",
                      m.soal?.level === 'MUDAH' ? 'bg-emerald-900/30 text-emerald-400' :
                      m.soal?.level === 'SEDANG' ? 'bg-amber-900/30 text-amber-400' :
                      m.soal?.level === 'SULIT' ? 'bg-red-900/30 text-red-400' :
                      'bg-purple-900/30 text-purple-400'
                    )}>{m.soal?.level === 'HOST' ? 'HOTS' : m.soal?.level}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveSoal(m.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Soal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Tambah Soal ke Paket</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                <option value="">Pilih Bank Soal</option>
                {bankSoalList.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>

              {selectedBankId && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input placeholder="Cari soal..." value={searchSoal} onChange={e => setSearchSoal(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none" />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-1">
                    {isLoadingSoal ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
                    ) : availableSoal.length === 0 ? (
                      <p className="text-center py-8 text-gray-500 text-sm">Tidak ada soal ditemukan</p>
                    ) : (
                      availableSoal.map(s => {
                        const alreadyMapped = mappedSoalIds.has(s.id);
                        const selected = selectedSoalIds.has(s.id);
                        return (
                          <button
                            key={s.id}
                            disabled={alreadyMapped}
                            onClick={() => toggleSoalSelection(s.id)}
                            className={clsx(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm",
                              alreadyMapped ? "opacity-40 cursor-not-allowed bg-gray-800" :
                              selected ? "bg-emerald-900/40 border border-emerald-700" : "bg-gray-700/50 hover:bg-gray-700"
                            )}
                          >
                            <div className={clsx("w-5 h-5 rounded border flex items-center justify-center shrink-0",
                              selected ? "bg-emerald-600 border-emerald-500" : "border-gray-600"
                            )}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <p className="text-gray-300 truncate flex-1">{s.pertanyaan}</p>
                            {alreadyMapped && <span className="text-[10px] font-bold text-gray-500">Sudah Ditambah</span>}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {selectedSoalIds.size > 0 && (
                    <p className="text-sm text-emerald-400 font-semibold">{selectedSoalIds.size} soal dipilih</p>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600">Batal</button>
              <button onClick={handleAddSoal} disabled={isSubmitting || selectedSoalIds.size === 0} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Tambahkan ({selectedSoalIds.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
