import { useEffect, useState } from 'react';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import { MobileCard, MobileCardList } from '../components/ui/MobileCard';
import { fetchHistoryUser, HistoryEntry } from '../api/history.api';

const Information = () => {
  const [data, setData] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const perPage = 10;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchHistoryUser()
      .then((rows) => {
        if (!mounted) return;
        setData(rows);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setData([]);
        setError(err.message || 'Gagal memuat data dari server');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, data.length);
  const displayItems = data.slice(startIndex, endIndex);

  const getStatusVariant = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') return 'approved';
    if (s === 'REJECTED') return 'rejected';
    return 'pending';
  };

  const formatStatus = (status?: string) => {
    if (!status) return '-';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="history-page">
      <div className="history-card">
        <h2 className="history-title">Riwayat Permintaan ATK</h2>

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
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={8} className="empty-row">Memuat data...</TD>
              </TR>
            ) : displayItems.length === 0 ? (
              <TR>
                <TD colSpan={8} className="empty-row">Belum ada riwayat permintaan</TD>
              </TR>
            ) : (
              displayItems.map((item, idx) => (
                <TR key={item.id}>
                  <TD>{startIndex + idx + 1}</TD>
                  <TD>{item.date}</TD>
                  <TD>{item.name}</TD>
                  <TD>{item.code || '-'}</TD>
                  <TD>{item.qty}</TD>
                  <TD>{item.unit}</TD>
                  <TD>{item.receiver || '-'}</TD>
                  <TD>
                    <Badge variant={getStatusVariant(item.status)}>
                      {formatStatus(item.status)}
                    </Badge>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        {/* Mobile Card View */}
        <MobileCardList
          isEmpty={displayItems.length === 0}
          isLoading={loading}
          emptyMessage="Belum ada riwayat permintaan"
        >
          {displayItems.map((item, idx) => (
            <MobileCard
              key={item.id}
              header={
                <>
                  <span className="mobile-card-header-title">{item.name}</span>
                  <Badge variant={getStatusVariant(item.status)}>
                    {formatStatus(item.status)}
                  </Badge>
                </>
              }
              fields={[
                { label: 'No', value: startIndex + idx + 1 },
                { label: 'Tanggal', value: item.date },
                { label: 'Kode', value: item.code || '-' },
                { label: 'Jumlah', value: `${item.qty} ${item.unit}` },
                { label: 'Penerima', value: item.receiver || '-' },
              ]}
            />
          ))}
        </MobileCardList>

        <div className="items-footer">
          <span className="items-meta">
            Menampilkan {data.length > 0 ? startIndex + 1 : 0} - {endIndex} dari {data.length} permintaan
          </span>
          <Pagination current={currentPage} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default Information;

