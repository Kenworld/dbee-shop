class CheckoutManager {
  constructor() {
    this.currentStep = 0;
    this.steps = ["shippingStep", "paymentStep", "reviewStep"];
    this.shippingData = null;
    this.paymentData = null;
    this.initializeEventListeners();
    this.updateOrderSummary();
  }

  initializeEventListeners() {
    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
      window.location.href = "index.html";
      return;
    }

    // Shipping form submission
    document.getElementById("shippingForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleShippingSubmit();
    });

    // Payment form submission
    document.getElementById("paymentForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handlePaymentSubmit();
    });

    // Payment method change
    document
      .querySelectorAll('input[name="paymentMethod"]')
      .forEach((radio) => {
        radio.addEventListener("change", () => {
          const mpesaDetails = document.getElementById("mpesaDetails");
          mpesaDetails.style.display =
            radio.value === "mpesa" ? "block" : "none";
        });
      });
  }

  updateOrderSummary() {
    const summaryContainer = document.getElementById("orderSummaryItems");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("orderTotal");

    if (!summaryContainer || !subtotalElement || !totalElement) return;

    const itemsHTML = cartManager.items
      .map(
        (item) => `
            <div class="cart-item mb-3">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${
          item.name
        }" class="img-fluid me-2">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">Qty: ${item.quantity}</small>
                        <div class="fw-bold">$${(
                          item.price * item.quantity
                        ).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    summaryContainer.innerHTML = itemsHTML;

    const subtotal = cartManager.getTotal();
    const shipping = 10; // Fixed shipping cost
    const total = subtotal + shipping;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
  }

  handleShippingSubmit() {
    const form = document.getElementById("shippingForm");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    this.shippingData = {
      name: document.getElementById("shippingName").value,
      address: document.getElementById("shippingAddress").value,
      city: document.getElementById("shippingCity").value,
      region: document.getElementById("shippingRegion").value,
      phone: document.getElementById("shippingPhone").value,
    };

    this.nextStep();
  }

  handlePaymentSubmit() {
    const form = document.getElementById("paymentForm");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;
    this.paymentData = {
      method: paymentMethod,
      mpesaPhone:
        paymentMethod === "mpesa"
          ? document.getElementById("mpesaPhone").value
          : null,
    };

    this.updateReviewStep();
    this.nextStep();
  }

  updateReviewStep() {
    document.getElementById("reviewShippingAddress").innerHTML = `
            ${this.shippingData.name}<br>
            ${this.shippingData.address}<br>
            ${this.shippingData.city}, ${this.shippingData.region}<br>
            Phone: ${this.shippingData.phone}
        `;

    document.getElementById("reviewPaymentMethod").innerHTML =
      this.paymentData.method === "mpesa"
        ? `M-Pesa (${this.paymentData.mpesaPhone})`
        : "Cash on Delivery";

    const orderItemsContainer = document.getElementById("reviewOrderItems");
    orderItemsContainer.innerHTML = cartManager.items
      .map(
        (item) => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    ${item.name} x ${item.quantity}
                </div>
                <div class="fw-bold">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `
      )
      .join("");
  }

  async placeOrder() {
    try {
      const orderData = {
        userId: authManager.currentUser.uid,
        items: cartManager.items,
        shipping: this.shippingData,
        payment: this.paymentData,
        total: cartManager.getTotal() + 10, // Including shipping
        status: "pending",
        orderDate: new Date().toISOString(),
      };

      // TODO: Implement Firebase order creation
      // await firebase.firestore().collection('orders').add(orderData);

      // Clear cart and redirect to success page
      cartManager.clearCart();
      window.location.href = "order-success.html";
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      document
        .getElementById(this.steps[this.currentStep])
        .classList.remove("active");
      document
        .getElementById(this.steps[this.currentStep])
        .classList.add("d-none");
      this.currentStep++;
      document
        .getElementById(this.steps[this.currentStep])
        .classList.remove("d-none");
      document
        .getElementById(this.steps[this.currentStep])
        .classList.add("active");
      this.updateProgress();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      document
        .getElementById(this.steps[this.currentStep])
        .classList.remove("active");
      document
        .getElementById(this.steps[this.currentStep])
        .classList.add("d-none");
      this.currentStep--;
      document
        .getElementById(this.steps[this.currentStep])
        .classList.remove("d-none");
      document
        .getElementById(this.steps[this.currentStep])
        .classList.add("active");
      this.updateProgress();
    }
  }

  updateProgress() {
    const progress = (this.currentStep / (this.steps.length - 1)) * 100;
    document.querySelector(".progress-bar").style.width = `${progress}%`;

    document.querySelectorAll(".step").forEach((step, index) => {
      step.classList.toggle("active", index <= this.currentStep);
    });
  }
}

// Initialize checkout manager
const checkoutManager = new CheckoutManager();
