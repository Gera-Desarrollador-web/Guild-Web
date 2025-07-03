import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 👈 importa Firestore

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDr6SbLuI3wwX4D9tYmXVia3cHhqhq2E08",
  authDomain: "guild-manager-c7cc9.firebaseapp.com",
  projectId: "guild-manager-c7cc9",
  storageBucket: "guild-manager-c7cc9.firebasestorage.app",
  messagingSenderId: "191823531964",
  appId: "1:191823531964:web:86df989d71722243b2e5b9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore
export const db = getFirestore(app); // 👈 esta línea es la que te faltaba
