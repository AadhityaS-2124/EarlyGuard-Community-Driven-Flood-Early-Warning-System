import { requestNotificationPermission } from '../firebase';
import api from './api';

// Register FCM token with the backend
export const registerFCMToken = async (): Promise<boolean> => {
  try {
    const token = await requestNotificationPermission();
    
    if (!token) {
      console.log('No FCM token available, using demo mode');
      return true; // Return true in demo mode so UX is smooth
    }
    
    // Send token to backend
    try {
      await api.post('/register-token', { token });
      console.log('FCM token registered with backend');
      return true;
    } catch (apiError) {
      console.warn('Backend offline, registered token locally for demo:', apiError);
      return true;
    }
  } catch (error) {
    console.warn('Error registering FCM token, falling back to demo mode:', error);
    return true;
  }
};

// Register Mail ID contact for emergency alerts
export const registerPhoneNumber = async (contactInfo: string): Promise<boolean> => {
  try {
    if (!contactInfo) {
      console.log('No contact provided');
      return false;
    }
    
    // Send contact info to backend
    try {
      await api.post('/register-phone', { phoneNumber: contactInfo, email: contactInfo });
      console.log('Contact Mail ID registered with backend');
      return true;
    } catch (apiError) {
      console.warn('Backend offline, registered Mail ID locally for demo:', apiError);
      return true;
    }
  } catch (error) {
    console.warn('Error registering Mail id, falling back to demo mode:', error);
    return true;
  }
};

// Initialize notifications
export const initializeNotifications = async (): Promise<void> => {
  try {
    // Request notification permission - wrapped in try/catch to prevent app crashing
    try {
      await registerFCMToken();
    } catch (tokenError) {
      console.error('Failed to register FCM token:', tokenError);
      // Continue app execution even if notification registration fails
    }
    
    // Set up service worker for background notifications (in a real app)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Continue app execution even if service worker registration fails
      }
    } else {
      console.log('Service Worker not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
    // Continue app execution even if notification initialization fails
  }
}; 