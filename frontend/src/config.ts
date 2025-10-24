export const getSecret = () => localStorage.getItem('token');
export const Backend_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";