import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchUnits, UnitItem } from '../api/units.api';

const UserPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="3.5" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
);

const ManageUnits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshFlag = (location.state as { refresh?: boolean } | null)?.refresh;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchUnits()
      .then((rows) => {
        if (!mounted) return;
        setUnits(rows);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setUnits([]);
        setError(err.message || 'Gagal memuat data unit dari server');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [refreshFlag]);

  return (
    <div className="history-page">
      <div className="requests-header section-spacer-sm">
        <h2 className="history-title">List User</h2>
        <Button type="button" variant="secondary" onClick={() => navigate('/manage-units/create')}>
          <UserPlusIcon />
          <span>Tambah Unit</span>
        </Button>
      </div>

      <div className="history-card">
        {error && <p className="danger-text" role="alert">{error}</p>}
        <Table>
          <THead>
            <TR>
              <TH style={{ width: '52px' }}>No</TH>
              <TH>Nama Unit</TH>
              <TH style={{ width: '180px' }}>Username</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={3} className="empty-row">Memuat data...</TD>
              </TR>
            ) : units.length === 0 ? (
              <TR>
                <TD colSpan={3} className="empty-row">Belum ada unit</TD>
              </TR>
            ) : (
              units.map((row, idx) => (
                <TR key={row.id}>
                  <TD>{idx + 1}</TD>
                  <TD>{row.name}</TD>
                  <TD>{row.username}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageUnits;
