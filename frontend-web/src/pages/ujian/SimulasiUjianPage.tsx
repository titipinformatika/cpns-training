import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ujianApi } from '../../api/ujian';
import type { MulaiUjianResponse, SoalSimulasi } from '../../types';
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  Flag,
  Loader2,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function SimulasiUjianPage() {
  const navigate = useNavigate();
  
  // State from sessionStorage
  const [examData, setExamData] = useState<MulaiUjianResponse | null>(null);
  
  // Core State
  const [soalList, setSoalList] = useState<SoalSimulasi[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [raguList, setRaguList] = useState<Set<number>>(new Set());
  const [sisaWaktu, setSisaWaktu] = useState(0);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [showNav, setShowNav] = useState(false); // Mobile navigation grid
  
  // Refs for tracking changes
  const lastSavedAnswer = useRef<Map<number, string>>(new Map());
  const heartbeatInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  // Initialize data
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
      
      // Load from backup if exists
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

  // Timer Logic
  useEffect(() => {
    if (sisaWaktu <= 0) return;

    timerInterval.current = setInterval(() => {
      setSisaWaktu(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          handleAutoSubmit();
          return 0;
        }
        
        // Notifications
        if (prev === 300) toast('⚠️ Sisa waktu 5 menit!', { icon: '⏳' });
        if (prev === 60) toast.error('⚠️ Sisa waktu 1 menit! Segera selesaikan.');
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval.current);
  }, [sisaWaktu === 0]); // Init once

  // Heartbeat Logic
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
        
        // Sync time with server
        setSisaWaktu(sisa_waktu_detik);
      } catch (err) {
        console.error('Heartbeat failed');
      }
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval.current);
  }, [examData]);

  // Auto-save logic
  const saveAnswer = useCallback(async (index: number) => {
    if (!examData) return;
    const soal = soalList[index];
    const currentAnswer = answers.get(soal.ujian_soal_id) || null;
    const lastSaved = lastSavedAnswer.current.get(soal.ujian_soal_id) || null;
    const isRagu = raguList.has(soal.ujian_soal_id);

    // Only save if changed
    if (currentAnswer !== lastSaved) {
      try {
        await ujianApi.jawab({
          hasil_ujian_id: examData.hasil_ujian_id,
          ujian_soal_id: soal.ujian_soal_id,
          jawaban: currentAnswer,
          is_ragu: isRagu
        });
        lastSavedAnswer.current.set(soal.ujian_soal_id, currentAnswer || '');
      } catch (err) {
        console.error('Failed to save answer');
      }
    }
  }, [examData, soalList, answers, raguList]);

  // Navigation functions
  const handleNext = () => {
    saveAnswer(currentIndex);
    if (currentIndex < soalList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    saveAnswer(currentIndex);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToSoal = (index: number) => {
    saveAnswer(currentIndex);
    setCurrentIndex(index);
    setShowNav(false);
  };

  const handleOptionSelect = (option: string) => {
    const soalId = soalList[currentIndex].ujian_soal_id;
    const newAnswers = new Map(answers);
    
    // Toggle if same option selected
    if (newAnswers.get(soalId) === option) {
      newAnswers.delete(soalId);
    } else {
      newAnswers.set(soalId, option);
    }
    
    setAnswers(newAnswers);
    // Backup locally
    sessionStorage.setItem(`answers_${examData?.hasil_ujian_id}`, JSON.stringify(Array.from(newAnswers.entries())));
  };

  const toggleRagu = () => {
    const soalId = soalList[currentIndex].ujian_soal_id;
    const newRagu = new Set(raguList);
    if (newRagu.has(soalId)) {
      newRagu.delete(soalId);
    } else {
      newRagu.add(soalId);
    }
    setRaguList(newRagu);
    sessionStorage.setItem(`ragu_${examData?.hasil_ujian_id}`, JSON.stringify(Array.from(newRagu)));
  };

  const handleAutoSubmit = async () => {
    if (!examData || isSubmitLoading) return;
    setIsSubmitLoading(true);
    try {
      const res = await ujianApi.selesai(examData.hasil_ujian_id);
      sessionStorage.setItem('hasil_ujian', JSON.stringify(res.data.data));
      navigate(`/ujian/hasil/${examData.hasil_ujian_id}`);
    } catch (err) {
      toast.error('Gagal mengirim jawaban otomatis');
    }
  };

  const handleSubmit = async () => {
    if (!examData) return;
    const confirm = window.confirm(`Yakin ingin menyelesaikan ujian? Anda memiliki ${soalList.length - answers.size} soal yang belum dijawab.`);
    if (!confirm) return;

    setIsSubmitLoading(true);
    try {
      // Save current answer first
      await saveAnswer(currentIndex);
      const res = await ujianApi.selesai(examData.hasil_ujian_id);
      sessionStorage.setItem('hasil_ujian', JSON.stringify(res.data.data));
      navigate(`/ujian/hasil/${examData.hasil_ujian_id}`);
    } catch (err) {
      toast.error('Gagal menyelesaikan ujian. Silakan coba lagi.');
      setIsSubmitLoading(false);
    }
  };

  const formatWaktu = (detik: number) => {
    const jam = Math.floor(detik / 3600);
    const menit = Math.floor((detik % 3600) / 60);
    const dtk = detik % 60;
    return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(dtk).padStart(2, '0')}`;
  };

  if (!examData || soalList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const currentSoal = soalList[currentIndex];
  const currentJawaban = answers.get(currentSoal.ujian_soal_id);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Soal Saat Ini</span>
            <span className="text-xl font-extrabold text-gray-900 leading-none">
              {currentIndex + 1} <span className="text-gray-300 mx-1">/</span> {soalList.length}
            </span>
          </div>
          
          <div className="hidden md:flex flex-col border-l border-gray-100 pl-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Kategori</span>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
              {currentSoal.kategori_soal.nama}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={clsx(
            "flex items-center gap-3 px-6 py-2 rounded-2xl border-2 transition-all duration-300",
            sisaWaktu < 300 ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-100 text-gray-900"
          )}>
            <Timer className={clsx("w-5 h-5", sisaWaktu < 300 && "animate-pulse")} />
            <span className="text-xl font-mono font-extrabold">{formatWaktu(sisaWaktu)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl font-extrabold text-sm shadow-lg shadow-red-100 transition-all flex items-center gap-2 active:scale-95"
          >
            {isSubmitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Selesai Ujian</span>
          </button>
          
          <button 
            onClick={() => setShowNav(true)}
            className="p-2.5 bg-gray-100 rounded-xl md:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Question Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 p-8 md:p-12">
              <div className="flex items-start gap-4 mb-8">
                <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold shrink-0">
                  {currentIndex + 1}
                </span>
                <div className="space-y-6 flex-1">
                  <div className="text-lg md:text-xl font-bold text-gray-800 leading-relaxed">
                    {currentSoal.pertanyaan}
                  </div>
                  
                  {currentSoal.pertanyaan_gambar && (
                    <div className="bg-gray-50 p-4 rounded-3xl inline-block border border-gray-100">
                      <img 
                        src={`/static/${currentSoal.pertanyaan_gambar}`} 
                        alt="Soal" 
                        className="max-w-full h-auto rounded-2xl shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 ml-0 md:ml-14">
                {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                  const labelKey = `opsi_${opt.toLowerCase()}` as keyof SoalSimulasi;
                  const imgKey = `opsi_${opt.toLowerCase()}_gambar` as keyof SoalSimulasi;
                  const isSelected = currentJawaban === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={clsx(
                        "w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-200 text-left group",
                        isSelected 
                          ? "border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100" 
                          : "border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white"
                      )}
                    >
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all",
                        isSelected ? "bg-indigo-600 text-white" : "bg-white text-gray-400 border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      )}>
                        {opt}
                      </div>
                      <div className="flex-1 space-y-3">
                        {currentSoal[labelKey] && (
                          <div className={clsx("font-bold text-sm md:text-base", isSelected ? "text-indigo-900" : "text-gray-600")}>
                            {currentSoal[labelKey] as string}
                          </div>
                        )}
                        {currentSoal[imgKey] && (
                          <img 
                            src={`/static/${currentSoal[imgKey]}`} 
                            alt={`Opsi ${opt}`} 
                            className="h-20 w-auto rounded-xl shadow-sm border border-white"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ragu Checkbox */}
            <div className="flex justify-start ml-0 md:ml-14">
              <label className="group flex items-center gap-3 cursor-pointer bg-amber-50 px-6 py-4 rounded-2xl border border-amber-100 shadow-sm transition-all hover:bg-amber-100">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={raguList.has(currentSoal.ujian_soal_id)}
                    onChange={toggleRagu}
                    className="appearance-none w-6 h-6 border-2 border-amber-400 rounded-lg bg-white checked:bg-amber-400 transition-all cursor-pointer"
                  />
                  {raguList.has(currentSoal.ujian_soal_id) && (
                    <HelpCircle className="absolute w-4 h-4 text-white pointer-events-none" />
                  )}
                </div>
                <span className="font-bold text-amber-900 text-sm">Tandai Ragu-ragu</span>
              </label>
            </div>
          </div>
        </main>

        {/* Sidebar Desktop - Navigation Grid */}
        <aside className="w-80 bg-white border-l border-gray-200 hidden md:flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Flag className="w-3.5 h-3.5" />
              Navigasi Soal
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="grid grid-cols-5 gap-3">
              {soalList.map((soalItem, i) => {
                const isTerjawab = answers.has(soalItem.ujian_soal_id);
                const isRagu = raguList.has(soalItem.ujian_soal_id);
                const isActive = currentIndex === i;

                return (
                  <button
                    key={i}
                    onClick={() => goToSoal(i)}
                    className={clsx(
                      "w-11 h-11 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all",
                      isActive ? "ring-4 ring-indigo-100 shadow-lg scale-110" : "hover:scale-105",
                      isActive && "border-2 border-indigo-600 bg-white text-indigo-600",
                      !isActive && isRagu && "bg-amber-400 text-white shadow-md shadow-amber-100",
                      !isActive && isTerjawab && !isRagu && "bg-emerald-500 text-white shadow-md shadow-emerald-100",
                      !isActive && !isTerjawab && "bg-gray-100 text-gray-400"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>Terjawab: {answers.size}</span>
                <span>Ragu: {raguList.size}</span>
             </div>
             <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000" 
                  style={{ width: `${(answers.size / soalList.length) * 100}%` }}
                />
             </div>
          </div>
        </aside>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-gray-200 p-4 md:p-6 fixed bottom-0 w-full md:w-[calc(100%-20rem)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 border-2 border-transparent text-gray-500 hover:text-indigo-600 font-extrabold disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Sebelumnya
          </button>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">Input otomatis tersimpan</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === soalList.length - 1}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-extrabold shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-30"
          >
            Berikutnya
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Mobile Nav Overlay */}
      {showNav && (
        <div className="fixed inset-0 z-50 bg-white p-6 animate-in slide-in-from-right duration-300">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-widest">Navigasi Soal</h3>
              <button 
                onClick={() => setShowNav(false)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
           </div>
           <div className="grid grid-cols-5 gap-3 overflow-y-auto max-h-[70vh] pb-10">
              {soalList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSoal(i)}
                  className={clsx(
                    "w-12 h-12 rounded-2xl text-sm font-extrabold flex items-center justify-center transition-all",
                    currentIndex === i ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                  )}
                >
                  {i + 1}
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
