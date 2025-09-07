# 🤖 AI Chat Helper - Chrome Extension

A Chrome extension that provides instant term explanations via text selection popups on AI chat platforms (ChatGPT, Claude, etc.) without disrupting the main conversation flow.

## ✨ Features

- **Instant Explanations**: Select any text on ChatGPT to get instant explanations
- **Smooth Animations**: Beautiful fade-in animations for a polished experience
- **Secure API Storage**: Your Gemini API key is stored securely using Chrome's storage API
- **Smart Selection**: Only shows popups for meaningful text selections
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Non-intrusive**: Doesn't interfere with your ChatGPT experience

## 🚀 Installation

### 1. Download the Extension
```bash
# Clone or download this repository
git clone <repository-url>
cd ai-chat-helper-extension
```

### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder containing these files

### 3. Set Up Your API Key
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the extension icon in Chrome toolbar
3. Enter your API key and click "Save"
4. Click "Test Connection" to verify it works

## 🎯 How to Use

1. **Navigate to ChatGPT**: Go to [chat.openai.com](https://chat.openai.com) or [chatgpt.com](https://chatgpt.com)
2. **Select Text**: Highlight any term, acronym, or concept you want explained
3. **Get Instant Explanation**: A popup appears with the explanation powered by Gemini AI
4. **Close Popup**: Click the × button or press Escape to close

## 🔧 Configuration

### API Settings
- **API Key**: Your Gemini API key (stored securely)
- **Model**: Uses Gemini 1.5 Flash for fast responses
- **Prompt Template**: Optimized for clear, concise explanations

### Behavior Settings
- **Selection Length**: Works with text selections 2-100 characters
- **Positioning**: Popup appears near your cursor, adjusts to screen edges
- **Animation**: Smooth fade-in/fade-out transitions

## 🛠️ Technical Details

### Architecture
- **Content Script**: Detects text selections on ChatGPT pages
- **Background Script**: Handles API calls and secure storage
- **Popup UI**: Settings interface for configuration

### Files Structure
```
├── manifest.json          # Extension manifest
├── background.js          # API calls and storage
├── content.js            # Selection detection
├── popup.html/js         # Settings interface
├── selection-popup.js    # Popup management
├── styles.css            # Popup styling
└── README.md             # This file
```



## 📋 Requirements

- **Chrome Browser**: Version 88 or later (Manifest V3 support)
- **Gemini API Key**: From Google AI Studio
- **Permissions**: Active tab access, storage, and API host permissions

## 🔒 Privacy & Security

- **API Key Security**: Stored securely using Chrome's encrypted storage
- **No Data Collection**: Extension only processes selected text for explanations
- **Local Processing**: All API calls happen client-side with your API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Powered by Google's Gemini AI
- Built for the AI chat platform ecosystem
- Inspired by the need for seamless learning during AI conversations

---

**Made with ❤️ for AI enthusiasts and learners**

