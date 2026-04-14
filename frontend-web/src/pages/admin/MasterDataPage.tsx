import { useState, useEffect } from 'react';
import { masterApi, wilayahApi } from '../../api/master';
import { adminMasterApi } from '../../api/admin';
import { Plus, Pencil, Trash2, Loader2, X, AlertCircle, Database, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const TABS = ['Kategori Soal', 'Jenis Soal', 'Pendidikan', 'Jurusan', 'Instansi', 'Formasi'] as const;
type TabName = typeof TABS[number];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabName>('Kategori Soal');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Extra data for dropdowns
  const [kategoris, setKategoris] = useState<any[]>([]);
  const [instansis, setInstansis] = useState<any[]>([]);
  const [pendidikans, setPendidikans] = useState<any[]>([]);
  const [jurusans, setJurusans] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit };
      let res;
      switch (activeTab) {
        case 'Kategori Soal': res = await masterApi.getKategori(params); break;
        case 'Jenis Soal': res = await masterApi.getJenisSoal(params); break;
        case 'Pendidikan': res = await masterApi.getPendidikan(params); break;
        case 'Jurusan': res = await masterApi.getJurusan(params); break;
        case 'Instansi': res = await masterApi.getInstansi(params); break;
        case 'Formasi': res = await masterApi.getFormasi(params); break;
      }
      setData(res?.data?.data || []);
      setTotalPages(res?.data?.meta?.totalPages || 1);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  // Handle cascading dropdowns
  useEffect(() => {
    if (activeTab === 'Jenis Soal' && kategoris.length === 0) {
      masterApi.getKategori({ limit: 100 }).then(r => setKategoris(r.data.data));
    }
    if (activeTab === 'Jurusan' && pendidikans.length === 0) {
      masterApi.getPendidikan({ limit: 100 }).then(r => setPendidikans(r.data.data));
    }
    if (activeTab === 'Formasi') {
      if (instansis.length === 0) masterApi.getInstansi({ limit: 100 }).then(r => setInstansis(r.data.data));
      if (pendidikans.length === 0) masterApi.getPendidikan({ limit: 100 }).then(r => setPendidikans(r.data.data));
      if (provinces.length === 0) wilayahApi.getProvinsi().then(r => setProvinces(r.data.data));
    }
  }, [activeTab]);

  // Fetch cities when province changes in Formasi form
  useEffect(() => {
    if (activeTab === 'Formasi' && formData.provinsi_kode) {
      wilayahApi.getKota(formData.provinsi_kode).then(r => setCities(r.data.data));
    } else {
      setCities([]);
    }
  }, [formData.provinsi_kode]);

  // Fetch majors when education level changes in Formasi form
  useEffect(() => {
    if (activeTab === 'Formasi' && formData.tingkat_pendidikan_id) {
      masterApi.getJurusan({ pendidikan_id: formData.tingkat_pendidikan_id, limit: 200 }).then(r => setJurusans(r.data.data));
    } else {
      setJurusans([]);
    }
  }, [formData.tingkat_pendidikan_id]);

  // Fetch instansi when jenis_instansi changes in Formasi form
  useEffect(() => {
    if (activeTab === 'Formasi') {
      const params: any = { limit: 100 };
      if (formData.jenis_instansi) {
        params.jenis = formData.jenis_instansi;
      }
      masterApi.getInstansi(params).then(r => setInstansis(r.data.data));
    }
  }, [formData.jenis_instansi, activeTab]);

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

   const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      switch (activeTab) {
        case 'Kategori Soal': await adminMasterApi.deleteKategori(deleteId); break;
        case 'Jenis Soal': await adminMasterApi.deleteJenis(deleteId); break;
        case 'Pendidikan': await adminMasterApi.deletePendidikan(deleteId); break;
        case 'Jurusan': await adminMasterApi.deleteJurusan(deleteId); break;
        case 'Instansi': await adminMasterApi.deleteInstansi(deleteId); break;
        case 'Formasi': await adminMasterApi.deleteFormasi(deleteId); break;
        default: return;
      }
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Gagal menghapus data';
      if (status === 409) {
        setWarningMsg(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

   const cleanFormasiPayload = (data: any) => {
    const { jenis_instansi, ...payload } = data;
    // Map empty strings to null for optional fields and ensure numbers
    const numFields = ['instansi_id', 'jumlah_formasi', 'tingkat_pendidikan_id', 'jurusan_id', 'gaji_min', 'gaji_max'];
    const optionalFields = ['tingkat_pendidikan_id', 'jurusan_id', 'provinsi_kode', 'kota_kode', 'gaji_min', 'gaji_max'];

    const result = { ...payload };
    for (const field of numFields) {
      if (result[field] !== undefined && result[field] !== null && result[field] !== '') {
        result[field] = Number(result[field]);
      }
    }
    for (const field of optionalFields) {
      if (result[field] === '' || result[field] === undefined) {
        result[field] = null;
      }
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation for Formasi
    if (activeTab === 'Formasi') {
      if (!formData.instansi_id) {
        toast.error('Instansi wajib dipilih');
        return;
      }
      if (!formData.nama_jabatan?.trim()) {
        toast.error('Nama jabatan wajib diisi');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editItem) {
        // Update
        switch (activeTab) {
          case 'Kategori Soal': await adminMasterApi.updateKategori(editItem.id, formData); break;
          case 'Jenis Soal': await adminMasterApi.updateJenis(editItem.id, formData); break;
          case 'Pendidikan': await adminMasterApi.updatePendidikan(editItem.id, formData); break;
          case 'Jurusan': await adminMasterApi.updateJurusan(editItem.id, formData); break;
          case 'Instansi': await adminMasterApi.updateInstansi(editItem.id, formData); break;
          case 'Formasi': {
            const cleanPayload = cleanFormasiPayload(formData);
            await adminMasterApi.updateFormasi(editItem.id, cleanPayload); 
            break;
          }
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
          case 'Formasi': {
            const cleanPayload = cleanFormasiPayload(formData);
            await adminMasterApi.createFormasi(cleanPayload); 
            break;
          }
        }
        toast.success('Data berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      const resData = err.response?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
        const details = resData.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        toast.error(`Validasi gagal:\n${details}`, { duration: 5000 });
      } else {
        toast.error(resData?.message || 'Terjadi kesalahan pada server');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = ['Kategori Soal', 'Jenis Soal', 'Pendidikan', 'Jurusan', 'Instansi', 'Formasi'].includes(activeTab);
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

    const select = (label: string, key: string, options: { value: any; label: string }[], required = true) => (
      <div key={key}>
        <label className="block text-xs font-bold text-gray-400 mb-1">{label}</label>
        <select
          value={formData[key] || ''}
          onChange={e => {
            if (e.target.value === '') {
              setFormData({ ...formData, [key]: null });
            } else {
              const selectedOpt = options.find(o => String(o.value) === e.target.value);
              setFormData({ ...formData, [key]: selectedOpt ? selectedOpt.value : e.target.value });
            }
          }}
          required={required}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        >
          <option value="">Pilih...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );

    const JENIS_INSTANSI_OPTS = [
      { value: 'KEMENTERIAN', label: 'KEMENTERIAN' },
      { value: 'LEMBAGA_NON_KEMENTERIAN', label: 'Lembaga Pemerintah Non-Kementerian' },
      { value: 'PEMDA_PROVINSI', label: 'Instansi Pemerintah Daerah (Provinsi)' },
      { value: 'PEMDA_KAB_KOTA', label: 'Instansi Pemerintah Daerah (Kab/Kota)' },
      { value: 'INSTANSI_VERTIKAL', label: 'Instansi Vertikal' },
      { value: 'LEMBAGA_NEGARA_INDEPENDEN', label: 'Lembaga Negara Independen' },
    ];

    switch (activeTab) {
      case 'Kategori Soal':
        return <>{input('Kode', 'kode')}{input('Nama', 'nama')}{input('Deskripsi', 'deskripsi', 'text', false)}{input('Passing Grade', 'passing_grade', 'number')}</>;
      case 'Jenis Soal':
        return <>{select('Kategori Soal', 'kategori_soal_id', kategoris.map(k => ({ value: k.id, label: k.nama })))}{input('Nama', 'nama')}{input('Deskripsi', 'deskripsi', 'text', false)}</>;
      case 'Pendidikan':
        return <>{input('Nama', 'nama')}{input('Urutan', 'urutan', 'number')}</>;
      case 'Jurusan':
        return <>{select('Tingkat Pendidikan', 'tingkat_pendidikan_id', pendidikans.map(p => ({ value: p.id, label: p.nama })), false)}{input('Nama', 'nama')}{input('Rumpun', 'rumpun', 'text', false)}</>;
      case 'Instansi':
        return <>{input('Nama', 'nama')}{input('Singkatan', 'singkatan', 'text', false)}{select('Jenis', 'jenis', JENIS_INSTANSI_OPTS)}</>;
      case 'Formasi':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">{select('Jenis Instansi (Filter)', 'jenis_instansi', JENIS_INSTANSI_OPTS, false)}</div>
            <div className="col-span-2">{select('Instansi', 'instansi_id', instansis.map(i => ({ value: i.id, label: i.nama })))}</div>
            <div className="col-span-2">{input('Nama Jabatan', 'nama_jabatan')}</div>
            {select('Pendidikan', 'tingkat_pendidikan_id', pendidikans.map(p => ({ value: p.id, label: p.nama })), false)}
            {select('Jurusan', 'jurusan_id', jurusans.map(j => ({ value: j.id, label: j.nama })), false)}
            {select('Provinsi', 'provinsi_kode', provinces.map(p => ({ value: p.kode, label: p.nama })), false)}
            {select('Kota/Kabupaten', 'kota_kode', cities.map(c => ({ value: c.kode, label: c.nama })), false)}
            {input('Jumlah Formasi', 'jumlah_formasi', 'number')}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {input('Gaji Min', 'gaji_min', 'number', false)}
              {input('Gaji Max', 'gaji_max', 'number', false)}
            </div>
          </div>
        );
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
      case 'Jenis Soal': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-emerald-400">{item.kategori?.nama || item.kategori_id}</span></td></>;
      case 'Pendidikan': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3">{item.urutan}</td></>;
      case 'Jurusan': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3 text-gray-500 text-xs">{item.tingkat_pendidikan?.nama || '-'}</td></>;
      case 'Instansi': return <><td className="px-4 py-3">{item.nama}</td><td className="px-4 py-3 text-gray-400">{item.singkatan || '-'}</td><td className="px-4 py-3 text-gray-400 text-xs">{item.jenis?.replace(/_/g, ' ') || '-'}</td></>;
      case 'Formasi': 
        return (
          <>
            <td className="px-4 py-3">
              <div className="text-white">{item.nama_jabatan}</div>
              <div className="text-[10px] text-emerald-500 font-bold uppercase">{item.instansi?.nama}</div>
            </td>
            <td className="px-4 py-3">
              <div className="text-xs text-gray-400">{item.tingkat_pendidikan?.nama || '-'}</div>
              <div className="text-[10px] text-gray-500">{item.jurusan?.nama || '-'}</div>
            </td>
            <td className="px-4 py-3">{item.jumlah_formasi}</td>
            <td className="px-4 py-3">
              <div className="text-xs text-gray-400">{item.kota?.nama || '-'}</div>
              <div className="text-[10px] text-gray-500">{item.provinsi?.nama || '-'}</div>
            </td>
          </>
        );
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
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
          isLoading={isLoading} 
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Hapus Data?"
        description="Yakin hapus data ini? Tindakan tidak bisa dikembalikan."
        variant="danger"
        confirmLabel="Ya, Hapus"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteId(null)}
      />

      {/* Warning Dialog (Relation Conflict) */}
      <ConfirmDialog
        isOpen={!!warningMsg}
        title="Tidak Dapat Menghapus!"
        description={warningMsg}
        variant="warning"
        confirmLabel="Mengerti"
        onConfirm={() => setWarningMsg('')}
        onCancel={() => setWarningMsg('')}
      />
    </div>
  );
}
