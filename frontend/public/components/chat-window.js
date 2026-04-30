import {
  LitElement,
  html,
} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class ChatWindow extends LitElement {
  createRenderRoot() { return this; }

  static properties = {
    itemId:          { type: String, attribute: 'item-id' },
    itemName:        { type: String, attribute: 'item-name' },
    sellerId:        { type: String, attribute: 'seller-id' },
    sellerName:      { type: String, attribute: 'seller-name' },
    currentUserId:   { type: String, attribute: 'current-user-id' },
    currentUserName: { type: String, attribute: 'current-user-name' },
    messages:        { type: Array },
    newMessage:      { type: String },
    sending:         { type: Boolean },
  };

  constructor() {
    super();
    this.messages = [];
    this.newMessage = '';
    this.sending = false;
    this._pollInterval = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchMessages();
    this.startPolling();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopPolling();
  }

  startPolling() {
    // HTTP Polling — ask server for new messages every 3 seconds
    this._pollInterval = setInterval(() => this.fetchMessages(), 3000);
  }

  stopPolling() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  }

  async fetchMessages() {
    try {
      const res = await fetch(
        `${window.__API_BASE__}/messages?itemId=${this.itemId}`
      );
      if (!res.ok) return;
      const data = await res.json();
      // Only update + scroll if new messages arrived
      if (data.length !== this.messages.length) {
        this.messages = data;
        this.scrollToBottom();
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }

  async sendMessage() {
    const text = this.newMessage.trim();
    if (!text || this.sending) return;

    this.sending = true;
    try {
      const res = await fetch(`${window.__API_BASE__}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId:     this.itemId,
          senderId:   this.currentUserId,
          senderName: this.currentUserName,
          text,
        }),
      });
      if (res.ok) {
        this.newMessage = '';
        await this.fetchMessages();
      }
    } catch (e) {
      console.error('Send error:', e);
    } finally {
      this.sending = false;
    }
  }

  scrollToBottom() {
    this.updateComplete.then(() => {
      const container = this.querySelector('#messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  closeChat() {
    this.dispatchEvent(new CustomEvent('close-chat', {
      bubbles: true, composed: true
    }));
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    });
  }

  render() {
    return html`
      <!-- Chat Header -->
      <div class="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-sm">${this.itemName}</h3>
          <p class="text-blue-200 text-xs">Chat with ${this.sellerName}</p>
        </div>
        <button
          @click=${this.closeChat}
          class="text-white hover:text-blue-200 text-xl leading-none"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      <!-- Messages Area -->
      <div
        id="messages-container"
        class="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        ${this.messages.length === 0 ? html`
          <div class="text-center text-gray-400 text-sm py-8">
            <p class="text-3xl mb-2">💬</p>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ` : this.messages.map(msg => {
          const isMe = msg.senderId === this.currentUserId;
          return html`
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
              <div class="max-w-xs">
                ${!isMe ? html`
                  <p class="text-xs text-gray-400 mb-1 ml-1">${msg.senderName}</p>
                ` : ''}
                <div class="px-3 py-2 rounded-2xl text-sm
                  ${isMe
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
                  }">
                  ${msg.text}
                </div>
                <p class="text-xs text-gray-300 mt-1 ${isMe ? 'text-right' : 'text-left'} mx-1">
                  ${this.formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          `;
        })}
      </div>

      <!-- Message Input -->
      <div class="p-3 bg-white border-t border-gray-200 flex gap-2">
        <label for="message-input" class="sr-only">Type a message</label>
        <input
          id="message-input"
          type="text"
          placeholder="Type a message..."
          .value=${this.newMessage}
          @input=${e => this.newMessage = e.target.value}
          @keydown=${this.handleKeyDown}
          ?disabled=${this.sending}
          class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Message input"
        />
        <button
          @click=${this.sendMessage}
          ?disabled=${this.sending || !this.newMessage.trim()}
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                 text-white px-4 py-2 rounded-xl text-sm font-medium
                 transition-colors"
          aria-label="Send message"
        >
          ${this.sending ? '⏳' : '➤'}
        </button>
      </div>
    `;
  }
}

customElements.define('chat-window', ChatWindow);