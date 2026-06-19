const getBaseUrl = () => {
  // VITE_API_BASE_URL must be set in Vercel dashboard for production.
  // In local dev it falls back to localhost:3000.
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192.168')) {
    // Running on a remote domain but env var is not set — log a clear warning.
    console.error(
      '[http.ts] VITE_API_BASE_URL is not set! '
      + 'API calls will fail. Set this env var in your Vercel/hosting dashboard.'
    );
  }

  return 'http://localhost:3000/api';
};
const API_BASE = getBaseUrl();

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpError = {
  status: number;
  message: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      if (window.location.pathname !== '/login') {
        // Dispatch a custom event so React Router can navigate without a hard reload.
        // A hard reload (window.location.href) would restart the entire app and
        // re-trigger SSE connections, causing a reload loop.
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    const text = await res.text();
    throw { status: res.status, message: text || res.statusText } as HttpError;
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
