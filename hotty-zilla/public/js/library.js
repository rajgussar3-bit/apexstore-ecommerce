// Hotty Zilla VIP Lounge Controller
let currentVipData = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mobileFromUrl = urlParams.get('mobile') || urlParams.get('q');
  const storedMobile = localStorage.getItem('hz_vip_mobile');

  const mobileToUse = mobileFromUrl || storedMobile || '9876543210'; // default demo VIP

  if (mobileToUse) {
    loadVipAccess(mobileToUse);
  } else {
    showLoginPrompt();
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

function showLoginPrompt() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('vipMainView').style.display = 'none';
}

function handleVipLogin(e) {
  e.preventDefault();
  const mob = document.getElementById('loginMobile').value.trim();
  if (mob) {
    localStorage.setItem('hz_vip_mobile', mob);
    loadVipAccess(mob);
  }
}

function switchVipAccount() {
  localStorage.removeItem('hz_vip_mobile');
  showLoginPrompt();
}

async function loadVipAccess(mobile) {
  try {
    const res = await fetch(`/api/student/vip-access?mobile=${encodeURIComponent(mobile)}`);
    const data = await res.json();

    if (data.success) {
      currentVipData = data;
      localStorage.setItem('hz_vip_mobile', mobile);

      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('vipMainView').style.display = 'block';

      renderProfile();
      renderVideos();
      renderSpa();
      renderMeetings();
      renderOrders();

      // Check auto-play query
      const urlParams = new URLSearchParams(window.location.search);
      const autoPlayId = urlParams.get('playVideo');
      if (autoPlayId) {
        const vid = (data.unlockedVideos || []).find(v => v.id === autoPlayId);
        if (vid) playFullVideo(vid.title, vid.fullVideoUrl, vid.id);
      }
    } else {
      showToast(data.message || 'Account not found', 'error');
      showLoginPrompt();
    }
  } catch (err) {
    console.error('VIP access fetch error:', err);
    showLoginPrompt();
  }
}

function renderProfile() {
  const u = currentVipData.user || {};
  const name = u.name || 'VIP Guest';
  document.getElementById('userName').textContent = name;
  document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('userMobile').textContent = u.mobile || '';

  const badge = document.getElementById('vipBadge');
  const validity = document.getElementById('membershipValidityText');

  if (currentVipData.isVipActive && currentVipData.membership) {
    const m = currentVipData.membership;
    const expDate = new Date(m.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    badge.textContent = `👑 ${m.planTitle.toUpperCase()}`;
    badge.className = 'badge-pill badge-fire';
    validity.textContent = `Active Member • Valid till ${expDate}`;
  } else {
    badge.textContent = 'STANDARD GUEST';
    badge.className = 'badge-pill badge-gold';
    validity.textContent = 'No active VIP membership. Individual unlocked items below.';
  }

  document.getElementById('countVideos').textContent = (currentVipData.unlockedVideos || []).length;
  document.getElementById('countSpa').textContent = (currentVipData.unlockedPdfs || []).length;
  document.getElementById('countMeetings').textContent = (currentVipData.meetings || []).length;
  document.getElementById('countOrders').textContent = (currentVipData.orders || []).length;
}

// 1. Render Videos
function renderVideos() {
  const grid = document.getElementById('unlockedVideosGrid');
  const videos = currentVipData.unlockedVideos || [];

  if (videos.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 30px;">Koi Full Video unlock nahi hai. VIP membership lekar sabhi unlock karein!</div>`;
    return;
  }

  grid.innerHTML = videos.map((v, idx) => {
    return `
      <div class="content-card">
        <div class="card-icon">🎥</div>
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--cyan); text-transform: uppercase; margin-bottom: 4px;">
          ${v.modelName || 'VIP Model'} • ${v.category}
        </div>
        <h3 class="card-title">${v.title}</h3>
        <p class="card-desc">${v.description || ''}</p>

        <div class="card-meta-row">
          <span>⏱️ ${v.fullDuration || 'Full HD'}</span>
          <span style="color: var(--emerald); font-weight: 700;">✓ Unlocked Full Video</span>
        </div>

        <button class="btn btn-gold btn-sm" style="width: 100%;" onclick="playFullVideo('${v.title.replace(/'/g, "\\'")}', '${v.fullVideoUrl}', '${v.id}')">
          ▶ Watch Full HD Video
        </button>
      </div>
    `;
  }).join('');

  // Default play first video if none playing
  if (videos.length > 0 && !document.getElementById('fullVideoPlayer').src) {
    playFullVideo(videos[0].title, videos[0].fullVideoUrl, videos[0].id);
  }
}

function playFullVideo(title, url, id) {
  if (id) {
    fetch(`/api/videos/${id}/view`, { method: 'POST' }).catch(() => {});
  }
  const videoPlayer = document.getElementById('fullVideoPlayer');
  const iframePlayer = document.getElementById('fullVideoIframe');
  const titleEl = document.getElementById('currentPlayingTitle');
  if (titleEl) titleEl.textContent = `▶ Now Streaming: ${title}`;

  let cleanUrl = (url || '').trim();
  if (cleanUrl.includes('streamtape.com/v/')) cleanUrl = cleanUrl.replace('/v/', '/e/');
  if (cleanUrl.includes('dood') && !cleanUrl.includes('/e/')) cleanUrl = cleanUrl.replace('/d/', '/e/');

  const isEmbed = cleanUrl.includes('/e/') || cleanUrl.includes('streamtape') || cleanUrl.includes('dood') || cleanUrl.includes('mixdrop') || cleanUrl.includes('embed');

  if (isEmbed) {
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.style.display = 'none';
    }
    if (iframePlayer) {
      iframePlayer.src = cleanUrl;
      iframePlayer.style.display = 'block';
    }
  } else {
    if (iframePlayer) {
      iframePlayer.src = '';
      iframePlayer.style.display = 'none';
    }
    if (videoPlayer) {
      videoPlayer.style.display = 'block';
      videoPlayer.src = cleanUrl;
      videoPlayer.load();
      videoPlayer.play().catch(() => {});
    }
  }
}

