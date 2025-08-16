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
  switchToChild: (childId: string) => Promise<boolean>;
  switchBackToParent: () => Promise<boolean>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('AuthProvider rendering...');
  
  // Use simple useState calls without lazy initializers
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parentUser, setParentUser] = useState<User | null>(null); // Store parent data when switching to child
  const [parentToken, setParentToken] = useState<string | null>(null); // Store parent token
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleAuthSuccess = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id.toString()); // Store user ID
    setUser(userData);
    
    // Check if there's a saved path to return to
    const savedPath = localStorage.getItem('lastPath');
    if (savedPath && savedPath !== '/login' && savedPath !== '/register') {
      setPendingNavigation(savedPath);
      localStorage.removeItem('lastPath'); // Clear saved path
    } else {
      // Set default navigation based on role
      if (userData.role === 'admin') {
        setPendingNavigation('/admin/dashboard');
      } else if (userData.role === 'teacher') {
        setPendingNavigation('/teacher/dashboard');
      } else if (userData.role === 'parent') {
        setPendingNavigation('/parent/dashboard');
      } else {
        setPendingNavigation('/student/dashboard');
      }
    }
  }, []);

  // Navigation handler effect
  const navigate = useNavigate();
  
  useEffect(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, navigate]);

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
      localStorage.setItem('userId', userData.id.toString()); // Store user ID
      setUser(userData);
      
      // Store current path for refresh preservation
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.setItem('lastPath', currentPath);
      }
    } catch (error: any) {
      console.error('AuthContext - error loading user:', error);
      // Only clear token if it's an authentication error, not network error
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId'); // Clear user ID on error
      }
    } finally {
      console.log('AuthContext - loadUser finished, setting loading to false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Save current path for refresh preservation
  useEffect(() => {
    const saveCurrentPath = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && user) {
        localStorage.setItem('lastPath', currentPath);
      }
    };

    // Save path on mount and when user changes
    saveCurrentPath();

    // Save path when URL changes
    window.addEventListener('popstate', saveCurrentPath);
    return () => window.removeEventListener('popstate', saveCurrentPath);
  }, [user]);

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
    console.log('Logout function called');
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Clear user ID
    setUser(null);
    setPendingNavigation('/login');
    console.log('Logout completed, navigating to login');
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

  const switchToChild = async (childId: string): Promise<boolean> => {
    if (!user || user.role !== 'parent') return false;
    
    setLoading(true);
    try {
      console.log('Switching to child:', childId);
      const response = await authAPI.switchToChild(Number(childId));
      console.log('Switch response:', response);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store current parent user data and token
      setParentUser(user);
      const currentToken = localStorage.getItem('token');
      setParentToken(currentToken);
      
      // Update token and set child as current user
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id.toString()); // Store child user ID
      
      // Update the user state with the new child user data
      setUser({
        ...response.user,
        isChild: true,
        parentId: user.id,
        parentContext: true
      });
      
      console.log('Child user set:', response.user);
      
      // Return success status instead of navigating here
      return true;
      
    } catch (error: any) {
      console.error('Switch to child error:', error);
      setError(error.response?.data?.message || 'Failed to switch to child');
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchBackToParent = async (): Promise<boolean> => {
    if (!parentUser || !parentToken) {
      console.error('No parent user or token stored');
      return false;
    }
    
    setLoading(true);
    try {
      console.log('Switching back to parent:', parentUser);
      
      // Ensure parentToken is a string before using it
      const tokenToUse = parentToken || '';
      localStorage.setItem('token', tokenToUse);
      localStorage.setItem('userId', parentUser.id.toString()); // Restore parent user ID
      
      // Update user state with parent data
      setUser({
        ...parentUser,
        isChild: false,
        parentContext: false
      });
      
      // Clear parent data from state
      setParentUser(null);
      setParentToken(null);
      
      console.log('Successfully switched back to parent user');
      
      // Navigate to parent dashboard
      setPendingNavigation('/parent/dashboard');
      
      return true;
      
    } catch (error) {
      console.error('Error switching back to parent:', error);
      setError('Failed to switch back to parent account');
      return false;
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