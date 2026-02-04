import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { MobileCard, MobileCardList } from '../components/ui/MobileCard';
import { fetchRequests, RequestItem } from '../api/requests.api';
import useAuth from '../hooks/useAuth';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Requests = () => {
  const [data, setData] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getStatusVariant = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'APPROVED') return 'approved';
    if (s === 'REJECTED') return 'rejected';
    return 'pending';
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

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
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={8} className="empty-row">Memuat data...</TD>
              </TR>
            ) : data.length === 0 ? (
              <TR>
                <TD colSpan={8} className="empty-row">Tidak ada permintaan</TD>
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
                    <Badge variant={getStatusVariant(row.status)}>
                      {formatStatus(row.status)}
                    </Badge>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        {/* Mobile Card View */}
        <MobileCardList
          isEmpty={data.length === 0}
          isLoading={loading}
          emptyMessage="Tidak ada permintaan"
        >
          {data.map((row, idx) => (
            <MobileCard
              key={row.id}
              header={
                <>
                  <span className="mobile-card-header-title">{row.item}</span>
                  <Badge variant={getStatusVariant(row.status)}>
                    {formatStatus(row.status)}
                  </Badge>
                </>
              }
              fields={[
                { label: 'No', value: idx + 1 },
                { label: 'Tanggal', value: row.date },
                { label: 'Jumlah', value: `${row.qty} ${row.unit}` },
                { label: 'Penerima', value: row.receiver },
                { label: 'Unit', value: row.dept },
              ]}
            />
          ))}
        </MobileCardList>
      </div>
    </div>
  );
};

export default Requests;
