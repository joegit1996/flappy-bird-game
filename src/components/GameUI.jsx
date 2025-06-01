import React from 'react';
import { storage, GAME_COLORS } from '../utils/gameUtils';

const GameUI = ({ 
  gameState, 
  score, 
  highScore, 
  onStartGame, 
  onRestartGame, 
  isNewHighScore,
  currentDifficulty = { difficultyLevel: 0, speedMultiplier: 1 } // Add difficulty prop
}) => {
  const dailyMessage = storage.getDailyMessage();

  // Kuwait-themed styles
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    fontSize: 'clamp(16px, 4vw, 24px)',
    fontFamily: 'Amiri, Arial, sans-serif',
    textAlign: 'center',
    padding: '20px',
    zIndex: 1000,
    touchAction: 'manipulation'
  };

  const scoreDisplayStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    right: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    color: 'white',
    fontSize: 'clamp(20px, 5vw, 32px)',
    fontFamily: 'Amiri, Arial, sans-serif',
    fontWeight: 'bold',
    textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
    zIndex: 999,
    pointerEvents: 'none'
  };

  const titleStyle = {
    fontSize: 'clamp(36px, 9vw, 56px)',
    fontWeight: 'bold',
    marginBottom: '20px',
    textShadow: '4px 4px 8px rgba(0,0,0,0.9)',
    background: 'linear-gradient(45deg, #007A33, #FFD700, #CE1126)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    direction: 'ltr'
  };

  const subtitleStyle = {
    fontSize: 'clamp(18px, 4vw, 24px)',
    marginBottom: '10px',
    color: '#FFD700',
    fontWeight: 'normal',
    direction: 'rtl' // Right-to-left for Arabic text
  };

  const instructionStyle = {
    fontSize: 'clamp(14px, 3.5vw, 18px)',
    marginBottom: '30px',
    opacity: 0.9,
    lineHeight: 1.5,
    maxWidth: '90%'
  };

  const dailyMessageStyle = {
    backgroundColor: 'rgba(0, 122, 51, 0.9)',
    padding: '15px',
    borderRadius: '12px',
    margin: '20px 0',
    border: '3px solid #FFD700',
    fontSize: 'clamp(12px, 3vw, 16px)',
    lineHeight: 1.4,
    boxShadow: '0 4px 8px rgba(0, 122, 51, 0.3)',
    direction: 'rtl'
  };

  const scoreStyle = {
    fontSize: 'clamp(28px, 7vw, 42px)',
    margin: '20px 0',
    fontWeight: 'bold',
    color: '#FFD700'
  };

  const newHighScoreStyle = {
    ...scoreStyle,
    color: '#FFD700',
    textShadow: '0 0 20px #FFD700, 0 0 40px #FFD700',
    animation: 'kuwaitPulse 1.5s infinite'
  };

  const flagEmojiStyle = {
    fontSize: 'clamp(24px, 6vw, 32px)',
    margin: '0 10px',
    display: 'inline-block',
    animation: 'wave 2s ease-in-out infinite'
  };

  // Home screen
  if (gameState === 'home') {
    return (
      <div style={overlayStyle}>
        <div style={{
          ...titleStyle,
          background: `linear-gradient(45deg, ${GAME_COLORS.BLUE_RIBBON}, ${GAME_COLORS.WHITE}, ${GAME_COLORS.MALIBU})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎮 FLAPPY GAME 🎮
        </div>

        <div style={{
          ...instructionStyle,
          color: GAME_COLORS.MALIBU,
          fontSize: 'clamp(18px, 4.5vw, 24px)',
          marginBottom: '40px'
        }}>
          <span style={{ color: GAME_COLORS.WHITE }}>High Score:</span> {highScore}
        </div>

        <button 
          className="game-button"
          onClick={onStartGame}
          style={{ 
            fontSize: 'clamp(20px, 5vw, 26px)',
            padding: 'clamp(15px, 4vw, 20px) clamp(35px, 8vw, 45px)',
            backgroundColor: GAME_COLORS.BLUE_RIBBON,
            borderColor: GAME_COLORS.DOWNRIVER,
            color: GAME_COLORS.WHITE
          }}
        >
          🎮 START GAME 🎮
        </button>
      </div>
    );
  }

  // Game over screen
  if (gameState === 'gameOver') {
    return (
      <div style={overlayStyle}>
        <div style={{ 
          fontSize: 'clamp(32px, 8vw, 48px)', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: GAME_COLORS.BLUE_RIBBON,
          textShadow: '3px 3px 6px rgba(0,0,0,0.9)'
        }}>
          GAME OVER
        </div>
        
        {isNewHighScore && (
          <div style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: GAME_COLORS.WHITE,
            marginBottom: '15px',
            animation: 'gamePulse 1s infinite'
          }}>
            🎉 NEW HIGH SCORE! 🎉
          </div>
        )}
        
        <div style={isNewHighScore ? { 
          ...scoreStyle, 
          color: GAME_COLORS.WHITE,
          textShadow: `0 0 20px ${GAME_COLORS.WHITE}, 0 0 40px ${GAME_COLORS.WHITE}`,
          animation: 'gamePulse 1.5s infinite'
        } : { 
          ...scoreStyle, 
          color: GAME_COLORS.WHITE 
        }}>
          Score: {score}
        </div>

        <div style={{
          ...instructionStyle,
          color: GAME_COLORS.MALIBU
        }}>
          <span style={{ color: GAME_COLORS.WHITE }}>High Score:</span> {highScore}
        </div>

        <button 
          className="game-button"
          onClick={onRestartGame}
          style={{ 
            fontSize: 'clamp(18px, 4.5vw, 24px)',
            padding: 'clamp(15px, 4vw, 20px) clamp(30px, 8vw, 40px)',
            marginTop: '25px',
            backgroundColor: GAME_COLORS.BLUE_RIBBON,
            borderColor: GAME_COLORS.DOWNRIVER,
            color: GAME_COLORS.WHITE
          }}
        >
          🎮 PLAY AGAIN 🎮
        </button>

        <div style={{ 
          ...instructionStyle, 
          marginTop: '25px', 
          fontSize: 'clamp(12px, 3vw, 16px)',
          opacity: 0.8,
          color: GAME_COLORS.MALIBU
        }}>
          Tap anywhere to fly!
        </div>
      </div>
    );
  }

  // In-game score display
  if (gameState === 'playing') {
    return (
      <div style={scoreDisplayStyle}>
        <div>
          <span style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', color: GAME_COLORS.TACAO }}>Score</span><br />
          <span style={{ color: GAME_COLORS.WHITE }}>{score}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(24px, 6vw, 32px)' }}>🎮</div>
          {currentDifficulty.difficultyLevel > 0 && (
            <div style={{ 
              fontSize: 'clamp(8px, 2vw, 10px)', 
              color: GAME_COLORS.WHITE,
              marginTop: '2px',
              fontWeight: 'bold'
            }}>
              LVL {currentDifficulty.difficultyLevel}<br />
              {(currentDifficulty.speedMultiplier * 100).toFixed(0)}% SPEED
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', color: GAME_COLORS.TACAO }}>Best</span><br />
          <span style={{ color: GAME_COLORS.WHITE }}>{highScore}</span>
        </div>
      </div>
    );
  }

  return null;
};

// Add CSS animations for the new color theme
const style = document.createElement('style');
style.textContent = `
  @keyframes gamePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); opacity: 0.9; }
    100% { transform: scale(1); }
  }
  
  .game-button {
    font-family: 'Amiri', 'Arial', sans-serif;
    font-weight: bold;
    border: 3px solid;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    touch-action: manipulation;
    min-height: 55px;
    min-width: 140px;
    box-shadow: 0 4px 8px rgba(19, 86, 251, 0.3);
  }
  
  .game-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(19, 86, 251, 0.4);
    filter: brightness(1.1);
  }
  
  .game-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(19, 86, 251, 0.2);
    filter: brightness(0.9);
  }
`;
document.head.appendChild(style);

export default GameUI; 