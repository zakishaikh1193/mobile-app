export interface LessonData {
  id: string;
  number: number;
  title: string;
  description: string;
  stars: number;
  isCompleted: boolean;
  isLocked: boolean;
  zone: 'forest' | 'snow' | 'river' | 'desert' | 'castle';
  gameType: 'math' | 'logic' | 'dragdrop' | 'quiz' | 'puzzle' | 'coloring' | 'matching' | 'story';
  difficulty: 'easy' | 'medium' | 'hard';
  childId: string;
  learningObjectives: string[];
  skills: string[];
  estimatedDuration: number; // in minutes
  prerequisites: string[]; // Lesson IDs that must be completed first
  rewards: {
    badges: string[];
    points: number;
    unlockables: string[];
  };
  content: {
    images: string[];
    audio: string[];
    animations: string[];
  };
}

export const defaultLessons: Omit<LessonData, 'childId' | 'stars' | 'isCompleted' | 'isLocked'>[] = [
  {
    id: 'L1',
    number: 1,
    title: 'Lesson 1: Counting Fun',
    description: 'Learn to count from 1 to 10 with colorful objects!',
    zone: 'forest',
    gameType: 'math',
    difficulty: 'easy',
    learningObjectives: [
      'Count objects from 1 to 10',
      'Recognize number symbols',
      'Understand one-to-one correspondence'
    ],
    skills: ['counting', 'number recognition', 'basic math'],
    estimatedDuration: 5,
    prerequisites: [],
    rewards: {
      badges: ['First Steps', 'Number Explorer'],
      points: 100,
      unlockables: ['Forest Zone Access']
    },
    content: {
      images: ['/numbers/1.png', '/numbers/2.png', '/numbers/3.png'],
      audio: ['/audio/counting-1.mp3', '/audio/counting-2.mp3'],
      animations: ['/animations/counting-celebration.gif']
    }
  },
  {
    id: 'L2',
    number: 2,
    title: 'Lesson 2: Number Patterns',
    description: 'Learn to recognize and complete number patterns!',
    zone: 'forest',
    gameType: 'math',
    difficulty: 'easy',
    learningObjectives: [
      'Recognize simple number patterns',
      'Complete sequences of numbers',
      'Develop pattern recognition skills'
    ],
    skills: ['pattern recognition', 'number sequences', 'logical thinking'],
    estimatedDuration: 8,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Pattern Master', 'Sequence Explorer'],
      points: 150,
      unlockables: ['Pattern Games']
    },
    content: {
      images: ['/patterns/sequence1.png', '/patterns/sequence2.png', '/patterns/sequence3.png'],
      audio: ['/audio/pattern-sounds.mp3'],
      animations: ['/animations/pattern-complete.gif']
    }
  },
  {
    id: 'L3',
    number: 3,
    title: 'Lesson 3: Shape Explorer',
    description: 'Learn about circles, squares, and triangles!',
    zone: 'forest',
    gameType: 'puzzle',
    difficulty: 'easy',
    learningObjectives: [
      'Identify basic geometric shapes',
      'Sort objects by shape',
      'Understand shape properties'
    ],
    skills: ['shape recognition', 'sorting', 'spatial awareness'],
    estimatedDuration: 6,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Shape Detective', 'Geometry Explorer'],
      points: 120,
      unlockables: ['Shape Sorting Game']
    },
    content: {
      images: ['/shapes/circle.png', '/shapes/square.png', '/shapes/triangle.png'],
      audio: ['/audio/shape-names.mp3'],
      animations: ['/animations/shape-rotate.gif']
    }
  },
  {
    id: 'L4',
    number: 4,
    title: 'Lesson 4: Snowy Numbers',
    description: 'Practice addition in a winter wonderland!',
    zone: 'snow',
    gameType: 'math',
    difficulty: 'medium',
    learningObjectives: [
      'Add numbers up to 10',
      'Use visual aids for counting',
      'Understand addition as combining groups'
    ],
    skills: ['addition', 'number sense', 'problem solving'],
    estimatedDuration: 10,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Math Wizard', 'Snow Explorer'],
      points: 200,
      unlockables: ['Winter Math Games']
    },
    content: {
      images: ['/snow/snowman.png', '/snow/ice-cubes.png'],
      audio: ['/audio/addition-sounds.mp3'],
      animations: ['/animations/snow-fall.gif']
    }
  },
  {
    id: 'L5',
    number: 5,
    title: 'Lesson 5: Ice Logic',
    description: 'Solve puzzles on the frozen lake!',
    zone: 'snow',
    gameType: 'logic',
    difficulty: 'medium',
    learningObjectives: [
      'Follow multi-step instructions',
      'Solve simple logic puzzles',
      'Develop critical thinking skills'
    ],
    skills: ['logic', 'problem solving', 'critical thinking'],
    estimatedDuration: 12,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Logic Master', 'Ice Explorer'],
      points: 250,
      unlockables: ['Logic Puzzle Collection']
    },
    content: {
      images: ['/ice/ice-puzzle.png', '/ice/frozen-lake.png'],
      audio: ['/audio/logic-hints.mp3'],
      animations: ['/animations/ice-crack.gif']
    }
  },
  {
    id: 'L6',
    number: 6,
    title: 'Lesson 6: River Crossing',
    description: 'Help animals cross the river safely!',
    zone: 'river',
    gameType: 'puzzle',
    difficulty: 'medium',
    learningObjectives: [
      'Understand cause and effect',
      'Plan multi-step solutions',
      'Learn about animal habitats'
    ],
    skills: ['planning', 'cause and effect', 'animal knowledge'],
    estimatedDuration: 15,
    prerequisites: ['L1'],
    rewards: {
      badges: ['River Guide', 'Animal Helper'],
      points: 300,
      unlockables: ['River Adventure Games']
    },
    content: {
      images: ['/river/animals.png', '/river/bridge.png'],
      audio: ['/audio/river-sounds.mp3'],
      animations: ['/animations/water-flow.gif']
    }
  },
  {
    id: 'L7',
    number: 7,
    title: 'Lesson 7: Desert Math',
    description: 'Count camels and solve desert equations!',
    zone: 'desert',
    gameType: 'math',
    difficulty: 'hard',
    learningObjectives: [
      'Add and subtract numbers up to 20',
      'Use mental math strategies',
      'Solve word problems'
    ],
    skills: ['mental math', 'subtraction', 'word problems'],
    estimatedDuration: 18,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Desert Mathematician', 'Camel Counter'],
      points: 400,
      unlockables: ['Desert Math Challenges']
    },
    content: {
      images: ['/desert/camels.png', '/desert/pyramids.png'],
      audio: ['/audio/desert-wind.mp3'],
      animations: ['/animations/sand-storm.gif']
    }
  },
  {
    id: 'L8',
    number: 8,
    title: 'Lesson 8: Pyramid Puzzle',
    description: 'Build the ancient pyramid with logic!',
    zone: 'desert',
    gameType: 'logic',
    difficulty: 'hard',
    learningObjectives: [
      'Solve complex spatial puzzles',
      'Understand 3D shapes',
      'Apply logical reasoning'
    ],
    skills: ['spatial reasoning', '3D visualization', 'complex logic'],
    estimatedDuration: 20,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Pyramid Builder', 'Ancient Explorer'],
      points: 500,
      unlockables: ['3D Puzzle Collection']
    },
    content: {
      images: ['/pyramid/blocks.png', '/pyramid/blueprint.png'],
      audio: ['/audio/pyramid-mystery.mp3'],
      animations: ['/animations/pyramid-build.gif']
    }
  },
  {
    id: 'L9',
    number: 9,
    title: 'Lesson 9: Castle Challenge',
    description: 'Navigate through the magical castle!',
    zone: 'castle',
    gameType: 'quiz',
    difficulty: 'hard',
    learningObjectives: [
      'Apply all learned skills',
      'Answer complex questions',
      'Demonstrate comprehensive knowledge'
    ],
    skills: ['comprehensive review', 'test taking', 'knowledge application'],
    estimatedDuration: 25,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Castle Champion', 'Knowledge Master'],
      points: 600,
      unlockables: ['Castle Treasure Room']
    },
    content: {
      images: ['/castle/towers.png', '/castle/treasure.png'],
      audio: ['/audio/castle-magic.mp3'],
      animations: ['/animations/castle-sparkle.gif']
    }
  },
  {
    id: 'L10',
    number: 10,
    title: 'Lesson 10: Final Adventure',
    description: 'The ultimate learning challenge awaits!',
    zone: 'castle',
    gameType: 'puzzle',
    difficulty: 'hard',
    learningObjectives: [
      'Master all learning objectives',
      'Complete the ultimate challenge',
      'Achieve learning milestone'
    ],
    skills: ['mastery', 'comprehensive skills', 'achievement'],
    estimatedDuration: 30,
    prerequisites: ['L1'],
    rewards: {
      badges: ['Learning Champion', 'Adventure Master', 'Ultimate Explorer'],
      points: 1000,
      unlockables: ['Golden Trophy', 'Special Avatar', 'Bonus Games']
    },
    content: {
      images: ['/final/trophy.png', '/final/celebration.png'],
      audio: ['/audio/victory-fanfare.mp3'],
      animations: ['/animations/final-celebration.gif']
    }
  }
];

