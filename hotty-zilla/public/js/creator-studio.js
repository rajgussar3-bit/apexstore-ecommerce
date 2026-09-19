// Hotty Zilla Creator Studio Engine (xHamster / Faphouse Monetization Architecture)
let currentCreatorUser = null;
let currentCreatorData = null;
let studioActiveTab = 'upload';
let pollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initCreatorStudio();
  setupInstantCrossTabSync();
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

// Instant Cross-Tab Real-Time Sync via BroadcastChannel and Storage Events
function setupInstantCrossTabSync() {
  try {
    const syncChannel = new BroadcastChannel('hz_creator_sync');
    syncChannel.onmessage = (event) => {
      if (event.data && (event.data.action === 'APPROVED' || event.data.type === 'CREATOR_APPROVED')) {
        const approvedEmail = (event.data.email || '').toLowerCase();
        const myEmail = (currentCreatorUser?.email || localStorage.getItem('hz_creator_email') || '').toLowerCase();
        if (!approvedEmail || !myEmail || approvedEmail === myEmail) {
          showToast('🎉 Control Desk dwara Creator Studio turant approve ho gaya! 🌟', 'success');
          checkCreatorAuth(myEmail || approvedEmail, true);
        }
      }
    };
  } catch(e) {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'hz_last_approval_event' || (e.key && e.key.startsWith('hz_creator_approved_'))) {
      const myEmail = (currentCreatorUser?.email || localStorage.getItem('hz_creator_email') || '').toLowerCase();
      if (myEmail) {
        checkCreatorAuth(myEmail, true);
      }
    }
  });
}

