// Hotty Zilla Secret Control Desk Logic
let secretPin = sessionStorage.getItem('hz_secret_pin') || '';
let cachedOrders = [];
let cachedMeetings = [];

document.addEventListener('DOMContentLoaded', () => {
  if (secretPin) {
    verifyAndLoad(secretPin);
  } else {
    showPinLock();
  }
});

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
  document.getElementById('secretMainDashboard').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

function secretLogout() {
  sessionStorage.removeItem('hz_secret_pin');
  secretPin = '';
  showPinLock();
  showToast('Control desk locked.');
}

async function handleSecretLogin(e) {
  e.preventDefault();
  const input = document.getElementById('secretPinInput').value.trim();
  if (input) verifyAndLoad(input);
}

async function verifyAndLoad(pin) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();

    if (data.success) {
      secretPin = pin;
      sessionStorage.setItem('hz_secret_pin', pin);
      document.getElementById('pinLockSection').style.display = 'none';
      document.getElementById('secretMainDashboard').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'inline-flex';
      loadSecretData();
      showToast('Welcome to Secret Control Vault!');
    } else {
      showToast(data.message || 'Incorrect PIN!', 'error');
      sessionStorage.removeItem('hz_secret_pin');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Failed to connect to server.', 'error');
  }
}

async function loadSecretData() {
  if (!secretPin) return;

  try {
    // 1. Stats
    const statsRes = await fetch('/api/admin/stats', { headers: { 'x-admin-pin': secretPin } });
    const statsData = await statsRes.json();
    if (statsData.success) {
      const s = statsData.stats;
      document.getElementById('sRev').textContent = `₹${(s.totalRevenue || 0).toLocaleString()}`;
      document.getElementById('sPending').textContent = s.pendingCount || 0;
      document.getElementById('sMeetings').textContent = s.totalMeetings || 0;
      document.getElementById('sMembers').textContent = s.totalMembers || 0;
      document.getElementById('countOrdersTab').textContent = s.totalOrders || 0;
      document.getElementById('countMeetingsTab').textContent = s.totalMeetings || 0;
    }

    // 2. Orders
    const ordersRes = await fetch('/api/admin/orders', { headers: { 'x-admin-pin': secretPin } });
    const ordersData = await ordersRes.json();
    if (ordersData.success) {
      cachedOrders = ordersData.orders || [];
      renderSecOrders(cachedOrders);
    }

    // 3. Meetings
    const meetRes = await fetch('/api/admin/meetings', { headers: { 'x-admin-pin': secretPin } });
    const meetData = await meetRes.json();
    if (meetData.success) {
      cachedMeetings = meetData.meetings || [];
      renderSecMeetings(cachedMeetings);
    }

    // 4. Catalog details for forms, videos and categories
    const catRes = await fetch('/api/catalog');
    const catData = await catRes.json();
    if (catData.success) {
      // Videos rendering & count
      const videos = catData.videos || [];
      if (document.getElementById('countVideosTab')) document.getElementById('countVideosTab').textContent = videos.length;
      if (document.getElementById('manageVideoCountHeader')) document.getElementById('manageVideoCountHeader').textContent = videos.length;
      renderSecVideos(videos);

      // Categories rendering & count
      const categories = catData.categories || [];
      if (document.getElementById('countCatsTab')) document.getElementById('countCatsTab').textContent = categories.length;
      renderSecCategories(categories);

      // Populate category dropdown in simple upload form
      const catSelect = document.getElementById('simpCategory');
      if (catSelect) {
        catSelect.innerHTML = categories.map(c => `<option value="${c.name}">${c.icon || '⭐'} ${c.name}</option>`).join('');
      }

      // Memberships
      (catData.memberships || []).forEach(m => {
        if (m.id === 'plan-1m' && document.getElementById('mPrice1')) document.getElementById('mPrice1').value = m.price;
        if (m.id === 'plan-3m' && document.getElementById('mPrice3')) document.getElementById('mPrice3').value = m.price;
        if (m.id === 'plan-6m' && document.getElementById('mPrice6')) document.getElementById('mPrice6').value = m.price;
        if (m.id === 'plan-12m' && document.getElementById('mPrice12')) document.getElementById('mPrice12').value = m.price;
      });

      // SPA
      if (catData.spaCourse) {
        const sp = catData.spaCourse;
        if (document.getElementById('spaTitle')) document.getElementById('spaTitle').value = sp.title || '';
        if (document.getElementById('spaPrice')) document.getElementById('spaPrice').value = sp.price || 299;
        if (document.getElementById('spaOrigPrice')) document.getElementById('spaOrigPrice').value = sp.originalPrice || 999;
        if (document.getElementById('spaPages')) document.getElementById('spaPages').value = sp.pages || 120;
        if (document.getElementById('spaPreview')) document.getElementById('spaPreview').value = sp.previewSample || '';
        if (document.getElementById('spaDesc')) document.getElementById('spaDesc').value = sp.description || '';
      }
    }

    // 5. Settings
    const infoRes = await fetch('/api/site-info');
    const infoData = await infoRes.json();
    if (infoData.success && infoData.settings) {
      const set = infoData.settings;
      if (document.getElementById('setUpi')) document.getElementById('setUpi').value = set.upiId || '';
      if (document.getElementById('setMerchant')) document.getElementById('setMerchant').value = set.merchantName || '';
      if (document.getElementById('setWa')) document.getElementById('setWa').value = set.whatsappNumber || '';
      if (document.getElementById('setAnn')) document.getElementById('setAnn').value = set.announcement || '';
    }

    // 6. Creators (Monetization & Verification)
    const creatorsRes = await fetch('/api/admin/creators', { headers: { 'x-admin-pin': secretPin } });
    const creatorsData = await creatorsRes.json();
    if (creatorsData.success) {
      const creators = creatorsData.creators || [];
      if (document.getElementById('countCreatorsTab')) document.getElementById('countCreatorsTab').textContent = creators.length;
      if (document.getElementById('creatorCountHeader')) document.getElementById('creatorCountHeader').textContent = creators.length;
      renderSecCreators(creators);
    }

    // 7. Campaigns & Ad Frequency
    const campsRes = await fetch('/api/admin/campaigns', { headers: { 'x-admin-pin': secretPin } });
    const campsData = await campsRes.json();
    if (campsData.success) {
      const campaigns = campsData.campaigns || [];
      if (document.getElementById('countAdsTab')) document.getElementById('countAdsTab').textContent = campaigns.length;
      if (document.getElementById('adFrequencySelect')) document.getElementById('adFrequencySelect').value = campsData.adFrequencyPerDay || 3;
      renderSecCampaigns(campaigns);
    }

    // 8. Creator Payouts
    try {
      const payoutsRes = await fetch('/api/admin/payouts', { headers: { 'x-admin-pin': secretPin } });
      const payoutsData = await payoutsRes.json();
      if (payoutsData.success) {
        renderSecPayouts(payoutsData.payouts || []);
      }
    } catch (e) {
      console.warn('Payouts load error:', e);
    }
  } catch (err) {
    console.error('Error loading secret desk data:', err);
  }
}

