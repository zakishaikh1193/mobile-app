import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export interface Progress {
  [key: string]: number;
}

export interface Child {
  id: string;
  name: string;
  first_name: string;
  username: string;
  email: string;
  role: 'student';
  age: number;
  avatar: string;
  gender: 'boy' | 'girl';
  progress: Progress;
  streak: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  first_name: string;
  last_name: string;
  isActive?: boolean;
  avatar?: string;
  children?: Child[];
  created_at: string;
  updated_at: string;
  progress?: Progress;
  streak?: number;
  badges?: string[];
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  createChild: (childData: Omit<Child, 'id' | 'progress'>) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateChildProgress: (childId: string, hubId: string, progressValue: number) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => setError(null), []);

  const handleAuthSuccess = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      handleAuthSuccess(response.token, response.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      handleAuthSuccess(response.token, response.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const createChild = async (childData: Omit<Child, 'id' | 'progress'>): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate it with a local update
      const newChild: Child = {
        id: `child-${Date.now()}`,
        ...childData,
        progress: {},
        streak: 0,
        badges: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedUser = {
        ...user,
        children: [...(user.children || []), newChild]
      };
      
      setUser(updatedUser);
      
      // In a real app, you would save this to the backend:
      // await api.post('/children', childData);
      // Then reload the user data:
      // await loadUser();
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create child profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateChildProgress = (childId: string, hubId: string, progressValue: number): void => {
    if (!user) return;
    
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      // If user is a student, update their own progress
      if (prevUser.role === 'student' && prevUser.id.toString() === childId) {
        return {
          ...prevUser,
          progress: {
            ...prevUser.progress,
            [hubId]: progressValue
          },
          updated_at: new Date().toISOString()
        };
      }
      
      // If user is a parent, find and update the child's progress
      if (prevUser.children) {
        const updatedChildren = prevUser.children.map(child => {
          if (child.id === childId) {
            return {
              ...child,
              progress: {
                ...child.progress,
                [hubId]: progressValue
              },
              updated_at: new Date().toISOString()
            };
          }
          return child;
        });
        
        return {
          ...prevUser,
          children: updatedChildren
        };
      }
      
      return prevUser;
    });
    
    // In a real app, you would also update the progress in the backend:
    // await api.patch(`/children/${childId}/progress`, { hubId, progress: progressValue });
  };

  const value = {
    user,
    login,
    register,
    createChild,
    updateUser,
    updateChildProgress,
    logout,
    loading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};