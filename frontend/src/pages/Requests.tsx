import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { MobileCard, MobileCardList } from '../components/ui/MobileCard';
import { fetchRequests, RequestItem } from '../api/requests.api';
import { fetchNewItemRequests, createNewItemRequest, NewItemRequest } from '../api/newItemRequests.api';
import useAuth from '../hooks/useAuth';
import { formatDateV2 } from '../utils/dateUtils';
import { useToast } from '../components/ui/Toast';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

type TabType = 'ambil' | 'baru';

const getStatusVariant = (status: string) => {
  const s = status.toUpperCase();
  if (s === 'APPROVED') return 'approved';
  if (s === 'REJECTED') return 'rejected';
  return 'pending';
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const Requests = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ambil');
  const [ambilData, setAmbilData] = useState<RequestItem[]>([]);
  const [baruData, setBaruData] = useState<NewItemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isUser = hasRole(['user']);
  const { showToast } = useToast();

  // New item form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    item_name: '',
    description: '',
    satuan: '',
    category: '',
    reason: '',
  });

  const loadAmbilData = () => {
    setLoading(true);
    fetchRequests()
      .then((rows) => {
        const filtered = isUser
          ? rows.filter((r) => {
            const s = r.status.toUpperCase();
            return s === 'PENDING' || s === 'APPROVAL_REVIEW';
          })
          : rows;
        setAmbilData(filtered);
      })
      .catch(() => {
        setAmbilData([]);
        showToast('Gagal memuat data dari server');
      })
      .finally(() => setLoading(false));
  };

  const loadBaruData = () => {
    setLoading(true);
    fetchNewItemRequests()
      .then((rows) => setBaruData(rows))
      .catch(() => {
        setBaruData([]);
        showToast('Gagal memuat data dari server');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'ambil') {
      loadAmbilData();
    } else {
      loadBaruData();
    }
  }, [activeTab]);

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.item_name.trim()) {
      showToast('Nama barang wajib diisi');
      return;
    }
    setSaving(true);
    createNewItemRequest({
      item_name: formValues.item_name.trim(),
      description: formValues.description.trim() || undefined,
      satuan: formValues.satuan.trim() || undefined,
      category: formValues.category.trim() || undefined,
      reason: formValues.reason.trim() || undefined,
    })
      .then(() => {
        showToast('Request barang baru berhasil dikirim', 'success');
        setFormValues({ item_name: '', description: '', satuan: '', category: '', reason: '' });
        setShowForm(false);
        loadBaruData();
      })
      .catch((err: any) => {
        let msg = 'Gagal mengirim request';
        if (err?.message) {
          try {
            const parsed = JSON.parse(err.message);
            msg = parsed.message || msg;
          } catch {
            msg = err.message;
          }
        }
        showToast(msg);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h2 className="history-title">Permintaan Barang</h2>
        {activeTab === 'ambil' && isUser && (
          <Button type="button" variant="secondary" onClick={() => navigate('/requests/create')}>
            <PlusIcon />
            <span>Ambil Barang</span>
          </Button>
        )}
        {activeTab === 'baru' && (
          <Button type="button" variant="secondary" onClick={() => setShowForm(!showForm)}>
            <PlusIcon />
            <span>{showForm ? 'Tutup Form' : 'Request Baru'}</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '16px',
        borderBottom: '2px solid var(--border-color, #e2e8f0)',
      }}>
        <button
          onClick={() => setActiveTab('ambil')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'ambil' ? '600' : '400',
            color: activeTab === 'ambil' ? 'var(--primary, #4f46e5)' : 'var(--text-muted, #64748b)',
            borderBottom: activeTab === 'ambil' ? '2px solid var(--primary, #4f46e5)' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          Ambil Barang
        </button>
        <button
          onClick={() => setActiveTab('baru')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'baru' ? '600' : '400',
            color: activeTab === 'baru' ? 'var(--primary, #4f46e5)' : 'var(--text-muted, #64748b)',
            borderBottom: activeTab === 'baru' ? '2px solid var(--primary, #4f46e5)' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          Request Barang Baru
        </button>
      </div>

      {/* ========== TAB: AMBIL BARANG ========== */}
      {activeTab === 'ambil' && (
        <div className="history-card">
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
                <TR><TD colSpan={8} className="empty-row">Memuat data...</TD></TR>
              ) : ambilData.length === 0 ? (
                <TR><TD colSpan={8} className="empty-row">Tidak ada permintaan</TD></TR>
              ) : (
                ambilData.map((row, idx) => (
                  <TR key={row.id}>
                    <TD>{idx + 1}</TD>
                    <TD>{formatDateV2(row.date)}</TD>
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

          <MobileCardList isEmpty={ambilData.length === 0} isLoading={loading} emptyMessage="Tidak ada permintaan">
            {ambilData.map((row, idx) => (
              <MobileCard
                key={row.id}
                header={
                  <>
                    <span className="mobile-card-header-title">{row.item}</span>
                    <Badge variant={getStatusVariant(row.status)}>{formatStatus(row.status)}</Badge>
                  </>
                }
                fields={[
                  { label: 'No', value: idx + 1 },
                  { label: 'Tanggal', value: formatDateV2(row.date) },
                  { label: 'Jumlah', value: `${row.qty} ${row.unit}` },
                  { label: 'Penerima', value: row.receiver },
                  { label: 'Unit', value: row.dept },
                ]}
              />
            ))}
          </MobileCardList>
        </div>
      )}

      {/* ========== TAB: REQUEST BARANG BARU ========== */}
      {activeTab === 'baru' && (
        <>
          {/* New Item Form */}
          {showForm && (
            <div className="history-card" style={{ marginBottom: '16px' }}>
              <div className="history-title title-inline" style={{ marginBottom: '16px' }}>
                <PlusIcon /> <span>Form Request Barang Baru</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '13px' }}>
                Request barang yang <strong>belum ada</strong> di inventory. Barang yang sudah ada gunakan tab "Ambil Barang".
              </p>

              <form className="form-grid" onSubmit={handleSubmitNewItem}>
                <label className="form-field">
                  <span className="form-label">Nama Barang <span style={{ color: 'var(--danger-text, red)' }}>*</span></span>
                  <input className="input-control" value={formValues.item_name} onChange={(e) => handleChange('item_name', e.target.value)} placeholder="Contoh: Spidol Boardmarker Biru" />
                </label>
                <label className="form-field">
                  <span className="form-label">Deskripsi</span>
                  <input className="input-control" value={formValues.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Deskripsi tambahan (opsional)" />
                </label>
                <label className="form-field">
                  <span className="form-label">Satuan</span>
                  <input className="input-control" value={formValues.satuan} onChange={(e) => handleChange('satuan', e.target.value)} placeholder="Contoh: pcs, pack, rim (opsional)" />
                </label>
                <label className="form-field">
                  <span className="form-label">Kategori</span>
                  <input className="input-control" value={formValues.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="Contoh: ATK, Elektronik (opsional)" />
                </label>
                <label className="form-field">
                  <span className="form-label">Alasan Request</span>
                  <input className="input-control" value={formValues.reason} onChange={(e) => handleChange('reason', e.target.value)} placeholder="Jelaskan alasan request (opsional)" />
                </label>
                <div className="form-actions form-actions-wide">
                  <div />
                  <Button type="submit" variant="secondary" disabled={saving}>
                    <PlusIcon />
                    <span>{saving ? 'Mengirim...' : 'Kirim Request'}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* New Item List */}
          <div className="history-card">
            <Table>
              <THead>
                <TR>
                  <TH style={{ width: '52px' }}>No</TH>
                  <TH>Nama Barang</TH>
                  <TH>Deskripsi</TH>
                  <TH>Satuan</TH>
                  <TH>Tanggal</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {loading ? (
                  <TR><TD colSpan={6} className="empty-row">Memuat data...</TD></TR>
                ) : baruData.length === 0 ? (
                  <TR><TD colSpan={6} className="empty-row">Belum ada request barang baru</TD></TR>
                ) : (
                  baruData.map((row, idx) => (
                    <TR key={row.id}>
                      <TD>{idx + 1}</TD>
                      <TD>{row.item_name}</TD>
                      <TD>{row.description || '-'}</TD>
                      <TD>{row.satuan || '-'}</TD>
                      <TD>{formatDate(row.created_at)}</TD>
                      <TD>
                        <Badge variant={getStatusVariant(row.status)}>
                          {formatStatus(row.status)}
                        </Badge>
                        {row.status === 'REJECTED' && row.reject_reason && (
                          <div style={{ fontSize: '11px', color: 'var(--danger-text)', marginTop: '4px' }}>
                            Alasan: {row.reject_reason}
                          </div>
                        )}
                        {row.status === 'APPROVED' && row.approved_quantity && (
                          <div style={{ fontSize: '11px', color: 'var(--success-text)', marginTop: '4px' }}>
                            Qty: {row.approved_quantity}
                          </div>
                        )}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>

            <MobileCardList isEmpty={baruData.length === 0} isLoading={loading} emptyMessage="Belum ada request barang baru">
              {baruData.map((row, idx) => (
                <MobileCard
                  key={row.id}
                  header={
                    <>
                      <span className="mobile-card-header-title">{row.item_name}</span>
                      <Badge variant={getStatusVariant(row.status)}>{formatStatus(row.status)}</Badge>
                    </>
                  }
                  fields={[
                    { label: 'No', value: idx + 1 },
                    { label: 'Deskripsi', value: row.description || '-' },
                    { label: 'Satuan', value: row.satuan || '-' },
                    { label: 'Tanggal', value: formatDate(row.created_at) },
                    ...(row.status === 'REJECTED' && row.reject_reason ? [{ label: 'Alasan Ditolak', value: row.reject_reason }] : []),
                    ...(row.status === 'APPROVED' && row.approved_quantity ? [{ label: 'Qty Disetujui', value: row.approved_quantity }] : []),
                  ]}
                />
              ))}
            </MobileCardList>
          </div>
        </>
      )}
    </div>
  );
};

export default Requests;
