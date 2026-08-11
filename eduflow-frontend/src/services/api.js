// Shared API base URL - uses Vite proxy when on HTTPS to prevent browser mixed content blocking
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const API_BASE = isHttps ? '' : `http://${window.location.hostname}:8080`;

export default API_BASE;
