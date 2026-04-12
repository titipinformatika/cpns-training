import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminPaketUjianApi } from '../../api/admin';
import { Plus, Pencil, Loader2, X, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TIPE_OPTIONS = ['TRYOUT', 'LATIHAN', 'QUIZ'];
const PERUNTUKAN_OPTIONS = ['FREE', 'PREMIUM', 'ALL'];

export default function PaketUjianPage() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formNama, setFormNama] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formDurasi, setFormDurasi] = useState(120);
  const [formTipe, setFormTipe] = useState('TRYOUT');
  const [formPeruntukan, setFormPeruntukan] = useState('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await adminPaketUjianApi.getAll({ page, limit: 10 });
      setData(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch {
      toast.error('Gagal memuat paket ujian');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const openCreate = () => {
    setEditItem(null);
    setFormNama(''); setFormDeskripsi(''); setFormDurasi(120); setFormTipe('TRYOUT'); setFormPeruntukan('ALL');
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setFormNama(item.nama); setFormDeskripsi(item.deskripsi || ''); setFormDurasi(item.durasi_menit); setFormTipe(item.tipe); setFormPeruntukan(item.peruntukan);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { nama: formNama, deskripsi: formDeskripsi || undefined, durasi_menit: formDurasi, tipe: formTipe, peruntukan: formPeruntukan };
      if (editItem) {
        await adminPaketUjianApi.update(editItem.id, payload);
        toast.success('Paket ujian diperbarui');
      } else {
        await adminPaketUjianApi.create(payload);
        toast.success('Paket ujian ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipeColor = (t: string) => {
    switch (t) {
      case 'TRYOUT': return 'bg-blue-900/30 text-blue-400';
      case 'LATIHAN': return 'bg-emerald-900/30 text-emerald-400';
      case 'QUIZ': return 'bg-purple-900/30 text-purple-400';
      default: return 'bg-gray-700 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-400" /> Paket Ujian</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola paket ujian dan mapping soal</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Tambah Paket
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">Belum ada paket ujian</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">No</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Nama</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Durasi</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Tipe</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Peruntukan</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Soal</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {data.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                      <td className="px-4 py-3 text-gray-500 font-bold">{(page - 1) * 10 + i + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/paket-ujian/${item.id}`} className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1">
                          {item.nama} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{item.durasi_menit} menit</td>
                      <td className="px-4 py-3"><span className={clsx("text-[10px] font-bold px-2 py-1 rounded-md", tipeColor(item.tipe))}>{item.tipe}</span></td>
                      <td className="px-4 py-3 text-gray-400">{item.peruntukan}</td>
                      <td className="px-4 py-3">{item._count?.ujian_soal ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editItem ? 'Edit' : 'Tambah'} Paket Ujian</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nama</label>
                <input value={formNama} onChange={e => setFormNama(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Deskripsi</label>
                <textarea value={formDeskripsi} onChange={e => setFormDeskripsi(e.target.value)} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Durasi (menit)</label>
                  <input type="number" value={formDurasi} onChange={e => setFormDurasi(Number(e.target.value))} min={1} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Tipe</label>
                  <select value={formTipe} onChange={e => setFormTipe(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                    {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Peruntukan</label>
                  <select value={formPeruntukan} onChange={e => setFormPeruntukan(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none">
                    {PERUNTUKAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
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
