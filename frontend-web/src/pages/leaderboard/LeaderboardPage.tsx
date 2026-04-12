import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardApi } from '../../api/leaderboard';
import { ujianApi } from '../../api/ujian';
import type { LeaderboardEntry, Ujian, LeaderboardFormasiResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Trophy, 
  Medal, 
  Users, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Search,
  School,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type TabType = 'global' | 'formasi';

export default function LeaderboardPage() {
  const { user } = useAuth();
  
  // Selection State
  const [selectedUjianId, setSelectedUjianId] = useState<number | null>(null);
  const [ujianList, setUjianList] = useState<Ujian[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('global');
  
  // Data State
  const [globalData, setGlobalData] = useState<LeaderboardEntry[]>([]);
  const [formasiInfo, setFormasiInfo] = useState<LeaderboardFormasiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [formasiError, setFormasiError] = useState<string | null>(null);

  useEffect(() => {
    fetchUjianList();
  }, []);

  useEffect(() => {
    if (selectedUjianId) {
      if (activeTab === 'global') {
        fetchGlobal(selectedUjianId, currentPage);
      } else {
        fetchFormasi(selectedUjianId);
      }
    }
  }, [selectedUjianId, activeTab, currentPage]);

  const fetchUjianList = async () => {
    try {
      const res = await ujianApi.getList({ limit: 100 });
      setUjianList(res.data.data);
    } catch (err) {
      toast.error('Gagal mengambil daftar ujian');
    }
  };

  const fetchGlobal = async (ujianId: number, page: number) => {
    setIsLoading(true);
    try {
      const res = await leaderboardApi.getGlobal({ ujian_id: ujianId, page, limit: 10 });
      setGlobalData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      toast.error('Gagal mengambil data peringkat global');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormasi = async (ujianId: number) => {
    setIsLoading(true);
    setFormasiError(null);
    try {
      const res = await leaderboardApi.getFormasi(ujianId);
      setFormasiInfo(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setFormasiError('Lengkapi profil (instansi & formasi) untuk melihat peringkat pesaing Anda.');
      } else {
        toast.error('Gagal mengambil data peringkat formasi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDurasi = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}m ${s}s`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-sm font-extrabold text-gray-400">#{rank}</span>;
  };

  const renderTable = (entries: LeaderboardEntry[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Rank</th>
            <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Peserta</th>
            <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Skor Total</th>
            <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Detail Skor (TIU/TWK/TKP)</th>
            <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Status</th>
            <th className="px-8 py-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Durasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {entries.map((entry) => {
            const isMe = entry.user_id === user?.id;
            return (
              <tr 
                key={entry.user_id} 
                className={clsx(
                  "group transition-all",
                  isMe ? "bg-indigo-50/50" : "hover:bg-gray-50/50"
                )}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(entry.ranking)}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className={clsx("text-sm font-bold", isMe ? "text-indigo-600" : "text-gray-900")}>
                      {entry.user.biodata?.nama_lengkap || 'Peserta Anonim'}
                      {isMe && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-black uppercase tracking-tighter">Kamu</span>}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">ID: #{entry.user_id}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-lg font-black text-gray-900 tracking-tight">{entry.skor_total}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100">{entry.skor_tiu}</div>
                    <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100">{entry.skor_twk}</div>
                    <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100">{entry.skor_tkp}</div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  {entry.is_lulus ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Lulus</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">Gagal</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-xs font-bold text-gray-400">{formatDurasi(entry.durasi_detik)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-gray-200/60">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              Real-time Rankings
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">Leaderboard</h1>
            <p className="text-gray-500 font-medium text-lg">Lihat peringkatmu dibanding peserta lain secara global maupun se-formasi.</p>
          </div>

          <div className="w-full md:w-80 group">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block mb-2 group-focus-within:text-indigo-600 transition-colors">Pilih Ujian</label>
             <div className="relative">
                <select
                  value={selectedUjianId || ''}
                  onChange={(e) => {
                    setSelectedUjianId(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full pl-6 pr-12 py-4 bg-white border-2 border-gray-100 focus:border-indigo-500 rounded-3xl font-extrabold text-gray-800 outline-none transition-all appearance-none cursor-pointer shadow-sm shadow-gray-100/50"
                >
                  <option value="">— Pilih Ujian CPNS —</option>
                  {ujianList.map((u) => (
                    <option key={u.id} value={u.id}>{u.nama} ({u.tipe})</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <Search className="w-5 h-5" />
                </div>
             </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('global')}
            className={clsx(
              "px-8 py-4 rounded-3xl font-black text-sm tracking-wider uppercase transition-all flex items-center gap-3",
              activeTab === 'global' ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105" : "bg-white text-gray-400 border border-gray-100 hover:border-indigo-200 hover:text-indigo-500"
            )}
          >
            <Medal className="w-5 h-5" />
            Peringkat Global
          </button>
          <button
            onClick={() => setActiveTab('formasi')}
            className={clsx(
              "px-8 py-4 rounded-3xl font-black text-sm tracking-wider uppercase transition-all flex items-center gap-3",
              activeTab === 'formasi' ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105" : "bg-white text-gray-400 border border-gray-100 hover:border-indigo-200 hover:text-indigo-500"
            )}
          >
            <Users className="w-5 h-5" />
            Pesaing Formasi
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[400px]">
          {!selectedUjianId ? (
            <div className="flex flex-col items-center justify-center py-40 text-center px-10">
               <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                  <Trophy className="w-12 h-12" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Siap Untuk Bersaing?</h3>
               <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
                 Pilih salah satu paket ujian di atas untuk melihat bagan peringkat terbaru.
               </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
               <div className="relative">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  <div className="absolute inset-0 bg-indigo-600/10 blur-xl rounded-full" />
               </div>
               <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Data...</p>
            </div>
          ) : activeTab === 'formasi' && formasiError ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8">
                   <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Profil Belum Lengkap</h3>
                <p className="text-gray-500 max-w-sm mb-10 font-medium">
                  {formasiError}
                </p>
                <Link
                  to="/profil/edit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-3xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Lengkapi Biodata Sekarang
                </Link>
            </div>
          ) : activeTab === 'formasi' && formasiInfo ? (
            <div className="flex flex-col h-full">
               {/* Formasi Header Info */}
               <div className="p-10 bg-indigo-50/50 border-b border-indigo-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                        <School className="w-8 h-8 text-indigo-600" />
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-indigo-600/50 uppercase tracking-widest block mb-1">Instansi Utama</span>
                        <h4 className="text-xl font-black text-indigo-900 tracking-tight">{formasiInfo.info_formasi.instansi_nama}</h4>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 border-l-2 border-indigo-100 pl-8">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                        <Briefcase className="w-8 h-8 text-indigo-600" />
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-indigo-600/50 uppercase tracking-widest block mb-1">Jabatan Formasi</span>
                        <h4 className="text-xl font-black text-indigo-900 tracking-tight">{formasiInfo.info_formasi.formasi_nama}</h4>
                     </div>
                  </div>
                  <div className="px-8 py-4 bg-indigo-600 rounded-3xl text-center shadow-xl shadow-indigo-100">
                     <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Total Pesaing</span>
                     <span className="text-2xl font-black text-white">{formasiInfo.info_formasi.total_pesaing}</span>
                  </div>
               </div>
               {renderTable(formasiInfo.leaderboard)}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {renderTable(globalData)}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-10 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Halaman {currentPage} <span className="text-gray-200 mx-2">|</span> Total {totalPages}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 flex items-start gap-6">
           <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div className="space-y-1">
              <h5 className="font-black text-amber-900 uppercase tracking-wider text-sm">Catatan Penting</h5>
              <p className="text-amber-800 text-sm font-medium leading-relaxed">
                Leaderboard diperbarui setiap kali ada peserta yang menyelesaikan ujian. Jika terdapat skor yang sama, peringkat akan didasarkan pada durasi pengerjaan tercepat dan skor per kategori (TIU {'>'} TWK {'>'} TKP).
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
