// Bubble Pop Game Constants
export const GAME_CONTENT = {
  alphabet: {
    values: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    title: 'Alphabet Bubble Pop'
  },
  number: {
    values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    title: 'Number Bubble Pop'
  },
  shape: {
    values: ['●', '■', '▲', '◆', '★', '♦', '♠', '♥', '○', '□', '△', '◇'],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    title: 'Shape Bubble Pop'
  },
  color: {
    values: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White'],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    title: 'Color Bubble Pop'
  },
  word: {
    values: ['Cat', 'Dog', 'Bird', 'Fish', 'Tree', 'Sun', 'Moon', 'Star', 'Book', 'Ball', 'Car', 'House'],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    title: 'Word Bubble Pop'
  }
};

export const GAME_OPTIONS = [
  {
    id: '1',
    type: 'alphabet' as const,
    name: 'Alphabet Bubble Pop',
    description: 'Learn the alphabet by popping letter bubbles! Find and pop the letters as they float up.',
    icon: '🔤',
    difficulty: 'easy' as const,
    isActive: true,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '2',
    type: 'number' as const,
    name: 'Number Bubble Pop',
    description: 'Practice numbers 1-20 with fun bubble popping! Count and pop the correct numbers.',
    icon: '🔢',
    difficulty: 'medium' as const,
    isActive: true,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '3',
    type: 'shape' as const,
    name: 'Shape Bubble Pop',
    description: 'Learn geometric shapes through bubble popping! Find circles, squares, triangles, and more.',
    icon: '🔷',
    difficulty: 'easy' as const,
    isActive: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '4',
    type: 'color' as const,
    name: 'Color Bubble Pop',
    description: 'Learn colors by popping colored bubbles! Match the colors and learn their names.',
    icon: '🎨',
    difficulty: 'easy' as const,
    isActive: true,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    type: 'word' as const,
    name: 'Word Bubble Pop',
    description: 'Learn common words through bubble popping! Read and pop words like cat, dog, sun, and more.',
    icon: '📝',
    difficulty: 'hard' as const,
    isActive: true,
    color: 'from-indigo-500 to-purple-500'
  }
];

export const BUBBLE_POP_REQUIREMENTS = [
  'Animated bubble graphics',
  'Sound effects for popping',
  'Target content (numbers/letters)',
  'Timer and scoring system'
];
