import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

function fromEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  if (value && value.trim().length > 0) return value;
  return fallback;
}

const firebaseConfig = {
  apiKey: fromEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'AIzaSyBNSnSvjYsDVjJnNaHsWMCniV7auHVPZG4')!,
  authDomain: fromEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'tripplanner-3b1ef.firebaseapp.com')!,
  projectId: fromEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'tripplanner-3b1ef')!,
  storageBucket: fromEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'tripplanner-3b1ef.appspot.com')!,
  messagingSenderId: fromEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '649679824368')!,
  appId: fromEnv('NEXT_PUBLIC_FIREBASE_APP_ID', '1:649679824368:web:f123a75bfc518e6d22a935')!,
  // Optional:
  databaseURL: fromEnv('NEXT_PUBLIC_FIREBASE_DATABASE_URL', 'https://tripplanner-3b1ef.firebaseio.com'),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let appInstance: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return appInstance;
}

export const app = getFirebaseApp();

export const db: Firestore = getFirestore(app);


