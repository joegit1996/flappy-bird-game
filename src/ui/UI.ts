import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CONFIG } from '../config/GameConfig';

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  GAME_OVER = 'game_over',
  PAUSED = 'paused'
}

/**
 * UI Manager class handling all user interface elements
 */
export class UI extends Container {
  private menuContainer!: Container;
  private gameContainer!: Container;
  private gameOverContainer!: Container;
  private pausedContainer!: Container;

  // Menu elements
  private titleText!: Text;
  private startButton!: Container;

  // Game elements
  private scoreText!: Text;
  private currentScore: number = 0;

  // Game Over elements
  private gameOverText!: Text;
  private finalScoreText!: Text;
  private restartButton!: Container;

  // Pause elements
  private pausedText!: Text;
  private resumeButton!: Container;

  // Callbacks
  public onStartGame: (() => void) | null = null;
  public onRestartGame: (() => void) | null = null;
  public onResumeGame: (() => void) | null = null;

  constructor() {
    super();
    this.createContainers();
    this.createMenuUI();
    this.createGameUI();
    this.createGameOverUI();
    this.createPausedUI();
    this.setState(GameState.MENU);
  }

  /**
   * Create UI containers for different states
   */
  private createContainers(): void {
    this.menuContainer = new Container();
    this.gameContainer = new Container();
    this.gameOverContainer = new Container();
    this.pausedContainer = new Container();

    this.addChild(this.menuContainer);
    this.addChild(this.gameContainer);
    this.addChild(this.gameOverContainer);
    this.addChild(this.pausedContainer);
  }

