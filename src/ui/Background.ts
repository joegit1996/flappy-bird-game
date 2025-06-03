import { Graphics, Container } from 'pixi.js';
import { CONFIG } from '../config/GameConfig';

/**
 * Cactus object for desert background
 */
class Cactus {
  public x: number;
  public y: number;
  public height: number;
  public width: number;

  constructor(x: number, y: number, height: number) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = height * 0.3; // Width proportional to height
  }
}

/**
 * Background class that renders the desert scene
 * Includes sky, sand dunes, ground, and cacti
 */
export class Background extends Container {
  private skyGraphics!: Graphics;
  private dunesGraphics!: Graphics;
  private groundGraphics!: Graphics;
  private cactiGraphics!: Graphics;
  private cacti: Cactus[] = [];
  private scrollOffset: number = 0;

  constructor() {
    super();
    this.initializeGraphics();
    this.generateCacti();
    this.drawBackground();
  }

  /**
   * Initialize graphics objects for each layer
   */
  private initializeGraphics(): void {
    this.skyGraphics = new Graphics();
    this.dunesGraphics = new Graphics();
    this.groundGraphics = new Graphics();
    this.cactiGraphics = new Graphics();

    // Add layers in order (back to front)
    this.addChild(this.skyGraphics);
    this.addChild(this.dunesGraphics);
    this.addChild(this.groundGraphics);
    this.addChild(this.cactiGraphics);
  }

  /**
   * Generate cactus positions
   */
  private generateCacti(): void {
    this.cacti = [];
    const config = CONFIG.background.cacti;
    const groundY = CONFIG.canvas.height * (1 - CONFIG.background.layers.ground.height);

    for (let i = 0; i < config.count * 2; i++) { // Generate extra for scrolling
      const x = (i * config.spacing) + Math.random() * (config.spacing * 0.5);
      const height = config.minHeight + Math.random() * (config.maxHeight - config.minHeight);
      const y = groundY - height;

      this.cacti.push(new Cactus(x, y, height));
    }
  }

  /**
   * Draw the complete background
   */
  private drawBackground(): void {
    this.drawSky();
    this.drawDunes();
    this.drawGround();
    this.drawCacti();
  }

  /**
   * Draw the sky layer with gradient
   */
  private drawSky(): void {
    this.skyGraphics.clear();
    
    const width = CONFIG.canvas.width;
    const height = CONFIG.canvas.height * CONFIG.background.layers.sky.height;
    const skyColor = CONFIG.background.layers.sky.color;

    // Simple sky background
    this.skyGraphics.beginFill(skyColor);
    this.skyGraphics.drawRect(0, 0, width, height);
    this.skyGraphics.endFill();

    // Add some cloud-like shapes for visual interest
    this.drawClouds(width, height);
  }

  /**
   * Draw simple cloud shapes
   */
  private drawClouds(skyWidth: number, skyHeight: number): void {
    const cloudColor = 0xFFFFFF;
    const cloudAlpha = 0.6;

    // Draw a few simple cloud shapes
    for (let i = 0; i < 3; i++) {
      const x = (skyWidth / 4) * (i + 1);
      const y = skyHeight * (0.2 + i * 0.15);
      const size = 20 + i * 10;

      this.skyGraphics.beginFill(cloudColor, cloudAlpha);
      // Draw cloud as overlapping circles
      this.skyGraphics.drawCircle(x, y, size);
      this.skyGraphics.drawCircle(x + size * 0.7, y, size * 0.8);
      this.skyGraphics.drawCircle(x - size * 0.7, y, size * 0.8);
      this.skyGraphics.drawCircle(x + size * 0.3, y - size * 0.5, size * 0.6);
      this.skyGraphics.drawCircle(x - size * 0.3, y - size * 0.5, size * 0.6);
      this.skyGraphics.endFill();
    }
  }

  /**
   * Draw the sand dunes with wavy pattern
   */
  private drawDunes(): void {
    this.dunesGraphics.clear();
    
    const width = CONFIG.canvas.width + 100; // Extra width for scrolling
    const dunesConfig = CONFIG.background.layers.dunes;
    const startY = CONFIG.canvas.height * CONFIG.background.layers.sky.height;
    const height = CONFIG.canvas.height * dunesConfig.height;

    this.dunesGraphics.beginFill(dunesConfig.color);
    
    // Create wavy dune pattern
    this.dunesGraphics.moveTo(-50, startY);
    
    for (let x = -50; x <= width; x += 10) {
      const waveOffset = Math.sin((x + this.scrollOffset * 0.1) / 50 * dunesConfig.waveFrequency) * dunesConfig.waveAmplitude;
      const y = startY + waveOffset;
      this.dunesGraphics.lineTo(x, y);
    }
    
    // Complete the shape
    this.dunesGraphics.lineTo(width, CONFIG.canvas.height);
    this.dunesGraphics.lineTo(-50, CONFIG.canvas.height);
    this.dunesGraphics.closePath();
    this.dunesGraphics.endFill();

    // Add secondary dune layer for depth
    this.drawSecondaryDunes(width, startY, height);
  }

