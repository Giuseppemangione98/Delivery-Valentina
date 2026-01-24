self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Nuovo Ordine!', body: 'Controlla l\'app ❤️' };
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});