import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import './index.css';
import { ContentLibraryProvider, ContentLibraryDebug } from './contexts/ContentLibraryContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChildDashboard from './pages/ChildDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminPortal from './pages/AdminPortal';
import GradesManagement from './pages/admin/GradesManagement';
import BooksManagement from './pages/admin/BooksManagement';
import LessonsManagement from './pages/admin/LessonsManagement';
import UnitsManagement from './pages/admin/UnitsManagement';
import LearningHub from './pages/LearningHub';
import ParentDashboard from './pages/ParentDashboard';
import TeacherPortal from './pages/TeacherPortal';
import LetterPath from './components/LetterPath';
import StudentBookSelector from './components/StudentBookSelector';
import LessonActivities from './components/LessonActivities';
import LetterMatchingGame from './pages/LetterMatchingGame';
import EducationalGame from './pages/EducationalGame';
import WordMatchGame from './components/WordMatchGame';
import ForestLetterHuntGame from './components/ForestLetterHunt/Game';
import StructuredLearning from './pages/StructuredLearning';
import AdminChapterManagement from './pages/AdminChapterManagement';

// A wrapper for routes that require authentication
const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: Array<'admin' | 'teacher' | 'parent' | 'student'> }> = ({ 
  children, 
  roles = ['admin', 'teacher', 'parent', 'student'] 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>;
  }
  
  // Check if there's a token in localStorage
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If we have a token but no user yet, show loading (auth in progress)
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>;
  }
  
  // Check if user has the required role
  if (user && !roles.includes(user.role)) {
    // If user is a child in parent context, allow access to child routes
    if (user.isChild && user.parentContext) {
      return <>{children}</>;
    }
    // Otherwise, redirect to appropriate dashboard
    const dashboardPath = `/${user.role}/dashboard`;
    return <Navigate to={dashboardPath} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// A wrapper for public routes that should redirect if user is already authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  // Redirect authenticated users appropriately
  if (user) {
    const currentPath = window.location.pathname;
    
    // Always redirect from login/register pages
    if (currentPath === '/login' || currentPath === '/register') {
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" />;
        case 'teacher':
          return <Navigate to="/teacher/dashboard" />;
        case 'parent':
          return <Navigate to="/parent/dashboard" />;
        case 'student':
          // Let students navigate freely, don't force redirect
          return <>{children}</>;
        default:
          return <>{children}</>;
      }
    }
    
    // Redirect from root path only for non-students
    if (currentPath === '/') {
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" />;
        case 'teacher':
          return <Navigate to="/teacher/dashboard" />;
        case 'parent':
          return <Navigate to="/parent/dashboard" />;
        case 'student':
          // Students can stay on landing page or navigate freely
          return <>{children}</>;
        default:
          return <>{children}</>;
      }
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
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        
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
                              <Route path="dashboard" element={<AdminPortal />} />
                <Route path="portal" element={<AdminPortal />} />
                <Route path="users/new" element={<RegisterPage />} />
                <Route path="grades" element={<GradesManagement />} />
                <Route path="books" element={<BooksManagement />} />
                <Route path="lessons" element={<LessonsManagement />} />
                <Route path="units" element={<UnitsManagement />} />
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
              <Route path="portal" element={<TeacherPortal />} />
              <Route path="classes" element={<div>My Classes</div>} />
              <Route path="assignments" element={<div>Assignments</div>} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Parent Routes */}
        <Route path="/parent/*" element={
          <PrivateRoute roles={['parent']}>
            <Routes>
              <Route path="dashboard" element={<ParentDashboard />} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Letter Path Routes */}
        <Route path="/letter-path/:childId" element={
          <PrivateRoute>
            <LetterPath />
          </PrivateRoute>
        } />
        
        {/* Student Book Routes */}
        <Route path="/student-books/:childId" element={
          <PrivateRoute>
            <StudentBookSelector />
          </PrivateRoute>
        } />
        
        {/* Lesson Activities Routes */}
        <Route path="/lesson-activities/:lessonId/:childId" element={
          <PrivateRoute>
            <LessonActivities />
          </PrivateRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <PrivateRoute roles={['student']}>
            <Routes>
              <Route path="dashboard" element={<ChildDashboard />} />
              <Route path="letter-path" element={<LetterPath />} />
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
        
        <Route path="/letter-matching/:childId" element={
          <PrivateRoute>
            <LetterMatchingGame />
          </PrivateRoute>
        } />
        
        {/* <Route path="/forest-letter-hunt/:childId" element={
          <PrivateRoute>
            <ForestLetterHuntGame />
          </PrivateRoute>
        } /> */}
        
        <Route path="/educational-game/:childId" element={
          <PrivateRoute>
            <EducationalGame />
          </PrivateRoute>
        } />
        
        <Route path="/word-match/:childId" element={
          <PrivateRoute>
            <WordMatchGame />
          </PrivateRoute>
        } />
        
        <Route path="/tap-translation" element={
          <PrivateRoute>
            <div>Tap Translation Game - Coming Soon!</div>
          </PrivateRoute>
        } />
        
        <Route path="/ar-zone/:childId" element={
          <PrivateRoute>
            <div>AR Zone - Coming Soon!</div>
          </PrivateRoute>
        } />
        
        <Route path="/learning/:hubId/:childId" element={
          <PrivateRoute>
            <LearningHub />
          </PrivateRoute>
        } />
        
        <Route path="/structured-learning/:childId" element={
          <PrivateRoute>
            <StructuredLearning />
          </PrivateRoute>
        } />
        <Route path="/admin/chapters" element={
          <PrivateRoute roles={['admin']}>
            <AdminChapterManagement />
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