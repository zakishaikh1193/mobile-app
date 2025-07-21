import { LineArt } from '../types/lineArt';

export const lineArtData: LineArt[] = [
  {
    id: 'cat-1',
    title: 'Happy Cat',
    category: 'Animals',
    difficulty: 'easy',
    tags: ['cat', 'pet', 'cute'],
    referenceImage: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Cat ears -->
      <path d="M120 140 L100 100 L140 120 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M280 140 L300 100 L260 120 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M110 115 L115 105 L125 110" fill="none" stroke="black" stroke-width="3"/>
      <path d="M275 115 L285 105 L290 110" fill="none" stroke="black" stroke-width="3"/>
      <!-- Cat head -->
      <ellipse cx="200" cy="200" rx="90" ry="80" fill="none" stroke="black" stroke-width="5"/>
      <!-- Cat eyes -->
      <ellipse cx="175" cy="180" rx="12" ry="15" fill="none" stroke="black" stroke-width="4"/>
      <ellipse cx="225" cy="180" rx="12" ry="15" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="175" cy="185" r="6" fill="black"/>
      <circle cx="225" cy="185" r="6" fill="black"/>
      <circle cx="178" cy="182" r="2" fill="white"/>
      <circle cx="228" cy="182" r="2" fill="white"/>
      <!-- Cat nose and mouth -->
      <path d="M195 200 L200 210 L205 200 Z" fill="none" stroke="black" stroke-width="4"/>
      <path d="M200 210 L200 220" stroke="black" stroke-width="4"/>
      <path d="M185 225 Q200 235 215 225" fill="none" stroke="black" stroke-width="4"/>
      <path d="M175 225 Q200 240 225 225" fill="none" stroke="black" stroke-width="4"/>
      <!-- Cat whiskers -->
      <line x1="140" y1="200" x2="170" y2="205" stroke="black" stroke-width="3"/>
      <line x1="140" y1="215" x2="170" y2="215" stroke="black" stroke-width="3"/>
      <line x1="140" y1="230" x2="170" y2="225" stroke="black" stroke-width="3"/>
      <line x1="260" y1="200" x2="230" y2="205" stroke="black" stroke-width="3"/>
      <line x1="260" y1="215" x2="230" y2="215" stroke="black" stroke-width="3"/>
      <line x1="260" y1="230" x2="230" y2="225" stroke="black" stroke-width="3"/>
      <!-- Cat body -->
      <ellipse cx="200" cy="320" rx="70" ry="50" fill="none" stroke="black" stroke-width="5"/>
      <!-- Cat paws -->
      <ellipse cx="160" cy="360" rx="15" ry="8" fill="none" stroke="black" stroke-width="4"/>
      <ellipse cx="240" cy="360" rx="15" ry="8" fill="none" stroke="black" stroke-width="4"/>
      <!-- Cat tail -->
      <path d="M270 320 Q320 300 330 250 Q335 220 320 200" fill="none" stroke="black" stroke-width="5"/>
    </svg>`
  },
  {
    id: 'butterfly-1',
    title: 'Beautiful Butterfly',
    category: 'Nature',
    difficulty: 'medium',
    tags: ['butterfly', 'insect', 'garden'],
    referenceImage: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Butterfly body -->
      <ellipse cx="200" cy="200" rx="8" ry="80" fill="none" stroke="black" stroke-width="5"/>
      <!-- Butterfly head -->
      <circle cx="200" cy="130" r="12" fill="none" stroke="black" stroke-width="5"/>
      <!-- Butterfly antennae -->
      <line x1="195" y1="125" x2="185" y2="110" stroke="black" stroke-width="4"/>
      <line x1="205" y1="125" x2="215" y2="110" stroke="black" stroke-width="4"/>
      <circle cx="185" cy="110" r="3" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="215" cy="110" r="3" fill="none" stroke="black" stroke-width="3"/>
      <!-- Upper wings -->
      <path d="M120 160 Q80 130 70 170 Q75 220 130 200 Q160 180 150 160 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M280 160 Q320 130 330 170 Q325 220 270 200 Q240 180 250 160 Z" fill="none" stroke="black" stroke-width="5"/>
      <!-- Lower wings -->
      <path d="M140 230 Q100 220 90 260 Q95 300 140 290 Q170 270 160 240 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M260 230 Q300 220 310 260 Q305 300 260 290 Q230 270 240 240 Z" fill="none" stroke="black" stroke-width="5"/>
      <!-- Wing patterns -->
      <circle cx="110" cy="175" r="8" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="290" cy="175" r="8" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="125" cy="200" r="5" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="275" cy="200" r="5" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="120" cy="260" r="6" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="280" cy="260" r="6" fill="none" stroke="black" stroke-width="3"/>
      <!-- Wing details -->
      <path d="M100 180 Q120 190 110 200" fill="none" stroke="black" stroke-width="3"/>
      <path d="M300 180 Q280 190 290 200" fill="none" stroke="black" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'tree-1',
    title: 'Magic Tree',
    category: 'Nature',
    difficulty: 'easy',
    tags: ['tree', 'nature', 'outdoor'],
    referenceImage: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Tree trunk -->
      <rect x="175" y="250" width="50" height="120" rx="10" fill="none" stroke="black" stroke-width="5"/>
      <!-- Tree trunk texture -->
      <line x1="185" y1="270" x2="185" y2="350" stroke="black" stroke-width="3"/>
      <line x1="195" y1="280" x2="195" y2="360" stroke="black" stroke-width="3"/>
      <line x1="205" y1="275" x2="205" y2="355" stroke="black" stroke-width="3"/>
      <line x1="215" y1="285" x2="215" y2="365" stroke="black" stroke-width="3"/>
      <!-- Main tree crown -->
      <circle cx="200" cy="180" r="70" fill="none" stroke="black" stroke-width="5"/>
      <!-- Additional foliage clusters -->
      <circle cx="150" cy="150" r="45" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="250" cy="150" r="45" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="180" cy="120" r="35" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="220" cy="120" r="35" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="200" cy="100" r="25" fill="none" stroke="black" stroke-width="5"/>
      <!-- Tree branches -->
      <line x1="190" y1="250" x2="160" y2="200" stroke="black" stroke-width="4"/>
      <line x1="210" y1="250" x2="240" y2="200" stroke="black" stroke-width="4"/>
      <line x1="200" y1="240" x2="200" y2="180" stroke="black" stroke-width="4"/>
      <!-- Leaves details -->
      <path d="M170 140 Q175 135 180 140" fill="none" stroke="black" stroke-width="3"/>
      <path d="M220 140 Q225 135 230 140" fill="none" stroke="black" stroke-width="3"/>
      <path d="M190 110 Q195 105 200 110" fill="none" stroke="black" stroke-width="3"/>
      <!-- Ground -->
      <path d="M50 370 Q200 360 350 370" fill="none" stroke="black" stroke-width="5"/>
      <!-- Grass -->
      <line x1="80" y1="370" x2="85" y2="360" stroke="black" stroke-width="3"/>
      <line x1="120" y1="370" x2="125" y2="355" stroke="black" stroke-width="3"/>
      <line x1="280" y1="370" x2="285" y2="360" stroke="black" stroke-width="3"/>
      <line x1="320" y1="370" x2="325" y2="355" stroke="black" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'car-1',
    title: 'Race Car',
    category: 'Transportation',
    difficulty: 'medium',
    tags: ['car', 'vehicle', 'racing'],
    referenceImage: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Car body -->
      <rect x="80" y="180" width="240" height="80" rx="25" fill="none" stroke="black" stroke-width="5"/>
      <!-- Car roof -->
      <rect x="130" y="130" width="140" height="50" rx="25" fill="none" stroke="black" stroke-width="5"/>
      <!-- Car wheels -->
      <circle cx="140" cy="280" r="35" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="260" cy="280" r="35" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="140" cy="280" r="20" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="260" cy="280" r="20" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="140" cy="280" r="8" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="260" cy="280" r="8" fill="none" stroke="black" stroke-width="3"/>
      <!-- Car windows -->
      <rect x="140" y="140" width="45" height="30" rx="5" fill="none" stroke="black" stroke-width="4"/>
      <rect x="215" y="140" width="45" height="30" rx="5" fill="none" stroke="black" stroke-width="4"/>
      <!-- Car details -->
      <rect x="90" y="200" width="15" height="25" rx="7" fill="none" stroke="black" stroke-width="4"/>
      <rect x="295" y="200" width="15" height="25" rx="7" fill="none" stroke="black" stroke-width="4"/>
      <!-- Car grille -->
      <rect x="85" y="190" width="10" height="40" rx="5" fill="none" stroke="black" stroke-width="4"/>
      <line x1="88" y1="200" x2="88" y2="220" stroke="black" stroke-width="2"/>
      <line x1="92" y1="200" x2="92" y2="220" stroke="black" stroke-width="2"/>
      <!-- Car door handles -->
      <circle cx="120" cy="210" r="4" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="280" cy="210" r="4" fill="none" stroke="black" stroke-width="3"/>
      <!-- Racing stripes -->
      <line x1="100" y1="200" x2="300" y2="200" stroke="black" stroke-width="3"/>
      <line x1="100" y1="240" x2="300" y2="240" stroke="black" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'rocket-1',
    title: 'Space Rocket',
    category: 'Space',
    difficulty: 'medium',
    tags: ['rocket', 'space', 'adventure'],
    referenceImage: 'https://images.pexels.com/photos/586030/pexels-photo-586030.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Rocket body -->
      <rect x="175" y="150" width="50" height="160" rx="25" fill="none" stroke="black" stroke-width="5"/>
      <!-- Rocket nose cone -->
      <path d="M175 150 Q200 70 225 150" fill="none" stroke="black" stroke-width="5"/>
      <!-- Rocket fins -->
      <path d="M155 220 L175 200 L175 280 L155 300 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M245 220 L225 200 L225 280 L245 300 Z" fill="none" stroke="black" stroke-width="5"/>
      <!-- Rocket windows -->
      <circle cx="200" cy="180" r="15" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="200" cy="220" r="10" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="200" cy="250" r="8" fill="none" stroke="black" stroke-width="4"/>
      <!-- Rocket details -->
      <line x1="185" y1="160" x2="215" y2="160" stroke="black" stroke-width="4"/>
      <line x1="185" y1="190" x2="215" y2="190" stroke="black" stroke-width="4"/>
      <line x1="185" y1="270" x2="215" y2="270" stroke="black" stroke-width="4"/>
      <line x1="185" y1="290" x2="215" y2="290" stroke="black" stroke-width="4"/>
      <!-- Rocket flames -->
      <path d="M165 310 L175 340 L185 320 L190 345 L195 325 L200 350 L205 325 L210 345 L215 320 L225 340 L235 310" fill="none" stroke="black" stroke-width="5"/>
      <!-- Stars in space -->
      <path d="M80 80 L85 90 L95 85 L90 95 L100 100 L90 105 L95 115 L85 110 L80 120 L75 110 L65 115 L70 105 L60 100 L70 95 L65 85 L75 90 Z" fill="none" stroke="black" stroke-width="3"/>
      <path d="M320 120 L323 127 L330 125 L327 132 L334 135 L327 138 L330 145 L323 143 L320 150 L317 143 L310 145 L313 138 L306 135 L313 132 L310 125 L317 127 Z" fill="none" stroke="black" stroke-width="3"/>
      <!-- Planets -->
      <circle cx="100" cy="150" r="20" fill="none" stroke="black" stroke-width="4"/>
      <path d="M85 145 Q100 140 115 145" fill="none" stroke="black" stroke-width="3"/>
      <path d="M85 155 Q100 160 115 155" fill="none" stroke="black" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'fish-1',
    title: 'Happy Fish',
    category: 'Underwater',
    difficulty: 'easy',
    tags: ['fish', 'ocean', 'underwater'],
    referenceImage: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Fish body -->
      <ellipse cx="200" cy="200" rx="90" ry="60" fill="none" stroke="black" stroke-width="5"/>
      <!-- Fish tail -->
      <path d="M110 200 L60 170 L70 200 L60 230 Z" fill="none" stroke="black" stroke-width="5"/>
      <!-- Fish fins -->
      <path d="M250 150 L300 130 L290 170 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M250 250 L300 270 L290 230 Z" fill="none" stroke="black" stroke-width="5"/>
      <path d="M180 260 L170 290 L200 280 Z" fill="none" stroke="black" stroke-width="4"/>
      <!-- Fish eye -->
      <circle cx="240" cy="180" r="18" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="240" cy="180" r="10" fill="black"/>
      <circle cx="243" cy="177" r="3" fill="white"/>
      <!-- Fish mouth -->
      <path d="M280 200 Q290 210 285 220" fill="none" stroke="black" stroke-width="4"/>
      <!-- Fish scales pattern -->
      <path d="M160 170 Q170 165 180 170 Q170 175 160 170" fill="none" stroke="black" stroke-width="3"/>
      <path d="M180 170 Q190 165 200 170 Q190 175 180 170" fill="none" stroke="black" stroke-width="3"/>
      <path d="M200 170 Q210 165 220 170 Q210 175 200 170" fill="none" stroke="black" stroke-width="3"/>
      <path d="M160 190 Q170 185 180 190 Q170 195 160 190" fill="none" stroke="black" stroke-width="3"/>
      <path d="M180 190 Q190 185 200 190 Q190 195 180 190" fill="none" stroke="black" stroke-width="3"/>
      <path d="M200 190 Q210 185 220 190 Q210 195 200 190" fill="none" stroke="black" stroke-width="3"/>
      <path d="M160 210 Q170 205 180 210 Q170 215 160 210" fill="none" stroke="black" stroke-width="3"/>
      <path d="M180 210 Q190 205 200 210 Q190 215 180 210" fill="none" stroke="black" stroke-width="3"/>
      <path d="M200 210 Q210 205 220 210 Q210 215 200 210" fill="none" stroke="black" stroke-width="3"/>
      <path d="M160 230 Q170 225 180 230 Q170 235 160 230" fill="none" stroke="black" stroke-width="3"/>
      <path d="M180 230 Q190 225 200 230 Q190 235 180 230" fill="none" stroke="black" stroke-width="3"/>
      <!-- Water bubbles -->
      <circle cx="80" cy="120" r="8" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="100" cy="100" r="6" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="120" cy="110" r="4" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="340" cy="150" r="5" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="350" cy="130" r="3" fill="none" stroke="black" stroke-width="3"/>
      <!-- Seaweed -->
      <path d="M50 350 Q60 320 50 290 Q40 260 50 230" fill="none" stroke="black" stroke-width="4"/>
      <path d="M370 350 Q360 320 370 290 Q380 260 370 230" fill="none" stroke="black" stroke-width="4"/>
    </svg>`
  },
  {
    id: 'sun-1',
    title: 'Smiling Sun',
    category: 'Nature',
    difficulty: 'easy',
    tags: ['sun', 'weather', 'happy'],
    referenceImage: 'https://images.pexels.com/photos/301599/pexels-photo-301599.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Sun face -->
      <circle cx="200" cy="200" r="70" fill="none" stroke="black" stroke-width="6"/>
      <!-- Sun rays -->
      <line x1="200" y1="40" x2="200" y2="80" stroke="black" stroke-width="8"/>
      <line x1="200" y1="320" x2="200" y2="360" stroke="black" stroke-width="8"/>
      <line x1="40" y1="200" x2="80" y2="200" stroke="black" stroke-width="8"/>
      <line x1="320" y1="200" x2="360" y2="200" stroke="black" stroke-width="8"/>
      <line x1="85" y1="85" x2="115" y2="115" stroke="black" stroke-width="8"/>
      <line x1="285" y1="115" x2="315" y2="85" stroke="black" stroke-width="8"/>
      <line x1="85" y1="315" x2="115" y2="285" stroke="black" stroke-width="8"/>
      <line x1="285" y1="285" x2="315" y2="315" stroke="black" stroke-width="8"/>
      <!-- Additional shorter rays -->
      <line x1="200" y1="60" x2="200" y2="70" stroke="black" stroke-width="6"/>
      <line x1="200" y1="330" x2="200" y2="340" stroke="black" stroke-width="6"/>
      <line x1="60" y1="200" x2="70" y2="200" stroke="black" stroke-width="6"/>
      <line x1="330" y1="200" x2="340" y2="200" stroke="black" stroke-width="6"/>
      <!-- Sun eyes -->
      <circle cx="175" cy="175" r="12" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="225" cy="175" r="12" fill="none" stroke="black" stroke-width="4"/>
      <circle cx="175" cy="175" r="6" fill="black"/>
      <circle cx="225" cy="175" r="6" fill="black"/>
      <circle cx="178" cy="172" r="2" fill="white"/>
      <circle cx="228" cy="172" r="2" fill="white"/>
      <!-- Sun cheeks -->
      <circle cx="140" cy="200" r="8" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="260" cy="200" r="8" fill="none" stroke="black" stroke-width="3"/>
      <!-- Sun smile -->
      <path d="M160 220 Q200 250 240 220" fill="none" stroke="black" stroke-width="5"/>
      <!-- Sun nose -->
      <circle cx="200" cy="195" r="3" fill="none" stroke="black" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'house-1',
    title: 'Cozy House',
    category: 'Buildings',
    difficulty: 'medium',
    tags: ['house', 'home', 'building'],
    referenceImage: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400',
    svgContent: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- House base -->
      <rect x="110" y="180" width="180" height="140" fill="none" stroke="black" stroke-width="5"/>
      <!-- House roof -->
      <path d="M90 180 L200 90 L310 180 Z" fill="none" stroke="black" stroke-width="5"/>
      <!-- Roof details -->
      <line x1="200" y1="90" x2="200" y2="120" stroke="black" stroke-width="4"/>
      <path d="M120 160 Q200 150 280 160" fill="none" stroke="black" stroke-width="4"/>
      <!-- Front door -->
      <rect x="170" y="230" width="60" height="90" rx="30" fill="none" stroke="black" stroke-width="5"/>
      <circle cx="215" cy="275" r="4" fill="black"/>
      <rect x="180" y="250" width="15" height="20" rx="7" fill="none" stroke="black" stroke-width="3"/>
      <rect x="205" y="250" width="15" height="20" rx="7" fill="none" stroke="black" stroke-width="3"/>
      <!-- Windows -->
      <rect x="130" y="200" width="30" height="30" fill="none" stroke="black" stroke-width="4"/>
      <rect x="240" y="200" width="30" height="30" fill="none" stroke="black" stroke-width="4"/>
      <line x1="145" y1="200" x2="145" y2="230" stroke="black" stroke-width="3"/>
      <line x1="130" y1="215" x2="160" y2="215" stroke="black" stroke-width="3"/>
      <line x1="255" y1="200" x2="255" y2="230" stroke="black" stroke-width="3"/>
      <line x1="240" y1="215" x2="270" y2="215" stroke="black" stroke-width="3"/>
      <!-- Chimney -->
      <rect x="240" y="110" width="25" height="50" fill="none" stroke="black" stroke-width="4"/>
      <rect x="235" y="110" width="35" height="8" fill="none" stroke="black" stroke-width="4"/>
      <!-- Smoke -->
      <circle cx="250" cy="95" r="4" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="255" cy="85" r="3" fill="none" stroke="black" stroke-width="3"/>
      <circle cx="260" cy="75" r="2" fill="none" stroke="black" stroke-width="3"/>
      <!-- Ground and garden -->
      <path d="M50 320 Q200 310 350 320" fill="none" stroke="black" stroke-width="5"/>
      <!-- Flowers -->
      <circle cx="80" cy="310" r="6" fill="none" stroke="black" stroke-width="3"/>
      <line x1="80" y1="316" x2="80" y2="325" stroke="black" stroke-width="3"/>
      <circle cx="320" cy="310" r="6" fill="none" stroke="black" stroke-width="3"/>
      <line x1="320" y1="316" x2="320" y2="325" stroke="black" stroke-width="3"/>
      <!-- Fence -->
      <line x1="50" y1="300" x2="50" y2="320" stroke="black" stroke-width="4"/>
      <line x1="70" y1="300" x2="70" y2="320" stroke="black" stroke-width="4"/>
      <line x1="330" y1="300" x2="330" y2="320" stroke="black" stroke-width="4"/>
      <line x1="350" y1="300" x2="350" y2="320" stroke="black" stroke-width="4"/>
      <line x1="50" y1="305" x2="70" y2="305" stroke="black" stroke-width="3"/>
      <line x1="330" y1="305" x2="350" y2="305" stroke="black" stroke-width="3"/>
    </svg>`
  }
]; 