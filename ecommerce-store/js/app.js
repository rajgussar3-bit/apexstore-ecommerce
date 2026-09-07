/**
 * ApexStore - High Performance Mobile & Desktop Application Logic
 * Full API Integration, Local Storage Persistence, and Ultra-Smooth Mobile UX
 */

// Global State
const state = {
  products: (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA : [],
  cart: JSON.parse(localStorage.getItem('apex_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('apex_wishlist')) || [],
  orders: JSON.parse(localStorage.getItem('apex_orders')) || [],
  currentCategory: 'all',
  currentRating: 0,
  maxPrice: 150000,
  searchQuery: '',
  sortBy: 'featured',
  appliedCoupon: null,
  currency: localStorage.getItem('apex_currency') || 'INR',
  theme: localStorage.getItem('apex_theme') || 'light',
  heroIndex: 0
};

// Hero Slides Data (Authentic High-Energy Flipkart Big Billion Days Aesthetics)
const HERO_SLIDES = [
  {
    pill: "💥 BIG BILLION DAYS",
    title: "INDIA'S BIGGEST TECH SALE",
    subtitle: "Up to 80% OFF on iPhone 15 Pro, S24 Ultra & Sony ANC Audio. Extra ₹1,500 Off on HDFC & Axis Bank Cards!",
    btnText: "Shop Electronics",
    category: "electronics",
    bgStyle: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #f59e0b 100%)",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80"
  },
  {
    pill: "👟 SNEAKER FESTIVAL",
    title: "AIR JORDAN 1 & NIKE PULSE",
    subtitle: "Authentic OG Chicago Colorways, Adidas Samba & Streetwear Hoodies. Starting at ₹1,999 today!",
    btnText: "Shop Sneakers",
    category: "footwear",
    bgStyle: "linear-gradient(135deg, #991b1b 0%, #dc2626 55%, #fb923c 100%)",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80"
  },
  {
    pill: "✨ SMART LIVING FEST",
    title: "LUXURY WATCHES & HOME",
    subtitle: "Fossil Chronograph, Dyson V12 Detect & Versace Eros EDP. 100% Genuine with Free Fast Delivery!",
    btnText: "Explore Luxury",
    category: "accessories",
    bgStyle: "linear-gradient(135deg, #090d16 0%, #1e293b 55%, #3b82f6 100%)",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&auto=format&fit=crop&q=80"
  }
];

const FREE_SHIPPING_THRESHOLD = 999;

/* ==========================================================================
   Web Audio API Haptic Audio Feedback
   ========================================================================== */
function playCartChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {}
}

function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.28);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.28);
    });
  } catch (e) {}
}

/* ==========================================================================
   Utility Helpers
   ========================================================================== */
