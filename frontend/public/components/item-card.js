import {
  LitElement,
  html,
} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

import './price-offer.js';

class ItemCard extends LitElement {
  createRenderRoot() { return this; }

  static properties = {
    item:            { type: Object },
    currentUserId:   { type: String, attribute: 'current-user-id' },
    currentUserName: { type: String, attribute: 'current-user-name' },
    userRole:        { type: String, attribute: 'user-role' },
    showOffer:       { type: Boolean },
    purchasing:      { type: Boolean },
    purchased:       { type: Boolean },
  };

  constructor() {
    super();
    this.item = {};
    this.showOffer = false;
    this.purchasing = false;
    this.purchased = false;
  }

  openChat() {
    // Bubble event up to marketplace-app
    this.dispatchEvent(new CustomEvent('open-chat', {
      bubbles: true,
      composed: true,
      detail: {
        itemId:     this.item.id,
        itemName:   this.item.name,
        sellerId:   this.item.sellerId,
        sellerName: this.item.sellerName,
      }
    }));
  }

  async handleCheckout() {
    if (!confirm(`Confirm purchase of "${this.item.name}" for $${this.item.price}?`)) return;
    this.purchasing = true;
    try {
      const res = await fetch(`${window.__API_BASE__}/items/${this.item.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId:   this.currentUserId,
          buyerName: this.currentUserName,
        }),
      });
      if (res.ok) {
        this.purchased = true;
        this.dispatchEvent(new CustomEvent('item-purchased', {
          bubbles: true, composed: true
        }));
      } else {
        alert('Purchase failed. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      this.purchasing = false;
    }
  }

  async handleDelete() {
    if (!confirm(`Remove "${this.item.name}" from marketplace?`)) return;
    try {
      const res = await fetch(`${window.__API_BASE__}/items/${this.item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        this.dispatchEvent(new CustomEvent('item-deleted', {
          bubbles: true, composed: true
        }));
      }
    } catch {
      alert('Failed to delete item.');
    }
  }

  get isOwner() {
    return this.item.sellerId === this.currentUserId;
  }

  render() {
    const { name, description, price, category, image, sellerName, status } = this.item;
    const isSold = status === 'sold' || this.purchased;

    return html`
      <article
        class="bg-white rounded-2xl shadow-sm border border-gray-100
               hover:shadow-md transition-shadow duration-200 overflow-hidden
               flex flex-col"
        aria-label="Item: ${name}"
      >
        <!-- Item Image -->
        <div class="relative bg-gray-100 h-48 overflow-hidden">
          ${image ? html`
            <img
              src=${image}
              alt=${name}
              class="w-full h-full object-cover"
              loading="lazy"
            />
          ` : html`
            <div class="w-full h-full flex items-center justify-center text-6xl">
              🏺
            </div>
          `}
          ${isSold ? html`
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span class="text-white font-bold text-xl bg-red-500 px-4 py-2 rounded-full">
                SOLD
              </span>
            </div>
          ` : ''}
          ${category ? html`
            <span class="absolute top-2 left-2 bg-blue-600 text-white text-xs
                         px-2 py-1 rounded-full font-medium">
              ${category}
            </span>
          ` : ''}
        </div>

        <!-- Item Details -->
        <div class="p-4 flex flex-col flex-grow">
          <h3 class="font-bold text-gray-800 text-lg leading-tight mb-1">${name}</h3>
          <p class="text-gray-500 text-sm mb-3 flex-grow line-clamp-2">${description}</p>

          <div class="flex items-center justify-between mb-4">
            <span class="text-2xl font-bold text-blue-700">$${price}</span>
            <span class="text-xs text-gray-400">by ${sellerName || 'Unknown'}</span>
          </div>

          <!-- Actions -->
          ${!isSold ? html`
            <div class="flex flex-col gap-2">

              ${!this.isOwner ? html`
                <!-- Buyer Actions -->
                <div class="flex gap-2">
                  <button
                    @click=${this.handleCheckout}
                    ?disabled=${this.purchasing}
                    class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                           text-white text-sm font-semibold py-2 px-3 rounded-xl
                           transition-colors"
                    aria-label="Buy ${name} for $${price}"
                  >
                    ${this.purchasing ? '⏳ Processing...' : '🛒 Buy Now'}
                  </button>
                  <button
                    @click=${this.openChat}
                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700
                           text-sm font-semibold py-2 px-3 rounded-xl transition-colors"
                    aria-label="Message seller about ${name}"
                  >
                    💬 Chat
                  </button>
                </div>

                <!-- Price Offer Toggle -->
                <button
                  @click=${() => this.showOffer = !this.showOffer}
                  class="text-sm text-blue-600 hover:text-blue-800 underline text-left"
                  aria-expanded=${this.showOffer}
                >
                  ${this.showOffer ? '▲ Hide offer' : '💰 Propose a price'}
                </button>

                ${this.showOffer ? html`
                  <price-offer
                    item-id=${this.item.id}
                    item-name=${name}
                    listed-price=${price}
                    buyer-id=${this.currentUserId}
                    buyer-name=${this.currentUserName}
                    seller-id=${this.item.sellerId}
                  ></price-offer>
                ` : ''}

              ` : html`
                <!-- Seller Actions -->
                <div class="flex gap-2">
                  <button
                    @click=${this.handleDelete}
                    class="flex-1 bg-red-50 hover:bg-red-100 text-red-600
                           text-sm font-semibold py-2 px-3 rounded-xl transition-colors
                           border border-red-200"
                    aria-label="Remove ${name} from marketplace"
                  >
                    🗑️ Remove
                  </button>
                  <button
                    @click=${this.openChat}
                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700
                           text-sm font-semibold py-2 px-3 rounded-xl transition-colors"
                  >
                    💬 Messages
                  </button>
                </div>
              `}
            </div>
          ` : html`
            <p class="text-center text-gray-400 text-sm font-medium py-2">
              This item has been sold
            </p>
          `}
        </div>
      </article>
    `;
  }
}

customElements.define('item-card', ItemCard);