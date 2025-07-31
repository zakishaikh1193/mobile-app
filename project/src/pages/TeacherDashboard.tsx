import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User, Users, BarChart3, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTeacherService, Child, TeacherNotification } from '../services/teacherService';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const teacherService = useTeacherService();
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = () => {
    try {
      // Load all children using the service
      const children = teacherService.getAllChildren();
      setAllChildren(children);

      // Load notifications from localStorage
      const savedNotifications = teacherService.getNotifications();
      setNotifications(savedNotifications);
    } catch (error) {
      console.error('Error loading teacher dashboard data:', error);
    }
  };

  const handleApprove = (notificationId: number) => {
    const updatedNotifications = teacherService.updateNotificationStatus(notificationId, 'approved');
    setNotifications(updatedNotifications);
  };

  const handleReject = (notificationId: number) => {
    const updatedNotifications = teacherService.updateNotificationStatus(notificationId, 'rejected');
    setNotifications(updatedNotifications);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getOverallProgress = (child: Child) => {
    return teacherService.getOverallProgress(child);
  };

  const getClassAverage = () => {
    return teacherService.getClassAverage();
  };

  const getTotalBadges = () => {
    return teacherService.getTotalBadges();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Teacher Dashboard
        </h1>
        
        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{allChildren.length}</div>
            <p className="text-gray-600">Total Students</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{Math.round(getClassAverage())}%</div>
            <p className="text-gray-600">Class Average</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{getTotalBadges()}</div>
            <p className="text-gray-600">Total Badges</p>
          </div>
        </div>

        {/* Student Progress Overview */}
        {allChildren.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Student Progress Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allChildren.map((child) => (
                <div key={child.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">{child.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{child.name}</h3>
                      <p className="text-sm text-gray-600">Age: {child.age}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-bold">{Math.round(getOverallProgress(child))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${getOverallProgress(child)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>🔥 {child.streak} days</span>
                      <span>🏆 {child.badges.length} badges</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Lesson Completion Notifications
          </h2>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet. Students will appear here when they complete Lessons.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(notification.status)}
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {notification.childName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                      
                      {notification.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(notification.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(notification.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 