import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchHistoryKeluar, HistoryEntry } from '../api/history.api';

const baseOut: Array<Omit<HistoryEntry, 'id'>> = [
  {
    date: '2026-01-21',
    name: 'Folder One Transparent',
    code: 'FDR-ONE-TPR',
    qty: 1,
    unit: 'pcs',
    receiver: 'Afrizal',
    dept: 'Share Service & General Support',
  },
  {
    date: '2026-01-05',
    name: 'kertas paper one A4',
    code: 'PPR-ONE-A4',
    qty: 1,
    unit: 'rim',
    receiver: 'Holisah',
    dept: 'Share Service & General Support',
  },
  {
    date: '2026-01-05',
    name: 'Paper Clip Joyko',
    code: 'PPR-CLP-JYO',
    qty: 1,
    unit: 'pcs',
    receiver: 'Holisah',
    dept: 'Share Service & General Support',
  },
  {
    date: '2026-01-02',
    name: 'Folder One Transparent',
    code: 'FDR-ONE-TPR',
    qty: 14,
    unit: 'pcs',
    receiver: 'Akbar untuk selesai Magang & PKL',
    dept: 'Share Service & General Support',
  },
  {
    date: '2026-01-02',
    name: 'Gunting Kecil',
    code: 'GK01',
    qty: 1,
    unit: 'pcs',
    receiver: 'Alma',
    dept: 'Performance, Risk & QOS',
  },
  {
    date: '2026-01-02',
    name: 'Double Tape Kecil Putih',
    code: 'DTP-SML-WHT',
    qty: 1,
    unit: 'pcs',
    receiver: 'Alma',
    dept: 'Performance, Risk & QOS',
  },
  {
    date: '2025-12-17',
    name: 'Folder One Kuning',
    code: 'FDR-ONE-YLW',
    qty: 5,
    unit: 'pcs',
    receiver: 'Syifa',
    dept: 'Government Service',
  },
  {
    date: '2025-12-17',
    name: 'Folder One Transparent',
    code: 'FDR-ONE-TPR',
    qty: 1,
    unit: 'pcs',
    receiver: 'Alma',
    dept: 'Performance, Risk & QOS',
  },
  {
    date: '2025-12-17',
    name: 'kertas paper one A4',
    code: 'PPR-ONE-A4',
    qty: 1,
    unit: 'rim',
    receiver: 'wulan',
    dept: 'Share Service & General Support',
  },
  {
    date: '2025-12-17',
    name: 'Paper Clip Joyko',
    code: 'PPR-CLP-JYO',
    qty: 1,
    unit: 'pcs',
    receiver: 'Fira',
    dept: 'Business Service',
  },
];

const fallbackEntries: HistoryEntry[] = Array.from({ length: 300 }, (_, idx) => {
  const base = baseOut[idx % baseOut.length];
  const d = new Date(base.date);
  d.setDate(d.getDate() - idx);
  return { id: idx + 1, ...base, date: d.toISOString().slice(0, 10) };
});

const parseDate = (value: string) => (value ? new Date(value) : null);

const HistoryKeluar = () => {
  const [data, setData] = useState<HistoryEntry[]>([]);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const perPage = 10;

  useEffect(() => {
    // Selalu gunakan data mock/fallback
    setLoading(false);
    setData(fallbackEntries);
    setFetchError(null);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [from, to]);

  const filtered = useMemo(() => {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (fromDate && toDate && fromDate > toDate) {
      return [];
    }

    return data
      .filter((row) => {
        const current = new Date(row.date);
        if (fromDate && current < fromDate) return false;
        if (toDate && current > toDate) return false;
        return true;
      })
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [from, to, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filtered.length);
  const pageRows = filtered.slice(startIndex, endIndex);
  const applyFilters = () => {
    const nextFrom = parseDate(draftFrom);
    const nextTo = parseDate(draftTo);
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError('Rentang tanggal tidak valid (dari harus lebih awal)');
      return;
    }
    setError(null);
    setFrom(draftFrom);
    setTo(draftTo);
    loadData({ from: draftFrom || undefined, to: draftTo || undefined });
  };

  const resetFilters = () => {
    setDraftFrom('');
    setDraftTo('');
    setFrom('');
    setTo('');
    setPage(1);
    setError(null);
  };

  return (
    <div className="history-page">
      <div className="history-card">
        <h2 className="history-title">Daftar Barang Keluar</h2>
        <div className="history-filters">
          {error && <p className="danger-text" role="alert">{error}</p>}
          <div className="filter-group">
            <label className="filter-label">Dari Tanggal</label>
            <div className="date-input">
              <span className="date-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="5" width="16" height="15" rx="2" />
                  <path d="M4 9h16" />
                  <path d="M9 3v4M15 3v4" />
                </svg>
              </span>
              <input
                type="date"
                className="input-control date-control"
                placeholder="dd/mm/yyyy"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Hingga Tanggal</label>
            <div className="date-input">
              <span className="date-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="5" width="16" height="15" rx="2" />
                  <path d="M4 9h16" />
                  <path d="M9 3v4M15 3v4" />
                </svg>
              </span>
              <input
                type="date"
                className="input-control date-control"
                placeholder="dd/mm/yyyy"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </div>
          </div>

          <div className="history-actions">
            <Button type="button" variant="secondary" onClick={applyFilters}>
              Terapkan
            </Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="history-card">
          {fetchError && <p className="danger-text" role="alert">{fetchError}</p>}
        <Table>
          <THead>
            <TR>
              <TH style={{ width: '52px' }}>No</TH>
              <TH>Tanggal</TH>
              <TH>Nama Barang</TH>
              <TH>Kode Barang</TH>
              <TH>Jumlah</TH>
              <TH>Satuan</TH>
              <TH>Penerima</TH>
              <TH>Unit</TH>
            </TR>
          </THead>
          <TBody>
          {loading ? (
            <TR>
              <TD colSpan={8} className="empty-row">Memuat data...</TD>
            </TR>
          ) : pageRows.length === 0 ? (
            <TR>
              <TD colSpan={8} className="empty-row">Tidak ada data pada rentang tanggal ini</TD>
            </TR>
          ) : (
            pageRows.map((row, idx) => (
              <TR key={row.id}>
                <TD>{startIndex + idx + 1}</TD>
                <TD>{row.date}</TD>
                <TD>{row.name}</TD>
                <TD>{row.code}</TD>
                <TD>{row.qty}</TD>
                <TD>{row.unit}</TD>
                <TD>{row.receiver}</TD>
                <TD>{row.dept}</TD>
              </TR>
            ))
          )}
          </TBody>
        </Table>

        <div className="items-footer">
          <span className="items-meta">
            Menampilkan {startIndex + 1} - {endIndex} dari {filtered.length} barang
          </span>
          <Pagination current={currentPage} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default HistoryKeluar;
