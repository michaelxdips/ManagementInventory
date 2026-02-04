import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { MobileCard, MobileCardList } from '../components/ui/MobileCard';
import { approveRequest, fetchApproval, rejectRequest, ApprovalItem } from '../api/approval.api';
import { formatDateV2 } from '../utils/dateUtils';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 4 4 10-10" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const toBadgeVariant = (status: ApprovalItem['status']) => {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'pending';
};

const formatStatus = (status: ApprovalItem['status']) => {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
};

const Approval = () => {
  const [data, setData] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchApproval()
      .then((rows) => {
        setData(rows);
        setError(null);
      })
      .catch(() => {
        setData([]);
        setError('Gagal memuat data dari server');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  // OPTIMIZATION: Auto-Refresh (Real-time polling)
  // Poll every 10 seconds for new requests
  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if not currently processing or loading
      if (!processingId && !loading) {
        // Silent update (don't set loading=true)
        fetchApproval().then(setData).catch(() => { });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [processingId, loading]);

  const handleApprove = async (item: ApprovalItem) => {
    setProcessingId(item.id);
    try {
      const result = await approveRequest(item.id);
      setStatusMessage(result.message || `Permintaan ${item.name} disetujui. Stok berkurang.`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyetujui permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    setProcessingId(item.id);
    try {
      await rejectRequest(item.id);
      setStatusMessage('Permintaan ditolak');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menolak permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="history-page">
      <div className="history-card">
        <h2 className="history-title">Permintaan Barang Keluar</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          Setujui permintaan untuk mengurangi stok dan mencatat barang keluar.
        </p>

        {statusMessage && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--success-bg, #d4edda)',
            color: 'var(--success-text, #155724)',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {statusMessage}
          </div>
        )}
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
              <TH style={{ width: '160px' }}>Action</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={9} className="empty-row">Memuat data...</TD>
              </TR>
            ) : data.length === 0 ? (
              <TR>
                <TD colSpan={9} className="empty-row">Tidak ada permintaan yang menunggu persetujuan</TD>
              </TR>
            ) : (
              data.map((row, idx) => (
                <TR key={row.id}>
                  <TD>{idx + 1}</TD>
                  <TD>{formatDateV2(row.date)}</TD>
                  <TD>{row.name}</TD>
                  <TD>{row.code || '-'}</TD>
                  <TD>{row.qty}</TD>
                  <TD>{row.unit}</TD>
                  <TD>{row.receiver}</TD>
                  <TD>{row.dept}</TD>
                  <TD>
                    <div className="action-buttons">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApprove(row)}
                        disabled={processingId === row.id}
                      >
                        <CheckIcon /> {processingId === row.id ? '...' : 'Setujui'}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(row)}
                        disabled={processingId === row.id}
                      >
                        <XIcon /> Tolak
                      </Button>
                    </div>
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
          emptyMessage="Tidak ada permintaan yang menunggu persetujuan"
        >
          {data.map((row, idx) => (
            <MobileCard
              key={row.id}
              header={
                <>
                  <span className="mobile-card-header-title">{row.name}</span>
                  <span className="badge badge-pending">Pending</span>
                </>
              }
              fields={[
                { label: 'No', value: idx + 1 },
                { label: 'Tanggal', value: formatDateV2(row.date) },
                { label: 'Kode', value: row.code || '-' },
                { label: 'Jumlah', value: `${row.qty} ${row.unit}` },
                { label: 'Penerima', value: row.receiver },
                { label: 'Unit', value: row.dept },
              ]}
              actions={
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleApprove(row)}
                    disabled={processingId === row.id}
                  >
                    <CheckIcon /> {processingId === row.id ? '...' : 'Setujui'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => handleReject(row)}
                    disabled={processingId === row.id}
                  >
                    <XIcon /> Tolak
                  </Button>
                </>
              }
            />
          ))}
        </MobileCardList>
      </div>
    </div>
  );
};

export default Approval;
