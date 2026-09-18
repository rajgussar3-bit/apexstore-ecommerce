// Hotty Zilla Admin Control Desk Controller
let adminPin = sessionStorage.getItem('hz_admin_pin') || '';
let cachedOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  if (adminPin) {
    verifyAndLoadAdmin(adminPin);
  } else {
    showPinLock();
  }
});

// Toast Notifications
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <div>${msg}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showPinLock() {
  document.getElementById('pinLockSection').style.display = 'block';
  document.getElementById('adminMainDashboard').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

function adminLogout() {
  sessionStorage.removeItem('hz_admin_pin');
  adminPin = '';
  showPinLock();
  showToast('Control desk locked.');
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const pinInput = document.getElementById('adminPinInput').value.trim();
  if (!pinInput) return;
  verifyAndLoadAdmin(pinInput);
}

async function verifyAndLoadAdmin(pin) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();

    if (data.success) {
      adminPin = pin;
      sessionStorage.setItem('hz_admin_pin', pin);
      document.getElementById('pinLockSection').style.display = 'none';
      document.getElementById('adminMainDashboard').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'inline-flex';
      loadAdminData();
      showToast('Welcome to Control Desk!');
    } else {
      showToast(data.message || 'Incorrect PIN!', 'error');
      sessionStorage.removeItem('hz_admin_pin');
    }
  } catch (err) {
    console.error('Admin login error:', err);
    showToast('Failed to connect to server.', 'error');
  }
}

async function loadAdminData() {
  if (!adminPin) return;

  try {
    // 1. Fetch Stats
    const statsRes = await fetch('/api/admin/stats', {
      headers: { 'x-admin-pin': adminPin }
    });
    const statsData = await statsRes.json();
    if (statsData.success) {
      const s = statsData.stats;
      document.getElementById('admRev').textContent = `₹${(s.totalRevenue || 0).toLocaleString()}`;
      document.getElementById('admPending').textContent = s.pendingCount || 0;
      document.getElementById('admStudents').textContent = s.totalStudents || 0;
      document.getElementById('admItems').textContent = (s.totalCourses || 0) + (s.totalVideos || 0) + (s.totalPdfs || 0);
      document.getElementById('tabOrderCount').textContent = s.totalOrders || 0;
    }

    // 2. Fetch Orders
    const ordersRes = await fetch('/api/admin/orders', {
      headers: { 'x-admin-pin': adminPin }
    });
    const ordersData = await ordersRes.json();
    if (ordersData.success) {
      cachedOrders = ordersData.orders || [];
      renderOrdersTable(cachedOrders);
    }

    // 3. Load Settings into Settings form
    const infoRes = await fetch('/api/site-info');
    const infoData = await infoRes.json();
    if (infoData.success && infoData.settings) {
      const set = infoData.settings;
      if (document.getElementById('setUpiId')) document.getElementById('setUpiId').value = set.upiId || '';
      if (document.getElementById('setMerchantName')) document.getElementById('setMerchantName').value = set.merchantName || '';
      if (document.getElementById('setWhatsapp')) document.getElementById('setWhatsapp').value = set.whatsappNumber || '';
      if (document.getElementById('setAnnouncement')) document.getElementById('setAnnouncement').value = set.announcement || '';
    }
  } catch (err) {
    console.error('Error loading admin data:', err);
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const isPending = o.status === 'pending_verification';
    const statusClass = `badge-status ${o.status}`;
    const statusText = isPending ? '⏳ Pending' : (o.status === 'approved' ? '✅ Approved' : '❌ Rejected');

    const cleanWa = (o.whatsapp || o.mobile || '').replace(/\D/g, '').slice(-10);
    const waMsg = encodeURIComponent(`Namaste ${o.customerName}! Hotty Zilla se aapka ${o.itemTitle} (Order: ${o.orderId}) activate kar diya gaya hai. Aap http://localhost:5000/my-library.html par login karke dekh sakte hain!`);

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--gold);">${o.orderId}</td>
        <td>
          <div style="font-weight: 700;">${o.customerName}</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">📱 ${o.mobile} ${o.email ? `• ${o.email}` : ''}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${o.itemTitle}</div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--cyan);">${o.itemType}</span>
        </td>
        <td style="font-weight: 800; font-size: 1.05rem;">₹${o.amount}</td>
        <td>
          <div style="font-size: 0.8rem; text-transform: uppercase;">${o.paymentMode}</div>
          <div style="font-family: monospace; font-size: 0.78rem; color: var(--gold);">${o.utr || 'N/A'}</div>
        </td>
        <td>
          <span class="${statusClass}">${statusText}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            ${isPending ? `
              <button class="btn btn-gold btn-sm" onclick="approveOrder('${o.orderId}')" title="Approve & Unlock Access">
                ✅ Approve
              </button>
              <button class="btn btn-outline btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="rejectOrder('${o.orderId}')" title="Reject Order">
                ✕
              </button>
            ` : ''}
            <a href="https://wa.me/91${cleanWa}?text=${waMsg}" target="_blank" class="btn btn-outline btn-sm" style="border-color: #25d366; color: #25d366;" title="Notify on WhatsApp">
              💬 WhatsApp
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterOrderTable(filter) {
  if (filter === 'pending') {
    renderOrdersTable(cachedOrders.filter(o => o.status === 'pending_verification'));
  } else if (filter === 'approved') {
    renderOrdersTable(cachedOrders.filter(o => o.status === 'approved'));
  } else {
    renderOrdersTable(cachedOrders);
  }
}

async function approveOrder(orderId) {
  if (!confirm(`Kya aap Order ${orderId} ko approve karke student ka access unlock karna chahte hain?`)) return;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin
      }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order ${orderId} approved successfully! 🎉`);
      loadAdminData();
    } else {
      showToast(data.message || 'Error approving order', 'error');
    }
  } catch (err) {
    console.error('Approve order error:', err);
    showToast('Failed to approve order.', 'error');
  }
}

async function rejectOrder(orderId) {
  if (!confirm(`Kya aap Order ${orderId} ko reject karna chahte hain?`)) return;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin
      }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order ${orderId} rejected.`);
      loadAdminData();
    }
  } catch (err) {
    console.error('Reject order error:', err);
  }
}

// Tab Switching in Admin
function switchAdminTab(tabName, btnElement) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  document.getElementById('adminTabOrders').style.display = tabName === 'orders' ? 'block' : 'none';
  document.getElementById('adminTabAddVideo').style.display = tabName === 'add-video' ? 'block' : 'none';
  document.getElementById('adminTabAddPdf').style.display = tabName === 'add-pdf' ? 'block' : 'none';
  document.getElementById('adminTabSettings').style.display = tabName === 'settings' ? 'block' : 'none';
}

// Add New Video Form
async function handleAddVideo(e) {
  e.preventDefault();
  const title = document.getElementById('vTitle').value.trim();
  const category = document.getElementById('vCategory').value;
  const duration = document.getElementById('vDuration').value.trim();
  const price = document.getElementById('vPrice').value;
  const originalPrice = document.getElementById('vOriginalPrice').value;
  const videoUrl = document.getElementById('vUrl').value.trim();
  const description = document.getElementById('vDesc').value.trim();

  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin
      },
      body: JSON.stringify({ title, category, duration, price, originalPrice, videoUrl, description })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Video added to store successfully! 🎥');
      document.getElementById('addVideoForm').reset();
      loadAdminData();
      switchAdminTab('orders');
    } else {
      showToast(data.message || 'Error adding video', 'error');
    }
  } catch (err) {
    console.error('Add video error:', err);
    showToast('Failed to add video.', 'error');
  }
}

// Add New PDF Form
async function handleAddPdf(e) {
  e.preventDefault();
  const title = document.getElementById('pTitle').value.trim();
  const category = document.getElementById('pCategory').value;
  const pages = document.getElementById('pPages').value;
  const price = document.getElementById('pPrice').value;
  const originalPrice = document.getElementById('pOriginalPrice').value;
  const previewSample = document.getElementById('pPreviewSample').value.trim();
  const description = document.getElementById('pDesc').value.trim();

  try {
    const res = await fetch('/api/admin/pdfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin
      },
      body: JSON.stringify({ title, category, pages, price, originalPrice, previewSample, description })
    });
    const data = await res.json();
    if (data.success) {
      showToast('PDF added to store successfully! 📘');
      document.getElementById('addPdfForm').reset();
      loadAdminData();
      switchAdminTab('orders');
    } else {
      showToast(data.message || 'Error adding PDF', 'error');
    }
  } catch (err) {
    console.error('Add PDF error:', err);
    showToast('Failed to add PDF.', 'error');
  }
}

// Save Settings Form
async function handleSaveSettings(e) {
  e.preventDefault();
  const upiId = document.getElementById('setUpiId').value.trim();
  const merchantName = document.getElementById('setMerchantName').value.trim();
  const whatsappNumber = document.getElementById('setWhatsapp').value.trim();
  const announcement = document.getElementById('setAnnouncement').value.trim();
  const adminPinNew = document.getElementById('setAdminPin').value.trim();

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': adminPin
      },
      body: JSON.stringify({
        upiId,
        merchantName,
        whatsappNumber,
        announcement,
        adminPin: adminPinNew || undefined
      })
    });
    const data = await res.json();
    if (data.success) {
      if (adminPinNew) {
        adminPin = adminPinNew;
        sessionStorage.setItem('hz_admin_pin', adminPin);
      }
      showToast('Store settings updated successfully! 💾');
    } else {
      showToast(data.message || 'Error saving settings', 'error');
    }
  } catch (err) {
    console.error('Save settings error:', err);
    showToast('Failed to save settings.', 'error');
  }
}

// Export CSV
function exportOrdersCsv() {
  window.open(`/api/admin/export-csv?pin=${encodeURIComponent(adminPin)}`, '_blank');
}
