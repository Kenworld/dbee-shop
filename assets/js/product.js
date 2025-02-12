// Import Firebase and other dependencies
import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { cartManager } from "./main.js";

class ProductPage {
  constructor() {
    this.product = null;
    this.quantity = 1;
    this.initializeEventListeners();
    this.loadProduct();
  }

  async loadProduct() {
    try {
      // Get product ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("id");

      if (!productId) {
        window.location.href = "shop.html";
        return;
      }

      // Fetch product from Firestore
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        window.location.href = "shop.html";
        return;
      }

      this.product = {
        id: productSnap.id,
        ...productSnap.data(),
      };

      this.renderProduct();
    } catch (error) {
      console.error("Error loading product:", error);
      window.location.href = "shop.html";
    }
  }

  renderProduct() {
    // Update breadcrumb
    document.querySelector(".product-category").textContent =
      this.product.category;

    // Update main image
    const mainImage = document.getElementById("mainImage");
    mainImage.src = this.product.main_image;
    mainImage.alt = this.product.name;

    // Update thumbnails
    const thumbnailContainer = document.getElementById("thumbnailContainer");
    if (this.product.other_images && this.product.other_images.length > 0) {
      const thumbnailsHTML = this.product.other_images
        .map(
          (image, index) => `
          <div class="col-3">
            <img src="${image}" alt="${this.product.name} ${index + 1}" 
                class="img-fluid thumbnail" onclick="switchMainImage('${image}')">
          </div>
        `
        )
        .join("");
      thumbnailContainer.innerHTML = thumbnailsHTML;
    }

    // Update product info
    document.getElementById("productTitle").textContent = this.product.name;

    // Update prices
    const currentPrice = document.getElementById("currentPrice");
    const originalPrice = document.getElementById("originalPrice");
    const discountBadge = document.getElementById("discountBadge");

    if (this.product.salePrice) {
      currentPrice.textContent = `GHS ${this.product.salePrice.toFixed(2)}`;
      originalPrice.textContent = `GHS ${this.product.regularPrice.toFixed(2)}`;
      const discount = Math.round(
        (1 - this.product.salePrice / this.product.regularPrice) * 100
      );
      discountBadge.textContent = `-${discount}%`;
      discountBadge.classList.remove("d-none");
    } else {
      currentPrice.textContent = `GHS ${this.product.regularPrice.toFixed(2)}`;
      originalPrice.textContent = "";
      discountBadge.classList.add("d-none");
    }

    // Update description tab
    document.getElementById("description").innerHTML =
      this.product.description || "";
  }

  initializeEventListeners() {
    // Quantity selector
    const quantityInput = document.getElementById("quantity");
    const incrementBtn = document.getElementById("incrementQuantity");
    const decrementBtn = document.getElementById("decrementQuantity");

    if (quantityInput && incrementBtn && decrementBtn) {
      incrementBtn.addEventListener("click", () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      });

      decrementBtn.addEventListener("click", () => {
        const newValue = parseInt(quantityInput.value) - 1;
        if (newValue >= 1) {
          quantityInput.value = newValue;
        }
      });
    }

    // Add to cart button
    const addToCartBtn = document.getElementById("addToCartBtn");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        const quantity = parseInt(document.getElementById("quantity").value);
        cartManager.addItem(this.product, quantity);

        // Show feedback
        const toast = new bootstrap.Toast(document.createElement("div"));
        toast.show();
      });
    }
  }
}

// Initialize product page
const productPage = new ProductPage();

// Function to switch main image (called from thumbnail onclick)
window.switchMainImage = function (imageSrc) {
  const mainImage = document.getElementById("mainImage");
  mainImage.src = imageSrc;
};
