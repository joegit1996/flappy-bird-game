# Kuwait Flyer 🇰🇼 طائر الكويت

A mobile-first tap-to-fly endless runner game celebrating Kuwait's heritage and beauty. Navigate a majestic falcon through iconic Kuwait Towers in this Flappy Bird-inspired adventure!

## 🎮 Game Overview | نظرة عامة على اللعبة

**Kuwait Flyer** is a tap-to-fly game that pays homage to Kuwait's national bird (the falcon) and iconic architecture. Guide your falcon through the famous Kuwait Towers while collecting points and achieving high scores.

**طائر الكويت** هي لعبة اضغط للطيران تكرم الطائر الوطني للكويت (الصقر) والهندسة المعمارية الأيقونية. قد صقرك عبر أبراج الكويت الشهيرة أثناء جمع النقاط وتحقيق أعلى النتائج.

### 🎯 Objective | الهدف
- Fly the falcon as far as possible through Kuwait Towers
- Avoid crashing into the towers or ground
- Beat your high score and challenge friends
- Experience Kuwait's beauty through pixel art

### 🕹️ Controls | التحكم
- **Tap anywhere** on the screen to make the falcon fly upward
- **اضغط في أي مكان** على الشاشة لجعل الصقر يطير للأعلى
- Release to let gravity pull the falcon down
- That's it! Simple one-tap gameplay

## ✨ Features | المميزات

### 🇰🇼 Kuwait-Themed Elements
- **Falcon Character**: Kuwait's national bird with flag-colored wing patterns
- **Kuwait Towers**: Iconic green towers inspired by Kuwait's famous landmarks
- **Desert Landscape**: Beautiful sand dunes and Kuwait City skyline
- **Bilingual Interface**: Arabic and English text throughout
- **Cultural Sounds**: Kuwait-inspired audio effects

### 📱 Mobile Optimizations
- **Portrait orientation** optimized for mobile phones
- **Full-screen gameplay** that hides browser UI
- **Touch-friendly controls** covering the entire screen
- **Responsive design** for all modern mobile devices
- **Haptic feedback** for immersive gameplay (when supported)
- **No zoom issues** - prevents accidental pinching/zooming

### 🎨 Visual Features
- **Kuwait flag colors** throughout the design
- **Parallax scrolling** background with Kuwait City silhouette
- **Smooth animations** with 60fps gameplay
- **Screen shake effects** on collisions
- **Pixel art style** with clean, colorful graphics
- **Dynamic rotation** of the falcon based on movement

### 🎵 Audio Features
- **Falcon wing flap** sounds inspired by traditional falconry
- **Success tones** reminiscent of traditional oud music
- **Desert wind** crash effects
- **Game over sequence** with traditional Kuwait musical cues
- **Optional sound toggle** (tap to enable on mobile)

### 🏆 Gameplay Features
- **Progressive difficulty** - game speeds up as you progress
- **High score tracking** with local storage
- **Daily messages** in Arabic and English
- **New high score celebration** with special effects
- **Instant restart** for addictive gameplay

## 🚀 Setup & Installation | التثبيت والإعداد

### Prerequisites | المتطلبات
- Node.js (version 16 or higher)
- npm or yarn
- Modern web browser

### Quick Start | البداية السريعة

1. **Install dependencies | تثبيت التبعيات**:
```bash
npm install
```

2. **Start development server | تشغيل الخادم**:
```bash
npm run dev
```

3. **Open your browser | افتح المتصفح**:
   - Go to `http://localhost:3000`
   - Or use your computer's IP address for mobile testing

4. **For mobile testing | للاختبار على الهاتف**:
   - Connect your phone to the same WiFi network
   - Visit `http://[YOUR_IP]:3000` on your phone

### Building for Production | البناء للإنتاج

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🎮 How to Play | كيفية اللعب

### Getting Started | البداية
1. **Start the game** by tapping "ابدأ اللعبة - START GAME"
2. **Tap anywhere** on the screen to make the falcon fly up
3. **Navigate** through the gaps between Kuwait Towers
4. **Avoid** crashing into towers, ground, or ceiling
5. **Score points** by successfully passing through tower gaps

### Tips for High Scores | نصائح للحصول على نقاط عالية
- **Time your taps** - don't tap too rapidly
- **Find your rhythm** - consistent tapping works better than frantic button mashing
- **Stay calm** - the game gets faster as you progress
- **Practice** - each crash teaches you something new!

### Scoring System | نظام النقاط
- **+1 point** for each Kuwait Tower gap successfully navigated
- **High scores** are automatically saved locally
- **New records** are celebrated with special animations

## 🛠️ Technical Details | التفاصيل التقنية

### Built With | تم البناء باستخدام
- **React 18** - Modern functional components with hooks
- **Vite** - Fast development and building
- **Canvas API** - Smooth 60fps game rendering
- **Web Audio API** - Dynamic sound effect generation
- **CSS3** - Kuwait-themed styling and animations
- **Local Storage** - High score persistence

