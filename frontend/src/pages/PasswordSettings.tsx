import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { updatePassword } from '../api/users.api';

const PasswordSettings = () => {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			setError('Semua kolom wajib diisi');
			setMessage(null);
			return;
		}
		if (newPassword.length < 6) {
			setError('Password baru minimal 6 karakter');
			setMessage(null);
			return;
		}
		if (newPassword !== confirmPassword) {
			setError('Konfirmasi password tidak cocok');
			setMessage(null);
			return;
		}

		setError(null);
		setMessage(null);
		setSaving(true);

		try {
			await updatePassword({ currentPassword, newPassword });
			setMessage('Password berhasil diperbarui');
			// Reset form
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (err: any) {
			setError(err.response?.data?.message || 'Gagal memperbarui password');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="settings-page">
			<div className="settings-card">
				<div className="settings-title-row">
					<span className="settings-icon" aria-hidden>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
							<rect x="3" y="11" width="18" height="10" rx="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</span>
					<span className="settings-title">Password settings</span>
				</div>

				<div className="settings-header">
					<h1 className="settings-heading">Settings</h1>
					<p className="settings-subtitle">Manage your profile and account settings</p>
				</div>

				<div className="settings-tabs">
					<Link className="settings-tab" to="/settings">
						Profile
					</Link>
					<Link className="settings-tab is-active" to="/settings/password">
						Password
					</Link>
				</div>

				<div className="settings-section">
					<p className="section-kicker">Update password</p>
					<p className="section-muted">Ensure your account is using a long, random password to stay secure</p>

					<div className="settings-grid">
						<label className="settings-field">
							<span className="settings-label">Current password</span>
							<input
								className="input-control settings-input"
								type="password"
								placeholder="Current password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								required
							/>
						</label>

						<label className="settings-field">
							<span className="settings-label">New password</span>
							<input
								className="input-control settings-input"
								type="password"
								placeholder="New password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
						</label>

						<label className="settings-field">
							<span className="settings-label">Confirm password</span>
							<input
								className="input-control settings-input"
								type="password"
								placeholder="Confirm password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</label>
					</div>

					<div className="settings-actions">
						{message && <p className="items-meta" role="status">{message}</p>}
						{error && <p className="danger-text" role="alert">{error}</p>}
						<Button type="button" variant="primary" onClick={handleSave} disabled={saving}>Save password</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PasswordSettings;
