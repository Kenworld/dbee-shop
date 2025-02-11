class OrderSuccessManager {
  constructor() {
    this.orderData = null;
    this.loadOrderData();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
      window.location.href = "index.html";
      return;
    }
  }

  loadOrderData() {
    // In a real application, you would fetch this from the server
    // For now, we'll use localStorage to simulate the order data
    const orderData = localStorage.getItem("lastOrder");
    if (orderData) {
      this.orderData = JSON.parse(orderData);
      this.renderOrderDetails();
    } else {
      // If no order data, redirect to home
      window.location.href = "index.html";
    }
  }

  renderOrderDetails() {
    // Set order number
    document.getElementById("orderNumber").textContent = `#${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Render order items
    const orderItemsContainer = document.getElementById("orderItems");
    if (orderItemsContainer && this.orderData.items) {
      orderItemsContainer.innerHTML = this.orderData.items
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

    // Set totals
    const subtotal = this.orderData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("orderTotal").textContent = `$${(
      subtotal + 10
    ).toFixed(2)}`; // Including shipping

    // Set shipping address
    if (this.orderData.shipping) {
      document.getElementById("shippingAddress").innerHTML = `
                ${this.orderData.shipping.name}<br>
                ${this.orderData.shipping.address}<br>
                ${this.orderData.shipping.city}, ${this.orderData.shipping.region}<br>
                Phone: ${this.orderData.shipping.phone}
            `;
    }

    // Set payment method
    if (this.orderData.payment) {
      document.getElementById("paymentMethod").textContent =
        this.orderData.payment.method === "mpesa"
          ? `M-Pesa (${this.orderData.payment.mpesaPhone})`
          : "Cash on Delivery";
    }
  }
}

// Initialize order success manager
const orderSuccessManager = new OrderSuccessManager();
