import { useEffect, useMemo, useState } from 'react';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import { fetchHistoryKeluar, HistoryEntry } from '../api/history.api';
import useAuth from '../hooks/useAuth';

const fallbackEntries: HistoryEntry[] = [
  {
    id: 1,
    date: '2026-01-21',
    name: 'Folder One Transparent',
    code: 'FDR-ONE-TPR',
    qty: 1,
    unit: 'pcs',
    receiver: 'User Name',
    dept: 'Department',
  },
];

const Information = () => {
  const { user } = useAuth();
  const [data, setData] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const perPage = 10;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchHistoryKeluar()
      .then((rows) => {
        if (!mounted) return;
        // Filter by current user's name (receiver)
        const userItems = rows.filter((row) => row.receiver === user?.name);
        setData(userItems);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setData(fallbackEntries);
        setError('Gagal memuat data dari server, menampilkan data mock');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.name]);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, data.length);
  const displayItems = data.slice(startIndex, endIndex);

  return (
    <div className="history-page">
      <div className="history-card">
        <h2 className="history-title">Informasi Barang Keluar (Barang yang Sudah Diambil)</h2>

        {error && <p className="danger-text" role="alert">{error}</p>}
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
            ) : displayItems.length === 0 ? (
              <TR>
                <TD colSpan={8} className="empty-row">Tidak ada data barang yang sudah diambil</TD>
              </TR>
            ) : (
              displayItems.map((item, idx) => (
                <TR key={item.id}>
                  <TD>{startIndex + idx + 1}</TD>
                  <TD>{item.date}</TD>
                  <TD>{item.name}</TD>
                  <TD>{item.code}</TD>
                  <TD>{item.qty}</TD>
                  <TD>{item.unit}</TD>
                  <TD>{item.receiver}</TD>
                  <TD>{item.dept}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <div className="items-footer">
          <span className="items-meta">
            Menampilkan {startIndex + 1} - {endIndex} dari {data.length} barang
          </span>
          <Pagination current={currentPage} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default Information;
