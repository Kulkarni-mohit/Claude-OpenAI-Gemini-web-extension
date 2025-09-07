// Content script for ChatGPT - detects text selections and shows explanation popups

// Immediate test to see if script loads at all
console.log('🚀 AI Chat Helper: Content script file loaded!');

class AIChatHelper {
  constructor() {
    this.popupManager = null;
    this.currentPopupId = null;
    this.isProcessing = false;
    this.lastSelection = '';

    this.init();
  }

  init() {
    // Initialize popup manager
    this.popupManager = new SelectionPopupManager();

    // Listen for text selection events
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    console.log('AI Chat Helper: Content script loaded successfully');

    // Test that we can create elements
    const testDiv = document.createElement('div');
    testDiv.id = 'ai-chat-test';
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);
    console.log('AI Chat Helper: DOM manipulation test passed');
  }

  handleMouseUp(event) {
    console.log('AI Chat Helper: Mouse up detected');

    // Small delay to allow selection to complete
    setTimeout(() => {
      const selectedText = this.getSelectedText();
      console.log('AI Chat Helper: Selected text:', selectedText);

      if (this.shouldShowPopup(selectedText)) {
        console.log('AI Chat Helper: Creating popup for:', selectedText);
        this.showPopup(selectedText, event);
      }
    }, 10);
  }

  handleKeyUp(event) {
    // Handle keyboard shortcuts
    if (event.key === 'Escape') {
      this.closeCurrentPopup();
    }
  }

  handleSelectionChange() {
    const selectedText = this.getSelectedText();

    // Hide popup if selection is cleared
    if (!selectedText && this.currentPopupId) {
      this.closeCurrentPopup();
      this.lastSelection = '';
    }
  }

  getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
  }

  shouldShowPopup(text) {
    // Don't show popup for very short or very long selections
    if (!text || text.length < 2 || text.length > 100) return false;

    // Don't show popup for common UI elements or whitespace
    if (/^\s*$/.test(text)) return false;

    // Don't show popup for selections that are mostly numbers
    if (/^\d+(\.\d+)?$/.test(text)) return false;

    // Don't show popup for the same text as last time
    if (text === this.lastSelection) return false;

    return true;
  }

  showPopup(selectedText, event) {
    console.log('AI Chat Helper: Creating popup using SelectionPopupManager');

    // Remove existing popup
    this.closeCurrentPopup();

    // Ensure document.body exists before creating popup
    if (!document.body) {
      console.warn('AI Chat Helper: document.body not available for popup');
      return;
    }

    try {
      // Get popup position using the popup manager's positioning logic
      const position = this.popupManager.getPopupPosition(event, null);

      // Create popup using SelectionPopupManager
      this.currentPopupId = this.popupManager.createPopup({
        text: selectedText,
        position: position,
        onClose: () => {
          this.currentPopupId = null;
          this.lastSelection = '';
        },
        autoClose: true,
        autoCloseDelay: 15000 // 15 seconds
      });

      this.lastSelection = selectedText;

      console.log('AI Chat Helper: Popup created with ID:', this.currentPopupId);

      // Request explanation from background script
      this.requestExplanation(selectedText);
    } catch (error) {
      console.error('AI Chat Helper: Error creating popup:', error);
    }
  }

  closeCurrentPopup() {
    if (this.currentPopupId && this.popupManager) {
      this.popupManager.closePopup(this.currentPopupId);
      this.currentPopupId = null;
    }
  }

  requestExplanation(text) {
    // Send message to background script to get explanation
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'getExplanation',
        text: text
      });
    }
  }

  updatePopupContent(content, type = 'explanation') {
    if (!this.currentPopupId || !this.popupManager) return;

    this.popupManager.updatePopupContent(this.currentPopupId, content, type);
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'explanationResponse':
        if (this.currentPopupId) {
          if (message.success) {
            this.updatePopupContent(message.explanation, 'explanation');
          } else {
            this.updatePopupContent('❌ ' + message.error, 'error');
          }
        }
        break;
      case 'hidePopup':
        this.closeCurrentPopup();
        this.lastSelection = '';
        break;
    }
  }
}

// Wait for DOM to be ready before initializing
function initializeExtension() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('✅ AI Chat Helper: DOM loaded, initializing...');
      new AIChatHelper();
    });
  } else {
    console.log('✅ AI Chat Helper: DOM already ready, initializing...');
    new AIChatHelper();
  }
}

// Start initialization
initializeExtension();