import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import { updateProfile, deleteAccount } from '../api/users.api';

const ProfileSettings = () => {
	const { user, updateUser, logout } = useAuth();
	const navigate = useNavigate();

	const [name, setName] = useState('');
	const [username, setUsername] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	// Initialize state from auth context
	useEffect(() => {
		if (user) {
			setName(user.name);
			setUsername(user.username);
		}
	}, [user]);

	const handleSave = async () => {
		if (!name.trim() || !username.trim()) {
			setError('Name dan Username wajib diisi');
			setMessage(null);
			return;
		}

		setError(null);
		setMessage(null);
		setSaving(true);

		try {
			const updatedUser = await updateProfile({ name, username });
			updateUser(updatedUser); // Update context instantly
			setMessage('Profil berhasil disimpan');
		} catch (err: any) {
			setError(err.response?.data?.message || 'Gagal menyimpan profil');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = () => {
		setShowConfirm(true);
	};

	const confirmDelete = async () => {
		// setShowConfirm(false); // Don't close immediately to show state
		setMessage(null);
		setError(null);
		setSaving(true);

		try {
			await deleteAccount();
			await logout(); // Clear context and redirect
			navigate('/login');
		} catch (err: any) {
			setError(err.response?.data?.message || 'Gagal menghapus akun');
			setSaving(false);
			setShowConfirm(false);
		}
	};

	const cancelDelete = () => {
		setShowConfirm(false);
	};

	return (
		<div className="settings-page">
			<div className="settings-card">
				<div className="settings-title-row">
					<span className="settings-icon" aria-hidden>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
							<rect x="5" y="3" width="14" height="18" rx="2" />
							<path d="M9 7h6M9 11h6M9 15h4" />
						</svg>
					</span>
					<span className="settings-title">Profile settings</span>
				</div>

				<div className="settings-header">
					<h1 className="settings-heading">Settings</h1>
					<p className="settings-subtitle">Manage your profile and account settings</p>
				</div>

				<div className="settings-tabs">
					<Link className="settings-tab is-active" to="/settings">
						Profile
					</Link>
					<Link className="settings-tab" to="/settings/password">
						Password
					</Link>
				</div>

				<div className="settings-section">
					<p className="section-kicker">Profile information</p>
					<p className="section-muted">Update your name and email address</p>

					<div className="settings-grid">
						<label className="settings-field">
							<span className="settings-label">Name</span>
							<input
								className="input-control settings-input"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</label>

						<label className="settings-field">
							<span className="settings-label">Username</span>
							<input
								className="input-control settings-input"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</label>
					</div>

					<div className="settings-actions">
						{message && <p className="items-meta" style={{ color: 'var(--success-text, #155724)' }} role="status">{message}</p>}
						{error && <p className="danger-text" role="alert">{error}</p>}
						<Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</Button>
					</div>
				</div>

				<div className="settings-section">
					<p className="section-kicker">Delete account</p>
					<p className="section-muted">Delete your account and all of its resources</p>

					<div className="danger-card">
						<p className="danger-title">Warning</p>
						<p className="danger-text">Please proceed with caution, this cannot be undone.</p>
						<Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>Delete account</Button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={showConfirm}
				onClose={cancelDelete}
				title="Hapus akun?"
				footer={
					<div className="modal-actions">
						<Button type="button" variant="secondary" onClick={cancelDelete}>Batal</Button>
						<Button type="button" variant="danger" onClick={confirmDelete} disabled={saving}>
							{saving ? 'Menghapus...' : 'Hapus'}
						</Button>
					</div>
				}
			>
				<div style={{ marginBottom: '16px' }}>
					<p className="modal-kicker">Konfirmasi</p>
					<p style={{ color: 'var(--muted)', fontSize: '14px', margin: '8px 0' }}>
						Tindakan ini tidak dapat dibatalkan. Semua data akun akan dihapus.
					</p>
				</div>
			</Modal>
		</div>
	);
};

export default ProfileSettings;
