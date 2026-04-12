import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatTanggal(dateStr: string) {
  return format(new Date(dateStr), 'dd MMMM yyyy', { locale: id });
}

export function formatDurasi(detik: number) {
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  const sisa = detik % 60;
  return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(sisa).padStart(2, '0')}`;
}

export function formatAngka(n: number) {
  return n.toLocaleString('id-ID');
}
