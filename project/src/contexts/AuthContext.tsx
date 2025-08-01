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
  role: 'admin' | 'teacher' | 'parent' | 'student';
  first_name: string;
  last_name: string;
  isActive?: boolean;
  avatar?: string;
  max_children?: number;
  children?: Child[];
  created_at: string;
  updated_at: string;
  progress?: Progress;
  streak?: number;
  badges?: string[];
  isChild?: boolean;
  parentId?: number;
  parentContext?: boolean; // Flag to indicate parent is accessing child context
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  firstName: string;
  lastName: string;
  first_name?: string;
  last_name?: string;
  max_children?: number;
}

export interface CreateChildData {
  firstName: string;
  username: string;
  age: number;
  gender: 'boy' | 'girl';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  createChild: (childData: CreateChildData) => Promise<void>;
  switchToChild: (childId: string) => Promise<void>;
  switchBackToParent: () => Promise<void>;
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
  const [parentUser, setParentUser] = useState<User | null>(null); // Store parent data when switching to child
  const [parentToken, setParentToken] = useState<string | null>(null); // Store parent token
  const navigate = useNavigate();

  const clearError = useCallback(() => setError(null), []);

  const handleAuthSuccess = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else if (userData.role === 'parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('AuthContext - loadUser called, token:', token ? 'exists' : 'not found');
    if (!token) {
      console.log('AuthContext - no token found, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('AuthContext - attempting to get profile with token');
      const userData = await authAPI.getProfile();
      console.log('AuthContext - profile loaded successfully:', userData);
      setUser(userData);
    } catch (error) {
      console.error('AuthContext - error loading user:', error);
      localStorage.removeItem('token');
    } finally {
      console.log('AuthContext - loadUser finished, setting loading to false');
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

  // Helper type for the registration API payload
  type RegisterAPIPayload = {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    firstName: string;
    lastName: string;
    max_children?: number;
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the data to match the backend's expected format
      const registrationData: RegisterAPIPayload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      // Only include max_children for parent role
      if (userData.role === 'parent') {
        registrationData.max_children = userData.max_children || 3;
      }
      
      // Type assertion needed because the API types aren't perfectly aligned with our frontend types
      const response = await authAPI.register(registrationData as any);
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

  // Type for the child creation API payload
  type CreateChildAPIPayload = {
    first_name: string;
    username: string;
    age: number;
    gender: 'boy' | 'girl';
    avatar?: string;
    role: 'student';
    password: string;
    email: string;
  };

  const createChild = async (childData: {
    firstName: string;
    username: string;
    age: number;
    gender: 'boy' | 'girl';
    avatar?: string;
  }): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Prepare the child data in the format expected by the backend
      const childRequest: CreateChildAPIPayload = {
        first_name: childData.firstName,
        username: childData.username,
        age: childData.age,
        gender: childData.gender,
        avatar: childData.avatar,
        role: 'student',
        password: 'defaultPassword123!', // Temporary password, should be changed
        email: `${childData.username}@child.local`
      };
      
      // Type assertion to handle the API call with our formatted data
      await authAPI.createChild(childRequest as any);
      
      // Reload user data to get updated children list and max_children
      await loadUser();
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create child profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const switchToChild = async (childId: string): Promise<void> => {
    if (!user || user.role !== 'parent') return;
    
    setLoading(true);
    try {
      console.log('Switching to child:', childId);
      const response = await authAPI.switchToChild(Number(childId));
      console.log('Switch response:', response);
      
      // Store current parent user data and token
      setParentUser(user);
      const currentToken = localStorage.getItem('token');
      setParentToken(currentToken);
      
      // Update token and set child as current user - DON'T use handleAuthSuccess
      localStorage.setItem('token', response.token);
      setUser(response.user);
      console.log('Child user set:', response.user);
      
      // Set loading to false BEFORE navigation to avoid PrivateRoute issues
      setLoading(false);
      
      // Navigate to LetterPath with childId
      navigate(`/letter-path/${childId}`);
      
    } catch (error: any) {
      console.error('Switch to child error:', error);
      setError(error.response?.data?.message || 'Failed to switch to child');
      setLoading(false);
      throw error;
    }
  };

  const switchBackToParent = async (): Promise<void> => {
    if (!parentUser || !parentToken) {
      console.error('No parent user or token stored');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Switching back to parent:', parentUser);
      // Restore parent user and token
      setUser(parentUser);
      localStorage.setItem('token', parentToken);
      
      // Clear parent storage
      setParentUser(null);
      setParentToken(null);
      
      // Navigate back to parent dashboard
      navigate('/parent/dashboard');
      
    } catch (error: any) {
      console.error('Error switching back to parent:', error);
      // Fallback: clear everything and go to login
      localStorage.removeItem('token');
      setUser(null);
      setParentUser(null);
      setParentToken(null);
      navigate('/login');
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
    switchToChild,
    switchBackToParent,
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