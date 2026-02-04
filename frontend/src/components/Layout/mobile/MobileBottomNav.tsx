import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { navItems, getVisibleNavItems } from '../shared/NavItems';
import Icon from '../shared/Icon';

/**
 * Mobile Bottom Navigation component.
 * Shows 4-5 primary navigation items at the bottom of the screen.
 * Touch-friendly with minimum 44px tap targets.
 * NO business logic - only presentation and navigation.
 */
const MobileBottomNav = () => {
    const location = useLocation();
    const { hasRole } = useAuth();

    const visibleNavItems = getVisibleNavItems(navItems, hasRole);

    // Take first 4 items for bottom nav, remaining go to drawer menu
    // Order priority: Dashboard, Items, then role-specific items
    const bottomNavItems = visibleNavItems.slice(0, 4);

    return (
        <nav className="mobile-bottom-nav">
            {bottomNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={`mobile-bottom-item ${isActive ? 'is-active' : ''}`}
                    >
                        <span className="mobile-bottom-icon">
                            <Icon name={item.icon} />
                        </span>
                        <span className="mobile-bottom-label">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
