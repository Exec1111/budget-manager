// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdzEUyDU_XGo2IbvjE24Wn9_b9V2jaQFU",
  authDomain: "budgetplanner-94aa9.firebaseapp.com",
  projectId: "budgetplanner-94aa9",
  storageBucket: "budgetplanner-94aa9.firebasestorage.app",
  messagingSenderId: "853150201518",
  appId: "1:853150201518:web:288b9c2d5715c4cbe2df3f",
  measurementId: "G-XGSHVB7M8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;