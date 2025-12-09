import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// These variables are expected to be injected at runtime.
declare const __firebase_config: string;
declare const __app_id: string;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let isFirebaseInitialized = false;

try {
    const configStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
    if (configStr) {
        const firebaseConfig = JSON.parse(configStr);
        // A simple check for a valid config object. apiKey is essential.
        if (firebaseConfig && firebaseConfig.apiKey) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            isFirebaseInitialized = true;
        } else {
            console.warn('Firebase config is invalid. Real-time features will be disabled.');
        }
    } else {
        console.warn('Firebase config not found. Real-time features will be disabled.');
    }
} catch (e) {
    console.error('Failed to initialize Firebase', e);
}

export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

export { auth, db, isFirebaseInitialized };
