// Kuwait Flyer - Game Utilities
// Traditional Kuwait-inspired game mechanics and sounds

// Audio context for sound effects
let audioContext = null;
let gainNodePool = []; // Pool gain nodes for reuse
let oscillatorCache = {}; // Cache oscillator properties

// Initialize audio context (required for mobile browsers)
export const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Optimized sound generation with object pooling
export const playSound = (frequency, duration, type = 'sine', volume = 0.1) => {
  if (!audioContext) {
    initAudioContext();
  }
  
  try {
    const oscillator = audioContext.createOscillator();
    
    // Reuse gain node from pool or create new one
    let gainNode;
    if (gainNodePool.length > 0) {
      gainNode = gainNodePool.pop();
    } else {
      gainNode = audioContext.createGain();
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Use cached properties when possible
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(volume, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);
    
    // Return gain node to pool after use
    setTimeout(() => {
      if (gainNodePool.length < 10) { // Limit pool size
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNodePool.push(gainNode);
      }
    }, (duration + 0.1) * 1000);
    
  } catch (error) {
    // Fail silently in production for performance
    // console.warn('Audio playback failed:', error);
  }
};

// Kuwait-themed sound effects (optimized)
export const sounds = {
  // Falcon wing flap - cached for performance
  flap: () => {
    playSound(400, 0.15, 'square', 0.08);
    setTimeout(() => playSound(350, 0.1, 'sine', 0.05), 50);
  },
  
  // Success sound - cached timing
  pass: () => {
    playSound(600, 0.2, 'sine', 0.12);
    setTimeout(() => playSound(800, 0.15, 'sine', 0.08), 100);
  },
  
  // Crash sound - optimized with fewer operations
  crash: () => {
    playSound(150, 0.4, 'sawtooth', 0.15);
    setTimeout(() => playSound(100, 0.3, 'sawtooth', 0.1), 200);
  },
  
  // Game over sequence - reduced complexity
  gameOver: () => {
    setTimeout(() => playSound(400, 0.3, 'sine', 0.1), 0);
    setTimeout(() => playSound(350, 0.3, 'sine', 0.08), 300);
    setTimeout(() => playSound(300, 0.5, 'sine', 0.06), 600);
  }
};

// Haptic feedback for mobile devices
export const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Collision detection between rectangles
export const checkCollision = (rect1, rect2) => {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
};

// Game physics constants with Flappy Bird-style mechanics
export const PHYSICS = {
  GRAVITY: 1,                    // Increased gravity for faster falling
  FLAP_STRENGTH: -12,              // Increased flap strength for higher jumps
  BASE_TOWER_SPEED: 2.5,           // Slightly faster movement
  GROUND_HEIGHT: 60,
  MAX_FALL_SPEED: 12,              // Increased terminal velocity for faster falling
  ROTATION_SPEED: 4                // How fast bird rotates based on velocity
};

// Flappy Bird-style difficulty scaling
export const getDifficultySettings = (score) => {
  // More gradual difficulty progression like Flappy Bird
  const difficultyLevel = Math.floor(score / 10); // Increase difficulty every 10 points
  const speedMultiplier = 1 + (difficultyLevel * 0.1); // 10% speed increase per level (slower)
  const gapReduction = Math.min(difficultyLevel * 5, 30); // Reduce gap by 5px per level (max 30px)
  const spacingReduction = Math.min(difficultyLevel * 10, 50); // Reduce spacing by 10px per level (max 50px)
  
  return {
    towerSpeed: PHYSICS.BASE_TOWER_SPEED * speedMultiplier,
    gapSize: Math.max(130, 160 - gapReduction), // Min gap of 130px (more forgiving than before)
    towerSpacing: Math.max(250, 320 - spacingReduction), // Min spacing of 250px
    gravity: PHYSICS.GRAVITY + (difficultyLevel * 0.01), // Very slight gravity increase
    difficultyLevel: difficultyLevel,
    speedMultiplier: speedMultiplier
  };
};

// New Blue Ribbon color palette
export const GAME_COLORS = {
  BLUE_RIBBON: '#1356FB',    // Primary bright blue - main game elements
  TACAO: '#ECAF8D',          // Peachy beige - accent color
  DOWNRIVER: '#0C1C4A',      // Dark blue - outlines and borders
  MALIBU: '#8CB4FC',         // Light blue - backgrounds and secondary elements
  
  // Keep white prominent as requested
  WHITE: '#FFFFFF',
  BLACK: '#000000'
};

// Kuwait-themed colors
export const KUWAIT_COLORS = {
  FLAG_GREEN: '#007A33',
  FLAG_WHITE: '#FFFFFF',
  FLAG_RED: '#CE1126',
  FLAG_BLACK: '#000000',
  DESERT_SAND: '#F4A460',
  SKY_BLUE: '#87CEEB',
  FALCON_BROWN: '#8B4513',
  TOWER_GREEN: '#007A33'
};

// Utility to clamp values
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Generate Flappy Bird-style obstacles with object pooling
export const generateKuwaitTower = (canvasWidth, canvasHeight, gapSize = 160, pooledTower = null) => {
  const towerWidth = 70; // Slightly narrower like Flappy Bird pipes
  const groundHeight = PHYSICS.GROUND_HEIGHT;
  const minGapFromTop = 60;  // Allow gaps closer to top
  const minGapFromBottom = 80; // Allow gaps closer to bottom
  
  // More random gap placement like Flappy Bird
  const totalPlayableHeight = canvasHeight - groundHeight - minGapFromTop - minGapFromBottom - gapSize;
  const gapStartY = minGapFromTop + Math.random() * totalPlayableHeight;
  const gapEndY = gapStartY + gapSize;
  
  const topTowerHeight = gapStartY;
  const bottomTowerY = gapEndY;
  const bottomTowerHeight = (canvasHeight - groundHeight) - bottomTowerY;
  
  // Reuse pooled object or create new one
  const tower = pooledTower || {
    id: 0,
    x: 0,
    width: 0,
    passed: false,
    top: { x: 0, y: 0, width: 0, height: 0, color: '' },
    bottom: { x: 0, y: 0, width: 0, height: 0, color: '' },
    gapY: 0,
    gapHeight: 0
  };
  
  // Update tower properties
  tower.id = Date.now() + Math.random();
  tower.x = canvasWidth;
  tower.width = towerWidth;
  tower.passed = false;
  tower.gapY = gapStartY;
  tower.gapHeight = gapSize;
  
  // Update top section
  tower.top.x = canvasWidth;
  tower.top.y = 0;
  tower.top.width = towerWidth;
  tower.top.height = Math.max(20, topTowerHeight);
  tower.top.color = GAME_COLORS.BLUE_RIBBON;
  
  // Update bottom section
  tower.bottom.x = canvasWidth;
  tower.bottom.y = bottomTowerY;
  tower.bottom.width = towerWidth;
  tower.bottom.height = Math.max(20, bottomTowerHeight);
  tower.bottom.color = GAME_COLORS.BLUE_RIBBON;
  
  return tower;
};

// Optimized simple towers (like Flappy Bird pipes)
export const drawKuwaitTower = (ctx, tower) => {
  [tower.top, tower.bottom].forEach((section, index) => {
    // Simple pipe body (bright blue primary color)
    ctx.fillStyle = GAME_COLORS.BLUE_RIBBON;
    ctx.fillRect(section.x, section.y, section.width, section.height);
    
    // Dark blue outline for contrast
    ctx.strokeStyle = GAME_COLORS.DOWNRIVER;
    ctx.lineWidth = 2;
    ctx.strokeRect(section.x, section.y, section.width, section.height);
    
    // Simple pipe cap
    const capHeight = 15;
    const capWidth = section.width + 6;
    const capX = section.x - 3;
    let capY;
    
    if (index === 0) {
      capY = section.y + section.height - capHeight;
    } else {
      capY = section.y;
    }
    
    // Cap body (white to make it prominent)
    ctx.fillStyle = GAME_COLORS.WHITE;
    ctx.fillRect(capX, capY, capWidth, capHeight);
    
    // Cap outline (dark blue)
    ctx.strokeStyle = GAME_COLORS.DOWNRIVER;
    ctx.lineWidth = 2;
    ctx.strokeRect(capX, capY, capWidth, capHeight);
  });
};

// Local storage utilities with Arabic support
export const storage = {
  getHighScore: () => {
    try {
      return parseInt(localStorage.getItem('kuwaitFlyerHighScore')) || 0;
    } catch {
      return 0;
    }
  },
  
  setHighScore: (score) => {
    try {
      localStorage.setItem('kuwaitFlyerHighScore', score.toString());
    } catch {
      console.warn('Could not save high score');
    }
  },
  
  // Kuwait-themed daily messages
  getDailyMessage: () => {
    const messages = [
      'مرحبا بك في الكويت! (Welcome to Kuwait!)',
      'طر عالياً مثل الصقر! (Fly high like a falcon!)',
      'تحدى أبراج الكويت! (Challenge the Kuwait Towers!)',
      'استكشف جمال الكويت! (Explore Kuwait\'s beauty!)',
      'لعبة ممتعة من قلب الخليج! (Fun game from the heart of the Gulf!)'
    ];
    
    const today = new Date().getDay();
    return messages[today % messages.length];
  }
}; 
