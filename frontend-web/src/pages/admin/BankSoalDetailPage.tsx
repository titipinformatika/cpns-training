import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminSoalApi, adminBankSoalApi } from '../../api/admin';
import { masterApi } from '../../api/master';
import { Plus, Pencil, Trash2, Loader2, X, ArrowLeft, Search, ToggleLeft, ToggleRight, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const LEVELS = ['MUDAH', 'SEDANG', 'SULIT', 'HOST'];
const OPSI_LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function BankSoalDetailPage() {
  const { id } = useParams();
  const bankSoalId = Number(id);

  const [bankSoal, setBankSoal] = useState<any>(null);
  const [soalList, setSoalList] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Master data for dropdowns
  const [kategoris, setKategoris] = useState<any[]>([]);
  const [jeniss, setJeniss] = useState<any[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formKategoriId, setFormKategoriId] = useState('');
  const [formJenisId, setFormJenisId] = useState('');
  const [formLevel, setFormLevel] = useState('MUDAH');
  const [formPertanyaan, setFormPertanyaan] = useState('');
  const [formOpsi, setFormOpsi] = useState(['', '', '', '', '']);
  const [formJawabanBenar, setFormJawabanBenar] = useState('A');
  const [formPembahasan, setFormPembahasan] = useState('');

  // Image files
  const [pertanyaanImg, setPertanyaanImg] = useState<File | null>(null);
  const [opsiImgs, setOpsiImgs] = useState<(File | null)[]>([null, null, null, null, null]);
  const [pembahasanImg, setPembahasanImg] = useState<File | null>(null);

  useEffect(() => {
    adminBankSoalApi.getById(bankSoalId).then(r => setBankSoal(r.data.data)).catch(() => {});
    masterApi.getKategori().then(r => setKategoris(r.data.data)).catch(() => {});
  }, [bankSoalId]);

  useEffect(() => {
    fetchSoal();
  }, [page, search, filterKategori, filterLevel]);

  useEffect(() => {
    if (formKategoriId) {
      masterApi.getJenisSoal(Number(formKategoriId)).then(r => setJeniss(r.data.data)).catch(() => {});
    } else {
      setJeniss([]);
    }
  }, [formKategoriId]);

  const fetchSoal = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (filterKategori) params.kategori_id = Number(filterKategori);
      if (filterLevel) params.level = filterLevel;
      const res = await adminSoalApi.getByBankSoal(bankSoalId, params);
      setSoalList(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch {
      toast.error('Gagal memuat soal');
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file: File | null) => {
    if (!file) return true;
    if (file.size > 2 * 1024 * 1024) { toast.error('File maksimal 2MB'); return false; }
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) { toast.error('Hanya format .jpg/.jpeg'); return false; }
    return true;
  };

  const openCreate = () => {
    setEditItem(null);
    setFormKategoriId('');
    setFormJenisId('');
    setFormLevel('MUDAH');
    setFormPertanyaan('');
    setFormOpsi(['', '', '', '', '']);
    setFormJawabanBenar('A');
    setFormPembahasan('');
    setPertanyaanImg(null);
    setOpsiImgs([null, null, null, null, null]);
    setPembahasanImg(null);
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setFormKategoriId(String(item.kategori_soal_id));
    setFormJenisId(String(item.jenis_soal_id));
    setFormLevel(item.level);
    setFormPertanyaan(item.pertanyaan || '');
    setFormOpsi([item.opsi_a || '', item.opsi_b || '', item.opsi_c || '', item.opsi_d || '', item.opsi_e || '']);
    setFormJawabanBenar(item.jawaban_benar || 'A');
    setFormPembahasan(item.pembahasan || '');
    setPertanyaanImg(null);
    setOpsiImgs([null, null, null, null, null]);
    setPembahasanImg(null);
    setShowModal(true);
  };

  const handleToggleActive = async (soalId: number) => {
    try {
      await adminSoalApi.toggleActive(soalId);
      toast.success('Status soal diperbarui');
      fetchSoal();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (soalId: number) => {
    if (!confirm('Yakin hapus soal ini?')) return;
    try {
      await adminSoalApi.delete(soalId);
      toast.success('Soal dihapus');
      fetchSoal();
    } catch {
      toast.error('Gagal menghapus soal');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFile(pertanyaanImg) || !validateFile(pembahasanImg)) return;
    for (const f of opsiImgs) { if (!validateFile(f)) return; }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('bank_soal_id', String(bankSoalId));
      fd.append('kategori_soal_id', formKategoriId);
      fd.append('jenis_soal_id', formJenisId);
      fd.append('level', formLevel);
      fd.append('pertanyaan', formPertanyaan);
      OPSI_LABELS.forEach((label, i) => fd.append(`opsi_${label.toLowerCase()}`, formOpsi[i]));
      fd.append('jawaban_benar', formJawabanBenar);
      if (formPembahasan) fd.append('pembahasan', formPembahasan);

      if (pertanyaanImg) fd.append('pertanyaan_gambar', pertanyaanImg);
      OPSI_LABELS.forEach((label, i) => {
        if (opsiImgs[i]) fd.append(`opsi_${label.toLowerCase()}_gambar`, opsiImgs[i]!);
      });
      if (pembahasanImg) fd.append('pembahasan_gambar', pembahasanImg);

      if (editItem) {
        await adminSoalApi.update(editItem.id, fd);
        toast.success('Soal diperbarui');
      } else {
        await adminSoalApi.create(fd);
        toast.success('Soal ditambahkan');
      }
      setShowModal(false);
      fetchSoal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan soal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const levelColor = (l: string) => {
    switch (l) {
      case 'MUDAH': return 'bg-emerald-900/30 text-emerald-400';
      case 'SEDANG': return 'bg-amber-900/30 text-amber-400';
      case 'SULIT': return 'bg-red-900/30 text-red-400';
      case 'HOST': return 'bg-purple-900/30 text-purple-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin/bank-soal" className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{bankSoal?.nama || 'Bank Soal'}</h1>
          <p className="text-gray-400 text-sm">{bankSoal?.deskripsi || 'Kelola soal dalam bank ini'}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            placeholder="Cari pertanyaan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm">
          <option value="">Semua Kategori</option>
          {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm">
          <option value="">Semua Level</option>
          {LEVELS.map(l => <option key={l} value={l}>{l === 'HOST' ? 'HOTS' : l}</option>)}
        </select>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Tambah Soal
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : soalList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="font-medium text-sm">Belum ada soal</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">No</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Pertanyaan</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Level</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Aktif</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {soalList.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                      <td className="px-4 py-3 text-gray-500 font-bold">{(page - 1) * 10 + i + 1}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate">{s.pertanyaan}</p>
                        {s.pertanyaan_gambar && <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><ImageIcon className="w-3 h-3" /> Gambar</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.kategori_soal?.nama || '-'}</td>
                      <td className="px-4 py-3"><span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md", levelColor(s.level))}>{s.level === 'HOST' ? 'HOTS' : s.level}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(s.id)} className="text-gray-400 hover:text-white">
                          {s.is_active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
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

      {/* Modal Form Soal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editItem ? 'Edit' : 'Tambah'} Soal</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Kategori Soal</label>
                  <select value={formKategoriId} onChange={e => { setFormKategoriId(e.target.value); setFormJenisId(''); }} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                    <option value="">Pilih Kategori</option>
                    {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Jenis Soal</label>
                  <select value={formJenisId} onChange={e => setFormJenisId(e.target.value)} required disabled={!formKategoriId} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none disabled:opacity-50">
                    <option value="">Pilih Jenis</option>
                    {jeniss.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Level</label>
                  <select value={formLevel} onChange={e => setFormLevel(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                    {LEVELS.map(l => <option key={l} value={l}>{l === 'HOST' ? 'HOTS' : l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Jawaban Benar</label>
                  <select value={formJawabanBenar} onChange={e => setFormJawabanBenar(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                    {OPSI_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Pertanyaan</label>
                <textarea value={formPertanyaan} onChange={e => setFormPertanyaan(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none resize-none" />
                <input type="file" accept=".jpg,.jpeg" onChange={e => setPertanyaanImg(e.target.files?.[0] || null)} className="mt-1 text-xs text-gray-400" />
              </div>

              {OPSI_LABELS.map((label, i) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Opsi {label}</label>
                  <input
                    value={formOpsi[i]}
                    onChange={e => { const n = [...formOpsi]; n[i] = e.target.value; setFormOpsi(n); }}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none"
                  />
                  <input type="file" accept=".jpg,.jpeg" onChange={e => { const n = [...opsiImgs]; n[i] = e.target.files?.[0] || null; setOpsiImgs(n); }} className="mt-1 text-xs text-gray-400" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Pembahasan (opsional)</label>
                <textarea value={formPembahasan} onChange={e => setFormPembahasan(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none resize-none" />
                <input type="file" accept=".jpg,.jpeg" onChange={e => setPembahasanImg(e.target.files?.[0] || null)} className="mt-1 text-xs text-gray-400" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