// Render Orders
function renderSecOrders(orders) {
  const tbody = document.getElementById('secOrdersTbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">Koi order nahi mila.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const isPending = o.status === 'pending_verification';
    const isApproved = o.status === 'approved';
    const statusHtml = isPending 
      ? `<span class="badge-status pending_verification">⏳ Pending</span>`
      : (isApproved ? `<span class="badge-status approved">✅ Approved</span>` : `<span class="badge-status rejected">❌ Rejected</span>`);

    const cleanWa = (o.whatsapp || o.mobile || '').replace(/\D/g, '').slice(-10);
    const waMsg = encodeURIComponent(`Namaste ${o.customerName}! Hotty Zilla VIP se aapka order (${o.itemTitle}) unlock kar diya gaya hai. Aap http://localhost:5000/my-library.html par dekh sakte hain!`);

    return `
      <tr>
        <td style="font-family: monospace; color: var(--gold); font-weight: 700;">${o.orderId}</td>
        <td>
          <div style="font-weight: 700;">${o.customerName}</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">📱 ${o.mobile}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${o.itemTitle}</div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--cyan);">${o.itemType}</span>
        </td>
        <td style="font-weight: 800; font-size: 1.05rem;">₹${o.amount}</td>
        <td>
          <div style="font-size: 0.8rem; text-transform: uppercase;">
            ${o.paymentMode === 'razorpay_live' ? '<span style="color: var(--emerald); font-weight: 800;">⚡ Razorpay Live</span>' : o.paymentMode}
          </div>
          <div style="font-family: monospace; font-size: 0.78rem; color: var(--gold);">${o.utr || 'N/A'}</div>
        </td>
        <td>${statusHtml}</td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            ${isPending ? `
              <button class="btn btn-gold btn-sm" onclick="approveSecOrder('${o.orderId}')" title="Approve & Unlock Access">
                ✅ Approve
              </button>
              <button class="btn btn-outline btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="rejectSecOrder('${o.orderId}')">
                ✕
              </button>
            ` : ''}
            <a href="https://wa.me/91${cleanWa}?text=${waMsg}" target="_blank" class="btn btn-outline btn-sm" style="border-color: #25d366; color: #25d366;">
              💬 WhatsApp
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterSecOrders(filter) {
  if (filter === 'pending') renderSecOrders(cachedOrders.filter(o => o.status === 'pending_verification'));
  else if (filter === 'approved') renderSecOrders(cachedOrders.filter(o => o.status === 'approved'));
  else renderSecOrders(cachedOrders);
}

async function approveSecOrder(orderId) {
  if (!confirm(`Order ${orderId} ko approve karke student/VIP access unlock karein?`)) return;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order ${orderId} approved and VIP unlocked! 🎉`);
      loadSecretData();
    } else {
      showToast(data.message || 'Error approving order', 'error');
    }
  } catch (err) {
    showToast('Failed to approve order.', 'error');
  }
}

