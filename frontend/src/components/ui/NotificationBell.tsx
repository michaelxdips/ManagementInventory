import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../../hooks/useNotifications';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAllAsRead, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      onMarkAllAsRead();
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="notification-btn"
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Notifikasi</h3>
            {notifications.length > 0 && (
                <button 
                  onClick={onClearAll}
                  style={{ background: 'none', border: 'none', color: '#2f81f7', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Bersihkan
                </button>
            )}
          </div>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted, #718096)' }}>
                Belum ada notifikasi baru
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: notif.read ? 'var(--panel)' : 'var(--focus)',
                    transition: 'background-color 0.2s',
                    color: 'var(--text)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>{notif.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
