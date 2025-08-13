import React, { useState } from 'react';
import { CheckCircle, Save, Loader2 } from 'lucide-react';
import api from '../services/api';

interface ActivityCompletionButtonProps {
  activityId: number;
  childId: string;
  activityType: string;
  onComplete?: () => void;
  completionData?: any;
  className?: string;
}

const ActivityCompletionButton: React.FC<ActivityCompletionButtonProps> = ({
  activityId,
  childId,
  activityType,
  onComplete,
  completionData,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!activityId || !childId) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('child_id', childId);
      formData.append('activity_id', activityId.toString());
      formData.append('time_spent_seconds', '180'); // Default time, can be made dynamic
      
      if (completionData) {
        formData.append('completion_data', JSON.stringify(completionData));
      }

      const response = await api.post('/activities/complete', formData);
      
      if (response.data.success) {
        alert('🎉 Activity completed successfully! Your work has been submitted for teacher review.');
        onComplete?.();
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      alert('❌ Failed to complete activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isSubmitting}
      className={`
        flex items-center justify-center space-x-2 px-6 py-3 
        bg-gradient-to-r from-green-500 to-green-600 
        text-white font-semibold rounded-lg shadow-lg 
        hover:from-green-600 hover:to-green-700 
        transform hover:scale-105 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Submitting...</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5" />
          <span>Complete Activity</span>
        </>
      )}
    </button>
  );
};

export default ActivityCompletionButton;
