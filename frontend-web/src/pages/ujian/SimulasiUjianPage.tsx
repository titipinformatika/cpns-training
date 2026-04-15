import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSimulasi } from '../../hooks/useSimulasi';
import { CATEGORY_CONFIG } from '../../utils/constants';

import { HeaderUjian } from '../../components/simulasi/HeaderUjian';
import { SidebarUjian } from '../../components/simulasi/SidebarUjian';
import { QuestionCard } from '../../components/simulasi/QuestionCard';
import { SubmitModal } from '../../components/simulasi/SubmitModal';
import { SimulasiFooter } from '../../components/simulasi/SimulasiFooter';

import { ChevronUp, Loader2, CheckCircle2, Flag } from 'lucide-react';

export default function SimulasiUjianPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const {
    examData,
    soalList,
    sisaWaktu,
    maxWaktu,
    answers,
    raguList,
    categoriesPresent,
    isSubmitLoading,
    activeQuestionId,
    setActiveQuestionId,
    handleOptionSelect,
    toggleRagu,
    confirmSubmit,
  } = useSimulasi();

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
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [soalList, setActiveQuestionId]);

  const scrollToQuestion = (id: number) => {
    const ref = questionRefs.current[id];
    if (ref && mainRef.current) {
      const top = ref.offsetTop - 16;
      mainRef.current.scrollTo({ top, behavior: 'instant' });
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const scrollToPrevious = () => {
    if (!activeQuestionId) return;
    const currentIndex = soalList.findIndex((q) => q.ujian_soal_id === activeQuestionId);
    if (currentIndex > 0) {
      scrollToQuestion(soalList[currentIndex - 1].ujian_soal_id);
    }
  };

  const scrollToNext = () => {
    if (!activeQuestionId) return;
    const currentIndex = soalList.findIndex((q) => q.ujian_soal_id === activeQuestionId);
    if (currentIndex >= 0 && currentIndex < soalList.length - 1) {
      scrollToQuestion(soalList[currentIndex + 1].ujian_soal_id);
    }
  };

  const scrollTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!examData || soalList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const answeredCount = answers.size;
  const flaggedCount = raguList.size;
  const unansweredCount = soalList.length - answeredCount;

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      <HeaderUjian
        sisaWaktu={sisaWaktu}
        maxWaktu={maxWaktu}
        user={user}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((v) => !v)}
        onOpenSubmitModal={() => setShowSubmitModal(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <SidebarUjian
          sidebarOpen={sidebarOpen}
          user={user}
          sesiUjianId={examData.sesi_ujian_id}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
          unansweredCount={unansweredCount}
          categoriesPresent={categoriesPresent}
          soalList={soalList}
          answers={answers}
          raguList={raguList}
          activeQuestionId={activeQuestionId}
          scrollToQuestion={scrollToQuestion}
        />

        <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto relative w-full"
            onClick={() => {
              if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
            }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-5 space-y-10 pb-16">
              {categoriesPresent.map((catString) => {
                const cfg =
                  CATEGORY_CONFIG[catString as keyof typeof CATEGORY_CONFIG] ||
                  CATEGORY_CONFIG['TWK'];
                const catQs = soalList.filter((q) => q.kategori_soal.kode === catString);
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
                          <p className="text-white/70 text-sm hidden sm:block">
                            {catQs.length} soal untuk bidang ini
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-xs">Terjawab</p>
                        <p className="text-white font-bold text-xl sm:text-2xl">
                          {catAnswered}
                          <span className="text-white/50 text-sm sm:text-base font-normal">/{catQs.length}</span>
                        </p>
                        <div className="w-20 sm:w-24 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-white rounded-full transition-all"
                            style={{ width: `${(catAnswered / catQs.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {catQs.map((q) => (
                        <QuestionCard
                          key={q.ujian_soal_id}
                          q={q}
                          catString={catString}
                          cfg={cfg}
                          activeQuestionId={activeQuestionId}
                          isAnswered={answers.has(q.ujian_soal_id)}
                          isFlagged={raguList.has(q.ujian_soal_id)}
                          selectedKey={answers.get(q.ujian_soal_id)}
                          toggleRagu={toggleRagu}
                          handleOptionSelect={handleOptionSelect}
                          innerRef={(el) => {
                            questionRefs.current[q.ujian_soal_id] = el;
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8 text-center shadow-lg mt-8">
                <h3 className="text-white text-lg md:text-xl font-bold mb-2">Selesai Mengerjakan?</h3>
                <p className="text-indigo-100 text-sm md:text-base mb-6">
                  {unansweredCount > 0
                    ? `Peringatan: Masih ada ${unansweredCount} soal yang belum dijawab.`
                    : 'Semua soal sudah terjawab. Silakan kumpulkan untuk melihat hasil.'}
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
                className="fixed bottom-20 right-6 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-30"
              >
                <ChevronUp size={22} />
              </button>
            )}
          </main>
          
          <SimulasiFooter
            activeQuestionId={activeQuestionId}
            soalList={soalList}
            scrollToPrevious={scrollToPrevious}
            scrollToNext={scrollToNext}
            toggleRagu={toggleRagu}
            isFlagged={activeQuestionId ? raguList.has(activeQuestionId) : false}
            answeredCount={answeredCount}
            unansweredCount={unansweredCount}
            flaggedCount={flaggedCount}
          />
        </div>
      </div>

      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={confirmSubmit}
        isSubmitLoading={isSubmitLoading}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        unansweredCount={unansweredCount}
      />
    </div>
  );
}