function formatPrice(inrAmount) {
  const curr = (typeof CURRENCIES !== 'undefined' && CURRENCIES[state.currency]) ? CURRENCIES[state.currency] : { symbol: "₹", rate: 1 };
  const converted = inrAmount * curr.rate;
  
  if (state.currency === 'INR') {
    return `${curr.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  } else {
    return `${curr.symbol}${converted.toFixed(2)}`;
  }
}

function saveState() {
  localStorage.setItem('apex_cart', JSON.stringify(state.cart));
  localStorage.setItem('apex_wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('apex_orders', JSON.stringify(state.orders));
  localStorage.setItem('apex_currency', state.currency);
  localStorage.setItem('apex_theme', state.theme);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-leave');
    setTimeout(() => toast.remove(), 280);
  }, 2800);
}

/* ==========================================================================
   Fetch Products from Backend (with fallback)
   ========================================================================== */
async function loadProductsFromBackend() {
  try {
    const url = (typeof getApiUrl === 'function') ? getApiUrl('/api/products') : '/api/products';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        state.products = data.products;
        renderProductGrid();
      }
    }
  } catch (err) {
    console.log('Using local products data cache.');
  }
}

/* ==========================================================================
   DOM Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeToggleIcons();

  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.value = state.currency;
    currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      saveState();
      renderAll();
      showToast(`Currency set to ${state.currency}`, 'info');
    });
  }

  initHeroSlider();
  startFlashCountdown();
  setupSearchAndFilters();
  renderAll();
  loadProductsFromBackend();
  setupDrawersAndModals();
  setupCheckout();
  renderReviews();
});

/* ==========================================================================
   Hero Slider
   ========================================================================== */
window.setHeroSlide = function(idx) {
  state.heroIndex = idx;
  const slideElem = document.getElementById('hero-slide');
  if (slideElem) {
    const slide = HERO_SLIDES[state.heroIndex];
    slideElem.style.background = `${slide.bgStyle}, url('${slide.image}') center/cover no-repeat`;
    slideElem.style.backgroundBlendMode = 'overlay';
    slideElem.innerHTML = `
      <div class="hero-content">
        <span class="hero-slide-badge">${slide.pill}</span>
        <h1 class="hero-title">${slide.title}</h1>
        <p class="hero-subtitle">${slide.subtitle}</p>
        <div class="hero-cta-group">
          <button class="btn btn-primary btn-sm" onclick="filterByCategory('${slide.category}')">
            ${slide.btnText}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <a href="#products-section" class="btn btn-outline-white btn-sm">Explore All</a>
        </div>
        <div style="display:flex;gap:6px;margin-top:1rem;align-items:center;">
          ${HERO_SLIDES.map((_, i) => `
            <span style="width:${i === state.heroIndex ? '22px' : '7px'};height:5px;border-radius:3px;background:${i === state.heroIndex ? '#ffe500' : 'rgba(255,255,255,0.45)'};transition:all 0.3s ease;display:inline-block;cursor:pointer;" onclick="setHeroSlide(${i})"></span>
          `).join('')}
        </div>
      </div>
    `;
  }
};

function initHeroSlider() {
  const slideElem = document.getElementById('hero-slide');
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  if (!slideElem) return;

  setHeroSlide(state.heroIndex);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevIdx = (state.heroIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
      setHeroSlide(prevIdx);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextIdx = (state.heroIndex + 1) % HERO_SLIDES.length;
      setHeroSlide(nextIdx);
    });
  }

  setInterval(() => {
    const nextIdx = (state.heroIndex + 1) % HERO_SLIDES.length;
    setHeroSlide(nextIdx);
  }, 6000);
}

/* ==========================================================================
   Flash Countdown
   ========================================================================== */
function startFlashCountdown() {
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');
  if (!hoursEl || !minsEl || !secsEl) return;

  function update() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    if (diff <= 0) {
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   Product Catalog Rendering & Filtering
   ========================================================================== */
function getFilteredProducts() {
  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;

  return source.filter(product => {
    if (state.currentCategory !== 'all' && product.category !== state.currentCategory) {
      return false;
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = (product.description || '').toLowerCase().includes(q);
      const matchCat = (product.category_name || product.categoryName || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    if (product.price > state.maxPrice) {
      return false;
    }
    if (state.currentRating > 0 && product.rating < state.currentRating) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (state.sortBy === 'price-low') return a.price - b.price;
    if (state.sortBy === 'price-high') return b.price - a.price;
    if (state.sortBy === 'rating') return b.rating - a.rating;
    if (state.sortBy === 'discount') {
      const origA = a.original_price || a.originalPrice || a.price;
      const origB = b.original_price || b.originalPrice || b.price;
      const discA = (origA - a.price) / origA;
      const discB = (origB - b.price) / origB;
      return discB - discA;
    }
    return a.id - b.id;
  });
}

function renderProductGrid() {
  const grid = document.getElementById('product-grid');
  const countLabel = document.getElementById('products-count-label');
  if (!grid) return;

  const products = getFilteredProducts();
  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  if (countLabel) {
    countLabel.textContent = `Showing ${products.length} of ${source.length} products`;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:3rem 1rem;">
        <svg class="empty-icon" style="width:48px;height:48px;margin:0 auto 0.75rem;color:var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h4 style="font-weight:800;font-size:1.1rem;margin-bottom:0.25rem;">No products match your search</h4>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">Try clearing your filters or searching for something else.</p>
        <button class="btn btn-primary btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const isWishlisted = state.wishlist.includes(p.id);
    const origPrice = p.original_price || p.originalPrice || p.price;
    const discountPercent = Math.round(((origPrice - p.price) / origPrice) * 100);
    const catName = p.category_name || p.categoryName || 'General';

    // Check if item is currently in cart
    const cartItem = state.cart.find(item => item.id === p.id);
    const cartQty = cartItem ? cartItem.quantity : 0;

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-img-wrap" onclick="openQuickView(${p.id})">
          ${p.badge ? `<span class="card-badge ${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" />
          
          <button class="floating-wishlist-btn ${isWishlisted ? 'active' : ''}" title="Wishlist" onclick="event.stopPropagation(); toggleWishlist(${p.id});">
            <svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="product-details">
          <span class="product-category">${catName}</span>
          <h4 class="product-title" onclick="openQuickView(${p.id})" title="${p.name}">${p.name}</h4>
          
          <div class="product-rating-row">
            <div class="fk-rating-pill">
              ${p.rating || 4.5}
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span class="fk-rating-count">(${p.review_count || p.reviewCount || 0})</span>
            <div class="fk-assured-badge"><span>✦</span> Assured</div>
          </div>

          <div class="product-price-row">
            <span class="current-price">${formatPrice(p.price)}</span>
            <span class="original-price">${formatPrice(origPrice)}</span>
            <span class="discount-tag">${discountPercent}% off</span>
          </div>

          <div class="fk-free-delivery">Free delivery</div>

          <div class="card-cart-action-wrap">
            ${cartQty > 0 ? `
              <div class="card-stepper">
                <button class="card-stepper-btn" onclick="quickCardQtyChange(${p.id}, -1)">-</button>
                <span class="card-stepper-val">${cartQty} in cart</span>
                <button class="card-stepper-btn" onclick="quickCardQtyChange(${p.id}, 1)">+</button>
              </div>
            ` : `
              <button class="card-add-btn" onclick="addToCart(${p.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add to Cart
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function quickCardQtyChange(productId, delta) {
  const index = state.cart.findIndex(item => item.id === productId);
  if (index > -1) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
      showToast('Item removed from cart', 'info');
    }
  } else if (delta > 0) {
    addToCart(productId);
    return;
  }
  saveState();
  updateBadgeCounts();
  renderProductGrid();
  renderCartDrawer();
}

function renderStarRating(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      stars += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return stars;
}

/* ==========================================================================
   Filter & Search Listeners
   ========================================================================== */
function setupSearchAndFilters() {
  const dSearch = document.getElementById('desktop-search-input');
  const dClear = document.getElementById('desktop-search-clear');
  const dSuggestions = document.getElementById('desktop-search-suggestions');

  const mSearch = document.getElementById('mobile-search-input');
  const mClear = document.getElementById('mobile-search-clear');
  const mSuggestions = document.getElementById('mobile-search-suggestions');

  function handleSearch(val, isMobile) {
    state.searchQuery = val;
    if (dSearch && dSearch.value !== val) dSearch.value = val;
    if (mSearch && mSearch.value !== val) mSearch.value = val;

    if (dClear) dClear.classList.toggle('visible', !!val);
    if (mClear) mClear.classList.toggle('visible', !!val);

    const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
    const targetSuggestions = isMobile ? mSuggestions : dSuggestions;

    if (val.trim().length > 1) {
      const matches = source.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
      if (matches.length > 0 && targetSuggestions) {
        targetSuggestions.innerHTML = matches.map(m => `
          <div class="search-suggestion-item" onclick="openQuickView(${m.id})">
            <img src="${m.image}" class="suggestion-img" alt="${m.name}" />
            <div class="suggestion-info">
              <div class="suggestion-title">${m.name}</div>
              <div class="suggestion-price">${formatPrice(m.price)}</div>
            </div>
          </div>
        `).join('');
        targetSuggestions.classList.add('active');
      } else if (targetSuggestions) {
        targetSuggestions.classList.remove('active');
      }
    } else if (targetSuggestions) {
      targetSuggestions.classList.remove('active');
    }

    renderProductGrid();
  }

  if (dSearch) dSearch.addEventListener('input', (e) => handleSearch(e.target.value, false));
  if (mSearch) mSearch.addEventListener('input', (e) => handleSearch(e.target.value, true));

  if (dClear) dClear.addEventListener('click', () => handleSearch('', false));
  if (mClear) mClear.addEventListener('click', () => handleSearch('', true));

  document.addEventListener('click', (e) => {
    if (dSuggestions && !dSuggestions.contains(e.target) && dSearch && !dSearch.contains(e.target)) {
      dSuggestions.classList.remove('active');
    }
    if (mSuggestions && !mSuggestions.contains(e.target) && mSearch && !mSearch.contains(e.target)) {
      mSuggestions.classList.remove('active');
    }
  });

  const dSort = document.getElementById('desktop-sort-select');
  const mSort = document.getElementById('mobile-sort-select');

  function handleSort(val) {
    state.sortBy = val;
    if (dSort) dSort.value = val;
    if (mSort) mSort.value = val;
    renderProductGrid();
  }

  if (dSort) dSort.addEventListener('change', (e) => handleSort(e.target.value));
  if (mSort) mSort.addEventListener('change', (e) => handleSort(e.target.value));

  const priceSlider = document.getElementById('price-slider');
  const priceMaxLabel = document.getElementById('price-max-label');
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      state.maxPrice = Number(e.target.value);
      if (priceMaxLabel) priceMaxLabel.textContent = formatPrice(state.maxPrice);
      renderProductGrid();
    });
  }

  const mobFilterBtn = document.getElementById('mobile-filter-btn');
  const filterSidebar = document.getElementById('filter-sidebar');
  const closeFilterBtn = document.getElementById('close-filter-btn');
  const backdrop = document.getElementById('drawer-backdrop');

  if (mobFilterBtn && filterSidebar) {
    mobFilterBtn.addEventListener('click', () => {
      filterSidebar.classList.add('active');
      backdrop.classList.add('active');
    });
  }

  if (closeFilterBtn) {
    closeFilterBtn.addEventListener('click', closeAllDrawers);
  }
}

function filterByCategory(category) {
  state.currentCategory = category;

  document.querySelectorAll('.story-pill-item').forEach(item => {
    item.classList.toggle('active', item.dataset.category === category);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.category === category);
  });

  renderProductGrid();

  const prodSection = document.getElementById('products-section');
  if (prodSection) {
    prodSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterByRating(rating) {
  state.currentRating = rating;
  renderProductGrid();
}

function resetFilters() {
  state.currentCategory = 'all';
  state.currentRating = 0;
  state.maxPrice = 150000;
  state.searchQuery = '';
  state.sortBy = 'featured';

  const dSearch = document.getElementById('desktop-search-input');
  const mSearch = document.getElementById('mobile-search-input');
  if (dSearch) dSearch.value = '';
  if (mSearch) mSearch.value = '';

  const priceSlider = document.getElementById('price-slider');
  if (priceSlider) priceSlider.value = 150000;

  const priceMaxLabel = document.getElementById('price-max-label');
  if (priceMaxLabel) priceMaxLabel.textContent = formatPrice(150000);

  document.querySelectorAll('input[name="rating-filter"]').forEach(r => r.checked = false);
  const allRatingRadio = document.getElementById('rating-all');
  if (allRatingRadio) allRatingRadio.checked = true;

  document.querySelectorAll('.story-pill-item').forEach(item => {
    item.classList.toggle('active', item.dataset.category === 'all');
  });

  renderProductGrid();
  showToast('Filters reset', 'info');
}

/* ==========================================================================
   Shopping Cart Engine
   ========================================================================== */
function addToCart(productId, selectedColor = null, selectedSize = null, qty = 1) {
  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  const product = source.find(p => p.id === productId);
  if (!product) return;

  const colors = product.colors || ['#1e293b'];
  const sizes = product.sizes || ['Standard'];
  const color = selectedColor || colors[0] || 'Default';
  const size = selectedSize || sizes[0] || 'Standard';

  const existingIndex = state.cart.findIndex(
    item => item.id === productId && item.color === color && item.size === size
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price || product.originalPrice || product.price,
      image: product.image,
      categoryName: product.category_name || product.categoryName || 'General',
      color: color,
      size: size,
      quantity: qty
    });
  }

  saveState();
  updateBadgeCounts();
  renderProductGrid();
  renderCartDrawer();
  playCartChime();
  showToast(`🛒 "${product.name.slice(0, 24)}..." added to cart!`, 'success');
}

function updateCartQty(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;

  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
    showToast('Item removed', 'info');
  }

  saveState();
  updateBadgeCounts();
  renderProductGrid();
  renderCartDrawer();
}

function removeCartItem(index) {
  if (!state.cart[index]) return;
  state.cart.splice(index, 1);
  saveState();
  updateBadgeCounts();
  renderProductGrid();
  renderCartDrawer();
  showToast('Item removed', 'info');
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;
  let isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (state.appliedCoupon) {
    if (state.appliedCoupon.discountPercent) {
      discount = (subtotal * state.appliedCoupon.discountPercent) / 100;
    }
    if (state.appliedCoupon.freeShipping) {
      isFreeShipping = true;
    }
  }

  const shipping = subtotal > 0 && !isFreeShipping ? 99 : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  return { subtotal, discount, shipping, tax, total, isFreeShipping };
}

function renderCartDrawer() {
  const cartBody = document.getElementById('cart-items-list');
  const freeShippingBar = document.getElementById('free-shipping-progress');
  const cartFooter = document.getElementById('cart-footer');
  if (!cartBody) return;

  const totals = calculateCartTotals();

  if (freeShippingBar) {
    const progress = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);

    if (totals.subtotal === 0) {
      freeShippingBar.style.display = 'none';
    } else {
      freeShippingBar.style.display = 'block';
      freeShippingBar.innerHTML = `
        <div class="free-shipping-text">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          ${remaining === 0 ? '🎉 You unlocked FREE Express Delivery!' : `Add ${formatPrice(remaining)} for <strong>FREE Delivery</strong>`}
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      `;
    }
  }

  if (state.cart.length === 0) {
    cartBody.innerHTML = `
      <div class="empty-state" style="border:none; padding: 2.5rem 1rem; text-align:center;">
        <svg class="empty-icon" style="width:48px;height:48px;margin:0 auto 0.75rem;color:var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h4 style="font-weight:800;font-size:1.1rem;margin-bottom:0.25rem;">Your cart is empty</h4>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">Add top-rated items to your bag.</p>
        <button class="btn btn-primary btn-sm" onclick="closeAllDrawers(); filterByCategory('all');">Explore Store</button>
      </div>
    `;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartFooter) cartFooter.style.display = 'block';

  cartBody.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h5 class="cart-item-title">${item.name}</h5>
        <div class="cart-item-meta">Size: ${item.size}</div>
        <div class="cart-item-price-row">
          <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
          <div style="display:flex;align-items:center;">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
            </div>
            <button class="item-remove-btn" title="Remove" onclick="removeCartItem(${idx})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const discountRow = document.getElementById('cart-discount-row');
  const shippingEl = document.getElementById('cart-shipping');
  const grandTotalEl = document.getElementById('cart-total');
  const couponAppliedTag = document.getElementById('coupon-applied-tag');

  if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);
  if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(totals.total);

  if (state.appliedCoupon) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountEl) discountEl.textContent = `-${formatPrice(totals.discount)}`;
    if (couponAppliedTag) {
      couponAppliedTag.style.display = 'flex';
      couponAppliedTag.innerHTML = `
        <span>🎉 Coupon <strong>${state.appliedCoupon.code}</strong> Applied!</span>
        <button onclick="removeCoupon()" style="color:#ef4444;font-size:0.75rem;font-weight:800;">Remove</button>
      `;
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
    if (couponAppliedTag) couponAppliedTag.style.display = 'none';
  }
}

async function applyCoupon() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast('Enter a promo code', 'warning');
    return;
  }

  try {
    const url = (typeof getApiUrl === 'function') ? getApiUrl('/api/coupons/validate') : '/api/coupons/validate';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (res.ok) {
      const data = await res.json();
      state.appliedCoupon = {
        code: data.code,
        discountPercent: data.discount_percent,
        freeShipping: data.free_shipping,
        description: data.description
      };
      renderCartDrawer();
      showToast(`Coupon "${code}" applied!`, 'success');
      return;
    }
  } catch (err) {
    console.log('Validating with local coupon table.');
  }

  if (typeof COUPONS !== 'undefined' && COUPONS[code]) {
    state.appliedCoupon = { code, ...COUPONS[code] };
    renderCartDrawer();
    showToast(`Coupon "${code}" applied!`, 'success');
  } else {
    showToast('Invalid coupon! Try SAVE20, FLASH30, or WELCOME10', 'warning');
  }
}

function removeCoupon() {
  state.appliedCoupon = null;
  const input = document.getElementById('coupon-input');
  if (input) input.value = '';
  renderCartDrawer();
  showToast('Coupon removed', 'info');
}

/* ==========================================================================
   Wishlist Engine
   ========================================================================== */
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast('Removed from Wishlist', 'info');
  } else {
    state.wishlist.push(productId);
    showToast('Saved to Wishlist!', 'success');
  }

  saveState();
  updateBadgeCounts();
  renderProductGrid();
  renderWishlistDrawer();
}

function renderWishlistDrawer() {
  const wishlistBody = document.getElementById('wishlist-items-list');
  if (!wishlistBody) return;

  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  const wishlistedProducts = source.filter(p => state.wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    wishlistBody.innerHTML = `
      <div class="empty-state" style="border:none; padding: 2.5rem 1rem; text-align:center;">
        <svg class="empty-icon" style="width:48px;height:48px;margin:0 auto 0.75rem;color:var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h4 style="font-weight:800;font-size:1.1rem;margin-bottom:0.25rem;">Wishlist is empty</h4>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">Tap the heart on any product to save it here.</p>
        <button class="btn btn-primary btn-sm" onclick="closeAllDrawers(); filterByCategory('all');">Explore Products</button>
      </div>
    `;
    return;
  }

  wishlistBody.innerHTML = wishlistedProducts.map(p => `
    <div class="cart-item">
      <img src="${p.image}" alt="${p.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h5 class="cart-item-title">${p.name}</h5>
        <div class="cart-item-meta">${p.category_name || p.categoryName || 'General'}</div>
        <div class="cart-item-price-row">
          <span class="cart-item-price">${formatPrice(p.price)}</span>
          <div style="display:flex;gap:0.4rem;">
            <button class="btn btn-primary btn-sm" style="padding:0.3rem 0.65rem;font-size:0.75rem;" onclick="addToCart(${p.id}); toggleWishlist(${p.id});">Move to Cart</button>
            <button class="item-remove-btn" onclick="toggleWishlist(${p.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Product Quick View (Flipkart-Style Multi-Angle Gallery & Detailed Specs)
   ========================================================================== */
/* ==========================================================================
   Product Detail Page (Authentic Flipkart Mobile & Desktop Experience)
   ========================================================================== */
let activePdpProduct = null;
let activePdpSelectedColor = null;
let activePdpSelectedSize = null;

function openQuickView(productId) {
  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  const product = source.find(p => p.id === productId);
  if (!product) return;

  activePdpProduct = product;
  const modal = document.getElementById('quick-view-modal');
  const modalContent = document.getElementById('quick-view-content');
  if (!modal || !modalContent) return;

  const images = (product.images && product.images.length > 0) ? product.images : [product.image];
  const colors = (product.colors && product.colors.length > 0) ? product.colors : ['#1e293b'];
  const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ['Standard'];
  const origPrice = product.original_price || product.originalPrice || product.price;
  const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);
  const highlights = product.highlights || product.features || [];
  const specs = product.specs || {};
  const isWishlisted = state.wishlist.includes(product.id);

  let currentImgIndex = 0;
  activePdpSelectedColor = colors[0];
  activePdpSelectedSize = sizes[0];

  modalContent.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;width:100%;">
      
      <!-- 1. Flipkart Mobile Sticky Top Bar (Back Arrow, Title, Share, Wishlist, Cart) -->
      <div class="fk-pdp-top-bar">
        <button class="fk-back-btn" onclick="closeAllModals()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>Back</span>
        </button>
        <div style="font-size:0.85rem;font-weight:700;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-primary);">
          ${product.name}
        </div>
        <div class="fk-pdp-actions">
          <button onclick="shareProduct('${encodeURIComponent(product.name)}')" title="Share" style="color:var(--text-primary);padding:4px;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
          <button id="pdp-wishlist-btn" onclick="toggleWishlist(${product.id}); updatePdpWishlistIcon(${product.id});" title="Wishlist" style="color:${isWishlisted ? '#ff6161' : 'var(--text-primary)'};padding:4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          <button onclick="closeAllModals(); openCartDrawer();" title="Cart" style="position:relative;color:var(--text-primary);padding:4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span class="badge-count cart-badge-count" style="${state.cart.length > 0 ? '' : 'display:none;'}">${state.cart.reduce((t, i) => t + i.quantity, 0)}</span>
          </button>
        </div>
      </div>

      <!-- 2. Scrollable Body -->
      <div class="fk-pdp-scroll-body">
        
        <!-- Multi-Angle Image Gallery with Touch Swipe -->
        <div class="fk-gallery-container" id="pdp-touch-gallery">
          <div class="fk-main-img-wrap">
            <img id="fk-pdp-img" src="${images[0]}" alt="${product.name}" class="fk-main-img" />
          </div>

          <!-- Photo Counter Pill -->
          <div class="fk-photo-counter" id="fk-pdp-counter">
            📸 1 / ${images.length}
          </div>

          <!-- Thumbnails Strip -->
          <div class="fk-thumbnails-strip">
            ${images.map((img, idx) => `
              <div class="fk-thumb-item ${idx === 0 ? 'active' : ''}" onclick="selectFkImage(${idx})">
                <img src="${img}" alt="Angle ${idx + 1}" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Product Basic Info Card -->
        <div class="fk-product-info-box">
          <div class="product-category" style="font-size:0.72rem;color:var(--text-muted);font-weight:800;margin-bottom:0.2rem;">
            ${product.category_name || product.categoryName || 'Top Product'}
          </div>
          <h1 class="fk-pdp-title">${product.name}</h1>
          
          <div class="fk-pdp-rating-row">
            <div class="fk-rating-pill">
              ${product.rating || 4.5}
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span class="fk-rating-count">${product.review_count || product.reviewCount || 342} Ratings & 48 Reviews</span>
            <div class="fk-assured-badge"><span>✦</span> Assured</div>
          </div>

          <!-- Price & Discounts -->
          <div style="margin-bottom:0.35rem;">
            <span style="background:#e8f5e9;color:#388e3c;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:800;">Special Price</span>
          </div>
          <div class="fk-pdp-price-box">
            <span class="fk-pdp-current-price">${formatPrice(product.price)}</span>
            <span class="fk-pdp-original-price">${formatPrice(origPrice)}</span>
            <span class="fk-pdp-discount">${discountPercent}% off</span>
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:0.65rem;">Inclusive of all taxes</div>

          <!-- Color & Size Options -->
          <div style="display:flex;flex-direction:column;gap:0.75rem;padding-top:0.65rem;border-top:1px solid var(--border-subtle);">
            <div>
              <div style="font-size:0.8rem;font-weight:800;margin-bottom:0.4rem;">Color:</div>
              <div style="display:flex;gap:0.5rem;">
                ${colors.map((c, i) => `
                  <div class="color-dot ${i === 0 ? 'active' : ''}" style="background-color:${c};width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid ${i === 0 ? 'var(--primary)' : 'var(--border-subtle)'};" onclick="selectFkColor('${c}', this)"></div>
                `).join('')}
              </div>
            </div>

            <div>
              <div style="font-size:0.8rem;font-weight:800;margin-bottom:0.4rem;">Size / Variant:</div>
              <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
                ${sizes.map((s, i) => `
                  <button class="size-pill ${i === 0 ? 'active' : ''}" style="padding:0.4rem 0.85rem;border-radius:4px;border:1px solid ${i === 0 ? 'var(--primary)' : 'var(--border-subtle)'};background:${i === 0 ? 'var(--primary-light)' : 'var(--bg-surface)'};color:${i === 0 ? 'var(--primary)' : 'var(--text-primary)'};font-size:0.8rem;font-weight:700;" onclick="selectFkSize('${s}', this)">
                    ${s}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Flipkart Bank Offers Accordion -->
        <div class="fk-offers-card">
          <div style="font-size:0.825rem;font-weight:800;color:var(--text-primary);margin-bottom:0.5rem;display:flex;align-items:center;gap:0.35rem;">
            🏷️ <strong>Available Offers</strong>
          </div>
          <div class="fk-offer-item">
            <span style="color:#388e3c;font-weight:800;">•</span>
            <span><strong>Bank Offer</strong>: 5% Unlimited Cashback on Flipkart Axis Bank / UPI Cards</span>
          </div>
          <div class="fk-offer-item">
            <span style="color:#388e3c;font-weight:800;">•</span>
            <span><strong>Special Price</strong>: Get extra ${discountPercent}% off (price inclusive of discount)</span>
          </div>
          <div class="fk-offer-item">
            <span style="color:#388e3c;font-weight:800;">•</span>
            <span><strong>Coupon Offer</strong>: Use coupon code <strong>SAVE20</strong> at checkout for flat 20% discount</span>
          </div>
        </div>

        <!-- Delivery & Services Card -->
        <div class="fk-delivery-card">
          <div class="fk-delivery-check-row">
            <div>
              <span style="color:var(--text-muted);">Deliver to: </span>
              <strong style="color:var(--text-primary);">Mumbai - 400001</strong>
            </div>
            <button style="color:var(--primary);font-weight:800;font-size:0.8rem;" onclick="promptChangePincode()">Change</button>
          </div>
          <div style="display:flex;align-items:center;gap:0.4rem;color:#388e3c;font-weight:700;font-size:0.825rem;">
            <span>🚚</span> FREE Delivery by <strong>Tomorrow, 5 PM</strong>
          </div>
          <div class="fk-features-grid">
            <div>🔄 7 Days Replacement</div>
            <div>💵 Cash on Delivery Available</div>
            <div>🛡️ 1 Year Brand Warranty</div>
            <div>✦ Apex Assured Quality</div>
          </div>
        </div>

        <!-- Product Highlights -->
        ${highlights.length > 0 ? `
          <div style="margin:0 1rem 0.85rem;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:6px;padding:0.85rem;">
            <div style="font-size:0.85rem;font-weight:800;margin-bottom:0.5rem;color:var(--text-primary);">Product Highlights:</div>
            <ul style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.8rem;color:var(--text-secondary);">
              ${highlights.map(h => `<li style="display:flex;align-items:flex-start;gap:0.45rem;"><span style="color:#388e3c;font-weight:800;">✓</span> <span>${h}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Flipkart Specifications Table -->
        ${Object.keys(specs).length > 0 ? `
          <div class="fk-specs-card">
            <div style="padding:0.75rem;background:var(--bg-secondary);border-bottom:1px solid var(--border-subtle);font-size:0.85rem;font-weight:800;">
              Specifications
            </div>
            ${Object.entries(specs).map(([k, v]) => `
              <div class="fk-spec-row">
                <span class="fk-spec-label">${k}</span>
                <span class="fk-spec-val">${v}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Ratings & Customer Feedback -->
        <div style="margin:0 1rem 1.5rem;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:6px;padding:0.85rem;">
          <div style="font-size:0.85rem;font-weight:800;margin-bottom:0.65rem;">Ratings & Reviews</div>
          <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.85rem;">
            <div style="text-align:center;">
              <div style="font-size:2rem;font-weight:900;color:var(--text-primary);line-height:1;">${product.rating || 4.5} ★</div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.25rem;">${product.review_count || 342} Ratings</div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:0.25rem;font-size:0.7rem;">
              <div style="display:flex;align-items:center;gap:0.4rem;"><span>5★</span><div style="flex:1;height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div style="width:78%;height:100%;background:#388e3c;"></div></div><span>78%</span></div>
              <div style="display:flex;align-items:center;gap:0.4rem;"><span>4★</span><div style="flex:1;height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div style="width:16%;height:100%;background:#388e3c;"></div></div><span>16%</span></div>
              <div style="display:flex;align-items:center;gap:0.4rem;"><span>3★</span><div style="flex:1;height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div style="width:4%;height:100%;background:#ff9f00;"></div></div><span>4%</span></div>
            </div>
          </div>
        </div>

      </div>

      <!-- 3. THE ICONIC FLIPKART DUAL STICKY ACTION BUTTON BAR -->
      <div class="fk-sticky-action-bar">
        <button class="fk-cart-btn-left" onclick="quickAddCurrentToCart()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span>Add to Cart</span>
        </button>
        <button class="fk-buy-btn-right" onclick="quickBuyCurrentNow()">
          <span>⚡ BUY NOW</span>
        </button>
      </div>

    </div>
  `;

  // Image selection
  window.selectFkImage = function(idx) {
    currentImgIndex = idx;
    const imgEl = document.getElementById('fk-pdp-img');
    const counterEl = document.getElementById('fk-pdp-counter');
    if (imgEl) imgEl.src = images[idx];
    if (counterEl) counterEl.textContent = `📸 ${idx + 1} / ${images.length}`;
    document.querySelectorAll('.fk-thumb-item').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
  };

  // Touch Swipe on PDP Mobile Image
  const touchArea = document.getElementById('pdp-touch-gallery');
  if (touchArea) {
    let startX = 0;
    touchArea.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    touchArea.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          // Swipe left -> next image
          window.selectFkImage((currentImgIndex + 1) % images.length);
        } else {
          // Swipe right -> prev image
          window.selectFkImage((currentImgIndex - 1 + images.length) % images.length);
        }
      }
    }, { passive: true });
  }

  modal.classList.add('active');
}

function selectFkColor(color, el) {
  activePdpSelectedColor = color;
  document.querySelectorAll('.color-dot').forEach(d => {
    d.style.borderColor = 'var(--border-subtle)';
  });
  if (el) el.style.borderColor = 'var(--primary)';
}

function selectFkSize(size, el) {
  activePdpSelectedSize = size;
  document.querySelectorAll('.size-pill').forEach(p => {
    p.style.borderColor = 'var(--border-subtle)';
    p.style.background = 'var(--bg-surface)';
    p.style.color = 'var(--text-primary)';
  });
  if (el) {
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-light)';
    el.style.color = 'var(--primary)';
  }
}

function updatePdpWishlistIcon(productId) {
  const btn = document.getElementById('pdp-wishlist-btn');
  if (!btn) return;
  const isWish = state.wishlist.includes(productId);
  btn.style.color = isWish ? '#ff6161' : 'var(--text-primary)';
  btn.querySelector('svg').setAttribute('fill', isWish ? 'currentColor' : 'none');
}

function shareProduct(encodedName) {
  const name = decodeURIComponent(encodedName);
  if (navigator.share) {
    navigator.share({
      title: name,
      text: `Check out ${name} on ApexStore!`,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Product link copied to clipboard! 📋', 'success');
  }
}

function quickAddCurrentToCart() {
  if (!activePdpProduct) return;
  addToCart(activePdpProduct.id, activePdpSelectedColor, activePdpSelectedSize, 1);
  showToast(`Added ${activePdpProduct.name.substring(0, 24)}... to cart! 🛒`, 'success');
}

function quickBuyCurrentNow() {
  if (!activePdpProduct) return;
  addToCart(activePdpProduct.id, activePdpSelectedColor, activePdpSelectedSize, 1);
  closeAllModals();
  openCheckout();
}

/* ==========================================================================
   Checkout & Orders
   ========================================================================== */
let checkoutStep = 1;
let selectedPaymentMethod = 'UPI / QR Code';

function openCheckout() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty!', 'warning');
    return;
  }

  closeAllDrawers();
  checkoutStep = 1;
  updateCheckoutStepUI();
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('active');
}

function updateCheckoutStepUI() {
  document.querySelectorAll('.checkout-step').forEach(stepEl => {
    const stepNum = Number(stepEl.dataset.step);
    stepEl.classList.toggle('active', stepNum === checkoutStep);
    stepEl.classList.toggle('completed', stepNum < checkoutStep);
  });

  document.querySelectorAll('.checkout-form-step').forEach(formStep => {
    formStep.classList.toggle('active', Number(formStep.dataset.step) === checkoutStep);
  });

  if (checkoutStep === 3) {
    renderCheckoutSummary();
  }
}

function nextCheckoutStep() {
  if (checkoutStep === 1) {
    const name = document.getElementById('ship-name').value.trim();
    const phone = document.getElementById('ship-phone').value.trim();
    const address = document.getElementById('ship-address').value.trim();
    const pincode = document.getElementById('ship-pincode').value.trim();

    if (!name || !phone || !address || !pincode) {
      showToast('Fill in all shipping details', 'warning');
      return;
    }
  }

  checkoutStep++;
  updateCheckoutStepUI();
}

function prevCheckoutStep() {
  if (checkoutStep > 1) {
    checkoutStep--;
    updateCheckoutStepUI();
  }
}

function selectPaymentMethod(method, el) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.payment-card-option').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById('checkout-review-summary');
  if (!summaryEl) return;

  const totals = calculateCartTotals();
  const name = document.getElementById('ship-name').value.trim();
  const address = document.getElementById('ship-address').value.trim();

  summaryEl.innerHTML = `
    <div style="margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border-subtle);">
      <div style="font-weight:800;font-size:0.9rem;margin-bottom:0.2rem;">${name}</div>
      <div style="font-size:0.8rem;color:var(--text-secondary);">${address}</div>
      <div style="font-size:0.8rem;color:var(--primary);font-weight:700;margin-top:0.3rem;">Payment: ${selectedPaymentMethod}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.3rem;font-size:0.825rem;">
      <div style="display:flex;justify-content:space-between;"><span>Items (${state.cart.length})</span> <span>${formatPrice(totals.subtotal)}</span></div>
      ${totals.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:var(--success);"><span>Discount</span> <span>-${formatPrice(totals.discount)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;"><span>Delivery</span> <span>${totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.05rem;margin-top:0.4rem;border-top:1px dashed var(--border-subtle);padding-top:0.4rem;">
        <span>Total</span> <span>${formatPrice(totals.total)}</span>
      </div>
    </div>
  `;
}

async function placeOrder() {
  const totals = calculateCartTotals();
  if (state.cart.length === 0) {
    showToast('Your shopping cart is empty!', 'warning');
    return;
  }

  // If user selected UPI, show the interactive Bharat UPI QR Code
  if (selectedPaymentMethod === 'UPI / QR Code') {
    openUpiQrModal(totals.total);
    return;
  }

  executeFinalOrderPlacement();
}

async function executeFinalOrderPlacement() {
  const totals = calculateCartTotals();
  const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const orderPayload = {
    shipping: {
      name: document.getElementById('ship-name').value.trim() || 'Rahul Sharma',
      phone: document.getElementById('ship-phone').value.trim() || '9876543210',
      address: document.getElementById('ship-address').value.trim() || 'Flat 402, MG Road',
      city: document.getElementById('ship-city').value.trim() || 'Mumbai',
      pincode: document.getElementById('ship-pincode').value.trim() || '400001'
    },
    items: state.cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      color: item.color,
      size: item.size
    })),
    coupon_code: state.appliedCoupon ? state.appliedCoupon.code : null,
    payment_method: selectedPaymentMethod
  };

  let createdOrderObj = null;

  try {
    const url = (typeof getApiUrl === 'function') ? getApiUrl('/api/orders') : '/api/orders';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    if (res.ok) {
      const data = await res.json();
      createdOrderObj = {
        orderId: data.order_id,
        date: orderDate,
        items: [...state.cart],
        totals: data.totals,
        shippingInfo: orderPayload.shipping,
        paymentMethod: selectedPaymentMethod,
        status: data.status || 'Confirmed'
      };
    }
  } catch (err) {
    console.log('Using local order generator.');
  }

  if (!createdOrderObj) {
    createdOrderObj = {
      orderId: `APX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: orderDate,
      items: [...state.cart],
      totals: totals,
      shippingInfo: orderPayload.shipping,
      paymentMethod: selectedPaymentMethod,
      status: 'Confirmed'
    };
  }

  state.orders.unshift(createdOrderObj);
  state.cart = [];
  state.appliedCoupon = null;
  saveState();
  updateBadgeCounts();
  renderProductGrid();
  renderCartDrawer();

  // Play audio celebration chime!
  playSuccessChime();

  // Render animated order success screen
  renderOrderSuccess(createdOrderObj);

  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      window.confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } });
    }, 400);
  }
}

