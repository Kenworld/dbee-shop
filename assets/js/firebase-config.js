// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9zpMXYhN82wBiny75T3Rf32U7l55CEu0",
  authDomain: "deebee-shop.firebaseapp.com",
  projectId: "deebee-shop",
  storageBucket: "deebee-shop.appspot.com",
  messagingSenderId: "388424027848",
  appId: "1:388424027848:web:16a9062a542dd2d0101ffd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export the auth and db instances for use in other files
export { auth, db };
