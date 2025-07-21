import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'parent' | 'teacher' | 'admin';
  name: string;
  children?: Child[];
}

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  gender: 'boy' | 'girl';
  progress: {
    literacy: number;
    creativity: number;
    maths: number;
    emotions: number;
    body: number;
    family: number;
  };
  streak: number;
  badges: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  createChild: (childData: Omit<Child, 'id' | 'progress' | 'streak' | 'badges'>) => void;
  updateChildProgress: (childId: string, hub: string, progress: number) => void;
  loading: boolean;
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

  useEffect(() => {
    // Simulate loading user from localStorage or API
    const savedUser = localStorage.getItem('kodeit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Hardcoded credentials
      const credentials: Record<string, string> = {
        'Admin@demo.com': 'Admin@123',
        'Teacher@demo.com': 'Teacher@123',
        'Parent@demo.com': 'Parent@123'
      };

      // Check if credentials are valid
      if (!Object.keys(credentials).includes(email) || credentials[email as keyof typeof credentials] !== password) {
        throw new Error('Invalid credentials');
      }

      // Create user based on email
      let mockUser: User;
      if (email === 'Admin@demo.com') {
        mockUser = {
          id: '1',
          email,
          role: 'admin' as const,
          name: 'Admin User'
        };
      } else if (email === 'Teacher@demo.com') {
        mockUser = {
          id: '2',
          email,
          role: 'teacher' as const,
          name: 'Teacher User'
        };
      } else if (email === 'Parent@demo.com') {
        mockUser = {
          id: '3',
          email,
          role: 'parent' as const,
          name: 'Parent User',
          children: [
            {
              id: 'child1',
              name: 'Emma',
              age: 5,
              avatar: '👧',
              gender: 'girl' as const,
              progress: {
                literacy: 65,
                creativity: 80,
                maths: 45,
                emotions: 70,
                body: 55,
                family: 90
              },
              streak: 7,
              badges: ['reader', 'artist', 'mathlete']
            }
          ]
        };
      } else {
        throw new Error('Invalid user type');
      }

      // Add children data for parent
      if (mockUser.role === 'parent') {
        mockUser.children = [
          {
            id: 'child1',
            name: 'Emma',
            age: 5,
            avatar: '👧',
            gender: 'girl' as const,
            progress: {
              literacy: 65,
              creativity: 80,
              maths: 45,
              emotions: 70,
              body: 55,
              family: 90
            },
            streak: 7,
            badges: ['reader', 'artist', 'mathlete']
          }
        ];
      }

      setUser(mockUser);
      setLoading(false);
      localStorage.setItem('kodeit_user', JSON.stringify(mockUser));

      // Navigate based on role
      if (mockUser.role === 'admin') {
        window.location.href = '/admin';
      } else if (mockUser.role === 'teacher') {
        window.location.href = '/teacher';
      } else {
        window.location.href = '/parent-dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        role: role as 'parent' | 'teacher' | 'admin',
        name,
        children: role === 'parent' ? [] : undefined
      };
      
      setUser(newUser);
      localStorage.setItem('kodeit_user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kodeit_user');
  };

  const createChild = (childData: Omit<Child, 'id' | 'progress' | 'streak' | 'badges'>) => {
    if (!user || user.role !== 'parent') return;
    const newChild: Child = {
      ...childData,
      id: `child${Date.now()}`,
      progress: {
        literacy: 0,
        creativity: 0,
        maths: 0,
        emotions: 0,
        body: 0,
        family: 0
      },
      streak: 0,
      badges: []
    };
    setUser({
      ...user,
      children: [...(user.children || []), newChild]
    });
  };

  const updateChildProgress = (childId: string, hub: string, progress: number) => {
    if (!user || user.role !== 'parent') return;
    setUser({
      ...user,
      children: user.children?.map(child =>
        child.id === childId
          ? {
              ...child,
              progress: {
                ...child.progress,
                [hub]: progress
              }
            }
          : child
      )
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    createChild,
    updateChildProgress,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};