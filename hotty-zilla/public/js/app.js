// Hotty Zilla VIP Lounge Client Engine
let catalogData = { videos: [], memberships: [], spaCourse: {}, friends: [], categories: [] };
let siteSettings = {};
let currentCheckoutItem = null;
let currentPaywallVideo = null;
let currentPayMode = 'instant_demo';
let currentCustomer = null;
let currentCategoryFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initCustomerAuth();
  fetchSiteInfo();
  fetchCatalog();
  setupAppCrossTabSync();
});

// Instant Cross-Tab Sync via BroadcastChannel & LocalStorage
function setupAppCrossTabSync() {
  try {
    const syncChannel = new BroadcastChannel('hz_creator_sync');
    syncChannel.onmessage = (event) => {
      if (event.data && (event.data.action === 'APPROVED' || event.data.type === 'CREATOR_APPROVED')) {
        const approvedEmail = (event.data.email || '').toLowerCase();
        const myEmail = (currentCustomer?.email || '').toLowerCase();
        if (!approvedEmail || !myEmail || approvedEmail === myEmail) {
          if (currentCustomer) currentCustomer.isCreator = true;
          updateAuthHeaderUI();
          showToast('🎉 Aapka Creator Studio Control Desk dwara turant approve ho gaya! 🌟', 'success');
          const profModal = document.getElementById('customerProfileModal');
          if (profModal && profModal.classList.contains('active')) {
            openCustomerProfileModal();
          }
        }
      }
    };
  } catch(e) {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'hz_last_approval_event' || (e.key && e.key.startsWith('hz_creator_approved_'))) {
      if (currentCustomer) currentCustomer.isCreator = true;
      updateAuthHeaderUI();
      const profModal = document.getElementById('customerProfileModal');
      if (profModal && profModal.classList.contains('active')) {
        openCustomerProfileModal();
      }
    }
  });
}

function initCustomerAuth() {
  try {
    const stored = localStorage.getItem('hz_customer_user');
    if (stored) {
      currentCustomer = JSON.parse(stored);
      updateAuthHeaderUI();
    }
  } catch(e) {}
}

function updateAuthHeaderUI() {
  const loginBtn = document.getElementById('headerLoginBtn');
  const profBtn = document.getElementById('headerProfileBtn');
  const nameSpan = document.getElementById('headerUserName');
  const csBtn = document.getElementById('headerCreatorStudioBtn');

  if (currentCustomer && currentCustomer.email) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (profBtn) profBtn.style.display = 'inline-flex';
    if (nameSpan) nameSpan.textContent = currentCustomer.name || currentCustomer.email.split('@')[0];
    checkCreatorHeaderStatus();
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (profBtn) profBtn.style.display = 'none';
    if (csBtn) csBtn.style.display = 'none';
  }
}

