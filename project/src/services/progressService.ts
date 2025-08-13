import { useAuth } from '../contexts/AuthContext';

export interface ProgressUpdate {
  childId: string;
  hubId: string;
  newProgress: number;
}

export const useProgressService = () => {
  const { updateChildProgress } = useAuth();

  const updateProgress = (childId: string, hubId: string, newProgress: number) => {
    // Update the child's progress in the auth context only
    updateChildProgress(childId, hubId, newProgress);
    
    // All progress tracking should be handled via the auth context and backend
    // Removed localStorage usage for user data storage
  };

  const completeCard = (childId: string, hubId: string) => {
    // Set the specific card to 100% completion
    updateProgress(childId, hubId, 100);
    
    // Update day streak and badges
    updateStreakAndBadges(childId, hubId);
    
    // Check if all activities are completed for Level 1
    checkLevel1Completion(childId);
  };

  const completeActivity = (childId: string, hubId: string, progressValue: number = 100) => {
    // This method should be called when an activity is actually completed
    updateProgress(childId, hubId, progressValue);
    
    // Update day streak and badges only when activity is completed
    if (progressValue >= 100) {
      updateStreakAndBadges(childId, hubId);
      checkLevel1Completion(childId);
    }
  };

  const checkLevel1Completion = (childId: string) => {
    // Level completion should be checked via backend API calls
    // Removed localStorage usage - this should be handled server-side
    console.log('Level completion check should be handled via backend for child:', childId);
  };

  const sendTeacherNotification = (childId: string, childName: string) => {
    // Teacher notifications should be sent via backend API
    // Removed localStorage usage - this should be handled server-side
    console.log('Teacher notification should be sent via API for child:', childId, childName);
  };

  const updateStreakAndBadges = (childId: string, hubId: string) => {
    // Streak and badge updates should be handled via backend API
    // Removed localStorage usage for user data - this should be handled server-side
    console.log('Streak and badge updates should be handled via API for child:', childId, 'hub:', hubId);
  };

  return { updateProgress, completeCard, completeActivity, updateStreakAndBadges, sendTeacherNotification };
}; 