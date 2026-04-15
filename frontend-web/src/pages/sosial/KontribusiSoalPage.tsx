import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ImageIcon, 
  X, 
  AlertCircle, 
  Loader2, 
  Send, 
  ChevronRight,
  Plus,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { sosialApi } from '../../api/sosial';
import { masterApi } from '../../api/master';
import type { KategoriSoal, JenisSoal, KontribusiSoal } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';


const kontribusiSchema = z.object({
  kategori_soal_id: z.string().min(1, 'Kategori wajib dipilih'),
  jenis_soal_id: z.string().min(1, 'Jenis soal wajib dipilih'),
  level: z.string().min(1, 'Level wajib dipilih'),
  pertanyaan: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
  opsi_a: z.string().min(1, 'Opsi A wajib diisi'),
  opsi_b: z.string().min(1, 'Opsi B wajib diisi'),
  opsi_c: z.string().min(1, 'Opsi C wajib diisi'),
  opsi_d: z.string().min(1, 'Opsi D wajib diisi'),
  opsi_e: z.string().min(1, 'Opsi E wajib diisi'),
  jawaban_benar: z.string().optional(),
  skor_a: z.string().optional(),
  skor_b: z.string().optional(),
  skor_c: z.string().optional(),
  skor_d: z.string().optional(),
  skor_e: z.string().optional(),
  pembahasan: z.string().optional(),
}).refine(data => {
  const hasSkor = data.skor_a || data.skor_b || data.skor_c || data.skor_d || data.skor_e;
  const hasJawaban = !!data.jawaban_benar;
  return hasSkor || hasJawaban;
}, {
  message: 'Jawaban benar atau skor TKP harus diisi',
  path: ['jawaban_benar']
});

type KontribusiForm = z.infer<typeof kontribusiSchema>;

const LEVELS = [
  { value: 'MUDAH', label: 'Mudah' },
  { value: 'SEDANG', label: 'Sedang' },
  { value: 'SULIT', label: 'Sulit' },
  { value: 'HOST', label: 'HOTS (High Order Thinking Skills)' },
];

const OPSIS = ['A', 'B', 'C', 'D', 'E'];

