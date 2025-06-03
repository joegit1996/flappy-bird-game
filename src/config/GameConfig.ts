/**
 * Comprehensive Game Configuration
 * 
 * This file contains all configurable parameters for the Flappy Bird game.
 * Adjust these values to customize gameplay, physics, visuals, and difficulty.
 */

export interface GameConfig {
  // === DISPLAY SETTINGS ===
  canvas: {
    width: number;
    height: number;
    backgroundColor: number;
  };

  // === COLOR PALETTE ===
  colors: {
    primary: number;        // Main blue color
    secondary: number;      // White
    accent: number;         // Darker blue for accents
    sand: number;           // Desert sand color
    cactus: number;         // Cactus green
    text: number;           // Text color
    background: number;     // Sky blue background
  };

  // === PLAYER PHYSICS ===
  player: {
    size: number;           // Bird size (radius)
    gravity: number;        // Downward force per frame
    jumpForce: number;      // Upward force on tap/click
    maxVelocityY: number;   // Terminal velocity (falling)
    maxVelocityX: number;   // Maximum horizontal speed
    startX: number;         // Starting X position
    startY: number;         // Starting Y position
    rotation: {
      enabled: boolean;     // Whether bird rotates based on velocity
      factor: number;       // Rotation sensitivity
      maxAngle: number;     // Maximum rotation angle (radians)
    };
  };

  // === OBSTACLE SYSTEM ===
  obstacles: {
    width: number;                    // Pipe/column width
    gapSize: number;                  // Vertical gap between pipes
    horizontalSpacing: number;        // Distance between obstacle pairs
    speed: number;                    // Horizontal movement speed
    spawnX: number;                   // X position where obstacles spawn
    minHeight: number;                // Minimum pipe height
    maxHeight: number;                // Maximum pipe height
    color: number;                    // Obstacle color
  };

  // === DIFFICULTY PROGRESSION ===
  difficulty: {
    enabled: boolean;                 // Whether difficulty increases over time
    scoreThresholds: number[];        // Scores at which difficulty increases
    gapReduction: number;             // How much gap decreases per level
    speedIncrease: number;            // How much speed increases per level
    minGapSize: number;               // Smallest gap allowed
    maxSpeed: number;                 // Maximum obstacle speed
  };

  // === BACKGROUND ===
  background: {
    scrollSpeed: number;              // How fast background scrolls
    layers: {
      sky: {
        color: number;
        height: number;               // Percentage of screen height
      };
      dunes: {
        color: number;
        height: number;
        waveAmplitude: number;        // How wavy the dunes are
        waveFrequency: number;        // How many waves across screen
      };
      ground: {
        color: number;
        height: number;
      };
    };
    cacti: {
      count: number;                  // Number of cacti on screen
      minHeight: number;
      maxHeight: number;
      spacing: number;                // Average distance between cacti
      color: number;
    };
  };

  // === UI SETTINGS ===
  ui: {
    font: {
      family: string;
      size: {
        title: number;
        score: number;
        button: number;
        small: number;
      };
    };
    buttons: {
      width: number;
      height: number;
      cornerRadius: number;
      colors: {
        background: number;
        border: number;
        text: number;
        hover: number;
      };
    };
    animations: {
      fadeInDuration: number;         // Duration for UI fade-ins
      buttonHoverScale: number;       // Scale factor for button hover
    };
  };

  // === AUDIO SETTINGS ===
  audio: {
    enabled: boolean;
    sfx: {
      jump: boolean;
      score: boolean;
      collision: boolean;
      gameOver: boolean;
    };
  };

  // === PERFORMANCE ===
  performance: {
    targetFPS: number;
    enableStats: boolean;             // Show FPS counter in debug mode
    maxParticles: number;             // For future particle effects
  };

  // === DEBUG ===
  debug: {
    enabled: boolean;
    showHitboxes: boolean;
    showFPS: boolean;
    logEvents: boolean;
    antialias: boolean;
  };
}

// Default configuration values
export const DEFAULT_CONFIG: GameConfig = {
  canvas: {
    width: 400,
    height: 600,
    backgroundColor: 0xF5F5F5,
  },

  colors: {
    primary: 0x0062FF,      // Main blue
    secondary: 0xFFFFFF,    // White
    accent: 0x87CEEB,        // Sky blue
    sand: 0xDEB887,          // Desert sand
    cactus: 0x228B22,        // Forest green
    text: 0x333333,          // Dark gray
    background: 0x87CEEB,    // Sky blue background
  },

  player: {
    size: 15,
    gravity: 0.5,
    jumpForce: -8.5,
    maxVelocityY: 10,
    maxVelocityX: 2,
    startX: 100,
    startY: 300,
    rotation: {
      enabled: true,
      factor: 0.3,
      maxAngle: Math.PI / 3, // 60 degrees
    },
  },

  obstacles: {
    width: 60,
    gapSize: 150,
    horizontalSpacing: 250,
    speed: 2.5,
    spawnX: 450,
    minHeight: 100,
    maxHeight: 400,
    color: 0x0062FF,
  },

  difficulty: {
    enabled: true,
    scoreThresholds: [5, 10, 20, 35, 50],
    gapReduction: 10,
    speedIncrease: 0.3,
    minGapSize: 100,
    maxSpeed: 4.5,
  },

  background: {
    scrollSpeed: 1,
    layers: {
      sky: {
        color: 0xE6F3FF,
        height: 0.7,
      },
      dunes: {
        color: 0xF4E4BC,
        height: 0.25,
        waveAmplitude: 30,
        waveFrequency: 3,
      },
      ground: {
        color: 0xE6D7A3,
        height: 0.05,
      },
    },
    cacti: {
      count: 5,
      minHeight: 20,
      maxHeight: 50,
      spacing: 150,
      color: 0x228B22,
    },
  },

  ui: {
    font: {
      family: 'Arial, sans-serif',
      size: {
        title: 48,
        score: 36,
        button: 24,
        small: 18,
      },
    },
    buttons: {
      width: 200,
      height: 50,
      cornerRadius: 25,
      colors: {
        background: 0x0062FF,
        border: 0x004ACC,
        text: 0xFFFFFF,
        hover: 0x0052CC,
      },
    },
    animations: {
      fadeInDuration: 500,
      buttonHoverScale: 1.05,
    },
  },

  audio: {
    enabled: true,
    sfx: {
      jump: true,
      score: true,
      collision: true,
      gameOver: true,
    },
  },

  performance: {
    targetFPS: 60,
    enableStats: false,
    maxParticles: 100,
  },

  debug: {
    enabled: false,
    showHitboxes: false,
    showFPS: true,
    logEvents: true,
    antialias: true,
  },
};

/**
 * Current game configuration - modify this to change game behavior
 */
export const CONFIG: GameConfig = { ...DEFAULT_CONFIG };

/**
 * Utility function to override config values
 */
export function updateConfig(overrides: Partial<GameConfig>): void {
  Object.assign(CONFIG, overrides);
}

/**
 * Reset config to defaults
 */
export function resetConfig(): void {
  Object.assign(CONFIG, DEFAULT_CONFIG);
} 