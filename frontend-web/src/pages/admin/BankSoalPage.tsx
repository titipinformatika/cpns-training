import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminBankSoalApi } from '../../api/admin';
import { Plus, Pencil, Trash2, Loader2, X, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function BankSoalPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await adminBankSoalApi.getAll({ page, limit: 10 });
      setData(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch {
      toast.error('Gagal memuat bank soal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const openCreate = () => {
    setEditItem(null);
    setFormNama('');
    setFormDeskripsi('');
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setFormNama(item.nama);
    setFormDeskripsi(item.deskripsi || '');
    setShowModal(true);
  };

   const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminBankSoalApi.delete(deleteId);
      toast.success('Bank soal dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { nama: formNama, deskripsi: formDeskripsi || undefined };
      if (editItem) {
        await adminBankSoalApi.update(editItem.id, payload);
        toast.success('Bank soal diperbarui');
      } else {
        await adminBankSoalApi.create(payload);
        toast.success('Bank soal ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-400" /> Bank Soal</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola kumpulan soal berdasarkan bank</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Tambah Bank Soal
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">Belum ada bank soal</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jumlah Soal</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {data.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                      <td className="px-4 py-3 text-gray-500 font-bold">{(page - 1) * 10 + i + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/bank-soal/${item.id}`} className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1">
                          {item.nama} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{item.deskripsi || '-'}</td>
                      <td className="px-4 py-3">{item._count?.soal ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editItem ? 'Edit' : 'Tambah'} Bank Soal</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nama</label>
                <input value={formNama} onChange={e => setFormNama(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Deskripsi</label>
                <textarea value={formDeskripsi} onChange={e => setFormDeskripsi(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Hapus Bank Soal?"
        description="Yakin hapus bank soal ini? Semua soal di dalamnya mungkin terdampak."
        variant="danger"
        confirmLabel="Ya, Hapus"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