async function rejectSecOrder(orderId) {
  if (!confirm(`Order ${orderId} ko reject karein?`)) return;
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order ${orderId} rejected.`);
      loadSecretData();
    }
  } catch (err) {
    console.error(err);
  }
}

// Render Meetings
function renderSecMeetings(meetings) {
  const tbody = document.getElementById('secMeetingsTbody');
  if (!tbody) return;

  if (meetings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 30px;">Koi meeting request nahi aayi hai.</td></tr>`;
    return;
  }

  tbody.innerHTML = meetings.map(m => {
    const cleanWa = m.mobile.replace(/\D/g, '').slice(-10);
    const waMsg = encodeURIComponent(`Namaste ${m.customerName}! Hotty Zilla VIP se humne aapki meeting request received ki hai for ${m.friendName} in ${m.city}. Kab baat karein?`);
    
    return `
      <tr>
        <td style="font-weight: 700;">${m.customerName}</td>
        <td>📱 ${m.mobile}</td>
        <td><span class="badge-pill badge-gold" style="font-size: 0.75rem;">${m.city}</span></td>
        <td style="color: var(--cyan); font-weight: 600;">${m.friendName}</td>
        <td>${m.preferredDate || 'Flexible'}</td>
        <td style="max-width: 200px; font-size: 0.82rem; color: var(--text-muted);">${m.message || 'No extra message'}</td>
        <td><span class="badge-pill badge-fire" style="font-size: 0.75rem;">${m.status}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <a href="https://wa.me/91${cleanWa}?text=${waMsg}" target="_blank" class="btn btn-outline btn-sm" style="border-color: #25d366; color: #25d366;">
              💬 Chat
            </a>
            <button class="btn btn-outline btn-sm" onclick="markMeetingStatus('${m.id}', 'contacted')">
              ✓ Contacted
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function markMeetingStatus(id, status) {
  try {
    const res = await fetch(`/api/admin/meetings/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Meeting status updated!');
      loadSecretData();
    }
  } catch (err) {
    console.error(err);
  }
}

// Tab Switching
function switchSecretTab(tabName, btnElement) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  document.getElementById('tabSecOrders').style.display = tabName === 'orders' ? 'block' : 'none';
  document.getElementById('tabSecMeetings').style.display = tabName === 'meetings' ? 'block' : 'none';
  document.getElementById('tabSecUploadVideo').style.display = tabName === 'upload-video' ? 'block' : 'none';
  document.getElementById('tabSecManageVideos').style.display = tabName === 'manage-videos' ? 'block' : 'none';
  document.getElementById('tabSecCategories').style.display = tabName === 'categories' ? 'block' : 'none';
  document.getElementById('tabSecCreators').style.display = tabName === 'creators' ? 'block' : 'none';
  document.getElementById('tabSecCampaigns').style.display = tabName === 'campaigns' ? 'block' : 'none';
  document.getElementById('tabSecMemberships').style.display = tabName === 'memberships' ? 'block' : 'none';
  document.getElementById('tabSecSpaCourse').style.display = tabName === 'spa-course' ? 'block' : 'none';
  document.getElementById('tabSecSettings').style.display = tabName === 'settings' ? 'block' : 'none';
}

