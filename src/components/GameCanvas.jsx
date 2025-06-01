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

  // Canvas dimensions
  const getCanvasDimensions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { width: 400, height: 600 };
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return { width: canvas.width, height: canvas.height };
  };

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

  // High-performance game update logic
  const updateGame = useCallback((deltaTime, canvasWidth, canvasHeight) => {
    if (isPaused) return;

    // Use functional state update to minimize re-renders
    setGameState(prev => {
      const newState = { ...prev };
      
      // Calculate current difficulty based on score (less frequently)
      const difficulty = getDifficultySettings(currentScore.current);
      newState.currentDifficulty = difficulty;
      
      // Only notify difficulty changes every 5 points
      if (onDifficultyUpdate && currentScore.current % 5 === 0 && currentScore.current > 0) {
        onDifficultyUpdate(difficulty);
      }
      
      const groundY = canvasHeight - 60; // Use constant instead of PHYSICS.GROUND_HEIGHT
      const falcon = newState.falcon;

      // Optimized physics with minimal object creation
      falcon.velocityY += difficulty.gravity;
      falcon.velocityY = falcon.velocityY > 12 ? 12 : falcon.velocityY; // Faster than Math.min
      falcon.y += falcon.velocityY;
      
      // Fast rotation calculation
      falcon.rotation = falcon.velocityY < -2 ? -25 : 
                       falcon.velocityY > 3 ? (falcon.velocityY * 4 > 90 ? 90 : falcon.velocityY * 4) : 
                       falcon.velocityY * 4;

      // Fast boundary checks
      if (falcon.y >= groundY - falcon.height || falcon.y <= 0) {
        sounds.crash();
        sounds.gameOver();
        vibrate([100, 50, 100]);
        newState.screenShake = 15;
        onGameOver(currentScore.current);
        return newState;
      }

      // Optimized background scroll
      newState.backgroundOffset = (newState.backgroundOffset + difficulty.towerSpeed) % 100;

      // Spawn towers with minimal calculations
      const lastTower = newState.towers[newState.towers.length - 1];
      const shouldSpawnTower = newState.towers.length === 0 || 
        (lastTower && canvasWidth - lastTower.x >= difficulty.towerSpacing);
      
      if (shouldSpawnTower) {
        const newTower = generateKuwaitTower(canvasWidth, canvasHeight, difficulty.gapSize);
        newState.towers.push(newTower);
        newState.lastTowerX = newTower.x;
      }

      // Ultra-fast tower updates and collision detection
      const activeTowers = [];
      for (let i = 0; i < newState.towers.length; i++) {
        const tower = newState.towers[i];
        tower.x -= difficulty.towerSpeed;
        tower.top.x = tower.x;
        tower.bottom.x = tower.x;
        
        // Fast scoring check
        if (falcon.x > tower.x + tower.width && !scoredTowers.current.has(tower.id)) {
          scoredTowers.current.add(tower.id);
          currentScore.current++;
          newState.score = currentScore.current;
          onScoreUpdate(currentScore.current);
          sounds.pass();
          vibrate(50);
        }
        
        // Ultra-fast collision detection using bitwise operations where possible
        const falconRight = falcon.x + 34; // Use constant instead of falcon.width
        const falconBottom = falcon.y + 24; // Use constant instead of falcon.height
        
        if (falconRight > tower.x && falcon.x < tower.x + 70) { // Use constant tower width
          // Check collisions
          if (falcon.y < tower.top.height || falconBottom > tower.bottom.y) {
            sounds.crash();
            sounds.gameOver();
            vibrate([100, 50, 100]);
            newState.screenShake = 15;
            onGameOver(currentScore.current);
            return newState;
          }
        }
        
        // Keep tower if still visible
        if (tower.x > -70) { // Use constant tower width
          activeTowers.push(tower);
        }
      }
      newState.towers = activeTowers;

      // Fast screen shake reduction
      newState.screenShake = newState.screenShake > 0 ? newState.screenShake - 2 : 0;

      return newState;
    });
  }, [isPaused, onScoreUpdate, onGameOver, onDifficultyUpdate]);

  // Optimized bird drawing function
  const drawFalcon = (context, falcon) => {
    context.save();
    
    // Translate to falcon center for rotation
    context.translate(falcon.x + 17, falcon.y + 12); // Use constants for center
    context.rotate((falcon.rotation * Math.PI) / 180);
    
    // Main body (bright blue primary color)
    context.fillStyle = '#1356FB'; // BLUE_RIBBON
    context.beginPath();
    context.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
    context.fill();
    
    // Body outline (dark blue)
    context.strokeStyle = '#0C1C4A'; // DOWNRIVER
    context.lineWidth = 2;
    context.stroke();
    
    // Wing (peachy accent color)
    context.fillStyle = '#ECAF8D'; // TACAO
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
  };

  // Ultra-optimized render function
  const render = useCallback((canvasWidth, canvasHeight, currentTime = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Cache context if not already cached
    if (!ctx.current) {
      ctx.current = canvas.getContext('2d');
      ctx.current.imageSmoothingEnabled = false;
    }
    
    const context = ctx.current;
    const currentState = gameStateRef.current;
    if (!currentState) return;

    // Minimal screen shake
    let shakeX = 0, shakeY = 0;
    if (currentState.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * (currentState.screenShake > 5 ? 5 : currentState.screenShake);
      shakeY = (Math.random() - 0.5) * (currentState.screenShake > 5 ? 5 : currentState.screenShake);
    }
    
    context.save();
    context.translate(shakeX, shakeY);

    // Fast clear
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Simplified background (solid color only)
    context.fillStyle = '#8CB4FC'; // MALIBU color
    context.fillRect(0, 0, canvasWidth, canvasHeight * 0.7);
     
    // Simple static clouds for performance
    context.fillStyle = '#FFFFFF';
    const y1 = canvasHeight * 0.15;
    const y2 = canvasHeight * 0.25;
    context.fillRect(canvasWidth * 0.2, y1, 30, 15);
    context.fillRect(canvasWidth * 0.6, y2, 35, 18);

    // Ultra-fast tower drawing with minimal details
    context.fillStyle = '#1356FB'; // BLUE_RIBBON
    context.strokeStyle = '#0C1C4A'; // DOWNRIVER
    context.lineWidth = 2;
    
    for (let i = 0; i < currentState.towers.length; i++) {
      const tower = currentState.towers[i];
      
      // Draw top tower
      context.fillRect(tower.top.x, tower.top.y, 70, tower.top.height);
      context.strokeRect(tower.top.x, tower.top.y, 70, tower.top.height);
      
      // Draw bottom tower  
      context.fillRect(tower.bottom.x, tower.bottom.y, 70, tower.bottom.height);
      context.strokeRect(tower.bottom.x, tower.bottom.y, 70, tower.bottom.height);
      
      // Simplified caps (only draw if close to screen for performance)
      if (tower.x > -100 && tower.x < canvasWidth + 50) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(tower.top.x - 3, tower.top.height - 15, 76, 15);
        context.fillRect(tower.bottom.x - 3, tower.bottom.y, 76, 15);
        context.strokeRect(tower.top.x - 3, tower.top.height - 15, 76, 15);
        context.strokeRect(tower.bottom.x - 3, tower.bottom.y, 76, 15);
        context.fillStyle = '#1356FB';
      }
    }

    // Fast ground
    const groundY = canvasHeight - 60;
    context.fillStyle = '#ECAF8D'; // TACAO
    context.fillRect(0, groundY, canvasWidth, 60);
    context.fillStyle = '#1356FB';
    context.fillRect(0, groundY, canvasWidth, 3);

    // Ultra-fast falcon drawing
    const falcon = currentState.falcon;
    drawFalcon(context, falcon);

    context.restore();
  }, []);

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