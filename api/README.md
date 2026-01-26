# Server Express - Valentina Delivery API

## Installazione

```bash
npm install express cors dotenv firebase-admin
```

## Configurazione

Crea un file `.env` nella cartella `api/` con:

```env
PORT=3001
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@deliveryvalentina-b5ea7.iam.gserviceaccount.com"
BACKOFFICE_FCM_TOKEN="token_fcm_del_backoffice"
```

## Avvio Server

```bash
# Produzione
npm run server

# Sviluppo (con nodemon per auto-reload)
npm run server:dev
```

## Endpoint

### POST `/api/ordine`
Riceve ordini da Valentina e invia notifica FCM al backoffice.

**Request Body:**
```json
{
  "messaggio": "Messaggio opzionale",
  "items": [
    { "name": "Pizza", "quantity": 2, "emoji": "🍕" }
  ],
  "total": 25
}
```

**Response:**
```json
{
  "success": true,
  "risposta": "Amore mio! Ho ricevuto il tuo ordine..."
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T...",
  "service": "Valentina Delivery API"
}
```

## Note

- Il server è su porta 3001 (configurabile con variabile PORT)
- CORS è abilitato per tutte le origini
- Le notifiche FCM sono opzionali (non bloccano la risposta se falliscono)
- Il server supporta graceful shutdown (SIGTERM/SIGINT)
