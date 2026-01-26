# Firebase Cloud Messaging - Setup Completato ✅

## 📦 Installazione Dipendenze

```bash
npm install firebase
```

## 📁 File Creati

### 1. `firebase/config.ts`
Configurazione Firebase con le credenziali del progetto.

### 2. `firebase/messaging.ts`
Gestione completa delle notifiche push:
- `requestNotificationPermission()` - Richiede permesso e ottiene token FCM
- `onMessageListener()` - Ascolta notifiche quando app è aperta
- `getSavedToken()` - Recupera token salvato
- `isNotificationPermissionGranted()` - Verifica permesso

### 3. `public/firebase-messaging-sw.js`
Service Worker per gestire notifiche in background:
- Gestisce notifiche quando app è chiusa/in background
- Mostra notifiche con icona e azioni
- Gestisce click sulle notifiche per aprire l'app

## 🔧 Integrazione Completata

### ✅ Splash Screen (App.tsx)
- Al click su "Entra", richiede permesso notifiche Firebase
- Salva token FCM in localStorage
- Mostra toast informativo se permesso negato (non bloccante)

### ✅ Service Worker (index.tsx)
- Registra automaticamente `firebase-messaging-sw.js` all'avvio
- Log in console per debugging

### ✅ Notifiche Foreground (App.tsx)
- Ascolta notifiche quando app è aperta
- Mostra toast con messaggio della notifica
- Mantiene design esistente (zinc-950, rose-600)

## 🧪 Testing

### 1. Verifica Token FCM
Apri la console del browser dopo aver cliccato "Entra":
```
🔑 Token FCM ottenuto: [token]
```

### 2. Verifica Service Worker
DevTools > Application > Service Workers:
- Dovresti vedere `firebase-messaging-sw.js` registrato

### 3. Test Notifica
Usa Firebase Console o un tool per inviare una notifica di test:
- Il token FCM è salvato in `localStorage.getItem('fcm_token')`
- Copia il token e usalo per inviare notifiche

## 📱 Invio Notifiche

### Da Firebase Console:
1. Vai su Firebase Console > Cloud Messaging
2. Crea nuova campagna
3. Inserisci il token FCM (dalla console del browser)
4. Invia notifica

### Da Backend (esempio):
```javascript
// Esempio con Firebase Admin SDK
const admin = require('firebase-admin');
const message = {
  notification: {
    title: 'Nuovo Ordine! ❤️',
    body: 'Giuseppe ha un messaggio per te'
  },
  token: 'FCM_TOKEN_DAL_BROWSER'
};
admin.messaging().send(message);
```

## 🎨 Design Mantenuto

- ✅ Colori: zinc-950 background, rose-600 accent
- ✅ Toast: Stile coerente con design esistente
- ✅ Non interferisce con polling/banner ordini esistenti
- ✅ Gestione errori graceful (non blocca l'app)

## 🔍 Debugging

### Console Logs:
- `✅ Permesso notifiche concesso`
- `🔑 Token FCM ottenuto: [token]`
- `📨 Notifica ricevuta in foreground: [payload]`
- `✅ Firebase Messaging Service Worker registrato`

### Problemi Comuni:

1. **Token non ottenuto:**
   - Verifica che il service worker sia registrato
   - Controlla che VAPID_KEY sia corretta
   - Verifica permesso notifiche nel browser

2. **Notifiche non arrivano:**
   - Verifica token FCM valido
   - Controlla che Firebase config sia corretta
   - Verifica che il service worker sia attivo

3. **Service Worker non si registra:**
   - Verifica che il file `public/firebase-messaging-sw.js` esista
   - Controlla console per errori
   - Verifica che il server serva file statici da `/public`

## 📝 Note Importanti

- Il token FCM è salvato in `localStorage` con chiave `fcm_token`
- Le notifiche funzionano solo su HTTPS (o localhost per sviluppo)
- Il permesso negato non blocca l'uso dell'app
- Le notifiche in foreground mostrano un toast, quelle in background usano il service worker

## 🚀 Prossimi Passi

1. Installa Firebase: `npm install firebase`
2. Testa la richiesta permesso (click "Entra")
3. Copia il token FCM dalla console
4. Invia una notifica di test da Firebase Console
5. Verifica che le notifiche arrivino correttamente
