import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Web config for Firebase project yolohome-c2ce4 (same data as the Android app).
const firebaseConfig = {
  apiKey: "AIzaSyBZOCUFdmd7xZsoJCGHBwYE_H70YzT3Bew",
  authDomain: "yolohome-c2ce4.firebaseapp.com",
  projectId: "yolohome-c2ce4",
  storageBucket: "yolohome-c2ce4.firebasestorage.app",
  messagingSenderId: "248053372754",
  appId: "1:248053372754:web:13de72675d2b2b2fea4c8b",
  measurementId: "G-47SZ2DSLZJ",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Offline-first persistent cache (mirrors the Android persistent cache).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
