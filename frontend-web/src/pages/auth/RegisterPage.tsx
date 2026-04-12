import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, Loader2, Landmark } from 'lucide-react';

const registerSchema = z.object({
  nama: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      setServerError('');
      await authApi.register({
        nama: data.nama,
        email: data.email,
        password: data.password,
      });
      toast.success('Registrasi berhasil! Silakan login');
      navigate('/login');
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Terjadi kesalahan sistem';

      if (status === 409) {
        setError('email', { message: 'Email sudah terdaftar' });
      } else if (status === 429) {
        toast.error('Terlalu banyak percobaan. Silakan tunggu beberapa menit.');
      } else {
        setServerError(message);
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Brand/Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">CPNS Training</h1>
          <p className="text-gray-500 mt-2 font-medium">Persiapkan masa depan Anda hari ini</p>
        </div>

        {/* Card Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/50 border border-white p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Daftar Akun Baru</h2>
            <p className="text-sm text-gray-500">Lengkapi data di bawah untuk memulai</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input Nama */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Nama Lengkap
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Masukkan nama lengkap"
                className={`w-full px-4 py-2.5 bg-gray-50/50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 ${
                  errors.nama ? 'border-red-300 bg-red-50/10' : 'border-gray-200'
                }`}
                {...register('nama')}
              />
              {errors.nama && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.nama.message}</p>
              )}
            </div>

            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                Alamat Email
              </label>
              <input
                type="email"
                placeholder="contoh@email.com"
                className={`w-full px-4 py-2.5 bg-gray-50/50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 ${
                  errors.email ? 'border-red-300 bg-red-50/10' : 'border-gray-200'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Kata Sandi
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  className={`w-full px-4 py-2.5 bg-gray-50/50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50/10' : 'border-gray-200'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Konfirmasi Kata Sandi
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi"
                  className={`w-full px-4 py-2.5 bg-gray-50/50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50/10' : 'border-gray-200'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Global/Server Error */}
            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
                {serverError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
