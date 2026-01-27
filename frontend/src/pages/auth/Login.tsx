import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [remember, setRemember] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!username.trim() || !password.trim()) {
			setError('Username dan password wajib diisi');
			return;
		}
		if (password.length < 4) {
			setError('Password minimal 4 karakter');
			return;
		}
		setError(null);
		setSubmitting(true);
		login({ username, password, remember })
			.then(() => navigate('/dashboard'))
			.catch(() => setError('Login gagal, periksa kembali kredensial'))
			.finally(() => setSubmitting(false));
	};

	return (
		<section className="auth-card">
			<div className="auth-icon" aria-hidden />
			<h1 className="auth-title">Log in to your account</h1>
			<p className="auth-subtitle">Enter your username and password below to log in</p>

			<form onSubmit={handleSubmit} noValidate>
				{error && <p className="danger-text" role="alert">{error}</p>}
				<div className="form-field">
					<label className="form-label" htmlFor="username">
						Username
					</label>
					<input
						id="username"
						name="username"
						className="input-control"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						autoComplete="username"
						spellCheck="false"
						required
					/>
				</div>

				<div className="form-field">
					<label className="form-label" htmlFor="password">
						Password
					</label>
					<input
						id="password"
						name="password"
						className="input-control"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
						required
					/>
				</div>

				<div className="auth-actions">
					<label className="checkbox">
						<input
							type="checkbox"
							checked={remember}
							onChange={(e) => setRemember(e.target.checked)}
						/>
						<span>Remember me</span>
					</label>
				</div>

				<button className="primary-button" type="submit" disabled={submitting}>
					Log in
				</button>
			</form>

			<p className="auth-footer">PKL Management Inventory</p>
		</section>
	);
};

export default Login;
