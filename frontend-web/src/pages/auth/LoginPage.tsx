import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Loader2, Landmark, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      setServerError('');
      await login(data.email, data.password);
      // PublicRoute will automatically redirect to /dashboard because useAuth state updates
      toast.success('Selamat datang kembali!');
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Terjadi kesalahan sistem';

      if (status === 401) {
        setServerError('Email atau kata sandi Anda salah.');
      } else if (status === 403) {
        setServerError('Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
      } else if (status === 429) {
        toast.error('Terlalu banyak percobaan. Silakan tunggu beberapa menit.');
      } else if (!err.response) {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      } else {
        setServerError(message);
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Brand/Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CPNS Training</h1>
          <p className="text-gray-500 mt-2 font-medium">Masuk untuk melanjutkan belajar</p>
        </div>

        {/* Card Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-100/50 border border-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">Selamat Datang</h2>
            <p className="text-sm text-gray-500">Silakan masukkan akun Anda</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                Alamat Email
              </label>
              <input
                type="email"
                autoFocus
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  Kata Sandi
                </label>
                <Link to="/forgot-password" title="Fitur belum tersedia" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
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
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-medium">Atau lanjutkan dengan</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Belum memiliki akun?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
