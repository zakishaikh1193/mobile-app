import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface TeacherNotification {
  id: number;
  childId: string;
  childName: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  timestamp: string;
  type: string;
}

const TeacherDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    setNotifications(savedNotifications);
  }, []);

  const handleApprove = (notificationId: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'approved' as const }
        : notification
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem('teacherNotifications', JSON.stringify(updatedNotifications));
    
    // Unlock the level for the child
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      unlockLevelForChild(notification.childId, notification.level);
    }
  };

  const handleReject = (notificationId: number) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'rejected' as const }
        : notification
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem('teacherNotifications', JSON.stringify(updatedNotifications));
  };

  const unlockLevelForChild = (childId: string, level: number) => {
    // Mock function to unlock level for child
    const letterPathProgress = JSON.parse(localStorage.getItem('letterPathProgress') || '[]');
    if (!letterPathProgress.includes(level)) {
      const newProgress = [...letterPathProgress, level];
      localStorage.setItem('letterPathProgress', JSON.stringify(newProgress));
      console.log(`🔓 Level ${level} unlocked for child ${childId}`);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Teacher Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Level Completion Notifications
          </h2>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No notifications yet. Students will appear here when they complete levels.</p>
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