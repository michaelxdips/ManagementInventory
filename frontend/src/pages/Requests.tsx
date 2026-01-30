import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchRequests, RequestItem } from '../api/requests.api';
import useAuth from '../hooks/useAuth';

const fallbackRows: RequestItem[] = [
  {
    id: 1,
    date: '2026-01-21',
    item: 'Gunting',
    qty: 2,
    unit: 'pieces',
    receiver: 'Ayu',
    dept: 'Government Service',
    status: 'PENDING',
  },
  {
    id: 2,
    date: '2025-08-29',
    item: 'Monitor AOC',
    qty: 5,
    unit: 'pcs',
    receiver: 'eti',
    dept: 'Share Service & General Support',
    status: 'REJECTED',
  },
];

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Requests = () => {
  const [data, setData] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isUser = hasRole(['user']);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRequests()
      .then((rows) => {
        if (!mounted) return;
        setData(rows);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setData(fallbackRows);
        setError('Gagal memuat data dari server, menampilkan data mock');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h2 className="history-title">List Permintaan</h2>
        {isUser && (
          <Button type="button" variant="secondary" onClick={() => navigate('/requests/create')}>
            <PlusIcon />
            <span>Request ATK</span>
          </Button>
        )}
      </div>

      <div className="history-card">
        {statusMessage && <p className="items-meta" role="status">{statusMessage}</p>}
        {error && <p className="danger-text" role="alert">{error}</p>}
        <Table>
          <THead>
            <TR>
              <TH style={{ width: '52px' }}>No</TH>
              <TH>Tanggal</TH>
              <TH>Nama Barang</TH>
              <TH>Jumlah</TH>
              <TH>Satuan</TH>
              <TH>Penerima</TH>
              <TH>Unit</TH>
              <TH>Status</TH>
              <TH style={{ width: '200px' }}>Action</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={9} className="empty-row">Memuat data...</TD>
              </TR>
            ) : (
              data.map((row, idx) => (
                <TR key={row.id}>
                  <TD>{idx + 1}</TD>
                  <TD>{row.date}</TD>
                  <TD>{row.item}</TD>
                  <TD>{row.qty}</TD>
                  <TD>{row.unit}</TD>
                  <TD>{row.receiver}</TD>
                  <TD>{row.dept}</TD>
                  <TD>
                    <Badge variant={row.status === 'PENDING' ? 'pending' : row.status === 'APPROVED' ? 'approved' : 'rejected'}>
                      {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="items-meta">Tidak ada aksi di halaman ini.</div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default Requests;
