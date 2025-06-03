import { Graphics, Container } from 'pixi.js';
import { CONFIG } from '../config/GameConfig';

/**
 * Player class representing the bird character
 * Handles physics, input, rendering, and collision detection
 */
export class Player extends Container {
  private graphics: Graphics;
  private wingGraphics: Graphics;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private isAlive: boolean = true;
  private lastJumpTime: number = 0;
  private jumpCooldown: number = 100; // Minimum time between jumps (ms)
  
  // Wing flapping animation
  private flapTimer: number = 0;
  private flapSpeed: number = 0.15; // Slower speed for condor (they soar more)
  private wingAngle: number = 0;
  private maxWingAngle: number = 0.2; // Reduced wing rotation for condor
  
  // Sound callback
  public onJump: (() => void) | null = null;

  constructor() {
    super();
    this.graphics = new Graphics();
    this.wingGraphics = new Graphics();
    
    // Add wing graphics first so they appear behind the body
    this.addChild(this.wingGraphics);
    this.addChild(this.graphics);
    
    this.reset();
    this.drawBird();
  }

  /**
   * Reset player to initial state
   */
  public reset(): void {
    this.x = CONFIG.player.startX;
    this.y = CONFIG.player.startY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotation = 0;
    this.isAlive = true;
    this.alpha = 1;
    this.flapTimer = 0;
    this.wingAngle = 0;
  }

  /**
   * Draw the realistic bird using vector graphics
   */
  private drawBird(): void {
    this.graphics.clear();
    
    const size = CONFIG.player.size;
    const primaryColor = 0x2C2C2C; // Dark gray/black for condor body
    const secondaryColor = CONFIG.colors.secondary; // White for markings
    const headColor = 0xCC4444; // Reddish color for bald head
    const beakColor = 0x4A4A4A; // Dark gray beak

    // Condor body (smaller, narrower oval)
    this.graphics.beginFill(primaryColor);
    this.graphics.drawEllipse(0, 0, size * 0.9, size * 0.7);
    this.graphics.endFill();

    // Thick neck (narrower)
    this.graphics.beginFill(primaryColor);
    this.graphics.drawEllipse(size * 0.3, -size * 0.05, size * 0.25, size * 0.4);
    this.graphics.endFill();

    // Condor head (smaller, bald, reddish)
    this.graphics.beginFill(headColor);
    this.graphics.drawCircle(size * 0.6, -size * 0.2, size * 0.3);
    this.graphics.endFill();

    // Head skin texture (smaller patches)
    this.graphics.beginFill(0x992222);
    this.graphics.drawEllipse(size * 0.55, -size * 0.3, size * 0.12, size * 0.08);
    this.graphics.drawEllipse(size * 0.7, -size * 0.15, size * 0.08, size * 0.06);
    this.graphics.endFill();

    // White chest marking (smaller, distinctive condor feature)
    this.graphics.beginFill(secondaryColor);
    this.graphics.drawEllipse(size * 0.15, size * 0.15, size * 0.4, size * 0.25);
    this.graphics.endFill();

    // Large hooked beak (smaller but still prominent)
    this.graphics.beginFill(beakColor);
    this.graphics.moveTo(size * 0.85, -size * 0.25);
    this.graphics.lineTo(size * 1.1, -size * 0.15);
    this.graphics.lineTo(size * 1.05, -size * 0.08);
    this.graphics.lineTo(size * 0.85, -size * 0.12);
    this.graphics.closePath();
    this.graphics.endFill();

    // Beak hook (curved tip, smaller)
    this.graphics.beginFill(0x333333);
    this.graphics.moveTo(size * 1.05, -size * 0.08);
    this.graphics.lineTo(size * 1.1, -size * 0.04);
    this.graphics.lineTo(size * 1.0, 0);
    this.graphics.closePath();
    this.graphics.endFill();

    // Nostril (smaller)
    this.graphics.beginFill(0x000000);
    this.graphics.drawCircle(size * 0.95, -size * 0.18, size * 0.02);
    this.graphics.endFill();

    // Eye (small, dark - condors have small eyes relative to head)
    this.graphics.beginFill(0x000000);
    this.graphics.drawCircle(size * 0.65, -size * 0.25, size * 0.05);
    this.graphics.endFill();

    // Eye highlight (minimal)
    this.graphics.beginFill(0x444444);
    this.graphics.drawCircle(size * 0.67, -size * 0.27, size * 0.02);
    this.graphics.endFill();

    // Tail feathers (smaller, long, dark)
    this.graphics.beginFill(0x1A1A1A);
    this.graphics.drawEllipse(-size * 0.6, size * 0.15, size * 0.5, size * 0.2);
    this.graphics.endFill();

    // Tail feather details (smaller)
    this.graphics.beginFill(primaryColor);
    this.graphics.drawEllipse(-size * 0.7, size * 0.1, size * 0.35, size * 0.15);
    this.graphics.endFill();

    // Leg/talon hint (smaller, condors have powerful legs)
    this.graphics.beginFill(0x444444);
    this.graphics.drawEllipse(size * 0.05, size * 0.5, size * 0.08, size * 0.15);
    this.graphics.endFill();

    // Debug hitbox (if enabled)
    if (CONFIG.debug.showHitboxes) {
      this.graphics.lineStyle(2, 0xFF0000, 0.5);
      this.graphics.drawCircle(0, 0, size);
      this.graphics.lineStyle(0);
    }
  }

