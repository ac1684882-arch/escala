/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGvjdmEiRBJuZSeRG5QcI1zpwitzboyuk",
  authDomain: "escaladosfuncionarios.firebaseapp.com",
  projectId: "escaladosfuncionarios",
  storageBucket: "escaladosfuncionarios.firebasestorage.app",
  messagingSenderId: "498910505506",
  appId: "1:498910505506:web:19f6ac81bbd9764fb1f87b",
  measurementId: "G-4F0BH08P1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
