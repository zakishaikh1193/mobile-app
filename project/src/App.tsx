import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import './index.css';
import { ContentLibraryProvider, ContentLibraryDebug } from './contexts/ContentLibraryContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChildDashboard from './pages/ChildDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAssessmentDashboard from './pages/TeacherAssessmentDashboard';
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
import ActivityPlayerWithCompletion from './components/ActivityPlayerWithCompletion';
import LetterMatchingGame from './pages/LetterMatchingGame';
import EducationalGame from './pages/EducationalGame';
import WordMatchGame from './components/WordMatchGame';
import ForestLetterHuntGame from './pages/forest-letter-hunt';
import StructuredLearning from './pages/StructuredLearning';
import AdminChapterManagement from './pages/AdminChapterManagement';
import PuzzleTest from './pages/PuzzleTest';
import WorkingMazePuzzle from './components/WorkingMazePuzzle';
import JigsawPuzzle from './components/JigsawPuzzle';
import ARZone from './pages/ARZone';
import BubblePopSheets from './pages/BubblePopSheets';
import BubblePopGameSelection from './pages/BubblePopGameSelection';
import AdminBubblePopManagement from './components/AdminBubblePopManagement';
import BubblePopDemo from './pages/BubblePopDemo';
import BubblePopTest from './pages/BubblePopTest';
import CreateBubblePopActivity from './pages/CreateBubblePopActivity';
import BubblePopNavigation from './pages/BubblePopNavigation';

// A wrapper for routes that require authentication
const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: Array<'admin' | 'teacher' | 'parent' | 'student'> }> = ({ 
  children, 
  roles = ['admin', 'teacher', 'parent', 'student'] 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Check if there's a token in localStorage
  const token = localStorage.getItem('token');
  
  // Show loading while authentication is in progress
  if (loading || (token && !user)) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>;
  }
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If we have a token but no user after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

// Wrapper component for maze puzzle to handle route parameters
const MazeWrapper: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  return (
    <WorkingMazePuzzle 
      activityId={1} 
      childId={parseInt(childId || '1')} 
      onBack={() => window.history.back()} 
    />
  );
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
              <Route path="users" element={<div>User Management - Coming Soon</div>} />
              <Route path="content" element={<div>Content Management - Coming Soon</div>} />
              <Route path="chapters" element={<AdminChapterManagement />} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher/*" element={
          <PrivateRoute roles={['teacher']}>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="portal" element={<TeacherPortal />} />
              <Route path="classes" element={<div>My Classes - Coming Soon</div>} />
              <Route path="assignments" element={<div>Assignments - Coming Soon</div>} />
              <Route path="assessment-dashboard" element={<TeacherAssessmentDashboard />} />
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
        
        {/* Activity Player Routes */}
        <Route path="/activity/:activityId/:childId" element={
          <PrivateRoute>
            <ActivityPlayerWithCompletion />
          </PrivateRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <PrivateRoute roles={['student']}>
            <Routes>
              <Route path="dashboard" element={<ChildDashboard />} />
              <Route path="letter-path" element={<LetterPath />} />
              <Route path="activities" element={<LearningHub />} />
              <Route path="progress" element={<div>My Progress - Coming Soon</div>} />
            </Routes>
          </PrivateRoute>
        } />
        
        {/* Legacy Routes (for backward compatibility) */}
        <Route path="/auth" element={<Navigate to="/login" />} />
        <Route path="/parent-dashboard" element={
          <PrivateRoute roles={['admin', 'teacher', 'parent']}>
            <ParentDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/child-dashboard/:childId" 
          element={
            <PrivateRoute roles={['teacher', 'admin', 'parent', 'student']}>
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
        
        <Route path="/forest-letter-hunt/:childId" element={
          <PrivateRoute>
            <ForestLetterHuntGame />
          </PrivateRoute>
        } />
        
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
            <ARZone />
          </PrivateRoute>
        } />
        
        <Route path="/learning/:hubType/:childId" element={
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
        
        {/* Puzzle Test Route */}
        <Route path="/puzzle-test" element={
          <PrivateRoute>
            <PuzzleTest />
          </PrivateRoute>
        } />
        
        {/* Working Maze Puzzle Route */}
        <Route path="/working-maze/:childId" element={
          <PrivateRoute>
            <MazeWrapper />
          </PrivateRoute>
        } />
        
        {/* Bubble Pop Learning Sheets Route */}
        <Route path="/bubble-pop-sheets" element={
          <PrivateRoute>
            <BubblePopSheets />
          </PrivateRoute>
        } />
        
        {/* Enhanced Bubble Pop Game Selection Route */}
        <Route path="/bubble-pop-games" element={
          <PrivateRoute>
            <BubblePopGameSelection />
          </PrivateRoute>
        } />
        
        {/* Admin Bubble Pop Management Route */}
        <Route path="/admin/bubble-pop-management" element={
          <PrivateRoute roles={['admin']}>
            <AdminBubblePopManagement />
          </PrivateRoute>
        } />
        
        {/* Bubble Pop Demo Route */}
        <Route path="/bubble-pop-demo" element={
          <PrivateRoute>
            <BubblePopDemo />
          </PrivateRoute>
        } />
        
        {/* Bubble Pop Test Route */}
        <Route path="/bubble-pop-test" element={
          <PrivateRoute>
            <BubblePopTest />
          </PrivateRoute>
        } />
        
        {/* Create Bubble Pop Activity Route */}
        <Route path="/create-bubble-pop-activity" element={
          <PrivateRoute>
            <CreateBubblePopActivity />
          </PrivateRoute>
        } />
        
        {/* Bubble Pop Navigation Route */}
        <Route path="/bubble-pop-hub" element={
          <PrivateRoute>
            <BubblePopNavigation />
          </PrivateRoute>
        } />
        
        {/* Public Test Routes */}
        <Route path="/test-bubble-pop" element={<BubblePopTest />} />
        <Route path="/test-bubble-pop-demo" element={<BubblePopDemo />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ContentLibraryProvider>
          <AudioProvider>
            <AppRoutes />
          </AudioProvider>
        </ContentLibraryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;