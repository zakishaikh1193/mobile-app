import api from './api';

export const adminAPI = {
  // Create a new user (Admin only)
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'parent' | 'student';
    firstName: string;
    lastName: string;
    maxChildren?: number;
  }) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Get all users (Admin only)
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (userId: number, userData: { role?: string; isActive?: boolean }) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

};
