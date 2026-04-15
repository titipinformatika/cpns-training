import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/user';
import { masterApi, wilayahApi } from '../../api/master';
import { useMasterData } from '../../hooks/useMasterData';
import SearchableDropdown from '../../components/ui/SearchableDropdown';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Building2, 
  Briefcase,
  Info,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const biodataSchema = z.object({
  nama_lengkap: z.string().max(150, 'Maksimal 150 karakter').nullable(),
  no_hp: z.string().max(20, 'Maksimal 20 karakter').nullable(),
  tanggal_lahir: z.string().nullable(),
  jenis_kelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).nullable(),
  alamat: z.string().nullable(),
  provinsi_kode: z.string().nullable(),
  kota_kode: z.string().nullable(),
  tingkat_pendidikan_id: z.number().nullable(),
  jurusan_id: z.number().nullable(),
  nama_universitas: z.string().max(200).nullable(),
  tahun_lulus: z.number().nullable(),
  instansi_id: z.number().nullable(),
  formasi_id: z.number().nullable(),
});

type BiodataForm = z.infer<typeof biodataSchema>;

export default function EditBiodataPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formasiList, setFormasiList] = useState<any[]>([]);
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kotaList, setKotaList] = useState<any[]>([]);
  const [isLoadingFormasi, setIsLoadingFormasi] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState<{id: number, nama: string} | null>(null);

  const { data: pendidikanList } = useMasterData('pendidikan');
  const { data: instansiList } = useMasterData('instansi');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<BiodataForm>({
    resolver: zodResolver(biodataSchema),
    defaultValues: {
      nama_lengkap: '',
      no_hp: '',
      tanggal_lahir: '',
      jenis_kelamin: null,
      alamat: '',
      provinsi_kode: null,
      kota_kode: null,
      tingkat_pendidikan_id: null,
      jurusan_id: null,
      nama_universitas: '',
      tahun_lulus: null,
      instansi_id: null,
      formasi_id: null,
    }
  });

  const watchedInstansiId = watch('instansi_id');
  const watchedPendidikanId = watch('tingkat_pendidikan_id');
  const watchedProvinsiKode = watch('provinsi_kode');

  // Load existing biodata
  const loadData = async () => {
    setError(null);
    setInitialLoading(true);
    try {
      const res = await userApi.getBiodata();
      if (res.data.data) {
        const data = res.data.data;
        
        // Format date for input type="date"
        let formattedDate = '';
        if (data.tanggal_lahir) {
          formattedDate = new Date(data.tanggal_lahir).toISOString().split('T')[0];
        }

        reset({
          nama_lengkap: data.nama_lengkap || user?.nama || '',
          no_hp: data.no_hp,
          tanggal_lahir: formattedDate,
          jenis_kelamin: data.jenis_kelamin,
          alamat: data.alamat,
          provinsi_kode: data.provinsi_kode,
          kota_kode: data.kota_kode,
          tingkat_pendidikan_id: data.tingkat_pendidikan_id,
          jurusan_id: data.jurusan_id,
          nama_universitas: data.nama_universitas,
          tahun_lulus: data.tahun_lulus,
          instansi_id: data.instansi_id,
          formasi_id: data.formasi_id,
        });

        if (data.jurusan_id && data.jurusan) {
          setSelectedJurusan({ id: data.jurusan_id, nama: data.jurusan.nama });
        }
      } else {
        // Pre-fill name from registration for new biodata
        setValue('nama_lengkap', user?.nama || '');
      }
    } catch (err) {
      setError('Gagal memuat data lama. Silakan muat ulang halaman.');
      toast.error('Gagal memuat data lama');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const resProv = await wilayahApi.getProvinsi();
      setProvinsiList(resProv.data.data);
    } catch (err) {
      console.error('Gagal memuat data wilayah', err);
    }
  };

  useEffect(() => {
    loadData();
    loadMasterData();
  }, []);

  // Cascade Logic: Load Formasi when Instansi changes
  useEffect(() => {
    if (watchedInstansiId) {
      setIsLoadingFormasi(true);
      masterApi.getFormasi({ instansi_id: watchedInstansiId })
        .then(res => {
          setFormasiList(res.data.data);
        })
        .finally(() => {
          setIsLoadingFormasi(false);
        });
    } else {
      setFormasiList([]);
    }
  }, [watchedInstansiId]);

  // Reset Jurusan when Pendidikan changes
  useEffect(() => {
    if (initialLoading) return; // Skip during initial load
    setSelectedJurusan(null);
    setValue('jurusan_id', null);
  }, [watchedPendidikanId, setValue, initialLoading]);

  // Load Kota when Provinsi changes
  useEffect(() => {
    if (watchedProvinsiKode) {
      wilayahApi.getKota(watchedProvinsiKode)
        .then(res => setKotaList(res.data.data))
        .catch(err => console.error(err));
    } else {
      setKotaList([]);
    }
  }, [watchedProvinsiKode]);

  async function onSubmit(data: BiodataForm) {
    try {
      // Convert empty strings to null for backend
      const payload: any = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
      );

      // Convert tanggal_lahir to valid ISO-8601 Datetime string for strict backend validation
      if (payload.tanggal_lahir) {
        payload.tanggal_lahir = new Date(payload.tanggal_lahir).toISOString();
      }

      await userApi.upsertBiodata(payload);
      toast.success('Biodata berhasil disimpan!');
      navigate('/profil');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan biodata');
    }
  }

  if (initialLoading) {
    return <LoadingSpinner fullScreen text="Memuat biodata Anda..." />;
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <EmptyState
          title="Gagal Memuat Data"
          description={error}
          icon={AlertCircle}
          actionLabel="Coba Lagi"
          onClickAction={loadData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Profil
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card: Informasi Utama */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informasi Pribadi</h2>
              <p className="text-gray-500 text-sm">Data dasar identitas Anda</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Nama Lengkap
              </label>
              <input 
                type="text" 
                placeholder="Sesuaikan dengan KTP"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                {...register('nama_lengkap')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" /> Nomor HP
              </label>
              <input 
                type="text" 
                placeholder="Contoh: 0812..."
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                {...register('no_hp')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Tanggal Lahir
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                {...register('tanggal_lahir')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                Jenis Kelamin
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                {...register('jenis_kelamin')}
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Alamat Lengkap</label>
              <textarea 
                rows={3}
                placeholder="Masukkan alamat tinggal saat ini"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                {...register('alamat')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" /> Provinsi
              </label>
              <select
                {...register('provinsi_kode')}
                onChange={(e) => {
                  setValue('provinsi_kode', e.target.value || null);
                  setValue('kota_kode', null); // Reset kota
                }}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Pilih Provinsi</option>
                {provinsiList.map((p) => (
                  <option key={p.kode} value={p.kode}>{p.nama}</option>
                ))}
              </select>
              {errors.provinsi_kode && (
                <p className="text-xs text-red-500">{errors.provinsi_kode.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" /> Kota/Kabupaten
              </label>
              <select
                {...register('kota_kode')}
                disabled={!watchedProvinsiKode}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
              >
                <option value="">Pilih Kota/Kabupaten</option>
                {kotaList.map((k) => (
                  <option key={k.kode} value={k.kode}>{k.nama}</option>
                ))}
              </select>
              {errors.kota_kode && (
                <p className="text-xs text-red-500">{errors.kota_kode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card: Latar Belakang & Target */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden animate-in fade-in duration-500 delay-150">
          <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pendidikan & Target</h2>
              <p className="text-gray-500 text-sm">Sesuaikan simulasi dengan kualifikasi Anda</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Tingkat Pendidikan</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  onChange={(e) => setValue('tingkat_pendidikan_id', e.target.value ? Number(e.target.value) : null)}
                  value={watch('tingkat_pendidikan_id') || ''}
                >
                  <option value="">Pilih Pendidikan</option>
                  {pendidikanList.map(item => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Jurusan</label>
                <SearchableDropdown 
                  value={selectedJurusan}
                  onSelect={(item) => {
                    setSelectedJurusan(item);
                    setValue('jurusan_id', item?.id || null);
                  }}
                  placeholder="Cari jurusan..."
                  pendidikanId={watchedPendidikanId}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nama Universitas/Sekolah</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  {...register('nama_universitas')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Tahun Lulus</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 2024"
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  onChange={(e) => setValue('tahun_lulus', e.target.value ? Number(e.target.value) : null)}
                  value={watch('tahun_lulus') || ''}
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Cascade Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" /> Target Instansi
                </label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setValue('instansi_id', val);
                    setValue('formasi_id', null); // Reset formasi when instansi changes
                  }}
                  value={watch('instansi_id') || ''}
                >
                  <option value="">Pilih Instansi</option>
                  {instansiList.map(item => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" /> Target Formasi
                </label>
                <div className="relative">
                  <select 
                    disabled={!watchedInstansiId || isLoadingFormasi}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onChange={(e) => setValue('formasi_id', e.target.value ? Number(e.target.value) : null)}
                    value={watch('formasi_id') || ''}
                  >
                    <option value="">{isLoadingFormasi ? 'Memuat formasi...' : 'Pilih Formasi'}</option>
                    {formasiList.map(item => (
                      <option key={item.id} value={item.id}>{item.nama_jabatan}</option>
                    ))}
                  </select>
                  {!watchedInstansiId && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                      <Info className="w-3 h-3" />
                      Pilih Instansi Terlebih Dahulu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Simpan Biodata
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-2xl border border-gray-200 transition-all"
          >
            Batalkan
          </button>
        </div>
      </form>
    </div>
  );
}
