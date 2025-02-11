class ProductDetailManager {
  constructor() {
    this.product = null;
    this.quantity = 1;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Quantity controls
    document
      .getElementById("decreaseQuantity")
      ?.addEventListener("click", () => this.updateQuantity(-1));
    document
      .getElementById("increaseQuantity")
      ?.addEventListener("click", () => this.updateQuantity(1));
    document
      .getElementById("quantity")
      ?.addEventListener("change", (e) => this.setQuantity(e.target.value));

    // Add to cart button
    document
      .getElementById("addToCartBtn")
      ?.addEventListener("click", () => this.addToCart());

    // Thumbnail clicks
    document
      .getElementById("thumbnailContainer")
      ?.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") {
          this.updateMainImage(e.target.src);
          this.updateThumbnailActive(e.target);
        }
      });
  }

  async loadProduct() {
    try {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("id");

      if (!productId) {
        window.location.href = "shop.html";
        return;
      }

      // TODO: Replace with actual Firebase fetch
      const response = await fetch("assets/data/products.json");
      const data = await response.json();
      this.product = data.products.find((p) => p.id === productId);

      if (!this.product) {
        window.location.href = "shop.html";
        return;
      }

      this.renderProduct();
      this.addToRecentlyViewed();
      this.loadRecentlyViewed();
    } catch (error) {
      console.error("Error loading product:", error);
    }
  }

  renderProduct() {
    // Update main image and thumbnails
    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
      mainImage.src = this.product.main_image;
      mainImage.alt = this.product.name;
    }

    this.renderThumbnails();

    // Update product info
    document.getElementById("productTitle").textContent = this.product.name;
    document.getElementById("shortDescription").textContent =
      this.product.shortDescription;
    document.getElementById("productSku").textContent =
      this.product.productCode;
    document.getElementById("productCategory").textContent =
      this.product.category;
    document.getElementById("productBrand").textContent = this.product.brand;

    // Update price display
    this.updatePriceDisplay();

    // Update tab contents
    document.getElementById("description").innerHTML =
      this.product.longDescription;
    // Add specifications and reviews tabs content here

    // Update page title and breadcrumb
    document.title = `${this.product.name} - Dbee's Kids Shop`;
    document.querySelector(".product-category").textContent =
      this.product.category;
  }

  renderThumbnails() {
    const container = document.getElementById("thumbnailContainer");
    if (!container || !this.product.other_images) return;

    const thumbnailsHTML = [
      this.product.main_image,
      ...this.product.other_images,
    ]
      .map(
        (image, index) => `
                <div class="col-3">
                    <img src="${image}" alt="Product view ${index + 1}" 
                         class="img-fluid ${index === 0 ? "active" : ""}">
                </div>
            `
      )
      .join("");

    container.innerHTML = thumbnailsHTML;
  }

  updateMainImage(src) {
    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
      mainImage.src = src;
    }
  }

  updateThumbnailActive(clickedThumb) {
    const thumbnails = document.querySelectorAll("#thumbnailContainer img");
    thumbnails.forEach((thumb) => thumb.classList.remove("active"));
    clickedThumb.classList.add("active");
  }

  updatePriceDisplay() {
    const currentPrice = document.getElementById("currentPrice");
    const originalPrice = document.getElementById("originalPrice");
    const discountBadge = document.getElementById("discountBadge");

    if (this.product.salePrice) {
      currentPrice.textContent = `$${this.product.salePrice}`;
      originalPrice.textContent = `$${this.product.regularPrice}`;
      const discount = Math.round(
        (1 - this.product.salePrice / this.product.regularPrice) * 100
      );
      discountBadge.textContent = `-${discount}%`;
      discountBadge.style.display = "inline";
    } else {
      currentPrice.textContent = `$${this.product.regularPrice}`;
      originalPrice.textContent = "";
      discountBadge.style.display = "none";
    }
  }

  updateQuantity(change) {
    const quantityInput = document.getElementById("quantity");
    if (!quantityInput) return;

    const newValue = parseInt(quantityInput.value) + change;
    this.setQuantity(newValue);
  }

  setQuantity(value) {
    const quantityInput = document.getElementById("quantity");
    if (!quantityInput) return;

    value = parseInt(value);
    if (isNaN(value) || value < 1) value = 1;

    quantityInput.value = value;
    this.quantity = value;
  }

  addToCart() {
    if (!this.product) return;

    cartManager.addItem(this.product, this.quantity);
    // Show success message or open cart
    const cartOffcanvas = new bootstrap.Offcanvas(
      document.getElementById("cartOffcanvas")
    );
    cartOffcanvas.show();
  }

  addToRecentlyViewed() {
    if (!this.product) return;

    let recentlyViewed = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );

    // Remove if already exists
    recentlyViewed = recentlyViewed.filter((p) => p.id !== this.product.id);

    // Add to start of array
    recentlyViewed.unshift({
      id: this.product.id,
      name: this.product.name,
      image: this.product.main_image,
      price: this.product.salePrice || this.product.regularPrice,
      viewedAt: new Date().toISOString(),
    });

    // Keep only last 4 items
    recentlyViewed = recentlyViewed.slice(0, 4);

    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  }

  async loadRecentlyViewed() {
    const recentlyViewed = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );
    const container = document.getElementById("recentlyViewedContainer");

    if (!container || recentlyViewed.length === 0) return;

    const productsHTML = recentlyViewed
      .filter((p) => p.id !== this.product.id) // Don't show current product
      .map(
        (product) => `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card product-card h-100 border-0">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text fw-bold">$${product.price}</p>
                            <a href="single-product.html?id=${product.id}" class="btn btn-outline-primary">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            `
      )
      .join("");

    container.innerHTML = productsHTML;
  }
}

// Initialize product detail manager
const productDetailManager = new ProductDetailManager();

// Load product when the page loads
document.addEventListener("DOMContentLoaded", () => {
  productDetailManager.loadProduct();
});