### Game Architecture | بنية اللعبة
- **GameCanvas.jsx** - Main game logic, physics, and rendering
- **GameUI.jsx** - Bilingual UI overlays and menus
- **gameUtils.js** - Game utilities, audio, and Kuwait-themed assets
- **App.jsx** - Game state management and mobile optimizations

### Performance Features | مميزات الأداء
- **60fps gameplay** using requestAnimationFrame
- **Optimized collision detection** for smooth performance
- **Memory management** with automatic cleanup
- **Mobile-first optimizations** for touch devices
- **Efficient canvas rendering** for all device types

## 🇰🇼 Kuwait Cultural Elements | العناصر الثقافية الكويتية

### Visual Heritage | التراث البصري
- **Kuwait Towers** - Iconic green water towers reimagined as game obstacles
- **Desert landscape** - Golden sand dunes reflecting Kuwait's geography
- **Falcon design** - Traditional brown coloring with Kuwait flag patterns
- **Islamic geometric patterns** - Subtle decorative elements on towers
- **Kuwait City skyline** - Background silhouettes of famous landmarks

### Audio Heritage | التراث الصوتي
- **Falconry sounds** - Inspired by Kuwait's traditional falcon hunting
- **Oud-inspired tones** - Success sounds reminiscent of traditional music
- **Desert ambiance** - Crash sounds like desert winds

### Linguistic Heritage | التراث اللغوي
- **Bilingual interface** - Arabic and English throughout
- **Daily messages** - Rotating inspirational messages in both languages
- **Cultural greetings** - Traditional Arabic phrases and their translations
- **Right-to-left text** - Proper Arabic text direction support

## 📱 Mobile Features | مميزات الهاتف المحمول

### Touch Controls | عناصر التحكم باللمس
- **Full-screen tap zone** - entire screen is interactive
- **Optimized for one-handed play** - portrait orientation
- **Prevents accidental zoom** and other mobile browser issues
- **Haptic feedback** on supported devices

### Platform Support | دعم المنصات
- **iOS Safari** - Full support with haptic feedback
- **Android Chrome** - Optimized performance
- **Mobile Firefox** - Full compatibility
- **Desktop browsers** - Space bar alternative for testing

### Progressive Web App Features
- **Add to home screen** capability
- **Full-screen mode** when launched from home screen
- **Offline-ready** - plays without internet after first load

## 🎯 Game Design Philosophy | فلسفة تصميم اللعبة

This game was created to:
- **Celebrate Kuwait's heritage** through interactive entertainment
- **Bridge cultures** with bilingual accessibility
- **Provide clean, family-friendly** gaming experience
- **Showcase traditional and modern Kuwait** in one experience
- **Offer addictive yet respectful** gameplay

## 🐛 Browser Compatibility | توافق المتصفحات

**Fully Supported | مدعوم بالكامل:**
- iOS Safari 12+
- Android Chrome 80+
- Desktop Chrome/Chromium
- Desktop Firefox 70+
- Desktop Safari 12+

**Required Features | المتطلبات:**
- Canvas API support
- Web Audio API (for sound)
- Touch events (for mobile)
- Local Storage
- CSS3 transforms and animations

## 🔧 Development | التطوير

### Adding New Features | إضافة مميزات جديدة
1. **Kuwait-themed obstacles** - Add palm trees, traditional dhows, etc.
2. **More bird options** - Houbara bustard, other regional birds
3. **Seasonal themes** - National Day, Liberation Day special versions
4. **Multiplayer modes** - Challenge friends and family
5. **Achievement system** - Cultural milestones and badges

### Customization | التخصيص
- **Colors** - Modify `KUWAIT_COLORS` in `gameUtils.js`
- **Physics** - Adjust `PHYSICS` constants for different difficulty
- **Sounds** - Replace audio generation in `sounds` object
- **Visuals** - Modify drawing functions for different art styles

## 📄 License | الترخيص

MIT License - Feel free to use this code for educational purposes or to create your own cultural gaming experiences!

## 🎉 Acknowledgments | شكر وتقدير

- **Kuwait's rich heritage** that inspired this game
- **Traditional falconry** and its cultural significance
- **Kuwait Towers** - an architectural marvel and symbol of modern Kuwait
- **The Arabic language** and its beautiful script
- **Mobile gaming community** for inspiration and feedback

## 🚀 Play Now! | العب الآن!

Ready to soar through Kuwait's skies? Start the development server and begin your falcon's journey through the iconic Kuwait Towers!

**مستعد للطيران عبر سماء الكويت؟ ابدأ الخادم واستمتع برحلة الصقر عبر أبراج الكويت الأيقونية!**

---

Made with ❤️ for Kuwait 🇰🇼 | مصنوع بحب للكويت الحبيبة 