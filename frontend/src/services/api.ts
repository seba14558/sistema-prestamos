import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://yin-dipper-semester.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar expiración de token u otros errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Notificaciones
export const getNotificaciones = () => api.get('/notificaciones');
export const getUnreadCount = () => api.get('/notificaciones/unread-count');
export const markAsRead = (id: number) => api.put(`/notificaciones/${id}/read`);
export const markAllAsRead = () => api.put('/notificaciones/mark-all-read');

// Pagos
export const editarPago = (id: number, data: any) => api.put(`/pagos/${id}`, data);
export const eliminarPago = (id: number) => api.delete(`/pagos/${id}`);

// Usuarios
export const getUsuarios = () => api.get('/usuarios');
export const crearUsuario = (data: any) => api.post('/usuarios', data);
export const editarUsuario = (id: number, data: any) => api.put(`/usuarios/${id}`, data);
export const eliminarUsuario = (id: number) => api.delete(`/usuarios/${id}`);

// Clientes
export const editarCliente = (id: number, data: any) => api.put(`/clientes/${id}`, data);
export const eliminarCliente = (id: number) => api.delete(`/clientes/${id}`);

export default api;
