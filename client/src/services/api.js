import axios from 'axios';

// Axios instance pointing to the Vite proxy → backend
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  profile:  ()      => api.get('/auth/profile'),
};

// ─────────────────────────────────────────────────────────────
// Leave API
// ─────────────────────────────────────────────────────────────
export const leaveAPI = {
  apply:         (data)         => api.post('/leaves', data),
  getMyLeaves:   ()             => api.get('/leaves/my'),
  getPending:    ()             => api.get('/leaves/pending'),
  getStats:      ()             => api.get('/leaves/stats'),
  approveLeave:  (id, data)    => api.patch(`/leaves/${id}/approve`, data),
  rejectLeave:   (id, data)    => api.patch(`/leaves/${id}/reject`, data),
};

export default api;