  /**
   * Draw secondary dune layer for visual depth
   */
  private drawSecondaryDunes(width: number, startY: number, height: number): void {
    const secondaryColor = CONFIG.colors.sand;
    const alpha = 0.3;

    this.dunesGraphics.beginFill(secondaryColor, alpha);
    this.dunesGraphics.moveTo(-50, startY + height * 0.3);
    
    for (let x = -50; x <= width; x += 15) {
      const waveOffset = Math.sin((x + this.scrollOffset * 0.05) / 70 * 2) * 15;
      const y = startY + height * 0.3 + waveOffset;
      this.dunesGraphics.lineTo(x, y);
    }
    
    this.dunesGraphics.lineTo(width, CONFIG.canvas.height);
    this.dunesGraphics.lineTo(-50, CONFIG.canvas.height);
    this.dunesGraphics.closePath();
    this.dunesGraphics.endFill();
  }

  /**
   * Draw the ground layer
   */
  private drawGround(): void {
    this.groundGraphics.clear();
    
    const groundConfig = CONFIG.background.layers.ground;
    const startY = CONFIG.canvas.height * (1 - groundConfig.height);
    const width = CONFIG.canvas.width;
    const height = CONFIG.canvas.height * groundConfig.height;

    this.groundGraphics.beginFill(groundConfig.color);
    this.groundGraphics.drawRect(0, startY, width, height);
    this.groundGraphics.endFill();
  }

  /**
   * Draw all cacti
   */
  private drawCacti(): void {
    this.cactiGraphics.clear();
    
    const cactusColor = CONFIG.background.cacti.color;
    
    this.cacti.forEach(cactus => {
      const screenX = cactus.x - this.scrollOffset;
      
      // Only draw cacti that are visible on screen (with buffer)
      if (screenX > -50 && screenX < CONFIG.canvas.width + 50) {
        this.drawSingleCactus(screenX, cactus.y, cactus.width, cactus.height, cactusColor);
      }
    });
  }

  /**
   * Draw a single cactus
   */
  private drawSingleCactus(x: number, y: number, width: number, height: number, color: number): void {
    this.cactiGraphics.beginFill(color);
    
    // Main trunk
    this.cactiGraphics.drawRoundedRect(x - width / 2, y, width, height, width / 4);
    
    // Left arm (if cactus is tall enough)
    if (height > 30) {
      const armHeight = height * 0.4;
      const armY = y + height * 0.3;
      const armWidth = width * 0.7;
      
      // Horizontal part
      this.cactiGraphics.drawRoundedRect(x - width * 1.2, armY, armWidth, armWidth, armWidth / 4);
      // Vertical part
      this.cactiGraphics.drawRoundedRect(x - width * 1.2, armY - armHeight, armWidth, armHeight, armWidth / 4);
    }
    
    // Right arm (if cactus is very tall)
    if (height > 45) {
      const armHeight = height * 0.3;
      const armY = y + height * 0.5;
      const armWidth = width * 0.6;
      
      // Horizontal part
      this.cactiGraphics.drawRoundedRect(x + width / 2, armY, armWidth, armWidth, armWidth / 4);
      // Vertical part
      this.cactiGraphics.drawRoundedRect(x + width / 2, armY - armHeight, armWidth, armHeight, armWidth / 4);
    }
    
    this.cactiGraphics.endFill();
  }

  /**
   * Update background (handle scrolling)
   */
  public update(deltaTime: number): void {
    this.scrollOffset += CONFIG.background.scrollSpeed * deltaTime;
    
    // Reset scroll offset when it gets too large (for performance)
    if (this.scrollOffset > CONFIG.background.cacti.spacing * CONFIG.background.cacti.count) {
      this.scrollOffset = 0;
    }
    
    // Redraw moving elements
    this.drawDunes();
    this.drawCacti();
  }

  /**
   * Reset background
   */
  public reset(): void {
    this.scrollOffset = 0;
    this.drawBackground();
  }

  /**
   * Get scroll offset (for synchronized effects)
   */
  public getScrollOffset(): number {
    return this.scrollOffset;
  }

  /**
   * Set scroll speed (for dynamic effects)
   */
  public setScrollSpeed(speed: number): void {
    CONFIG.background.scrollSpeed = speed;
  }

  /**
   * Refresh background (call after config changes)
   */
  public refreshVisuals(): void {
    this.generateCacti();
    this.drawBackground();
  }
} 