let adminUploadMode = 'url';

function setAdminUploadMode(mode) {
  adminUploadMode = mode;
  const urlBtn = document.getElementById('adminUploadModeUrlBtn');
  const fileBtn = document.getElementById('adminUploadModeFileBtn');
  const urlBox = document.getElementById('adminUrlInputBox');
  const fileBox = document.getElementById('adminFileInputBox');
  const submitBtn = document.getElementById('simpVideoSubmitBtn');

  if (mode === 'url') {
    if (urlBtn) urlBtn.className = 'btn btn-primary';
    if (fileBtn) fileBtn.className = 'btn btn-outline';
    if (urlBox) urlBox.style.display = 'block';
    if (fileBox) fileBox.style.display = 'none';
    if (submitBtn) submitBtn.innerHTML = '<span>🚀</span> Publish Video Stream to Website';
  } else {
    if (fileBtn) fileBtn.className = 'btn btn-primary';
    if (urlBtn) urlBtn.className = 'btn btn-outline';
    if (fileBox) fileBox.style.display = 'block';
    if (urlBox) urlBox.style.display = 'none';
    if (submitBtn) submitBtn.innerHTML = '<span>🚀</span> Laptop se Video Upload &amp; Live Karein';
  }
}

// 1. Simple Video Upload (Supports Direct Video Link or Laptop File)
async function handleSimpleVideoUpload(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('simpVideoSubmitBtn');
  const title = document.getElementById('simpTitle').value.trim();
  const category = document.getElementById('simpCategory').value;
  const price = document.getElementById('simpPrice').value || '99';
  const description = document.getElementById('simpDesc').value.trim();

  if (adminUploadMode === 'url') {
    const videoUrl = document.getElementById('simpVideoUrl').value.trim();
    if (!videoUrl) {
      showToast('Kripya video URL enter karein (Gofile / Catbox / MP4)', 'error');
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing video...';

    try {
      const res = await fetch('/api/admin/upload-video-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
        body: JSON.stringify({ videoUrl, title, category, price, description })
      });
      const data = await res.json();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>🚀</span> Publish Video Stream to Website';

      if (data.success) {
        showToast('Video successfully live ho gayi! 🎥');
        try {
          if (data.video) {
            let localVideos = JSON.parse(localStorage.getItem('hz_admin_videos') || '[]');
            if (!localVideos.some(v => v.id === data.video.id)) {
              localVideos.unshift(data.video);
              localStorage.setItem('hz_admin_videos', JSON.stringify(localVideos));
            }
          }
        } catch(e) {}
        document.getElementById('simpleVideoUploadForm').reset();
        loadSecretData();
        const manageTabBtn = document.querySelectorAll('.filter-tab')[3];
        switchSecretTab('manage-videos', manageTabBtn);
      } else {
        showToast(data.message || 'Error publishing video', 'error');
      }
    } catch(err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>🚀</span> Publish Video Stream to Website';
      showToast('Failed to connect to server', 'error');
    }
    return;
  }

  // Laptop File Mode
  const fileInput = document.getElementById('simpVideoFile');
  if (!fileInput.files || !fileInput.files[0]) {
    showToast('Kripya laptop se video file select karein!', 'error');
    return;
  }

  const file = fileInput.files[0];
  const progressBox = document.getElementById('simpUploadProgressBox');
  const percentText = document.getElementById('simpUploadPercentText');
  const statusText = document.getElementById('simpUploadStatusText');
  const progressBar = document.getElementById('simpProgressBarFill');
  const bytesText = document.getElementById('simpUploadBytesText');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading from laptop...';
  progressBox.style.display = 'block';
  progressBar.style.width = '0%';
  percentText.textContent = '0%';
  statusText.textContent = 'Laptop se video upload ho rahi hai... Kripya intezar karein.';

  const formData = new FormData();
  formData.append('videoFile', file);
  formData.append('title', title);
  formData.append('category', category);
  formData.append('price', price);
  formData.append('description', description);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/admin/upload-video-simple', true);
  xhr.setRequestHeader('x-admin-pin', secretPin);

  const totalMb = (file.size / (1024 * 1024)).toFixed(1);

  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      const loadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
      progressBar.style.width = percent + '%';
      percentText.textContent = percent + '%';
      if (bytesText) bytesText.textContent = `${loadedMb} MB / ${totalMb} MB uploaded`;
      if (percent >= 100) {
        statusText.textContent = 'Server processing and finalizing video... Bas thoda samay!';
      }
    }
  };

  xhr.onload = function() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>🚀</span> Laptop se Video Upload &amp; Live Karein';
    progressBox.style.display = 'none';

    try {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 200 && data.success) {
        showToast('Video successfully upload ho gayi aur website par live hai! 🎥');
        document.getElementById('simpleVideoUploadForm').reset();
        loadSecretData();
        // Switch to manage videos tab
        const manageTabBtn = document.querySelectorAll('.filter-tab')[3];
        switchSecretTab('manage-videos', manageTabBtn);
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch(err) {
      showToast('Upload error occurred', 'error');
    }
  };

  xhr.onerror = function() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>🚀</span> Laptop se Video Upload &amp; Live Karein';
    progressBox.style.display = 'none';
    showToast('Network error during upload.', 'error');
  };

  xhr.send(formData);
}

