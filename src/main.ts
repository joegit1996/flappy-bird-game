console.log('🚀 main.ts loaded');

import { GameManager } from './core/GameManager';
import { CONFIG } from './config/GameConfig';

console.log('✅ Imports loaded successfully');

// Global game manager instance
let game: GameManager | null = null;

/**
 * Initialize the game
 */
function initGame(): void {
  console.log('🎮 Starting game initialization...');
  try {
    // Create game instance
    console.log('📦 Creating GameManager...');
    game = new GameManager();
    
    console.log('🌐 Exposing to global scope...');
    // Expose to global scope for debugging
    (window as any).game = game;
    
    // Log successful initialization
    console.log('✅ Flappy Kuwait initialized successfully!');
    console.log('Debug mode:', CONFIG.debug.enabled);
    
  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    showError('Failed to load the game. Please refresh the page.');
  }
}

/**
 * Show error message to user
 */
function showError(message: string): void {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4444;
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    text-align: center;
    z-index: 1000;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
}

/**
 * Handle debug URL parameters
 */
function handleDebugParams(): void {
  const params = new URLSearchParams(window.location.search);
  
  // Check for debug mode
  if (params.get('debug') === 'true') {
    CONFIG.debug.enabled = true;
    CONFIG.debug.showHitboxes = true;
    CONFIG.debug.showFPS = true;
    CONFIG.debug.logEvents = true;
    console.log('Debug mode enabled via URL parameter');
  }
  
  // Check for specific debug features
  if (params.get('hitboxes') === 'true') {
    CONFIG.debug.showHitboxes = true;
  }
  
  if (params.get('fps') === 'true') {
    CONFIG.debug.showFPS = true;
  }
}

/**
 * Entry point
 */
function main(): void {
  // Handle debug parameters
  handleDebugParams();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (game) {
    if (document.hidden) {
      // Pause game when tab becomes hidden
      if (game.getState() === 'playing') {
        game.pauseGame();
      }
    }
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
  }
});

// Start the application
main();

// Log configuration info
console.log('🎮 Flappy Kuwait Configuration:');
console.log('Canvas size:', CONFIG.canvas.width, 'x', CONFIG.canvas.height);
console.log('Difficulty progression:', CONFIG.difficulty.enabled ? 'Enabled' : 'Disabled');
console.log('Debug mode:', CONFIG.debug.enabled ? 'Enabled' : 'Disabled');

// Export for external configuration if needed
export { CONFIG }; 