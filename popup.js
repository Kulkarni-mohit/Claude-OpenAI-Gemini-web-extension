// Popup script for AI Chat Helper settings

class SettingsPopup {
  constructor() {
    this.apiKeyInput = document.getElementById('api-key');
    this.saveBtn = document.getElementById('save-btn');
    this.testBtn = document.getElementById('test-btn');
    this.statusDiv = document.getElementById('status');
    this.form = document.getElementById('settings-form');

    this.init();
  }

  async init() {
    // Load existing API key
    await this.loadApiKey();

    // Set up event listeners
    this.form.addEventListener('submit', this.handleSave.bind(this));
    this.testBtn.addEventListener('click', this.handleTest.bind(this));

    // Focus on input if no API key is set
    if (!this.apiKeyInput.value) {
      this.apiKeyInput.focus();
    }
  }

  async loadApiKey() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
      if (response.apiKey) {
        this.apiKeyInput.value = response.apiKey;
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      this.showStatus('Error loading saved API key', 'error');
    }
  }

  async handleSave(event) {
    event.preventDefault();

    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showStatus('Please enter an API key', 'error');
      return;
    }

    if (!this.isValidApiKey(apiKey)) {
      this.showStatus('Please enter a valid Gemini API key', 'error');
      return;
    }

    this.setLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveApiKey',
        apiKey: apiKey
      });

      if (response.success) {
        this.showStatus('API key saved successfully!', 'success');
        setTimeout(() => window.close(), 1500);
      } else {
        this.showStatus('Failed to save API key: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      this.showStatus('Failed to save API key', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async handleTest(event) {
    event.preventDefault();

    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showStatus('Please enter an API key to test', 'error');
      return;
    }

    this.setLoading(true, 'Testing connection...');

    try {
      // Test with a simple term
      const response = await this.testApiConnection(apiKey);

      if (response.success) {
        this.showStatus('✅ Connection successful! API key is working.', 'success');
      } else {
        this.showStatus('❌ Connection failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      this.showStatus('❌ Connection test failed', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async testApiConnection(apiKey) {
    const testPrompt = 'Explain what "API" means in one sentence.';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: testPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          return { success: false, error: 'Invalid API key' };
        } else if (response.status === 403) {
          return { success: false, error: 'API key does not have proper permissions' };
        } else {
          return { success: false, error: `API Error: ${response.status}` };
        }
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response format' };
      }
    } catch (error) {
      if (error.message.includes('fetch')) {
        return { success: false, error: 'Network error - check your connection' };
      }
      return { success: false, error: error.message };
    }
  }

  isValidApiKey(apiKey) {
    // Basic validation - Gemini API keys start with specific patterns
    return apiKey.length > 20 && /^[A-Za-z0-9_-]+$/.test(apiKey);
  }

  setLoading(loading, message = 'Saving...') {
    this.saveBtn.disabled = loading;
    this.testBtn.disabled = loading;
    this.apiKeyInput.disabled = loading;

    if (loading) {
      this.saveBtn.textContent = message;
    } else {
      this.saveBtn.textContent = 'Save API Key';
    }
  }

  showStatus(message, type) {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type}`;
    this.statusDiv.style.display = 'block';

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        this.statusDiv.style.display = 'none';
      }, 5000);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SettingsPopup();
});
