import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { MobileCard, MobileCardList } from '../components/ui/MobileCard';
import { fetchHistoryKeluar, HistoryEntry, HistoryFilter } from '../api/history.api';

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

  const perPage = 10;

  const loadData = (filter?: HistoryFilter) => {
    setLoading(true);
    setFetchError(null);
    fetchHistoryKeluar(filter)
      .then((rows) => {
        setData(rows);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError('Gagal memuat data dari server');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [from, to]);

  const filtered = useMemo(() => {
    // Data is already filtered and sorted by backend
    return data;
  }, [data]);

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
    loadData();
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

        {/* Mobile Card View */}
        <MobileCardList
          isEmpty={pageRows.length === 0}
          isLoading={loading}
          emptyMessage="Tidak ada data pada rentang tanggal ini"
        >
          {pageRows.map((row, idx) => (
            <MobileCard
              key={row.id}
              header={
                <span className="mobile-card-header-title">{row.name}</span>
              }
              fields={[
                { label: 'No', value: startIndex + idx + 1 },
                { label: 'Tanggal', value: row.date },
                { label: 'Kode', value: row.code },
                { label: 'Jumlah', value: `${row.qty} ${row.unit}` },
                { label: 'Penerima', value: row.receiver },
                { label: 'Unit', value: row.dept },
              ]}
            />
          ))}
        </MobileCardList>

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
