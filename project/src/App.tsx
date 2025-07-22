import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { ContentLibraryProvider } from './contexts/ContentLibraryContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ParentDashboard from './pages/ParentDashboard';
import ChildDashboard from './pages/ChildDashboard';
import TeacherPortal from './pages/TeacherPortal';
import AdminPortal from './pages/AdminPortal';
import LearningHub from './pages/LearningHub';
import ARZone from './pages/ARZone';
import LetterMatchingGame from './pages/LetterMatchingGame';
import EducationalGame from './pages/EducationalGame';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <ContentLibraryProvider>
      <AuthProvider>
        <AudioProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route 
                  path="/parent-dashboard" 
                  element={
                    <ProtectedRoute role="parent">
                      <ParentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/child-dashboard/:childId" 
                  element={
                    <ProtectedRoute role="parent">
                      <ChildDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning/:hubType/:childId" 
                  element={
                    <ProtectedRoute role="parent">
                      <LearningHub />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ar-zone/:childId" 
                  element={
                    <ProtectedRoute role="parent">
                      <ARZone />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/letter-matching/:childId" 
                  element={
                    <ProtectedRoute role="parent">
                      <LetterMatchingGame />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/educational-game/:childId" 
                  element={
                    <ProtectedRoute role="parent">
                      <EducationalGame />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher" 
                  element={
                    <ProtectedRoute role="teacher">
                      <TeacherPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminPortal />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </AudioProvider>
      </AuthProvider>
    </ContentLibraryProvider>
  );
}

export default App;