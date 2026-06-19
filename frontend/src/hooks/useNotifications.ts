import { useEffect, useState, useCallback, useRef } from 'react';

export interface AppNotification {
  id: string; // generated client-side for keys
  type: 'NEW_REQUEST' | 'STATUS_UPDATE' | 'LOW_STOCK';
  data: any;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000; // 2 seconds

// Detect if we're running on a serverless platform (e.g. Vercel)
// where SSE long-lived connections are not supported.
const isServerlessPlatform = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.endsWith('.vercel.app') || host.endsWith('.netlify.app');
};

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const useNotifications = (token: string | null) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const retryCount = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isMounted = useRef(false);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Polling fallback for serverless platforms (Vercel)
  // Since SSE long-lived connections are not supported, we poll a lightweight
  // endpoint periodically to detect new events.
  useEffect(() => {
    if (!token || !isServerlessPlatform()) return;

    // Polling interval — 30 seconds is polite; adjust as needed.
    const POLL_INTERVAL_MS = 30_000;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/poll`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const events: AppNotification[] = await res.json();
        if (events.length > 0) {
          setNotifications(prev => [...events, ...prev]);
        }
      } catch {
        // silently ignore — polling will retry on next interval
      }
    };

    poll(); // initial poll
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [token]);

  // SSE connection with exponential backoff and max retry limit
  useEffect(() => {
    // On serverless platforms, skip SSE and rely on polling instead.
    if (!token || isServerlessPlatform()) {
      setIsConnected(false);
      return;
    }

    isMounted.current = true;

    const connect = () => {
      if (!isMounted.current) return;

      const es = new EventSource(`${API_URL}/notifications/stream?token=${token}`);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isMounted.current) return;
        console.log('SSE connection opened');
        setIsConnected(true);
        retryCount.current = 0; // reset backoff on successful connect
      };

      es.onerror = () => {
        if (!isMounted.current) return;
        console.warn('SSE connection error');
        setIsConnected(false);
        es.close();
        eventSourceRef.current = null;

        if (retryCount.current >= MAX_RETRIES) {
          console.warn('SSE max retries reached. Giving up. Falling back to manual refresh.');
          return;
        }

        // Exponential backoff: 2s, 4s, 8s, 16s, 32s
        const delay = BASE_BACKOFF_MS * Math.pow(2, retryCount.current);
        retryCount.current += 1;
        console.log(`SSE reconnecting in ${delay / 1000}s (attempt ${retryCount.current}/${MAX_RETRIES})`);
        retryTimeout.current = setTimeout(connect, delay);
      };

      // Generic message handler
      es.onmessage = (event) => {
        console.log('Received generic SSE:', event.data);
      };

      // Specific event: NEW_REQUEST (for admins)
      es.addEventListener('NEW_REQUEST', (event) => {
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

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, { body: newNotif.message });
          }

          setNotifications(prev => [newNotif, ...prev]);
        } catch (err) {
          console.error('Error parsing NEW_REQUEST', err);
        }
      });

      // Specific event: LOW_STOCK (for admins)
      es.addEventListener('LOW_STOCK', (event) => {
        try {
          const data = JSON.parse(event.data);
          const newNotif: AppNotification = {
            id: `low_stock_${Date.now()}_${Math.random()}`,
            type: 'LOW_STOCK',
            data,
            title: data.remaining === 0 ? 'Stok Habis! 🚨' : 'Peringatan Stok Minimum ⚠️',
            message: data.message,
            read: false,
            timestamp: new Date(),
          };

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, { body: newNotif.message });
          }

          setNotifications(prev => [newNotif, ...prev]);
        } catch (err) {
          console.error('Error parsing LOW_STOCK', err);
        }
      });

      // Specific event: STATUS_UPDATE (for users)
      es.addEventListener('STATUS_UPDATE', (event) => {
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

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, { body: newNotif.message });
          }

          setNotifications(prev => [newNotif, ...prev]);
        } catch (err) {
          console.error('Error parsing STATUS_UPDATE', err);
        }
      });
    };

    // Request browser notification permission implicitly on connect
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connect();

    return () => {
      isMounted.current = false;
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      retryCount.current = 0;
    };
  }, [token]);

  return { notifications, isConnected, markAllAsRead, clearAll };
};
