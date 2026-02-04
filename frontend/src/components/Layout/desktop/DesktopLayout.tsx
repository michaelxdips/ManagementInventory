import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import DesktopNavbar from './DesktopNavbar';

/**
 * Desktop Layout component.
 * Renders the full desktop shell with sidebar and content area.
 * Maintains the EXACT same structure as the original AuthLayout.
 * NO business logic - only layout structure.
 */
const DesktopLayout = () => {
    return (
        <div className="app-shell desktop-layout">
            <DesktopSidebar />
            <section className="main-panel">
                <DesktopNavbar />
                <div className="content-area">
                    <Outlet />
                </div>
            </section>
        </div>
    );
};

export default DesktopLayout;