// 1.1 Render Manage Videos Table
function renderSecVideos(videos) {
  const tbody = document.getElementById('secVideosTbody');
  if (!tbody) return;

  if (videos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">Koi video upload nahi hui hai. "Upload Video" tab se upload karein.</td></tr>`;
    return;
  }

  tbody.innerHTML = videos.map(v => {
    return `
      <tr>
        <td style="width: 70px;">
          <div style="width: 54px; height: 38px; background: #000; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
            <video src="${v.shortClipUrl}" muted preload="metadata" style="width: 100%; height: 100%; object-fit: cover;"></video>
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${v.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${v.description || 'No description'}</div>
        </td>
        <td><span class="badge-pill badge-gold" style="font-size: 0.75rem;">${v.category || 'General'}</span></td>
        <td style="font-weight: 800; color: var(--gold); font-size: 1rem;">₹${v.price}</td>
        <td>
          <div style="font-size: 0.8rem; color: var(--cyan);">${v.fullDuration || 'Full HD'}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); font-family: monospace;">${v.id}</div>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="deleteVideo('${v.id}', '${v.title.replace(/'/g, "\\'")}')">
            🗑️ Delete Video
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 1.2 Delete Video Function
async function deleteVideo(id, title) {
  if (!confirm(`Kya aap sach me video "${title}" ko delete karna chahte hain? Ye website aur server se turant remove ho jayegi.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/videos/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': secretPin }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Video successfully deleted! 🗑️');
      try {
        let localVideos = JSON.parse(localStorage.getItem('hz_admin_videos') || '[]');
        localVideos = localVideos.filter(v => v.id !== id);
        localStorage.setItem('hz_admin_videos', JSON.stringify(localVideos));
      } catch(e) {}
      loadSecretData();
    } else {
      showToast(data.message || 'Error deleting video', 'error');
    }
  } catch (err) {
    showToast('Failed to delete video.', 'error');
  }
}

// 1.3 Add Category
async function handleAddCategory(e) {
  e.preventDefault();
  const name = document.getElementById('catName').value.trim();
  const icon = document.getElementById('catIcon').value.trim() || '🔥';
  const description = document.getElementById('catDesc').value.trim();

  if (!name) {
    showToast('Category name is required', 'error');
    return;
  }

  try {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ name, icon, description })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Category "${name}" successfully add ho gayi! 🏷️`);
      document.getElementById('addCategoryForm').reset();
      loadSecretData();
    } else {
      showToast(data.message || 'Error adding category', 'error');
    }
  } catch (err) {
    showToast('Failed to add category.', 'error');
  }
}

// 1.4 Delete Category
async function deleteCategory(id, name) {
  if (id === 'cat-all') {
    showToast('All Videos default category delete nahi ho sakti.', 'error');
    return;
  }
  if (!confirm(`Kya aap "${name}" category ko delete karna chahte hain?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': secretPin }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Category "${name}" delete ho gayi! 🗑️`);
      loadSecretData();
    } else {
      showToast(data.message || 'Error deleting category', 'error');
    }
  } catch (err) {
    showToast('Failed to delete category.', 'error');
  }
}

// 1.5 Render Categories List
function renderSecCategories(categories) {
  const container = document.getElementById('secCategoriesList');
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = `<div style="color: var(--text-dim); text-align: center; padding: 20px;">Koi category nahi hai.</div>`;
    return;
  }

  container.innerHTML = categories.map(c => {
    const isAll = c.id === 'cat-all';
    return `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 1.8rem;">${c.icon || '⭐'}</div>
          <div>
            <div style="font-weight: 700; color: #fff; font-size: 1.05rem;">${c.name}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">${c.description || 'No description'}</div>
          </div>
        </div>
        <div>
          ${!isAll ? `
            <button class="btn btn-outline btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="deleteCategory('${c.id}', '${c.name.replace(/'/g, "\\'")}')">
              🗑️ Delete
            </button>
          ` : `<span style="font-size: 0.75rem; color: var(--gold); font-weight: 700;">DEFAULT</span>`}
        </div>
      </div>
    `;
  }).join('');
}

// 2. Save Memberships
async function handleSaveMemberships(e) {
  e.preventDefault();
  const plan1m = document.getElementById('mPrice1').value;
  const plan3m = document.getElementById('mPrice3').value;
  const plan6m = document.getElementById('mPrice6').value;
  const plan12m = document.getElementById('mPrice12').value;

  try {
    const res = await fetch('/api/admin/memberships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ plan1m, plan3m, plan6m, plan12m })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Membership Pricing Updated! 👑');
    }
  } catch (err) {
    showToast('Failed to update membership prices.', 'error');
  }
}

// 3. Save SPA Course (Supports Direct PDF Upload from Laptop)
function handleSaveSpaCourse(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('spaSubmitBtn');
  const progressBox = document.getElementById('spaUploadProgressBox');
  const percentText = document.getElementById('spaUploadPercentText');
  const progressBar = document.getElementById('spaProgressBarFill');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving & Uploading...';
  progressBox.style.display = 'block';
  progressBar.style.width = '0%';
  percentText.textContent = '0%';

  const formData = new FormData();
  formData.append('title', document.getElementById('spaTitle').value.trim());
  formData.append('price', document.getElementById('spaPrice').value);
  formData.append('originalPrice', document.getElementById('spaOrigPrice').value);
  formData.append('pages', document.getElementById('spaPages').value);
  formData.append('previewSample', document.getElementById('spaPreview').value.trim());
  formData.append('description', document.getElementById('spaDesc').value.trim());

  const pdfInput = document.getElementById('spaPdfFileInput');
  if (pdfInput.files && pdfInput.files[0]) {
    formData.append('spaPdfFile', pdfInput.files[0]);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/admin/upload-spa-bundle', true);
  xhr.setRequestHeader('x-admin-pin', secretPin);

  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      progressBar.style.width = percent + '%';
      percentText.textContent = percent + '%';
    }
  };

  xhr.onload = function() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>💾</span> Save &amp; Upload SPA PDF from Laptop';
    progressBox.style.display = 'none';

    try {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 200 && data.success) {
        showToast('SPA Course PDF details aur file laptop se update ho gayi! 💆');
        if (pdfInput) pdfInput.value = '';
        loadSecretData();
      } else {
        showToast(data.message || 'Error saving SPA course', 'error');
      }
    } catch(err) {
      showToast('Error parsing response', 'error');
    }
  };

  xhr.onerror = function() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>💾</span> Save &amp; Upload SPA PDF from Laptop';
    progressBox.style.display = 'none';
    showToast('Network error while saving SPA PDF', 'error');
  };

  xhr.send(formData);
}

// 4. Save Settings
async function handleSaveSecSettings(e) {
  e.preventDefault();
  const upiId = document.getElementById('setUpi').value.trim();
  const merchantName = document.getElementById('setMerchant').value.trim();
  const whatsappNumber = document.getElementById('setWa').value.trim();
  const announcement = document.getElementById('setAnn').value.trim();
  const adminPin = document.getElementById('setPin').value.trim();

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ upiId, merchantName, whatsappNumber, announcement, adminPin: adminPin || undefined })
    });
    const data = await res.json();
    if (data.success) {
      if (adminPin) {
        secretPin = adminPin;
        sessionStorage.setItem('hz_secret_pin', secretPin);
      }
      showToast('Settings saved successfully! 💾');
    }
  } catch (err) {
    showToast('Failed to save settings.', 'error');
  }
}

