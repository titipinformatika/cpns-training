import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/user';
import type { BiodataUser } from '../../types';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Edit3, 
  Key,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilPage() {
  const { user } = useAuth();
  const [biodata, setBiodata] = useState<BiodataUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBiodata() {
      try {
        const res = await userApi.getBiodata();
        setBiodata(res.data.data);
      } catch (err: any) {
        toast.error('Gagal mengambil data biodata');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBiodata();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat profil Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <UserIcon className="w-8 h-8 text-indigo-600" />
        Profil Saya
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 h-24"></div>
            <div className="p-6 pt-0 -mt-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg mb-4">
                <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.nama}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{user?.email}</span>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user?.kategori === 'PREMIUM' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.kategori} Account
                </span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link 
                to="/profil/password" 
                className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors py-2"
              >
                <Key className="w-4 h-4" />
                Ganti Kata Sandi
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Biodata Section */}
        <div className="lg:col-span-2 space-y-6">
          {!biodata ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AlertCircle className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Biodata Belum Lengkap</h3>
              <p className="text-indigo-700 mb-6 text-sm">Lengkapi data diri Anda untuk mendapatkan pengalaman belajar yang lebih personal dan akurat.</p>
              <Link 
                to="/profil/edit" 
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <Edit3 className="w-5 h-5" />
                Lengkapi Biodata Sekarang
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Biodata Lengkap</h3>
                  <p className="text-gray-500 text-sm mt-1">Informasi detail mengenai diri Anda</p>
                </div>
                <Link 
                  to="/profil/edit" 
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors bg-indigo-50 px-4 py-2 rounded-xl"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Link>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Section */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Pribadi</h4>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Nama Lengkap</p>
                      <p className="text-gray-900 font-semibold">{biodata.nama_lengkap || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Nomor HP</p>
                      <p className="text-gray-900 font-semibold">{biodata.no_hp || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Tgl Lahir / Kelamin</p>
                      <p className="text-gray-900 font-semibold">
                        {biodata.tanggal_lahir ? new Date(biodata.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                        <span className="mx-2 text-gray-300">|</span>
                        {biodata.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : biodata.jenis_kelamin === 'PEREMPUAN' ? 'Perempuan' : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Domisili</p>
                      <p className="text-gray-900 font-semibold">
                        {biodata.kota ? `${biodata.kota}, ` : ''}{biodata.provinsi || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pendidikan & Target</h4>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Latar Belakang Pendidikan</p>
                      <p className="text-gray-900 font-semibold">{biodata.tingkat_pendidikan?.nama || '-'} {biodata.jurusan?.nama || ''}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{biodata.nama_universitas || ''} {biodata.tahun_lulus ? `• Lulus ${biodata.tahun_lulus}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Instansi Target</p>
                      <p className="text-gray-900 font-semibold">{biodata.instansi?.nama || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Formasi Target</p>
                      <p className="text-gray-900 font-semibold">{biodata.formasi?.nama_jabatan || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
