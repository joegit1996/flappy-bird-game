# Flappy Kuwait - Desert Adventure 🏜️

A high-performance, mobile-friendly Flappy Bird-style game built with **PixiJS** and **TypeScript**. Features a beautiful desert theme with white and blue color palette, configurable physics, progressive difficulty, and smooth 60 FPS gameplay.

## 🎮 Features

- **High Performance**: Built with PixiJS for WebGL-accelerated rendering
- **Mobile Friendly**: Responsive design with touch controls
- **Beautiful Desert Theme**: Animated sand dunes, cacti, and layered backgrounds
- **Fully Configurable**: Easily adjust physics, difficulty, visuals, and spacing
- **Progressive Difficulty**: Game gets harder as your score increases
- **Smooth Animation**: Consistent 60 FPS performance
- **Modern UI**: Clean, animated interface with hover effects
- **Debug Mode**: Built-in debugging tools for development

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 🎯 Controls

- **Desktop**: Click mouse or press Space/Enter to jump
- **Mobile**: Tap screen to jump
- **Pause**: Press Escape key
- **Debug Mode**: Add `?debug=true` to URL

## ⚙️ Configuration Guide

All game settings can be easily modified in `src/config/GameConfig.ts`. Here's how to customize the most important aspects:

### 🐦 Player Physics

```typescript
player: {
  size: 15,              // Bird size (radius in pixels)
  gravity: 0.5,          // How fast the bird falls
  jumpForce: -8.5,       // How strong the jump is (negative = upward)
  maxVelocityY: 10,      // Terminal falling speed
  startX: 100,           // Starting X position
  startY: 300,           // Starting Y position
}
```

**Tips:**
- Increase `gravity` to make the game harder
- Increase `jumpForce` (more negative) for higher jumps
- Adjust `size` to change collision detection

### 🚧 Obstacle Settings

```typescript
obstacles: {
  width: 60,                    // Pipe width in pixels
  gapSize: 150,                 // Vertical gap between pipes (IMPORTANT!)
  horizontalSpacing: 250,       // Distance between obstacle pairs
  speed: 2.5,                   // How fast obstacles move left
  color: 0x0062FF,              // Obstacle color (hex)
}
```

**Tips:**
- **Decrease `gapSize`** to make the game much harder
- **Increase `horizontalSpacing`** to give players more time between obstacles
- **Increase `speed`** for a faster-paced game

### 📈 Difficulty Progression

```typescript
difficulty: {
  enabled: true,                         // Enable/disable difficulty scaling
  scoreThresholds: [5, 10, 20, 35, 50], // Scores at which difficulty increases
  gapReduction: 10,                      // How much gap shrinks per level
  speedIncrease: 0.3,                    // How much speed increases per level
  minGapSize: 100,                       // Smallest gap allowed
  maxSpeed: 4.5,                         // Maximum obstacle speed
}
```

**Tips:**
- Set `enabled: false` to disable difficulty progression
- Modify `scoreThresholds` to change when difficulty increases
- Adjust `gapReduction` and `speedIncrease` to control difficulty curve

### 🎨 Visual Customization

```typescript
colors: {
  primary: 0x0062FF,      // Main blue color
  secondary: 0xFFFFFF,    // White
  accent: 0x004ACC,       // Darker blue
  sand: 0xF4E4BC,         // Desert sand color
  cactus: 0x228B22,       // Cactus green
}
```

### 🏜️ Background Settings

```typescript
background: {
  scrollSpeed: 1,                    // Background scroll speed
  layers: {
    dunes: {
      waveAmplitude: 30,             // How wavy the dunes are
      waveFrequency: 3,              // Number of waves across screen
    }
  },
  cacti: {
    count: 5,                        // Number of cacti visible
    spacing: 150,                    // Distance between cacti
  }
}
```

## 🛠️ Development Features

### Debug Mode

Add URL parameters to enable debugging features:

- `?debug=true` - Enable debug mode
- `?hitboxes=true` - Show collision boxes
- `?fps=true` - Show FPS counter

Example: `http://localhost:3000?debug=true&hitboxes=true`

### Project Structure

```
src/
├── config/
│   └── GameConfig.ts      # All game configuration
├── core/
│   ├── GameManager.ts     # Main game loop and orchestration
│   ├── Player.ts          # Bird character logic
│   └── Obstacle.ts        # Pipe/obstacle system
├── ui/
│   ├── Background.ts      # Desert background rendering
│   └── UI.ts              # User interface components
└── main.ts               # Entry point
```

### Making Changes

1. **Physics**: Edit `CONFIG.player` in `GameConfig.ts`
2. **Obstacles**: Edit `CONFIG.obstacles` in `GameConfig.ts`
3. **Difficulty**: Edit `CONFIG.difficulty` in `GameConfig.ts`
4. **Colors**: Edit `CONFIG.colors` in `GameConfig.ts`
5. **Background**: Edit `CONFIG.background` in `GameConfig.ts`

After making changes, the game will automatically reload in development mode.

## 📱 Mobile Optimization

The game is fully optimized for mobile devices:

- **Touch Controls**: Tap anywhere to jump
- **Responsive Design**: Automatically scales to fit screen
- **Performance**: Optimized for mobile GPU performance
- **Prevents Scrolling**: Disables unwanted touch behaviors

## 🎯 Game Balance Tips

For the best gameplay experience:

1. **Easy Mode**: `gapSize: 180`, `gravity: 0.4`, `jumpForce: -7`
2. **Normal Mode**: `gapSize: 150`, `gravity: 0.5`, `jumpForce: -8.5` (default)
3. **Hard Mode**: `gapSize: 120`, `gravity: 0.6`, `jumpForce: -9`
4. **Expert Mode**: `gapSize: 100`, `gravity: 0.7`, `jumpForce: -10`

## 🚀 Performance

The game is optimized for high performance:

- **WebGL Rendering**: Hardware-accelerated graphics via PixiJS
- **Object Pooling**: Efficient memory management for obstacles
- **Optimized Animations**: Smooth 60 FPS on most devices
- **Minimal Draw Calls**: Efficient rendering pipeline

## 🔧 Troubleshooting

### Game Won't Start
- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try refreshing the page

### Performance Issues
- Close other browser tabs
- Disable browser extensions
- Check if hardware acceleration is enabled in browser settings

### Mobile Issues
- Ensure device orientation is locked
- Try refreshing the page
- Check if device supports WebGL

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Some ideas for improvements:

- **Sound Effects**: Add audio feedback for jumps, scoring, and collisions
- **Particle Effects**: Add visual flair with particle systems
- **Themes**: Create different visual themes (night mode, winter, etc.)
- **Power-ups**: Add temporary abilities or score multipliers
- **Leaderboard**: Local storage high score system
- **Achievements**: Unlock system for reaching milestones

## 🎮 Game Design Credits

Inspired by the classic Flappy Bird game with a modern desert twist. Built with love using PixiJS and TypeScript for a smooth, professional gaming experience.

---

**Happy Gaming! 🎮✨** 