function renderOrderSuccess(order) {
  const checkoutContainer = document.getElementById('checkout-modal-inner');
  if (!checkoutContainer) return;

  checkoutContainer.innerHTML = `
    <div class="order-success-view" style="padding:1.5rem 1rem;text-align:center;">
      <div style="width:65px;height:65px;border-radius:50%;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;box-shadow:0 4px 14px rgba(46,125,50,0.25);">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 style="font-size:1.4rem;font-weight:900;color:var(--text-primary);margin-bottom:0.25rem;">Order Placed Successfully! 🎉</h3>
      <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;">Order ID: <strong style="color:var(--primary);">${order.orderId}</strong></p>

      <!-- Flipkart Delivery Progress Steps -->
      <div style="background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px;padding:1rem;margin-bottom:1rem;text-align:left;">
        <div style="font-size:0.8rem;font-weight:800;color:var(--text-primary);margin-bottom:0.75rem;">Delivery Status:</div>
        <div style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.78rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;color:#388e3c;font-weight:700;">
            <span>✓</span> <span>Order Confirmed (Today)</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;color:#388e3c;font-weight:700;">
            <span>✓</span> <span>Packed & Shipped from Apex Hub</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;color:var(--text-primary);font-weight:800;">
            <span>🚚</span> <span>Out for Delivery by Tomorrow, 5 PM</span>
          </div>
        </div>
      </div>

      <!-- Invoice Summary -->
      <div class="invoice-preview-card" style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;padding:0.85rem;text-align:left;font-size:0.8rem;">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;font-weight:700;">
          <span>Payment Mode:</span>
          <span style="color:#2e7d32;font-weight:800;">${order.paymentMethod}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:900;border-top:1px dashed var(--border-subtle);padding-top:0.4rem;font-size:0.95rem;">
          <span>Total Paid:</span>
          <span style="color:var(--primary);">${formatPrice(order.totals.total)}</span>
        </div>
      </div>

      <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-secondary btn-sm" onclick="window.print()">Print Invoice</button>
        <button class="btn btn-primary btn-sm" onclick="closeAllModals(); openOrdersModal();">Track Order</button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Order Tracking
   ========================================================================== */
async function openOrdersModal() {
  closeAllDrawers();
  const modal = document.getElementById('orders-modal');
  const body = document.getElementById('orders-list-body');
  if (!modal || !body) return;

  try {
    const url = (typeof getApiUrl === 'function') ? getApiUrl('/api/orders?limit=20') : '/api/orders?limit=20';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.orders && data.orders.length > 0) {
        state.orders = data.orders.map(o => ({
          orderId: o.order_id,
          date: o.created_at || 'Recent',
          items: o.items || [],
          totals: { total: o.total },
          shippingInfo: { name: o.customer_name },
          status: o.status
        }));
      }
    }
  } catch (e) {
    console.log('Using local orders state.');
  }

  if (state.orders.length === 0) {
    body.innerHTML = `
      <div class="empty-state" style="border:none; padding:2rem 1rem; text-align:center;">
        <h4 style="font-weight:800;font-size:1rem;margin-bottom:0.25rem;">No orders yet</h4>
        <p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:1rem;">Your placed orders and delivery status appear here.</p>
        <button class="btn btn-primary btn-sm" onclick="closeAllModals();">Start Shopping</button>
      </div>
    `;
  } else {
    body.innerHTML = state.orders.map(o => `
      <div style="background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:1rem;margin-bottom:0.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <div>
            <span style="font-weight:800;font-size:0.9rem;">#${o.orderId}</span>
            <div style="font-size:0.7rem;color:var(--text-muted);">${o.date}</div>
          </div>
          <span style="background:var(--success-light);color:#065f46;padding:0.15rem 0.5rem;border-radius:var(--radius-full);font-size:0.7rem;font-weight:800;">${o.status}</span>
        </div>

        <div style="display:flex;justify-content:space-between;margin:0.85rem 0;position:relative;">
          <div style="text-align:center;flex:1;">
            <div style="width:20px;height:20px;border-radius:50%;background:var(--success);color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.2rem;font-size:0.65rem;">✓</div>
            <span style="font-size:0.65rem;font-weight:700;">Placed</span>
          </div>
          <div style="text-align:center;flex:1;">
            <div style="width:20px;height:20px;border-radius:50%;background:${o.status!=='Placed'?'var(--success)':'var(--border-subtle)'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.2rem;font-size:0.65rem;">✓</div>
            <span style="font-size:0.65rem;font-weight:700;">Confirmed</span>
          </div>
          <div style="text-align:center;flex:1;">
            <div style="width:20px;height:20px;border-radius:50%;background:${(o.status==='Shipped'||o.status==='Delivered')?'var(--primary)':'var(--border-subtle)'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.2rem;font-size:0.65rem;">🚚</div>
            <span style="font-size:0.65rem;font-weight:700;color:var(--primary);">Shipped</span>
          </div>
          <div style="text-align:center;flex:1;">
            <div style="width:20px;height:20px;border-radius:50%;background:${o.status==='Delivered'?'var(--success)':'var(--border-subtle)'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.2rem;font-size:0.65rem;">📦</div>
            <span style="font-size:0.65rem;color:var(--text-muted);">Delivered</span>
          </div>
        </div>

        <div style="border-top:1px solid var(--border-subtle);padding-top:0.5rem;display:flex;justify-content:space-between;font-size:0.8rem;">
          <span>${o.items.length} item(s)</span>
          <span style="font-weight:800;">${formatPrice(o.totals.total)}</span>
        </div>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

/* ==========================================================================
   Drawers & Modals Setup
   ========================================================================== */
function setupDrawersAndModals() {
  const backdrop = document.getElementById('drawer-backdrop');

  const cartTrigger = document.getElementById('cart-drawer-trigger');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (cartTrigger && cartDrawer) {
    cartTrigger.addEventListener('click', () => {
      cartDrawer.classList.add('active');
      backdrop.classList.add('active');
      renderCartDrawer();
    });
  }

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeAllDrawers);

  const wishlistTrigger = document.getElementById('wishlist-drawer-trigger');
  const wishlistDrawer = document.getElementById('wishlist-drawer');
  const closeWishlistBtn = document.getElementById('close-wishlist-btn');

  if (wishlistTrigger && wishlistDrawer) {
    wishlistTrigger.addEventListener('click', () => {
      wishlistDrawer.classList.add('active');
      backdrop.classList.add('active');
      renderWishlistDrawer();
    });
  }

  if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeAllDrawers);

  // Mobile Bottom App Bar Navigation
  const mobNavHome = document.getElementById('mob-nav-home');
  const mobNavCategories = document.getElementById('mob-nav-categories');
  const mobNavSearch = document.getElementById('mob-nav-search');
  const mobNavWishlist = document.getElementById('mob-nav-wishlist');
  const mobNavCart = document.getElementById('mob-nav-cart');

  if (mobNavHome) {
    mobNavHome.addEventListener('click', () => {
      closeAllDrawers();
      closeAllModals();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveMobTab(mobNavHome);
    });
  }

  if (mobNavCategories) {
    mobNavCategories.addEventListener('click', () => {
      closeAllDrawers();
      const catSection = document.querySelector('.mobile-stories-section');
      if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
      setActiveMobTab(mobNavCategories);
    });
  }

  if (mobNavSearch) {
    mobNavSearch.addEventListener('click', () => {
      closeAllDrawers();
      const mInput = document.getElementById('mobile-search-input');
      if (mInput) {
        mInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setActiveMobTab(mobNavSearch);
    });
  }

  if (mobNavWishlist) {
    mobNavWishlist.addEventListener('click', () => {
      closeAllDrawers();
      wishlistDrawer.classList.add('active');
      backdrop.classList.add('active');
      renderWishlistDrawer();
      setActiveMobTab(mobNavWishlist);
    });
  }

  if (mobNavCart) {
    mobNavCart.addEventListener('click', () => {
      closeAllDrawers();
      cartDrawer.classList.add('active');
      backdrop.classList.add('active');
      renderCartDrawer();
      setActiveMobTab(mobNavCart);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeAllDrawers();
      closeAllModals();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDrawers();
      closeAllModals();
    }
  });
}

