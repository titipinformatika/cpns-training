import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ujianApi } from '../api/ujian';
import type { MulaiUjianResponse, SoalSimulasi } from '../types';

export function useSimulasi() {
  const navigate = useNavigate();

  // Core Data
  const [examData, setExamData] = useState<MulaiUjianResponse | null>(null);
  const [soalList, setSoalList] = useState<SoalSimulasi[]>([]);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [raguList, setRaguList] = useState<Set<number>>(new Set());
  const [sisaWaktu, setSisaWaktu] = useState(0);
  const maxWaktu = useRef(6000); // For progress bar fallback

  // UI State
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

  // Refs
  const lastSavedAnswer = useRef<Map<number, string>>(new Map());
  const heartbeatInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  // Derived Categories
  const categoriesPresent = useMemo(() => {
    return Array.from(new Set(soalList.map((s) => s.kategori_soal.kode)));
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

  // Handle Auto Submit Logic
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

  // Timer
  useEffect(() => {
    if (sisaWaktu <= 0) return;
    timerInterval.current = setInterval(() => {
      setSisaWaktu((prev) => {
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
  }, [sisaWaktu === 0, handleAutoSubmit]);

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
  }, [examData, handleAutoSubmit]);

  // Prevent Navigation Accidents
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // API Call to Backup Jawaban
  const saveAnswerManual = async (soalId: number, answerText: string | null, is_ragu: boolean) => {
    if (!examData) return;
    try {
      await ujianApi.jawab({
        hasil_ujian_id: examData.hasil_ujian_id,
        ujian_soal_id: soalId,
        jawaban: answerText,
        is_ragu: is_ragu,
      });
      lastSavedAnswer.current.set(soalId, answerText || '');
    } catch (err) {
      console.error('Failed to save answer');
    }
  };

  // State Updaters
  const handleOptionSelect = (soalId: number, option: string) => {
    const newAnswers = new Map(answers);
    const currentlySelected = newAnswers.get(soalId);
    let finalOption: string | null = option;

    if (currentlySelected === option) {
      newAnswers.delete(soalId);
      finalOption = null;
    } else {
      newAnswers.set(soalId, option);
    }

    setAnswers(newAnswers);
    if (examData) {
      sessionStorage.setItem(`answers_${examData.hasil_ujian_id}`, JSON.stringify(Array.from(newAnswers.entries())));
    }
    saveAnswerManual(soalId, finalOption, raguList.has(soalId));
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

  // Manual Submit API
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
      throw err;
    }
  };

  return {
    examData,
    soalList,
    sisaWaktu,
    maxWaktu: maxWaktu.current,
    answers,
    raguList,
    categoriesPresent,
    isSubmitLoading,
    activeQuestionId,
    setActiveQuestionId,
    handleOptionSelect,
    toggleRagu,
    confirmSubmit,
  };
}
