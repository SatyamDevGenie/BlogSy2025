import axios from 'axios';

// Base API URL
const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: auth token + fix image upload (FormData must not send Content-Type: application/json)
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    // File upload: remove Content-Type so browser sets multipart/form-data with boundary.
    // Otherwise server gets no file and returns 400.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and API response structure
api.interceptors.response.use(
  (response) => {
    // Normalize backend response shapes for consistent consumption
    const data = response.data;
    if (data && typeof data === 'object') {
      // Single blog response: { success: true, blog }
      if (data.success && data.blog) {
        return { ...response, data: data.blog };
      }
      // Register: { message, user: { _id, username, email, token } } – leave as-is so slice can use data.user
      // Login: { _id, username, email, token } – leave as-is
      // updateProfile: { message, user: { _id, username, email } } – leave as-is so slice can use data.user
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;
        
        // Update stored user with new token
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.token = accessToken;
        localStorage.setItem('user', JSON.stringify(user));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getCurrentUser: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const blogAPI = {
  getAll: () => api.get('/blogs'),
  getById: (id) => api.get(`/blogs/${id}`),
  getTrending: () => api.get('/blogs/trending'),
  getLatest: () => api.get('/blogs/latest'),
  create: (data) => api.post('/blogs/create', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
  like: (id) => api.put(`/blogs/${id}/like`),
  comment: (id, data) => api.post(`/blogs/${id}/comment`, data),
  replyToComment: (blogId, commentId, data) => 
    api.post(`/blogs/${blogId}/comments/${commentId}/reply`, data),
  addEmojiReaction: (blogId, commentId, data) => 
    api.post(`/blogs/${blogId}/comments/${commentId}/emoji`, data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  follow: (id) => api.put(`/users/follow/${id}`),
  unfollow: (id) => api.put(`/users/unfollow/${id}`),
  checkFollowStatus: (id) => api.get(`/users/${id}/follow-status`),
  addToFavorites: (id) => api.put(`/users/favourites/${id}`),
  removeFromFavorites: (id) => api.delete(`/users/favourites/${id}`),
};

export const uploadAPI = {
  uploadImage: (formData) => {
    // Do not set Content-Type so browser sends multipart/form-data with boundary
    return api.post('/upload', formData, {
      timeout: 30000,
      headers: {
        'Content-Type': undefined, // omit so FormData gets multipart/form-data; boundary=...
      },
    });
  },
};

export default api;