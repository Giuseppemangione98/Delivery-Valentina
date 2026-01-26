// Firebase Admin SDK per invio notifiche FCM
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import admin from 'firebase-admin';

// Inizializza Firebase Admin SDK (usa service account)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "deliveryvalentina-b5ea7",
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin SDK inizializzato');
  } catch (error) {
    console.error('❌ Errore inizializzazione Firebase Admin:', error);
  }
}

/**
 * Handler per gestire gli ordini da Valentina
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleOrdine(req, res) {
  try {
    const { messaggio, items, total } = req.body;

    console.log('📦 Ordine ricevuto da Valentina:', {
      messaggio,
      items,
      total,
      data: new Date().toLocaleString('it-IT')
    });

    // Invia notifica push FCM al backoffice
    const backofficeToken = process.env.BACKOFFICE_FCM_TOKEN;
    if (backofficeToken && admin.apps.length > 0) {
      try {
        await admin.messaging().send({
          token: backofficeToken,
          notification: {
            title: "🍕 NUOVO ORDINE!",
            body: `Valentina ha ordinato: €${total} (${items?.length || 0} items)`,
          },
          data: {
            ordineId: Date.now().toString(),
            action: "nuovo_ordine",
            total: total?.toString() || '0',
            itemsCount: (items?.length || 0).toString(),
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              channelId: "ordini_channel",
              priority: "high",
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
              },
            },
          },
          webpush: {
            notification: {
              requireInteraction: true,
            },
          },
        });
        console.log('✅ Notifica FCM inviata al backoffice');
      } catch (fcmError) {
        console.error('❌ Errore invio notifica FCM:', fcmError);
        // Non bloccare la risposta anche se la notifica fallisce
      }
    } else {
      if (!backofficeToken) {
        console.warn('⚠️ BACKOFFICE_FCM_TOKEN non configurato');
      }
      if (admin.apps.length === 0) {
        console.warn('⚠️ Firebase Admin non inizializzato');
      }
    }

    res.status(200).json({ 
      success: true, 
      risposta: "Amore mio! Ho ricevuto il tuo ordine con il cuore pieno di gioia. Preparerò tutto con tanto amore. Ti amo ❤️"
    });

  } catch (error) {
    console.error('❌ Errore:', error);
    res.status(500).json({ error: error.message });
  }
}

export default handleOrdine;