function setSpeed(sp) {
  const player = document.getElementById('fullVideoPlayer');
  if (player) player.playbackRate = sp;
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  showToast(`Speed set to ${sp}x`);
}

// 2. Render SPA PDF
function renderSpa() {
  const hasSpa = (currentVipData.unlockedPdfs || []).length > 0;
  document.getElementById('spaUnlockedCard').style.display = hasSpa ? 'block' : 'none';
  document.getElementById('spaLockedCard').style.display = hasSpa ? 'none' : 'block';
}

function openSpaViewer() {
  openModal('pdfViewerModal');
}

// 3. Render Meetings
function renderMeetings() {
  const tbody = document.getElementById('vipMeetingsTbody');
  const meetings = currentVipData.meetings || [];

  if (meetings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 24px;">Aapne koi meeting request nahi dali hai.</td></tr>`;
    return;
  }

  tbody.innerHTML = meetings.map(m => {
    return `
      <tr>
        <td style="font-weight: 700; color: var(--cyan);">${m.friendName}</td>
        <td>${m.city}</td>
        <td>${m.preferredDate}</td>
        <td><span class="badge-pill badge-fire" style="font-size: 0.72rem;">${m.status}</span></td>
        <td>
          <a href="https://wa.me/919876543210?text=Hi%20Hotty%20Zilla,%20regarding%20my%20meeting%20request%20for%20${encodeURIComponent(m.friendName)}" target="_blank" class="btn btn-outline btn-sm" style="border-color: #25d366; color: #25d366;">
            💬 Chat on WhatsApp
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// 4. Render Orders
function renderOrders() {
  const tbody = document.getElementById('vipOrdersTbody');
  const orders = currentVipData.orders || [];

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 24px;">Koi order record nahi mila.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const isApp = o.status === 'approved';
    const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'Recent';

    return `
      <tr>
        <td style="font-family: monospace; color: var(--gold); font-weight: 700;">${o.orderId}</td>
        <td style="font-weight: 600;">${o.itemTitle}</td>
        <td style="font-weight: 800;">₹${o.amount}</td>
        <td style="text-transform: uppercase; font-size: 0.8rem; color: var(--text-dim);">${o.paymentMode}</td>
        <td><span class="badge-pill ${isApp ? 'badge-fire' : 'badge-gold'}" style="font-size: 0.72rem;">${o.status}</span></td>
        <td style="font-size: 0.82rem; color: var(--text-dim);">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

// Tab Switching
function switchVipTab(tabName, btnElement) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  document.getElementById('tabVipVideos').style.display = tabName === 'videos' ? 'block' : 'none';
  document.getElementById('tabVipSpa').style.display = tabName === 'spa' ? 'block' : 'none';
  document.getElementById('tabVipMeetings').style.display = tabName === 'meetings' ? 'block' : 'none';
  document.getElementById('tabVipOrders').style.display = tabName === 'orders' ? 'block' : 'none';
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}