export default function KontribusiSoalPage() {
  // Master Data
  const [kategoris, setKategoris] = useState<KategoriSoal[]>([]);
  const [jeniss, setJeniss] = useState<JenisSoal[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);

  // State for user's contribution list
  const [kontribusiList, setKontribusiList] = useState<KontribusiSoal[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Form State with react-hook-form
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<KontribusiForm>({
    resolver: zodResolver(kontribusiSchema),
    defaultValues: {
      kategori_soal_id: '',
      jenis_soal_id: '',
      level: undefined,
      pertanyaan: '',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      opsi_e: '',
      jawaban_benar: '',
      pembahasan: '',
    }
  });

  const watchedKategori = watch('kategori_soal_id');
  const watchedJawaban = watch('jawaban_benar');

  const isTKP = kategoris.find(k => k.id === Number(watchedKategori))?.kode === 'TKP';

  // Files State
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    pertanyaan_gambar: null,
    opsi_a_gambar: null,
    opsi_b_gambar: null,
    opsi_c_gambar: null,
    opsi_d_gambar: null,
    opsi_e_gambar: null,
    pembahasan_gambar: null,
  });

  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    fetchMasterData();
    fetchKontribusiList();
  }, []);

  const fetchMasterData = async () => {
    try {
      const resKat = await masterApi.getKategori();
      setKategoris(resKat.data.data);
    } catch (err) {
      toast.error('Gagal mengambil data master');
    } finally {
      setIsLoadingMaster(false);
    }
  };

  const fetchKontribusiList = async () => {
    setIsLoadingList(true);
    try {
      const res = await sosialApi.getRiwayatKontribusi({ page: 1, limit: 5 });
      setKontribusiList(res.data.data);
    } catch (err) {
      // Silent error for optional feature
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (watchedKategori) {
      fetchJenis(Number(watchedKategori));
    } else {
      setJeniss([]);
      setValue('jenis_soal_id', '');
    }
  }, [watchedKategori, setValue]);

  const fetchJenis = async (katId: number) => {
    try {
      const res = await masterApi.getJenisSoal({ kategori_id: katId });
      setJeniss(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil data jenis soal');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Gagal: Ukuran file maksimal 2MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Gagal: Format file harus .jpg atau .jpeg');
      return;
    }

    setFiles(prev => ({ ...prev, [key]: file }));
    setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const removeFile = (key: string) => {
    setFiles(prev => ({ ...prev, [key]: null }));
    if (previews[key]) {
      URL.revokeObjectURL(previews[key]!);
      setPreviews(prev => ({ ...prev, [key]: null }));
    }
  };

  const onSubmit = async (data: KontribusiForm) => {
    const submissionData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) submissionData.append(key, value.toString());
    });
    
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        submissionData.append(key, file);
      }
    });

    try {
      await sosialApi.kirimKontribusi(submissionData);
      toast.success('Terima kasih! Kontribusi Anda telah dikirim untuk direview.');
      reset();
      setPreviews({});
      fetchKontribusiList();
    } catch (err: any) {
      toast.error('Gagal mengirim kontribusi soal. Silakan cek kembali form Anda.');
    }
  };

  if (isLoadingMaster) {
    return <LoadingSpinner fullScreen text="Memuat data kategori..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold uppercase tracking-widest">
            <Plus className="w-3 h-3" />
            Social Contribution
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kontribusi Soal</h1>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed text-sm">
            Bantu sesama peserta dengan menambahkan bank soal berkualitas. Kontribusi Anda akan direview oleh admin.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card 1: Klasifikasi */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 p-6 md:p-8 overflow-hidden relative">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-extrabold">1</div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Klasifikasi Soal</h3>
                   <p className="text-sm text-gray-400">Tentukan kategori dan tingkat kesulitan soal</p>
                </div>
             </div>

             <div className="grid md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                 <select
                   {...register('kategori_soal_id')}
                   className={clsx(
                     "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer",
                     errors.kategori_soal_id ? "border-red-500 bg-red-50" : "border-transparent focus:border-indigo-500 focus:bg-white"
                   )}
                 >
                   <option value="">Pilih Kategori</option>
                   {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                 </select>
                 {errors.kategori_soal_id && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.kategori_soal_id.message}</p>}
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Jenis Soal</label>
                 <select
                   {...register('jenis_soal_id')}
                   disabled={!watchedKategori}
                   className={clsx(
                     "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50",
                     errors.jenis_soal_id ? "border-red-500 bg-red-50" : "border-transparent focus:border-indigo-500 focus:bg-white"
                   )}
                 >
                   <option value="">Pilih Jenis</option>
                   {jeniss.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
                 </select>
                 {errors.jenis_soal_id && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.jenis_soal_id.message}</p>}
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Level</label>
                 <select
                   {...register('level')}
                   className={clsx(
                     "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer",
                     errors.level ? "border-red-500 bg-red-50" : "border-transparent focus:border-indigo-500 focus:bg-white"
                   )}
                 >
                   <option value="">Pilih Level</option>
                   {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                 </select>
                 {errors.level && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.level.message}</p>}
               </div>
             </div>
          </div>

          {/* Card 2: Pertanyaan */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 p-6 md:p-8">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-extrabold">2</div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Detail Pertanyaan</h3>
                   <p className="text-sm text-gray-400">Tulis teks pertanyaan dan tambahkan gambar jika perlu</p>
                </div>
             </div>

             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Teks Pertanyaan</label>
                 <textarea
                   {...register('pertanyaan')}
                   placeholder="Misal: Sinonim dari kata 'Egois' adalah..."
                   rows={5}
                   className={clsx(
                     "w-full px-5 py-4 bg-gray-50 border-2 rounded-3xl font-bold text-gray-700 outline-none transition-all resize-none",
                     errors.pertanyaan ? "border-red-500 bg-red-50" : "border-transparent focus:border-indigo-500 focus:bg-white"
                   )}
                 />
                 {errors.pertanyaan && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.pertanyaan.message}</p>}
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Gambar Pendukung (Opsional)</label>
                 <div className="flex flex-wrap gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, 'pertanyaan_gambar')}
                        className="hidden"
                        id="pertanyaan-img"
                      />
                      <label
                        htmlFor="pertanyaan-img"
                        className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-3xl cursor-pointer transition-all group"
                      >
                        <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-indigo-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 uppercase">Input Foto</span>
                      </label>
                    </div>

                    {previews.pertanyaan_gambar && (
                      <div className="relative w-32 h-32">
                        <img 
                          src={previews.pertanyaan_gambar} 
                          className="w-full h-full object-cover rounded-3xl border border-gray-100 shadow-sm" 
                        />
                        <button 
                          type="button"
                          onClick={() => removeFile('pertanyaan_gambar')}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                 </div>
               </div>
             </div>
          </div>

          {/* Card 3: Opsi Jawaban */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 p-6 md:p-8">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-extrabold">3</div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Opsi Jawaban</h3>
                   <p className="text-sm text-gray-400">Isi semua pilihan jawaban dan pilih yang paling benar</p>
                </div>
             </div>

             <div className="space-y-6">
                {OPSIS.map(opt => {
                  const fieldName = `opsi_${opt.toLowerCase()}` as keyof KontribusiForm;
                  return (
                    <div key={opt} className="space-y-1">
                      <div className="flex items-center gap-4">
                        <span className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all shrink-0",
                          watchedJawaban === opt ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          {opt}
                        </span>
                        <input
                          type="text"
                          {...register(fieldName)}
                          placeholder={`Teks Opsi ${opt}`}
                          className={clsx(
                            "flex-1 px-5 py-4 bg-gray-50 border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all",
                            errors[fieldName] ? "border-red-500 bg-red-50" : "border-transparent focus:border-indigo-500 focus:bg-white"
                          )}
                        />

                        {isTKP && (
                          <input
                            type="number"
                            min={1}
                            max={5}
                            {...register(`skor_${opt.toLowerCase()}` as any)}
                            placeholder="Skor"
                            className="w-20 px-3 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-bold text-emerald-700 placeholder:text-emerald-300 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                          />
                        )}
                        
                        <input
                          type="file"
                          accept=".jpg,.jpeg"
                          onChange={(e) => handleFileChange(e, `opsi_${opt.toLowerCase()}_gambar`)}
                          className="hidden"
                          id={`opsi-${opt}-img`}
                        />
                        <label
                          htmlFor={`opsi-${opt}-img`}
                          className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl cursor-pointer transition-all"
                          title="Tambah Gambar"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </label>
                      </div>
                      {errors[fieldName] && <p className="text-red-500 text-[10px] font-bold ml-14">{errors[fieldName]?.message}</p>}
                      {previews[`opsi_${opt.toLowerCase()}_gambar`] && (
                        <div className="ml-14 relative inline-block">
                          <img 
                            src={previews[`opsi_${opt.toLowerCase()}_gambar`]!} 
                            className="h-16 w-auto rounded-xl border border-gray-100 shadow-sm" 
                          />
                          <button 
                            type="button"
                            onClick={() => removeFile(`opsi_${opt.toLowerCase()}_gambar`)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                 {!isTKP ? (
                   <div className="pt-6 border-t border-gray-100 space-y-4">
                     <div className="flex items-center gap-2">
                       <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                       <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Jawaban Benar</label>
                     </div>
                     <div className="flex flex-wrap gap-3">
                       {OPSIS.map(opt => (
                         <button
                           key={opt}
                           type="button"
                           onClick={() => setValue('jawaban_benar', opt, { shouldValidate: true })}
                           className={clsx(
                             "w-14 h-14 rounded-2xl font-extrabold transition-all border-2",
                             watchedJawaban === opt 
                               ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 scale-110" 
                               : "bg-gray-50 border-transparent text-gray-400 hover:border-emerald-200"
                           )}
                         >
                           {opt}
                         </button>
                       ))}
                     </div>
                     {errors.jawaban_benar && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.jawaban_benar.message}</p>}
                   </div>
                 ) : (
                   <div className="pt-6 border-t border-gray-100">
                     <div className="flex items-center gap-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <AlertCircle className="w-4 h-4 text-emerald-600" />
                        <p className="text-[10px] font-bold text-emerald-900 leading-tight">
                          Mode TKP Aktif: Masukkan skor 1-5 untuk setiap pilihan jawaban.
                        </p>
                     </div>
                   </div>
                 )}
             </div>
          </div>

          {/* Card 4: Pembahasan */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 p-6 md:p-8">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-extrabold">4</div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Pembahasan (Opsional)</h3>
                   <p className="text-sm text-gray-400">Jelaskan mengapa kunci jawaban tersebut benar</p>
                </div>
             </div>

             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Teks Pembahasan</label>
                 <textarea
                   {...register('pembahasan')}
                   placeholder="Tulis alasan atau rumus penyelesaian..."
                   rows={4}
                   className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl font-bold text-gray-700 outline-none transition-all resize-none"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Gambar Pembahasan</label>
                 <div className="flex flex-wrap gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, 'pembahasan_gambar')}
                        className="hidden"
                        id="pembahasan-img"
                      />
                      <label
                        htmlFor="pembahasan-img"
                        className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-3xl cursor-pointer transition-all group"
                      >
                        <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-indigo-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 uppercase">Input Foto</span>
                      </label>
                    </div>

                    {previews.pembahasan_gambar && (
                      <div className="relative w-32 h-32">
                        <img 
                          src={previews.pembahasan_gambar} 
                          className="w-full h-full object-cover rounded-3xl border border-gray-100 shadow-sm" 
                        />
                        <button 
                          type="button"
                          onClick={() => removeFile('pembahasan_gambar')}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                 </div>
               </div>
             </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
             <div className="flex items-center gap-4 bg-amber-50 px-5 py-3 rounded-xl border border-amber-100 max-w-md">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                   <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold text-amber-900 leading-tight">
                   Segala bentuk kontribusi akan ditinjau secara manual oleh Admin. Gunakan data yang valid untuk menghindari penghapusan akun.
                </p>
             </div>

             <button
               type="submit"
               disabled={isSubmitting}
               className="group relative inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 overflow-hidden"
             >
               <div className="relative z-10 flex items-center gap-3">
                 {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                 <span>{isSubmitting ? 'Memproses...' : 'Kirim Kontribusi'}</span>
                 {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
           </div>
         </form>

         {/* Daftar Soal yang Sudah Dikontribusikan */}
         <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden mt-8">
           <div className="p-5 border-b border-gray-100 flex items-center justify-between">
             <div>
               <h3 className="text-lg font-bold text-gray-900">Soal Terbaru Anda</h3>
               <p className="text-sm text-gray-500">5 kontribusi terakhir yang Anda kirimkan</p>
             </div>
             <Link
               to="/kontribusi/riwayat"
               className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
             >
               Lihat Semua →
             </Link>
           </div>

           {isLoadingList ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
             </div>
           ) : kontribusiList.length === 0 ? (
             <div className="text-center py-12 text-gray-400">
               <Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="font-medium text-sm">Belum ada kontribusi</p>
               <p className="text-xs mt-1">Isi form di atas untuk mulai berkontribusi!</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="border-b border-gray-50 bg-gray-50/50">
                     <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">No</th>
                     <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Pertanyaan</th>
                     <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                     <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Level</th>
                     <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {kontribusiList.map((item, i) => (
                     <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-5 py-4 text-gray-400 font-bold">{i + 1}</td>
                       <td className="px-5 py-4 max-w-xs">
                         <p className="font-medium text-gray-800 truncate">{item.pertanyaan}</p>
                       </td>
                       <td className="px-5 py-4">
                         <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                           {item.kategori_soal?.nama || '-'}
                         </span>
                       </td>
                       <td className="px-5 py-4">
                         <span className={clsx(
                           "text-[10px] font-bold px-2 py-1 rounded-lg",
                           item.level === 'MUDAH' && "bg-emerald-50 text-emerald-600",
                           item.level === 'SEDANG' && "bg-amber-50 text-amber-600",
                           item.level === 'SULIT' && "bg-red-50 text-red-600",
                           item.level === 'HOST' && "bg-purple-50 text-purple-600",
                         )}>
                           {item.level === 'HOST' ? 'HOTS' : item.level}
                         </span>
                       </td>
                       <td className="px-5 py-4">
                         <span className={clsx(
                           "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                           item.status === 'PENDING' && "bg-yellow-50 text-yellow-600",
                           item.status === 'APPROVED' && "bg-emerald-50 text-emerald-600",
                           item.status === 'REJECTED' && "bg-red-50 text-red-600",
                         )}>
                           {item.status === 'PENDING' ? 'Menunggu' : item.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
