/**
 * Server Express per Valentina Delivery API
 * Gestisce gli ordini e invia notifiche FCM
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import handleOrdine, { handleEsitoOrdine } from './invia-ordine.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Valentina Delivery API'
  });
});

// Endpoint per gestire gli ordini
app.post('/api/ordine', async (req, res) => {
  await handleOrdine(req, res);
});

// Gestione OPTIONS per CORS preflight
app.options('/api/ordine', (req, res) => {
  res.status(200).end();
});

// Endpoint per salvare il token FCM del frontoffice
app.post('/api/save-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token FCM mancante' });
  }
  // Qui salveremo il token (es. in Google Sheets o DB)
  console.log('✅ Token frontoffice salvato:', token);
  res.status(200).json({ success: true });
});

// Endpoint per gestire l'esito dell'ordine dal backoffice
app.post('/api/esito-ordine', async (req, res) => {
  await handleEsitoOrdine(req, res);
});

// Gestione OPTIONS per CORS preflight
app.options('/api/esito-ordine', (req, res) => {
  res.status(200).end();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint non trovato',
    path: req.path 
  });
});

// Error handler globale
app.use((err, req, res, next) => {
  console.error('❌ Errore server:', err);
  res.status(500).json({ 
    error: 'Errore interno del server',
    message: err.message 
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`🚀 Server Express avviato sulla porta ${PORT}`);
  console.log(`📡 API disponibile su http://localhost:${PORT}/api/ordine`);
  console.log(`❤️  Valentina Delivery API - Pronto per ricevere ordini!`);
});

// Gestione graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM ricevuto, chiusura server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT ricevuto, chiusura server...');
  process.exit(0);
});
