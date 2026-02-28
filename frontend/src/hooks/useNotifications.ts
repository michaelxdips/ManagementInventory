import { useEffect, useState, useCallback } from 'react';

export interface AppNotification {
  id: string; // generated client-side for keys
  type: 'NEW_REQUEST' | 'STATUS_UPDATE';
  data: any;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export const useNotifications = (token: string | null) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsConnected(false);
      return;
    }

    // Connect to SSE stream
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    // EventSource doesn't support custom headers natively in browser API (only with polyfills).
    // The standard way is to pass token in URL.
    const eventSource = new EventSource(`${API_URL}/notifications/stream?token=${token}`);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setIsConnected(false);
      // EventSource auto-reconnects by default, but we can close it if auth fails
      // eventSource.close();
    };

    // Generic message handler
    eventSource.onmessage = (event) => {
      console.log('Received generic SSE:', event.data);
    };

    // Specific event: NEW_REQUEST (for admins)
    eventSource.addEventListener('NEW_REQUEST', (event) => {
      try {
        const data = JSON.parse(event.data);
        const newNotif: AppNotification = {
          id: `new_req_${Date.now()}_${Math.random()}`,
          type: 'NEW_REQUEST',
          data,
          title: 'Request Baru Masuk',
          message: `${data.dept} meminta ${data.qty} ${data.unit} ${data.item}`,
          read: false,
          timestamp: new Date(),
        };
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message });
        }

        setNotifications(prev => [newNotif, ...prev]);
      } catch (err) {
        console.error('Error parsing NEW_REQUEST', err);
      }
    });

    // Specific event: STATUS_UPDATE (for users)
    eventSource.addEventListener('STATUS_UPDATE', (event) => {
      try {
        const data = JSON.parse(event.data);
        const isApproved = data.status === 'APPROVED';
        const newNotif: AppNotification = {
          id: `status_${Date.now()}_${Math.random()}`,
          type: 'STATUS_UPDATE',
          data,
          title: isApproved ? 'Barang Disetujui ✅' : 'Barang Ditolak ❌',
          message: data.message,
          read: false,
          timestamp: new Date(),
        };

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message });
        }

        setNotifications(prev => [newNotif, ...prev]);
      } catch (err) {
        console.error('Error parsing STATUS_UPDATE', err);
      }
    });

    // Request browser notification permission implicitly on connect
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [token]);

  return { notifications, isConnected, markAllAsRead, clearAll };
};
