import { Graphics, Container } from 'pixi.js';
import { CONFIG } from '../config/GameConfig';

/**
 * Individual obstacle (pipe/column) class
 */
export class Obstacle extends Container {
  private graphics: Graphics;
  private topHeight: number = 0;
  private bottomHeight: number = 0;
  private gapY: number;
  private scored: boolean = false;

  constructor(x: number, gapY?: number) {
    super();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    
    this.x = x;
    this.gapY = gapY ?? this.randomGapPosition();
    this.calculateHeights();
    this.drawObstacle();
  }

  /**
   * Calculate random gap position
   */
  private randomGapPosition(): number {
    const minY = CONFIG.obstacles.minHeight + CONFIG.obstacles.gapSize / 2;
    const maxY = CONFIG.canvas.height - CONFIG.obstacles.minHeight - CONFIG.obstacles.gapSize / 2;
    return minY + Math.random() * (maxY - minY);
  }

  /**
   * Calculate top and bottom pipe heights based on gap position
   */
  private calculateHeights(): void {
    const halfGap = CONFIG.obstacles.gapSize / 2;
    this.topHeight = this.gapY - halfGap;
    this.bottomHeight = CONFIG.canvas.height - (this.gapY + halfGap);
  }

  /**
   * Draw the obstacle pipes
   */
  private drawObstacle(): void {
    this.graphics.clear();
    
    const width = CONFIG.obstacles.width;
    const color = CONFIG.obstacles.color;
    const cornerRadius = 8;

    // Top pipe
    this.graphics.beginFill(color);
    this.graphics.drawRoundedRect(0, 0, width, this.topHeight, cornerRadius);
    this.graphics.endFill();

    // Top pipe cap (wider section at bottom)
    this.graphics.beginFill(color);
    this.graphics.drawRoundedRect(-5, this.topHeight - 20, width + 10, 20, cornerRadius);
    this.graphics.endFill();

    // Bottom pipe
    const bottomY = this.gapY + CONFIG.obstacles.gapSize / 2;
    this.graphics.beginFill(color);
    this.graphics.drawRoundedRect(0, bottomY, width, this.bottomHeight, cornerRadius);
    this.graphics.endFill();

    // Bottom pipe cap (wider section at top)
    this.graphics.beginFill(color);
    this.graphics.drawRoundedRect(-5, bottomY, width + 10, 20, cornerRadius);
    this.graphics.endFill();

    // Add some visual details (highlights)
    this.addVisualDetails(bottomY);

    // Debug hitboxes (if enabled)
    if (CONFIG.debug.showHitboxes) {
      this.graphics.lineStyle(2, 0xFF0000, 0.5);
      this.graphics.drawRect(0, 0, width, this.topHeight);
      this.graphics.drawRect(0, bottomY, width, this.bottomHeight);
      this.graphics.lineStyle(0);
    }
  }

  /**
   * Add visual details to make obstacles look more appealing
   */
  private addVisualDetails(bottomY: number): void {
    const capSize = 10; // Fixed cap size for visual appeal
    
    // Add top cap
    this.graphics.beginFill(CONFIG.obstacles.color, 0.9);
    this.graphics.drawRect(
      -capSize / 2,
      this.topHeight - capSize,
      CONFIG.obstacles.width + capSize,
      capSize
    );
    this.graphics.endFill();

    // Add bottom cap
    this.graphics.beginFill(CONFIG.obstacles.color, 0.9);
    this.graphics.drawRect(
      -capSize / 2,
      bottomY - capSize / 2,
      CONFIG.obstacles.width + capSize,
      capSize
    );
    this.graphics.endFill();
  }

  /**
   * Update obstacle position
   */
  public update(deltaTime: number): void {
    this.x -= CONFIG.obstacles.speed * deltaTime;
  }

