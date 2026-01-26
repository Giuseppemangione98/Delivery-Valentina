import admin from './firebase-admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { ordineId, stato } = req.body;
  const tokenFrontoffice = process.env.FRONT_OFFICE_TOKEN || process.env.BACKOFFICE_FCM_TOKEN;
  
  if (!tokenFrontoffice) {
    return res.status(400).json({ error: 'Token frontoffice non configurato' });
  }
  
  if (!stato) {
    return res.status(400).json({ error: 'Stato ordine mancante' });
  }
  
  try {
    // Invia notifica al frontoffice
    await admin.messaging().send({
      token: tokenFrontoffice,
      notification: {
        title: "Ordine esitato!",
        body: `Il tuo ordine è stato ${stato}`,
      },
      data: {
        ordineId: ordineId || Date.now().toString(),
        stato: stato,
      },
    });
    
    console.log('✅ Notifica inviata al frontoffice');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Errore invio notifica frontoffice:', error);
    res.status(500).json({ error: error.message });
  }
}
