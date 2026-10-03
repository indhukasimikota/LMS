import axios from 'axios';

// Base axios instance — proxied to http://localhost:5000 via vite.config.js
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Books API ─────────────────────────────────────────────────────────────────
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getCategories: () => api.get('/books/categories'),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

// ── Students API ──────────────────────────────────────────────────────────────
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  update: (id, data) => api.put(`/students/${id}`, data),
  deactivate: (id) => api.delete(`/students/${id}`),
};

// ── Transactions API ──────────────────────────────────────────────────────────
export const transactionsAPI = {
  issue: (data) => api.post('/transactions/issue', data),
  return: (data) => api.post('/transactions/return', data),
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  getMy: (params) => api.get('/transactions/my', { params }),
  markFinePaid: (id) => api.put(`/transactions/${id}/pay-fine`),
};

// ── Dashboard API ──────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/stats'),
  getStudentDashboard: () => api.get('/dashboard/student'),
};

export default api;
