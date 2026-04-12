import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, KeyRound, Save } from 'lucide-react';

const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Kata sandi lama wajib diisi'),
  new_password: z
    .string()
    .min(1, 'Kata sandi baru wajib diisi')
    .min(6, 'Kata sandi baru minimal 6 karakter')
    .max(100, 'Kata sandi baru maksimal 100 karakter'),
  confirm_new_password: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'Konfirmasi kata sandi tidak cocok',
  path: ['confirm_new_password'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordForm) {
    try {
      setServerError('');
      const res = await authApi.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success(res.data.message || 'Kata sandi berhasil diubah');
      navigate('/profil');
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Terjadi kesalahan sistem';

      if (status === 401) {
        setServerError('Kata sandi lama yang Anda masukkan tidak cocok.');
      } else {
        setServerError(message);
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <KeyRound className="w-6 h-6" />
                Ganti Kata Sandi
              </h1>
              <p className="text-indigo-100 mt-1">Ganti kata sandi Anda secara berkala untuk keamanan.</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                autoFocus
                placeholder="Masukkan kata sandi lama"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                  errors.old_password ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                }`}
                {...register('old_password')}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.old_password && (
              <p className="text-red-500 text-xs font-medium ml-1">{errors.old_password.message}</p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                  errors.new_password ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                }`}
                {...register('new_password')}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-red-500 text-xs font-medium ml-1">{errors.new_password.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Ulangi kata sandi baru"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all ${
                  errors.confirm_new_password ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                }`}
                {...register('confirm_new_password')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm_new_password && (
              <p className="text-red-500 text-xs font-medium ml-1">{errors.confirm_new_password.message}</p>
            )}
          </div>

          {/* Error Message */}
          {serverError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-shake">
              {serverError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl border border-gray-200 transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