  /**
   * Draw animated condor wings
   */
  private drawWings(): void {
    this.wingGraphics.clear();
    
    const size = CONFIG.player.size;
    const wingColor = 0x2C2C2C; // Dark wing color
    const wingTipColor = 0x1A1A1A; // Even darker wing tips
    const wingMarkingColor = 0xF5F5F5; // White wing markings

    // Calculate wing position based on flapping animation
    const wingOffsetY = Math.sin(this.wingAngle) * size * 0.15; // Smaller movement
    const wingRotation = Math.sin(this.wingAngle) * this.maxWingAngle * 0.5; // Less rotation for large wings

    // Left wing (smaller condor wing but still proportionally large)
    this.wingGraphics.beginFill(wingColor);
    
    // Main wing shape (smaller but still condor-like)
    const wingPoints = [
      -size * 0.2, -size * 0.15 + wingOffsetY,
      -size * 1.2, -size * 0.4 + wingOffsetY,
      -size * 1.4, -size * 0.05 + wingOffsetY,
      -size * 1.2, size * 0.3 + wingOffsetY,
      -size * 0.8, size * 0.4 + wingOffsetY,
      -size * 0.2, size * 0.25 + wingOffsetY
    ];
    
    this.wingGraphics.drawPolygon(wingPoints);
    this.wingGraphics.endFill();

    // Wing tip feathers (smaller, separated finger-like feathers)
    this.wingGraphics.beginFill(wingTipColor);
    
    // Primary feathers (finger-like tips, smaller)
    for (let i = 0; i < 4; i++) {
      const featherX = -size * (1.0 + i * 0.08);
      const featherY = -size * 0.2 + i * size * 0.1 + wingOffsetY;
      this.wingGraphics.drawEllipse(featherX, featherY, size * 0.08, size * 0.25);
    }
    this.wingGraphics.endFill();

    // White wing patches (smaller, distinctive condor underwing marking)
    this.wingGraphics.beginFill(wingMarkingColor);
    this.wingGraphics.drawEllipse(-size * 0.7, size * 0.08 + wingOffsetY, size * 0.25, size * 0.12);
    this.wingGraphics.drawEllipse(-size * 0.9, size * 0.0 + wingOffsetY, size * 0.2, size * 0.1);
    this.wingGraphics.endFill();

    // Wing leading edge (smaller, darker)
    this.wingGraphics.beginFill(0x000000);
    this.wingGraphics.drawEllipse(-size * 0.5, -size * 0.25 + wingOffsetY, size * 0.5, size * 0.06);
    this.wingGraphics.endFill();

    // Secondary feather details (smaller)
    this.wingGraphics.beginFill(0x404040);
    this.wingGraphics.drawEllipse(-size * 0.6, size * 0.15 + wingOffsetY, size * 0.2, size * 0.06);
    this.wingGraphics.drawEllipse(-size * 0.8, size * 0.2 + wingOffsetY, size * 0.15, size * 0.05);
    this.wingGraphics.endFill();

    // Apply minimal wing rotation for condor (they soar more than flap)
    this.wingGraphics.rotation = wingRotation;
  }

