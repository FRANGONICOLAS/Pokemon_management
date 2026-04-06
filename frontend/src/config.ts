const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = envBaseUrl ?? (import.meta.env.DEV ? '/api' : 'http://localhost:3000');
