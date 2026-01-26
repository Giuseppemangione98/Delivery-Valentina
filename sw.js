// Service Worker for Valentina Delivery PWA

// === FIREBASE CLOUD MESSAGING ===
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCSehFnjU8_AHEmwuDWVuHTt9ToMXlDGeY",
  authDomain: "deliveryvalentina-b5ea7.firebaseapp.com",
  projectId: "deliveryvalentina-b5ea7",
  storageBucket: "deliveryvalentina-b5ea7.firebasestorage.app",
  messagingSenderId: "313926139790",
  appId: "1:313926139790:web:afbb40d7de3b9aa7f12edf"
});

const messaging = firebase.messaging();

// Gestione notifiche Firebase in background
self.addEventListener('push', function(event) {
  console.log('[SW] Push event ricevuto:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
      console.log('[SW] Dati notifica:', notificationData);
    }
  } catch (e) {
    console.log('[SW] Errore parsing notifica:', e);
  }
  
  const title = notificationData.notification?.title || 
                notificationData.data?.title || 
                '🍕 Nuovo Ordine!';
  
  const options = {
    body: notificationData.notification?.body || 
          notificationData.data?.body || 
          'Hai un nuovo ordine da gestire',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'delivery-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: notificationData.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
// === FINE FIREBASE ===

const CACHE_NAME = 'valentina-delivery-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets for offline use
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('Service Worker: Cache failed', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(function() {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If app is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});