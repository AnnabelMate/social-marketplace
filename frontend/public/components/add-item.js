import {
  LitElement,
  html,
} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class AddItem extends LitElement {
  createRenderRoot() { return this; }

  static properties = {
    userId:   { type: String, attribute: 'user-id' },
    userName: { type: String, attribute: 'user-name' },
    submitting: { type: Boolean },
    success:    { type: Boolean },
    form: { type: Object },
  };

  constructor() {
    super();
    this.submitting = false;
    this.success = false;
    this.form = {
      name: '', description: '', price: '', category: '', image: ''
    };
  }

  updateField(field, value) {
    this.form = { ...this.form, [field]: value };
  }

  async handleSubmit() {
    const { name, price, category } = this.form;
    if (!name || !price || !category) {
      alert('Please fill in Name, Price, and Category.');
      return;
    }

    this.submitting = true;
    try {
      const res = await fetch(`${window.__API_BASE__}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.form,
          price: parseFloat(this.form.price),
          sellerId:   this.userId,
          sellerName: this.userName,
        }),
      });

      if (res.ok) {
        this.success = true;
        this.form = { name: '', description: '', price: '', category: '', image: '' };
        setTimeout(() => { this.success = false; }, 3000);
      } else {
        alert('Failed to add item. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      this.submitting = false;
    }
  }

  render() {
    return html`
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h2 class="text-xl font-bold text-gray-800 mb-4">📦 List a New Item</h2>

        ${this.success ? html`
          <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4
                      text-green-700 font-medium text-sm" role="status">
            ✅ Item listed successfully!
          </div>
        ` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div class="sm:col-span-2">
            <label for="item-name" class="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              id="item-name"
              type="text"
              placeholder="e.g. Vintage Baseball Card"
              .value=${this.form.name}
              @input=${e => this.updateField('name', e.target.value)}
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="item-price" class="block text-sm font-medium text-gray-700 mb-1">
              Price ($) *
            </label>
            <input
              id="item-price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="25.00"
              .value=${this.form.price}
              @input=${e => this.updateField('price', e.target.value)}
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="item-category" class="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="item-category"
              .value=${this.form.category}
              @change=${e => this.updateField('category', e.target.value)}
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select category...</option>
              <option value="Cards">Cards</option>
              <option value="Coins">Coins</option>
              <option value="Toys">Toys</option>
              <option value="Art">Art</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label for="item-description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="item-description"
              rows="3"
              placeholder="Describe your item..."
              .value=${this.form.description}
              @input=${e => this.updateField('description', e.target.value)}
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          <div class="sm:col-span-2">
            <label for="item-image" class="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="item-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              .value=${this.form.image}
              @input=${e => this.updateField('image', e.target.value)}
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          @click=${this.handleSubmit}
          ?disabled=${this.submitting}
          class="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          ${this.submitting ? '⏳ Listing item...' : '+ List Item for Sale'}
        </button>
      </div>
    `;
  }
}

customElements.define('add-item', AddItem);