  /**
   * Check collision with player
   */
  public checkCollision(playerX: number, playerY: number, playerRadius: number): boolean {
    const width = CONFIG.obstacles.width;
    
    // Check if player is horizontally within obstacle bounds
    if (playerX + playerRadius > this.x && playerX - playerRadius < this.x + width) {
      // Check collision with top pipe
      if (playerY - playerRadius < this.topHeight) {
        return true;
      }
      
      // Check collision with bottom pipe
      const bottomY = this.gapY + CONFIG.obstacles.gapSize / 2;
      if (playerY + playerRadius > bottomY) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if player has passed this obstacle (for scoring)
   */
  public checkScore(playerX: number): boolean {
    if (!this.scored && playerX > this.x + CONFIG.obstacles.width) {
      this.scored = true;
      return true;
    }
    return false;
  }

  /**
   * Check if obstacle is off-screen and should be removed
   */
  public shouldRemove(): boolean {
    return this.x + CONFIG.obstacles.width < -50; // Some buffer
  }

  /**
   * Get obstacle bounds for collision detection (renamed to avoid conflicts)
   */
  public getCollisionBounds(): { 
    top: { x: number; y: number; width: number; height: number },
    bottom: { x: number; y: number; width: number; height: number }
  } {
    const width = CONFIG.obstacles.width;
    const bottomY = this.gapY + CONFIG.obstacles.gapSize / 2;
    
    return {
      top: {
        x: this.x,
        y: 0,
        width: width,
        height: this.topHeight
      },
      bottom: {
        x: this.x,
        y: bottomY,
        width: width,
        height: this.bottomHeight
      }
    };
  }

  /**
   * Get gap center position
   */
  public getGapCenter(): { x: number; y: number } {
    return {
      x: this.x + CONFIG.obstacles.width / 2,
      y: this.gapY
    };
  }

  /**
   * Get gap Y position (for star spawning)
   */
  public getGapY(): number {
    return this.gapY;
  }

  /**
   * Update obstacle color (for difficulty progression effects)
   */
  public updateColor(color: number): void {
    CONFIG.obstacles.color = color;
    this.drawObstacle();
  }
}

/**
 * Obstacle manager class to handle multiple obstacles
 */
export class ObstacleManager extends Container {
  private obstacles: Obstacle[] = [];
  private spawnTimer: number = 0;
  private currentGapSize: number;
  private currentSpeed: number;
  
  // Callback for star spawning
  public onObstacleSpawned: ((x: number, gapY: number) => void) | null = null;

  constructor() {
    super();
    this.currentGapSize = CONFIG.obstacles.gapSize;
    this.currentSpeed = CONFIG.obstacles.speed;
  }

  /**
   * Reset obstacle manager
   */
  public reset(): void {
    // Remove all obstacles
    this.obstacles.forEach(obstacle => {
      this.removeChild(obstacle as any);
    });
    this.obstacles = [];
    this.spawnTimer = 0;
    this.currentGapSize = CONFIG.obstacles.gapSize;
    this.currentSpeed = CONFIG.obstacles.speed;
  }

  /**
   * Update obstacle system
   */
  public update(deltaTime: number): void {
    // Update spawn timer
    this.spawnTimer -= deltaTime;
    
    // Spawn new obstacle if needed
    if (this.spawnTimer <= 0) {
      this.spawnObstacle();
      this.spawnTimer = CONFIG.obstacles.horizontalSpacing / this.currentSpeed;
    }

    // Update existing obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime);

      // Remove obstacles that are off-screen
      if (obstacle.shouldRemove()) {
        this.removeChild(obstacle as any);
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Spawn a new obstacle
   */
  private spawnObstacle(): void {
    const obstacle = new Obstacle(CONFIG.obstacles.spawnX);
    this.addChild(obstacle as any);
    this.obstacles.push(obstacle);
    
    // Notify star manager about new obstacle
    if (this.onObstacleSpawned) {
      this.onObstacleSpawned(obstacle.x, obstacle.getGapY());
    }
  }

  /**
   * Check collisions with player
   */
  public checkCollisions(playerX: number, playerY: number, playerRadius: number): boolean {
    return this.obstacles.some(obstacle => 
      obstacle.checkCollision(playerX, playerY, playerRadius)
    );
  }

  /**
   * Check for score updates
   */
  public checkScore(playerX: number): number {
    return this.obstacles.reduce((score, obstacle) => {
      return score + (obstacle.checkScore(playerX) ? 1 : 0);
    }, 0);
  }

  /**
   * Update difficulty settings
   */
  public updateDifficulty(gapSize: number, speed: number): void {
    this.currentGapSize = Math.max(gapSize, CONFIG.difficulty.minGapSize);
    this.currentSpeed = Math.min(speed, CONFIG.difficulty.maxSpeed);
    
    // Update config for new obstacles
    CONFIG.obstacles.gapSize = this.currentGapSize;
    CONFIG.obstacles.speed = this.currentSpeed;

    if (CONFIG.debug.logEvents) {
      console.log(`Difficulty updated: gap=${this.currentGapSize}, speed=${this.currentSpeed}`);
    }
  }

  /**
   * Get all obstacles (for advanced collision detection or effects)
   */
  public getObstacles(): Obstacle[] {
    return [...this.obstacles]; // Return copy to prevent external modification
  }
} 