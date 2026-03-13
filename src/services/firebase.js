import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importante para la DB
import { getAuth } from "firebase/auth";           // Importante para Roles
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };

const firebaseConfig = {
  apiKey: "AIzaSyCED5iY5wOfdxFZBpoefDY9V8x_yACtM3o",
  authDomain: "taller-mecanico-1e2eb.firebaseapp.com",
  projectId: "taller-mecanico-1e2eb",
  storageBucket: "taller-mecanico-1e2eb.firebasestorage.app",
  messagingSenderId: "309228335981",
  appId: "1:309228335981:web:55d4eb260be3d688a02064",
  measurementId: "G-W3T6MVNPHV"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en App.jsx
export const db = getFirestore(app);
export const auth = getAuth(app);