function setActiveMobTab(tabEl) {
  document.querySelectorAll('.mobile-nav-item').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
}

function closeAllDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function setupCheckout() {
  const proceedBtn = document.getElementById('proceed-to-checkout-btn');
  if (proceedBtn) proceedBtn.addEventListener('click', openCheckout);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  saveState();
  updateThemeToggleIcons();
  showToast(`Switched to ${state.theme} mode`, 'info');
}

function updateThemeToggleIcons() {
  const sunIcons = document.querySelectorAll('.theme-icon-sun');
  const moonIcons = document.querySelectorAll('.theme-icon-moon');

  if (state.theme === 'dark') {
    sunIcons.forEach(i => i.style.display = 'block');
    moonIcons.forEach(i => i.style.display = 'none');
  } else {
    sunIcons.forEach(i => i.style.display = 'none');
    moonIcons.forEach(i => i.style.display = 'block');
  }
}

function updateBadgeCounts() {
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = state.wishlist.length;

  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'flex' : 'none';
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  });

  document.querySelectorAll('.wishlist-badge-count').forEach(el => {
    el.textContent = wishlistCount;
    el.style.display = wishlistCount > 0 ? 'flex' : 'none';
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  });
}

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid || typeof REVIEWS_DATA === 'undefined') return;

  grid.innerHTML = REVIEWS_DATA.map(r => `
    <div class="review-card" style="background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:1rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
        <img src="${r.avatar}" alt="${r.name}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;" />
        <div>
          <div style="font-size:0.875rem;font-weight:700;">${r.name}</div>
          <div style="font-size:0.7rem;color:var(--success);font-weight:700;">Verified Buyer</div>
        </div>
      </div>
      <div class="rating-stars" style="margin-bottom:0.5rem;">${renderStarRating(r.rating)}</div>
      <p style="font-size:0.825rem;color:var(--text-secondary);line-height:1.4;">"${r.comment}"</p>
    </div>
  `).join('');
}

