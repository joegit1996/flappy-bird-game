import { Graphics, Container, Text, TextStyle } from 'pixi.js';
import { CONFIG } from '../config/GameConfig';

/**
 * Collectible star that looks like the 4sale icon
 * Gives +1 score when collected
 */
export class Star extends Container {
  private graphics: Graphics;
  private text!: Text;
  private collected: boolean = false;
  private bobOffset: number = 0; // For floating animation

  constructor(x: number, y: number) {
    super();
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    
    this.x = x;
    this.y = y;
    
    this.createStar();
    this.createText();
  }

  /**
   * Create the 4sale icon background
   */
  private createStar(): void {
    this.graphics.clear();
    
    const size = 40; // Size of the star icon
    const cornerRadius = 8;
    
    // Blue rounded rectangle background (like 4sale icon)
    this.graphics.beginFill(0x0062FF, 1); // Same blue as game theme
    this.graphics.drawRoundedRect(-size/2, -size/2, size, size, cornerRadius);
    this.graphics.endFill();
    
    // Add white border for visibility
    this.graphics.lineStyle(2, 0xFFFFFF, 1);
    this.graphics.drawRoundedRect(-size/2, -size/2, size, size, cornerRadius);
    this.graphics.lineStyle(0);
    
    // Debug hitbox (if enabled)
    if (CONFIG.debug.showHitboxes) {
      this.graphics.lineStyle(2, 0x00FF00, 0.5);
      this.graphics.drawCircle(0, 0, size/2);
      this.graphics.lineStyle(0);
    }
  }

  /**
   * Create the "4SALE" text
   */
  private createText(): void {
    const textStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 10,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
      align: 'center',
    });

    this.text = new Text('4SALE', textStyle);
    this.text.anchor.set(0.5);
    this.text.x = 0;
    this.text.y = 0;
    
    this.addChild(this.text);
  }

  /**
   * Update star (floating animation)
   */
  public update(deltaTime: number): void {
    if (this.collected) return;

    // Floating animation
    this.bobOffset += deltaTime * 0.1;
    this.y += Math.sin(this.bobOffset) * 0.3;

    // Gentle rotation
    this.rotation += deltaTime * 0.02;

    // Move left with obstacles
    this.x -= CONFIG.obstacles.speed * deltaTime;
  }

  /**
   * Check collision with player
   */
  public checkCollision(playerX: number, playerY: number, playerRadius: number): boolean {
    if (this.collected) return false;

    const dx = this.x - playerX;
    const dy = this.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const starRadius = 20; // Half of star size
    return distance < (playerRadius + starRadius);
  }

  /**
   * Collect the star
   */
  public collect(): void {
    if (this.collected) return;
    
    this.collected = true;
    
    // Collection animation - scale up and fade out
    const startTime = Date.now();
    const animationDuration = 300; // 300ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / animationDuration;
      
      if (progress >= 1) {
        this.visible = false;
        return;
      }
      
      // Scale up
      const scale = 1 + progress * 0.5;
      this.scale.set(scale);
      
      // Fade out
      this.alpha = 1 - progress;
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    if (CONFIG.debug.logEvents) {
      console.log('Star collected!');
    }
  }

  /**
   * Check if star should be removed
   */
  public shouldRemove(): boolean {
    return this.x < -100 || this.collected;
  }

  /**
   * Check if star has been collected
   */
  public isCollected(): boolean {
    return this.collected;
  }
}

/**
 * Manager for handling multiple stars
 */
export class StarManager extends Container {
  private stars: Star[] = [];
  private obstacleCount: number = 0;

  constructor() {
    super();
  }

  /**
   * Reset star manager
   */
  public reset(): void {
    // Remove all stars
    this.stars.forEach(star => {
      this.removeChild(star as any);
    });
    this.stars = [];
    this.obstacleCount = 0;
  }

  /**
   * Notify when an obstacle is spawned
   */
  public onObstacleSpawned(obstacleX: number, gapY: number): void {
    this.obstacleCount++;
    
    // Spawn star every 5 obstacles
    if (this.obstacleCount % 5 === 0) {
      this.spawnStar(obstacleX, gapY);
    }
  }

  /**
   * Spawn a new star at the obstacle gap
   */
  private spawnStar(obstacleX: number, gapY: number): void {
    // Position star in the center of the gap, slightly ahead of the obstacle
    const starX = obstacleX + CONFIG.obstacles.width / 2;
    const starY = gapY; // Center of the gap
    
    const star = new Star(starX, starY);
    this.addChild(star as any);
    this.stars.push(star);
    
    if (CONFIG.debug.logEvents) {
      console.log(`Star spawned at (${starX}, ${starY})`);
    }
  }

  /**
   * Update all stars
   */
  public update(deltaTime: number): void {
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      star.update(deltaTime);

      // Remove stars that are off-screen or collected
      if (star.shouldRemove()) {
        this.removeChild(star as any);
        this.stars.splice(i, 1);
      }
    }
  }

  /**
   * Check collisions with player and return number of stars collected
   */
  public checkCollisions(playerX: number, playerY: number, playerRadius: number): number {
    let starsCollected = 0;
    
    this.stars.forEach(star => {
      if (!star.isCollected() && star.checkCollision(playerX, playerY, playerRadius)) {
        star.collect();
        starsCollected++;
      }
    });
    
    return starsCollected;
  }

  /**
   * Get all stars (for debugging)
   */
  public getStars(): Star[] {
    return [...this.stars];
  }
} 