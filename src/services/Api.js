import axios from "axios";


// Api.js
const api = axios.create({
  baseURL: '/api', // Vite proxy lo redirigirá a Ngrok
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420'
  }
});


/*
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Asegúrate de que este URL apunte a tu backend
  headers: {
    'Content-Type': 'application/json'
  }
});*/

// ── Interceptor REQUEST: adjunta el token en cada llamada ────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor RESPONSE: manejo global de sesión expirada ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;