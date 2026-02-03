import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Role } from '../types/auth';
import ThemeToggle from '../components/ThemeToggle';

type NavItem = {
	label: string;
	path: string;
	icon: string;
	roles?: Role[]; // if set, only these roles can see the menu
};

const navItems: NavItem[] = [
	{ label: 'Dashboard', path: '/dashboard', icon: 'grid' },
	{ label: 'Items', path: '/items', icon: 'box' },
	{ label: 'History Masuk', path: '/history-masuk', icon: 'in', roles: ['admin', 'superadmin'] },
	{ label: 'History Keluar', path: '/history-keluar', icon: 'out', roles: ['admin', 'superadmin'] },
	{ label: 'Requests', path: '/requests', icon: 'request', roles: ['user'] },
	{ label: 'Information', path: '/information', icon: 'info', roles: ['user'] },
	{ label: 'Barang Kosong', path: '/barang-kosong', icon: 'empty', roles: ['user'] },
	{ label: 'Approval', path: '/approval', icon: 'check', roles: ['admin', 'superadmin'] },
	{ label: 'Manage Units', path: '/manage-units', icon: 'units', roles: ['superadmin'] },
];

const Icon = ({ name }: { name: string }) => {
	const stroke = 'currentColor';
	switch (name) {
		case 'grid':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<rect x="4" y="4" width="6" height="6" rx="1.5" />
					<rect x="14" y="4" width="6" height="6" rx="1.5" />
					<rect x="4" y="14" width="6" height="6" rx="1.5" />
					<rect x="14" y="14" width="6" height="6" rx="1.5" />
				</svg>
			);
		case 'box':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<path d="M4 7.5 12 12l8-4.5M4 7.5 12 3l8 4.5M4 7.5v9L12 21l8-4.5v-9" strokeLinejoin="round" />
				</svg>
			);
		case 'in':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<path d="M5 12h14M12 5v14M12 5l-3 3M12 5l3 3" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case 'out':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<path d="M5 12h14M12 19V5M12 19l-3-3M12 19l3-3" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case 'request':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<rect x="4" y="4" width="16" height="16" rx="2" />
					<path d="M8 9h8M8 12h5" strokeLinecap="round" />
				</svg>
			);
		case 'info':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 9.5v5M12 7.2v.1" strokeLinecap="round" />
				</svg>
			);
		case 'check':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<path d="M5 12.5 10 17l9-10" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case 'empty':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<rect x="4" y="4" width="16" height="16" rx="2" />
					<path d="M8 8h8v8H8z" opacity="0.35" />
				</svg>
			);
		case 'units':
			return (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
					<path d="M4 10h7V4H4v6Zm9 10h7v-6h-7v6ZM4 20h7v-6H4v6Zm9-10h7V4h-7v6Z" />
				</svg>
			);
		default:
			return null;
	}
};

const AuthLayout = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const [profileOpen, setProfileOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement | null>(null);
	const { logout, hasRole, user } = useAuth();
	const [loggingOut, setLoggingOut] = useState(false);

	const displayName = user?.name ?? 'User';
	const displayUsername = user?.username ?? 'user';
	const displayRole = user?.role ?? 'user';
	const avatarText = (displayName || 'User')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('') || 'U';

	const handleSettings = () => {
		setProfileOpen(false);
		navigate('/settings');
	};

	const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(item.roles));
	const activeTitle = visibleNavItems.find((item) => location.pathname.startsWith(item.path))?.label
		?? (location.pathname.startsWith('/settings') ? 'Settings' : 'Dashboard');

	const handleLogout = async () => {
		setLoggingOut(true);
		try {
			await logout();
			navigate('/login');
		} finally {
			setLoggingOut(false);
			setProfileOpen(false);
		}
	};

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (!profileRef.current) return;
			if (!profileRef.current.contains(e.target as Node)) {
				setProfileOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<div className="brand">
					<div className="brand-icon" aria-hidden />
					<div className="brand-text">
						<span className="brand-title">Inventory ATK</span>
					</div>
				</div>

				<p className="sidebar-section">Menu</p>
				<nav className="nav-menu">
					{visibleNavItems.map((item) => (
						<NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
							<span className="nav-icon">
								<Icon name={item.icon} />
							</span>
							<span className="nav-label">{item.label}</span>
						</NavLink>
					))}
				</nav>

				<div className="sidebar-footer" ref={profileRef}>
					{profileOpen && (
						<div className="profile-popover">
							<div className="profile-header">
								<div className="avatar">{avatarText}</div>
								<div className="profile-meta">
									<span className="profile-name">{displayName}</span>
									<span className="profile-username">{displayUsername}</span>
								</div>
							</div>

							<button type="button" className="profile-item" onClick={handleSettings}>
								<span className="profile-icon" aria-hidden>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
										<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
										<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 7 3.6V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c0 .26.06.52.17.76a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
									</svg>
								</span>
								<span className="profile-label">Settings</span>
							</button>

							<button type="button" className="profile-item" onClick={handleLogout} disabled={loggingOut}>
								<span className="profile-icon" aria-hidden>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
										<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
										<path d="M16 17 21 12 16 7" />
										<path d="M21 12H9" />
									</svg>
								</span>
								<span className="profile-label">Log out</span>
							</button>
						</div>
					)}

					<button
						type="button"
						className="user-chip"
						onClick={() => setProfileOpen((prev) => !prev)}
					>
						<div className="avatar">{avatarText}</div>
						<div className="user-meta">
							<span className="user-name">{displayName}</span>
							<span className="user-role">{displayRole}</span>
						</div>
						<span className="chevron">›</span>
					</button>
				</div>
			</aside>

			<section className="main-panel">
				<header className="topbar">
					<div className="crumb">
						<span className="crumb-icon">
							<Icon name="grid" />
						</span>
						<span className="crumb-text">{activeTitle}</span>
					</div>
					<ThemeToggle />
				</header>

				<div className="content-area">
					<Outlet />
				</div>
			</section>
		</div>
	);
};

export default AuthLayout;
