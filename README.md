# cHeAtEr

**Your invisible AI wingman for meetings, interviews, coding sessions, and presentations.**

An Electron-based desktop application that provides real-time AI assistance without being detected. Works seamlessly during video calls, online tests, technical interviews, and any scenario where you need instant AI help.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Platform: Cross-platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green.svg)](https://github.com/ishaands12/cHeAtEr)
[![Electron](https://img.shields.io/badge/Electron-33.4-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)

---

## 🎯 What is cHeAtEr?

cHeAtEr is a privacy-focused AI assistant that runs as an invisible overlay on your desktop. It can:
- 📸 **Analyze screenshots** of anything on your screen
- 💬 **Chat with AI** about problems, questions, or code
- 🔒 **Stay hidden** from screen recordings and shares (macOS)
- 🏠 **Run locally** with Ollama (100% private) or use cloud AI (Gemini/Azure)
- ⚡ **Respond instantly** via global keyboard shortcuts

**Perfect for:**
- Technical interviews & coding challenges
- Online meetings & presentations
- Academic research & exams
- Sales calls & client demos
- Debugging sessions & code reviews

## 🚀 Quick Start Guide

### Prerequisites
- Make sure you have Node.js installed on your computer
- Git installed on your computer  
- **Either** a Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))
- **Or** Ollama installed locally for private LLM usage (recommended for privacy)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/ishaands12/cHeAtEr.git
cd cHeAtEr
```

2. Install dependencies:
```bash
# If you encounter Sharp/Python build errors, use this:
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts
npm rebuild sharp

# Or for normal installation:
npm install
```

3. Set up environment variables:
   - Create a file named `.env` in the root folder
   
   **For Gemini (Cloud AI):**
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   **For Ollama (Local/Private AI):**
   ```env
   USE_OLLAMA=true
   OLLAMA_MODEL=llama3.2
   OLLAMA_URL=http://localhost:11434
   ```
   
   - Save the file

### Running the App

#### Method 1: Development Mode (Recommended for first run)
1. Start the development server:
```bash
npm start
```

This command automatically:
- Starts the Vite dev server on port 5180
- Waits for the server to be ready
- Launches the Electron app

#### Method 2: Production Build
```bash
npm run dist
```
The built app will be in the `release` folder.

## 🤖 AI Provider Options

### Ollama (Recommended for Privacy)
**Pros:**
- 100% private - data never leaves your computer
- No API costs
- Works offline
- Supports many models: llama3.2, codellama, mistral, etc.

**Setup:**
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Set environment variables as shown above

### Google Gemini
**Pros:**
- Latest AI technology
- Fastest responses
- Best accuracy for complex tasks

**Cons:**
- Requires API key and internet
- Data sent to Google servers
- Usage costs apply

### ⚠️ Important Notes

1. **Closing the App**: 
   - Press `Cmd + Q` (Mac) or `Ctrl + Q` (Windows/Linux) to quit
   - Or use Activity Monitor/Task Manager to close `Interview Coder`
   - The X button currently doesn't work (known issue)

2. **If the app doesn't start**:
   - Make sure no other app is using port 5180
   - Try killing existing processes:
     ```bash
     # Find processes using port 5180
     lsof -i :5180
     # Kill them (replace [PID] with the process ID)
     kill [PID]
     ```
   - For Ollama users: Make sure Ollama is running (`ollama serve`)

3. **Keyboard Shortcuts**:
   - `Cmd/Ctrl + H`: Take screenshot and add to chat
   - `Cmd/Ctrl + B`: Toggle window visibility
   - `Cmd/Ctrl + Shift + Space`: Show and center window
   - `Cmd/Ctrl + Enter`: Process screenshots (legacy solution mode)
   - `Cmd/Ctrl + R`: Reset queues and view
   - `Cmd/Ctrl + Arrow Keys`: Move window position
   - `Cmd/Ctrl + Q`: Quit application

## 🔧 Troubleshooting

### Windows Issues Fixed 
- **UI not loading**: Port mismatch resolved
- **Electron crashes**: Improved error handling  
- **Build failures**: Production config updated
- **Window focus problems**: Platform-specific fixes applied

### Ubuntu/Linux Issues Fixed 
- **Window interaction**: Fixed focusable settings
- **Installation confusion**: Clear setup instructions
- **Missing dependencies**: All requirements documented

### Common Solutions

#### Sharp/Python Build Errors
If you see `gyp ERR! find Python` or Sharp build errors:
```bash
# Solution 1: Use prebuilt binaries
rm -rf node_modules package-lock.json
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts
npm rebuild sharp

# Solution 2: Or install Python (if you prefer building from source)
brew install python3  # macOS
# Then run: npm install
```

#### General Installation Issues
If you see other errors:
1. Delete the `node_modules` folder
2. Delete `package-lock.json` 
3. Run `npm install` again
4. Try running with `npm start`

### Platform-Specific Notes
- **Windows**: App now works on Windows 10/11
- **Ubuntu/Linux**: Tested on Ubuntu 20.04+ and most Linux distros  
- **macOS**: Native support with proper window management

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for UI components
- **Vite** for blazing-fast development and build
- **TailwindCSS v4** with PostCSS for modern styling
- **React Query** for state management and caching
- **Radix UI** for accessible, unstyled components
- **React Markdown** with syntax highlighting (rehype-highlight, remark-gfm)
- **Lucide React** for icons

### Backend/Electron
- **Electron 33.4** for cross-platform desktop support
- **TypeScript** for type-safe Node.js code
- **IPC (Inter-Process Communication)** for renderer-main process communication
- **Global Shortcuts** for system-wide hotkeys

### AI Integration
- **Google Generative AI SDK** - Gemini 2.0 Flash support
- **OpenAI SDK** - Azure OpenAI integration
- **Ollama** - Local LLM support via HTTP API
- Multi-model support: Llama 3.2, CodeLlama, Mistral, and more

### Image & Media Processing
- **screenshot-desktop** - Cross-platform screen capture
- **Sharp** - High-performance image processing
- **Tesseract.js** - OCR capabilities (future feature)

### Build & Deployment
- **electron-builder** - Package for Windows (NSIS/portable), macOS (DMG), Linux (AppImage/deb)
- **Concurrently** - Run Vite and Electron simultaneously in dev mode

---

## 🎨 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Main Process (Electron)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AppState (Singleton)                     │  │
│  │  ┌────────────┐ ┌──────────────┐ ┌───────────────┐  │  │
│  │  │  Window    │ │  Screenshot  │ │      LLM      │  │  │
│  │  │   Helper   │ │    Helper    │ │    Helper     │  │  │
│  │  └────────────┘ └──────────────┘ └───────────────┘  │  │
│  │  ┌────────────┐ ┌──────────────┐                     │  │
│  │  │ Processing │ │   Shortcuts  │                     │  │
│  │  │   Helper   │ │    Helper    │                     │  │
│  │  └────────────┘ └──────────────┘                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕ IPC                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Renderer Process (React + Vite)            │  │
│  │   Queue.tsx  │  Solutions.tsx  │  Settings.tsx       │  │
│  │  (Chat UI)   │ (Code Display)  │ (LLM Config)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ API Calls
         ┌──────────────────────────────────────┐
         │  Gemini API  │  Azure  │  Ollama     │
         │  (Cloud)     │ (Cloud) │  (Local)    │
         └──────────────────────────────────────┘
```

**Design Pattern:** Helper-based architecture with centralized AppState coordination
- Each helper manages a specific domain (window, screenshots, AI, processing, shortcuts)
- IPC handlers bridge React UI to Electron backend
- React Query manages UI state and server communication

---

## Key Features

### **Invisible AI Assistant**
- Translucent, always-on-top window that's barely noticeable
- Hide/show instantly with global hotkeys
- Works seamlessly across all applications

### **Smart Screenshot Analysis** 
- Take screenshots of any content with `Cmd/Ctrl + H`
- AI analyzes images, documents, presentations, or problems
- Get instant explanations, answers, and solutions

### **Audio Intelligence**
- Process audio files and recordings
- Real-time transcription and analysis
- Perfect for meeting notes and content review

### **Contextual Chat**
- Chat with AI about anything you see on screen
- Maintains conversation context
- Ask follow-up questions for deeper insights

### **Privacy-First Design**
- **Local AI Option**: Use Ollama for 100% private processing
- **Cloud Option**: Google Gemini for maximum performance
- **🔥 Reduced Focus Mode**: Panel-type window minimizes focus stealing - reduced detection risk during proctored tests (test carefully first)
- **Screen Capture Protection**: Protected from macOS native screen recording (see [SCREEN_CAPTURE_PROTECTION.md](SCREEN_CAPTURE_PROTECTION.md))
- **Manual Privacy Mode**: Hide window instantly with `Cmd+Shift+Space` during screen shares
- Screenshots auto-deleted after processing
- No data tracking or storage

### **Cross-Platform Support**
- **Windows 10/11** - Full support with native performance
- **Ubuntu/Linux** - Optimized for all major distributions  
- **macOS** - Native window management and shortcuts

## Use Cases

### **Academic & Learning**
```
✓ Live presentation support during classes
✓ Quick research during online exams  
✓ Language translation and explanations
✓ Math and science problem solving
```

### **Professional Meetings**
```
✓ Sales call preparation and objection handling
✓ Technical interview coaching
✓ Client presentation support
✓ Real-time fact-checking and data lookup
```

### **Development & Tech**
```
✓ Debug error messages instantly
✓ Code explanation and optimization
✓ Documentation and API references
✓ Algorithm and architecture guidance
```

## 📊 Why Choose cHeAtEr?

| Feature | cHeAtEr | Commercial Alternatives |
|---------|---------|------------------------|
| **Cost** | 100% Free & Open Source | $29-99/month |
| **Privacy** | Local AI with Ollama | Cloud-only |
| **Source Code** | Fully transparent | Closed source |
| **Customization** | Fork & modify freely | Limited options |
| **Data Control** | You own everything | Third-party servers |
| **Offline Mode** | Yes (Ollama) | No |
| **Multi-LLM** | Gemini, Azure, Ollama | Single provider |
| **Screen Protection** | Built-in (macOS) | Not available |

## Technical Details

### **AI Models Supported**
- **Gemini 2.0 Flash** - Latest Google AI with vision capabilities
- **Llama 3.2** - Meta's advanced local model via Ollama
- **CodeLlama** - Specialized coding assistance
- **Mistral** - Lightweight, fast responses
- **Custom Models** - Any Ollama-compatible model

### **System Requirements**
```bash
Minimum:  4GB RAM, Dual-core CPU, 2GB storage
Recommended: 8GB+ RAM, Quad-core CPU, 5GB+ storage
Optimal: 16GB+ RAM for local AI models
```

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements, feel free to open a PR.

**Ways to contribute:**
- 🐛 Bug fixes and stability improvements
- ✨ New features and AI model integrations
- 📚 Documentation and tutorial improvements
- 🌍 Translations and internationalization
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations

**Development workflow:**
```bash
# Fork and clone the repo
git clone https://github.com/ishaands12/cHeAtEr.git
cd cHeAtEr

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run dist
```

## 📄 License

ISC License - Free for personal and commercial use.

## ⚠️ Disclaimer

This tool is intended for educational purposes, authorized security testing, personal productivity, and legitimate use cases. Users are responsible for ensuring compliance with all applicable laws, regulations, and terms of service. The developers assume no liability for misuse.

---

## 🌟 Show Your Support

If cHeAtEr helps you ace interviews, meetings, or coding challenges:
- ⭐ **Star this repository**
- 🐛 **Report bugs** via [GitHub Issues](https://github.com/ishaands12/cHeAtEr/issues)
- 💡 **Share ideas** for new features
- 🤝 **Contribute** code or documentation

---

### 🏷️ Keywords
`ai-assistant` `electron` `react` `typescript` `ollama` `gemini-ai` `llm` `interview-helper` `coding-assistant` `meeting-notes` `screenshot-ocr` `cross-platform` `privacy-first` `open-source` `local-ai` `screen-capture` `desktop-app` `productivity-tool`

---

**Made with ☕ by developers who needed an invisible AI wingman**

Repository: [https://github.com/ishaands12/cHeAtEr](https://github.com/ishaands12/cHeAtEr)
