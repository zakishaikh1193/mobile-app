import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, BarChart3, MessageSquare, Calendar, Award, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTeacherService, Child, TeacherNotification } from '../services/teacherService';
import KodeitLogo from '../components/KodeitLogo';
import AnimatedButton from '../components/AnimatedButton';
import AudioButton from '../components/AudioButton';
import ProgressWheel from '../components/ProgressWheel';

const TeacherPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const teacherService = useTeacherService();
  const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [lastActiveData, setLastActiveData] = useState<{[key: string]: string}>({});
  const [timeSpentData, setTimeSpentData] = useState<{[key: string]: number}>({});

  // Load real data from localStorage
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = () => {
    try {
      // Load all children using the service
      const children = teacherService.getAllChildren();
      setAllChildren(children);

      // Load teacher notifications
      const savedNotifications = teacherService.getNotifications();
      setNotifications(savedNotifications);

      // Load last active data
      const lastActive = teacherService.getLastActiveData();
      setLastActiveData(lastActive);

      // Load time spent data
      const timeSpent = teacherService.getTimeSpentData();
      setTimeSpentData(timeSpent);

    } catch (error) {
      console.error('Error loading teacher data:', error);
    }
  };

  const getOverallProgress = (child: Child) => {
    return teacherService.getOverallProgress(child);
  };

  const getClassAverage = () => {
    return teacherService.getClassAverage();
  };

  const getActiveToday = () => {
    return teacherService.getActiveToday();
  };

  const getTotalBadges = () => {
    return teacherService.getTotalBadges();
  };

  const handleApproveLesson = (childId: string, lessonNumber: number) => {
    // Find the notification for this child and lesson
    const notification = notifications.find(n => 
      n.childId === childId && n.Lesson === lessonNumber && n.status === 'pending'
    );
    
    if (notification) {
      const updatedNotifications = teacherService.updateNotificationStatus(notification.id, 'approved');
      setNotifications(updatedNotifications);
    }
  };

  const handleRejectLesson = (childId: string, lessonNumber: number) => {
    // Find the notification for this child and lesson
    const notification = notifications.find(n => 
      n.childId === childId && n.Lesson === lessonNumber && n.status === 'pending'
    );
    
    if (notification) {
      const updatedNotifications = teacherService.updateNotificationStatus(notification.id, 'rejected');
      setNotifications(updatedNotifications);
    }
  };

  const getPendingNotifications = () => {
    return notifications.filter(n => n.status === 'pending');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <AudioButton />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <KodeitLogo size="md" />
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}</span>
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </AnimatedButton>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
          
          {/* Class Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{getActiveToday()}</div>
              <p className="text-gray-600">Active Today</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{getTotalBadges()}</div>
              <p className="text-gray-600">Total Badges</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Students</h2>
              
              {allChildren.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No students registered yet. Students will appear here when parents create accounts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allChildren.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedStudent?.id === child.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStudent(child)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{child.avatar}</div>
                          <div>
                            <h3 className="font-bold text-gray-800">{child.name}</h3>
                            <p className="text-sm text-gray-600">Age: {child.age} • {child.gender}</p>
                            <p className="text-xs text-gray-500">
                              Last active: {lastActiveData[child.id] || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <ProgressWheel progress={getOverallProgress(child)} size={60}>
                              <span className="text-xs font-bold text-purple-600">
                                {Math.round(getOverallProgress(child))}%
                              </span>
                            </ProgressWheel>
                          </div>
                          
                          <div className="text-right text-sm">
                            <div className="flex items-center space-x-1 text-orange-600">
                              <span>🔥</span>
                              <span>{child.streak}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <span>🏆</span>
                              <span>{child.badges.length}</span>
                            </div>
                            <div className="text-gray-600">
                              {timeSpentData[child.id] || 0}min/week
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Student Details */}
          <div>
            {selectedStudent ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl p-6 shadow-lg"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">{selectedStudent.avatar}</div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-gray-600">Age: {selectedStudent.age}</p>
                </div>

                {/* Progress by Hub */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-bold text-gray-800">Learning Progress</h4>
                  {Object.entries(selectedStudent.progress).map(([hub, progress]) => (
                    <div key={hub} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700">{hub}</span>
                        <span className="font-bold text-gray-800">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">Earned Badges</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStudent.badges.map((badge: string, index: number) => (
                      <div
                        key={index}
                        className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full text-center"
                      >
                        🏆 {badge}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson Access Control */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">Lesson Access</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-sm">Lesson 1</span>
                      <Unlock className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm">Lesson 2</span>
                      <Lock className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message Parent</span>
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Detailed Report</span>
                  </AnimatedButton>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <div className="text-6xl mb-4">👩‍🏫</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Student</h3>
                <p className="text-gray-600">
                  Click on a student from the list to view their detailed progress and information.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Notifications */}
        {getPendingNotifications().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-white rounded-3xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Approvals</h2>
            <div className="space-y-4">
              {getPendingNotifications().map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{notification.childName}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveLesson(notification.childId, notification.Lesson)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLesson(notification.childId, notification.Lesson)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-white rounded-3xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Generate Report</h3>
              <p className="text-gray-600 text-sm mb-4">Create progress reports for parents</p>
              <AnimatedButton variant="secondary" size="sm">
                Create Report
              </AnimatedButton>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Send Messages</h3>
              <p className="text-gray-600 text-sm mb-4">Communicate with parents</p>
              <AnimatedButton variant="success" size="sm">
                Send Message
              </AnimatedButton>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-2xl">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Award Badges</h3>
              <p className="text-gray-600 text-sm mb-4">Recognize student achievements</p>
              <AnimatedButton variant="primary" size="sm">
                Award Badge
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherPortal;