const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Database path handling for Local and Vercel Serverless
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const SEED_DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure upload directory exists
const UPLOADS_DIR = IS_VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch(e) {}

// Multer Storage Configuration (Supports video & PDF files)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + cleanOriginalName);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000 * 1024 * 1024 } // 5GB file upload limit
});

// Middlewares
app.use(cors());
app.use((req, res, next) => {
  req.setTimeout(60 * 60 * 1000);
  res.setTimeout(60 * 60 * 1000);
  next();
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));
if (fs.existsSync(path.join(__dirname, 'uploads'))) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// In-memory DB cache for high-concurrency serverless performance
let memoryDBCache = null;

// Helper: Read Database
function readDB() {
  if (memoryDBCache) return JSON.parse(JSON.stringify(memoryDBCache));
  try {
    if (IS_VERCEL && !fs.existsSync(DB_FILE)) {
      try {
        if (fs.existsSync(SEED_DB_FILE)) {
          fs.copyFileSync(SEED_DB_FILE, DB_FILE);
        }
      } catch(e) {}
    }
    const targetFile = fs.existsSync(DB_FILE) ? DB_FILE : SEED_DB_FILE;
    const data = fs.readFileSync(targetFile, 'utf8');
    memoryDBCache = JSON.parse(data);
    return JSON.parse(JSON.stringify(memoryDBCache));
  } catch (err) {
    console.error('Error reading database:', err);
    return { settings: {}, memberships: [], videos: [], spaCourse: {}, friends: [], meetings: [], orders: [], students: [] };
  }
}

// Helper: Write Database
function writeDB(data) {
  try {
    memoryDBCache = JSON.parse(JSON.stringify(data));
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

// Admin Security Auth Middleware
function checkAdminAuth(req, res, next) {
  const pin = req.headers['x-admin-pin'] || req.query.pin || (req.body && req.body.pin);
  const db = readDB();
  if (pin && String(pin) === String(db.settings.adminPin || '1234')) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Invalid Secret Control Desk PIN!' });
  }
}

// ==========================================
// PUBLIC APIs
// ==========================================

// 1. Site Info (Never exposes admin link or PIN)
app.get('/api/site-info', (req, res) => {
  const db = readDB();
  const safeSettings = { ...db.settings };
  delete safeSettings.adminPin;
  delete safeSettings.secretDeskPath; // Keep secret desk link private

  res.json({
    success: true,
    settings: safeSettings,
    stats: {
      totalMembers: (db.students || []).length + 8450,
      totalOrders: (db.orders || []).length + 1200,
      totalVideos: (db.videos || []).length,
      totalMeetingsFixed: (db.meetings || []).length + 320
    }
  });
});

// 2. Full Catalog (Videos, Memberships, SPA Course, Friends, Categories, Sponsored Ads)
app.get('/api/catalog', (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    videos: db.videos || [],
    memberships: db.memberships || [],
    spaCourse: db.spaCourse || {},
    friends: db.friends || [],
    categories: db.categories || [],
    sponsoredCampaigns: (db.adCampaigns || []).filter(c => c.status === 'active'),
    adFrequencyPerDay: db.settings?.adFrequencyPerDay || 3
  });
});

// 2.1 Get Categories
app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json({ success: true, categories: db.categories || [] });
});

// 3. Fix a Meeting Request
app.post('/api/meetings', (req, res) => {
  const { customerName, mobile, city, preferredDate, friendId, friendName, message } = req.body;
  if (!customerName || !mobile || !city) {
    return res.status(400).json({ success: false, message: 'Name, mobile and city are required' });
  }

  const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
  }

  const db = readDB();
  const newMeeting = {
    id: 'meet-' + Date.now().toString(36),
    customerName: customerName.trim(),
    mobile: cleanMobile,
    city: city.trim(),
    preferredDate: preferredDate || 'As soon as possible',
    friendId: friendId || 'general',
    friendName: friendName || 'VIP Friend',
    message: (message || '').trim(),
    status: 'new_request',
    createdAt: new Date().toISOString()
  };

  if (!db.meetings) db.meetings = [];
  db.meetings.unshift(newMeeting);
  writeDB(db);

  res.json({
    success: true,
    message: 'Aapki meeting request register ho gayi hai! Humari team aapko WhatsApp par connect karegi.',
    meeting: newMeeting
  });
});