/* ==========================================================================
   Flipkart Interactive Features: Deals, Voice, Camera, SuperCoins & UPI
   ========================================================================== */

// 1. Horizontal Deals Carousel
function renderDealsCarousel() {
  const container = document.getElementById('deals-horizontal-scroll');
  if (!container) return;

  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  // Pick top 7 deals (phones, audio, shoes, watches)
  const dealProducts = source.slice(0, 7);

  container.innerHTML = dealProducts.map(p => {
    const origPrice = p.original_price || p.originalPrice || p.price;
    const discountPercent = Math.round(((origPrice - p.price) / origPrice) * 100);

    return `
      <div class="deal-mini-card" onclick="openQuickView(${p.id})">
        <div class="deal-mini-img-wrap">
          <img src="${p.image}" alt="${p.name}" class="deal-mini-img" loading="lazy" />
        </div>
        <div class="deal-mini-title" title="${p.name}">${p.name}</div>
        <div class="deal-mini-badge">${discountPercent}% OFF</div>
        <div class="deal-mini-price">${formatPrice(p.price)}</div>
      </div>
    `;
  }).join('');
}

// 2. Voice Search Modal Handlers
window.openVoiceSearchModal = function() {
  closeAllModals();
  closeAllDrawers();
  const modal = document.getElementById('voice-search-modal');
  if (modal) modal.classList.add('active');
};

