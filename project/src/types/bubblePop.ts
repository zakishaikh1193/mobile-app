// Bubble Pop Game Types
export interface BubbleType {
  id: string;
  value: string;
  type: 'alphabet' | 'number' | 'shape' | 'color' | 'word';
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  angle: number;
  wobble: number;
  isNearTop?: boolean; // Optional property for fade effect
}

export interface BubblePopGameProps {
  bubbleType: 'alphabet' | 'number' | 'shape' | 'color' | 'word';
  onComplete?: () => void;
  onBack?: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GameOption {
  id: string;
  type: 'alphabet' | 'number' | 'shape' | 'color' | 'word';
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  color: string;
}

export interface BubblePopActivity {
  title: string;
  description: string;
  numberOfBubbles: string;
  grade: string;
  unit: string;
  learningObjectives: string;
  estimatedDuration: string;
  difficulty: string;
  book: string;
  lesson: string;
  prerequisites: string;
  activityImage?: File;
}

export interface BubblePopSettings {
  id: string;
  name: string;
  type: 'alphabet' | 'number' | 'shape' | 'color' | 'word';
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  icon: string;
}