// 4. Create Order / Buy Video / Buy Membership / Buy SPA
app.post('/api/orders', (req, res) => {
  const { customerName, mobile, whatsapp, email, itemType, itemId, paymentMode, utr } = req.body;

  if (!customerName || !mobile || !itemType || !itemId) {
    return res.status(400).json({ success: false, message: 'Missing required buyer fields!' });
  }

  const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number!' });
  }

  const db = readDB();
  let itemTitle = 'Hotty Zilla VIP Content';
  let amount = 399;
  let durationMonths = 1;

  if (itemType === 'membership') {
    const plan = (db.memberships || []).find(m => m.id === itemId);
    if (plan) {
      itemTitle = plan.title;
      amount = plan.price;
      durationMonths = plan.durationMonths || 1;
    }
  } else if (itemType === 'video') {
    const video = (db.videos || []).find(v => v.id === itemId);
    if (video) {
      itemTitle = video.title + ' (Full HD Video)';
      amount = video.price;
    }
  } else if (itemType === 'spa') {
    itemTitle = db.spaCourse?.title || 'Complete SPA Practical Guide PDF';
    amount = db.spaCourse?.price || 299;
  }

  const orderId = 'HZ-' + Math.floor(100000 + Math.random() * 900000);
  const isAutoApproved = paymentMode === 'instant_demo';
  const status = isAutoApproved ? 'approved' : 'pending_verification';

  const newOrder = {
    orderId,
    customerName: customerName.trim(),
    mobile: cleanMobile,
    whatsapp: (whatsapp ? String(whatsapp).replace(/\D/g, '').slice(-10) : cleanMobile),
    email: (email || '').trim().toLowerCase(),
    itemType,
    itemId,
    itemTitle,
    amount,
    paymentMode: paymentMode || 'upi_qr',
    utr: utr ? String(utr).trim() : (isAutoApproved ? 'DEMO-VIP-' + Date.now().toString(36).toUpperCase() : 'PENDING'),
    status,
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);

  // If approved automatically, grant VIP access immediately
  if (isAutoApproved) {
    unlockAccessForUser(db, cleanMobile, customerName, email, itemType, itemId, durationMonths);
  }

  writeDB(db);

  res.json({
    success: true,
    message: isAutoApproved 
      ? 'Payment verified! Your VIP access is unlocked.' 
      : 'Order submitted with UTR! Control Desk team will verify and activate your VIP access.',
    order: newOrder,
    accessUnlocked: isAutoApproved
  });
});

// Helper: Unlock access for user
function unlockAccessForUser(db, mobile, name, email, itemType, itemId, durationMonths = 1) {
  let student = (db.students || []).find(s => s.mobile === mobile);
  if (!student) {
    student = {
      mobile,
      name: name.trim(),
      email: (email || '').trim().toLowerCase(),
      membership: null,
      videos: [],
      pdfs: [],
      enrolledAt: new Date().toISOString()
    };
    db.students.push(student);
  }

  if (itemType === 'membership') {
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + (durationMonths * 30));

    student.membership = {
      planId: itemId,
      planTitle: (db.memberships || []).find(m => m.id === itemId)?.title || 'VIP Membership',
      active: true,
      startedAt: startDate.toISOString(),
      expiresAt: expiryDate.toISOString()
    };

    // Membership unlocks ALL current videos!
    (db.videos || []).forEach(v => {
      if (!student.videos.includes(v.id)) student.videos.push(v.id);
    });

    // 6 Months or 12 Months plans also get SPA Course PDF Free!
    if (durationMonths >= 6) {
      if (!student.pdfs.includes('spa-pro-handbook')) student.pdfs.push('spa-pro-handbook');
    }
  } else if (itemType === 'video') {
    if (!student.videos.includes(itemId)) student.videos.push(itemId);
  } else if (itemType === 'spa') {
    if (!student.pdfs.includes('spa-pro-handbook')) student.pdfs.push('spa-pro-handbook');
  }
}

