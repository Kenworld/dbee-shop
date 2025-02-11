// Import Firebase instances
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Product Manager Class
export class ProductManager {
  constructor() {
    this.products = [];
    this.saleProducts = [];
  }

  async fetchProducts() {
    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);

      this.products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.saleProducts = this.products.filter((product) => product.salePrice);
      this.renderProducts();
      this.renderSaleProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  renderProducts() {
    const container = document.getElementById("productsContainer");
    if (!container) return;

    const productsHTML = this.products
      .slice(0, 8)
      .map((product) => this.createProductCard(product))
      .join("");
    container.innerHTML = productsHTML;
  }

  renderSaleProducts() {
    const container = document.getElementById("saleProductsContainer");
    if (!container) return;

    const productsHTML = this.saleProducts
      .slice(0, 4)
      .map((product) => this.createProductCard(product))
      .join("");
    container.innerHTML = productsHTML;
  }

  createProductCard(product) {
    const discount = product.salePrice
      ? Math.round((1 - product.salePrice / product.regularPrice) * 100)
      : 0;

    // Strip HTML tags from description for card display
    const stripHtml = (html) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    const description = product.description
      ? stripHtml(product.description).substring(0, 100)
      : "";

    return `
            <div class="col-6 col-lg-3 col-md-4">
                <div class="card product-card h-100 border-0">
                    ${
                      discount
                        ? `
                        <span class="badge bg-danger sale-badge">-${discount}%</span>
                    `
                        : ""
                    }
                    <img src="${
                      product.main_image
                    }" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="description">${description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                ${
                                  product.salePrice
                                    ? `
                                    <span class="text-danger fw-bold">GHS${product.salePrice.toFixed(
                                      2
                                    )}</span>
                                    <small class="text-muted text-decoration-line-through">GHS${product.regularPrice.toFixed(
                                      2
                                    )}</small>
                                `
                                    : `
                                    <span class="fw-bold">GHS ${product.regularPrice.toFixed(
                                      2
                                    )}</span>
                                `
                                }
                            </div>
                            <button class="btn btn-primary btn-sm add-to-cart-btn" 
                                data-product='${JSON.stringify(product)}'>
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  async getProductById(id) {
    // TODO: Implement Firebase fetch
  }
}

// Auth Manager Class
class AuthManager {
  constructor() {
    this.currentUser = null;
  }

  async login(email, password) {
    // TODO: Implement Firebase auth
  }

  async register(email, password, fullname, phone) {
    // TODO: Implement Firebase auth
  }

  async logout() {
    // TODO: Implement Firebase auth
  }
}

// Cart Manager Class
class CartManager {
  constructor() {
    this.items = [];
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      this.items = Array.isArray(parsedCart) ? parsedCart : [];
      this.updateCartCount();
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
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    this.saveCart();
    this.updateCartCount();
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
  }

  updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
  }
}

// Initialize managers
const productManager = new ProductManager();
const authManager = new AuthManager();
export const cartManager = new CartManager();

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Handle add to cart button clicks
  document.addEventListener("click", (e) => {
    if (e.target.closest(".add-to-cart-btn")) {
      const button = e.target.closest(".add-to-cart-btn");
      const product = JSON.parse(button.dataset.product);
      cartManager.addItem(product);

      // Show feedback
      const toast = new bootstrap.Toast(document.createElement("div"));
      toast.show();
    }
  });

  // Cart button click handler
  const cartBtn = document.getElementById("cartBtn");
  cartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const cartOffcanvas = new bootstrap.Offcanvas(
      document.getElementById("cartOffcanvas")
    );
    cartOffcanvas.show();
  });

  // Initialize products
  productManager.fetchProducts();
});