async function checkCreatorHeaderStatus() {
  const csBtn = document.getElementById('headerCreatorStudioBtn');
  if (!csBtn) return;
  const email = (currentCustomer?.email || localStorage.getItem('hz_creator_email') || '').toLowerCase().trim();
  const isApproved = localStorage.getItem('hz_is_creator') === 'true' || 
                     (email && localStorage.getItem('hz_creator_approved_' + email) === 'true') ||
                     (currentCustomer && currentCustomer.isCreator);

  if (isApproved) {
    csBtn.style.display = 'inline-flex';
    return;
  }
  if (!email) {
    csBtn.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`/api/creator/status?email=${encodeURIComponent(email)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    const data = await res.json();
    if (data.success && data.applied && data.creator && data.creator.status === 'approved') {
      csBtn.style.display = 'inline-flex';
      localStorage.setItem('hz_is_creator', 'true');
      localStorage.setItem('hz_creator_approved_' + email, 'true');
      if (currentCustomer) {
        currentCustomer.isCreator = true;
        localStorage.setItem('hz_customer_user', JSON.stringify(currentCustomer));
      }
    } else {
      csBtn.style.display = 'none';
    }
  } catch(e) {
    csBtn.style.display = isApproved ? 'inline-flex' : 'none';
  }
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <div>${msg}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

async function fetchSiteInfo() {
  try {
    const res = await fetch('/api/site-info');
    const data = await res.json();
    if (data.success && data.settings) {
      siteSettings = data.settings;
      if (siteSettings.announcement) {
        const el = document.getElementById('announcementBar');
        if (el) el.textContent = siteSettings.announcement;
      }
      if (siteSettings.upiId) {
        const upiEl = document.getElementById('displayUpiId');
        if (upiEl) upiEl.textContent = siteSettings.upiId;
      }
    }
  } catch (err) {
    console.warn(err);
  }
}

// Canonical Video Master Releases (Always guaranteed on every device & session)
const CANONICAL_VIDEOS = [
  {
    id: "vid-ellie-jmac-1",
    title: "Ellie Bellas & J Mac - Exclusive Romance Episode",
    modelName: "Ellie Bellas & J Mac",
    category: "Private Hangout",
    shortDuration: "0:45s Teaser",
    fullDuration: "21 Mins Full HD",
    price: 99,
    originalPrice: 297,
    badge: "🔥 Trending Master Release",
    views: "24.5K",
    likes: "1.8K",
    shortClipUrl: "https://archive.org/download/video-project-7_202609/Video%20Project%207.mp4",
    fullVideoUrl: "https://archive.org/download/video-project-4-elly/Video%20Project%204%20elly.mp4",
    poster: "https://archive.org/download/video-project-4-elly/video-project-4-elly.thumbs/Video%20Project%204%20elly_000180.jpg",
    description: "Ellie Bellas aur J Mac ka exclusive romantic episode. Pura 21 minutes uncut Full HD video dekhein VIP pass ke sath ya direct unlock karein. 100% Bufferless & Ad-free streaming.",
    createdAt: "2026-09-19T04:50:00.000Z"
  }
];

async function fetchCatalog() {
  try {
    const res = await fetch('/api/catalog?_t=' + Date.now(), {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    const data = await res.json();
    if (data.success) {
      if (!data.videos) data.videos = [];

      // Clean up any stale duplicate preview in local storage
      try {
        const localVideos = JSON.parse(localStorage.getItem('hz_admin_videos') || '[]');
        const cleaned = localVideos.filter(v => v.id !== 'vid-short-project-7');
        if (cleaned.length !== localVideos.length) {
          localStorage.setItem('hz_admin_videos', JSON.stringify(cleaned));
        }
        if (cleaned.length > 0) {
          const existingIds = new Set(data.videos.map(v => v.id));
          const newVideos = cleaned.filter(v => !existingIds.has(v.id));
          if (newVideos.length > 0) {
            data.videos = [...newVideos, ...data.videos];
          }
        }
      } catch(e) {}

      // Always filter out any duplicate vid-short-project-7 so only one master card appears
      data.videos = data.videos.filter(v => v.id !== 'vid-short-project-7');

      // Always guarantee Canonical Releases (like Ellie Bellas) are front and center on mobile & desktop
      try {
        const existingIds = new Set(data.videos.map(v => v.id));
        CANONICAL_VIDEOS.forEach(cv => {
          if (!existingIds.has(cv.id)) {
            data.videos.unshift(cv);
            existingIds.add(cv.id);
          }
        });
      } catch(e) {}

      catalogData = data;
      renderCategories(data.categories || []);
      renderShorts(data.videos || []);
      renderMemberships(data.memberships || []);
      renderSpaCourse(data.spaCourse || {});
      renderFriends(data.friends || []);
    }
  } catch (err) {
    console.error('Catalog fetch error:', err);
  }
}

// 0. Render Categories Horizontal Chips
function renderCategories(categories) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = `<span style="color: var(--text-dim); font-size: 0.85rem;">No categories available</span>`;
    return;
  }

  container.innerHTML = categories.map(cat => {
    const isAll = cat.id === 'cat-all';
    const isActive = (currentCategoryFilter === 'all' && isAll) || (currentCategoryFilter.toLowerCase() === cat.name.toLowerCase());
    return `
      <button class="category-chip ${isActive ? 'active' : ''}" onclick="selectCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}')">
        <span class="category-chip-icon">${cat.icon || '⭐'}</span>
        <span class="category-chip-name">${cat.name}</span>
      </button>
    `;
  }).join('');
}

function selectCategory(catId, catName) {
  const isAll = catId === 'cat-all';
  currentCategoryFilter = isAll ? 'all' : catName;

  const activeTitle = document.getElementById('activeCategoryName');
  if (activeTitle) {
    activeTitle.textContent = isAll ? 'Showing All Videos' : `Category: ${catName}`;
  }

  // Update active chip UI
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.remove('active');
    if ((isAll && chip.textContent.includes('All Videos')) || (!isAll && chip.textContent.includes(catName))) {
      chip.classList.add('active');
    }
  });

  // Filter and render videos
  if (isAll) {
    renderShorts(catalogData.videos || []);
  } else {
    const filtered = (catalogData.videos || []).filter(v => 
      v.category && v.category.toLowerCase().includes(catName.toLowerCase())
    );
    renderShorts(filtered);
  }
}

// ==============================================
// VIDEO FORMATTING, METRICS & LIKES HELPERS
// ==============================================
function formatVideoDate(dateStr) {
  if (!dateStr) return 'Sep 19, 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Sep 19, 2026';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch (e) {
    return 'Sep 19, 2026';
  }
}

function parseLikeCount(val) {
  if (typeof val === 'number') return val;
  if (!val) return 1840;
  const s = val.toString().trim().toUpperCase();
  if (s.endsWith('K')) {
    return Math.round(parseFloat(s.replace('K', '')) * 1000);
  }
  if (s.endsWith('M')) {
    return Math.round(parseFloat(s.replace('M', '')) * 1000000);
  }
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 1840 : n;
}

function formatLikeCount(n) {
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return n.toString();
}

function getVideoLikes(videoId, initialCount) {
  try {
    const stored = localStorage.getItem('hz_v_likes_' + videoId);
    if (stored !== null) return formatLikeCount(parseInt(stored, 10));
  } catch(e) {}
  const base = parseLikeCount(initialCount || '1.8K');
  return formatLikeCount(base);
}

function isVideoLiked(videoId) {
  try {
    return localStorage.getItem('hz_v_liked_' + videoId) === 'true';
  } catch(e) {
    return false;
  }
}

function toggleVideoLike(e, videoId) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  try {
    const isCurrentlyLiked = isVideoLiked(videoId);
    const storedCount = localStorage.getItem('hz_v_likes_' + videoId);
    let count = storedCount !== null ? parseInt(storedCount, 10) : parseLikeCount('1.8K');

    if (isCurrentlyLiked) {
      count = Math.max(0, count - 1);
      localStorage.setItem('hz_v_liked_' + videoId, 'false');
    } else {
      count += 1;
      localStorage.setItem('hz_v_liked_' + videoId, 'true');
    }
    localStorage.setItem('hz_v_likes_' + videoId, count.toString());

    // Update UI elements immediately with smooth feedback
    const btn = document.getElementById(`like-btn-${videoId}`);
    const countEl = document.getElementById(`like-count-${videoId}`);
    const iconEl = btn ? btn.querySelector('.like-heart-icon') : null;

    if (btn) {
      if (!isCurrentlyLiked) {
        btn.classList.add('liked');
        if (iconEl) iconEl.textContent = '❤️';
      } else {
        btn.classList.remove('liked');
        if (iconEl) iconEl.textContent = '🤍';
      }
    }
    if (countEl) {
      countEl.textContent = formatLikeCount(count);
    }

    // Background tracking to server (non-blocking)
    fetch(`/api/videos/${videoId}/like`, { method: 'POST' }).catch(() => {});
  } catch(err) {
    console.warn('Toggle like error:', err);
  }
}

// 1. Render Video Shorts Grid - Mobile Enhanced 16:9 Cards
function renderShorts(videos) {
  const container = document.getElementById('shortsContainer');
  if (!container) return;

  if (videos.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">No video shorts published yet.</div>`;
    return;
  }

  // Check for Sponsored / Promoted Ad Campaign with daily frequency cap
  let sponsoredHtml = '';
  try {
    const today = new Date().toISOString().slice(0, 10);
    const adViewsKey = 'hz_ad_views_' + today;
    const currentAdViews = parseInt(localStorage.getItem(adViewsKey) || '0', 10);
    const maxDailyAdFrequency = catalogData.adFrequencyPerDay !== undefined ? catalogData.adFrequencyPerDay : 3;

    if (catalogData.sponsoredCampaigns && catalogData.sponsoredCampaigns.length > 0 && currentAdViews < maxDailyAdFrequency) {
      const activeCamp = catalogData.sponsoredCampaigns[0];
      const targetVid = (catalogData.videos || []).find(v => v.id === activeCamp.videoId) || {
        id: activeCamp.videoId,
        title: activeCamp.videoTitle,
        modelName: activeCamp.creatorName,
        category: 'Promoted Reel',
        shortDuration: '0:30s Teaser',
        fullDuration: '25 Mins HD',
        views: `${(activeCamp.targetViews / 1000).toFixed(0)}K+`,
        price: 199,
        shortClipUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        description: `Promoted Reel by ${activeCamp.creatorName} (${activeCamp.creatorEmail}). Exclusive sponsored reach campaign.`
      };

      const spLiked = isVideoLiked(targetVid.id);
      const spLikes = getVideoLikes(targetVid.id, '2.4K');
      const spDate = formatVideoDate(targetVid.createdAt);
      const spDesc = targetVid.description ? (targetVid.description.length > 90 ? targetVid.description.slice(0, 90).trim() + '...' : targetVid.description) : 'Promoted viral reel reach.';

      sponsoredHtml = `
        <div class="reel-card sponsored-card">
          <div class="reel-thumb-box" onclick="playShortClip('${targetVid.id}')">
            <img class="reel-thumb-img" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=75" alt="${targetVid.title}" loading="lazy" decoding="async">
            
            <div class="reel-top-bar">
              <span class="badge-pill badge-gold">🔥 SPONSORED PROMOTED</span>
              <span class="badge-quality">4K Ultra HD</span>
            </div>

            <div class="reel-overlay-play">
              <div class="play-circle-btn">▶</div>
              <div class="play-label">Play 16:9 Preview</div>
            </div>

            <div class="reel-bottom-bar">
              <span class="reel-duration-tag">⏱️ ${targetVid.shortDuration || '0:30s Clip'}</span>
              <span class="reel-audio-tag">🔊 Dolby Stereo</span>
            </div>
          </div>

          <div class="reel-info-box">
            <div class="reel-creator-row">
              <div class="reel-creator-info">
                <span class="creator-avatar-badge">📢</span>
                <span class="reel-model-name" title="${activeCamp.creatorName}">${activeCamp.creatorName}</span>
              </div>
              <span class="reel-date-badge">📅 ${spDate}</span>
            </div>

            <h3 class="reel-title" title="${targetVid.title}">${targetVid.title}</h3>
            <p class="reel-short-desc">${spDesc}</p>
            
            <div class="reel-metrics-bar">
              <div class="metric-item">
                <span class="metric-icon">👁️</span>
                <span class="metric-val">🚀 ${Number(activeCamp.targetViews).toLocaleString()} views</span>
              </div>

              <button class="reel-like-btn ${spLiked ? 'liked' : ''}" id="like-btn-${targetVid.id}" onclick="toggleVideoLike(event, '${targetVid.id}')" title="Like video">
                <span class="like-heart-icon">${spLiked ? '❤️' : '🤍'}</span>
                <span class="like-count-text" id="like-count-${targetVid.id}">${spLikes}</span>
              </button>

              <div class="metric-item">
                <span class="metric-icon">⏳</span>
                <span class="metric-val" style="color: var(--gold); font-weight: 700;">Full: ${targetVid.fullDuration || '20 Mins'}</span>
              </div>
            </div>

            <button class="btn-unlock-full" onclick="triggerFullVideo('${targetVid.id}')" style="background: var(--gradient-fire); color: #fff;">
              <span>👑</span> Watch Full Video (HD)
            </button>
          </div>
        </div>
      `;

      // Increment visitor's daily impression count
      localStorage.setItem(adViewsKey, (currentAdViews + 1).toString());
    }
  } catch (err) {
    console.warn('Sponsored ad render error:', err);
  }

  container.innerHTML = sponsoredHtml + videos.map(v => {
    const posterImg = v.poster || (
      (v.title || '').toLowerCase().includes('ellie')
        ? 'https://archive.org/download/video-project-4-elly/video-project-4-elly.thumbs/Video%20Project%204%20elly_000180.jpg'
        : (v.title || '').toLowerCase().includes('natasha')
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=75'
          : (v.title || '').toLowerCase().includes('simran')
            ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=75'
            : (v.title || '').toLowerCase().includes('riya')
              ? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=75'
              : (v.title || '').toLowerCase().includes('aanya')
                ? 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=720&q=75'
                : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=720&q=75'
    );

    const creatorName = v.modelName || v.creatorName || 'Hotty VIP Creator';
    const uploadDate = formatVideoDate(v.createdAt || v.date || v.uploadDate);
    const viewCount = v.views || '24.5K';
    const isLiked = isVideoLiked(v.id);
    const likeCount = getVideoLikes(v.id, v.likes);
    const rawDesc = v.description || 'Exclusive HD romantic episode teaser.';
    const shortDesc = rawDesc.length > 90 ? rawDesc.slice(0, 90).trim() + '...' : rawDesc;

    return `
      <div class="reel-card">
        <div class="reel-thumb-box" onclick="playShortClip('${v.id}')">
          <img class="reel-thumb-img" src="${posterImg}" alt="${v.title}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=75'">
          
          <div class="reel-top-bar">
            <span class="badge-pill badge-fire">${v.badge || '🔥 Trending'}</span>
            <span class="badge-quality">4K Ultra HD</span>
          </div>

          <div class="reel-overlay-play">
            <div class="play-circle-btn">▶</div>
            <div class="play-label">Play 16:9 Preview</div>
          </div>

          <div class="reel-bottom-bar">
            <span class="reel-duration-tag">⏱️ ${v.shortDuration || '0:45s Clip'}</span>
            <span class="reel-audio-tag">🔊 Stereo HD</span>
          </div>
        </div>

        <div class="reel-info-box">
          <!-- Creator Name & Upload Date Row -->
          <div class="reel-creator-row">
            <div class="reel-creator-info">
              <span class="creator-avatar-badge">👑</span>
              <span class="reel-model-name" title="${creatorName}">${creatorName}</span>
            </div>
            <span class="reel-date-badge">📅 ${uploadDate}</span>
          </div>

          <!-- Video Title -->
          <h3 class="reel-title" title="${v.title}">${v.title}</h3>

          <!-- Chota Short Description (Clamped to 2 lines) -->
          <p class="reel-short-desc">${shortDesc}</p>

          <!-- Views, Likes & Full Duration Metrics Bar -->
          <div class="reel-metrics-bar">
            <div class="metric-item">
              <span class="metric-icon">👁️</span>
              <span class="metric-val">${viewCount} views</span>
            </div>

            <button class="reel-like-btn ${isLiked ? 'liked' : ''}" id="like-btn-${v.id}" onclick="toggleVideoLike(event, '${v.id}')" title="Like this video">
              <span class="like-heart-icon">${isLiked ? '❤️' : '🤍'}</span>
              <span class="like-count-text" id="like-count-${v.id}">${likeCount}</span>
            </button>

            <div class="metric-item">
              <span class="metric-icon">⏳</span>
              <span class="metric-val" style="color: var(--gold); font-weight: 700;">Full: ${v.fullDuration || '21 Mins'}</span>
            </div>
          </div>

          <!-- Watch Full Video Button -->
          <button class="btn-unlock-full" onclick="triggerFullVideo('${v.id}')">
            <span>👑</span> Watch Full Uncut Video (HD)
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Play Short Teaser Clip Modal - 60 FPS Mobile Non-blocking
function playShortClip(videoId) {
  const video = (catalogData.videos || []).find(v => v.id === videoId);
  if (!video) return;

  // Real-time View & Monetization Tracking (Credits Creator)
  fetch(`/api/videos/${videoId}/view`, { method: 'POST' }).catch(() => {});

  const modal = document.getElementById('shortPlayerModal');
  const player = document.getElementById('shortVideoElement');
  const title = document.getElementById('shortModalTitle');
  const fullBtn = document.getElementById('shortModalFullBtn');

  if (title) title.textContent = `🎥 Preview: ${video.title}`;
  if (fullBtn) {
    fullBtn.onclick = () => {
      closeShortPlayer();
      triggerFullVideo(video.id);
    };
  }

  // Open modal FIRST so UI responds immediately with 0ms delay
  openModal('shortPlayerModal');

  // Defer media loading to next frame to prevent mobile main thread stutter
  requestAnimationFrame(() => {
    if (player) {
      if (player.src !== video.shortClipUrl) {
        player.src = video.shortClipUrl;
        player.load();
      }
      player.play().catch(() => {});
    }
  });
}

function closeShortPlayer() {
  const player = document.getElementById('shortVideoElement');
  if (player) {
    player.pause();
    player.src = '';
  }
  closeModal('shortPlayerModal');
}

// Trigger Full Video Check / Paywall
async function triggerFullVideo(videoId) {
  const video = (catalogData.videos || []).find(v => v.id === videoId);
  if (!video) return;

  // Check if student has saved mobile and active membership
  const savedMobile = localStorage.getItem('hz_vip_mobile');
  if (savedMobile) {
    try {
      const res = await fetch(`/api/student/vip-access?mobile=${savedMobile}`);
      const data = await res.json();
      if (data.success) {
        const hasMembership = data.isVipActive;
        const boughtThisVideo = (data.unlockedVideos || []).some(v => v.id === video.id);

        if (hasMembership || boughtThisVideo) {
          // Direct access! Redirect or open full video
          window.location.href = `/my-library.html?playVideo=${video.id}&mobile=${savedMobile}`;
          return;
        }
      }
    } catch (err) {
      console.warn('VIP check error:', err);
    }
  }

  // If not unlocked, show Paywall Modal
  currentPaywallVideo = video;
  document.getElementById('paywallVideoTitle').textContent = video.title;
  document.getElementById('paywallSinglePrice').textContent = `₹${video.price}`;
  
  const singleBtn = document.getElementById('paywallSingleBtn');
  singleBtn.onclick = () => {
    closeModal('paywallModal');
    openCheckout('video', video.id);
  };

  openModal('paywallModal');
}

// 2. Render Memberships
function renderMemberships(plans) {
  const container = document.getElementById('membershipContainer');
  if (!container) return;

  container.innerHTML = plans.map((p, idx) => {
    const isFeatured = p.id === 'plan-3m';
    return `
      <div class="member-plan-card ${isFeatured ? 'featured' : ''}">
        <span class="plan-badge-top">${p.badge}</span>
        <h3 class="plan-title">${p.title}</h3>
        <div class="plan-duration">${p.durationText}</div>

        <div class="plan-price-row">
          <span class="plan-price-val">₹${p.price}</span>
          ${p.originalPrice ? `<span class="plan-price-strike">₹${p.originalPrice}</span>` : ''}
        </div>

        <ul class="plan-perks-list">
          ${(p.perks || []).map(perk => `
            <li class="plan-perk-item">
              <span style="color: var(--emerald); font-weight: 800;">✓</span>
              <span>${perk}</span>
            </li>
          `).join('')}
        </ul>

        <button class="btn ${isFeatured ? 'btn-primary' : 'btn-gold'} btn-lg" style="width: 100%;" onclick="openCheckout('membership', '${p.id}')">
          <span>👑</span> Join ${p.title}
        </button>
      </div>
    `;
  }).join('');
}

// 3. Render SPA Course Section
function renderSpaCourse(spa) {
  if (!spa.title) return;
  if (document.getElementById('spaCardTitle')) document.getElementById('spaCardTitle').textContent = spa.title;
  if (document.getElementById('spaCardDesc')) document.getElementById('spaCardDesc').textContent = spa.description || '';
  if (document.getElementById('spaCardPrice')) document.getElementById('spaCardPrice').textContent = `₹${spa.price || 299}`;
  if (document.getElementById('spaCardOrigPrice')) document.getElementById('spaCardOrigPrice').textContent = spa.originalPrice ? `₹${spa.originalPrice}` : '';
}

function openSpaSampleModal() {
  const sample = catalogData.spaCourse?.previewSample || 'Aromatherapy techniques, Swedish strokes, pressure points and client relaxation protocols.';
  document.getElementById('spaSampleText').textContent = sample;
  openModal('spaSampleModal');
}

// 4. Render Friends / Meeting Fix Profiles
function renderFriends(friends) {
  const container = document.getElementById('friendsContainer');
  if (!container) return;

  container.innerHTML = friends.map(f => {
    return `
      <div class="friend-card">
        <div class="friend-header-row">
          <div class="friend-avatar-circle">${f.avatar || '💃'}</div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 1.25rem; font-weight: 800;">${f.name}</h3>
              <span style="color: var(--gold); font-size: 0.85rem;">${f.rating || '5.0 ★'}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Age: ${f.age} Years</div>
          </div>
        </div>

        <div class="friend-cities-tag">📍 ${f.cities}</div>
        <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 12px; flex-grow: 1;">${f.bio}</p>

        <div style="font-size: 0.82rem; color: var(--text-dim); margin-bottom: 16px;">
          Interests: <strong>${f.interests}</strong>
        </div>

        <button class="btn btn-outline" style="width: 100%; border-color: var(--cyan); color: #fff;" onclick="openMeetingModal('${f.id}', '${f.name.replace(/'/g, "\\'")}')">
          <span>🤝</span> Fix a Meeting with ${f.name}
        </button>
      </div>
    `;
  }).join('');
}

// Meeting Request Modal Handlers
function openMeetingModal(friendId, friendName) {
  document.getElementById('meetFriendName').value = friendName;
  document.getElementById('meetingRequestForm').dataset.friendId = friendId;
  const savedMobile = localStorage.getItem('hz_vip_mobile');
  if (savedMobile) document.getElementById('meetMobile').value = savedMobile;
  openModal('meetingModal');
}

async function handleMeetingSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('meetSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const customerName = document.getElementById('meetCustomerName').value.trim();
  const mobile = document.getElementById('meetMobile').value.trim();
  const city = document.getElementById('meetCity').value.trim();
  const preferredDate = document.getElementById('meetTime').value.trim();
  const message = document.getElementById('meetMsg').value.trim();
  const friendName = document.getElementById('meetFriendName').value;
  const friendId = document.getElementById('meetingRequestForm').dataset.friendId;

  try {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, mobile, city, preferredDate, message, friendName, friendId })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = 'Submit Meeting Request';

    if (data.success) {
      localStorage.setItem('hz_vip_mobile', mobile);
      closeModal('meetingModal');
      showToast('Meeting request submitted! Humari team aapko WhatsApp karegi. 🤝');
    } else {
      showToast(data.message || 'Error submitting request', 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Submit Meeting Request';
    showToast('Failed to connect.', 'error');
  }
}

// Checkout Handlers
function openCheckout(itemType, itemId) {
  let item = null;
  if (itemType === 'membership') {
    item = (catalogData.memberships || []).find(m => m.id === itemId);
  } else if (itemType === 'video') {
    item = (catalogData.videos || []).find(v => v.id === itemId);
  } else if (itemType === 'spa') {
    item = catalogData.spaCourse;
  }

  if (!item) return;

  currentCheckoutItem = { ...item, itemType };
  document.getElementById('checkoutModalTitle').textContent = `🛒 VIP Checkout: ${item.title}`;
  document.getElementById('checkoutItemTitle').textContent = item.title;
  document.getElementById('checkoutItemType').textContent = itemType === 'membership' ? 'VIP All-Access Membership' : (itemType === 'video' ? 'Full HD Video Episode' : 'SPA Course PDF');
  document.getElementById('checkoutItemPrice').textContent = `₹${item.price}`;

  const savedMobile = localStorage.getItem('hz_vip_mobile');
  if (savedMobile) {
    document.getElementById('buyerMobile').value = savedMobile;
    document.getElementById('buyerWhatsapp').value = savedMobile;
  }

  // Dynamic QR code
  updateDynamicQr(item.price);
  selectPayMode('instant_demo');
  openModal('checkoutModal');
}

function updateDynamicQr(amount) {
  const upiId = siteSettings.upiId || 'hottyzilla@upi';
  const merchant = encodeURIComponent(siteSettings.merchantName || 'HOTTY ZILLA VIP');
  const upiUrl = `upi://pay?pa=${upiId}&pn=${merchant}&am=${amount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;
  const img = document.getElementById('dynamicQrImage');
  if (img) img.src = qrUrl;
}

function selectPayMode(mode) {
  currentPayMode = mode;
  const upiBtn = document.getElementById('modeUpiBtn');
  const demoBtn = document.getElementById('modeDemoBtn');
  const upiBox = document.getElementById('upiPayBox');
  const demoBox = document.getElementById('demoPayBox');
  const utrInput = document.getElementById('buyerUtr');

  if (mode === 'upi_qr') {
    upiBtn.classList.add('btn-gold');
    upiBtn.classList.remove('btn-outline');
    demoBtn.classList.remove('btn-primary');
    demoBtn.classList.add('btn-outline');
    upiBox.style.display = 'block';
    demoBox.style.display = 'none';
    if (utrInput) utrInput.required = true;
  } else {
    demoBtn.classList.add('btn-primary');
    demoBtn.classList.remove('btn-outline');
    upiBtn.classList.remove('btn-gold');
    upiBtn.classList.add('btn-outline');
    upiBox.style.display = 'none';
    demoBox.style.display = 'block';
    if (utrInput) utrInput.required = false;
  }
}

function copyUpiId() {
  const upi = siteSettings.upiId || 'hottyzilla@upi';
  navigator.clipboard.writeText(upi).then(() => {
    showToast(`UPI ID (${upi}) copied!`);
  });
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  if (!currentCheckoutItem) return;

  const btn = document.getElementById('checkoutSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Activating VIP...';

  const customerName = document.getElementById('buyerName').value.trim();
  const mobile = document.getElementById('buyerMobile').value.trim();
  const whatsapp = document.getElementById('buyerWhatsapp').value.trim();
  const utr = document.getElementById('buyerUtr')?.value.trim() || '';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        mobile,
        whatsapp,
        itemType: currentCheckoutItem.itemType,
        itemId: currentCheckoutItem.id,
        paymentMode: currentPayMode,
        utr
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = 'Complete & Unlock VIP';

    if (data.success) {
      localStorage.setItem('hz_vip_mobile', mobile);
      closeModal('checkoutModal');
      showToast(data.message || 'VIP Access Unlocked! 🎉');
      setTimeout(() => {
        window.location.href = `/my-library.html?mobile=${mobile}`;
      }, 1500);
    } else {
      showToast(data.message || 'Payment failed.', 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Complete & Unlock VIP';
    showToast('Failed to complete order.', 'error');
  }
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    if (e.target.id === 'shortPlayerModal') closeShortPlayer();
  }
});

// ==============================================
// CUSTOMER AUTH & PROFILE MANAGEMENT
// ==============================================

function openCustomerLoginModal() {
  openModal('customerLoginModal');
}

async function handleCustomerLoginSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('custEmailInput');
  const email = emailInput.value.trim().toLowerCase();
  const btn = document.getElementById('loginSubmitBtn');

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const res = await fetch('/api/auth/customer-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = 'Login / Create Profile';

    if (data.success && data.user) {
      currentCustomer = data.user;
      localStorage.setItem('hz_customer_user', JSON.stringify(data.user));
      if (data.user.mobile) {
        localStorage.setItem('hz_vip_mobile', data.user.mobile);
      }
      updateAuthHeaderUI();
      closeModal('customerLoginModal');
      showToast(`Welcome ${data.user.name || 'Friend'}! 🌟`);
      openCustomerProfileModal();
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch(err) {
    btn.disabled = false;
    btn.textContent = 'Login / Create Profile';
    showToast('Failed to connect to server', 'error');
  }
}

async function openCustomerProfileModal() {
  if (!currentCustomer) {
    openCustomerLoginModal();
    return;
  }

  document.getElementById('profEmailDisplay').textContent = currentCustomer.email;
  document.getElementById('profNameInput').value = currentCustomer.name || '';
  document.getElementById('profAgeInput').value = currentCustomer.age || 21;
  document.getElementById('profMobileInput').value = currentCustomer.mobile || '';

  // Check VIP membership status
  const vipBadge = document.getElementById('profVipBadge');
  const vipMsg = document.getElementById('profVipMessage');

  try {
    const lookupParam = currentCustomer.mobile ? `mobile=${currentCustomer.mobile}` : `q=${currentCustomer.email}`;
    const res = await fetch(`/api/student/vip-access?${lookupParam}`);
    const data = await res.json();
    if (data.success && data.isVipActive) {
      vipBadge.textContent = '👑 Active VIP Member';
      vipBadge.className = 'badge-pill badge-fire';
      const expDate = data.membership?.expiresAt ? new Date(data.membership.expiresAt).toLocaleDateString() : 'Active';
      vipMsg.innerHTML = `<strong>${data.membership?.planTitle || 'VIP Pass'}</strong> active! Valid till ${expDate}. Saari videos unlocked hain!`;
    } else {
      vipBadge.textContent = '❌ No Active Membership';
      vipBadge.className = 'badge-pill badge-gold';
      vipMsg.textContent = 'Membership lekar sabhi video shorts, full uncut HD videos aur SPA guide ka direct access paayein!';
    }
  } catch(e) {
    vipBadge.textContent = 'Inactive';
  }

  // Check Creator Program Status
  const crBadge = document.getElementById('profCreatorBadge');
  const crMsg = document.getElementById('profCreatorMsg');
  const crAction = document.getElementById('profCreatorActionArea');

  try {
    const crRes = await fetch(`/api/creator/status?email=${encodeURIComponent(currentCustomer.email)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    const crData = await crRes.json();
    if (crData.success && crData.applied && crData.creator) {
      const creator = crData.creator;
      if (creator.status === 'approved') {
        if (crBadge) {
          crBadge.textContent = '✅ Approved Creator ($USD)';
          crBadge.className = 'badge-pill badge-fire';
        }
        if (crMsg) {
          crMsg.innerHTML = `<strong>${creator.handle}</strong> verified! Aapka Creator Studio active hai. Dollar Earnings: <strong>$${Number(creator.earningsUSD || 0).toFixed(2)} USD</strong>.`;
        }
        if (crAction) {
          crAction.innerHTML = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="/creator-studio.html" class="btn btn-gold btn-sm" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-weight: 800;">
                <span>🌟</span> Open Full Creator Studio ($USD)
              </a>
              <button type="button" class="btn btn-outline btn-sm" onclick="closeModal('customerProfileModal'); openCreatorStudioModal();">
                ⚡ Quick Stats
              </button>
            </div>
          `;
        }
      } else if (creator.status === 'pending_verification') {
        if (crBadge) {
          crBadge.textContent = '⏳ Pending (10-15 Min)';
          crBadge.className = 'badge-pill badge-gold';
        }
        if (crMsg) {
          crMsg.innerHTML = `Aapki application review ho rahi hai. <strong>10-15 minute</strong> me control desk se verify hokar approve ho jayegi.`;
        }
        if (crAction) {
          crAction.innerHTML = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <button type="button" class="btn btn-outline btn-sm" disabled style="opacity: 0.8; border-color: var(--gold); color: var(--gold);">
                ⏳ Review in Progress (10-15 Min)
              </button>
              <a href="/creator-studio.html" class="btn btn-outline btn-sm" style="text-decoration: none; border-color: var(--cyan); color: var(--cyan);">
                Check Studio Status
              </a>
            </div>
          `;
        }
      } else {
        if (crBadge) {
          crBadge.textContent = '❌ Application Rejected';
          crBadge.className = 'badge-pill';
        }
        if (crMsg) {
          crMsg.textContent = 'Aapki application accept nahi hui. Details update karke re-apply karein.';
        }
        if (crAction) {
          crAction.innerHTML = `
            <button type="button" class="btn btn-primary btn-sm" onclick="openCreatorApplyModal()">
              <span>🔄</span> Re-apply as Creator
            </button>
          `;
        }
      }
    } else {
      const email = (currentCustomer?.email || '').toLowerCase().trim();
      const isApprovedLocally = localStorage.getItem('hz_is_creator') === 'true' || 
                               localStorage.getItem('hz_creator_approved_' + email) === 'true';
      const isAppliedLocally = localStorage.getItem('hz_creator_applied') === 'true';

      if (isApprovedLocally) {
        if (crBadge) {
          crBadge.textContent = '✅ Approved Creator ($USD)';
          crBadge.className = 'badge-pill badge-fire';
        }
        if (crMsg) {
          crMsg.innerHTML = `Verified Creator! Aapka Creator Studio active hai.`;
        }
        if (crAction) {
          crAction.innerHTML = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="/creator-studio.html" class="btn btn-gold btn-sm" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-weight: 800;">
                <span>🌟</span> Open Full Creator Studio ($USD)
              </a>
            </div>
          `;
        }
      } else if (isAppliedLocally) {
        if (crBadge) {
          crBadge.textContent = '⏳ Pending (10-15 Min)';
          crBadge.className = 'badge-pill badge-gold';
        }
        if (crMsg) {
          crMsg.innerHTML = `Aapki application review ho rahi hai. <strong>10-15 minute</strong> me control desk se verify hokar approve ho jayegi.`;
        }
        if (crAction) {
          crAction.innerHTML = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <button type="button" class="btn btn-outline btn-sm" disabled style="opacity: 0.8; border-color: var(--gold); color: var(--gold);">
                ⏳ Review in Progress (10-15 Min)
              </button>
              <a href="/creator-studio.html" class="btn btn-outline btn-sm" style="text-decoration: none; border-color: var(--cyan); color: var(--cyan);">
                Check Studio Status
              </a>
            </div>
          `;
        }
      } else {
        if (crBadge) {
          crBadge.textContent = 'Not Applied';
          crBadge.className = 'badge-pill';
        }
        if (crMsg) {
          crMsg.textContent = 'Videos upload karein aur har 1,000 views par Dollars ($USD) me paise kamayein! Form submit karne ke 10-15 minute me verify karke approve kiya jayega.';
        }
        if (crAction) {
          crAction.innerHTML = `
            <button type="button" class="btn btn-primary btn-sm" onclick="openCreatorApplyModal()">
              <span>🌟</span> Join Creator Program &amp; Earn Dollars ($USD)
            </button>
          `;
        }
      }
    }
  } catch(err) {
    console.warn('Creator status check error:', err);
  }

  openModal('customerProfileModal');
}

function openCreatorApplyModal() {
  if (!currentCustomer) {
    showToast('Pehle login karein!');
    openCustomerLoginModal();
    return;
  }

  closeModal('customerProfileModal');
  document.getElementById('crEmail').value = currentCustomer.email;
  document.getElementById('crLegalName').value = currentCustomer.name || '';
  document.getElementById('crAge').value = currentCustomer.age || 21;
  openModal('creatorApplyModal');
}

async function handleCreatorApplySubmit(e) {
  e.preventDefault();
  if (!currentCustomer) return;

  const btn = document.getElementById('crSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting Application...';

  const realName = document.getElementById('crLegalName').value.trim();
  const handle = document.getElementById('crHandle').value.trim();
  const age = document.getElementById('crAge').value;
  const city = document.getElementById('crCity').value.trim();
  const address = document.getElementById('crAddress').value.trim();
  const email = document.getElementById('crEmail').value.trim();
  const category = document.getElementById('crCategory').value;
  const bio = document.getElementById('crBio').value.trim();

  if (Number(age) < 18) {
    showToast('Creator Program sirf 18+ saal ke vyaktiyon ke liye hai.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Submit Creator Application';
    return;
  }

  try {
    const res = await fetch('/api/creator/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        realName,
        handle,
        age,
        city,
        address,
        email,
        category,
        bio
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Submit Creator Application';

    if (data.success) {
      const cleanEmail = email.toLowerCase().trim();
      const creatorObj = {
        realName,
        handle: handle.startsWith('@') ? handle : '@' + handle,
        age: Number(age) || 21,
        city,
        address,
        email: cleanEmail,
        category,
        bio,
        status: 'pending_verification',
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem('hz_creator_profile', JSON.stringify(creatorObj));
      localStorage.setItem('hz_creator_email', cleanEmail);
      localStorage.setItem('hz_creator_applied', 'true');
      localStorage.setItem('hz_creator_status', 'pending_verification');

      showToast(data.message || 'Application submitted! Control Desk me pending hai. ✅');
      closeModal('creatorApplyModal');
      openCustomerProfileModal();
      startAppCreatorStatusPoll(cleanEmail);
    } else {
      showToast(data.message || 'Error submitting application', 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Submit Creator Application';
    showToast('Failed to submit application to server', 'error');
  }
}

let appCreatorPollTimer = null;
function startAppCreatorStatusPoll(email) {
  if (appCreatorPollTimer) clearInterval(appCreatorPollTimer);
  const cleanEmail = (email || '').toLowerCase().trim();
  appCreatorPollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/creator/status?email=${encodeURIComponent(cleanEmail)}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      const data = await res.json();
      if (data.success && data.applied && data.creator && data.creator.status === 'approved') {
        clearInterval(appCreatorPollTimer);
        appCreatorPollTimer = null;
        localStorage.setItem('hz_creator_approved_' + cleanEmail, 'true');
        localStorage.setItem('hz_is_creator', 'true');
        localStorage.setItem('hz_creator_status', 'approved');
        try {
          const prof = JSON.parse(localStorage.getItem('hz_creator_profile') || '{}');
          prof.status = 'approved';
          localStorage.setItem('hz_creator_profile', JSON.stringify(prof));
        } catch(e) {}
        if (currentCustomer) currentCustomer.isCreator = true;
        updateAuthHeaderUI();
        showToast('🎉 Mubarak ho! Creator Studio Control Desk se turant approve ho gaya! 🌟');
        const profModal = document.getElementById('customerProfileModal');
        if (profModal && profModal.classList.contains('active')) {
          openCustomerProfileModal();
        }
      }
    } catch(e) {}
  }, 1200);
}

let currentBoostPayMode = 'instant_demo';

async function openCreatorStudioModal() {
  if (!currentCustomer) {
    openCustomerLoginModal();
    return;
  }

  try {
    const res = await fetch(`/api/creator/status?email=${encodeURIComponent(currentCustomer.email)}`);
    const data = await res.json();

    if (!data.success || !data.applied || !data.creator) {
      showToast('Pehle Creator Program ke liye apply karein!');
      openCreatorApplyModal();
      return;
    }

    const creator = data.creator;
    if (creator.status !== 'approved') {
      showToast('Aapki creator request abhi 10-15 minute ke verification me hai.', 'error');
      openCustomerProfileModal();
      return;
    }

    document.getElementById('csCreatorName').textContent = `${creator.realName} (${creator.handle})`;
    document.getElementById('csEarningsVal').textContent = `$${Number(creator.earningsUSD || 0).toFixed(2)}`;
    document.getElementById('csViewsVal').textContent = Number(creator.totalViews || 0).toLocaleString();
    document.getElementById('csRpmVal').textContent = `$${Number(data.rateUSD || 1.50).toFixed(2)}`;
    document.getElementById('csVideosVal').textContent = (data.videos || []).length || (catalogData.videos || []).length;

    // Populate video selector for boost
    const boostSelect = document.getElementById('boostVideoSelect');
    if (boostSelect) {
      const allVideos = (data.videos && data.videos.length > 0) ? data.videos : (catalogData.videos || []);
      boostSelect.innerHTML = allVideos.map(v => `
        <option value="${v.id}" data-title="${v.title.replace(/"/g, '&quot;')}">${v.title} (${v.views || '1.2K'} views)</option>
      `).join('');
    }

    // Default payment mode for boost
    selectBoostPayMode('instant_demo');

    openModal('creatorStudioModal');
  } catch (err) {
    showToast('Failed to load Creator Studio', 'error');
  }
}

function selectBoostPayMode(mode) {
  currentBoostPayMode = mode;
  const upiBtn = document.getElementById('boostModeUpiBtn');
  const demoBtn = document.getElementById('boostModeDemoBtn');
  const upiBox = document.getElementById('boostUpiBox');
  const qrImg = document.getElementById('boostQrImage');

  if (mode === 'upi_qr') {
    if (upiBtn) {
      upiBtn.className = 'btn btn-primary';
      upiBtn.style.borderColor = 'var(--gold)';
    }
    if (demoBtn) demoBtn.className = 'btn btn-outline';
    if (upiBox) upiBox.style.display = 'block';

    const selectedPkg = document.querySelector('input[name="boostPkg"]:checked');
    const amountINR = selectedPkg ? selectedPkg.value.split(':')[1] : '500';
    const upiId = siteSettings.upiId || 'hottyzilla@upi';
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('HottyZillaBoost')}&am=${amountINR}&cu=INR&tn=${encodeURIComponent('VideoTrafficBoost')}`;
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`;
    }
  } else {
    if (demoBtn) demoBtn.className = 'btn btn-primary';
    if (upiBtn) {
      upiBtn.className = 'btn btn-outline';
      upiBtn.style.borderColor = '';
    }
    if (upiBox) upiBox.style.display = 'none';
  }
}

async function handleBoostVideoSubmit(e) {
  e.preventDefault();
  if (!currentCustomer) return;

  const btn = document.getElementById('boostSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Activating Traffic Campaign...';

  const pkgRadio = document.querySelector('input[name="boostPkg"]:checked');
  if (!pkgRadio) {
    showToast('Traffic package select karein', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Activate Video Boost Campaign';
    return;
  }

  const [targetViews, amountINR] = pkgRadio.value.split(':');
  const boostSelect = document.getElementById('boostVideoSelect');
  const videoId = boostSelect.value;
  const selectedOpt = boostSelect.options[boostSelect.selectedIndex];
  const videoTitle = selectedOpt ? selectedOpt.getAttribute('data-title') || selectedOpt.text : 'Promoted Video';

  const utr = (document.getElementById('boostUtrInput')?.value || '').trim();

  try {
    const res = await fetch('/api/creator/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorEmail: currentCustomer.email,
        creatorName: currentCustomer.name || currentCustomer.email.split('@')[0],
        videoId,
        videoTitle,
        targetViews: Number(targetViews),
        amountINR: Number(amountINR),
        paymentMode: currentBoostPayMode,
        utr: currentBoostPayMode === 'upi_qr' ? utr : 'DEMO-BOOST-' + Date.now().toString(36).toUpperCase()
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Activate Video Boost Campaign';

    if (data.success) {
      showToast(`🔥 Boost Activated! ${Number(targetViews).toLocaleString()} views campaign is now running!`);
      closeModal('creatorStudioModal');
      // Reset ad views so user sees it right away
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem('hz_ad_views_' + today);
      fetchCatalog();
    } else {
      showToast(data.message || 'Error starting campaign', 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀</span> Activate Video Boost Campaign';
    showToast('Failed to connect to promotion service', 'error');
  }
}

async function handleProfileSave(e) {
  e.preventDefault();
  if (!currentCustomer) return;

  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const name = document.getElementById('profNameInput').value.trim();
  const age = document.getElementById('profAgeInput').value;
  const mobile = document.getElementById('profMobileInput').value.trim();

  try {
    const res = await fetch('/api/customer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentCustomer.email,
        name,
        age,
        mobile
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = 'Save Profile Changes';

    if (data.success && data.user) {
      currentCustomer = data.user;
      localStorage.setItem('hz_customer_user', JSON.stringify(data.user));
      if (mobile) localStorage.setItem('hz_vip_mobile', mobile);
      updateAuthHeaderUI();
      showToast('Profile successfully update ho gayi! ✅');
      closeModal('customerProfileModal');
    } else {
      showToast(data.message || 'Failed to update profile', 'error');
    }
  } catch(err) {
    btn.disabled = false;
    btn.textContent = 'Save Profile Changes';
    showToast('Failed to save profile changes', 'error');
  }
}

function customerLogout() {
  localStorage.removeItem('hz_customer_user');
  currentCustomer = null;
  updateAuthHeaderUI();
  closeModal('customerProfileModal');
  showToast('Logged out successfully.');
}

function handleMobileNavProfileClick() {
  if (currentCustomer) {
    openCustomerProfileModal();
  } else {
    openCustomerLoginModal();
  }
}

