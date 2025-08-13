# Memory Match Activity

## Overview
The Memory Match activity is a new educational game that helps children develop memory skills, pattern recognition, and concentration. Players need to find matching pairs of cards by remembering their positions.

## Features

### Game Mechanics
- **Card Flipping**: Players flip cards to reveal images
- **Pair Matching**: Find two cards with the same image to create a match
- **Memory Challenge**: Cards are hidden after being flipped, requiring players to remember positions
- **Progressive Difficulty**: Three difficulty levels with increasing complexity

### Difficulty Levels
- **Easy**: 6 pairs (12 cards) in a 4x3 grid
- **Medium**: 8 pairs (16 cards) in a 4x4 grid  
- **Hard**: 12 pairs (24 cards) in a 6x4 grid

### Themes
- **Animals**: Cat, Dog, Lion, Monkey, Pig, Rabbit, Tiger, Zebra, Fish, Bird, Horse, Elephant
- **Fruits**: Apple, Grapes, Orange, Banana, Strawberry, Cherry, Lemon, Peach, Plum, Pineapple, Mango, Kiwi
- **Objects**: Ball, Car, Hat, Kite, Umbrella, Violin, Xylophone, Yoga, Wall, Ice, Juice

### Scoring System
- **Base Score**: 100 points
- **Time Bonus**: Up to 300 points for completing quickly
- **Move Bonus**: Up to 100 points for fewer moves
- **Hint Penalty**: -15 points per hint used

### Game Features
- **Timer**: Tracks completion time
- **Move Counter**: Counts total moves made
- **Hint System**: Up to 3 hints per game
- **Reset Function**: Start over with same configuration
- **Completion Modal**: Shows final score and statistics

## Technical Implementation

### Components
1. **MemoryMatch.tsx**: Main game component
2. **MemoryMatchTest.tsx**: Test page for development
3. **MemoryMatchManagement.tsx**: Admin management interface

### Integration
- **ActivityPlayer**: Integrated into the main activity system
- **Routing**: Added routes for testing and management
- **API**: Uses existing activity endpoints with type 'memory_match'

### File Structure
```
project/src/
├── components/
│   └── MemoryMatch.tsx
├── pages/
│   ├── MemoryMatchTest.tsx
│   └── admin/
│       └── MemoryMatchManagement.tsx
└── App.tsx (updated with routes)
```

## Usage

### For Students
1. Navigate to an activity with type 'memory_match'
2. Choose difficulty level (Easy/Medium/Hard)
3. Click cards to flip and find matching pairs
4. Use hints if needed (limited to 3)
5. Complete all pairs to finish the game

### For Administrators
1. Navigate to `/admin/memory-match`
2. Create new activities with custom settings
3. Manage existing activities (edit/delete)
4. Filter activities by difficulty and theme

### For Testing
1. Navigate to `/memory-match-test`
2. Test the game functionality
3. Verify scoring and completion logic

## Configuration

### Activity Data Structure
```typescript
{
  id: number;
  title: string;
  type: 'memory_match';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'animals' | 'fruits' | 'objects';
  estimated_duration: number;
  max_attempts: number;
  passing_score: number;
  lesson_id?: number;
  data: {
    difficulty: string;
    theme: string;
  }
}
```

### API Endpoints
- `GET /activities?type=memory_match` - Fetch memory match activities
- `POST /activities` - Create new activity
- `PUT /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity

## Future Enhancements
- Sound effects for card flips and matches
- Animations for card transitions
- Multiplayer mode
- Custom image uploads
- Progress tracking and analytics
- Accessibility features (keyboard navigation, screen reader support)

## Dependencies
- React 18+
- Framer Motion (for animations)
- Lucide React (for icons)
- Tailwind CSS (for styling)
- TypeScript (for type safety)
