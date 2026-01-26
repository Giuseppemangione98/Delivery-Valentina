/**
 * Configurazione Firebase per Valentina Delivery
 * Inizializza l'app Firebase con le credenziali del progetto
 */

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCSehFnjU8_AHEmwuDWVuHTt9ToMXlDGeY",
  authDomain: "deliveryvalentina-b5ea7.firebaseapp.com",
  projectId: "deliveryvalentina-b5ea7",
  storageBucket: "deliveryvalentina-b5ea7.firebasestorage.app",
  messagingSenderId: "313926139790",
  appId: "1:313926139790:web:afbb40d7de3b9aa7f12edf"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

export default app;
