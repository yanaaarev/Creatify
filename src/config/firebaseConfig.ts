// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKNqDOEP6mKlCAYrFMOz8fUXY_88g3xHk",
  authDomain: "creatify-e0a9b.firebaseapp.com",
  projectId: "creatify-e0a9b",
  storageBucket: "creatify-e0a9b.firebasestorage.app",
  messagingSenderId: "1015444798884",
  appId: "1:1015444798884:web:3434c8d62025bf33271531",
  measurementId: "G-YSWW09WR7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); 
export const db = getFirestore(app);

// ✅ Set Persistent Authentication
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("❌ Error setting persistence:", error);
  });

  export { analytics };