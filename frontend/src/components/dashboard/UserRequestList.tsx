import { useEffect, useState } from 'react';
import Badge from '../ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table';
import { MobileCard, MobileCardList } from '../ui/MobileCard';
import { fetchRequests, RequestItem } from '../../api/requests.api';
import { formatDateV2 } from '../../utils/dateUtils';

interface UserRequestListProps {
    refreshTrigger: number;
}

const UserRequestList = ({ refreshTrigger }: UserRequestListProps) => {
    const [data, setData] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        // Fetch specific user requests (API filters by token)
        fetchRequests()
            .then((rows) => {
                if (!mounted) return;
                // Slice to top 10 for dashboard
                setData(rows.slice(0, 10));
                setError(null);
            })
            .catch((err) => {
                if (!mounted) return;
                setData([]);
                setError(err.message || 'Gagal memuat data');
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [refreshTrigger]);

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
        <div className="history-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className="history-title" style={{ marginBottom: '16px' }}>Riwayat Permintaan (Terbaru)</h3>

            {error && <p className="danger-text" role="alert">{error}</p>}

            <div style={{ flex: 1, overflow: 'auto' }}>
                <Table>
                    <THead>
                        <TR>
                            <TH>Tanggal</TH>
                            <TH>Barang</TH>
                            <TH>Jml</TH>
                            <TH>Status</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {loading ? (
                            <TR><TD colSpan={4} className="empty-row">Memuat...</TD></TR>
                        ) : data.length === 0 ? (
                            <TR><TD colSpan={4} className="empty-row">Belum ada permintaan</TD></TR>
                        ) : (
                            data.map((row) => (
                                <TR key={row.id}>
                                    <TD>{formatDateV2(row.date)}</TD>
                                    <TD>{row.item}</TD>
                                    <TD>{row.qty} {row.unit}</TD>
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

                {/* Simplified Mobile View */}
                <div className="mobile-only">
                    {data.map((row) => (
                        <div key={row.id} style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>{row.item}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {formatDateV2(row.date)} · {row.qty} {row.unit}
                                </div>
                            </div>
                            <Badge variant={getStatusVariant(row.status)}>
                                {formatStatus(row.status)}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserRequestList;
