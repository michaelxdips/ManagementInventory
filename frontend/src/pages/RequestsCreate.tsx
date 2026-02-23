import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { createRequest } from '../api/requests.api';
import { fetchUnitNames } from '../api/units.api';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const RequestsCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isUserRole = user?.role === 'user';
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState({
    item: '',
    date: '',
    qty: '',
    unit: '',
    receiver: '',
    dept: isUserRole && user?.name ? user.name : '',
  });
  const [unitOptions, setUnitOptions] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUnitNames()
      .then((names) => setUnitOptions(names))
      .catch(() => setUnitOptions([]));
  }, []);

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { item, date, qty, unit, receiver, dept } = formValues;
    if (!item || !date || !qty || !unit || !receiver || !dept) {
      showToast('Semua field wajib diisi');
      return;
    }
    const qtyNumber = Number(qty);
    if (Number.isNaN(qtyNumber) || qtyNumber <= 0) {
      showToast('Jumlah harus lebih dari 0');
      return;
    }
    setSaving(true);
    createRequest({ item, date, qty: qtyNumber, unit, receiver, dept })
      .then(() => {
        showToast('Request ATK berhasil dibuat', 'success');
        setFormValues({ item: '', date: '', qty: '', unit: '', receiver: '', dept: isUserRole && user?.name ? user.name : '' });
      })
      .catch(() => {
        showToast('Gagal menyimpan ke server');
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="requests-page">
      <div className="requests-header section-spacer-md">
        <h2 className="history-title">Masukkan Request</h2>
        <Button type="button" variant="ghost" onClick={() => navigate('/requests')}>
          Kembali ke list
        </Button>
      </div>

      <div className="history-card">
        <div className="history-title title-inline">
          <PlusIcon /> <span>Form Request</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Nama Barang</span>
            <input className="input-control" value={formValues.item} onChange={(e) => handleChange('item', e.target.value)} />
          </label>
          <label className="form-field">
            <span className="form-label">Tanggal</span>
            <input
              className="input-control"
              type="date"
              placeholder="dd/mm/yyyy"
              value={formValues.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="form-label">Jumlah</span>
            <input
              className="input-control"
              type="number"
              min="1"
              value={formValues.qty}
              onChange={(e) => handleChange('qty', e.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="form-label">Satuan</span>
            <input className="input-control" value={formValues.unit} onChange={(e) => handleChange('unit', e.target.value)} />
          </label>
          <label className="form-field">
            <span className="form-label">Penerima</span>
            <input className="input-control" value={formValues.receiver} onChange={(e) => handleChange('receiver', e.target.value)} />
          </label>
          <label className="form-field">
            <span className="form-label">Unit</span>
            {isUserRole ? (
              <input
                className="input-control"
                value={formValues.dept}
                disabled
                style={{ backgroundColor: 'var(--bg-muted, #f0f0f0)', cursor: 'not-allowed' }}
              />
            ) : (
              <select
                className="input-control"
                value={formValues.dept}
                onChange={(e) => handleChange('dept', e.target.value)}
              >
                <option value="">-- Pilih Unit --</option>
                {unitOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
          </label>

          <div className="form-actions form-actions-wide">
            <div className="items-meta" aria-live="polite">
            </div>
            <Button type="submit" variant="secondary" disabled={saving}>
              <PlusIcon />
              <span>Simpan</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestsCreate;