window.closeVoiceSearchModal = function() {
  const modal = document.getElementById('voice-search-modal');
  if (modal) modal.classList.remove('active');
};

window.voiceSearchSample = function(term) {
  closeVoiceSearchModal();
  const mInput = document.getElementById('mobile-search-input');
  const dInput = document.getElementById('desktop-search-input');
  if (mInput) mInput.value = term;
  if (dInput) dInput.value = term;
  state.searchQuery = term;
  renderProductGrid();
  showToast(`🎙️ Searching for "${term}"...`, 'info');
  const prodSec = document.getElementById('products-section');
  if (prodSec) prodSec.scrollIntoView({ behavior: 'smooth' });
};

// 3. Camera Visual AI Search Handlers
window.openCameraSearchModal = function() {
  closeAllModals();
  closeAllDrawers();
  const modal = document.getElementById('camera-search-modal');
  if (modal) modal.classList.add('active');
};

window.closeCameraSearchModal = function() {
  const modal = document.getElementById('camera-search-modal');
  if (modal) modal.classList.remove('active');
};

window.cameraScanSample = function(category) {
  closeCameraSearchModal();
  showToast(`📷 Visual match detected: ${category.toUpperCase()}!`, 'success');
  filterByCategory(category);
  const prodSec = document.getElementById('products-section');
  if (prodSec) prodSec.scrollIntoView({ behavior: 'smooth' });
};

