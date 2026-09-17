import { getInquiries, saveInquiries } from '../../../lib/storage.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { status, note } = req.body;
    let inquiries = await getInquiries();
    const index = inquiries.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    if (status !== undefined) inquiries[index].status = status;
    if (note !== undefined) inquiries[index].note = note;
    inquiries[index].updatedAt = new Date().toISOString();

    await saveInquiries(inquiries);
    return res.status(200).json({ success: true, inquiry: inquiries[index] });
  }

  if (req.method === 'DELETE') {
    let inquiries = await getInquiries();
    const initialLen = inquiries.length;
    inquiries = inquiries.filter(i => i.id !== id);

    if (inquiries.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    await saveInquiries(inquiries);
    return res.status(200).json({ success: true, message: 'Inquiry deleted' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
