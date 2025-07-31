import { useAuth } from '../contexts/AuthContext';

export interface Child {
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

export interface TeacherNotification {
  id: number;
  childId: string;
  childName: string;
  Lesson: number;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  timestamp: string;
  type: string;
}

export const useTeacherService = () => {
  const { user } = useAuth();

  const getAllChildren = (): Child[] => {
    try {
      // In a real app, this would fetch from a database
      // For now, we'll get from localStorage and create demo data
      const savedUser = localStorage.getItem('kodeit_user');
      if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        if (currentUser.role === 'parent' && currentUser.children) {
          return currentUser.children;
        }
      }
      
      // Return demo data for testing
      return [
        {
          id: 'child1',
          name: 'Emma Johnson',
          age: 5,
          avatar: '👧',
          gender: 'girl',
          progress: {
            literacy: 85,
            creativity: 92,
            maths: 78,
            emotions: 88,
            body: 75,
            family: 95
          },
          streak: 12,
          badges: ['B1', 'B2', 'B3', 'B4']
        },
        {
          id: 'child2',
          name: 'Liam Smith',
          age: 6,
          avatar: '👦',
          gender: 'boy',
          progress: {
            literacy: 72,
            creativity: 68,
            maths: 85,
            emotions: 70,
            body: 82,
            family: 77
          },
          streak: 8,
          badges: ['B1', 'B3', 'B5']
        },
        {
          id: 'child3',
          name: 'Sophia Davis',
          age: 4,
          avatar: '👧',
          gender: 'girl',
          progress: {
            literacy: 65,
            creativity: 88,
            maths: 55,
            emotions: 92,
            body: 68,
            family: 85
          },
          streak: 15,
          badges: ['B2', 'B4', 'B5']
        }
      ];
    } catch (error) {
      console.error('Error loading children data:', error);
      return [];
    }
  };

  const getNotifications = (): TeacherNotification[] => {
    try {
      return JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  };

  const updateNotificationStatus = (notificationId: number, status: 'approved' | 'rejected') => {
    try {
      const notifications = getNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status }
          : notification
      );
      
      localStorage.setItem('teacherNotifications', JSON.stringify(updatedNotifications));
      
      // If approved, unlock the lesson
      if (status === 'approved') {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          unlockLessonForChild(notification.childId, notification.Lesson);
        }
      }
      
      return updatedNotifications;
    } catch (error) {
      console.error('Error updating notification:', error);
      return [];
    }
  };

  const unlockLessonForChild = (childId: string, lessonNumber: number) => {
    try {
      const letterPathProgress = JSON.parse(localStorage.getItem('letterPathProgress') || '[]');
      if (!letterPathProgress.includes(lessonNumber)) {
        const newProgress = [...letterPathProgress, lessonNumber];
        localStorage.setItem('letterPathProgress', JSON.stringify(newProgress));
        console.log(`🔓 Lesson ${lessonNumber} unlocked for child ${childId}`);
      }
    } catch (error) {
      console.error('Error unlocking lesson:', error);
    }
  };

  const getChildProgress = (childId: string) => {
    const children = getAllChildren();
    return children.find(child => child.id === childId);
  };

  const getOverallProgress = (child: Child) => {
    const progressValues = Object.values(child.progress) as number[];
    return progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
  };

  const getClassAverage = () => {
    const children = getAllChildren();
    if (children.length === 0) return 0;
    const allProgress = children.map(child => getOverallProgress(child));
    return allProgress.reduce((sum, val) => sum + val, 0) / allProgress.length;
  };

  const getTotalBadges = () => {
    const children = getAllChildren();
    return children.reduce((sum, child) => sum + child.badges.length, 0);
  };

  const getActiveToday = () => {
    const today = new Date().toDateString();
    const children = getAllChildren();
    const lastActiveData = JSON.parse(localStorage.getItem('lastActiveData') || '{}');
    
    return children.filter(child => {
      const lastActive = lastActiveData[child.id] || child.id;
      return lastActive === today;
    }).length;
  };

  const getTimeSpentData = () => {
    return JSON.parse(localStorage.getItem('timeSpentData') || '{}');
  };

  const getLastActiveData = () => {
    return JSON.parse(localStorage.getItem('lastActiveData') || '{}');
  };

  const updateChildProgress = (childId: string, hubId: string, newProgress: number) => {
    try {
      const savedUser = localStorage.getItem('kodeit_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'parent' && user.children) {
          const updatedUser = {
            ...user,
            children: user.children.map((child: Child) =>
              child.id === childId
                ? {
                    ...child,
                    progress: {
                      ...child.progress,
                      [hubId]: newProgress
                    }
                  }
                : child
            )
          };
          localStorage.setItem('kodeit_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error updating child progress:', error);
    }
  };

  const awardBadge = (childId: string, badgeId: string) => {
    try {
      const savedUser = localStorage.getItem('kodeit_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'parent' && user.children) {
          const updatedUser = {
            ...user,
            children: user.children.map((child: Child) =>
              child.id === childId
                ? {
                    ...child,
                    badges: child.badges.includes(badgeId) 
                      ? child.badges 
                      : [...child.badges, badgeId]
                  }
                : child
            )
          };
          localStorage.setItem('kodeit_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const updateStreak = (childId: string, newStreak: number) => {
    try {
      const savedUser = localStorage.getItem('kodeit_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'parent' && user.children) {
          const updatedUser = {
            ...user,
            children: user.children.map((child: Child) =>
              child.id === childId
                ? { ...child, streak: newStreak }
                : child
            )
          };
          localStorage.setItem('kodeit_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return {
    getAllChildren,
    getNotifications,
    updateNotificationStatus,
    unlockLessonForChild,
    getChildProgress,
    getOverallProgress,
    getClassAverage,
    getTotalBadges,
    getActiveToday,
    getTimeSpentData,
    getLastActiveData,
    updateChildProgress,
    awardBadge,
    updateStreak
  };
}; 