// 4. SuperCoins Rewards Modal Handlers
window.openSuperCoinsModal = function() {
  closeAllModals();
  closeAllDrawers();
  const modal = document.getElementById('supercoins-modal');
  if (modal) modal.classList.add('active');
};

// 5. Interactive Pincode Checker in PDP
window.promptChangePincode = function() {
  const pincode = prompt("Enter your 6-digit Indian PIN code (e.g. 110001, 400001, 560001, 302001):", "400001");
  if (!pincode) return;
  const pin = pincode.trim();
  if (!/^\d{6}$/.test(pin)) {
    showToast("Please enter a valid 6-digit Indian PIN code", "warning");
    return;
  }

  let city = "India";
  if (pin.startsWith("11")) city = "New Delhi";
  else if (pin.startsWith("40")) city = "Mumbai";
  else if (pin.startsWith("56")) city = "Bengaluru";
  else if (pin.startsWith("60")) city = "Chennai";
  else if (pin.startsWith("70")) city = "Kolkata";
  else if (pin.startsWith("50")) city = "Hyderabad";
  else if (pin.startsWith("30")) city = "Jaipur";
  else if (pin.startsWith("38")) city = "Ahmedabad";
  else if (pin.startsWith("41")) city = "Pune";
  else if (pin.startsWith("20")) city = "Noida / UP";

  const pRow = document.querySelector('.fk-delivery-check-row strong');
  if (pRow) pRow.textContent = `${city} - ${pin}`;
  showToast(`⚡ Delivery verified for ${city} (${pin}): FREE Delivery by Tomorrow, 5 PM!`, 'success');
};

