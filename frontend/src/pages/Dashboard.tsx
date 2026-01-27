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
	{ title: 'Kelola ATK', description: 'Tambah stok melalui transaksi barang masuk.', action: 'Lanjutkan', href: '/atk-items', roles: ['admin', 'superadmin'] },
	{ title: 'Masukkan Request', description: 'Catat permintaan ATK dari unit.', action: 'Lanjutkan', href: '/requests', roles: ['user'] },
	{ title: 'Daftar Barang Masuk', description: 'Lihat riwayat barang yang masuk.', action: 'Lihat', href: '/history-masuk' },
	{ title: 'Daftar Barang Keluar', description: 'Lihat riwayat barang yang keluar.', action: 'Lihat', href: '/history-keluar' },
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
