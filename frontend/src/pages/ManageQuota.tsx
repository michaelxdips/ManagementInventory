import { useEffect, useState } from 'react';
import { fetchQuotas, createQuota, deleteQuota, fetchQuotaItems, fetchQuotaUnits, QuotaItem, QuotaItemOption, QuotaUnitOption } from '../api/quota.api';
import Button from '../components/ui/Button';

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-2 14H7L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

const ManageQuota = () => {
    const [quotas, setQuotas] = useState<QuotaItem[]>([]);
    const [items, setItems] = useState<QuotaItemOption[]>([]);
    const [units, setUnits] = useState<QuotaUnitOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ item_id: '', unit_id: '', quota_max: '' });
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [q, i, u] = await Promise.all([fetchQuotas(), fetchQuotaItems(), fetchQuotaUnits()]);
            setQuotas(q);
            setItems(i);
            setUnits(u);
            setError(null);
        } catch {
            setError('Gagal memuat data quota');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.item_id || !formData.unit_id || !formData.quota_max) {
            setError('Semua field wajib diisi');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await createQuota({
                item_id: parseInt(formData.item_id),
                unit_id: parseInt(formData.unit_id),
                quota_max: parseInt(formData.quota_max),
            });
            setSuccess('Quota berhasil disimpan');
            setFormData({ item_id: '', unit_id: '', quota_max: '' });
            setShowForm(false);
            await loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            let msg = 'Gagal menyimpan quota';
            try { msg = JSON.parse(err.message).message || msg; } catch { }
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteQuota(id);
            setSuccess('Quota berhasil dihapus');
            setDeleteId(null);
            await loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError('Gagal menghapus quota');
        }
    };

    return (
        <div className="requests-page">
            <div className="requests-header section-spacer-md">
                <h2 className="history-title">Kelola Jatah Unit</h2>
                <Button type="button" variant="secondary" onClick={() => setShowForm(!showForm)}>
                    <PlusIcon /> <span>{showForm ? 'Tutup Form' : 'Tambah Jatah'}</span>
                </Button>
            </div>

            {success && (
                <div style={{
                    padding: '12px 16px',
                    background: 'var(--success-bg, #d4edda)',
                    color: 'var(--success-text, #155724)',
                    borderRadius: '6px',
                    marginBottom: '16px'
                }}>
                    {success}
                </div>
            )}
            {error && <p className="danger-text" style={{ marginBottom: '16px' }}>{error}</p>}

            {/* Create / Update Form */}
            {showForm && (
                <div className="history-card" style={{ marginBottom: '16px' }}>
                    <div className="history-title title-inline">
                        <PlusIcon /> <span>Tambah / Update Jatah</span>
                    </div>
                    <form className="form-grid" onSubmit={handleCreate}>
                        <label className="form-field">
                            <span className="form-label">Barang</span>
                            <select
                                className="input-control"
                                value={formData.item_id}
                                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                            >
                                <option value="">-- Pilih Barang --</option>
                                {items.map((i) => (
                                    <option key={i.id} value={i.id}>{i.name} {i.code ? `(${i.code})` : ''}</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Unit</span>
                            <select
                                className="input-control"
                                value={formData.unit_id}
                                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                            >
                                <option value="">-- Pilih Unit --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Jatah Maksimal</span>
                            <input
                                className="input-control"
                                type="number"
                                min="0"
                                value={formData.quota_max}
                                onChange={(e) => setFormData({ ...formData, quota_max: e.target.value })}
                            />
                        </label>
                        <div className="form-actions form-actions-wide">
                            <Button type="submit" variant="secondary" disabled={saving}>
                                <PlusIcon /> <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Quota Table */}
            <div className="history-card">
                {loading ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Memuat data...</p>
                ) : quotas.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                        Belum ada jatah yang diatur. Klik "Tambah Jatah" untuk mulai.
                    </p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Barang</th>
                                        <th>Kode</th>
                                        <th>Unit</th>
                                        <th>Jatah Max</th>
                                        <th>Terpakai</th>
                                        <th>Sisa</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotas.map((q) => (
                                        <tr key={q.id}>
                                            <td>{q.item_name}</td>
                                            <td>{q.item_code || '-'}</td>
                                            <td>{q.unit_name}</td>
                                            <td>{q.quota_max}</td>
                                            <td>{q.quota_used}</td>
                                            <td style={{ color: q.quota_remaining <= 0 ? '#f87171' : '#4ade80', fontWeight: 600 }}>
                                                {q.quota_remaining}
                                            </td>
                                            <td>
                                                {deleteId === q.id ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <Button type="button" variant="danger" onClick={() => handleDelete(q.id)}>Ya</Button>
                                                        <Button type="button" variant="ghost" onClick={() => setDeleteId(null)}>Batal</Button>
                                                    </div>
                                                ) : (
                                                    <Button type="button" variant="ghost" onClick={() => setDeleteId(q.id)}>
                                                        <TrashIcon />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="mobile-card-list">
                            {quotas.map((q) => (
                                <div className="mobile-card" key={q.id}>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Barang</span>
                                        <span>{q.item_name}</span>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Kode</span>
                                        <span>{q.item_code || '-'}</span>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Unit</span>
                                        <span>{q.unit_name}</span>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Jatah Max</span>
                                        <span>{q.quota_max}</span>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Terpakai</span>
                                        <span>{q.quota_used}</span>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Sisa</span>
                                        <span style={{ color: q.quota_remaining <= 0 ? '#f87171' : '#4ade80', fontWeight: 600 }}>
                                            {q.quota_remaining}
                                        </span>
                                    </div>
                                    <div className="mobile-card-row" style={{ justifyContent: 'flex-end' }}>
                                        {deleteId === q.id ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <Button type="button" variant="danger" onClick={() => handleDelete(q.id)}>Ya, Hapus</Button>
                                                <Button type="button" variant="ghost" onClick={() => setDeleteId(null)}>Batal</Button>
                                            </div>
                                        ) : (
                                            <Button type="button" variant="ghost" onClick={() => setDeleteId(q.id)}>
                                                <TrashIcon /> <span>Hapus</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageQuota;