// Creator Local Storage Helpers (Permanent Session Persistence)
function getSavedCreatorProfile() {
  try {
    const raw = localStorage.getItem('hz_creator_profile');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function saveCreatorProfileLocally(profile) {
  if (!profile) return;
  try {
    const existing = getSavedCreatorProfile() || {};
    const merged = { ...existing, ...profile };
    localStorage.setItem('hz_creator_profile', JSON.stringify(merged));
    if (merged.email) {
      localStorage.setItem('hz_creator_email', merged.email.toLowerCase().trim());
    }
    if (merged.status) {
      localStorage.setItem('hz_creator_status', merged.status);
    }
    if (merged.status === 'approved') {
      localStorage.setItem('hz_is_creator', 'true');
      if (merged.email) {
        localStorage.setItem('hz_creator_approved_' + merged.email.toLowerCase().trim(), 'true');
      }
    }
    localStorage.setItem('hz_creator_applied', 'true');
  } catch(e) {}
}

function startCreatorPoll(email) {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(() => {
    checkCreatorAuth(email);
  }, 1200);
}

function prefillApplyForm(customer) {
  if (!customer) return;
  try {
    const rName = document.getElementById('gCrRealName');
    const em = document.getElementById('gCrEmail');
    const ag = document.getElementById('gCrAge');
    const hdl = document.getElementById('gCrHandle');
    if (rName && !rName.value && customer.name) rName.value = customer.name;
    if (em && !em.value && customer.email) em.value = customer.email;
    if (ag && !ag.value && customer.age) ag.value = customer.age;
    if (hdl && !hdl.value && customer.name) hdl.value = '@' + customer.name.replace(/\s+/g, '').toLowerCase();
  } catch(e) {}
}

function initCreatorStudio() {
  const storedProfile = getSavedCreatorProfile();
  const directEmail = (localStorage.getItem('hz_creator_email') || storedProfile?.email || '').toLowerCase().trim();
  const isApproved = localStorage.getItem('hz_creator_approved_' + directEmail) === 'true' || 
                     localStorage.getItem('hz_is_creator') === 'true' || 
                     localStorage.getItem('hz_creator_status') === 'approved' || 
                     storedProfile?.status === 'approved';

  // 1. If already approved, IMMEDIATELY UNLOCK THE DASHBOARD! ZERO DELAY!
  if (isApproved && (directEmail || storedProfile)) {
    const creator = storedProfile || {
      email: directEmail,
      realName: 'Hotty Creator',
      handle: '@creator',
      status: 'approved',
      earningsUSD: 0,
      totalViews: 0
    };
    creator.status = 'approved';
    currentCreatorUser = creator;
    currentCreatorData = {
      creator,
      rateUSD: 1.50,
      analytics: {
        totalViews: creator.totalViews || 0,
        totalEarningsUSD: creator.earningsUSD || 0,
        availableBalanceUSD: creator.earningsUSD || 0
      }
    };
    showGateState('dashboard');
    renderDashboard(currentCreatorData);

    // Sync in background and fetch fresh metrics
    syncAndRefreshCreator(creator);
    return;
  }

  // 2. If already submitted application (Pending Verification) - NEVER SHOW BLANK FORM!
  const isApplied = localStorage.getItem('hz_creator_applied') === 'true' || 
                    localStorage.getItem('hz_creator_status') === 'pending_verification' || 
                    localStorage.getItem('hz_creator_status') === 'pending' || 
                    storedProfile?.status === 'pending_verification' || 
                    storedProfile?.status === 'pending';

  if (isApplied && (directEmail || storedProfile)) {
    currentCreatorUser = storedProfile || { email: directEmail };
    showGateState('pending', { email: directEmail });
    startCreatorPoll(directEmail);
    syncAndRefreshCreator(storedProfile || { email: directEmail, status: 'pending_verification' });
    return;
  }

  // 3. If logged in as customer on website
  try {
    const custStored = localStorage.getItem('hz_customer_user');
    if (custStored) {
      const parsed = JSON.parse(custStored);
      if (parsed && parsed.email) {
        if (parsed.isCreator) {
          localStorage.setItem('hz_creator_approved_' + parsed.email.toLowerCase(), 'true');
          localStorage.setItem('hz_is_creator', 'true');
          const creator = {
            email: parsed.email.toLowerCase(),
            realName: parsed.name || 'Creator',
            handle: '@' + (parsed.name || 'creator').replace(/\s+/g, '').toLowerCase(),
            status: 'approved'
          };
          saveCreatorProfileLocally(creator);
          initCreatorStudio();
          return;
        }
        // Prefill form for fast 1-click submit
        prefillApplyForm(parsed);
        showGateState('not-applied');
        return;
      }
    }
  } catch(e) {}

  // 4. If completely new visitor
  showGateState('not-applied');
}

async function syncAndRefreshCreator(creatorObj) {
  if (!creatorObj || !creatorObj.email) return;
  const email = creatorObj.email.toLowerCase().trim();

  try {
    // Restore creator into server memory/disk so serverless container always knows about this creator
    await fetch('/api/creator/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator: creatorObj })
    });
  } catch(e) {}

  try {
    const res = await fetch(`/api/creator/status?email=${encodeURIComponent(email)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    const data = await res.json();
    if (data.success && data.applied && data.creator) {
      currentCreatorData = data;
      const c = data.creator;
      saveCreatorProfileLocally(c);
      if (c.status === 'approved') {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        showGateState('dashboard');
        renderDashboard(data);
      } else if (c.status === 'pending_verification') {
        showGateState('pending', { email });
      }
    }
  } catch(e) {}
}

function showGateState(state, data = {}) {
  const gateMain = document.getElementById('gatekeeperContainer');
  const gateLogin = document.getElementById('gateNeedLogin');
  const gatePending = document.getElementById('gatePendingApproval');
  const gateNotApplied = document.getElementById('gateNotApplied');
  const dashMain = document.getElementById('studioDashboardMain');
  const idBadge = document.getElementById('creatorIdentityPill');

  if (state === 'dashboard') {
    if (gateMain) gateMain.style.display = 'none';
    if (dashMain) dashMain.style.display = 'block';
    if (idBadge) idBadge.style.display = 'flex';
  } else {
    if (gateMain) gateMain.style.display = 'block';
    if (dashMain) dashMain.style.display = 'none';
    if (idBadge) idBadge.style.display = 'none';

    if (gateLogin) gateLogin.style.display = state === 'need-login' ? 'block' : 'none';
    if (gatePending) {
      gatePending.style.display = state === 'pending' ? 'block' : 'none';
      if (data.email) {
        const el = document.getElementById('gatePendingEmail');
        if (el) el.textContent = data.email;
      }
    }
    if (gateNotApplied) gateNotApplied.style.display = state === 'not-applied' ? 'block' : 'none';
  }
}

function showDirectApplyForm() {
  showGateState('not-applied');
}

function showLoginForm() {
  showGateState('need-login');
}

async function handleStudioLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('gateEmailInput');
  const email = (emailInput?.value || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    showToast('Valid email enter karein', 'error');
    return;
  }

  const btn = document.getElementById('gateLoginBtn');
  btn.disabled = true;
  btn.textContent = 'Connecting...';

  localStorage.setItem('hz_creator_email', email);
  currentCreatorUser = { email };

  await checkCreatorAuth(email, true);
  btn.disabled = false;
  btn.innerHTML = '<span>⚡</span> Open Creator Studio';
}

async function handleDirectStudioApply(e) {
  e.preventDefault();
  const btn = document.getElementById('gCrSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting Application...';

  const realName = document.getElementById('gCrRealName').value.trim();
  const handle = document.getElementById('gCrHandle').value.trim();
  const email = document.getElementById('gCrEmail').value.trim().toLowerCase();
  const age = document.getElementById('gCrAge').value;
  const city = document.getElementById('gCrCity').value.trim();
  const category = document.getElementById('gCrCategory').value;
  const address = document.getElementById('gCrAddress').value.trim();

  const creatorObj = {
    realName,
    handle: handle.startsWith('@') ? handle : '@' + handle,
    email,
    age: Number(age) || 21,
    city,
    address,
    category,
    status: 'pending_verification',
    submittedAt: new Date().toISOString()
  };

  // 1. SAVE PERMANENTLY IN LOCALSTORAGE IMMEDIATELY (Applicant will never see empty form again!)
  saveCreatorProfileLocally(creatorObj);
  currentCreatorUser = creatorObj;

  // 2. IMMEDIATELY SWITCH TO PENDING SCREEN
  showGateState('pending', { email });
  startCreatorPoll(email);

  try {
    const res = await fetch('/api/creator/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creatorObj)
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Submit Application &amp; Connect to Control Desk';

    if (data.success) {
      showToast('Application submitted! Control Desk se connect ho gaya hai. ⚡');
      if (data.creator) {
        saveCreatorProfileLocally(data.creator);
        if (data.creator.status === 'approved') {
          checkCreatorAuth(email, true);
        }
      }
    } else {
      showToast(data.message || 'Application received! Verification pending.', 'info');
    }
  } catch(err) {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Submit Application &amp; Connect to Control Desk';
  }
}

async function instantDemoApprove() {
  const email = (currentCreatorUser?.email || localStorage.getItem('hz_creator_email') || '').toLowerCase().trim();
  if (!email) {
    showToast('Email missing', 'error');
    return;
  }

  // 1. Mark approved in localStorage immediately
  localStorage.setItem('hz_creator_approved_' + email, 'true');
  localStorage.setItem('hz_is_creator', 'true');
  localStorage.setItem('hz_creator_status', 'approved');

  const storedProfile = getSavedCreatorProfile() || {};
  storedProfile.status = 'approved';
  storedProfile.email = email;
  storedProfile.approvedAt = new Date().toISOString();
  saveCreatorProfileLocally(storedProfile);

  // 2. Open dashboard immediately
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  showToast('⚡ Instantly Approved! Creator Studio live. 🌟');
  showGateState('dashboard');
  currentCreatorUser = storedProfile;
  currentCreatorData = {
    creator: storedProfile,
    rateUSD: 1.50,
    analytics: {
      totalViews: storedProfile.totalViews || 0,
      totalEarningsUSD: storedProfile.earningsUSD || 0,
      availableBalanceUSD: storedProfile.earningsUSD || 0
    }
  };
  renderDashboard(currentCreatorData);

  // 3. Notify backend in background
  try {
    await fetch(`/api/admin/creators/${encodeURIComponent(email)}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': '1234' }
    });
    await fetch('/api/creator/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator: storedProfile })
    });
  } catch(e) {}
}

