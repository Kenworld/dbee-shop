// Import Firebase and other dependencies
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { ProductManager } from "./main.js";
import { cartManager } from "./main.js";

class ShopManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentView = "grid";
    this.filters = {
      search: "",
      category: "",
      minPrice: null,
      maxPrice: null,
      brand: "",
    };
    this.sortBy = "newest";
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Search input
    const searchInput = document.getElementById("shopSearch");
    searchInput?.addEventListener("input", (e) => {
      this.filters.search = e.target.value;
      this.currentPage = 1;
      this.loadProducts();
    });

    // Sort select
    const sortSelect = document.getElementById("sortProducts");
    sortSelect?.addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.loadProducts();
    });

    // View toggle
    const viewButtons = document.querySelectorAll("[data-view]");
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.currentView = button.dataset.view;
        this.updateViewButtons();
        this.loadProducts();
      });
    });

    // Apply filters button
    const applyFiltersBtn = document.getElementById("applyFilters");
    applyFiltersBtn?.addEventListener("click", () => {
      this.filters.minPrice = document.getElementById("minPrice").value || null;
      this.filters.maxPrice = document.getElementById("maxPrice").value || null;
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  async loadProducts() {
    try {
      // Fetch products from Firestore
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);

      let products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply filters
      products = this.filterProducts(products);

      // Sort products
      products = this.sortProducts(products);

      // Paginate products
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const paginatedProducts = products.slice(
        startIndex,
        startIndex + this.itemsPerPage
      );

      // Render products
      this.renderProducts(paginatedProducts);

      // Update product count
      this.updateProductCount(products.length);

      // Update pagination
      this.renderPagination(Math.ceil(products.length / this.itemsPerPage));
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  filterProducts(products) {
    return products.filter((product) => {
      // Search filter
      if (
        this.filters.search &&
        !product.name.toLowerCase().includes(this.filters.search.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (this.filters.category && product.category !== this.filters.category) {
        return false;
      }

      // Price filter
      if (
        this.filters.minPrice &&
        product.regularPrice < this.filters.minPrice
      ) {
        return false;
      }
      if (
        this.filters.maxPrice &&
        product.regularPrice > this.filters.maxPrice
      ) {
        return false;
      }

      // Brand filter
      if (this.filters.brand && product.brand !== this.filters.brand) {
        return false;
      }

      return true;
    });
  }

  sortProducts(products) {
    return products.sort((a, b) => {
      switch (this.sortBy) {
        case "price-low":
          return a.regularPrice - b.regularPrice;
        case "price-high":
          return b.regularPrice - a.regularPrice;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }

  paginateProducts(products) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return products.slice(startIndex, startIndex + this.itemsPerPage);
  }

  renderProducts(products) {
    const container = document.getElementById("shopProductsContainer");
    if (!container) return;

    container.className = `row g-4 ${
      this.currentView === "list" ? "list-view" : ""
    }`;

    const productsHTML = products
      .map((product) => {
        return this.currentView === "list"
          ? this.createListViewCard(product)
          : this.createGridViewCard(product);
      })
      .join("");

    container.innerHTML = productsHTML;
  }

  createGridViewCard(product) {
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
              ? `<span class="badge bg-danger sale-badge">-${discount}%</span>`
              : ""
          }
          <img src="${product.main_image}" class="card-img-top" alt="${
      product.name
    }">
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
                    <span class="fw-bold">GHS${product.regularPrice.toFixed(
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

  createListViewCard(product) {
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
      ? stripHtml(product.description).substring(0, 200)
      : "";

    return `
    <div class="col-12">
      <div class="card product-card h-100 border-0">
        <div class="row g-0">
          <div class="col-md-3 position-relative">
            ${
              discount
                ? `<span class="badge bg-danger sale-badge">-${discount}%</span>`
                : ""
            }
            <img src="${product.main_image}" class="card-img-top h-100" alt="${
      product.name
    }">
          </div>
          <div class="col-md-9">
            <div class="card-body d-flex flex-column h-100">
              <h5 class="card-title mb-2">${product.name}</h5>
              <p class="card-text flex-grow-1">${description}</p>
              <div class="d-flex justify-content-between align-items-center mt-auto">
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
                      <span class="fw-bold">GHS${product.regularPrice.toFixed(
                        2
                      )}</span>
                    `
                  }
                </div>
                <button class="btn btn-primary btn-sm add-to-cart-btn" 
                  data-product='${JSON.stringify(product)}'>
                  <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  updateProductCount(count) {
    const countElement = document.getElementById("productCount");
    if (countElement) {
      countElement.textContent = `${count} Products`;
    }
  }

  renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    let paginationHTML = "";

    // Previous button
    paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" data-page="${
                  this.currentPage - 1
                }">Previous</a>
            </li>
        `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
                <li class="page-item ${this.currentPage === i ? "active" : ""}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
    }

    // Next button
    paginationHTML += `
            <li class="page-item ${
              this.currentPage === totalPages ? "disabled" : ""
            }">
                <a class="page-link" href="#" data-page="${
                  this.currentPage + 1
                }">Next</a>
            </li>
        `;

    pagination.innerHTML = paginationHTML;

    // Add click events to pagination links
    pagination.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.loadProducts();
          window.scrollTo(0, 0);
        }
      });
    });
  }

  updateViewButtons() {
    const buttons = document.querySelectorAll("[data-view]");
    buttons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.view === this.currentView
      );
    });
  }
}

// Initialize shop manager
const shopManager = new ShopManager();

// Load products when the page loads
document.addEventListener("DOMContentLoaded", () => {
  shopManager.loadProducts();
});
