import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate config
const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value && key !== 'measurementId')
    .map(([key]) => key);

if (missingKeys.length > 0) {
    console.error(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Check your .env file.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Only initialize analytics if we have a measurementId and are in a browser environment
export const analytics = (typeof window !== 'undefined' && firebaseConfig.measurementId) 
    ? getAnalytics(app) 
    : null;

export default app
