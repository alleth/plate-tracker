import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:3001/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('platex_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Public
export const plateService = {
    searchByMV: (mv) => api.get(`/plates/search?mv=${mv}`),
    searchByPlate: (plate) => api.get(`/plates/search?plate=${plate}`),
};

// Admin
export const adminService = {
    login: (data) => api.post('/auth/login', data),
    verify: () => api.get('/auth/verify'),
    getAll: (q = '', page = 1, limit = 10) => {
        const params = new URLSearchParams({ page, limit });
        if (q) params.set('q', q);
        return api.get(`/plates?${params.toString()}`);
    },
    getStats: (page = 1, limit = 5) => api.get(`/plates/stats/summary?page=${page}&limit=${limit}`),
    getDealers: () => api.get('/plates/dealers'),
    create: (data) => api.post('/plates', data),
    update: (id, data) => api.put(`/plates/${id}`, data),
    setClaimed: (id, is_claimed) => api.patch(`/plates/${id}/claim`, { is_claimed }),
    delete: (id) => api.delete(`/plates/${id}`),
};

export const userService = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

export default api;
