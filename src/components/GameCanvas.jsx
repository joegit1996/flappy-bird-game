import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  sounds,
  vibrate,
  generateKuwaitTower,
  drawKuwaitTower,
  PHYSICS,
  GAME_COLORS,
  initAudioContext,
  getDifficultySettings
} from '../utils/gameUtils';

const GameCanvas = ({ onGameOver, onScoreUpdate, onDifficultyUpdate, isPaused }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameStateRef = useRef(null);
  const scoredTowers = useRef(new Set()); // Track which towers have been scored
  const currentScore = useRef(0); // Simple score tracking
  
  // Pre-cached constants for ultra performance
  const CACHED_CONSTANTS = useRef({
    FALCON_WIDTH: 34,
    FALCON_HEIGHT: 24,
    TOWER_WIDTH: 70,
    GROUND_Y_OFFSET: 60,
    FALCON_CENTER_X: 17,
    FALCON_CENTER_Y: 12,
    PI_180: Math.PI / 180,
    ROTATION_ANGLES: {
      UP_FAST: -25,
      UP_SLOW: -20,
      DOWN_MAX: 90,
      FLAP_ROTATION: -20
    }
  });

  // Object pooling for towers to prevent garbage collection
  const towerPool = useRef([]);
  const getPooledTower = useCallback(() => {
    return towerPool.current.pop() || { 
      id: 0, x: 0, width: 70, passed: false,
      top: { x: 0, y: 0, width: 70, height: 0 },
      bottom: { x: 0, y: 0, width: 70, height: 0 },
      gapY: 0, gapHeight: 0
    };
  }, []);
  
  const returnToPool = useCallback((tower) => {
    if (towerPool.current.length < 10) { // Max pool size
      towerPool.current.push(tower);
    }
  }, []);

  // Game state with Flappy Bird-style mechanics
  const [gameState, setGameState] = useState({
    falcon: { 
      x: 80, 
      y: 0, 
      width: 34, 
      height: 24, 
      velocityY: 0,
      rotation: 0
    },
    towers: [],
    score: 0,
    backgroundOffset: 0,
    screenShake: 0,
    lastTowerX: 0,
    towerSpacing: 320, // Flappy Bird-style spacing
    currentDifficulty: {
      towerSpeed: PHYSICS.BASE_TOWER_SPEED,
      gapSize: 160,
      towerSpacing: 320,
      gravity: PHYSICS.GRAVITY,
      difficultyLevel: 0,
      speedMultiplier: 1
    }
  });

  // Track if game has been initialized for this session
  const gameInitialized = useRef(false);
  const ctx = useRef(null); // Cache canvas context
  const lastRenderTime = useRef(0);
  const TARGET_FPS = 60;
  const FRAME_TIME = 1000 / TARGET_FPS;

  // Cache canvas dimensions
  const canvasDimensions = useRef({ width: 400, height: 600 });

  // Initialize/Reset game state only when game starts (not during gameplay)
  const initializeGame = useCallback(() => {
    const { width, height } = getCanvasDimensions();
    
    // Reset scoring system
    scoredTowers.current = new Set();
    currentScore.current = 0;
    
    setGameState(prev => ({
      ...prev,
      falcon: {
        ...prev.falcon,
        y: height / 2,
        velocityY: 0,
        rotation: 0
      },
      score: 0,
      towers: [],
      screenShake: 0,
      backgroundOffset: 0,
      currentDifficulty: {
        towerSpeed: PHYSICS.BASE_TOWER_SPEED,
        gapSize: 160,
        towerSpacing: 320,
        gravity: PHYSICS.GRAVITY,
        difficultyLevel: 0,
        speedMultiplier: 1
      }
    }));
  }, []);

  // Only initialize when switching from paused to playing
  useEffect(() => {
    if (!isPaused && !gameInitialized.current) {
      gameInitialized.current = true;
      initializeGame();
    } else if (isPaused) {
      gameInitialized.current = false; // Reset for next game
    }
  }, [isPaused, initializeGame]);

  // Keep ref in sync with state for game loop access
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Canvas dimensions with caching
  const getCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return canvasDimensions.current;
    
    // Only update if actually changed to prevent unnecessary calculations
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    if (canvasDimensions.current.width !== newWidth || canvasDimensions.current.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvasDimensions.current = { width: newWidth, height: newHeight };
    }
    
    return canvasDimensions.current;
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      getCanvasDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize audio context on first user interaction
  const handleFirstInteraction = useCallback(() => {
    initAudioContext();
  }, []);

  // Falcon flap function
  const flap = useCallback(() => {
    if (isPaused) return;
    
    setGameState(prev => {
      sounds.flap();
      vibrate(30);
      
      return {
        ...prev,
        falcon: {
          ...prev.falcon,
          velocityY: PHYSICS.FLAP_STRENGTH,
          rotation: -20 // Slight upward rotation when flapping
        }
      };
    });
  }, [isPaused]);

  // Touch and click handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouch = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleFirstInteraction();
      flap();
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleFirstInteraction();
      flap();
    };

    // Touch events
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    
    // Mouse events
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleClick);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchend', (e) => e.preventDefault());
      canvas.removeEventListener('touchmove', (e) => e.preventDefault());
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleClick);
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [flap, handleFirstInteraction]);

  // Ultra-optimized game update with minimal allocations
  const updateGame = useCallback((deltaTime, canvasWidth, canvasHeight) => {
    if (isPaused) return;

    // Use functional state update to minimize re-renders
    setGameState(prev => {
      const newState = { ...prev };
      const { FALCON_WIDTH, FALCON_HEIGHT, TOWER_WIDTH, GROUND_Y_OFFSET, ROTATION_ANGLES } = CACHED_CONSTANTS.current;
      
      // Calculate current difficulty based on score (less frequently)
      const difficulty = getDifficultySettings(currentScore.current);
      newState.currentDifficulty = difficulty;
      
      // Only notify difficulty changes every 5 points to reduce callbacks
      if (onDifficultyUpdate && currentScore.current % 5 === 0 && currentScore.current > 0) {
        onDifficultyUpdate(difficulty);
      }
      
      const groundY = canvasHeight - GROUND_Y_OFFSET;
      const falcon = newState.falcon;

      // Ultra-optimized physics with pre-calculated values
      falcon.velocityY += difficulty.gravity;
      falcon.velocityY = falcon.velocityY > 12 ? 12 : falcon.velocityY;
      falcon.y += falcon.velocityY;
      
      // Pre-calculated rotation logic
      if (falcon.velocityY < -2) {
        falcon.rotation = ROTATION_ANGLES.UP_FAST;
      } else if (falcon.velocityY > 3) {
        const calculated = falcon.velocityY * 4;
        falcon.rotation = calculated > ROTATION_ANGLES.DOWN_MAX ? ROTATION_ANGLES.DOWN_MAX : calculated;
      } else {
        falcon.rotation = falcon.velocityY * 4;
      }

      // Ultra-fast boundary checks with cached values
      if (falcon.y >= groundY - FALCON_HEIGHT || falcon.y <= 0) {
        sounds.crash();
        sounds.gameOver();
        vibrate([100, 50, 100]);
        newState.screenShake = 15;
        onGameOver(currentScore.current);
        return newState;
      }

      // Optimized background scroll
      newState.backgroundOffset = (newState.backgroundOffset + difficulty.towerSpeed) % 100;

      // Spawn towers with object pooling
      const lastTower = newState.towers[newState.towers.length - 1];
      const shouldSpawnTower = newState.towers.length === 0 || 
        (lastTower && canvasWidth - lastTower.x >= difficulty.towerSpacing);
      
      if (shouldSpawnTower) {
        const pooledTower = getPooledTower();
        const newTower = generateKuwaitTower(canvasWidth, canvasHeight, difficulty.gapSize, pooledTower);
        newState.towers.push(newTower);
        newState.lastTowerX = newTower.x;
      }

      // Ultra-optimized tower updates with minimal array operations
      const activeTowers = [];
      const towerSpeed = difficulty.towerSpeed;
      const falconRight = falcon.x + FALCON_WIDTH;
      const falconBottom = falcon.y + FALCON_HEIGHT;
      
      for (let i = 0; i < newState.towers.length; i++) {
        const tower = newState.towers[i];
        tower.x -= towerSpeed;
        
        // Batch update tower positions
        tower.top.x = tower.x;
        tower.bottom.x = tower.x;
        
        // Ultra-fast scoring check with pre-calculated falcon right edge
        if (falconRight > tower.x + TOWER_WIDTH && !scoredTowers.current.has(tower.id)) {
          scoredTowers.current.add(tower.id);
          currentScore.current++;
          newState.score = currentScore.current;
          onScoreUpdate(currentScore.current);
          sounds.pass();
          vibrate(50);
        }
        
        // Optimized collision detection with early exit
        if (falconRight > tower.x && falcon.x < tower.x + TOWER_WIDTH) {
          // Check Y collisions only if X collision detected
          if (falcon.y < tower.top.height || falconBottom > tower.bottom.y) {
            sounds.crash();
            sounds.gameOver();
            vibrate([100, 50, 100]);
            newState.screenShake = 15;
            onGameOver(currentScore.current);
            return newState;
          }
        }
        
        // Keep tower if still visible, otherwise return to pool
        if (tower.x > -TOWER_WIDTH) {
          activeTowers.push(tower);
        } else {
          returnToPool(tower);
        }
      }
      newState.towers = activeTowers;

      // Fast screen shake reduction
      if (newState.screenShake > 0) {
        newState.screenShake -= 2;
        if (newState.screenShake < 0) newState.screenShake = 0;
      }

      return newState;
    });
  }, [isPaused, onScoreUpdate, onGameOver, onDifficultyUpdate, getPooledTower, returnToPool]);

  // Ultra-optimized bird drawing function with cached constants
  const drawFalcon = useCallback((context, falcon) => {
    const { FALCON_CENTER_X, FALCON_CENTER_Y, PI_180 } = CACHED_CONSTANTS.current;
    
    context.save();
    
    // Translate to falcon center for rotation
    context.translate(falcon.x + FALCON_CENTER_X, falcon.y + FALCON_CENTER_Y);
    context.rotate(falcon.rotation * PI_180);
    
    // Main body (bright blue primary color)
    context.fillStyle = '#1356FB'; // BLUE_RIBBON - cache this color
    context.beginPath();
    context.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
    context.fill();
    
    // Body outline (dark blue)
    context.strokeStyle = '#0C1C4A'; // DOWNRIVER - cache this color
    context.lineWidth = 2;
    context.stroke();
    
    // Wing (peachy accent color)
    context.fillStyle = '#ECAF8D'; // TACAO - cache this color
    context.beginPath();
    context.ellipse(-4, -2, 6, 4, 0, 0, Math.PI * 2);
    context.fill();
    
    // Eye (prominent white)
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(4, -3, 4, 0, Math.PI * 2);
    context.fill();
    
    // Pupil (dark blue)
    context.fillStyle = '#0C1C4A';
    context.beginPath();
    context.arc(5, -2, 2, 0, Math.PI * 2);
    context.fill();
    
    // Beak (peachy accent)
    context.fillStyle = '#ECAF8D';
    context.beginPath();
    context.moveTo(15, 1);
    context.lineTo(23, 0);
    context.lineTo(15, -1);
    context.closePath();
    context.fill();
    
    context.restore();
  }, []);

  // Ultra-optimized render function with minimal state changes
  const render = useCallback((canvasWidth, canvasHeight, currentTime = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Cache context if not already cached
    if (!ctx.current) {
      ctx.current = canvas.getContext('2d');
      // Set rendering options once
      ctx.current.imageSmoothingEnabled = false;
      ctx.current.textBaseline = 'top';
    }
    
    const context = ctx.current;
    const currentState = gameStateRef.current;
    if (!currentState) return;

    const { TOWER_WIDTH, GROUND_Y_OFFSET } = CACHED_CONSTANTS.current;

    // Minimal screen shake with faster random generation
    let shakeX = 0, shakeY = 0;
    if (currentState.screenShake > 0) {
      const maxShake = currentState.screenShake > 5 ? 5 : currentState.screenShake;
      shakeX = (Math.random() - 0.5) * maxShake;
      shakeY = (Math.random() - 0.5) * maxShake;
    }
    
    context.save();
    context.translate(shakeX, shakeY);

    // Fast clear - use cached canvas dimensions
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Simplified background (solid color only)
    context.fillStyle = '#8CB4FC'; // MALIBU color
    context.fillRect(0, 0, canvasWidth, canvasHeight * 0.7);
     
    // Simple static clouds for performance - pre-calculated positions
    context.fillStyle = '#FFFFFF';
    const cloudY1 = canvasHeight * 0.15;
    const cloudY2 = canvasHeight * 0.25;
    const cloudX1 = canvasWidth * 0.2;
    const cloudX2 = canvasWidth * 0.6;
    context.fillRect(cloudX1, cloudY1, 30, 15);
    context.fillRect(cloudX2, cloudY2, 35, 18);

    // Ultra-optimized tower drawing with batched style changes
    context.fillStyle = '#1356FB'; // BLUE_RIBBON
    context.strokeStyle = '#0C1C4A'; // DOWNRIVER
    context.lineWidth = 2;
    
    const towers = currentState.towers;
    const towersLength = towers.length;
    
    // Batch draw all tower bodies first
    for (let i = 0; i < towersLength; i++) {
      const tower = towers[i];
      
      // Draw top tower
      context.fillRect(tower.top.x, tower.top.y, TOWER_WIDTH, tower.top.height);
      context.strokeRect(tower.top.x, tower.top.y, TOWER_WIDTH, tower.top.height);
      
      // Draw bottom tower  
      context.fillRect(tower.bottom.x, tower.bottom.y, TOWER_WIDTH, tower.bottom.height);
      context.strokeRect(tower.bottom.x, tower.bottom.y, TOWER_WIDTH, tower.bottom.height);
    }
    
    // Batch draw tower caps for visible towers only
    context.fillStyle = '#FFFFFF';
    for (let i = 0; i < towersLength; i++) {
      const tower = towers[i];
      
      // Only draw caps if tower is close to screen for performance
      if (tower.x > -100 && tower.x < canvasWidth + 50) {
        const capX = tower.top.x - 3;
        const capWidth = 76;
        const capHeight = 15;
        
        context.fillRect(capX, tower.top.height - capHeight, capWidth, capHeight);
        context.fillRect(capX, tower.bottom.y, capWidth, capHeight);
        context.strokeRect(capX, tower.top.height - capHeight, capWidth, capHeight);
        context.strokeRect(capX, tower.bottom.y, capWidth, capHeight);
      }
    }

    // Fast ground rendering
    const groundY = canvasHeight - GROUND_Y_OFFSET;
    context.fillStyle = '#ECAF8D'; // TACAO
    context.fillRect(0, groundY, canvasWidth, GROUND_Y_OFFSET);
    context.fillStyle = '#1356FB';
    context.fillRect(0, groundY, canvasWidth, 3);

    // Ultra-fast falcon drawing
    drawFalcon(context, currentState.falcon);

    context.restore();
  }, [drawFalcon]);

  // High-performance game loop
  const gameLoop = useCallback((currentTime) => {
    // Aggressive frame limiting for consistent performance
    if (currentTime - lastRenderTime.current < FRAME_TIME) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    lastRenderTime.current = currentTime;
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const { width, height } = getCanvasDimensions();
    
    // Update and render in single call to minimize overhead
    updateGame(deltaTime, width, height);
    render(width, height, currentTime);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, render]);

  // Start game loop
  useEffect(() => {
    const { width, height } = getCanvasDimensions();
    
    // Start the game loop
    const startLoop = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    startLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        touchAction: 'none',
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
};

export default GameCanvas; 