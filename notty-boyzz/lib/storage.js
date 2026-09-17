import fs from 'fs';
import path from 'path';

const SEED_DATA = [
  {
    id: "NBZ-1001",
    name: "Simran Kaur",
    age: 23,
    mobile: "9876543210",
    whatsapp: "9876543210",
    category: "Romantic & Loving Companion",
    city: "Delhi NCR",
    note: "Looking for a gentle, handsome companion",
    clientType: "Female Client",
    status: "New",
    createdAt: "2026-09-17T11:00:00.000Z",
    formattedDate: "17 Sep 2026, 11:00 AM"
  },
  {
    id: "NBZ-1002",
    name: "Pooja Verma",
    age: 25,
    mobile: "9812345678",
    whatsapp: "9812345678",
    category: "Handsome Bodybuilder Date",
    city: "Mumbai",
    note: "Need a fit gentleman for dinner date",
    clientType: "Female Client",
    status: "Contacted",
    createdAt: "2026-09-17T10:15:00.000Z",
    formattedDate: "17 Sep 2026, 10:15 AM"
  }
];

// Memory cache across warm serverless requests
let memoryStore = null;

// Determine writable data path
function getFilePath() {
  // On Vercel, current working dir is read-only. /tmp is writable.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'notty_inquiries.json');
  }
  return path.join(process.cwd(), 'data', 'inquiries.json');
}

export async function getInquiries() {
  // 1. Check Upstash Redis if configured on Vercel
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/get/notty_inquiries`, {
        headers: { Authorization: `Bearer ${redisToken}` }
      });
      const data = await res.json();
      if (data.result) {
        return JSON.parse(data.result);
      }
    } catch (e) {
      console.warn('Redis read error, falling back:', e);
    }
  }

  // 2. Memory / File store fallback
  if (memoryStore) return memoryStore;

  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      memoryStore = JSON.parse(content || '[]');
      return memoryStore;
    }
  } catch (e) {
    console.warn('File read error:', e);
  }

  memoryStore = [...SEED_DATA];
  await saveInquiries(memoryStore);
  return memoryStore;
}

export async function saveInquiries(data) {
  memoryStore = data;

  // 1. Save to Upstash Redis if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (redisUrl && redisToken) {
    try {
      await fetch(`${redisUrl}/set/notty_inquiries`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${redisToken}` },
        body: JSON.stringify(JSON.stringify(data))
      });
    } catch (e) {
      console.warn('Redis save error:', e);
    }
  }

  // 2. Save to local / /tmp file
  const filePath = getFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('File write error (cached in memory):', e);
  }
}
