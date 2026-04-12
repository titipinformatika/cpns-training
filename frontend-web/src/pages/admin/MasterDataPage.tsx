import { useState, useEffect } from 'react';
import { masterApi } from '../../api/master';
import { adminMasterApi } from '../../api/admin';
import { Plus, Pencil, Trash2, Loader2, X, AlertCircle, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TABS = ['Kategori Soal', 'Jenis Soal', 'Pendidikan', 'Jurusan', 'Instansi', 'Formasi'] as const;
type TabName = typeof TABS[number];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabName>('Kategori Soal');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Extra data for dropdowns
  const [kategoris, setKategoris] = useState<any[]>([]);
  const [instansis, setInstansis] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'Kategori Soal': res = await masterApi.getKategori(); break;
        case 'Jenis Soal': res = await masterApi.getJenisSoal(); break;
        case 'Pendidikan': res = await masterApi.getPendidikan(); break;
        case 'Jurusan': res = await masterApi.getJurusan(); break;
        case 'Instansi': res = await masterApi.getInstansi(); break;
        case 'Formasi': res = await masterApi.getFormasi(); break;
      }
      setData(res?.data?.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Fetch dependent dropdowns
    if (activeTab === 'Jenis Soal') {
      masterApi.getKategori().then(r => setKategoris(r.data.data)).catch(() => {});
    }
    if (activeTab === 'Formasi') {
      masterApi.getInstansi().then(r => setInstansis(r.data.data)).catch(() => {});
    }
  }, [activeTab]);

  const openCreate = () => {
    setEditItem(null);
    setFormData({});
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus data ini? Tindakan tidak bisa dikembalikan.')) return;
    try {
      switch (activeTab) {
        case 'Kategori Soal': await adminMasterApi.deleteKategori(id); break;
        case 'Jenis Soal': await adminMasterApi.deleteJenis(id); break;
        case 'Instansi': await adminMasterApi.deleteInstansi(id); break;
        case 'Formasi': await adminMasterApi.deleteFormasi(id); break;
        default: return;
      }
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editItem) {
        // Update
        switch (activeTab) {
          case 'Kategori Soal': await adminMasterApi.updateKategori(editItem.id, formData); break;
          case 'Jenis Soal': await adminMasterApi.updateJenis(editItem.id, formData); break;
          case 'Instansi': await adminMasterApi.updateInstansi(editItem.id, formData); break;
          case 'Formasi': await adminMasterApi.updateFormasi(editItem.id, formData); break;
        }
        toast.success('Data berhasil diperbarui');
      } else {
        // Create
        switch (activeTab) {
          case 'Kategori Soal': await adminMasterApi.createKategori(formData); break;
          case 'Jenis Soal': await adminMasterApi.createJenis(formData); break;
          case 'Pendidikan': await adminMasterApi.createPendidikan(formData); break;
          case 'Jurusan': await adminMasterApi.createJurusan(formData); break;
          case 'Instansi': await adminMasterApi.createInstansi(formData); break;
          case 'Formasi': await adminMasterApi.createFormasi(formData); break;
        }
        toast.success('Data berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = ['Kategori Soal', 'Jenis Soal', 'Instansi', 'Formasi'].includes(activeTab);
  const canDelete = canEdit;

  const renderFormFields = () => {
    const input = (label: string, key: string, type = 'text', required = true) => (
      <div key={key}>
        <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
        <input
          type={type}
          value={formData[key] || ''}
          onChange={e => setFormData({ ...formData, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
          required={required}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>
    );

    const select = (label: string, key: string, options: { value: any; label: string }[]) => (
      <div key={key}>
        <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
        <select
          value={formData[key] || ''}
          onChange={e => setFormData({ ...formData, [key]: Number(e.target.value) })}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        >
          <option value="">Pilih...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );

    switch (activeTab) {
      case 'Kategori Soal':
        return <>{input('Kode', 'kode')}{input('Nama', 'nama')}{input('Deskripsi', 'deskripsi', 'text', false)}{input('Passing Grade', 'passing_grade', 'number')}</>;
      case 'Jenis Soal':
        return <>{select('Kategori Soal', 'kategori_soal_id', kategoris.map(k => ({ value: k.id, label: k.nama })))}{input('Nama', 'nama')}{input('Deskripsi', 'deskripsi', 'text', false)}</>;
      case 'Pendidikan':
        return <>{input('Nama', 'nama')}{input('Urutan', 'urutan', 'number')}</>;
      case 'Jurusan':
        return <>{input('Nama', 'nama')}{input('Rumpun', 'rumpun', 'text', false)}</>;
      case 'Instansi':
        return <>{input('Nama', 'nama')}{input('Singkatan', 'singkatan', 'text', false)}{input('Jenis', 'jenis', 'text', false)}</>;
      case 'Formasi':
        return <>{select('Instansi', 'instansi_id', instansis.map(i => ({ value: i.id, label: i.nama })))}{input('Nama Jabatan', 'nama_jabatan')}{input('Kualifikasi Pendidikan', 'kualifikasi_pendidikan')}{input('Jumlah Formasi', 'jumlah_formasi', 'number')}{input('Lokasi Penempatan', 'lokasi_penempatan')}{input('Gaji Min', 'gaji_min', 'number', false)}{input('Gaji Max', 'gaji_max', 'number', false)}</>;
    }
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'Kategori Soal': return ['Kode', 'Nama', 'Passing Grade'];
      case 'Jenis Soal': return ['Nama', 'Kategori'];
      case 'Pendidikan': return ['Nama', 'Urutan'];
      case 'Jurusan': return ['Nama', 'Rumpun'];
      case 'Instansi': return ['Nama', 'Singkatan', 'Jenis'];
      case 'Formasi': return ['Jabatan', 'Kualifikasi', 'Jumlah', 'Lokasi'];
    }
  };

  const renderTableRow = (item: any) => {
    switch (activeTab) {
      case 'Kategori Soal': return <><td className="px-4 py-3 font-mono text-emerald-400 text-xs">{item.kode}</td><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3">{item.passing_grade}</td></>;
      case 'Jenis Soal': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3 text-gray-400">{item.kategori_soal?.nama || item.kategori_soal_id}</td></>;
      case 'Pendidikan': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3">{item.urutan}</td></>;
      case 'Jurusan': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3 text-gray-400">{item.rumpun || '-'}</td></>;
      case 'Instansi': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3 text-gray-400">{item.singkatan || '-'}</td><td className="px-4 py-3 text-gray-400">{item.jenis || '-'}</td></>;
      case 'Formasi': return <><td className="px-4 py-3">{item.nama_jabatan}</td><td className="px-4 py-3 text-gray-400">{item.kualifikasi_pendidikan}</td><td className="px-4 py-3">{item.jumlah_formasi}</td><td className="px-4 py-3 text-gray-400">{item.lokasi_penempatan}</td></>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Database className="w-6 h-6 text-emerald-400" /> Master Data</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola data dasar platform</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
              activeTab === tab ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-sm">Belum ada data {activeTab}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">No</th>
                  {renderTableHeaders()?.map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                  {(canEdit || canDelete) && <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                    <td className="px-4 py-3 text-gray-500 font-bold">{i + 1}</td>
                    {renderTableRow(item)}
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{editItem ? 'Edit' : 'Tambah'} {activeTab}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields()}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
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
