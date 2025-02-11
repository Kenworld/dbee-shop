class CartManager {
  constructor() {
    this.items = [];
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.items = JSON.parse(savedCart);
      this.updateCartCount();
      this.renderCartItems();
    }
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.regularPrice,
        image: product.main_image,
        quantity,
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
      }
    }
  }

  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      const totalItems = this.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      cartCount.textContent = totalItems;
    }
  }

  renderCartItems() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    if (this.items.length === 0) {
      cartItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
      return;
    }

    const itemsHTML = this.items
      .map(
        (item) => `
            <div class="cart-item mb-3">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${
          item.name
        }" class="img-fluid me-3" style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <div class="input-group input-group-sm" style="width: 100px;">
                                <button class="btn btn-outline-secondary" type="button" 
                                    onclick="cartManager.updateQuantity('${
                                      item.id
                                    }', ${item.quantity - 1})">-</button>
                                <input type="text" class="form-control text-center" value="${
                                  item.quantity
                                }" readonly>
                                <button class="btn btn-outline-secondary" type="button"
                                    onclick="cartManager.updateQuantity('${
                                      item.id
                                    }', ${item.quantity + 1})">+</button>
                            </div>
                            <div class="ms-3">
                                <span class="fw-bold">$${(
                                  item.price * item.quantity
                                ).toFixed(2)}</span>
                                <button class="btn btn-sm btn-link text-danger" 
                                    onclick="cartManager.removeItem('${
                                      item.id
                                    }')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    cartItems.innerHTML = `
            ${itemsHTML}
            <div class="border-top pt-3 mt-3">
                <div class="d-flex justify-content-between">
                    <span class="fw-bold">Total:</span>
                    <span class="fw-bold">$${this.getTotal().toFixed(2)}</span>
                </div>
            </div>
        `;
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }
}

// Initialize cart manager
const cartManager = new CartManager();