function exportOrdersCsv() {
  window.open(`/api/admin/export-csv?pin=${encodeURIComponent(secretPin)}`, '_blank');
}

// ==============================================
// CREATOR PROGRAM & CAMPAIGN MANAGEMENT HANDLERS
// ==============================================

function renderSecCreators(creators) {
  const tbody = document.getElementById('secCreatorsTbody');
  if (!tbody) return;

  if (creators.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">Koi creator application nahi aayi hai.</td></tr>`;
    return;
  }

  tbody.innerHTML = creators.map(c => {
    const isPending = c.status === 'pending_verification';
    const isApproved = c.status === 'approved';
    const statusHtml = isPending
      ? `<span class="badge-status pending_verification">⏳ Pending (10-15 Min)</span>`
      : (isApproved ? `<span class="badge-status approved">✅ Approved &amp; Active</span>` : `<span class="badge-status rejected">❌ Rejected</span>`);

    return `
      <tr>
        <td>
          <div style="font-weight: 800; color: var(--gold); font-size: 1rem;">${c.handle}</div>
          <div style="font-size: 0.75rem; color: var(--cyan);">${c.category || 'Creator'}</div>
        </td>
        <td style="font-weight: 700; color: #fff;">${c.realName}</td>
        <td>
          <div>Age: <strong>${c.age} Yrs</strong></div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${c.city || 'N/A'}</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: #e2e8f0;">${c.address || 'Address provided'}</div>
          <div style="font-size: 0.78rem; color: var(--gold);">📧 ${c.email}</div>
        </td>
        <td>
          <div style="font-size: 1.1rem; font-weight: 900; color: var(--emerald);">$${Number(c.earningsUSD || 0).toFixed(2)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">${Number(c.totalViews || 0).toLocaleString()} Views</div>
        </td>
        <td>${statusHtml}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${isPending ? `
              <button class="btn btn-gold btn-sm" onclick="approveCreator('${c.id}', '${c.realName.replace(/'/g, "\\'")}', '${(c.email || '').replace(/'/g, "\\'")}')" title="Approve Creator for Monetization">
                ⚡ Instant Approve
              </button>
              <button class="btn btn-outline btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="rejectCreator('${c.id}', '${c.realName.replace(/'/g, "\\'")}')">
                ✕ Reject
              </button>
            ` : (isApproved ? `
              <span style="font-size: 0.8rem; color: var(--emerald); font-weight: 700;">✓ Monetized Active</span>
            ` : `
              <button class="btn btn-outline btn-sm" onclick="approveCreator('${c.id}', '${c.realName.replace(/'/g, "\\'")}', '${(c.email || '').replace(/'/g, "\\'")}')">
                Re-Approve
              </button>
            `)}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function approveCreator(id, name, email) {
  try {
    const res = await fetch(`/api/admin/creators/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin, 'Cache-Control': 'no-cache' }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`⚡ Creator "${name}" instantly approved! Creator Studio live. 🌟`);
      
      // Instant Cross-Tab Sync via BroadcastChannel & LocalStorage
      try {
        const channel = new BroadcastChannel('hz_creator_sync');
        channel.postMessage({ action: 'APPROVED', creatorId: id, email: email, timestamp: Date.now() });
        channel.close();
      } catch(e) {}
      try {
        if (email) {
          localStorage.setItem('hz_creator_approved_' + email.toLowerCase(), 'true');
        }
        localStorage.setItem('hz_last_approval_event', JSON.stringify({ creatorId: id, email, time: Date.now() }));
      } catch(e) {}

      loadSecretData();
    } else {
      showToast(data.message || 'Error approving creator', 'error');
    }
  } catch (err) {
    showToast('Failed to approve creator.', 'error');
  }
}

async function rejectCreator(id, name) {
  if (!confirm(`Creator "${name}" ki application reject karein?`)) return;

  try {
    const res = await fetch(`/api/admin/creators/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin }
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Creator application rejected.`);
      loadSecretData();
    }
  } catch (err) {
    showToast('Failed to reject creator.', 'error');
  }
}

