import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  googleAuth: (data: any) => api.post('/auth/google', data),
  getProfile: () => api.get('/auth/me'),
};

// Bookings endpoints
export const bookingsApi = {
  create: (data: any) => api.post('/bookings', data),
  getMyBookings: (type?: 'upcoming' | 'past') =>
    api.get('/bookings/my-bookings', { params: { type } }),
  getAvailability: (date: string, sessionConfigId: string) =>
    api.get('/bookings/availability', { params: { date, sessionConfigId } }),
  reschedule: (id: string, newStartTime: string) =>
    api.patch(`/bookings/${id}/reschedule`, { newStartTime }),
  cancel: (id: string, reason?: string) =>
    api.delete(`/bookings/${id}`, { data: { reason } }),
};

// Payments endpoints
export const paymentsApi = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  getPaymentMethods: () => api.get('/payments/payment-methods'),
};

// Packages endpoints
export const packagesApi = {
  create: (data: any) => api.post('/packages', data),
  getMyPackages: () => api.get('/packages/my-packages'),
  getBalance: (id: string) => api.get(`/packages/${id}/balance`),
};

// Events endpoints
export const eventsApi = {
  getAll: (published?: boolean, upcoming?: boolean) =>
    api.get('/events', { params: { published, upcoming } }),
  getById: (id: string) => api.get(`/events/${id}`),
};

// Media endpoints
export const mediaApi = {
  getAll: (type?: 'image' | 'video') => api.get('/media', { params: { type } }),
  getById: (id: string) => api.get(`/media/${id}`),
};

// Leads endpoints
export const leadsApi = {
  enrich: (data: { niche: string; city: string; leads: any[] }) =>
    api.post('/leads/enrich', data),
  generate: (data: { leads: any[] }) =>
    api.post('/leads/generate', data),
};

// Admin endpoints
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBookings: (page?: number, limit?: number) =>
    api.get('/admin/bookings', { params: { page, limit } }),
  getUsers: (page?: number, limit?: number) =>
    api.get('/admin/users', { params: { page, limit } }),
  export: (type: 'bookings' | 'users' | 'payments') =>
    api.get('/admin/export', { params: { type } }),
};
