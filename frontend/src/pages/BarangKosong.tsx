import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { fetchBarangKosong, BarangKosongItem } from '../api/barangKosong.api';

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M6 9V4h12v5" />
    <path d="M6 14h12v6H6z" />
    <path d="M6 10H5a2 2 0 0 0-2 2v4h3" />
    <path d="M18 10h1a2 2 0 0 1 2 2v4h-3" />
    <path d="M9 16h6" />
  </svg>
);

const BarangKosong = () => {
  const [items, setItems] = useState<BarangKosongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBarangKosong()
      .then((data) => {
        if (!mounted) return;
        setItems(data);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Gagal memuat data barang kosong');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="history-page">
      <style>{`
        @media print {
          body { background: #fff; }
          .app-shell__sidebar, .app-shell__header, nav { display: none !important; }
          .history-page { padding: 0; }
          .history-card { box-shadow: none; border: none; }
          .print-action { display: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; }
        }
      `}</style>

      <div className="requests-header section-spacer-sm">
        <h2 className="history-title">List Barang Kosong</h2>
        <Button
          type="button"
          variant="secondary"
          className="print-action"
          onClick={() => typeof window !== 'undefined' && window.print()}
        >
          <PrintIcon />
          <span>Print</span>
        </Button>
      </div>

      <div className="history-card">
        {error && <p className="danger-text" role="alert">{error}</p>}
        <Table>
          <THead>
            <TR>
              <TH style={{ width: '52px' }}>No</TH>
              <TH>Nama Barang</TH>
              <TH>Kode Barang</TH>
              <TH>Lokasi Simpan</TH>
            </TR>
          </THead>
          <TBody>
            {loading ? (
              <TR>
                <TD colSpan={4}>Memuat...</TD>
              </TR>
            ) : items.length === 0 ? (
              <TR>
                <TD colSpan={4}>Tidak ada data</TD>
              </TR>
            ) : (
              items.map((item, idx) => (
                <TR key={item.id}>
                  <TD>{idx + 1}</TD>
                  <TD>{item.name}</TD>
                  <TD>{item.code ?? '-'}</TD>
                  <TD>{item.location ?? '-'}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default BarangKosong;
