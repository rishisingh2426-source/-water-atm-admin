import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtZ0f6DLzYATwB21ub8hV7LWlBTw4glfU",
  authDomain: "water-atm-e1b36.firebaseapp.com",
  projectId: "water-atm-e1b36",
  storageBucket: "water-atm-e1b36.firebasestorage.app",
  messagingSenderId: "500412422019",
  appId: "1:500412422019:web:ad7d27c1023217277ac8b6",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);