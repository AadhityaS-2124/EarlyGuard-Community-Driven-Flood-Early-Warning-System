// Import and configure the Firebase SDK
try {
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

  // Your web app's Firebase configuration
  // Using demo values that will work for development
  const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    databaseURL: "https://demo-project-default-rtdb.firebaseio.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
  };

  try {
    firebase.initializeApp(firebaseConfig);
    
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification.title || 'EarlyGuard Alert';
      const notificationOptions = {
        body: payload.notification.body || 'New alert received',
        icon: '/logo.svg',
        badge: '/logo.svg',
        data: payload.data || {}
      };
      
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Firebase initialization error:', error);
  }
} catch (error) {
  console.error('[firebase-messaging-sw.js] Service worker error:', error);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  // This will open the app and pass the data from the notification
  const alertId = event.notification.data?.alertId;
  const urlToOpen = alertId 
    ? new URL(`/alerts?id=${alertId}`, self.location.origin).href
    : new URL('/', self.location.origin).href;
  
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    // Check if there is already a window/tab open with the target URL
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      // If so, focus on it
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    // If not, open a new window/tab
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });
  
  event.waitUntil(promiseChain);
}); 