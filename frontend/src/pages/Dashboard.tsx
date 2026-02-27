import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';
import { Role } from '../types/auth';


type CardItem = {
	title: string;
	description: string;
	action: string;
	href: string;
	roles?: Role[];
};

const cards: CardItem[] = [
	{ title: 'Barang Masuk', description: 'Tambah stok barang baru ke inventory.', action: 'Tambah', href: '/barang-masuk/create', roles: ['admin', 'superadmin'] },
	{ title: 'History Barang Masuk', description: 'Lihat riwayat barang yang masuk.', action: 'Lihat', href: '/history-masuk', roles: ['admin', 'superadmin'] },
	{ title: 'History Barang Keluar', description: 'Lihat riwayat barang yang keluar.', action: 'Lihat', href: '/history-keluar', roles: ['admin', 'superadmin'] },
	{ title: 'Request ATK', description: 'Ajukan permintaan barang ATK.', action: 'Buat Request', href: '/requests/create', roles: ['user'] },
	{ title: 'Daftar Barang', description: 'Lihat semua barang yang tersedia.', action: 'Lihat', href: '/items', roles: ['user'] },
];

const ArrowIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M9 18l6-6-6-6" />
	</svg>
);

const Dashboard = () => {
	const navigate = useNavigate();
	const { hasRole } = useAuth();

	const visibleCards = cards.filter((card) => !card.roles || hasRole(card.roles));

	const isUser = hasRole(['user']) && !hasRole(['admin', 'superadmin']);

	if (isUser) {
		return (
			<div className="dashboard">
				<div style={{ marginBottom: '24px' }}>
					<h2 className="card-title">User Dashboard</h2>
					<p className="card-desc">Kelola permintaan barang ATK Anda di sini.</p>
				</div>
				<div className="card-grid">
					<article className="dash-card">
						<div>
							<p className="card-kicker">Dashboard</p>
							<h2 className="card-title">Daftar Barang</h2>
							<p className="card-desc">Lihat semua barang ATK yang tersedia.</p>
						</div>
						<Button
							type="button"
							variant="secondary"
							className="card-cta"
							aria-label="Lihat Barang"
							onClick={() => navigate('/items')}
						>
							<span className="cta-text">Lihat</span>
							<span className="cta-icon" aria-hidden><ArrowIcon /></span>
						</Button>
					</article>
					<article className="dash-card">
						<div>
							<p className="card-kicker">Dashboard</p>
							<h2 className="card-title">Buat Permintaan Baru</h2>
							<p className="card-desc">Ajukan permintaan barang ATK baru.</p>
						</div>
						<Button
							type="button"
							variant="secondary"
							className="card-cta"
							aria-label="Buat Request"
							onClick={() => navigate('/requests/create')}
						>
							<span className="cta-text">Buat Request</span>
							<span className="cta-icon" aria-hidden><ArrowIcon /></span>
						</Button>
					</article>
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard">
			<div className="card-grid">
				{visibleCards.map((card) => (
					<article key={card.title} className="dash-card">
						<div>
							<p className="card-kicker">Dashboard</p>
							<h2 className="card-title">{card.title}</h2>
							<p className="card-desc">{card.description}</p>
						</div>
						<Button
							type="button"
							variant="secondary"
							className="card-cta"
							aria-label={card.action}
							onClick={() => navigate(card.href)}
						>
							<span className="cta-text">{card.action}</span>
							<span className="cta-icon" aria-hidden>
								<ArrowIcon />
							</span>
						</Button>
					</article>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
