// Import Lit from CDN
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

const API = 'http://localhost:3000'; // your backend URL

class MarketplaceApp extends LitElement {
  // Tell Lit what data this component tracks
  static properties = {
    items: { type: Array },
    searchQuery: { type: String },
    loading: { type: Boolean }
  };

  constructor() {
    super();
    this.items = [];
    this.searchQuery = '';
    this.loading = true;
  }

  // Runs when component first appears on page
  connectedCallback() {
    super.connectedCallback();
    this.fetchItems();
  }

  async fetchItems() {
    try {
      const res = await fetch(`${API}/items`);
      this.items = await res.json();
    } catch (e) {
      console.error('Failed to fetch items', e);
    } finally {
      this.loading = false;
    }
  }

  get filteredItems() {
    return this.items.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  render() {
    return html`
      <!-- Search bar -->
      <div class="mb-4">
        <input
          type="search"
          placeholder="Search collectibles..."
          @input=${e => this.searchQuery = e.target.value}
          class="w-full p-2 border rounded"
        />
      </div>

      <!-- Items grid -->
      ${this.loading
        ? html`<p>Loading...</p>`
        : html`
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${this.filteredItems.map(item => html`
              <item-card .item=${item}></item-card>
            `)}
          </div>
        `
      }
    `;
  }
}

customElements.define('marketplace-app', MarketplaceApp);