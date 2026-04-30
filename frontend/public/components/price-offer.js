import {
  LitElement,
  html,
} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class PriceOffer extends LitElement {
  createRenderRoot() { return this; }

  static properties = {
    itemId:       { type: String, attribute: 'item-id' },
    itemName:     { type: String, attribute: 'item-name' },
    listedPrice:  { type: Number, attribute: 'listed-price' },
    buyerId:      { type: String, attribute: 'buyer-id' },
    buyerName:    { type: String, attribute: 'buyer-name' },
    sellerId:     { type: String, attribute: 'seller-id' },
    offerPrice:   { type: String },
    status:       { type: String }, // 'idle' | 'sending' | 'sent' | 'error'
  };

  constructor() {
    super();
    this.offerPrice = '';
    this.status = 'idle';
  }

  async submitOffer() {
    const price = parseFloat(this.offerPrice);
    if (!price || price <= 0) {
      alert('Please enter a valid price.');
      return;
    }
    if (price >= this.listedPrice) {
      alert(`Your offer should be less than the listed price of $${this.listedPrice}.`);
      return;
    }

    this.status = 'sending';
    try {
      // Send offer as a chat message to the seller
      const res = await fetch(`${window.__API_BASE__}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId:     this.itemId,
          senderId:   this.buyerId,
          senderName: this.buyerName,
          text: `💰 Price offer: I'd like to buy "${this.itemName}" for $${price}. Listed at $${this.listedPrice}.`,
        }),
      });

      if (res.ok) {
        this.status = 'sent';
        this.offerPrice = '';
      } else {
        this.status = 'error';
      }
    } catch {
      this.status = 'error';
    }
  }

  render() {
    return html`
      <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-1">
        <p class="text-xs text-yellow-700 font-medium mb-2">
          💰 Propose your price (listed: $${this.listedPrice})
        </p>

        ${this.status === 'sent' ? html`
          <p class="text-green-600 text-sm font-medium text-center py-1">
            ✅ Offer sent! The seller will respond via chat.
          </p>
        ` : html`
          <div class="flex gap-2">
            <label for="offer-input-${this.itemId}" class="sr-only">
              Your offer price
            </label>
            <input
              id="offer-input-${this.itemId}"
              type="number"
              min="1"
              step="0.01"
              placeholder="Your price $"
              .value=${this.offerPrice}
              @input=${e => this.offerPrice = e.target.value}
              class="flex-1 border border-yellow-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Enter your offer price"
            />
            <button
              @click=${this.submitOffer}
              ?disabled=${this.status === 'sending'}
              class="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300
                     text-white px-3 py-2 rounded-lg text-sm font-medium
                     transition-colors"
            >
              ${this.status === 'sending' ? '⏳' : 'Send'}
            </button>
          </div>
          ${this.status === 'error' ? html`
            <p class="text-red-500 text-xs mt-1">Failed to send offer. Try again.</p>
          ` : ''}
        `}
      </div>
    `;
  }
}

customElements.define('price-offer', PriceOffer);