// 5. Check VIP Access for Customer (My VIP Lounge)
app.get('/api/student/vip-access', (req, res) => {
  const query = (req.query.mobile || req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ success: false, message: 'Please provide mobile number' });
  }

  const cleanMobile = query.replace(/\D/g, '').slice(-10);
  const db = readDB();

  const student = (db.students || []).find(s => s.mobile === cleanMobile);
  const studentOrders = (db.orders || []).filter(o => o.mobile === cleanMobile);
  const studentMeetings = (db.meetings || []).filter(m => m.mobile === cleanMobile);

  // Check if membership is active
  let isVipActive = false;
  let membershipDetails = null;

  if (student && student.membership) {
    const now = new Date();
    const exp = new Date(student.membership.expiresAt);
    if (exp > now) {
      isVipActive = true;
      membershipDetails = student.membership;
    }
  }

  // Populate unlocked full videos
  let unlockedVideos = [];
  if (isVipActive) {
    // Active VIP has access to ALL full videos!
    unlockedVideos = db.videos || [];
  } else if (student && student.videos) {
    unlockedVideos = student.videos.map(vidId => (db.videos || []).find(v => v.id === vidId)).filter(Boolean);
  }

  // Populate unlocked PDFs
  let unlockedPdfs = [];
  if (student && student.pdfs && student.pdfs.includes('spa-pro-handbook')) {
    unlockedPdfs.push(db.spaCourse);
  } else if (isVipActive && student.membership?.planId?.includes('6m') || student?.membership?.planId?.includes('12m')) {
    unlockedPdfs.push(db.spaCourse);
  }

  res.json({
    success: true,
    user: student || { name: studentOrders[0]?.customerName || 'VIP Guest', mobile: cleanMobile },
    isVipActive,
    membership: membershipDetails,
    unlockedVideos,
    unlockedPdfs,
    orders: studentOrders,
    meetings: studentMeetings
  });
});

// ==========================================
// SECRET CONTROL DESK APIs
// ==========================================

// 6. Admin Login Verify
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  const db = readDB();
  if (String(pin) === String(db.settings.adminPin || '1234')) {
    res.json({ success: true, message: 'Welcome to Hotty Zilla Secret Control Desk!' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect PIN! Access Denied.' });
  }
});

// 7. Admin Stats
app.get('/api/admin/stats', checkAdminAuth, (req, res) => {
  const db = readDB();
  const totalRevenue = (db.orders || [])
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders: (db.orders || []).length,
      pendingCount: (db.orders || []).filter(o => o.status === 'pending_verification').length,
      approvedCount: (db.orders || []).filter(o => o.status === 'approved').length,
      totalMeetings: (db.meetings || []).length,
      totalMembers: (db.students || []).length,
      totalVideos: (db.videos || []).length
    }
  });
});

// 8. Admin Orders List
app.get('/api/admin/orders', checkAdminAuth, (req, res) => {
  const db = readDB();
  res.json({ success: true, orders: db.orders || [] });
});

// 9. Admin Approve Order
app.post('/api/admin/orders/:orderId/approve', checkAdminAuth, (req, res) => {
  const { orderId } = req.params;
  const db = readDB();
  const order = (db.orders || []).find(o => o.orderId === orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = 'approved';
  order.approvedAt = new Date().toISOString();

  let durationMonths = 1;
  if (order.itemType === 'membership') {
    const plan = (db.memberships || []).find(m => m.id === order.itemId);
    if (plan) durationMonths = plan.durationMonths || 1;
  }

  unlockAccessForUser(db, order.mobile, order.customerName, order.email, order.itemType, order.itemId, durationMonths);
  writeDB(db);

  res.json({ success: true, message: `Order ${orderId} approved and VIP access unlocked!`, order });
});

// 10. Admin Reject Order
app.post('/api/admin/orders/:orderId/reject', checkAdminAuth, (req, res) => {
  const { orderId } = req.params;
  const db = readDB();
  const order = (db.orders || []).find(o => o.orderId === orderId);

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = 'rejected';
  writeDB(db);

  res.json({ success: true, message: `Order ${orderId} rejected.`, order });
});

// 11. Admin Meeting Requests List
app.get('/api/admin/meetings', checkAdminAuth, (req, res) => {
  const db = readDB();
  res.json({ success: true, meetings: db.meetings || [] });
});

// 12. Admin Update Meeting Status
app.post('/api/admin/meetings/:id/status', checkAdminAuth, (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const meeting = (db.meetings || []).find(m => m.id === req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: 'Meeting request not found' });

  meeting.status = status || 'contacted';
  writeDB(db);
  res.json({ success: true, message: 'Meeting status updated!', meeting });
});