export const zoneThemes = {
  forest: {
    name: 'Enchanted Forest',
    description: 'A magical forest filled with learning adventures',
    color: 'from-green-400 to-green-600',
    emoji: '🌳',
    background: '/backgrounds/forest-bg.png',
    music: '/audio/forest-ambience.mp3'
  },
  snow: {
    name: 'Winter Wonderland',
    description: 'A snowy landscape perfect for cool learning',
    color: 'from-blue-300 to-blue-500',
    emoji: '❄️',
    background: '/backgrounds/snow-bg.png',
    music: '/audio/winter-ambience.mp3'
  },
  river: {
    name: 'Flowing River',
    description: 'A peaceful river with flowing knowledge',
    color: 'from-cyan-400 to-cyan-600',
    emoji: '🌊',
    background: '/backgrounds/river-bg.png',
    music: '/audio/river-ambience.mp3'
  },
  desert: {
    name: 'Mysterious Desert',
    description: 'An ancient desert with hidden treasures',
    color: 'from-yellow-400 to-orange-500',
    emoji: '🏜️',
    background: '/backgrounds/desert-bg.png',
    music: '/audio/desert-ambience.mp3'
  },
  castle: {
    name: 'Magical Castle',
    description: 'A grand castle where champions are made',
    color: 'from-purple-400 to-purple-600',
    emoji: '🏰',
    background: '/backgrounds/castle-bg.png',
    music: '/audio/castle-ambience.mp3'
  }
};