// 6. Real Bharat UPI QR Modal Handlers
let upiTimerInterval = null;
window.openUpiQrModal = function(amount) {
  closeAllModals();
  const modal = document.getElementById('upi-qr-modal');
  const amountEl = document.getElementById('upi-modal-amount');
  const qrImg = document.getElementById('upi-qr-image');
  const timerEl = document.getElementById('upi-qr-timer');
  if (!modal) return;

  if (amountEl) amountEl.textContent = formatPrice(amount);
  if (qrImg) {
    const upiUri = encodeURIComponent(`upi://pay?pa=apexstore@upi&pn=ApexStore&am=${amount}&cu=INR`);
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${upiUri}`;
  }

  // 5 minute countdown
  let timeLeft = 300;
  if (upiTimerInterval) clearInterval(upiTimerInterval);
  upiTimerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(upiTimerInterval);
      if (timerEl) timerEl.textContent = 'Expired';
    } else {
      const m = Math.floor(timeLeft / 60);
      const s = timeLeft % 60;
      if (timerEl) timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }, 1000);

  modal.classList.add('active');
};

window.completeUpiPayment = function() {
  if (upiTimerInterval) clearInterval(upiTimerInterval);
  closeAllModals();
  executeFinalOrderPlacement();
};

function renderAll() {
  updateBadgeCounts();
  renderProductGrid();
  renderDealsCarousel();
  renderCartDrawer();
  renderWishlistDrawer();
}
