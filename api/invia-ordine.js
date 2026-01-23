export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messaggio, items, total } = req.body;

    console.log('📦 Ordine ricevuto da Valentina:', {
      messaggio,
      items,
      total,
      data: new Date().toLocaleString('it-IT')
    });

    res.status(200).json({ 
      success: true, 
      risposta: "Amore mio! Ho ricevuto il tuo ordine con il cuore pieno di gioia. Preparerò tutto con tanto amore. Ti amo ❤️"
    });

  } catch (error) {
    console.error('❌ Errore:', error);
    res.status(500).json({ error: error.message });
  }
}