  /**
   * Create menu/landing page UI
   */
  private createMenuUI(): void {
    // Title
    const titleStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.title,
      fill: CONFIG.colors.primary,
      fontWeight: 'bold',
      align: 'center',
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
    });

    this.titleText = new Text('Flappy\nKuwait', titleStyle);
    this.titleText.anchor.set(0.5);
    this.titleText.x = CONFIG.canvas.width / 2;
    this.titleText.y = CONFIG.canvas.height * 0.3;

    // Start button
    this.startButton = this.createButton(
      'Start Game',
      CONFIG.canvas.width / 2,
      CONFIG.canvas.height * 0.6,
      () => this.onStartGame?.()
    );

    this.menuContainer.addChild(this.titleText);
    this.menuContainer.addChild(this.startButton);

    // Add subtitle
    const subtitleStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.small,
      fill: CONFIG.colors.text,
      align: 'center',
    });

    const subtitleText = new Text('Desert Adventure', subtitleStyle);
    subtitleText.anchor.set(0.5);
    subtitleText.x = CONFIG.canvas.width / 2;
    subtitleText.y = CONFIG.canvas.height * 0.45;

    this.menuContainer.addChild(subtitleText);
  }

  /**
   * Create in-game UI elements
   */
  private createGameUI(): void {
    // Score display
    const scoreStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.score,
      fill: CONFIG.colors.text,
      fontWeight: 'bold',
      align: 'center',
      stroke: CONFIG.colors.secondary,
      strokeThickness: 3,
    });

    this.scoreText = new Text('0', scoreStyle);
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = CONFIG.canvas.width / 2;
    this.scoreText.y = 50;

    this.gameContainer.addChild(this.scoreText);
  }

  /**
   * Create game over UI
   */
  private createGameOverUI(): void {
    // Create background overlay
    const overlay = new Graphics();
    overlay.beginFill(0x000000, 0.7); // Dark semi-transparent background
    overlay.drawRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    overlay.endFill();
    this.gameOverContainer.addChild(overlay);

    // Create popup background
    const popupWidth = CONFIG.canvas.width * 0.8;
    const popupHeight = CONFIG.canvas.height * 0.5;
    const popupX = (CONFIG.canvas.width - popupWidth) / 2;
    const popupY = (CONFIG.canvas.height - popupHeight) / 2;

    const popupBg = new Graphics();
    popupBg.beginFill(0xFFFFFF, 0.95); // White background with slight transparency
    popupBg.lineStyle(4, CONFIG.colors.primary, 1); // Blue border
    popupBg.drawRoundedRect(popupX, popupY, popupWidth, popupHeight, 20);
    popupBg.endFill();
    this.gameOverContainer.addChild(popupBg);

    // Game Over text
    const gameOverStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.title,
      fill: CONFIG.colors.primary,
      fontWeight: 'bold',
      align: 'center',
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
    });

    this.gameOverText = new Text('Game Over', gameOverStyle);
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.x = CONFIG.canvas.width / 2;
    this.gameOverText.y = CONFIG.canvas.height * 0.35;

    // Final score
    const finalScoreStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.button,
      fill: CONFIG.colors.text,
      align: 'center',
    });

    this.finalScoreText = new Text('Score: 0', finalScoreStyle);
    this.finalScoreText.anchor.set(0.5);
    this.finalScoreText.x = CONFIG.canvas.width / 2;
    this.finalScoreText.y = CONFIG.canvas.height * 0.45;

    // Restart button
    this.restartButton = this.createButton(
      'Play Again',
      CONFIG.canvas.width / 2,
      CONFIG.canvas.height * 0.6,
      () => this.onRestartGame?.()
    );

    this.gameOverContainer.addChild(this.gameOverText);
    this.gameOverContainer.addChild(this.finalScoreText);
    this.gameOverContainer.addChild(this.restartButton);
  }

  /**
   * Create paused UI
   */
  private createPausedUI(): void {
    // Paused text
    const pausedStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.title,
      fill: CONFIG.colors.primary,
      fontWeight: 'bold',
      align: 'center',
    });

    this.pausedText = new Text('Paused', pausedStyle);
    this.pausedText.anchor.set(0.5);
    this.pausedText.x = CONFIG.canvas.width / 2;
    this.pausedText.y = CONFIG.canvas.height * 0.4;

    // Resume button
    this.resumeButton = this.createButton(
      'Resume',
      CONFIG.canvas.width / 2,
      CONFIG.canvas.height * 0.6,
      () => this.onResumeGame?.()
    );

    this.pausedContainer.addChild(this.pausedText);
    this.pausedContainer.addChild(this.resumeButton);
  }

  /**
   * Create a styled button
   */
  private createButton(text: string, x: number, y: number, onClick: () => void): Container {
    const buttonContainer = new Container();
    const buttonGraphics = new Graphics();
    
    // Button background
    const width = CONFIG.ui.buttons.width;
    const height = CONFIG.ui.buttons.height;
    const radius = CONFIG.ui.buttons.cornerRadius;
    
    buttonGraphics.beginFill(CONFIG.ui.buttons.colors.background);
    buttonGraphics.lineStyle(2, CONFIG.ui.buttons.colors.border);
    buttonGraphics.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
    buttonGraphics.endFill();

    // Button text
    const textStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.button,
      fill: CONFIG.ui.buttons.colors.text,
      fontWeight: 'bold',
      align: 'center',
    });

    const buttonText = new Text(text, textStyle);
    buttonText.anchor.set(0.5);

    buttonContainer.addChild(buttonGraphics);
    buttonContainer.addChild(buttonText);
    buttonContainer.x = x;
    buttonContainer.y = y;

    // Make button interactive
    buttonContainer.interactive = true;
    buttonContainer.cursor = 'pointer';

    // Hover effects
    buttonContainer.on('pointerover', () => {
      buttonContainer.scale.set(CONFIG.ui.animations.buttonHoverScale);
      buttonGraphics.clear();
      buttonGraphics.beginFill(CONFIG.ui.buttons.colors.hover);
      buttonGraphics.lineStyle(2, CONFIG.ui.buttons.colors.border);
      buttonGraphics.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
      buttonGraphics.endFill();
    });

    buttonContainer.on('pointerout', () => {
      buttonContainer.scale.set(1);
      buttonGraphics.clear();
      buttonGraphics.beginFill(CONFIG.ui.buttons.colors.background);
      buttonGraphics.lineStyle(2, CONFIG.ui.buttons.colors.border);
      buttonGraphics.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
      buttonGraphics.endFill();
    });

    // Click handler
    buttonContainer.on('pointertap', onClick);

    return buttonContainer;
  }

  /**
   * Set UI state
   */
  public setState(state: GameState): void {
    // Hide all containers
    this.menuContainer.visible = false;
    this.gameContainer.visible = false;
    this.gameOverContainer.visible = false;
    this.pausedContainer.visible = false;

    // Show appropriate container
    switch (state) {
      case GameState.MENU:
        this.menuContainer.visible = true;
        break;
      case GameState.PLAYING:
        this.gameContainer.visible = true;
        break;
      case GameState.GAME_OVER:
        this.gameOverContainer.visible = true;
        this.finalScoreText.text = `Score: ${this.currentScore}`;
        break;
      case GameState.PAUSED:
        this.pausedContainer.visible = true;
        break;
    }
  }

  /**
   * Update score display
   */
  public updateScore(score: number): void {
    this.currentScore = score;
    this.scoreText.text = score.toString();
  }

  /**
   * Show instructions overlay
   */
  public showInstructions(): void {
    const instructionsStyle = new TextStyle({
      fontFamily: CONFIG.ui.font.family,
      fontSize: CONFIG.ui.font.size.small,
      fill: CONFIG.colors.text,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: CONFIG.canvas.width * 0.8,
    });

    const instructionsText = new Text(
      'Tap or click to make the bird fly!\nAvoid the obstacles and score points.',
      instructionsStyle
    );
    instructionsText.anchor.set(0.5);
    instructionsText.x = CONFIG.canvas.width / 2;
    instructionsText.y = CONFIG.canvas.height * 0.8;

    this.menuContainer.addChild(instructionsText);

    // Remove after delay
    setTimeout(() => {
      if (this.menuContainer.children.includes(instructionsText)) {
        this.menuContainer.removeChild(instructionsText);
      }
    }, 3000);
  }

  /**
   * Add animated entry effect for menu
   */
  public animateMenuEntry(): void {
    this.titleText.alpha = 0;
    this.startButton.alpha = 0;

    // Animate title
    this.animateIn(this.titleText, 0.5);
    
    // Animate button with delay
    setTimeout(() => {
      this.animateIn(this.startButton, 0.3);
    }, 300);
  }

  /**
   * Simple fade-in animation
   */
  private animateIn(object: any, duration: number): void {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      object.alpha = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * Update UI (for animations or dynamic elements)
   */
  public update(_deltaTime: number): void {
    // Future: Add pulsing animations, particle effects, etc.
  }

  /**
   * Refresh UI visuals (call after config changes)
   */
  public refreshVisuals(): void {
    // Store current state
    const currentState = this.menuContainer.visible ? GameState.MENU :
                        this.gameContainer.visible ? GameState.PLAYING :
                        this.gameOverContainer.visible ? GameState.GAME_OVER :
                        this.pausedContainer.visible ? GameState.PAUSED : GameState.MENU;
    
    // Store current score
    const currentScore = this.currentScore;
    
    // Recreate all UI elements with new config
    this.removeChildren();
    this.createContainers();
    this.createMenuUI();
    this.createGameUI();
    this.createGameOverUI();
    this.createPausedUI();
    
    // Restore state and score
    this.currentScore = currentScore;
    this.setState(currentState);
    
    if (currentState === GameState.GAME_OVER) {
      this.finalScoreText.text = `Score: ${this.currentScore}`;
    }
  }
} 