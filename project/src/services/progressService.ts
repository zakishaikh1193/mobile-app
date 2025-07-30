import { useAuth } from '../contexts/AuthContext';

export interface ProgressUpdate {
  childId: string;
  hubId: string;
  newProgress: number;
}

export const useProgressService = () => {
  const { updateChildProgress } = useAuth();

  const updateProgress = (childId: string, hubId: string, newProgress: number) => {
    // Update the child's progress in the auth context
    updateChildProgress(childId, hubId, newProgress);
    
    // Get current child data to calculate overall progress
    const savedUser = localStorage.getItem('kodeit_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const child = user.children?.find((c: any) => c.id === childId);
      
      if (child) {
        // Calculate overall progress after update
        const updatedProgress = { ...child.progress, [hubId]: newProgress };
        const overallProgress = Object.values(updatedProgress).reduce((sum: number, val: any) => sum + val, 0) / Object.values(updatedProgress).length;
        
        // If overall progress reaches 100%, unlock Level 2
        if (overallProgress >= 100) {
          const letterPathProgress = JSON.parse(localStorage.getItem('letterPathProgress') || '[]');
          if (!letterPathProgress.includes(2)) {
            const newProgress = [...letterPathProgress, 2];
            localStorage.setItem('letterPathProgress', JSON.stringify(newProgress));
            console.log('🎉 Level 2 unlocked! Complete all learning hubs to unlock Level 2');
            
            // Show notification to user
            if (typeof window !== 'undefined' && 'Notification' in window) {
              new Notification('Level Up!', {
                body: 'Congratulations! You\'ve completed all learning hubs and unlocked Level 2!',
                icon: '/badges/B2.png'
              });
            }
          }
        }
      }
    }
  };

  const completeCard = (childId: string, hubId: string) => {
    // Set the specific card to 100% completion
    updateProgress(childId, hubId, 100);
    
    // Update day streak and badges
    updateStreakAndBadges(childId, hubId);
    
    // Check if all activities are completed for Level 1
    checkLevel1Completion(childId);
  };

  const checkLevel1Completion = (childId: string) => {
    // Get current user data
    const savedUser = localStorage.getItem('kodeit_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const child = user.children?.find((c: any) => c.id === childId);
      
      if (child) {
        // Check if all learning hubs are completed (100%)
        const allCompleted = Object.values(child.progress).every((progress: any) => progress >= 100);
        
        if (allCompleted) {
          // Send notification to teacher dashboard
          sendTeacherNotification(childId, child.name);
          
          // Show notification to child
          if (typeof window !== 'undefined' && 'Notification' in window) {
            new Notification('Level 1 Complete!', {
              body: `Congratulations! You've completed all Level 1 activities. Waiting for teacher review to unlock Level 2.`,
              icon: '/badges/B1.png'
            });
          }
        }
      }
    }
  };

  const sendTeacherNotification = (childId: string, childName: string) => {
    // Mock teacher notification system
    const teacherNotifications = JSON.parse(localStorage.getItem('teacherNotifications') || '[]');
    const newNotification = {
      id: Date.now(),
      childId: childId,
      childName: childName,
      level: 1,
      status: 'pending',
      message: `${childName} has completed all Level 1 activities. Please review and unlock Level 2.`,
      timestamp: new Date().toISOString(),
      type: 'level_completion'
    };
    
    teacherNotifications.push(newNotification);
    localStorage.setItem('teacherNotifications', JSON.stringify(teacherNotifications));
    
    console.log('📧 Teacher Notification Sent:', newNotification);
  };

  const updateStreakAndBadges = (childId: string, hubId: string) => {
    // Get current user data
    const savedUser = localStorage.getItem('kodeit_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const childIndex = user.children?.findIndex((c: any) => c.id === childId);
      
      if (childIndex !== undefined && childIndex >= 0) {
        const child = user.children[childIndex];
        
        // Update day streak - give 1 day when completing any activity
        const today = new Date().toDateString();
        const lastActivityDate = localStorage.getItem(`lastActivity_${childId}`);
        
        // Check if this is the first activity of the day
        if (lastActivityDate !== today) {
          // New day - increase streak by 1
          child.streak += 1;
          localStorage.setItem(`lastActivity_${childId}`, today);
          
          // Show notification for day streak
          if (typeof window !== 'undefined' && 'Notification' in window) {
            new Notification('Day Streak!', {
              body: `Great job! You've maintained a ${child.streak}-day learning streak!`,
              icon: '/star1.png'
            });
          }
        }
        
        // Add LetterPath badges (B1, B2, B3, B4, B5) based on completion
        const letterPathBadges = ['B1', 'B2', 'B3', 'B4', 'B5'];
        const hubToBadgeMap: { [key: string]: string } = {
          'literacy': 'B1',
          'creativity': 'B2', 
          'maths': 'B3',
          'emotions': 'B4',
          'body': 'B5',
          'family': 'B1' // Family also gives B1 badge
        };
        
        const badgeToAdd = hubToBadgeMap[hubId];
        if (badgeToAdd && !child.badges.includes(badgeToAdd)) {
          child.badges.push(badgeToAdd);
        }
        
        // Save updated user data
        localStorage.setItem('kodeit_user', JSON.stringify(user));
        
        // Show notification for new badges
        if (badgeToAdd && !child.badges.includes(badgeToAdd)) {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            new Notification('New Badge Earned!', {
              body: `Congratulations! You earned the "${badgeToAdd}" badge!`,
              icon: `/badges/${badgeToAdd}.png`
            });
          }
        }
      }
    }
  };

  return { updateProgress, completeCard, updateStreakAndBadges, sendTeacherNotification };
}; 