  /**
   * Handle jump input
   */
  public jump(): void {
    if (!this.isAlive) return;

    const currentTime = Date.now();
    if (currentTime - this.lastJumpTime < this.jumpCooldown) return;

    this.velocityY = CONFIG.player.jumpForce;
    this.lastJumpTime = currentTime;

    // Increase flap speed temporarily on jump (but still condor-like)
    this.flapSpeed = 0.3;

    // Play jump sound
    if (this.onJump) {
      this.onJump();
    }

    if (CONFIG.debug.logEvents) {
      console.log('Player jumped');
    }
  }

  /**
   * Update player physics and position
   */
  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    // Update wing flapping animation
    this.updateWingFlapping(deltaTime);

    // Apply gravity
    this.velocityY += CONFIG.player.gravity * deltaTime;

    // Clamp velocities
    this.velocityY = Math.max(
      -CONFIG.player.maxVelocityY,
      Math.min(CONFIG.player.maxVelocityY, this.velocityY)
    );

    // Update position
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Update rotation based on velocity (if enabled)
    if (CONFIG.player.rotation.enabled) {
      const targetRotation = this.velocityY * CONFIG.player.rotation.factor;
      this.rotation = Math.max(
        -CONFIG.player.rotation.maxAngle,
        Math.min(CONFIG.player.rotation.maxAngle, targetRotation)
      );
    }

    // Check bounds
    this.checkBounds();
  }

  /**
   * Update wing flapping animation
   */
  private updateWingFlapping(deltaTime: number): void {
    // Update flap timer
    this.flapTimer += deltaTime * this.flapSpeed;
    
    // Calculate wing angle using sine wave for smooth animation
    this.wingAngle = this.flapTimer;
    
    // Gradually slow down flap speed when not jumping (condors soar)
    if (this.flapSpeed > 0.15) {
      this.flapSpeed = Math.max(0.15, this.flapSpeed - deltaTime * 0.3);
    }
    
    // Adjust flap speed based on velocity (minimal increase for condors)
    const velocityFactor = Math.abs(this.velocityY) * 0.005; // Reduced factor
    const currentFlapSpeed = this.flapSpeed + velocityFactor;
    
    // Redraw wings with new animation frame
    this.drawWings();
  }

  /**
   * Check if player is within screen bounds
   */
  private checkBounds(): void {
    const bounds = {
      top: CONFIG.player.size,
      bottom: CONFIG.canvas.height - CONFIG.player.size,
      left: CONFIG.player.size,
      right: CONFIG.canvas.width - CONFIG.player.size,
    };

    // Hit top or bottom
    if (this.y <= bounds.top || this.y >= bounds.bottom) {
      this.die();
    }

    // Constrain horizontal movement (if needed)
    if (this.x < bounds.left) {
      this.x = bounds.left;
    } else if (this.x > bounds.right) {
      this.x = bounds.right;
    }
  }

  /**
   * Handle player death
   */
  public die(): void {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.flapSpeed = 0.05; // Very slow wing movement when dead

    if (CONFIG.debug.logEvents) {
      console.log('Player died');
    }

    // Death animation (fade out)
    this.alpha = 0.7;
  }

  /**
   * Check collision with circular object
   */
  public checkCircularCollision(x: number, y: number, radius: number): boolean {
    if (!this.isAlive) return false;

    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (CONFIG.player.size + radius);
  }

  /**
   * Check collision with rectangular object
   */
  public checkRectangularCollision(
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean {
    if (!this.isAlive) return false;

    const playerRadius = CONFIG.player.size;
    
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(rectX, Math.min(this.x, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(this.y, rectY + rectHeight));
    
    // Calculate distance from circle center to closest point
    const dx = this.x - closestX;
    const dy = this.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < playerRadius;
  }

  /**
   * Get player bounds for collision detection (renamed to avoid conflicts)
   */
  public getCollisionBounds(): { x: number; y: number; width: number; height: number } {
    const size = CONFIG.player.size;
    return {
      x: this.x - size,
      y: this.y - size,
      width: size * 2,
      height: size * 2,
    };
  }

  /**
   * Check if player is alive
   */
  public getIsAlive(): boolean {
    return this.isAlive;
  }

  /**
   * Get player velocity for external use
   */
  public getVelocity(): { x: number; y: number } {
    return { x: this.velocityX, y: this.velocityY };
  }

  /**
   * Set player velocity (for special effects or testing)
   */
  public setVelocity(x: number, y: number): void {
    this.velocityX = x;
    this.velocityY = y;
  }

  /**
   * Refresh visual appearance (call after config changes)
   */
  public refreshVisuals(): void {
    this.drawBird();
    this.drawWings();
  }
} 