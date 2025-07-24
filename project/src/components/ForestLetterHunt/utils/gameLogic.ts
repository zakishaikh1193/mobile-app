export interface LevelTheme {
  name: string;
  colors: {
    bush: string;
    prompt: string;
  };
  emoji: string;
}

export const getLevelTheme = (level: number): LevelTheme => {
  const themes: LevelTheme[] = [
    {
      name: 'Enchanted Forest',
      colors: {
        bush: 'bg-gradient-to-br from-green-400 to-green-600',
        prompt: 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800'
      },
      emoji: '🌲'
    },
    {
      name: 'Mystical Jungle',
      colors: {
        bush: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
        prompt: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800'
      },
      emoji: '🌿'
    },
    {
      name: 'Alpine Meadows',
      colors: {
        bush: 'bg-gradient-to-br from-teal-400 to-teal-600',
        prompt: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800'
      },
      emoji: '🏔️'
    },
    {
      name: 'Winter Wonderland',
      colors: {
        bush: 'bg-gradient-to-br from-blue-300 to-blue-500',
        prompt: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
      },
      emoji: '❄️'
    }
  ];

  const themeIndex = Math.floor((level - 1) / 5) % themes.length;
  return themes[themeIndex];
};

export const getRandomLetters = (difficulty: 'easy' | 'medium' | 'hard', letterCase: 'uppercase' | 'lowercase' | 'mixed'): string[] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  let numBushes = 5; // Always 5 letters per level

  const selectedLetters: string[] = [];
  
  while (selectedLetters.length < numBushes) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    const letter = alphabet[randomIndex];
    
    if (!selectedLetters.includes(letter)) {
      let finalLetter = letter;
      
      if (letterCase === 'lowercase') {
        finalLetter = letter.toLowerCase();
      } else if (letterCase === 'mixed') {
        finalLetter = Math.random() > 0.5 ? letter : letter.toLowerCase();
      }
      
      selectedLetters.push(finalLetter);
    }
  }

  return selectedLetters;
};

export const getPhonicsPrompt = (letter: string): string => {
  const phonicsMap: { [key: string]: string } = {
    'A': 'Find the letter that sounds like "ah" as in apple',
    'B': 'Find the letter that sounds like "buh" as in ball',
    'C': 'Find the letter that sounds like "kuh" as in cat',
    'D': 'Find the letter that sounds like "duh" as in dog',
    'E': 'Find the letter that sounds like "eh" as in egg',
    'F': 'Find the letter that sounds like "fuh" as in fish',
    'G': 'Find the letter that sounds like "guh" as in goat',
    'H': 'Find the letter that sounds like "huh" as in hat',
    'I': 'Find the letter that sounds like "ih" as in igloo',
    'J': 'Find the letter that sounds like "juh" as in jump',
    'K': 'Find the letter that sounds like "kuh" as in kite',
    'L': 'Find the letter that sounds like "luh" as in lion',
    'M': 'Find the letter that sounds like "muh" as in moon',
    'N': 'Find the letter that sounds like "nuh" as in nest',
    'O': 'Find the letter that sounds like "oh" as in octopus',
    'P': 'Find the letter that sounds like "puh" as in pig',
    'Q': 'Find the letter that sounds like "kwuh" as in queen',
    'R': 'Find the letter that sounds like "ruh" as in rabbit',
    'S': 'Find the letter that sounds like "sss" as in snake',
    'T': 'Find the letter that sounds like "tuh" as in turtle',
    'U': 'Find the letter that sounds like "uh" as in umbrella',
    'V': 'Find the letter that sounds like "vuh" as in violin',
    'W': 'Find the letter that sounds like "wuh" as in whale',
    'X': 'Find the letter that sounds like "ks" as in box',
    'Y': 'Find the letter that sounds like "yuh" as in yellow',
    'Z': 'Find the letter that sounds like "zzz" as in zebra'
  };

  return phonicsMap[letter.toUpperCase()] || `Find the letter ${letter.toUpperCase()}`;
};

export const getSightWords = (level: number): string[] => {
  const easyWords = ['CAT', 'DOG', 'SUN', 'BIG', 'RED'];
  const mediumWords = ['TREE', 'BOOK', 'FISH', 'BIRD', 'FROG'];
  const hardWords = ['HOUSE', 'WATER', 'HAPPY', 'LIGHT', 'DANCE'];

  if (level <= 5) return easyWords;
  if (level <= 10) return mediumWords;
  return hardWords;
}; 