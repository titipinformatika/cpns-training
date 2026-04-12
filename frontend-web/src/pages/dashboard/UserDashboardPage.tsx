import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/user';
import type { DashboardStatistik } from '../../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Trophy, 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Award,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function UserDashboardPage() {
  const [stats, setStats] = useState<DashboardStatistik | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    fetchStatistik();
    setIsMounted(true);
  }, []);

  const fetchStatistik = async () => {
    setError(null);
    try {
      const res = await userApi.getStatistik();
      setStats(res.data.data);
    } catch (err) {
      setError('Gagal memuat data statistik. Silakan coba lagi.');
      toast.error('Gagal mengambil data statistik');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Mempersiapkan Dashboard..." />;
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <EmptyState
          title="Terjadi Kesalahan"
          description={error}
          icon={AlertCircle}
          actionLabel="Muat Ulang"
          actionHref="/dashboard"
        />
      </div>
    );
  }

  const cards = [
    { 
      label: 'Total Simulasi', 
      value: stats?.total_ujian || 0, 
      icon: <Activity className="w-6 h-6" />, 
      color: 'bg-blue-500',
      desc: 'Ujian yang diselesaikan'
    },
    { 
      label: 'Skor Tertinggi', 
      value: stats?.skor_tertinggi || 0, 
      icon: <Trophy className="w-6 h-6" />, 
      color: 'bg-amber-500',
      desc: 'Pencapaian terbaik Anda'
    },
    { 
      label: 'Rata-rata Skor', 
      value: Math.round(stats?.rata_rata_skor || 0), 
      icon: <Target className="w-6 h-6" />, 
      color: 'bg-indigo-500',
      desc: 'Konsistensi performa'
    },
    { 
      label: 'Kelulusan', 
      value: `${Math.round(stats?.persentase_lulus || 0)}%`, 
      icon: <Award className="w-6 h-6" />, 
      color: 'bg-emerald-500',
      desc: 'Persentase tembus PG'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ringkasan Performa</h1>
            <p className="text-gray-500 font-medium">Selamat datang kembali! Mari cek progres belajar Anda hari ini.</p>
          </div>
          <Link 
            to="/ujian"
            className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Zap className="w-5 h-5 fill-white" />
            Mulai Simulasi Baru
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex items-start justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="space-y-4 relative z-10">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", card.color)}>
                  {card.icon}
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                   <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                   <p className="text-[11px] font-bold text-gray-400 mt-1">{card.desc}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                 <div className="scale-[5]">
                    {card.icon}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Tren Skor</h3>
                    <p className="text-sm text-gray-400 font-bold">10 Simulasi Terakhir</p>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-gray-400 text-xs font-bold">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Live Analysis
                 </div>
              </div>

              <div className="h-[280px] w-full mt-auto">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.tren_skor || []}>
                      <defs>
                        <linearGradient id="colorSkor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="tanggal" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '20px',
                          border: 'none',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                          padding: '15px'
                        }}
                        itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                        labelStyle={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '5px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="skor" 
                        stroke="#4f46e5" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorSkor)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
           </div>

           {/* Quick Actions / Info Card */}
           <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col">
              <div className="relative z-10 space-y-8 h-full">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center">
                    <Calendar className="w-8 h-8" />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-xl font-bold tracking-tight leading-tight">Siap Untuk Seleksi CPNS 2024?</h3>
                    <p className="text-indigo-100 font-medium leading-relaxed">
                      Latihan secara rutin adalah kunci keberhasilan. Semakin sering Anda simulasi, semakin terbiasa dengan pola soal.
                    </p>
                 </div>
                 
                 <div className="pt-4 mt-auto">
                    <Link
                      to="/riwayat"
                      className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                      Cek Riwayat Lengkap
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                 </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl" />
           </div>
        </div>
      </div>
    </div>
  );
}
