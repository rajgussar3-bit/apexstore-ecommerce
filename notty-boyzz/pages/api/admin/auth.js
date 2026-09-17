import { getAdminPin, saveAdminPin } from '../../../lib/storage.js';

const MASTER_RECOVERY_KEY = 'Devraj@#16.07.2006';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'GET') {
    return res.status(200).json({ success: true, active: true });
  }

  if (req.method === 'POST') {
    const { action, pin, recoveryCode, oldPin, newPin } = req.body;
    const currentPin = await getAdminPin();

    // 1. VERIFY PIN / UNLOCK
    if (action === 'verify') {
      const entered = (pin || '').trim();
      if (entered === currentPin || entered === MASTER_RECOVERY_KEY) {
        return res.status(200).json({ success: true, authorized: true });
      }
      return res.status(401).json({ success: false, error: 'Galat Password / PIN! Please check karein.' });
    }

    // 2. FORGOT / RESET PIN USING MASTER KEY
    if (action === 'reset') {
      const cleanKey = (recoveryCode || '').trim();
      if (cleanKey !== MASTER_RECOVERY_KEY) {
        return res.status(403).json({
          success: false,
          error: 'Galat Master Recovery Password! Jab tak sahi recovery password enter nahi karenge, password change nahi ho sakta.'
        });
      }

      const cleanNewPin = (newPin || '').trim();
      if (!cleanNewPin || cleanNewPin.length < 3) {
        return res.status(400).json({ success: false, error: 'Naya Password kam se kam 3 characters ka hona chahiye!' });
      }

      await saveAdminPin(cleanNewPin);
      return res.status(200).json({
        success: true,
        message: 'Password successfully reset! Ab aap naye password se login kar sakte hain.'
      });
    }

    // 3. CHANGE PIN FROM DASHBOARD
    if (action === 'change') {
      const enteredOld = (oldPin || '').trim();
      if (enteredOld !== currentPin && enteredOld !== MASTER_RECOVERY_KEY) {
        return res.status(401).json({ success: false, error: 'Purana Password ya Recovery Key galat hai!' });
      }

      const cleanNewPin = (newPin || '').trim();
      if (!cleanNewPin || cleanNewPin.length < 3) {
        return res.status(400).json({ success: false, error: 'Naya Password kam se kam 3 characters ka hona chahiye!' });
      }

      await saveAdminPin(cleanNewPin);
      return res.status(200).json({
        success: true,
        message: 'Password successfully updated!'
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
