import axios from 'axios';

// Dynamically determine API URL based on current host (for local network access)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Use same hostname as frontend but port 3000 for backend fallback
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Prevent Vercel domains from trying to hit port 3000
  if (hostname.includes('vercel.app')) {
    return `https://${hostname}/api`; // This will still fail if backend isn't mapped, but prevents mixed content
  }

  return `http://${hostname}:3000/api`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: refresh token / global error handling
    return Promise.reject(error);
  }
);

export default api;
