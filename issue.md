# Perbaikan Halaman Simulasi Ujian Menjadi Tampilan CAT Modern

Issue ini dibuat agar AI asisten developer (AI murah) atau programmer pemula dapat mengimplementasikan tampilan baru pada Simulasi CAT. 

> **Instruksi untuk AI / Developer:**
> Tugas utama Anda adalah **MENGGANTI KESELURUHAN ISI FILE** `frontend-web/src/pages/ujian/SimulasiUjianPage.tsx` dengan **Kode Implementasi Penuh** yang ada di bagian bawah *issue* ini. Jangan merombak sepotong-sepotong, cukup *copy* semua kode di bawah dan *paste* ke file asli.

## Rincian Perubahan yang Ada di Kode Ini:
1. **Penggabungan State Lama & Baru**: Mempertahankan `examData`, `sisaWaktu`, `heartbeatInterval`, dan logika API `ujianApi.jawab()` / `selesai()`.
2. **Perubahan Mode Tampilan Navigasi**: Beralih dari "soal-satu-per-satu" (dengan `currentIndex`) ke tampilan **"Long Scroll"** yang memuat seluruh soal sekaligus, dipecah berdasar subkategori (TWK, TIU, TKP).
3. **Scroll Spy / Tracking**: Memasang tracking scroll pada Ref container utama (`mainRef`) agar Navigasi di sidebar kiri dapat menyala (highlight) sesuai posisi soal yang sedang dibaca di layar.
4. **Palet Warna Kategori (CATEGORY_CONFIG)**: Menanamkan mapping styling statik (Tailwind classes) untuk membedakan mood antar kategori tes.

---

## Kode Implementasi Penuh

Hapus semua isi file `frontend-web/src/pages/ujian/SimulasiUjianPage.tsx` Anda saat ini, lalu masukkan (*copy-paste*) kode secara utuh berikut:

