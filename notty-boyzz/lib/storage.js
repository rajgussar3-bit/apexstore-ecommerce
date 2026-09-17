import fs from 'fs';
import path from 'path';

const STORE_ID = process.env.DATA_STORE_ID || 'store_gx5PTjAgyPR8vHc1';
const BLOB_URL = 'https://gx5ptjagypr8vhc1.public.blob.vercel-storage.com/inquiries.json?download=1';

const SEED_DATA = [
  {
    id: "NBZ-3513",
    name: "Simran",
    age: 23,
    mobile: "8824382600",
    whatsapp: "8824382600",
    category: "Romantic & Loving Companion",
    city: "Udaipur",
    note: "Looking for romantic & caring companion in Udaipur",
    clientType: "Female Client",
    status: "New",
    createdAt: "2026-09-17T10:46:31.233Z",
    formattedDate: "17 Sep 2026, 04:16 PM"
  }
];

let memoryStore = null;

function getFilePath() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'notty_inquiries.json');
  }
  return path.join(process.cwd(), 'data', 'inquiries.json');
}

export async function getInquiries() {
  // 1. Fetch latest persistent data from Vercel Blob cloud via list + etag
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'inquiries.json', storeId: STORE_ID });
    const blob = blobs.find(b => b.pathname === 'inquiries.json');
    if (blob) {
      const cleanEtag = (blob.etag || '').replace(/"/g, '');
      const url = `${blob.url}?v=${cleanEtag}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          memoryStore = data;
          return memoryStore;
        }
      }
    }
  } catch (err) {
    console.warn('[STORAGE] Cloud Blob list error, falling back to direct URL:', err?.message || err);
  }

  // 2. Direct public URL fallback
  try {
    const res = await fetch(`${BLOB_URL}&nocache=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        memoryStore = data;
        return memoryStore;
      }
    }
  } catch (e) {}

  // 3. Fallback to in-memory store
  if (memoryStore && Array.isArray(memoryStore) && memoryStore.length > 0) {
    return memoryStore;
  }

  // 4. Fallback to local file
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (e) {
    console.warn('[STORAGE] File read error:', e?.message || e);
  }

  // 5. Default to authentic Udaipur seed data
  memoryStore = [...SEED_DATA];
  try {
    await saveInquiries(memoryStore);
  } catch (e) {}
  return memoryStore;
}

export async function saveInquiries(data) {
  memoryStore = data;

  // 1. Save to local file backup
  try {
    const filePath = getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[STORAGE] Local file save warning:', err?.message || err);
  }

  // 2. Persist to Vercel Blob cloud
  try {
    const { put } = await import('@vercel/blob');
    await put('inquiries.json', JSON.stringify(data, null, 2), {
      access: 'public',
      storeId: STORE_ID,
      addRandomSuffix: false,
      allowOverwrite: true
    });
  } catch (err) {
    console.error('[STORAGE] Vercel Blob put error:', err);
  }

  return memoryStore;
}

let memoryPin = '1234';

export async function getAdminPin() {
  try {
    const res = await fetch(`https://gx5ptjagypr8vhc1.public.blob.vercel-storage.com/admin_pin.json?download=1&nocache=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.pin) {
        memoryPin = String(data.pin);
        return memoryPin;
      }
    }
  } catch (e) {}

  return memoryPin || '1234';
}

export async function saveAdminPin(newPin) {
  memoryPin = String(newPin);
  try {
    const { put } = await import('@vercel/blob');
    await put('admin_pin.json', JSON.stringify({ pin: memoryPin, updatedAt: new Date().toISOString() }), {
      access: 'public',
      storeId: STORE_ID,
      addRandomSuffix: false,
      allowOverwrite: true
    });
  } catch (e) {
    console.warn('[STORAGE] Failed to persist admin pin to blob:', e);
  }
  return memoryPin;
}

