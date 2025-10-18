export const getSecret = () => localStorage.getItem('token');
export const Backend_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000/api";
