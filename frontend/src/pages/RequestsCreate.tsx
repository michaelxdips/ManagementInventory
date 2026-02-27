import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { createRequest } from '../api/requests.api';
import { fetchItems, Item } from '../api/items.api';
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

  const [items, setItems] = useState<Item[]>([]);
  const [unitOptions, setUnitOptions] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formValues, setFormValues] = useState({
    item: '',
    date: '',
    qty: '',
    unit: '',
    receiver: '',
    dept: isUserRole && user?.name ? user.name : '',
  });
  const [saving, setSaving] = useState(false);

  // Search/filter state for item dropdown
  const [itemSearch, setItemSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchItems()
      .then((rows) => setItems(rows))
      .catch(() => setItems([]));

    fetchUnitNames()
      .then((names) => setUnitOptions(names))
      .catch(() => setUnitOptions([]));
  }, []);

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Select an item from the dropdown
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setItemSearch(item.name);
    setFormValues((prev) => ({
      ...prev,
      item: item.name,
      unit: item.unit,
    }));
    setShowDropdown(false);
  };

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

    // Validate against stock
    if (selectedItem && qtyNumber > selectedItem.quantity) {
      showToast(`Stok tidak cukup. Tersedia: ${selectedItem.quantity} ${selectedItem.unit}`);
      return;
    }

    setSaving(true);
    createRequest({ item, date, qty: qtyNumber, unit, receiver, dept })
      .then(() => {
        showToast('Request ATK berhasil dibuat', 'success');
        setFormValues({ item: '', date: '', qty: '', unit: '', receiver: '', dept: isUserRole && user?.name ? user.name : '' });
        setSelectedItem(null);
        setItemSearch('');
      })
      .catch((err: any) => {
        let msg = 'Gagal menyimpan ke server';
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
          {/* Nama Barang — Searchable Dropdown */}
          <label className="form-field" style={{ position: 'relative' }}>
            <span className="form-label">Nama Barang</span>
            <input
              className="input-control"
              value={itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setShowDropdown(true);
                // Clear selection if user types something different
                if (selectedItem && e.target.value !== selectedItem.name) {
                  setSelectedItem(null);
                  setFormValues((prev) => ({ ...prev, item: '', unit: '' }));
                }
              }}
              onFocus={() => { if (!selectedItem) setShowDropdown(true); }}
              placeholder="Ketik untuk mencari barang..."
              autoComplete="off"
            />
            {showDropdown && itemSearch && !selectedItem && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50,
              }}>
                {filteredItems.length === 0 ? (
                  <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Barang tidak ditemukan
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color, #f0f0f0)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover, #f7f7f7)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {item.code || 'No code'} · {item.location || '-'}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: item.quantity > 0 ? 'var(--success-text, #16a34a)' : 'var(--danger-text, #dc2626)',
                        whiteSpace: 'nowrap',
                      }}>
                        Stok: {item.quantity} {item.unit}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Click-away listener */}
            {showDropdown && (
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setShowDropdown(false)}
              />
            )}
            {selectedItem && (
              <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--success-text, #16a34a)', position: 'absolute', bottom: '-18px', left: 0 }}>
                ✓ Stok: {selectedItem.quantity} {selectedItem.unit}
              </div>
            )}
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
              max={selectedItem?.quantity || undefined}
              value={formValues.qty}
              onChange={(e) => handleChange('qty', e.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="form-label">Satuan</span>
            <input
              className="input-control"
              value={formValues.unit}
              disabled
              style={{ backgroundColor: 'var(--bg-muted, #f0f0f0)', cursor: 'not-allowed' }}
            />
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
            <Button type="submit" variant="secondary" disabled={saving || !selectedItem}>
              <PlusIcon />
              <span>{saving ? 'Mengirim...' : 'Simpan'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestsCreate;
