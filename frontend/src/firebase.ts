import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// For demo purposes, we're using mock values when env variables are not set
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  // Use a valid URL format for the database
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abc123def456"
};

// Initialize Firebase with error handling
let app: FirebaseApp | null = null;
let database: Database | null = null;
let messaging: Messaging | null = null;
let auth: Auth | null = null;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  
  // Only initialize messaging in browser environment
  if (typeof window !== 'undefined') {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error);
    }
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Provide fallback implementation
  app = null;
  database = null;
  messaging = null;
  auth = null;
}

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.log('Firebase messaging not available');
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM token
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY || undefined
        });
        
        if (currentToken) {
          // Send the token to your server
          console.log('FCM token:', currentToken);
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      } catch (error) {
        console.error("Error getting messaging token:", error);
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Validate email domain
export const isValidEmailDomain = (email: string): boolean => {
  const validDomains = ['gmail.com', 'icloud.com', 'yahoo.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  return validDomains.includes(domain);
};

export { app, database, messaging, auth }; 