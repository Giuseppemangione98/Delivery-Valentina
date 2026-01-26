export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token FCM mancante' });
  }
  
  console.log('✅ Token frontoffice salvato:', token);
  res.status(200).json({ success: true });
}
