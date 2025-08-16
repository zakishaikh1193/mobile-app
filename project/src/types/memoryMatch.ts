export interface MemoryCard {
  id: string;
  value: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}

export interface MemoryMatchGameProps {
  gameType: 'alphabet' | 'numbers' | 'shapes' | 'colors' | 'words' | 'animals';
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (completionData: any) => void;
}

export interface MemoryMatchActivity {
  id: string;
  title: string;
  description: string;
  gameType: 'alphabet' | 'numbers' | 'shapes' | 'colors' | 'words' | 'animals';
  difficulty: 'easy' | 'medium' | 'hard';
  grade: string;
  lesson: string;
  createdAt: string;
}

export interface MemoryMatchSettings {
  gameType: 'alphabet' | 'numbers' | 'shapes' | 'colors' | 'words' | 'animals';
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  timeLimit?: number;
}
