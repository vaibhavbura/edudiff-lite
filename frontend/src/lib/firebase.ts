import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export interface UserData {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  createdAt: Date | null;
  lastSignInAt: ReturnType<typeof serverTimestamp>;
}

export async function storeUserData(userData: UserData): Promise<void> {
  try {
    const userRef = doc(db, 'users', userData.clerkId);
    await setDoc(userRef, {
      ...userData,
      lastSignInAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('User data stored successfully in Firestore');
  } catch (error) {
    console.error('Error storing user data in Firestore:', error);
    throw error;
  }
}

export { db };
