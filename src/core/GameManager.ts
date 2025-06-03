import { Application, Container } from 'pixi.js';
import { CONFIG } from '../config/GameConfig';
import { Player } from './Player';
import { ObstacleManager } from './Obstacle';
import { StarManager } from './Star';
import { Background } from '../ui/Background';
import { UI, GameState } from '../ui/UI';
import { SoundManager } from '../audio/SoundManager';

/**
 * Main game manager that orchestrates all game systems
 */
export class GameManager {
  private app: Application;
  private gameContainer: Container;
  private background!: Background;
  private player!: Player;
  private obstacleManager!: ObstacleManager;
  private starManager!: StarManager;
  private ui!: UI;
  private soundManager!: SoundManager;

  // Game state
  private currentState: GameState = GameState.MENU;
  private score: number = 0;
  private difficultyLevel: number = 0;
  private isInitialized: boolean = false;

  // Input handling
  private inputHandler: (event: any) => void;

  // Screen shake
  private shakeTimer: number = 0;
  private shakeDuration: number = 0;
  private shakeIntensity: number = 0;
  private originalGameContainerX: number = 0;
  private originalGameContainerY: number = 0;

  constructor() {
    console.log('🎯 GameManager constructor started');
    
    // Get actual viewport dimensions for true full-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    console.log(`🖥️ Creating PIXI Application for ${viewportWidth}x${viewportHeight}...`);
    
    // Initialize PIXI Application with viewport dimensions
    this.app = new Application({
      width: viewportWidth,
      height: viewportHeight,
      backgroundColor: CONFIG.colors.background,
      antialias: CONFIG.debug.antialias,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    console.log('✅ PIXI Application created');

    // Update config to use actual screen dimensions
    CONFIG.canvas.width = viewportWidth;
    CONFIG.canvas.height = viewportHeight;

    console.log('📦 Creating game container...');
    this.gameContainer = new Container();
    this.app.stage.addChild(this.gameContainer);
    
    // Store original position for shake reset
    this.originalGameContainerX = this.gameContainer.x;
    this.originalGameContainerY = this.gameContainer.y;
    
    console.log('✅ Game container created');

    // Bind input handler
    console.log('🎮 Binding input handler...');
    this.inputHandler = this.handleInput.bind(this);
    console.log('✅ Input handler bound');
    
    console.log('🚀 Starting initialization...');
    this.initialize();
  }

  /**
   * Initialize all game systems
   */
  private initialize(): void {
    console.log('🏗️ Initialize method started');
    
    // Add canvas to DOM
    console.log('🖼️ Adding canvas to DOM...');
    const gameDiv = document.getElementById('game');
    if (gameDiv) {
      gameDiv.appendChild(this.app.view as HTMLCanvasElement);
      console.log('✅ Canvas added to DOM');
    } else {
      console.error('❌ Game div not found in DOM!');
    }

    console.log('⚙️ Setting up systems...');
    this.setupSystems();
    console.log('✅ Systems setup complete');
    
    console.log('🎮 Setting up input...');
    this.setupInput();
    console.log('✅ Input setup complete');
    
    console.log('🔄 Starting game loop...');
    this.startGameLoop();
    console.log('✅ Game loop started');

    // Configure canvas for mobile
    console.log('📱 Configuring mobile...');
    this.configureMobile();
    console.log('✅ Mobile configuration complete');

    this.isInitialized = true;
    console.log('🎉 Game initialized successfully');
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500); // Wait for fade animation
    }
  }

  /**
   * Setup all game systems
   */
  private setupSystems(): void {
    // Initialize background
    this.background = new Background();
    this.gameContainer.addChild(this.background);

    // Initialize player
    this.player = new Player();
    this.gameContainer.addChild(this.player);

    // Initialize obstacle manager
    this.obstacleManager = new ObstacleManager();
    this.gameContainer.addChild(this.obstacleManager);

    // Initialize star manager
    this.starManager = new StarManager();
    this.gameContainer.addChild(this.starManager);
    
    // Connect obstacle manager to star manager
    this.obstacleManager.onObstacleSpawned = (x: number, gapY: number) => {
      this.starManager.onObstacleSpawned(x, gapY);
    };

    // Initialize sound manager
    this.soundManager = new SoundManager();
    
    // Connect sound callbacks
    this.player.onJump = () => {
      if (CONFIG.audio.sfx.jump) {
        this.soundManager.playJumpSound();
      }
    };

    // Initialize UI (add to main stage, not game container)
    this.ui = new UI();
    this.app.stage.addChild(this.ui);

    // Setup UI callbacks
    this.ui.onStartGame = () => this.startGame();
    this.ui.onRestartGame = () => this.restartGame();
    this.ui.onResumeGame = () => this.resumeGame();

    // Show initial menu animation
    this.ui.animateMenuEntry();
  }

