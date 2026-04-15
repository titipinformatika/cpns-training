import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSimulasi } from '../../hooks/useSimulasi';
import { CATEGORY_CONFIG } from '../../utils/constants';

import { HeaderUjian } from '../../components/simulasi/HeaderUjian';
import { SidebarUjian } from '../../components/simulasi/SidebarUjian';
import { QuestionCard } from '../../components/simulasi/QuestionCard';
import { SubmitModal } from '../../components/simulasi/SubmitModal';
import { SimulasiFooter } from '../../components/simulasi/SimulasiFooter';

import { Loader2 } from 'lucide-react';

export default function SimulasiUjianPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');

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

  // Memastikan soal pertama aktif saat data termuat
  useEffect(() => {
    if (soalList.length > 0 && !activeQuestionId) {
      setActiveQuestionId(soalList[0].ujian_soal_id);
    }
  }, [soalList, activeQuestionId, setActiveQuestionId]);

  const scrollToQuestion = (id: number) => {
    setActiveQuestionId(id);
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

  const statsKategori = useMemo(() => {
    return categoriesPresent.map(kode => {
      const qs = soalList.filter(q => q.kategori_soal.kode === kode);
      const terjawab = qs.filter(q => answers.has(q.ujian_soal_id)).length;
      return { nama: kode, terjawab, total: qs.length };
    });
  }, [categoriesPresent, soalList, answers]);

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

  // Temukan soal aktif untuk single-card layout
  const activeQuestion = soalList.find(q => q.ujian_soal_id === activeQuestionId) || soalList[0];
  const catString = activeQuestion?.kategori_soal.kode || 'TWK';
  const cfg = CATEGORY_CONFIG[catString as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['TWK'];

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      <HeaderUjian
        sisaWaktu={sisaWaktu}
        maxWaktu={maxWaktu}
        user={user}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((v) => !v)}
        onOpenSubmitModal={() => setShowSubmitModal(true)}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        unansweredCount={unansweredCount}
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
          <main className="flex-1 overflow-hidden flex flex-col w-full px-2 sm:px-4 md:px-6 py-4"
            onClick={() => {
              if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
            }}
          >
            {activeQuestion && (
              <QuestionCard
                key={activeQuestion.ujian_soal_id}
                q={activeQuestion}
                catString={catString}
                cfg={cfg}
                activeQuestionId={activeQuestionId}
                isAnswered={answers.has(activeQuestion.ujian_soal_id)}
                isFlagged={raguList.has(activeQuestion.ujian_soal_id)}
                selectedKey={answers.get(activeQuestion.ujian_soal_id)}
                toggleRagu={toggleRagu}
                handleOptionSelect={handleOptionSelect}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
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
