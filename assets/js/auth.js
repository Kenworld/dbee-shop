import { auth } from "./firebase-config.js";

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.loginModal = new bootstrap.Modal(
      document.getElementById("loginModal")
    );
    this.registerModal = new bootstrap.Modal(
      document.getElementById("registerModal")
    );
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Login form submission
    document.getElementById("loginForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.login();
    });

    // Register form submission
    document.getElementById("registerForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.register();
    });

    // Modal toggle links
    document
      .getElementById("showRegisterModal")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.loginModal.hide();
        this.registerModal.show();
      });

    document
      .getElementById("showLoginModal")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.registerModal.hide();
        this.loginModal.show();
      });

    // Login/Register buttons in navbar
    document.getElementById("loginBtn")?.addEventListener("click", () => {
      this.loginModal.show();
    });

    document.getElementById("registerBtn")?.addEventListener("click", () => {
      this.registerModal.show();
    });
  }

  async login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorElement = document.getElementById("loginError");

    try {
      // TODO: Implement Firebase authentication
      // const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      // this.currentUser = userCredential.user;

      // For now, simulate login
      this.currentUser = {
        email,
        displayName: "Test User",
      };

      this.updateUIForAuthState();
      this.loginModal.hide();
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.classList.remove("d-none");
    }
  }

  async register() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const password = document.getElementById("registerPassword").value;
    const errorElement = document.getElementById("registerError");

    try {
      // TODO: Implement Firebase authentication
      // const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      // await userCredential.user.updateProfile({ displayName: name });
      // await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
      //     fullname: name,
      //     email,
      //     phoneNumber: phone,
      //     createdAt: firebase.firestore.FieldValue.serverTimestamp()
      // });

      // For now, simulate registration
      this.currentUser = {
        email,
        displayName: name,
      };

      this.updateUIForAuthState();
      this.registerModal.hide();
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.classList.remove("d-none");
    }
  }

  async logout() {
    try {
      // TODO: Implement Firebase logout
      // await firebase.auth().signOut();
      this.currentUser = null;
      this.updateUIForAuthState();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  updateUIForAuthState() {
    const profileDropdown = document.querySelector(".dropdown-menu");
    if (!profileDropdown) return;

    if (this.currentUser) {
      profileDropdown.innerHTML = `
                <li><span class="dropdown-item-text">Welcome, ${this.currentUser.displayName}</span></li>
                <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
                <li><a class="dropdown-item" href="orders.html">My Orders</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
            `;

      document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    } else {
      profileDropdown.innerHTML = `
                <li><a class="dropdown-item" href="#" id="loginBtn">Login</a></li>
                <li><a class="dropdown-item" href="#" id="registerBtn">Create Account</a></li>
            `;

      // Reinitialize login/register button listeners
      this.initializeEventListeners();
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Initialize auth manager
const authManager = new AuthManager();
