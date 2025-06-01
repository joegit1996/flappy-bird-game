import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import { storage } from './utils/gameUtils';

function App() {
  // Game state management
  const [gameState, setGameState] = useState('home'); // 'home', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState({ difficultyLevel: 0, speedMultiplier: 1 });

  // Load high score on app start
  useEffect(() => {
    const savedHighScore = storage.getHighScore();
    setHighScore(savedHighScore);
  }, []);

  // Handle game start
  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setIsNewHighScore(false);
  }, []);

  // Handle score updates during gameplay
  const handleScoreUpdate = useCallback((newScore) => {
    setScore(newScore);
  }, []);

  // Handle difficulty updates during gameplay
  const handleDifficultyUpdate = useCallback((difficulty) => {
    setCurrentDifficulty(difficulty);
  }, []);

  // Handle game over
  const handleGameOver = useCallback((finalScore) => {
    setGameState('gameOver');
    
    // Check for new high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewHighScore(true);
      storage.setHighScore(finalScore);
    } else {
      setIsNewHighScore(false);
    }
  }, [highScore]);

  // Handle restart game
  const handleRestartGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setIsNewHighScore(false);
  }, []);

  // Prevent context menu and optimize for mobile
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Prevent scroll/zoom gestures
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Prevent page refresh during gameplay
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState === 'playing') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleKeyDown = (e) => {
      // Space bar to flap (for desktop testing)
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
      }
      
      // Prevent F5 refresh during gameplay
      if (e.key === 'F5' && gameState === 'playing') {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  // Hide mobile browser UI for full immersion
  useEffect(() => {
    const hideAddressBar = () => {
      if (window.navigator.standalone !== true) {
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 100);
      }
    };

    hideAddressBar();
    window.addEventListener('orientationchange', hideAddressBar);
    window.addEventListener('resize', hideAddressBar);

    return () => {
      window.removeEventListener('orientationchange', hideAddressBar);
      window.removeEventListener('resize', hideAddressBar);
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative',
      touchAction: 'none',
      background: 'linear-gradient(180deg, #87CEEB 0%, #F4A460 100%)'
    }}>
      {/* Game Canvas - Always rendered for smooth transitions */}
      <GameCanvas
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
        onDifficultyUpdate={handleDifficultyUpdate}
        isPaused={gameState !== 'playing'}
      />

      {/* Game UI Overlay */}
      <GameUI
        gameState={gameState}
        score={score}
        highScore={highScore}
        onStartGame={handleStartGame}
        onRestartGame={handleRestartGame}
        isNewHighScore={isNewHighScore}
        currentDifficulty={currentDifficulty}
      />
    </div>
  );
}

export default App; 