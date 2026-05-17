// src/firebase/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Replace the placeholder values below with your own Firebase project config.
// Firebase Console → Project Settings → "Your apps" → SDK setup → Config
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmQjLXwoWepC5oN6oWJv6OSuNmxVmEC9A",
  authDomain: "notes-sharing-app-ff78b.firebaseapp.com",
  projectId: "notes-sharing-app-ff78b",
  storageBucket: "notes-sharing-app-ff78b.firebasestorage.app",
  messagingSenderId: "419464425108",
  appId: "1:419464425108:web:d5215e14889ceb1bf7ce81",
  measurementId: "G-TRS7W4J3FQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
