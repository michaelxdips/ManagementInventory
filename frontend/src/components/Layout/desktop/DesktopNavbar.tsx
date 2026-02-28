import { useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { navItems, getVisibleNavItems } from '../shared/NavItems';
import Icon from '../shared/Icon';
import ThemeToggle from '../../ThemeToggle';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationBell from '../../ui/NotificationBell';

/**
 * Desktop Navbar (Topbar) component.
 * Shows current page title and theme toggle.
 * NO business logic - only presentation.
 */
const DesktopNavbar = () => {
    const location = useLocation();
    const { hasRole } = useAuth();
    
    const token = localStorage.getItem('token');
    const { notifications, markAllAsRead, clearAll } = useNotifications(token);

    const visibleNavItems = getVisibleNavItems(navItems, hasRole);
    const activeTitle = visibleNavItems.find((item) =>
        location.pathname.startsWith(item.path)
    )?.label ?? (location.pathname.startsWith('/settings') ? 'Settings' : 'Dashboard');

    return (
        <header className="topbar">
            <div className="crumb">
                <span className="crumb-icon">
                    <Icon name="grid" />
                </span>
                <span className="crumb-text">{activeTitle}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <NotificationBell 
                    notifications={notifications} 
                    onMarkAllAsRead={markAllAsRead} 
                    onClearAll={clearAll} 
                />
                <ThemeToggle />
            </div>
        </header>
    );
};

export default DesktopNavbar;
