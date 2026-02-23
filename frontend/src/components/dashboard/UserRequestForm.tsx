import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { createRequest } from '../../api/requests.api';
import { fetchUnitNames } from '../../api/units.api';
import useAuth from '../../hooks/useAuth';

interface UserRequestFormProps {
    onSuccess: () => void;
}

const UserRequestForm = ({ onSuccess }: UserRequestFormProps) => {
    const { user } = useAuth();
    const isUserRole = user?.role === 'user';
    const [formValues, setFormValues] = useState({
        item: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        qty: '',
        unit: '',
        receiver: '',
        dept: isUserRole && user?.name ? user.name : '',
    });
    const [unitOptions, setUnitOptions] = useState<string[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
            setFormError('Semua field wajib diisi');
            setSuccessMsg(null);
            return;
        }

        const qtyNumber = Number(qty);
        if (Number.isNaN(qtyNumber) || qtyNumber <= 0) {
            setFormError('Jumlah harus lebih dari 0');
            setSuccessMsg(null);
            return;
        }

        setFormError(null);
        setSaving(true);

        createRequest({ item, date, qty: qtyNumber, unit, receiver, dept })
            .then(() => {
                setSuccessMsg('Request berhasil dikirim');
                setFormValues({
                    item: '',
                    date: new Date().toISOString().split('T')[0],
                    qty: '',
                    unit: '',
                    receiver: '',
                    dept: '' // Keep dept? Maybe better to clear.
                });
                onSuccess(); // Trigger list refresh
                // Auto-hide success message
                setTimeout(() => setSuccessMsg(null), 3000);
            })
            .catch((err) => {
                setFormError(err.message || 'Gagal menyimpan request');
                setSuccessMsg(null);
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="history-card" style={{ height: '100%' }}>
            <h3 className="history-title" style={{ marginBottom: '16px' }}>Buat Permintaan Baru</h3>

            <form className="form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={handleSubmit}>
                <label className="form-field">
                    <span className="form-label">Nama Barang</span>
                    <input
                        className="input-control"
                        value={formValues.item}
                        onChange={(e) => handleChange('item', e.target.value)}
                        placeholder="Contoh: Kertas A4"
                    />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label className="form-field">
                        <span className="form-label">Tanggal</span>
                        <input
                            className="input-control"
                            type="date"
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label className="form-field">
                        <span className="form-label">Satuan</span>
                        <input
                            className="input-control"
                            value={formValues.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                            placeholder="Pcs/Pack"
                        />
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
                                <option value="">-- Pilih --</option>
                                {unitOptions.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        )}
                    </label>
                </div>

                <label className="form-field">
                    <span className="form-label">Penerima</span>
                    <input
                        className="input-control"
                        value={formValues.receiver}
                        onChange={(e) => handleChange('receiver', e.target.value)}
                    />
                </label>

                <div className="form-actions" style={{ marginTop: 'auto' }}>
                    <div style={{ flex: 1 }}>
                        {formError && <span className="danger-text" style={{ fontSize: '13px' }}>{formError}</span>}
                        {successMsg && <span style={{ color: 'var(--success-text)', fontSize: '13px' }}>{successMsg}</span>}
                    </div>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Mengirim...' : 'Kirim Request'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserRequestForm;
