const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Create mock implementations for when Firebase fails to initialize
const mockDb = {
  ref: () => ({
    push: (data) => Promise.resolve({ key: `mock-${Date.now()}` }),
    set: (data) => Promise.resolve(),
    once: () => Promise.resolve({ val: () => [] })
  })
};

const mockMessaging = {
  send: () => Promise.resolve('mock-message-id'),
  sendMulticast: () => Promise.resolve({ successCount: 0, failureCount: 0 })
};

// Default to mock implementations
let db = mockDb;
let messaging = mockMessaging;
let firebaseInitialized = false;

// Initialize Firebase Admin
// In a real app, you would use environment variables for these values
try {
  // Only attempt to initialize if we have the required environment variables
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY) {
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    db = admin.database();
    messaging = admin.messaging();
    firebaseInitialized = true;
    console.log('Firebase Admin initialized successfully');
  } else {
    console.log('Firebase credentials not found in environment variables. Using mock implementation.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.log('Using mock implementation');
}

// Function to send push notification
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!firebaseInitialized) {
    console.log('Mock: Sending notification to token:', token);
    return { messageId: `mock-${Date.now()}` };
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };
    
    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    return { messageId: `error-${Date.now()}` };
  }
};

// Function to send notifications to multiple tokens
const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  if (!firebaseInitialized) {
    console.log(`Mock: Sending notification to ${tokens.length} tokens`);
    return { successCount: tokens.length, failureCount: 0 };
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens
    };
    
    const response = await messaging.sendMulticast(message);
    console.log(`${response.successCount} messages were sent successfully`);
    return response;
  } catch (error) {
    console.error('Error sending multicast messages:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
};

module.exports = {
  admin: firebaseInitialized ? admin : null,
  db,
  messaging,
  sendPushNotification,
  sendMulticastNotification,
  firebaseInitialized
}; 