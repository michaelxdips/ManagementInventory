import { http } from './http';

export type HistoryEntry = {
  id: number;
  date: string;
  name: string;
  code: string;
  qty: number;
  unit: string;
  pic?: string;
  receiver?: string;
  dept?: string;
};

export type HistoryFilter = {
  from?: string;
  to?: string;
};

const buildQuery = (filter?: HistoryFilter) => {
  if (!filter) return '';
  const params = new URLSearchParams();
  if (filter.from) params.set('from', filter.from);
  if (filter.to) params.set('to', filter.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchHistoryMasuk = (filter?: HistoryFilter) => http.get<HistoryEntry[]>(`/history/masuk${buildQuery(filter)}`);
export const fetchHistoryKeluar = (filter?: HistoryFilter) => http.get<HistoryEntry[]>(`/history/keluar${buildQuery(filter)}`);
