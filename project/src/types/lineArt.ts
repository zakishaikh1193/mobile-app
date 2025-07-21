export interface LineArt {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  referenceImage: string;
  svgContent: string;
}

export type Tool = 'brush' | 'eraser' | 'bucket' | 'sticker';

export type Sticker = {
  id: string;
  emoji: string;
  name: string;
  category: string;
};

export type SavedArtwork = {
  id: string;
  originalId: string;
  title: string;
  category: string;
  createdAt: string;
  // Add more fields as needed
}; 