import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_kIGHwN-_bLhqp3aKMHJhxpFjUKEgE-U",
  authDomain: "aou-gpa-calculator.firebaseapp.com",
  projectId: "aou-gpa-calculator",
  storageBucket: "aou-gpa-calculator.firebasestorage.app",
  messagingSenderId: "793865161678",
  appId: "1:793865161678:web:c9e8015a101e3e20bef99f",
  measurementId: "G-EE967Y0X95"
};

// Initialize Firebase for server-side
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);