// 13. Admin Add New Video Short + Full Video
app.post('/api/admin/videos', checkAdminAuth, (req, res) => {
  const { title, modelName, category, shortDuration, fullDuration, price, originalPrice, shortClipUrl, fullVideoUrl, badge, description } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Title and price are required' });
  }

  const db = readDB();
  const newVideo = {
    id: 'vid-' + Date.now().toString(36),
    title: title.trim(),
    modelName: (modelName || 'VIP Friend').trim(),
    category: category || 'Private Hangout',
    shortDuration: shortDuration || '0:30s Teaser',
    fullDuration: fullDuration || '20 Mins Full HD',
    price: Number(price),
    originalPrice: Number(originalPrice) || Number(price) * 3,
    badge: badge || '🔥 New Release',
    views: '1.2K',
    shortClipUrl: shortClipUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fullVideoUrl: fullVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: description || 'Exclusive video short teaser and full uncut HD episode.'
  };

  if (!db.videos) db.videos = [];
  db.videos.unshift(newVideo);
  writeDB(db);

  res.json({ success: true, message: 'Video Short & Full Video published successfully!', video: newVideo });
});

// 14. Admin Update SPA Course PDF
app.post('/api/admin/spa', checkAdminAuth, (req, res) => {
  const { title, price, originalPrice, pages, description, previewSample } = req.body;
  const db = readDB();

  if (title) db.spaCourse.title = title.trim();
  if (price) db.spaCourse.price = Number(price);
  if (originalPrice) db.spaCourse.originalPrice = Number(originalPrice);
  if (pages) db.spaCourse.pages = Number(pages);
  if (description) db.spaCourse.description = description.trim();
  if (previewSample) db.spaCourse.previewSample = previewSample.trim();

  writeDB(db);
  res.json({ success: true, message: 'SPA Course PDF updated successfully!', spaCourse: db.spaCourse });
});

// 14.1 Direct Generic File Upload from Laptop
app.post('/api/admin/upload-file', checkAdminAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file was selected for upload' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'File uploaded successfully from laptop!',
    fileUrl: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    sizeBytes: req.file.size
  });
});

// 14.2 Direct Laptop Video Bundle Upload (Shorts Teaser + Full Video from computer)
app.post('/api/admin/upload-video-bundle', checkAdminAuth, upload.fields([
  { name: 'shortVideoFile', maxCount: 1 },
  { name: 'fullVideoFile', maxCount: 1 }
]), (req, res) => {
  const { title, modelName, category, shortDuration, fullDuration, price, originalPrice, shortClipUrl, fullVideoUrl, description } = req.body;

  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Title and price are required' });
  }

  let finalShortUrl = shortClipUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  if (req.files && req.files['shortVideoFile'] && req.files['shortVideoFile'][0]) {
    finalShortUrl = `/uploads/${req.files['shortVideoFile'][0].filename}`;
  }

  let finalFullUrl = fullVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  if (req.files && req.files['fullVideoFile'] && req.files['fullVideoFile'][0]) {
    finalFullUrl = `/uploads/${req.files['fullVideoFile'][0].filename}`;
  }

  const db = readDB();
  const newVideo = {
    id: 'vid-' + Date.now().toString(36),
    title: title.trim(),
    modelName: (modelName || 'VIP Friend').trim(),
    category: category || 'Private Hangout',
    shortDuration: shortDuration || '0:30s Teaser',
    fullDuration: fullDuration || '20 Mins Full HD',
    price: Number(price),
    originalPrice: Number(originalPrice) || Number(price) * 3,
    badge: '🔥 Laptop Upload',
    views: '1.1K',
    shortClipUrl: finalShortUrl,
    fullVideoUrl: finalFullUrl,
    description: description || 'Exclusive video short teaser and full uncut HD video.'
  };

  if (!db.videos) db.videos = [];
  db.videos.unshift(newVideo);
  writeDB(db);

  res.json({
    success: true,
    message: 'Video short & full video uploaded from laptop and published successfully!',
    video: newVideo
  });
});

