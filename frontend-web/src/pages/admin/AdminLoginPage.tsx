import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
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
      toast.success('Selamat datang, Admin!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Terjadi kesalahan sistem';

      if (status === 401) {
        setServerError('Email atau kata sandi salah.');
      } else if (status === 403) {
        setServerError('Akun tidak memiliki akses admin.');
      } else if (status === 429) {
        toast.error('Terlalu banyak percobaan. Tunggu beberapa menit.');
      } else if (!err.response) {
        toast.error('Tidak dapat terhubung ke server.');
      } else {
        setServerError(message);
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">CPNS Training Platform</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Masuk sebagai Admin</h2>
            <p className="text-sm text-gray-400">Gunakan kredensial admin Anda</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                Email Admin
              </label>
              <input
                type="email"
                autoFocus
                placeholder="admin@cpns-training.com"
                className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-900/30 focus:border-emerald-500 outline-none transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-400 text-xs font-medium ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  className={`w-full px-4 py-2.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-900/30 focus:border-emerald-500 outline-none transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs font-medium ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="p-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-400 text-sm font-medium">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
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
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 CPNS Training Platform — Admin Area
        </p>
      </div>
    </div>
  );
}
