import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { ContentLibraryProvider, ContentLibraryDebug } from './contexts/ContentLibraryContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChildDashboard from './pages/ChildDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPortal from './pages/AdminPortal';
import LearningHub from './pages/LearningHub';
import './index.css';

// A wrapper for routes that require authentication
const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: Array<'admin' | 'teacher' | 'student'> }> = ({ 
  children, 
  roles = ['admin', 'teacher', 'student'] 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!roles.includes(user.role)) {
    // You should create a simple "Unauthorized" page for a better user experience
    return <Navigate to="/" />; 
  }
  
  return <>{children}</>;
};

// A wrapper for public routes that should redirect if user is already authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  if (user) {
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" />;
      default:
        return <Navigate to="/student/dashboard" />;
    }
  }
  
  return <>{children}</>;
};

// Main App content component
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ContentLibraryDebug />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <PrivateRoute roles={['admin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="portal" element={<AdminPortal />} />
              <Route path="/users/new" element={ <RegisterPage /> } />
              <Route path="users" element={<div>User Management</div>} />
              <Route path="content" element={<div>Content Management</div>} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher/*" element={
          <PrivateRoute roles={['teacher']}>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<div>My Classes</div>} />
              <Route path="assignments" element={<div>Assignments</div>} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <PrivateRoute roles={['student']}>
            <Routes>
              <Route path="dashboard" element={<ChildDashboard />} />
              <Route path="activities" element={<LearningHub />} />
              <Route path="progress" element={<div>My Progress</div>} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Legacy Routes (for backward compatibility) */}
        <Route path="/auth" element={<Navigate to="/login" />} />
        <Route path="/parent-dashboard" element={
          <PrivateRoute roles={['admin', 'teacher']}>
            <div>ParentDashboard</div>
          </PrivateRoute>
        } />
        
        <Route path="/child-dashboard/:childId" 
          element={
            <PrivateRoute roles={['teacher', 'admin']}>
              <ChildDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Game and Activity Routes */}
        <Route path="/learning-hub" element={
          <PrivateRoute>
            <LearningHub />
          </PrivateRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  console.log('App rendering...');
  
  return (
    // Note: React.StrictMode is typically in main.tsx. If it's also there, you can remove it from here.
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <ContentLibraryProvider>
            <AudioProvider>
              <AppRoutes />
            </AudioProvider>
          </ContentLibraryProvider>
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;