async function checkCreatorAuth(email, immediate = false) {
  const targetEmail = (email || currentCreatorUser?.email || localStorage.getItem('hz_creator_email') || '').toLowerCase().trim();
  if (!targetEmail) return;

  const storedProfile = getSavedCreatorProfile();
  const isApprovedLocally = localStorage.getItem('hz_creator_approved_' + targetEmail) === 'true' || 
                           localStorage.getItem('hz_is_creator') === 'true' || 
                           storedProfile?.status === 'approved';

  try {
    const res = await fetch(`/api/creator/status?email=${encodeURIComponent(targetEmail)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    const data = await res.json();

    if (data.success && data.applied && data.creator) {
      currentCreatorData = data;
      const creator = data.creator;
      saveCreatorProfileLocally(creator);

      if (creator.status === 'approved' || isApprovedLocally) {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        showGateState('dashboard');
        renderDashboard(data);
        if (immediate) showToast(`Welcome ${creator.realName || 'Creator'}! Creator Studio Active 🌟`);
        return;
      }

      if (creator.status === 'pending_verification') {
        showGateState('pending', { email: targetEmail });
        startCreatorPoll(targetEmail);
        return;
      }
    } else {
      // Server doesn't have it yet (e.g. cold lambda) BUT user already applied locally!
      if (isApprovedLocally) {
        showGateState('dashboard');
        syncAndRefreshCreator(storedProfile || { email: targetEmail, status: 'approved' });
        return;
      }
      if (localStorage.getItem('hz_creator_applied') === 'true' || storedProfile) {
        // User already submitted! NEVER SHOW BLANK FORM!
        showGateState('pending', { email: targetEmail });
        syncAndRefreshCreator(storedProfile || { email: targetEmail, status: 'pending_verification' });
        startCreatorPoll(targetEmail);
        return;
      }
      // Only show registration form if user NEVER applied before
      showGateState('not-applied');
    }
  } catch(err) {
    // Network glitch: fallback to local state, NEVER show blank form if user applied!
    if (isApprovedLocally) {
      showGateState('dashboard');
    } else if (localStorage.getItem('hz_creator_applied') === 'true' || storedProfile) {
      showGateState('pending', { email: targetEmail });
    }
  }
}

function renderDashboard(data) {
  const c = data.creator || {};
  const an = data.analytics || {};

  // Header
  const handleText = c.handle ? (c.handle.startsWith('@') ? c.handle : '@' + c.handle) : '@creator';
  document.getElementById('headCreatorHandle').textContent = handleText;
  document.getElementById('headCreatorAvatar').textContent = (c.realName || 'C').charAt(0).toUpperCase();
  document.getElementById('headCreatorBalance').textContent = `$${Number(an.availableBalanceUSD || 0).toFixed(2)} USD`;

  // Banner
  document.getElementById('csWelcomeName').textContent = c.realName || 'Creator';
  document.getElementById('csRatePer1k').textContent = Number(data.rateUSD || 1.50).toFixed(2);

  // Metric Cards
  document.getElementById('metTotalEarningsUSD').textContent = `$${Number(an.totalEarningsUSD || 0).toFixed(2)}`;
  document.getElementById('metAvailableBalanceUSD').textContent = `$${Number(an.availableBalanceUSD || 0).toFixed(2)}`;
  document.getElementById('metTotalViews').textContent = Number(an.totalViews || 0).toLocaleString();
  document.getElementById('metVideosCount').textContent = Number(data.videos?.length || 0);

  // Payout section
  document.getElementById('payoutAvailableBalance').textContent = `$${Number(an.availableBalanceUSD || 0).toFixed(2)} USD`;
  const poAmountInput = document.getElementById('poAmount');
  if (poAmountInput) {
    poAmountInput.max = Math.floor(an.availableBalanceUSD || 0);
    poAmountInput.value = Math.min(Math.floor(an.availableBalanceUSD || 50), 50);
  }

  // Populate Boost video selector
  const boostSelect = document.getElementById('boostVidSelectStudio');
  if (boostSelect) {
    const vids = data.videos || [];
    if (vids.length === 0) {
      boostSelect.innerHTML = `<option value="">Pehle niche se apni video upload karein</option>`;
    } else {
      boostSelect.innerHTML = vids.map(v => `
        <option value="${v.id}" data-title="${v.title.replace(/"/g, '&quot;')}">${v.title} (${v.views || '100'} plays)</option>
      `).join('');
    }
  }

  // Load My Videos & Payout History
  loadMyVideos();
  loadPayoutHistory();
}

function switchStudioTab(tabKey, btnEl) {
  studioActiveTab = tabKey;
  document.querySelectorAll('.studio-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  document.getElementById('tabStudioUpload').style.display = tabKey === 'upload' ? 'block' : 'none';
  document.getElementById('tabStudioMyVideos').style.display = tabKey === 'my-videos' ? 'block' : 'none';
  document.getElementById('tabStudioPayouts').style.display = tabKey === 'payouts' ? 'block' : 'none';
  document.getElementById('tabStudioBoost').style.display = tabKey === 'boost' ? 'block' : 'none';

  if (tabKey === 'my-videos') loadMyVideos();
  if (tabKey === 'payouts') loadPayoutHistory();
}

// 1. Creator Video Upload
async function handleCreatorVideoUpload(e) {
  e.preventDefault();
  if (!currentCreatorData || !currentCreatorData.creator) return;

  const btn = document.getElementById('cuSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Publishing to Hotty Zilla...';

  const title = document.getElementById('cuTitle').value.trim();
  const category = document.getElementById('cuCategory').value;
  const price = document.getElementById('cuPrice').value;
  const shortClipUrl = document.getElementById('cuShortUrl').value.trim();
  const fullVideoUrl = document.getElementById('cuFullUrl').value.trim();
  const shortDuration = document.getElementById('cuShortDuration').value.trim();
  const fullDuration = document.getElementById('cuFullDuration').value.trim();
  const description = document.getElementById('cuDesc').value.trim();

  try {
    const res = await fetch('/api/creator/upload-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorEmail: currentCreatorData.creator.email,
        title,
        category,
        price,
        shortClipUrl,
        fullVideoUrl,
        shortDuration,
        fullDuration,
        description
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Publish Video to Hotty Zilla';

    if (data.success) {
      showToast('Video successfully Hotty Zilla par publish ho gayi! 🎥');
      document.getElementById('creatorUploadForm').reset();
      // Re-fetch creator status to update stats & switch to My Videos
      await checkCreatorAuth(currentCreatorData.creator.email);
      const myVidBtn = document.querySelectorAll('.studio-tab-btn')[1];
      switchStudioTab('my-videos', myVidBtn);
    } else {
      showToast(data.message || 'Error publishing video', 'error');
    }
  } catch(err) {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Publish Video to Hotty Zilla';
    showToast('Failed to connect to server', 'error');
  }
}

// 2. Load My Uploaded Videos
async function loadMyVideos() {
  if (!currentCreatorData || !currentCreatorData.creator) return;
  const email = currentCreatorData.creator.email;
  const container = document.getElementById('myVideosListContainer');
  const countTab = document.getElementById('tabCountMyVideos');

  try {
    const res = await fetch(`/api/creator/my-videos?email=${encodeURIComponent(email)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    const data = await res.json();

    if (data.success) {
      const videos = data.videos || [];
      if (countTab) countTab.textContent = videos.length;
      document.getElementById('metVideosCount').textContent = videos.length;

      if (videos.length === 0) {
        container.innerHTML = `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 40px; text-align: center; color: var(--text-dim);">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">🎬</div>
            <div style="font-size: 1.1rem; color: #fff; font-weight: 700; margin-bottom: 6px;">Abhi tak koi video upload nahi ki hai</div>
            <p style="font-size: 0.88rem; margin-bottom: 18px;">Gofile ya Catbox link se apni pehli video upload karein aur har 1k views par dollars kamayein!</p>
            <button class="btn btn-gold btn-sm" onclick="switchStudioTab('upload')">
              <span>📤</span> Upload First Video
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = videos.map(v => {
        return `
          <div class="creator-video-row">
            <div style="display: flex; align-items: center; gap: 16px; min-width: 260px;">
              <div style="width: 80px; height: 55px; background: #000; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); flex-shrink: 0;">
                <video src="${v.shortClipUrl}" muted preload="metadata" style="width: 100%; height: 100%; object-fit: cover;"></video>
              </div>
              <div>
                <div style="font-weight: 800; color: #fff; font-size: 1rem; margin-bottom: 2px;">${v.title}</div>
                <div style="font-size: 0.78rem; color: var(--cyan);">${v.category} • Full HD: ${v.fullDuration || '20 Mins'}</div>
                <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">Price: <strong style="color: var(--gold);">₹${v.price}</strong></div>
              </div>
            </div>

            <!-- Monetization Stats on Video -->
            <div style="display: flex; gap: 24px; align-items: center;">
              <div style="text-align: center;">
                <div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 700;">PLAYS / VIEWS</div>
                <div style="font-size: 1.25rem; font-weight: 900; color: #fff;">👁️ ${v.views || '150'}</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 700;">EST. REVENUE</div>
                <div style="font-size: 1.25rem; font-weight: 900; color: var(--emerald);">$${v.estEarningsUSD || '0.22'} USD</div>
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 8px; align-items: center;">
              <a href="/#shorts-section" target="_blank" class="btn btn-outline btn-sm">
                👁️ View on Site
              </a>
              <button class="btn btn-outline btn-sm" style="border-color: var(--rose); color: var(--rose);" onclick="deleteCreatorVideo('${v.id}', '${v.title.replace(/'/g, "\\'")}')">
                🗑️ Delete
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch(err) {
    console.error(err);
  }
}

// 3. Delete Creator Video
async function deleteCreatorVideo(id, title) {
  if (!confirm(`Kya aap video "${title}" ko delete karna chahte hain? Ye Hotty Zilla se turant remove ho jayegi.`)) return;

  try {
    const res = await fetch(`/api/creator/videos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentCreatorData.creator.email })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Video delete ho gayi! 🗑️');
      loadMyVideos();
      checkCreatorAuth(currentCreatorData.creator.email);
    } else {
      showToast(data.message || 'Error deleting video', 'error');
    }
  } catch(err) {
    showToast('Failed to delete video', 'error');
  }
}

// 4. Handle Payout Submit
function handlePayoutMethodChange() {
  const method = document.getElementById('poMethod').value;
  const label = document.getElementById('poDetailsLabel');
  const input = document.getElementById('poDetails');

  if (method === 'usdt') {
    label.textContent = 'USDT (TRC-20) Wallet Address *';
    input.placeholder = 'e.g. TXyZ123456789... TRC20 Wallet Address';
  } else if (method === 'bank_wire') {
    label.textContent = 'Bank Account Number, IFSC Code & Account Holder Name *';
    input.placeholder = 'e.g. A/C: 109283749281, IFSC: HDFC0001234, Name: Priya Sharma';
  } else if (method === 'paypal') {
    label.textContent = 'PayPal Email Address *';
    input.placeholder = 'e.g. priya.payments@gmail.com';
  }
}

async function handlePayoutSubmit(e) {
  e.preventDefault();
  if (!currentCreatorData || !currentCreatorData.creator) return;

  const btn = document.getElementById('poSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting Cashout Request...';

  const amountUSD = document.getElementById('poAmount').value;
  const method = document.getElementById('poMethod').value;
  const details = document.getElementById('poDetails').value.trim();

  try {
    const res = await fetch('/api/creator/payout-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentCreatorData.creator.email,
        amountUSD,
        method,
        details
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<span>💵</span> Submit Withdrawal Request';

    if (data.success) {
      showToast(data.message || 'Withdrawal request submitted! 💵');
      document.getElementById('payoutSubmitForm').reset();
      checkCreatorAuth(currentCreatorData.creator.email);
      loadPayoutHistory();
    } else {
      showToast(data.message || 'Error submitting payout', 'error');
    }
  } catch(err) {
    btn.disabled = false;
    btn.innerHTML = '<span>💵</span> Submit Withdrawal Request';
    showToast('Failed to submit payout request', 'error');
  }
}

// 5. Load Payout History
async function loadPayoutHistory() {
  if (!currentCreatorData || !currentCreatorData.creator) return;
  const email = currentCreatorData.creator.email;
  const tbody = document.getElementById('payoutHistoryTbody');

  try {
    const res = await fetch(`/api/creator/payouts?email=${encodeURIComponent(email)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    const data = await res.json();

    if (data.success && tbody) {
      const payouts = data.payouts || [];
      if (payouts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 20px;">No withdrawal requests yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = payouts.map(p => {
        const isPaid = p.status === 'paid';
        const statusHtml = isPaid 
          ? `<span class="badge-status approved">✅ PAID</span>` 
          : `<span class="badge-status pending_verification">⏳ Pending Review</span>`;
        const dateStr = new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
          <tr>
            <td style="font-family: monospace; color: var(--gold); font-weight: 700;">${p.id}</td>
            <td style="font-size: 1.1rem; font-weight: 900; color: var(--emerald);">$${Number(p.amountUSD).toFixed(2)} USD</td>
            <td style="font-weight: 700; color: #fff;">₹${Number(p.amountINR).toLocaleString()}</td>
            <td style="text-transform: uppercase; font-size: 0.8rem; color: var(--cyan);">${p.method}</td>
            <td>${statusHtml}</td>
            <td style="font-size: 0.8rem; color: var(--text-dim);">${dateStr}</td>
          </tr>
        `;
      }).join('');
    }
  } catch(e) {}
}

// 6. Handle Boost Submit inside Studio
async function handleBoostSubmitStudio(e) {
  e.preventDefault();
  if (!currentCreatorData || !currentCreatorData.creator) return;

  const btn = document.getElementById('boostBtnStudio');
  btn.disabled = true;
  btn.textContent = 'Activating Traffic Campaign...';

  const pkgRadio = document.querySelector('input[name="boostPkgStudio"]:checked');
  if (!pkgRadio) return;

  const [targetViews, amountINR] = pkgRadio.value.split(':');
  const select = document.getElementById('boostVidSelectStudio');
  const videoId = select.value;
  const opt = select.options[select.selectedIndex];
  const videoTitle = opt ? opt.getAttribute('data-title') || opt.text : 'Creator Video';

  try {
    const res = await fetch('/api/creator/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorEmail: currentCreatorData.creator.email,
        creatorName: currentCreatorData.creator.realName,
        videoId,
        videoTitle,
        targetViews: Number(targetViews),
        amountINR: Number(amountINR),
        paymentMode: 'instant_demo'
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Activate Traffic Boost Campaign';

    if (data.success) {
      showToast(`🔥 Boost Activated! ${Number(targetViews).toLocaleString()} views campaign is now running!`);
      showToast('Video platform feed par top sponsored reel me lag gayi hai!');
    } else {
      showToast(data.message || 'Error activating campaign', 'error');
    }
  } catch(err) {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Activate Traffic Boost Campaign';
    showToast('Failed to start campaign', 'error');
  }
}

function creatorLogout() {
  if (!confirm('Creator Studio se logout karna chahte hain?')) return;
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  const email = (currentCreatorUser?.email || localStorage.getItem('hz_creator_email') || '').toLowerCase().trim();
  if (email) {
    localStorage.removeItem('hz_creator_approved_' + email);
  }
  localStorage.removeItem('hz_creator_email');
  localStorage.removeItem('hz_creator_profile');
  localStorage.removeItem('hz_creator_applied');
  localStorage.removeItem('hz_creator_status');
  localStorage.removeItem('hz_is_creator');
  currentCreatorUser = null;
  currentCreatorData = null;
  showGateState('not-applied');
  showToast('Logged out from Creator Studio.');
}