function renderSecCampaigns(campaigns) {
  const tbody = document.getElementById('secCampaignsTbody');
  if (!tbody) return;

  if (campaigns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">Koi promoted video campaign nahi hai.</td></tr>`;
    return;
  }

  tbody.innerHTML = campaigns.map(camp => {
    const isActive = camp.status === 'active';
    return `
      <tr>
        <td style="font-family: monospace; color: var(--gold); font-weight: 700;">${camp.id}</td>
        <td>
          <div style="font-weight: 700; color: #fff;">${camp.videoTitle}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${camp.creatorName} (${camp.creatorEmail})</div>
        </td>
        <td style="font-weight: 800; color: var(--cyan); font-size: 1.05rem;">
          🚀 ${Number(camp.targetViews).toLocaleString()} Views
        </td>
        <td>
          <div style="font-weight: 800; color: var(--gold);">₹${camp.amountINR}</div>
          <div style="font-size: 0.75rem; color: var(--emerald);">$${camp.amountUSD || '0.00'} USD</div>
        </td>
        <td>
          <div>${Number(camp.impressionsDelivered || 0).toLocaleString()} Delivered</div>
        </td>
        <td>
          <span class="badge-status ${isActive ? 'approved' : 'pending_verification'}">
            ${isActive ? '🔥 Active Running' : '⏸️ Paused'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleCampaignStatus('${camp.id}', '${isActive ? 'paused' : 'active'}')">
            ${isActive ? '⏸️ Pause Ad' : '▶ Resume Ad'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleCampaignStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/admin/campaigns/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Campaign status updated to ${newStatus}!`);
      loadSecretData();
    }
  } catch (err) {
    showToast('Failed to update campaign.', 'error');
  }
}

async function handleSaveAdFrequency(e) {
  e.preventDefault();
  const frequency = document.getElementById('adFrequencySelect').value;

  try {
    const res = await fetch('/api/admin/settings/ad-frequency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ frequency })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Daily ad frequency saved! 📢');
    }
  } catch (err) {
    showToast('Failed to save ad frequency.', 'error');
  }
}

// 9. Render Creator Cashout / Payout Requests
function renderSecPayouts(payouts) {
  const tbody = document.getElementById('secPayoutsTbody');
  const badge = document.getElementById('payoutCountBadge');
  if (badge) badge.textContent = `${payouts.length} Requests`;
  if (!tbody) return;

  if (payouts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 25px;">Koi cashout / payout request nahi aayi hai.</td></tr>`;
    return;
  }

  tbody.innerHTML = payouts.map(p => {
    const isPending = p.status === 'pending';
    const statusBadge = isPending
      ? `<span class="badge-status pending_verification">⏳ Pending Wire</span>`
      : `<span class="badge-status approved">✅ Paid</span>`;

    return `
      <tr>
        <td style="font-family: monospace; color: var(--gold); font-weight: 700;">${p.id}</td>
        <td style="font-weight: 700; color: #fff;">${p.creatorHandle || p.creatorEmail}</td>
        <td style="font-weight: 900; color: var(--emerald); font-size: 1.1rem;">$${Number(p.amountUSD).toFixed(2)}</td>
        <td style="color: var(--cyan); font-weight: 700; text-transform: uppercase;">${p.method}</td>
        <td>
          <div style="font-size: 0.85rem; font-family: monospace; color: #f1f5f9; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">
            ${p.payoutDetails}
          </div>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
        <td>${statusBadge}</td>
        <td>
          ${isPending ? `
            <button class="btn btn-gold btn-sm" onclick="approvePayout('${p.id}', '${p.method}', '${p.amountUSD}')">
              ✅ Mark Paid
            </button>
          ` : `
            <span style="font-size: 0.8rem; color: var(--emerald); font-weight: 700;">✓ Completed</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

async function approvePayout(id, method, amountUSD) {
  if (!confirm(`Payout request ${id} ($${amountUSD} USD via ${method}) ko mark paid karein?`)) return;

  try {
    const res = await fetch(`/api/admin/payouts/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': secretPin },
      body: JSON.stringify({ transactionRef: 'TXN-' + Date.now().toString(36).toUpperCase() })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Payout successfully marked as paid! ✅');
      loadSecretData();
    } else {
      showToast(data.message || 'Error marking payout', 'error');
    }
  } catch(err) {
    showToast('Failed to mark payout as paid.', 'error');
  }
}
