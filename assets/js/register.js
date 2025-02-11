class RegisterManager {
  constructor() {
    this.form = document.getElementById("registerForm");
    this.nameInput = document.getElementById("registerName");
    this.emailInput = document.getElementById("registerEmail");
    this.phoneInput = document.getElementById("registerPhone");
    this.passwordInput = document.getElementById("registerPassword");
    this.errorElement = document.getElementById("registerError");
    this.spinner = document.getElementById("registerSpinner");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Form submission
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Toggle password visibility
    this.togglePasswordBtn?.addEventListener("click", () => {
      const type = this.passwordInput.type === "password" ? "text" : "password";
      this.passwordInput.type = type;
      this.togglePasswordBtn.innerHTML = `<i class="fas fa-eye${
        type === "password" ? "" : "-slash"
      }"></i>`;
    });

    // Password validation
    this.passwordInput?.addEventListener("input", () => {
      if (this.passwordInput.value.length < 6) {
        this.passwordInput.setCustomValidity(
          "Password must be at least 6 characters long"
        );
      } else {
        this.passwordInput.setCustomValidity("");
      }
    });

    // Check if user is already logged in
    if (authManager.isAuthenticated()) {
      window.location.href = "index.html";
    }
  }

  async handleRegister() {
    if (!this.form.checkValidity()) {
      this.form.classList.add("was-validated");
      return;
    }

    this.setLoading(true);
    this.errorElement.classList.add("d-none");

    try {
      await authManager.register(
        this.emailInput.value,
        this.passwordInput.value,
        this.nameInput.value,
        this.phoneInput.value
      );
      window.location.href = "index.html";
    } catch (error) {
      this.errorElement.textContent = error.message;
      this.errorElement.classList.remove("d-none");
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    submitBtn.disabled = isLoading;
    this.spinner.classList.toggle("d-none", !isLoading);
  }
}

// Initialize register manager
const registerManager = new RegisterManager();
