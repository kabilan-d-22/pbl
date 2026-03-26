import axios from 'axios';

// Since we set up a proxy in vite.config.js, 
// we can use '/api' as the base URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export const groupAPI = {
  getGroup: () => api.get('/groups')
};

export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};

export const analyticsAPI = {
  getTeamAnalytics: () => api.get('/analytics/team'),
  getUserAnalytics: (userId) => api.get(`/analytics/user/${userId || ''}`)
};

export const aiAPI = {
  askAssistant: (prompt) => api.post('/ai/ask', { prompt })
};

export default api;