// 14.3 Direct Laptop SPA PDF Upload
app.post('/api/admin/upload-spa-bundle', checkAdminAuth, upload.single('spaPdfFile'), (req, res) => {
  const { title, price, originalPrice, pages, description, previewSample } = req.body;
  const db = readDB();

  if (req.file) {
    db.spaCourse.fileName = req.file.filename;
    db.spaCourse.downloadUrl = `/uploads/${req.file.filename}`;
    db.spaCourse.fileSize = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (title) db.spaCourse.title = title.trim();
  if (price) db.spaCourse.price = Number(price);
  if (originalPrice) db.spaCourse.originalPrice = Number(originalPrice);
  if (pages) db.spaCourse.pages = Number(pages);
  if (description) db.spaCourse.description = description.trim();
  if (previewSample) db.spaCourse.previewSample = previewSample.trim();

  writeDB(db);

  res.json({
    success: true,
    message: 'SPA Course PDF file uploaded from laptop and saved successfully!',
    spaCourse: db.spaCourse
  });
});

// 15. Admin Update Memberships Pricing
app.post('/api/admin/memberships', checkAdminAuth, (req, res) => {
  const { plan1m, plan3m, plan6m, plan12m } = req.body;
  const db = readDB();

  if (db.memberships) {
    if (plan1m) { const p = db.memberships.find(m => m.id === 'plan-1m'); if (p) p.price = Number(plan1m); }
    if (plan3m) { const p = db.memberships.find(m => m.id === 'plan-3m'); if (p) p.price = Number(plan3m); }
    if (plan6m) { const p = db.memberships.find(m => m.id === 'plan-6m'); if (p) p.price = Number(plan6m); }
    if (plan12m) { const p = db.memberships.find(m => m.id === 'plan-12m'); if (p) p.price = Number(plan12m); }
  }

  writeDB(db);
  res.json({ success: true, message: 'Membership pricing updated successfully!', memberships: db.memberships });
});

// 16. Admin Update Store Settings
app.post('/api/admin/settings', checkAdminAuth, (req, res) => {
  const { upiId, merchantName, whatsappNumber, announcement, adminPin } = req.body;
  const db = readDB();

  if (upiId) db.settings.upiId = upiId.trim();
  if (merchantName) db.settings.merchantName = merchantName.trim();
  if (whatsappNumber) db.settings.whatsappNumber = whatsappNumber.trim();
  if (announcement !== undefined) db.settings.announcement = announcement.trim();
  if (adminPin && adminPin.trim().length >= 4) db.settings.adminPin = adminPin.trim();

  writeDB(db);
  res.json({ success: true, message: 'Store settings saved successfully!' });
});

// 17. Admin Export CSV
app.get('/api/admin/export-csv', checkAdminAuth, (req, res) => {
  const db = readDB();
  let csv = 'Order ID,Customer Name,Mobile,WhatsApp,Email,Item Type,Item Title,Amount,Payment Mode,UTR,Status,Date\n';

  (db.orders || []).forEach(o => {
    const row = [
      `"${o.orderId}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.mobile}"`,
      `"${o.whatsapp || ''}"`,
      `"${o.email || ''}"`,
      `"${o.itemType}"`,
      `"${(o.itemTitle || '').replace(/"/g, '""')}"`,
      o.amount,
      `"${o.paymentMode}"`,
      `"${o.utr || ''}"`,
      `"${o.status}"`,
      `"${o.createdAt}"`
    ];
    csv += row.join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="hottyzilla-vip-orders.csv"');
  res.send(csv);
});

// ==========================================
// SIMPLIFIED VIDEO, CATEGORIES & PROFILE APIs
// ==========================================

// 18. Simplified Single Video Upload (Supports 10m, 15m, 30m+ HD videos, all fields optional)
app.post('/api/admin/upload-video-simple', checkAdminAuth, upload.single('videoFile'), (req, res) => {
  let { title, category, price, description } = req.body;

  let finalUrl = '';
  if (req.file) {
    finalUrl = `/uploads/${req.file.filename}`;
    if (!title || !title.trim()) {
      title = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    }
  } else if (req.body.videoUrl && req.body.videoUrl.trim()) {
    finalUrl = req.body.videoUrl.trim();
  } else {
    return res.status(400).json({ success: false, message: 'Please select a video file or provide a video URL' });
  }

  if (!title || !title.trim()) {
    title = 'Hotty Zilla Reel ' + new Date().toLocaleDateString('en-IN');
  }

  const db = readDB();
  const newVideo = {
    id: 'vid-' + Date.now().toString(36),
    title: title.trim(),
    modelName: 'Hotty Zilla Star',
    category: category || (db.categories?.[1]?.name || 'Late Night Fun'),
    shortDuration: 'Free Preview',
    fullDuration: 'Full HD Video',
    price: Number(price) || 99,
    originalPrice: (Number(price) || 99) * 3,
    badge: '🔥 New Release',
    views: '1.2K',
    shortClipUrl: finalUrl,
    fullVideoUrl: finalUrl,
    description: (description || 'Exclusive video stream on Hotty Zilla VIP.').trim()
  };

  if (!db.videos) db.videos = [];
  db.videos.unshift(newVideo);
  writeDB(db);

  res.json({
    success: true,
    message: 'Video successfully uploaded and published!',
    video: newVideo
  });
});

// 19. Delete Video (from catalog and storage)
app.delete('/api/admin/videos/:id', checkAdminAuth, (req, res) => {
  const db = readDB();
  const videoIndex = (db.videos || []).findIndex(v => v.id === req.params.id);

  if (videoIndex === -1) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const deletedVideo = db.videos[videoIndex];

  // Try to remove file from uploads folder if local
  if (deletedVideo.shortClipUrl && deletedVideo.shortClipUrl.startsWith('/uploads/')) {
    try { fs.unlinkSync(path.join(__dirname, deletedVideo.shortClipUrl)); } catch(e){}
  }
  if (deletedVideo.fullVideoUrl && deletedVideo.fullVideoUrl.startsWith('/uploads/') && deletedVideo.fullVideoUrl !== deletedVideo.shortClipUrl) {
    try { fs.unlinkSync(path.join(__dirname, deletedVideo.fullVideoUrl)); } catch(e){}
  }

  db.videos.splice(videoIndex, 1);
  writeDB(db);

  res.json({
    success: true,
    message: `Video "${deletedVideo.title}" deleted successfully!`,
    id: req.params.id
  });
});

// 20. Add New Category
app.post('/api/admin/categories', checkAdminAuth, (req, res) => {
  const { name, icon, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const db = readDB();
  if (!db.categories) db.categories = [];

  const newCat = {
    id: 'cat-' + Date.now().toString(36),
    name: name.trim(),
    icon: (icon || '⭐').trim(),
    description: (description || '').trim()
  };

  db.categories.push(newCat);
  writeDB(db);

  res.json({ success: true, message: 'Category added successfully!', category: newCat });
});

// 21. Delete Category
app.delete('/api/admin/categories/:id', checkAdminAuth, (req, res) => {
  const db = readDB();
  if (!db.categories) db.categories = [];
  const initialLen = db.categories.length;
  db.categories = db.categories.filter(c => c.id !== req.params.id);

  if (db.categories.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Category deleted successfully!' });
});

// 22. Customer Email Login / Signup
app.post('/api/auth/customer-login', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDB();
  if (!db.students) db.students = [];

  let user = db.students.find(s => s.email && s.email.toLowerCase() === cleanEmail);

  if (!user) {
    user = {
      id: 'user-' + Date.now().toString(36),
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      age: 21,
      mobile: '',
      membership: null,
      videos: [],
      pdfs: [],
      enrolledAt: new Date().toISOString()
    };
    db.students.push(user);
    writeDB(db);
  }

  res.json({
    success: true,
    message: 'Welcome ' + user.name + '!',
    user
  });
});

// 23. Customer Profile Update (Name, Age, Mobile)
app.put('/api/customer/profile', (req, res) => {
  const { email, name, age, mobile } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email identifier required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDB();
  const user = (db.students || []).find(s => s.email && s.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Customer profile not found' });
  }

  if (name !== undefined && name.trim()) user.name = name.trim();
  if (age !== undefined) user.age = Number(age) || user.age || 21;
  if (mobile !== undefined) user.mobile = String(mobile).replace(/\D/g, '').slice(-10);

  writeDB(db);
  res.json({
    success: true,
    message: 'Profile updated successfully!',
    user
  });
});

// ==========================================
// CREATOR PROGRAM & MONETIZATION (USD) APIs
// ==========================================

// 24. Apply for Creator Program
app.post('/api/creator/apply', (req, res) => {
  const { email, realName, handle, age, city, address, category, bio } = req.body;
  if (!email || !realName || !handle || !age) {
    return res.status(400).json({ success: false, message: 'All required creator fields must be filled' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDB();
  if (!db.creators) db.creators = [];

  let existing = db.creators.find(c => c.email === cleanEmail);
  if (existing) {
    if (existing.status === 'approved') {
      return res.json({ success: true, message: 'Aap already approved creator hain!', creator: existing });
    }
    existing.realName = realName.trim();
    existing.handle = handle.trim();
    existing.age = Number(age);
    existing.city = (city || '').trim();
    existing.address = (address || '').trim();
    existing.category = category || 'General';
    existing.bio = (bio || '').trim();
    existing.status = 'pending_verification';
    existing.submittedAt = new Date().toISOString();
    writeDB(db);
    return res.json({
      success: true,
      message: 'Aapki creator request update ho gayi hai! 10-15 minute me admin team verify karke approve karegi.',
      creator: existing
    });
  }

  const newCreator = {
    id: 'creator-' + Date.now().toString(36),
    email: cleanEmail,
    realName: realName.trim(),
    handle: handle.trim().startsWith('@') ? handle.trim() : '@' + handle.trim(),
    age: Number(age) || 21,
    city: (city || '').trim(),
    address: (address || '').trim(),
    category: category || 'General',
    bio: (bio || '').trim(),
    status: 'pending_verification',
    earningsUSD: 0.00,
    totalViews: 0,
    videosCount: 0,
    submittedAt: new Date().toISOString()
  };

  db.creators.unshift(newCreator);
  writeDB(db);

  res.json({
    success: true,
    message: 'Aapki Creator Program application submit ho gayi hai! 10-15 minute me verification ke baad aapki request approve hogi.',
    creator: newCreator
  });
});

// 25. Check Creator Status & Studio Dashboard
app.get('/api/creator/status', (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }

  const db = readDB();
  const creator = (db.creators || []).find(c => c.email === email);
  if (!creator) {
    return res.json({ success: true, applied: false });
  }

  const creatorVideos = (db.videos || []).filter(v => v.creatorEmail === email || v.modelName === creator.realName);

  res.json({
    success: true,
    applied: true,
    creator,
    videos: creatorVideos,
    rateUSD: db.settings?.monetizationRatePer1kViewsUSD || 1.50
  });
});

// 26. Paid Video Promotion / Reach Boost
app.post('/api/creator/promote', (req, res) => {
  const { creatorEmail, creatorName, videoId, videoTitle, targetViews, amountINR, paymentMode, utr } = req.body;
  if (!creatorEmail || !videoId || !targetViews || !amountINR) {
    return res.status(400).json({ success: false, message: 'Missing promotion parameters' });
  }

  const db = readDB();
  if (!db.adCampaigns) db.adCampaigns = [];

  const campaignId = 'boost-' + Math.floor(100000 + Math.random() * 900000);
  const amountUSD = (Number(amountINR) / 83.5).toFixed(2);

  const newCampaign = {
    id: campaignId,
    creatorEmail: creatorEmail.trim().toLowerCase(),
    creatorName: (creatorName || 'Hotty Zilla Creator').trim(),
    videoId,
    videoTitle: (videoTitle || 'Promoted Video').trim(),
    targetViews: Number(targetViews),
    amountINR: Number(amountINR),
    amountUSD: Number(amountUSD),
    status: 'active',
    impressionsDelivered: 0,
    clicks: 0,
    paymentMode: paymentMode || 'upi_qr',
    utr: utr || 'PROMO-' + Date.now().toString(36).toUpperCase(),
    createdAt: new Date().toISOString()
  };

  db.adCampaigns.unshift(newCampaign);

  // Record in orders
  if (!db.orders) db.orders = [];
  db.orders.unshift({
    orderId: 'HZ-' + Math.floor(100000 + Math.random() * 900000),
    customerName: newCampaign.creatorName,
    mobile: 'N/A',
    whatsapp: 'N/A',
    email: newCampaign.creatorEmail,
    itemType: 'video_boost',
    itemId: campaignId,
    itemTitle: `Traffic Boost: ${newCampaign.targetViews.toLocaleString()} Views for "${newCampaign.videoTitle}"`,
    amount: newCampaign.amountINR,
    paymentMode: newCampaign.paymentMode,
    utr: newCampaign.utr,
    status: 'approved',
    createdAt: new Date().toISOString()
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Traffic campaign activated! ${Number(targetViews).toLocaleString()} views campaign is now running on Hotty Zilla.`,
    campaign: newCampaign
  });
});

// 27. Admin: Get Creators List
app.get('/api/admin/creators', checkAdminAuth, (req, res) => {
  const db = readDB();
  res.json({ success: true, creators: db.creators || [] });
});

// 28. Admin: Approve Creator
app.post('/api/admin/creators/:id/approve', checkAdminAuth, (req, res) => {
  const db = readDB();
  const creator = (db.creators || []).find(c => c.id === req.params.id);
  if (!creator) return res.status(404).json({ success: false, message: 'Creator application not found' });

  creator.status = 'approved';
  creator.approvedAt = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, message: `Creator ${creator.realName} (${creator.handle}) approved successfully!`, creator });
});

// 29. Admin: Reject Creator
app.post('/api/admin/creators/:id/reject', checkAdminAuth, (req, res) => {
  const db = readDB();
  const creator = (db.creators || []).find(c => c.id === req.params.id);
  if (!creator) return res.status(404).json({ success: false, message: 'Creator application not found' });

  creator.status = 'rejected';
  writeDB(db);

  res.json({ success: true, message: `Creator ${creator.realName} application rejected.`, creator });
});

// 30. Admin: Get Ad Campaigns
app.get('/api/admin/campaigns', checkAdminAuth, (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    campaigns: db.adCampaigns || [],
    adFrequencyPerDay: db.settings?.adFrequencyPerDay || 3
  });
});

// 31. Admin: Update Ad Campaign Status
app.post('/api/admin/campaigns/:id/status', checkAdminAuth, (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const camp = (db.adCampaigns || []).find(c => c.id === req.params.id);
  if (!camp) return res.status(404).json({ success: false, message: 'Campaign not found' });

  camp.status = status || 'active';
  writeDB(db);

  res.json({ success: true, message: `Campaign status updated to ${camp.status}!`, campaign: camp });
});

// 32. Admin: Update Ad Frequency Cap
app.post('/api/admin/settings/ad-frequency', checkAdminAuth, (req, res) => {
  const { frequency } = req.body;
  const db = readDB();
  if (frequency !== undefined) {
    db.settings.adFrequencyPerDay = Number(frequency) || 3;
  }
  writeDB(db);

  res.json({
    success: true,
    message: `Ad display frequency updated: Each visitor will see promoted ads ${db.settings.adFrequencyPerDay} times per day!`,
    adFrequencyPerDay: db.settings.adFrequencyPerDay
  });
});

// Start Server
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🔥 HOTTY ZILLA VIP LOUNGE SERVER STARTED!`);
    console.log(`🌐 Public Website:       http://localhost:${PORT}`);
    console.log(`👑 VIP Member Portal:    http://localhost:${PORT}/my-library.html`);
    console.log(`🔒 Secret Control Desk:  http://localhost:${PORT}/hz-secret-control-desk.html`);
    console.log(`🔑 Secret PIN:           1234`);
    console.log(`====================================================`);
  });
}

module.exports = app;