```tsx
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ujianApi } from '../../api/ujian';
import type { MulaiUjianResponse, SoalSimulasi } from '../../types';
import { 
  Flag,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Menu,
  X,
  ChevronUp,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_CONFIG = {
  TWK: {
    fullLabel: "Tes Wawasan Kebangsaan",
    gradient: "from-violet-600 to-indigo-600",
    headerBg: "bg-gradient-to-r from-violet-600 to-indigo-600",
    lightBg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    selectedBorder: "border-violet-500 bg-violet-50",
    selectedKey: "bg-violet-600 text-white",
    check: "text-violet-500",
    navActive: "bg-violet-600 text-white",
    navBg: "bg-violet-50",
    navText: "text-violet-700",
    navHeader: "bg-violet-600",
  },
  TIU: {
    fullLabel: "Tes Intelegensi Umum",
    gradient: "from-cyan-600 to-teal-600",
    headerBg: "bg-gradient-to-r from-cyan-600 to-teal-600",
    lightBg: "bg-cyan-50",
    border: "border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700",
    dot: "bg-cyan-500",
    selectedBorder: "border-cyan-500 bg-cyan-50",
    selectedKey: "bg-cyan-600 text-white",
    check: "text-cyan-500",
    navActive: "bg-cyan-600 text-white",
    navBg: "bg-cyan-50",
    navText: "text-cyan-700",
    navHeader: "bg-cyan-600",
  },
  TKP: {
    fullLabel: "Tes Karakteristik Pribadi",
    gradient: "from-amber-500 to-orange-500",
    headerBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    selectedBorder: "border-amber-500 bg-amber-50",
    selectedKey: "bg-amber-500 text-white",
    check: "text-amber-500",
    navActive: "bg-amber-500 text-white",
    navBg: "bg-amber-50",
    navText: "text-amber-700",
    navHeader: "bg-amber-500",
  },
} as const;

export default function SimulasiUjianPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Core Data
  const [examData, setExamData] = useState<MulaiUjianResponse | null>(null);
  const [soalList, setSoalList] = useState<SoalSimulasi[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [raguList, setRaguList] = useState<Set<number>>(new Set());
  const [sisaWaktu, setSisaWaktu] = useState(0);
  const maxWaktu = useRef(6000); // For progress bar fallback
  
  // UI State
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Refs
  const lastSavedAnswer = useRef<Map<number, string>>(new Map());
  const heartbeatInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const mainRef = useRef<HTMLDivElement>(null);

  // Derived Categories
  const categoriesPresent = useMemo(() => {
    return Array.from(new Set(soalList.map(s => s.kategori_soal.kode)));
  }, [soalList]);

  // Load Data
  useEffect(() => {
    const rawData = sessionStorage.getItem('simulasi_data');
    if (!rawData) {
      toast.error('Data simulasi tidak ditemukan');
      navigate('/ujian');
      return;
    }

    try {
      const data: MulaiUjianResponse = JSON.parse(rawData);
      setExamData(data);
      setSoalList(data.soal_list);
      setSisaWaktu(data.sisa_waktu_detik);
      maxWaktu.current = data.sisa_waktu_detik > 6000 ? data.sisa_waktu_detik : Math.max(data.sisa_waktu_detik, 6000);
      
      if (data.soal_list.length > 0) {
        setActiveQuestionId(data.soal_list[0].ujian_soal_id);
      }
      
      const backupAnswers = sessionStorage.getItem(`answers_${data.hasil_ujian_id}`);
      if (backupAnswers) {
        setAnswers(new Map(JSON.parse(backupAnswers)));
        lastSavedAnswer.current = new Map(JSON.parse(backupAnswers));
      }

      const backupRagu = sessionStorage.getItem(`ragu_${data.hasil_ujian_id}`);
      if (backupRagu) {
        setRaguList(new Set(JSON.parse(backupRagu)));
      }
    } catch (err) {
      toast.error('Format data simulasi tidak valid');
      navigate('/ujian');
    }
  }, [navigate]);

  // Timer
  useEffect(() => {
    if (sisaWaktu <= 0) return;
    timerInterval.current = setInterval(() => {
      setSisaWaktu(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 300) toast('⚠️ Sisa waktu 5 menit!', { icon: '⏳' });
        if (prev === 60) toast.error('⚠️ Sisa waktu 1 menit!');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, [sisaWaktu === 0]); 

  // Heartbeat
  useEffect(() => {
    if (!examData) return;
    heartbeatInterval.current = setInterval(async () => {
      try {
        const res = await ujianApi.heartbeat(examData.hasil_ujian_id);
        const { sisa_waktu_detik, status } = res.data.data;
        if (status === 'TIMEOUT' || status === 'SELESAI') {
          clearInterval(heartbeatInterval.current);
          handleAutoSubmit();
          return;
        }
        setSisaWaktu(sisa_waktu_detik);
      } catch (err) {
        console.error('Heartbeat failed');
      }
    }, 30000);
    return () => clearInterval(heartbeatInterval.current);
  }, [examData]);

  // Scroll Tracker
  useEffect(() => {
    const el = mainRef.current;
    if (!el || soalList.length === 0) return;
    const onScroll = () => {
      setShowScrollTop(el.scrollTop > 400);
      let closest = soalList[0].ujian_soal_id;
      let minDist = Infinity;
      soalList.forEach((q) => {
        const ref = questionRefs.current[q.ujian_soal_id];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const dist = Math.abs(rect.top - 120);
          if (dist < minDist) {
            minDist = dist;
            closest = q.ujian_soal_id;
          }
        }
      });
      setActiveQuestionId(closest);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [soalList]);

  // Prevent Navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Save Jawaban Logic
  const saveAnswerManual = async (soalId: number, answerText: string | null, is_ragu: boolean) => {
    if (!examData) return;
    try {
      await ujianApi.jawab({
        hasil_ujian_id: examData.hasil_ujian_id,
        ujian_soal_id: soalId,
        jawaban: answerText,
        is_ragu: is_ragu
      });
      lastSavedAnswer.current.set(soalId, answerText || '');
    } catch (err) {
      console.error('Failed to save answer');
    }
  };

  const handleOptionSelect = (soalId: number, option: string) => {
    const newAnswers = new Map(answers);
    const currentlySelected = newAnswers.get(soalId);
    
    if (currentlySelected === option) {
      newAnswers.delete(soalId);
      saveAnswerManual(soalId, null, raguList.has(soalId));
    } else {
      newAnswers.set(soalId, option);
      saveAnswerManual(soalId, option, raguList.has(soalId));
    }
    
    setAnswers(newAnswers);
    if (examData) {
      sessionStorage.setItem(`answers_${examData.hasil_ujian_id}`, JSON.stringify(Array.from(newAnswers.entries())));
    }
  };

  const toggleRagu = (soalId: number) => {
    const newRagu = new Set(raguList);
    let isRaguNow = false;
    if (newRagu.has(soalId)) {
      newRagu.delete(soalId);
    } else {
      newRagu.add(soalId);
      isRaguNow = true;
    }
    setRaguList(newRagu);
    if (examData) {
      sessionStorage.setItem(`ragu_${examData.hasil_ujian_id}`, JSON.stringify(Array.from(newRagu)));
    }
    const currentAnswer = answers.get(soalId) || null;
    saveAnswerManual(soalId, currentAnswer, isRaguNow);
  };

  const handleAutoSubmit = useCallback(async () => {
    if (!examData || isSubmitLoading) return;
    setIsSubmitLoading(true);
    try {
      const res = await ujianApi.selesai(examData.hasil_ujian_id);
      sessionStorage.removeItem(`answers_${examData.hasil_ujian_id}`);
      sessionStorage.removeItem(`ragu_${examData.hasil_ujian_id}`);
      sessionStorage.setItem('hasil_ujian', JSON.stringify(res.data.data));
      navigate(`/ujian/hasil/${examData.hasil_ujian_id}`);
    } catch (err) {
      toast.error('Gagal mengirim jawaban otomatis');
    }
  }, [examData, isSubmitLoading, navigate]);

  const confirmSubmit = async () => {
    if (!examData || isSubmitLoading) return;
    setIsSubmitLoading(true);
    try {
      const res = await ujianApi.selesai(examData.hasil_ujian_id);
      sessionStorage.removeItem(`answers_${examData.hasil_ujian_id}`);
      sessionStorage.removeItem(`ragu_${examData.hasil_ujian_id}`);
      sessionStorage.setItem('hasil_ujian', JSON.stringify(res.data.data));
      navigate(`/ujian/hasil/${examData.hasil_ujian_id}`);
    } catch (err) {
      toast.error('Gagal menyelesaikan ujian. Silakan coba lagi.');
      setIsSubmitLoading(false);
      setShowSubmitModal(false);
    }
  };

  const scrollToQuestion = (id: number) => {
    const ref = questionRefs.current[id];
    if (ref && mainRef.current) {
      const top = ref.offsetTop - 16;
      mainRef.current.scrollTo({ top, behavior: "smooth" });
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const scrollTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatWaktu = (detik: number) => {
    const jam = Math.floor(detik / 3600);
    const menit = Math.floor((detik % 3600) / 60);
    const dtk = detik % 60;
    return `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}:${String(dtk).padStart(2, "0")}`;
  };

  const getNavStyle = (id: number, cat: string) => {
    const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['TWK'];
    const isActive = id === activeQuestionId;
    const isAnswered = answers.has(id);
    const isFlagged = raguList.has(id);

    if (isActive) return `${cfg.navActive} ring-2 ring-white/50 scale-105 shadow`;
    if (isFlagged) return "bg-amber-400 text-white";
    if (isAnswered) return "bg-emerald-500 text-white";
    return "bg-slate-100 text-slate-600 hover:bg-slate-200";
  };

  if (!examData || soalList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const timePercent = Math.min(100, Math.max(0, (sisaWaktu / maxWaktu.current) * 100));
  const isTimeCritical = sisaWaktu < 600;
  const answeredCount = answers.size;
  const flaggedCount = raguList.size;
  const unansweredCount = soalList.length - answeredCount;

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      {/* ── HEADER ── */}
      <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-lg flex-shrink-0 z-20">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <BookOpen size={16} />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-indigo-200 leading-none">Sistem Seleksi CPNS</p>
                <p className="text-sm font-semibold leading-tight">CAT · BKN Simulasi Ujian</p>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono transition-all ${isTimeCritical ? "bg-red-500 animate-pulse shadow-lg" : "bg-white/15 backdrop-blur-sm"}`}>
            <Clock size={15} className="text-white/80" />
            <span className="text-base font-bold tracking-widest">{formatWaktu(sisaWaktu)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold uppercase">
                {user?.nama?.substring(0,2) || 'UU'}
              </div>
              <div className="leading-none text-right">
                <p className="text-xs text-indigo-200">Peserta Ujian</p>
                <p className="text-sm font-semibold">{user?.nama || 'Anonim'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm rounded-lg hover:bg-indigo-50 font-semibold shadow transition-colors"
            >
              <LogOut size={14} className="hidden sm:block" />
              <span>Selesai</span>
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/20">
          <div className={`h-full transition-all duration-1000 ${isTimeCritical ? "bg-red-400" : "bg-white/70"}`} style={{ width: `${timePercent}%` }} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── SIDEBAR ── */}
        <aside className={`absolute md:relative ${sidebarOpen ? "w-64" : "w-0"} flex-shrink-0 bg-white border-r border-slate-200 overflow-hidden transition-all duration-300 z-[19] flex flex-col h-full shadow-2xl md:shadow-none`}>
          <div className="h-full overflow-y-auto flex flex-col w-64">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-slate-200 flex-shrink-0">
              <div className="md:hidden flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase">{user?.nama?.substring(0,2) || 'UU'}</div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{user?.nama || 'Anonim'}</p>
                  <p className="text-xs text-slate-400 truncate">Sesi #{examData.sesi_ujian_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-white rounded-xl py-2 shadow-sm border border-emerald-100">
                  <p className="font-bold text-emerald-600">{answeredCount}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dijawab</p>
                </div>
                <div className="bg-white rounded-xl py-2 shadow-sm border border-amber-100">
                  <p className="font-bold text-amber-500">{flaggedCount}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ragu</p>
                </div>
                <div className="bg-white rounded-xl py-2 shadow-sm border border-slate-100">
                  <p className="font-bold text-slate-500">{unansweredCount}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Belum</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-4">
              {categoriesPresent.map((catString) => {
                const cfg = CATEGORY_CONFIG[catString as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['TWK'];
                const catQs = soalList.filter(q => q.kategori_soal.kode === catString);
                const catAnswered = catQs.filter((q) => answers.has(q.ujian_soal_id)).length;
                return (
                  <div key={catString}>
                    <div className={`${cfg.navHeader} rounded-xl px-3 py-2 mb-2 flex items-center justify-between`}>
                      <div>
                        <p className="text-white text-xs font-bold">{catString}</p>
                        <p className="text-white/70 text-[10px] leading-tight">{cfg.fullLabel}</p>
                      </div>
                      <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {catAnswered}/{catQs.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {catQs.map((q) => (
                        <button
                          key={q.ujian_soal_id}
                          onClick={() => scrollToQuestion(q.ujian_soal_id)}
                          className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all duration-150 ${getNavStyle(q.ujian_soal_id, catString)}`}
                        >
                          {q.nomor_urut}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100 flex-shrink-0">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Keterangan</p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                {[
                  { color: "bg-emerald-500", label: "Dijawab" },
                  { color: "bg-amber-400", label: "Ragu-ragu" },
                  { color: "bg-slate-200", label: "Belum" },
                  { color: "bg-indigo-600", label: "Aktif" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded flex-shrink-0 border border-black/10 ${item.color}`} />
                    <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN SCROLL AREA ── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative w-full" onClick={() => {if(window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false)}}>
          <div className="max-w-3xl mx-auto px-4 py-5 space-y-10 pb-16">
            {categoriesPresent.map((catString) => {
              const cfg = CATEGORY_CONFIG[catString as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['TWK'];
              const catQs = soalList.filter(q => q.kategori_soal.kode === catString);
              const catAnswered = catQs.filter((q) => answers.has(q.ujian_soal_id)).length;

              return (
                <section key={catString}>
                  <div className={`${cfg.headerBg} rounded-2xl p-5 mb-4 flex items-center justify-between shadow-md`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-black text-lg">{catString}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg leading-tight">{cfg.fullLabel}</p>
                        <p className="text-white/70 text-sm hidden sm:block">{catQs.length} soal untuk bidang ini</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-xs">Terjawab</p>
                      <p className="text-white font-bold text-xl sm:text-2xl">{catAnswered}<span className="text-white/50 text-sm sm:text-base font-normal">/{catQs.length}</span></p>
                      <div className="w-20 sm:w-24 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden hidden sm:block">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(catAnswered / catQs.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {catQs.map((q) => {
                      const isAnswered = answers.has(q.ujian_soal_id);
                      const isFlagged = raguList.has(q.ujian_soal_id);
                      const selectedKey = answers.get(q.ujian_soal_id);
                      
                      const optionsList = ['A', 'B', 'C', 'D', 'E'].map(opt => ({
                        key: opt,
                        text: q[`opsi_${opt.toLowerCase()}` as keyof SoalSimulasi] as string,
                        img: q[`opsi_${opt.toLowerCase()}_gambar` as keyof SoalSimulasi] as string | null
                      })).filter(o => o.text || o.img);

                      return (
                        <div
                          key={q.ujian_soal_id}
                          ref={(el) => { questionRefs.current[q.ujian_soal_id] = el; }}
                          id={`question-${q.ujian_soal_id}`}
                          className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 overflow-hidden ${
                            activeQuestionId === q.ujian_soal_id
                              ? `${cfg.border} shadow-md`
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className={`flex items-center justify-between px-4 sm:px-5 py-3 border-b ${activeQuestionId === q.ujian_soal_id ? cfg.lightBg : "bg-slate-50"} border-slate-100`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white text-sm font-bold flex items-center justify-center shadow-sm flex-shrink-0`}>
                                {q.nomor_urut}
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 hidden sm:inline">Soal #{q.nomor_urut} &middot; </span>
                                <span className={`text-xs font-semibold ${cfg.navText}`}>{catString}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAnswered && (
                                <span className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
                                  <CheckCircle2 size={12} /> <span className="hidden md:inline">Terjawab</span>
                                </span>
                              )}
                              <button
                                onClick={() => toggleRagu(q.ujian_soal_id)}
                                className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full border transition-all ${
                                  isFlagged
                                    ? "bg-amber-50 border-amber-300 text-amber-600"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-500"
                                }`}
                              >
                                <Flag size={12} className={isFlagged ? "fill-amber-400" : ""} />
                                {isFlagged ? "Ragu-ragu" : "Tandai Ragu"}
                              </button>
                            </div>
                          </div>

                          <div className="px-4 sm:px-5 pt-4 pb-3 space-y-3">
                            {q.pertanyaan_gambar && (
                              <img src={`/static/${q.pertanyaan_gambar}`} alt="Gambar Soal" className="max-w-full h-auto rounded border border-slate-200" />
                            )}
                            <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-wrap">{q.pertanyaan}</p>
                          </div>

                          <div className="px-4 sm:px-5 pb-5 space-y-2">
                            {optionsList.map((opt) => {
                              const isSelected = selectedKey === opt.key;
                              return (
                                <button
                                  key={opt.key}
                                  onClick={() => handleOptionSelect(q.ujian_soal_id, opt.key)}
                                  className={`w-full flex items-start gap-3 px-3 sm:px-4 py-3 rounded-xl text-left border-2 transition-all duration-150 ${
                                    isSelected
                                      ? cfg.selectedBorder + " shadow-sm"
                                      : "border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all mt-0.5 ${
                                    isSelected ? cfg.selectedKey + " shadow-sm" : "bg-white border border-slate-200 text-slate-500"
                                  }`}>
                                    {opt.key}
                                  </div>
                                  <div className={`flex-1 space-y-2 ${isSelected ? "text-slate-800" : "text-slate-600"}`}>
                                    {opt.text && <p className="text-sm sm:text-base leading-relaxed pt-1">{opt.text}</p>}
                                    {opt.img && <img src={`/static/${opt.img}`} className="max-h-40 rounded border border-slate-200" alt={`Opsi ${opt.key}`}/>}
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 size={18} className={`flex-shrink-0 mt-1.5 ${cfg.check}`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8 text-center shadow-lg mt-8">
              <h3 className="text-white text-lg md:text-xl font-bold mb-2">Selesai Mengerjakan?</h3>
              <p className="text-indigo-100 text-sm md:text-base mb-6">
                {unansweredCount > 0
                  ? `Peringatan: Masih ada ${unansweredCount} soal yang belum dijawab.`
                  : "Semua soal sudah terjawab. Silakan kumpulkan untuk melihat hasil."}
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-medium">
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  <span>{answeredCount} Terjawab</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-medium">
                  <Flag size={16} className="text-amber-300 fill-amber-300" />
                  <span>{flaggedCount} Ragu-ragu</span>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-8 py-3.5 bg-white text-indigo-700 font-extrabold rounded-xl hover:bg-indigo-50 transition-colors shadow-md transform hover:scale-105 active:scale-95"
              >
                Kumpulkan Jawaban Sekarang
              </button>
            </div>
          </div>

          {showScrollTop && (
            <button
              onClick={scrollTop}
              className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-30"
            >
              <ChevronUp size={22} />
            </button>
          )}
        </main>
      </div>

      {/* ── SUBMIT MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-500 mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Akhiri Sesi Ujian?</h2>
            <p className="text-slate-500 text-sm text-center mb-6">Anda tidak dapat mengubah jawaban setelah mengumpulkan.</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                <p className="text-xl sm:text-2xl font-black text-emerald-600">{answeredCount}</p>
                <p className="text-[10px] sm:text-xs font-bold text-emerald-800/60 mt-0.5 uppercase tracking-wider">Dijawab</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3 text-center border border-amber-100">
                <p className="text-xl sm:text-2xl font-black text-amber-500">{flaggedCount}</p>
                <p className="text-[10px] sm:text-xs font-bold text-amber-800/60 mt-0.5 uppercase tracking-wider">Ragu</p>
              </div>
              <div className={`rounded-2xl p-3 text-center border ${unansweredCount > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                <p className={`text-xl sm:text-2xl font-black ${unansweredCount > 0 ? "text-red-500" : "text-slate-500"}`}>{unansweredCount}</p>
                <p className={`text-[10px] sm:text-xs font-bold mt-0.5 uppercase tracking-wider ${unansweredCount > 0 ? "text-red-800/60" : "text-slate-500/60"}`}>Belum</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmSubmit} 
                disabled={isSubmitLoading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold transition-colors hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitLoading ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : 'Ya, Kumpulkan'}
              </button>
              <button 
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitLoading}
                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                Batal, Kembali Cek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```
