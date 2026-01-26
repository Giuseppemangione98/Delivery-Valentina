// Firebase Admin SDK per invio notifiche FCM
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

export default admin;
