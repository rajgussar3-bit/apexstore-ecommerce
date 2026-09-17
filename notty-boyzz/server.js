const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'inquiries.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data folder and file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

function readInquiries() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading inquiries:', err);
    return [];
  }
}

function saveInquiries(inquiries) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving inquiries:', err);
    return false;
  }
}

// Male Name Detector (Strict Female-Only Rule)
const MALE_NAMES = new Set([
  "rahul", "amit", "rohit", "mohit", "vikas", "ajay", "deepak", "suresh", "ramesh", "raj", "rajesh",
  "sachin", "karan", "arjun", "aman", "sumit", "abhishek", "vivek", "sunil", "anil", "pawan",
  "manoj", "ravi", "sanjay", "vijay", "vishal", "sandeep", "pradeep", "gaurav", "saurav", "kunal",
  "neeraj", "manish", "sunny", "vicky", "nitin", "ashish", "harsh", "aditya", "shubham", "mayank",
  "akash", "varun", "chetan", "dev", "rohan", "kabir", "aryan", "ayush", "kartik", "ankit",
  "sourabh", "pankaj", "alok", "anand", "ashok", "bharat", "brijesh", "chandan", "dharmendra",
  "dinesh", "ganesh", "gopal", "govind", "harish", "hemant", "himanshu", "ishaan", "jagdish",
  "jitendra", "kamal", "kapil", "keshav", "kishore", "krishna", "kuldeep", "lalit", "lokesh",
  "mahesh", "mithun", "mukesh", "naresh", "narendra", "naveen", "nikhil", "om", "parveen",
  "prashant", "praveen", "prem", "raghav", "rajat", "rajeev", "rakesh", "ram", "ranjeet",
  "ratnesh", "rishi", "ritesh", "samir", "sameer", "santosh", "sarvesh", "satish", "shankar",
  "shantanu", "shashi", "shivam", "shiv", "sid", "siddharth", "sonu", "monu", "tarun", "tushar",
  "umesh", "upendra", "vinay", "vinod", "vipin", "yash", "yogesh", "bablu", "chintu", "monty",
  "bunty", "rocky", "tony", "lucky", "bobby", "deep", "jeet", "meet", "gagan", "mandeep",
  "gurpreet", "harpreet", "jaspreet", "gursewak", "kulwant", "balwinder", "satnam", "manpreet",
  "mohammed", "mohammad", "ali", "ahmed", "imran", "salman", "sahil", "faizan", "bilal", "zeeshan",
  "john", "david", "michael", "alex", "chris", "mike", "james", "robert", "william", "daniel"
]);

function isMale(name) {
  if (!name) return false;
  const clean = name.trim().toLowerCase();
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (['mr', 'mr.', 'shri', 'master', 'bhai', 'kumar', 'boy', 'guy'].includes(parts[0])) return true;
  for (const token of parts) {
    if (MALE_NAMES.has(token)) return true;
  }
  if (clean.endsWith('kumar') || clean.endsWith(' bhai') || clean.includes(' boy')) return true;
  return false;
}

// Server-Sent Events (SSE) for Real-Time Control Desk updates
let sseClients = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

function broadcastEvent(type, data) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {}
  });
}

// Routes
app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control-desk.html'));
});

// GET all inquiries
app.get('/api/inquiries', (req, res) => {
  const inquiries = readInquiries();
  inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: inquiries.length, data: inquiries });
});

// GET stats summary
app.get('/api/stats', (req, res) => {
  const inquiries = readInquiries();
  const todayStr = new Date().toISOString().split('T')[0];

  const total = inquiries.length;
  const newCount = inquiries.filter(i => (i.status || 'New').toLowerCase() === 'new').length;
  const contacted = inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted').length;
  const todayCount = inquiries.filter(i => (i.createdAt || '').startsWith(todayStr)).length;

  res.json({
    success: true,
    stats: {
      total,
      newCount,
      contacted,
      todayCount
    }
  });
});

// POST new inquiry from customer form
app.post('/api/inquiries', (req, res) => {
  const { name, age, mobile, whatsapp, category, city, note } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }

  // Strict check: Only Women / Female clients
  if (isMale(name)) {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Notty Boyzz luxury companion services are strictly reserved for Women / Female clients only. Male applications are blocked.'
    });
  }

  if (!mobile || !mobile.trim()) {
    return res.status(400).json({ success: false, error: 'Mobile number is required' });
  }

  const inquiries = readInquiries();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newEntry = {
    id: `NBZ-${randomNum}`,
    name: name.trim(),
    age: age ? parseInt(age, 10) : null,
    mobile: mobile.trim(),
    whatsapp: (whatsapp && whatsapp.trim()) ? whatsapp.trim() : mobile.trim(),
    category: category || 'Romantic & Caring Companion',
    city: (city && city.trim()) ? city.trim() : 'India',
    note: (note && note.trim()) ? note.trim() : '',
    clientType: 'Female Client',
    status: 'New',
    createdAt: now.toISOString(),
    formattedDate
  };

  inquiries.unshift(newEntry);
  saveInquiries(inquiries);

  // Broadcast to Control Desk
  broadcastEvent('NEW_INQUIRY', newEntry);

  res.status(201).json({
    success: true,
    message: 'VIP Pass requested successfully! Our team will connect with you.',
    inquiry: newEntry
  });
});

// PATCH update status or notes
app.patch('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const inquiries = readInquiries();
  const index = inquiries.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  if (status !== undefined) inquiries[index].status = status;
  if (note !== undefined) inquiries[index].note = note;
  inquiries[index].updatedAt = new Date().toISOString();

  saveInquiries(inquiries);
  broadcastEvent('INQUIRY_UPDATED', inquiries[index]);

  res.json({ success: true, message: 'Inquiry updated successfully', inquiry: inquiries[index] });
});

// DELETE inquiry
app.delete('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  let inquiries = readInquiries();
  const initialLen = inquiries.length;
  inquiries = inquiries.filter(i => i.id !== id);

  if (inquiries.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  saveInquiries(inquiries);
  broadcastEvent('INQUIRY_DELETED', { id });

  res.json({ success: true, message: 'Inquiry deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`⚡ Notty Boyzz Web Server running at http://localhost:${PORT}`);
  console.log(`🔒 Control Desk available at http://localhost:${PORT}/control or http://localhost:${PORT}/control-desk.html`);
});
