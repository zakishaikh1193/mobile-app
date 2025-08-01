import axios from 'axios';

const API_URL ='http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if token is invalid/expired
      localStorage.removeItem('token');
      
      // Don't automatically redirect if we're in an admin flow or API call
      // Let the component handle the error appropriately
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/admin/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  // Register new user (Admin only)
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'parent' | 'student';
    firstName: string;
    lastName: string;
    max_children?: number;
  }) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: { firstName: string; lastName: string; email: string }) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Get all users (Admin only)
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (userId: number, userData: { role: string; isActive: boolean }) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Create child profile (Parent only)
  createChild: async (childData: {
    firstName: string;
    username: string;
    age: number;
    gender: 'boy' | 'girl';
    avatar?: string;
  }) => {
    const response = await api.post('/children', childData);
    return response.data;
  },

  // Get children for parent
  getChildren: async () => {
    const response = await api.get('/children');
    return response.data;
  },

  // Switch to child context (Parent only)
  switchToChild: async (childId: number) => {
    const response = await api.post(`/children/${childId}/switch`);
    return response.data;
  },

  // Update child progress
  updateChildProgress: async (childId: number, progressData: {
    activityType: string;
    activityId: string;
    progressValue: number;
    completed?: boolean;
  }) => {
    const response = await api.put(`/children/${childId}/progress`, progressData);
    return response.data;
  },

  // Delete child (Parent only)
  deleteChild: async (childId: number) => {
    const response = await api.delete(`/children/${childId}`);
    return response.data;
  },
};

export default api;
