import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { approveRequest, fetchApproval, rejectRequest, ApprovalItem } from '../api/approval.api';

const fallbackRows: ApprovalItem[] = [
  {
    id: 1,
    date: '2026-01-15',
    name: 'Map Bening Dataflex',
    code: 'MAP-CLS-DTX',
    qty: 1,
    unit: 'pcs',
    receiver: 'Wulan',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 2,
    date: '2026-01-15',
    name: 'kertas paper one A4',
    code: 'PPR-ONE-A4',
    qty: 1,
    unit: 'rim',
    receiver: 'Wulan',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 3,
    date: '2026-01-05',
    name: 'Map Bening Dataflex',
    code: 'MAP-CLS-DTX',
    qty: 2,
    unit: 'pcs',
    receiver: 'Alma',
    dept: 'Performance, Risk & QOS',
    status: 'pending',
  },
  {
    id: 4,
    date: '2026-01-06',
    name: 'kertas paper one A4',
    code: 'PPR-ONE-A4',
    qty: 1,
    unit: 'rim',
    receiver: 'wulan',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 5,
    date: '2026-01-07',
    name: 'Baterai AAA',
    code: 'BTR-A3',
    qty: 2,
    unit: 'pcs',
    receiver: 'Akbar',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 6,
    date: '2026-01-07',
    name: 'Pilot Hitam',
    code: 'PLT-HTM',
    qty: 1,
    unit: 'pcs',
    receiver: 'eti',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 7,
    date: '2026-01-07',
    name: 'Pilot Biru',
    code: 'PLT-BLU',
    qty: 1,
    unit: 'pcs',
    receiver: 'Eti',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 8,
    date: '2026-01-06',
    name: 'Lakban Hijau Besar',
    code: 'SLS-HJU-BIG',
    qty: 1,
    unit: 'pcs',
    receiver: 'Taufik',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 9,
    date: '2026-01-06',
    name: 'kertas paper one A4',
    code: 'PPR-ONE-A4',
    qty: 1,
    unit: 'rim',
    receiver: 'wulan',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
  {
    id: 10,
    date: '2026-01-06',
    name: 'Label Tom & Jerry No.121',
    code: 'LBL-TNJ-121',
    qty: 1,
    unit: 'bungkus',
    receiver: 'Faizal',
    dept: 'Share Service & General Support',
    status: 'pending',
  },
];

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

  const loadData = () => {
    setLoading(true);
    fetchApproval()
      .then((rows) => {
        setData(rows);
        setError(null);
      })
      .catch(() => {
        setData(fallbackRows);
        setError('Gagal memuat data dari server, menampilkan data mock');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleApprove = (id: number) => {
    approveRequest(id)
      .then(() => {
        setStatusMessage('Permintaan disetujui');
        setError(null);
        loadData();
      })
      .catch(() => setError('Gagal menyetujui (server)'));
  };

  const handleReject = (id: number) => {
    rejectRequest(id)
      .then(() => {
        setStatusMessage('Permintaan ditolak');
        setError(null);
        loadData();
      })
      .catch(() => setError('Gagal menolak (server)'));
  };
  return (
    <div className="history-page">
      <div className="history-card">
        <h2 className="history-title">Permintaan Barang Keluar</h2>

        {statusMessage && <p className="items-meta" role="status">{statusMessage}</p>}
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
              <TH>Status</TH>
              <TH style={{ width: '140px' }}>Action</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={10} className="empty-row">Memuat data...</TD>
              </TR>
            ) : (
              data.map((row, idx) => (
                <TR key={row.id}>
                  <TD>{idx + 1}</TD>
                  <TD>{row.date}</TD>
                  <TD>{row.name}</TD>
                  <TD>{row.code}</TD>
                  <TD>{row.qty}</TD>
                  <TD>{row.unit}</TD>
                  <TD>{row.receiver}</TD>
                  <TD>{row.dept}</TD>
                  <TD>
                    <Badge variant={toBadgeVariant(row.status)}>{formatStatus(row.status)}</Badge>
                  </TD>
                  <TD>
                    <div className="action-buttons">
                      {row.status === 'pending' ? (
                        <>
                          <Button type="button" variant="secondary" size="sm" onClick={() => handleApprove(row.id)}>
                            <CheckIcon /> Setujui
                          </Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => handleReject(row.id)}>
                            <XIcon /> Tolak
                          </Button>
                        </>
                      ) : (
                        <span className="items-meta">-</span>
                      )}
                    </div>
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

export default Approval;
