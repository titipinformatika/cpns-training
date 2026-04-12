import { useState } from 'react';
import { sosialApi } from '../api/sosial';
import { 
  X, 
  AlertTriangle, 
  Image as ImageIcon, 
  Loader2, 
  Send 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LaporanSoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  soalId: number;
}

const JENIS_LAPORAN = [
  { value: 'JAWABAN_SALAH', label: 'Jawaban Salah' },
  { value: 'SOAL_SALAH', label: 'Soal Salah' },
  { value: 'TYPO', label: 'Typo / Salah Ketik' },
  { value: 'PEMBAHASAN_SALAH', label: 'Pembahasan Salah' },
  { value: 'GAMBAR_RUSAK', label: 'Gambar Rusak' },
  { value: 'DUPLIKAT', label: 'Soal Duplikat' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

export default function LaporanSoalModal({ isOpen, onClose, soalId }: LaporanSoalModalProps) {
  const [jenisLaporan, setJenisLaporan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Format file harus .jpg atau .jpeg');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisLaporan) return toast.error('Pilih jenis laporan');
    if (deskripsi.length < 10) return toast.error('Deskripsi minimal 10 karakter');

    const formData = new FormData();
    formData.append('soal_id', String(soalId));
    formData.append('jenis_laporan', jenisLaporan);
    formData.append('deskripsi', deskripsi);
    if (selectedFile) {
      formData.append('bukti_screenshot', selectedFile);
    }

    setIsLoading(true);
    try {
      await sosialApi.kirimLaporan(formData);
      toast.success('Laporan berhasil dikirim!');
      onClose();
      // Reset form
      setJenisLaporan('');
      setDeskripsi('');
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      toast.error('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-red-50 px-8 py-6 flex items-center justify-between border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Laporkan Soal</h3>
              <p className="text-xs font-bold text-red-600/70 uppercase tracking-wider">ID Soal: #{soalId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Jenis Masalah</label>
            <select
              value={jenisLaporan}
              onChange={(e) => setJenisLaporan(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 focus:border-indigo-500 focus:bg-white rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
            >
              <option value="">— Pilih Jenis Laporan —</option>
              {JENIS_LAPORAN.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Deskripsi Detail</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan masalah yang ditemukan pada soal ini..."
              rows={4}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 focus:border-indigo-500 focus:bg-white rounded-3xl font-bold text-gray-700 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Bukti Screenshot (Opsional)</label>
            <div className="relative">
              <input
                type="file"
                accept=".jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="flex items-center justify-center gap-3 w-full px-5 py-6 border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-3xl cursor-pointer transition-all group"
              >
                <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                <span className="font-bold text-gray-500 group-hover:text-indigo-600">
                  {selectedFile ? selectedFile.name : 'Klik untuk pilih gambar (.jpg)'}
                </span>
              </label>
            </div>
            
            {preview && (
              <div className="mt-4 relative inline-block">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-24 w-auto rounded-2xl border border-gray-100 shadow-sm" 
                />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreview(null); }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isLoading ? 'Mengirim...' : 'Kirim Laporan Soal'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
