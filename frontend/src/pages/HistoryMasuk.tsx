import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchHistoryMasuk, HistoryEntry } from '../api/history.api';

const baseEntries: Array<Omit<HistoryEntry, 'id'>> = [
  {
    date: '2026-01-15',
    name: 'Snowman Whiteboard Marker Non Permanent Merah',
    code: 'SNO-NON-RED',
    qty: 10,
    unit: 'pcs',
    pic: 'Super Admin',
  },
  { date: '2026-01-02', name: 'Map Bening Dataflex', code: 'MAP-CLS-DTX', qty: 120, unit: 'pcs', pic: 'Admin1' },
  { date: '2026-01-02', name: 'Folder One Transparent', code: 'FDR-ONE-TPR', qty: 240, unit: 'pcs', pic: 'Admin1' },
  { date: '2026-01-02', name: 'Amplop Coklat 140x270', code: 'APP-BRW-140', qty: 1000, unit: 'pcs', pic: 'Admin1' },
  { date: '2026-01-02', name: 'Gunting Besar Joyko', code: 'GTG-BIG-JYO', qty: 5, unit: 'pcs', pic: 'Admin1' },
  { date: '2026-01-01', name: 'Gunting Kecil', code: 'GK01', qty: 10, unit: 'pcs', pic: 'Admin1' },
  { date: '2025-12-02', name: 'Baterai AA', code: 'BTR-A2', qty: 70, unit: 'pcs', pic: 'Admin1' },
  { date: '2025-12-02', name: 'Baterai AA', code: 'BTR-A2', qty: 70, unit: 'pcs', pic: 'Admin1' },
  { date: '2025-12-01', name: 'kertas paper one A4', code: 'PPR-ONE-A4', qty: 29, unit: 'rim', pic: 'Admin2' },
  { date: '2025-10-24', name: 'Amplop Telkom Polos', code: 'APP-TLM-CLS', qty: 5, unit: 'bungkus', pic: 'Admin1' },
];

const fallbackEntries: HistoryEntry[] = Array.from({ length: 300 }, (_, idx) => {
  const base = baseEntries[idx % baseEntries.length];
  const date = new Date(base.date);
  date.setDate(date.getDate() - idx);
  const iso = date.toISOString().slice(0, 10);
  return { id: idx + 1, ...base, date: iso };
});

const formatDisplayDate = (iso: string) => iso;

const parseDate = (value: string) => (value ? new Date(value) : null);

const HistoryMasuk = () => {
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
      .filter((entry) => {
        const current = new Date(entry.date);
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

  const handleApply = () => {
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

  const handleReset = () => {
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
        <h2 className="history-title">Daftar Barang Masuk</h2>

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
            <Button type="button" variant="secondary" onClick={handleApply}>
              Terapkan
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
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
              <TH>PIC</TH>
            </TR>
          </THead>
          <TBody>
          {loading ? (
            <TR>
              <TD colSpan={7} className="empty-row">Memuat data...</TD>
            </TR>
            ) : pageRows.length === 0 ? (
            <TR>
              <TD colSpan={7} className="empty-row">Tidak ada data pada rentang tanggal ini</TD>
            </TR>
            ) : (
            pageRows.map((row, idx) => (
              <TR key={row.id}>
                <TD>{startIndex + idx + 1}</TD>
                <TD>{formatDisplayDate(row.date)}</TD>
                <TD>{row.name}</TD>
                <TD>{row.code}</TD>
                <TD>{row.qty}</TD>
                <TD>{row.unit}</TD>
                <TD>{row.pic}</TD>
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

export default HistoryMasuk;
