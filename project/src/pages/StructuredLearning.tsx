import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import EducationalHierarchy from '../components/EducationalHierarchy';
import TopicActivities from '../components/TopicActivities';

const StructuredLearning: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<number>>(new Set());

  const handleTopicSelect = (topicId: number) => {
    setSelectedTopicId(topicId);
  };

  const handleBackToHierarchy = () => {
    setSelectedTopicId(null);
  };

  const handleActivityComplete = (activityId: number, score: number) => {
    setCompletedActivities(prev => new Set([...prev, activityId]));
    // You can add celebration logic here
    console.log(`Activity ${activityId} completed with score ${score}`);
  };

  if (!childId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Child ID not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedTopicId ? (
        <TopicActivities
          topicId={selectedTopicId}
          childId={childId}
          onBack={handleBackToHierarchy}
          onActivityComplete={handleActivityComplete}
        />
      ) : (
        <EducationalHierarchy
          childId={childId}
          onTopicSelect={handleTopicSelect}
        />
      )}
    </div>
  );
};

export default StructuredLearning; 