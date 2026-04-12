import { useState, useEffect } from 'react';
import { adminDashboardApi } from '../../api/admin';
import { Users, BookOpen, FileText, Flag, GitPullRequest, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface DashboardSummary {
  totalUser: number;
  totalSoal: number;
  totalUjian: number;
  laporanPending: number;
  kontribusiPending: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminDashboardApi.getSummary();
      setData(res.data.data);
    } catch {
      setError('Gagal memuat data dashboard.');
      toast.error('Gagal mengambil data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const cards = [
    { label: 'Total User', value: data?.totalUser ?? 0, icon: Users, color: 'bg-blue-600', textColor: 'text-blue-400', bgLight: 'bg-blue-900/20' },
    { label: 'Total Soal', value: data?.totalSoal ?? 0, icon: BookOpen, color: 'bg-emerald-600', textColor: 'text-emerald-400', bgLight: 'bg-emerald-900/20' },
    { label: 'Total Ujian', value: data?.totalUjian ?? 0, icon: FileText, color: 'bg-purple-600', textColor: 'text-purple-400', bgLight: 'bg-purple-900/20' },
    { label: 'Laporan Pending', value: data?.laporanPending ?? 0, icon: Flag, color: 'bg-amber-600', textColor: 'text-amber-400', bgLight: 'bg-amber-900/20' },
    { label: 'Kontribusi Pending', value: data?.kontribusiPending ?? 0, icon: GitPullRequest, color: 'bg-orange-600', textColor: 'text-orange-400', bgLight: 'bg-orange-900/20' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-400 opacity-50" />
        <p className="text-gray-400 font-medium">{error}</p>
        <button
          onClick={fetchSummary}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">Ringkasan statistik platform CPNS Training</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", card.bgLight)}>
                <card.icon className={clsx("w-5 h-5", card.textColor)} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{card.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
