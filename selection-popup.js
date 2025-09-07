// Selection popup manager for AI Chat Helper
// This file contains additional popup management utilities

class SelectionPopupManager {
  constructor() {
    this.activePopups = new Set();
    this.maxPopups = 3; // Maximum number of simultaneous popups
  }

  createPopup(options = {}) {
    const {
      text = '',
      position = { x: 0, y: 0 },
      onClose = null,
      autoClose = true,
      autoCloseDelay = 10000 // 10 seconds
    } = options;

    // Clean up old popups if we have too many
    this.cleanupPopups();

    const popupId = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const popup = document.createElement('div');
    popup.id = popupId;
    popup.className = 'ai-chat-helper-popup selection-popup';
    popup.setAttribute('data-popup-id', popupId);

    // Position the popup
    popup.style.position = 'fixed';
    popup.style.left = `${position.x}px`;
    popup.style.top = `${position.y}px`;
    popup.style.zIndex = '10000';

    // Create popup content
    popup.innerHTML = this.createPopupHTML(text, popupId);

    // Add to DOM
    document.body.appendChild(popup);
    this.activePopups.add(popupId);

    // Trigger animation
    requestAnimationFrame(() => {
      popup.classList.add('show');
    });

    // Set up auto-close if enabled
    if (autoClose) {
      setTimeout(() => {
        this.closePopup(popupId);
      }, autoCloseDelay);
    }

    // Set up close event listener
    const closeBtn = popup.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closePopup(popupId);
        if (onClose) onClose();
      });
    }

    return popupId;
  }

  createPopupHTML(text, popupId) {
    return `
      <div class="popup-header">
        <span class="selected-text">${this.truncateText(text, 50)}</span>
        <button class="close-btn" data-popup-id="${popupId}">×</button>
      </div>
      <div class="popup-content">
        <div class="loading">
          <span class="loading-spinner"></span>
          Getting explanation...
        </div>
      </div>
    `;
  }

  updatePopupContent(popupId, content, type = 'explanation') {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    const contentDiv = popup.querySelector('.popup-content');
    if (!contentDiv) return;

    let html = '';

    switch (type) {
      case 'explanation':
        html = `<div class="explanation">${this.formatExplanation(content)}</div>`;
        break;
      case 'error':
        html = `<div class="error">${content}</div>`;
        break;
      case 'loading':
        html = `<div class="loading"><span class="loading-spinner"></span>${content}</div>`;
        break;
      default:
        html = `<div class="content">${content}</div>`;
    }

    contentDiv.innerHTML = html;
  }

  closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    popup.classList.remove('show');

    // Remove from DOM after animation
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
      this.activePopups.delete(popupId);
    }, 300);
  }

  closeAllPopups() {
    const popupIds = Array.from(this.activePopups);
    popupIds.forEach(id => this.closePopup(id));
  }

  cleanupPopups() {
    // Remove popups that are no longer in DOM
    this.activePopups.forEach(popupId => {
      if (!document.getElementById(popupId)) {
        this.activePopups.delete(popupId);
      }
    });

    // If we still have too many, remove the oldest ones
    if (this.activePopups.size >= this.maxPopups) {
      const popupIds = Array.from(this.activePopups);
      const toRemove = popupIds.slice(0, this.activePopups.size - this.maxPopups + 1);
      toRemove.forEach(id => this.closePopup(id));
    }
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  formatExplanation(text) {
    // Basic formatting for explanations
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/`(.*?)`/g, '<code>$1</code>') // Code snippets
      .replace(/\n/g, '<br>'); // Line breaks
  }

  getPopupPosition(mouseEvent, selectionRect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 350; // Estimated popup width
    const popupHeight = 200; // Estimated popup height

    let x = mouseEvent.clientX + 10;
    let y = mouseEvent.clientY + 10;

    // Adjust if popup would go off-screen
    if (x + popupWidth > viewportWidth) {
      x = mouseEvent.clientX - popupWidth - 10;
    }

    if (y + popupHeight > viewportHeight) {
      y = mouseEvent.clientY - popupHeight - 10;
    }

    // Ensure popup stays within viewport bounds
    x = Math.max(10, Math.min(x, viewportWidth - popupWidth - 10));
    y = Math.max(10, Math.min(y, viewportHeight - popupHeight - 10));

    return { x, y };
  }
}

// Export for use in other scripts
window.SelectionPopupManager = SelectionPopupManager;