  /**
   * Setup input handling
   */
  private setupInput(): void {
    // Mouse/touch input
    this.app.stage.interactive = true;
    this.app.stage.on('pointerdown', this.inputHandler);

    // Keyboard input
    document.addEventListener('keydown', this.inputHandler);
    document.addEventListener('keyup', this.inputHandler);

    // Prevent scrolling on mobile
    document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  /**
   * Configure mobile settings
   */
  private configureMobile(): void {
    // Disable context menu on long press
    (this.app.view as HTMLCanvasElement).addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Add mobile viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      this.resize();
    });

    this.resize();
  }

  /**
   * Handle input events
   */
  private handleInput(event: any): void {
    // Only process input during gameplay
    if (this.currentState !== GameState.PLAYING) {
      return;
    }

    // Handle jump input
    if (
      event.type === 'pointerdown' ||
      (event.type === 'keydown' && (event.code === 'Space' || event.code === 'ArrowUp'))
    ) {
      this.player.jump();
    }

    // Handle pause (ESC key)
    if (event.type === 'keydown' && event.code === 'Escape') {
      this.pauseGame();
    }
  }

  /**
   * Start the game loop
   */
  private startGameLoop(): void {
    this.app.ticker.add((delta) => {
      this.update(delta);
    });
  }

  /**
   * Main game update loop
   */
  private update(delta: number): void {
    if (this.currentState === GameState.PLAYING) {
      // Update game systems
      this.player.update(delta);
      this.obstacleManager.update(delta);
      this.starManager.update(delta);
      this.background.update(delta);

      // Check collisions
      if (this.checkCollisions()) {
        this.gameOver();
      }

      // Check scoring from obstacles
      const newScore = this.obstacleManager.checkScore(this.player.x);
      if (newScore > 0) {
        this.score += newScore;
        this.ui.updateScore(this.score);
        this.updateDifficulty();
      }
      
      // Check star collection
      const starsCollected = this.starManager.checkCollisions(this.player.x, this.player.y, CONFIG.player.size / 2);
      if (starsCollected > 0) {
        this.score += starsCollected; // Each star gives +1 point
        this.ui.updateScore(this.score);
        
        // Play star collection sound
        if (CONFIG.audio.sfx.score) {
          this.soundManager.playStarSound();
        }
        
        if (CONFIG.debug.logEvents) {
          console.log(`Collected ${starsCollected} star(s)! New score: ${this.score}`);
        }
      }
    }

    // Update screen shake effect
    this.updateScreenShake(delta);

    // Always update UI for animations
    this.ui.update(delta);

    // Update debug info if enabled
    if (CONFIG.debug.showFPS) {
      this.updateDebugInfo();
    }
  }

  /**
   * Check for collisions between player and obstacles
   */
  private checkCollisions(): boolean {
    // Check ground/ceiling collision with dynamic screen height
    const groundY = CONFIG.canvas.height - (CONFIG.background.layers.ground.height * CONFIG.canvas.height);
    
    if (this.player.y <= 0 || this.player.y >= groundY) {
      return true;
    }

    // Check obstacle collisions
    return this.obstacleManager.checkCollisions(this.player.x, this.player.y, CONFIG.player.size / 2);
  }

  /**
   * Update difficulty based on score
   */
  private updateDifficulty(): void {
    const thresholds = CONFIG.difficulty.scoreThresholds;
    let newLevel = 0;

    for (let i = 0; i < thresholds.length; i++) {
      if (this.score >= thresholds[i]) {
        newLevel = i + 1;
      }
    }

    if (newLevel > this.difficultyLevel) {
      this.difficultyLevel = newLevel;
      
      // Calculate new difficulty values
      const gapReduction = this.difficultyLevel * CONFIG.difficulty.gapReduction;
      const speedIncrease = this.difficultyLevel * CONFIG.difficulty.speedIncrease;

      const newGapSize = Math.max(
        CONFIG.obstacles.gapSize - gapReduction,
        CONFIG.difficulty.minGapSize
      );

      const newSpeed = Math.min(
        CONFIG.obstacles.speed + speedIncrease,
        CONFIG.difficulty.maxSpeed
      );

      // Apply difficulty changes
      this.obstacleManager.updateDifficulty(newGapSize, newSpeed);
      console.log(`Difficulty increased to level ${this.difficultyLevel}`);
    }
  }

  /**
   * Start a new game
   */
  public startGame(): void {
    this.resetGame();
    this.setState(GameState.PLAYING);
    console.log('Game started');
  }

  /**
   * Restart the game
   */
  public restartGame(): void {
    this.resetGame();
    this.setState(GameState.PLAYING);
    console.log('Game restarted');
  }

  /**
   * Pause the game
   */
  public pauseGame(): void {
    if (this.currentState === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
      console.log('Game paused');
    }
  }

  /**
   * Resume the game
   */
  public resumeGame(): void {
    if (this.currentState === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
      console.log('Game resumed');
    }
  }

  /**
   * End the game
   */
  private gameOver(): void {
    this.setState(GameState.GAME_OVER);
    
    // Play crash sound
    if (CONFIG.audio.sfx.collision) {
      this.soundManager.playCrashSound();
    }
    
    // Trigger screen shake on game over
    this.startScreenShake(600, 8); // 600ms duration, intensity 8
    
    console.log(`Game over! Final score: ${this.score}`);
  }

  /**
   * Start screen shake effect
   */
  private startScreenShake(duration: number, intensity: number): void {
    this.shakeDuration = duration;
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  /**
   * Update screen shake effect
   */
  private updateScreenShake(delta: number): void {
    if (this.shakeTimer <= 0) {
      // Reset to original position when shake is done
      this.gameContainer.x = this.originalGameContainerX;
      this.gameContainer.y = this.originalGameContainerY;
      return;
    }

    // Decrease shake timer
    this.shakeTimer -= delta * 16.67; // Convert delta to milliseconds (assuming 60fps)

    // Calculate shake progress (0 to 1)
    const progress = this.shakeTimer / this.shakeDuration;
    
    // Reduce intensity over time for a natural fade-out
    const currentIntensity = this.shakeIntensity * progress;

    // Generate random offset
    const offsetX = (Math.random() - 0.5) * currentIntensity * 2;
    const offsetY = (Math.random() - 0.5) * currentIntensity * 2;

    // Apply shake to game container only (not UI)
    this.gameContainer.x = this.originalGameContainerX + offsetX;
    this.gameContainer.y = this.originalGameContainerY + offsetY;
  }

  /**
   * Reset all game state
   */
  private resetGame(): void {
    this.score = 0;
    this.difficultyLevel = 0;
    
    // Reset screen shake
    this.shakeTimer = 0;
    this.gameContainer.x = this.originalGameContainerX;
    this.gameContainer.y = this.originalGameContainerY;
    
    this.player.reset();
    this.obstacleManager.reset();
    this.starManager.reset();
    this.background.reset();
    this.ui.updateScore(0);
  }

  /**
   * Set game state and update UI
   */
  private setState(newState: GameState): void {
    this.currentState = newState;
    this.ui.setState(newState);
  }

  /**
   * Handle window resize
   */
  private resize(): void {
    const canvas = this.app.view as HTMLCanvasElement;
    
    // Get new viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Resize the PIXI renderer to match new viewport
    this.app.renderer.resize(viewportWidth, viewportHeight);
    
    // Update config with new dimensions
    CONFIG.canvas.width = viewportWidth;
    CONFIG.canvas.height = viewportHeight;
    
    // Make canvas fill the entire viewport
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    
    // Reposition game elements to work with new dimensions
    this.repositionGameElements();
    
    console.log(`Canvas resized to: ${viewportWidth}x${viewportHeight} (true full-screen)`);
  }

  /**
   * Reposition game elements for new screen dimensions
   */
  private repositionGameElements(): void {
    if (!this.isInitialized) return;

    // Update player position to be proportional to new screen size
    const screenCenterX = CONFIG.canvas.width * 0.25; // 25% from left edge
    const screenCenterY = CONFIG.canvas.height * 0.5; // Center vertically
    
    if (this.player) {
      CONFIG.player.startX = screenCenterX;
      CONFIG.player.startY = screenCenterY;
      this.player.x = screenCenterX;
    }

    // Update obstacle spawn position
    CONFIG.obstacles.spawnX = CONFIG.canvas.width + 50;

    // Update ground height proportionally
    const groundHeight = Math.max(50, CONFIG.canvas.height * 0.05);
    CONFIG.background.layers.ground.height = groundHeight / CONFIG.canvas.height;

    // Refresh visuals with new dimensions
    if (this.background) this.background.refreshVisuals();
    if (this.ui) this.ui.refreshVisuals();
  }

  /**
   * Update debug information
   */
  private updateDebugInfo(): void {
    if (CONFIG.debug.showFPS) {
      const fps = Math.round(this.app.ticker.FPS);
      document.title = `Flappy Kuwait - FPS: ${fps}`;
    }
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.currentState;
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * Get PIXI application instance
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Check if game is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.inputHandler);
    document.removeEventListener('keyup', this.inputHandler);
    
    // Destroy sound manager
    if (this.soundManager) {
      this.soundManager.destroy();
    }
    
    // Destroy PIXI application
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    
    console.log('Game destroyed');
  }
} 