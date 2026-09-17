import { getInquiries } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const inquiries = await getInquiries();
  const todayStr = new Date().toISOString().split('T')[0];

  const total = inquiries.length;
  const newCount = inquiries.filter(i => (i.status || 'New').toLowerCase() === 'new').length;
  const contacted = inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted').length;
  const todayCount = inquiries.filter(i => (i.createdAt || '').startsWith(todayStr)).length;

  return res.status(200).json({
    success: true,
    stats: {
      total,
      newCount,
      contacted,
      todayCount
    }
  });
}
