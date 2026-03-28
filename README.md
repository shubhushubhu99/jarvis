# JARVIS AI Voice Assistant 🤖

A premium, futuristic AI voice assistant built with vanilla HTML, CSS, and JavaScript. Features real-time voice recognition, text-to-speech responses, and a stunning hacker-style UI inspired by Iron Man's JARVIS.

## ✨ Features

### Core Functionality
- **Voice Recognition**: Real-time speech-to-text using Web Speech API
- **Text-to-Speech**: Natural voice responses from JARVIS
- **Wake Word Detection**: Say "Hey Jarvis" to activate
- **Command History**: Full history of all commands
- **Terminal-Style UI**: Authentic hacker aesthetic
- **Status Indicators**: Visual feedback for listening, processing, and speaking

### Voice Commands

**Time & Date**
- "What's the time?"
- "Tell me the date"
- "What time is it?"

**Web Searches**
- "Search for [topic]"
- "Google [query]"

**Open Websites**
- "Open Google"
- "Open YouTube"
- "Open LinkedIn"
- "Open GitHub"
- "Open Twitter"
- "Open Facebook"
- "Open Reddit"
- "Open StackOverflow"
- "Open MDN"
- "Open Wikipedia"

**Conversation**
- "Hello"
- "How are you?"
- "What is your name?"
- "Tell me a joke"
- Ask any general question

**System Commands**
- "Clear history"
- "Goodbye"

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| **M** | Toggle voice activation |
| **H** | Toggle history panel |
| **C** | Clear command history |
| **Esc** | Close history panel |

## 🎨 Design Features

- **Neon Color Scheme**: Electric blue, green, purple glow effects
- **Glassmorphism**: Semi-transparent frosted glass effects
- **Animated Waveform**: Visual feedback when listening
- **Pulsing Circle**: Animated pulse effect during recognition
- **Animated Particles**: Floating particles in background
- **Glowing Buttons**: Interactive buttons with neon glow
- **Gradient Animations**: Smooth color transitions
- **Terminal Text**: Monospace font with authentic terminal styling
- **Typing Animation**: Smooth text appearance
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Getting Started

### Requirements
- Modern browser with Web Speech API support:
  - Chrome/Edge ✅
  - Firefox ✅
  - Safari (limited support) ⚠️
  - Opera ✅

### Installation
1. Save all three files (`index.html`, `style.css`, `script.js`) in the same directory
2. Open `index.html` in your web browser
3. Click the microphone button or press **M** to start

### First Use
1. Allow microphone access when browser prompts
2. Say "Hey Jarvis" to activate
3. Speak a command (e.g., "What's the time?")
4. JARVIS will respond with both text and voice

## 📁 File Structure

```
jarvis/
├── index.html       # Main HTML structure
├── style.css        # Premium styling & animations
├── script.js        # Core functionality & commands
└── README.md        # This file
```

## 🔧 How It Works

### JavaScript Architecture

**Modular Functions:**
- `initializeSpeechAPI()` - Sets up Web Speech API
- `handleCommand()` - Routes commands to handlers
- `handleTime()`, `handleDate()`, `handleSearch()` - Specific command handlers
- `respond()` - Text-to-speech responses
- `displayCommand()`, `updateHistoryPanel()` - UI updates
- `startListening()`, `stopListening()` - Voice control

**State Management:**
```javascript
state = {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    commandHistory: [],
    wakeWordDetected: false
}
```

## 🎯 User Experience

### Listening State
- Microphone button glows blue
- Waveform animation plays
- Pulse circle emanates outward
- Status shows "Listening..."

### Processing State
- Loader animation appears
- Status shows "Processing..."
- Command logged to terminal

### Speaking State
- Status light changes to pink/magenta
- Response displays in response box
- Text-to-speech plays
- Command added to history

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best experience |
| Edge | ✅ Full | Excellent support |
| Firefox | ✅ Full | Works great |
| Safari | ⚠️ Partial | Webkit prefix needed |
| Opera | ✅ Full | Great support |

## 💡 Tips & Tricks

1. **Wake Word Variations**: Say "Hey Jarvis", "Hey robot", or just "Jarvis"
2. **Natural Language**: Use natural speech patterns; the AI understands context
3. **Multiple Commands**: Try combining actions: "Search for CSS animations on Google"
4. **History Panel**: Click "History" button or press **H** to review past commands
5. **Mobile Optimized**: Fully responsive UI works on smartphones and tablets
6. **Sound Feedback**: Browser makes subtle sounds when recognizing speech

## 🔒 Privacy & Security

- All processing happens locally in your browser
- No data is sent to external servers (except open website actions)
- No tracking or analytics
- Voice input processed by browser's built-in Web Speech API

## ⚙️ Customization

### Add New Commands
Edit the `handleConversation()` function in `script.js`:

```javascript
const responses = {
    'your keyword': 'Your response here',
    // Add more...
};
```

### Change Colors
Edit the CSS variables in `style.css`:

```css
/* Neon Colors */
--primary: #00ff88;   /* Green */
--secondary: #00d4ff; /* Blue */
--accent: #ff00ff;    /* Magenta */
```

### Adjust Voice
Modify voice parameters in `respond()` function:

```javascript
utterance.rate = 0.95;    // Speech speed (0.5-2)
utterance.pitch = 0.9;    // Voice pitch (0.5-2)
utterance.volume = 0.8;   // Volume (0-1)
```

## 🐛 Troubleshooting

**Microphone not working?**
- Check browser permissions
- Use https:// (required for Web Speech API)
- Try a different browser

**Speech not detected?**
- Speak clearly and naturally
- Check microphone volume
- Stay close to microphone
- Avoid background noise

**No voice response?**
- Check browser volume
- Ensure TTS is enabled in browser
- Clear browser cache and reload

## 📝 Code Quality

- ✅ Clean, modular JavaScript
- ✅ Comprehensive comments
- ✅ No external libraries (vanilla JS/CSS/HTML)
- ✅ Follows best practices
- ✅ Optimized animations
- ✅ Responsive design
- ✅ XSS protection (HTML escaping)

## 🎓 Learning Resources

This project demonstrates:
- Web Speech API (SpeechRecognition, SpeechSynthesis)
- CSS animations and transitions
- Glassmorphism design
- Responsive web design
- DOM manipulation
- Event handling
- State management

## 📄 License

Free to use, modify, and distribute.

## 🤝 Contributing

Feel free to enhance this project! Ideas:
- Add more commands
- Improve voice recognition
- Create themes
- Add dark/light mode toggle
- Integrate with APIs (weather, news, etc.)
- Add more voice options

## 🎬 Credits

**Inspired by:** Iron Man's JARVIS
**Technology:** Web Speech API, CSS3 Animations, Vanilla JavaScript
**UI/UX Pattern:** Glassmorphism + Neon Cyberpunk

---

**Enjoy using JARVIS! 🚀**