export const gameTypes = {
  math: {
    name: 'Mathematics',
    description: 'Numbers, counting, and calculations',
    icon: '🔢',
    color: 'from-blue-500 to-blue-600'
  },
  logic: {
    name: 'Logic & Reasoning',
    description: 'Puzzles and problem solving',
    icon: '🧩',
    color: 'from-purple-500 to-purple-600'
  },
  dragdrop: {
    name: 'Drag & Drop',
    description: 'Interactive matching and sorting',
    icon: '🖱️',
    color: 'from-green-500 to-green-600'
  },
  quiz: {
    name: 'Quiz & Questions',
    description: 'Test your knowledge',
    icon: '❓',
    color: 'from-red-500 to-red-600'
  },
  puzzle: {
    name: 'Puzzle Games',
    description: 'Brain teasers and challenges',
    icon: '🧠',
    color: 'from-orange-500 to-orange-600'
  },
  coloring: {
    name: 'Creative Coloring',
    description: 'Art and creativity',
    icon: '🎨',
    color: 'from-pink-500 to-pink-600'
  },
  matching: {
    name: 'Matching Games',
    description: 'Find pairs and patterns',
    icon: '🔗',
    color: 'from-indigo-500 to-indigo-600'
  },
  story: {
    name: 'Story Time',
    description: 'Reading and comprehension',
    icon: '📚',
    color: 'from-teal-500 to-teal-600'
  }
};

// Helper function to generate Lesson data for a specific child
export const generateChildLessons = (childId: string, completedLessons: string[] = []): LessonData[] => {
  return defaultLessons.map(Lesson => ({
    ...Lesson,
    childId,
    stars: completedLessons.includes(Lesson.id) ? Math.floor(Math.random() * 3) + 1 : 0,
    isCompleted: completedLessons.includes(Lesson.id),
    isLocked: Lesson.prerequisites.some(prereq => !completedLessons.includes(prereq))
  }));
};

// Helper function to get Lesson by ID
export const getLessonById = (LessonId: string, childId: string, completedLessons: string[] = []): LessonData | null => {
  const childLessons = generateChildLessons(childId, completedLessons);
  return childLessons.find(Lesson => Lesson.id === LessonId) || null;
};

// Helper function to get next available Lesson
export const getNextAvailableLesson = (childId: string, completedLessons: string[] = []): LessonData | null => {
  const childLessons = generateChildLessons(childId, completedLessons);
  return childLessons.find(Lesson => !Lesson.isLocked && !Lesson.isCompleted) || null;
};

// Helper function to calculate progress
export const calculateProgress = (completedLessons: string[]): number => {
  return Math.round((completedLessons.length / defaultLessons.length) * 100);
}; 