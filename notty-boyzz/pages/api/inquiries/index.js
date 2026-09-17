import { getInquiries, saveInquiries } from '../../../lib/storage';
import { isMaleName } from '../../../lib/maleDetector';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const inquiries = await getInquiries();
    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  }

  if (req.method === 'POST') {
    const { name, age, mobile, whatsapp, category, city, note } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    // STRICT CHECK: WOMEN ONLY
    if (isMaleName(name)) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Notty Boyzz luxury companion services are strictly reserved for Women / Female clients only. Male applications are blocked.'
      });
    }

    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, error: 'Mobile number is required' });
    }

    const inquiries = await getInquiries();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newEntry = {
      id: `NBZ-${randomNum}`,
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      mobile: mobile.trim(),
      whatsapp: (whatsapp && whatsapp.trim()) ? whatsapp.trim() : mobile.trim(),
      category: category || 'Romantic & Loving Companion',
      city: (city && city.trim()) ? city.trim() : 'India',
      note: (note && note.trim()) ? note.trim() : '',
      clientType: 'Female Client',
      status: 'New',
      createdAt: now.toISOString(),
      formattedDate
    };

    inquiries.unshift(newEntry);
    await saveInquiries(inquiries);

    return res.status(201).json({
      success: true,
      message: 'VIP Pass requested successfully!',
      inquiry: newEntry
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
