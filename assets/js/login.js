class LoginManager {
  constructor() {
    this.form = document.getElementById("loginForm");
    this.emailInput = document.getElementById("loginEmail");
    this.passwordInput = document.getElementById("loginPassword");
    this.errorElement = document.getElementById("loginError");
    this.spinner = document.getElementById("loginSpinner");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Form submission
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Toggle password visibility
    this.togglePasswordBtn?.addEventListener("click", () => {
      const type = this.passwordInput.type === "password" ? "text" : "password";
      this.passwordInput.type = type;
      this.togglePasswordBtn.innerHTML = `<i class="fas fa-eye${
        type === "password" ? "" : "-slash"
      }"></i>`;
    });

    // Check if user is already logged in
    if (authManager.isAuthenticated()) {
      window.location.href = "index.html";
    }
  }

  async handleLogin() {
    if (!this.form.checkValidity()) {
      this.form.classList.add("was-validated");
      return;
    }

    this.setLoading(true);
    this.errorElement.classList.add("d-none");

    try {
      await authManager.login(this.emailInput.value, this.passwordInput.value);
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

// Initialize login manager
const loginManager = new LoginManager();
