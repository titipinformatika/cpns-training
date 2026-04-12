import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ujianApi } from '../../api/ujian';
import { useAuth } from '../../contexts/AuthContext';
import type { Ujian } from '../../types';
import { 
  ClipboardList, 
  Timer, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Lock,
  Loader2,
  Trophy
} from 'lucide-react';
import clsx from 'clsx';

export default function DaftarUjianPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exams, setExams] = useState<Ujian[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { label: 'Semua', value: undefined },
    { label: 'Try Out', value: 'TRYOUT' },
    { label: 'Latihan', value: 'LATIHAN' },
    { label: 'Kuis', value: 'QUIZ' },
  ];

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      try {
        const res = await ujianApi.getList({ page, limit: 6, tipe: activeTab });
        setExams(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      } catch (err) {
        console.error('Gagal mengambil daftar ujian:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, [page, activeTab]);

  const handleTabChange = (val: string | undefined) => {
    setActiveTab(val);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
            Daftar Ujian
          </h1>
          <p className="text-gray-500 mt-2">Pilih simulasi ujian untuk mengasah kemampuan Anda</p>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.value)}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === tab.value 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : exams.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {exams.map((ujian) => {
              const isLocked = user?.kategori === 'FREE' && ujian.peruntukan === 'PREMIUM';
              
              return (
                <div 
                  key={ujian.id}
                  onClick={() => !isLocked && navigate(`/ujian/${ujian.id}`)}
                  className={clsx(
                    "group relative bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-100 transition-all duration-300 overflow-hidden",
                    isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 active:scale-[0.98]"
                  )}
                >
                  {/* Badge Peruntukan */}
                  <div className="absolute top-4 right-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border",
                      ujian.peruntukan === 'PREMIUM' 
                        ? "bg-amber-50 text-amber-600 border-amber-100" 
                        : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}>
                      {ujian.peruntukan === 'PREMIUM' && <Trophy className="w-3 h-3" />}
                      {ujian.peruntukan}
                    </span>
                  </div>

                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2">
                    {ujian.nama}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">
                    {ujian.deskripsi || 'Tidak ada deskripsi tersedia.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {ujian._count.ujian_soal} Soal
                    </div>
                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                    <div className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5" />
                      {ujian.durasi_menit} Menit
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    {isLocked ? (
                      <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 py-3 rounded-2xl text-sm font-extrabold transition-colors">
                        <Lock className="w-4 h-4" />
                        Upgrade ke Premium
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white py-3 rounded-2xl text-sm font-extrabold transition-all">
                        Mulai Ujian
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={clsx(
                      "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                      page === i + 1 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "bg-white border border-gray-100 text-gray-500 hover:border-indigo-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Ujian</h3>
          <p className="text-gray-500">Belum ada ujian dalam kategori ini yang tersedia saat ini.</p>
        </div>
      )}
    </div>
  );
}
