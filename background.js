// Background script for AI Chat Helper - handles API calls and secure storage

class BackgroundService {
  constructor() {
    this.apiKey = null;
    this.init();
  }

  init() {
    console.log('🚀 AI Chat Helper: Background script starting...');

    // Load API key on startup
    this.loadApiKey();

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    console.log('✅ AI Chat Helper: Background service started successfully');
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      this.apiKey = result.geminiApiKey;
    } catch (error) {
      console.error('AI Chat Helper: Error loading API key:', error);
    }
  }

  async saveApiKey(apiKey) {
    try {
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      this.apiKey = apiKey;
      return { success: true };
    } catch (error) {
      console.error('AI Chat Helper: Error saving API key:', error);
      return { success: false, error: error.message };
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'getExplanation':
        this.getExplanation(message.text, sender.tab.id);
        return false; // No response needed for this action
      case 'saveApiKey':
        this.saveApiKey(message.apiKey).then(result => {
          sendResponse(result);
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
      case 'getApiKey':
        sendResponse({ apiKey: this.apiKey });
        return false; // Synchronous response
    }
    return false;
  }

  async getExplanation(selectedText, tabId) {
    if (!this.apiKey) {
      this.sendResponseToTab(tabId, {
        action: 'explanationResponse',
        success: false,
        error: 'API key not configured. Please set it in the extension settings.'
      });
      return;
    }

    try {
      const explanation = await this.callGeminiAPI(selectedText);

      this.sendResponseToTab(tabId, {
        action: 'explanationResponse',
        success: true,
        explanation: explanation
      });
    } catch (error) {
      console.error('AI Chat Helper: API call failed:', error);

      let errorMessage = 'Failed to get explanation';
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your settings.';
      } else if (error.message.includes('429')) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      this.sendResponseToTab(tabId, {
        action: 'explanationResponse',
        success: false,
        error: errorMessage
      });
    }
  }

  async callGeminiAPI(selectedText) {
    const prompt = this.createPromptTemplate(selectedText);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response format');
    }

    return data.candidates[0].content.parts[0].text.trim();
  }

  createPromptTemplate(selectedText) {
    return `You are an AI assistant helping explain technical terms and concepts. The user has selected the text "${selectedText}" from an AI chat conversation.

Please provide a clear, concise explanation of this term/concept in 2-3 sentences. Focus on:
- What it means in context
- Why it might be relevant
- Keep it brief but informative

If this appears to be a technical term, acronym, or concept, explain it simply. If it's regular text, acknowledge that it's not a term that needs explanation.

Response format: Direct explanation without meta-commentary.`;
  }

  sendResponseToTab(tabId, response) {
    chrome.tabs.sendMessage(tabId, {
      action: 'explanationResponse',
      ...response
    });
  }
}

// Initialize the background service
new BackgroundService();
