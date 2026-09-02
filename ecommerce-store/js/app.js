/**
 * ApexStore - Core Application Logic with Backend API Integration
 * Connects to FastAPI Backend with SQLite Persistence & Graceful Offline Fallback
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

// Hero Slides Data
const HERO_SLIDES = [
  {
    pill: "⚡ Flash Season Deals",
    title: "Next-Gen Audio & Smart Wearables",
    subtitle: "Experience premium Active Noise Cancellation and high-fidelity sound with up to 40% discount this week.",
    btnText: "Shop Electronics",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80"
  },
  {
    pill: "🔥 Spring / Summer 2026",
    title: "Urban Streetwear & Minimalist Luxury",
    subtitle: "Heavyweight French Terry hoodies, raw denim jackets, and tailored aesthetics made for everyday comfort.",
    btnText: "Explore Fashion",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"
  },
  {
    pill: "✨ Smart Living & Home",
    title: "Modern Aesthetics for Work & Relaxation",
    subtitle: "Ergonomic lighting, artisan ceramics, and ultrasonic diffusers designed to upgrade your daily lifestyle.",
    btnText: "Shop Home Collection",
    category: "home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1600&auto=format&fit=crop&q=80"
  }
];

// Free shipping minimum threshold (in INR)
const FREE_SHIPPING_THRESHOLD = 999;

/* ==========================================================================
   Utility Helpers
   ========================================================================== */
function formatPrice(inrAmount) {
  const curr = CURRENCIES[state.currency] || CURRENCIES.INR;
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

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-leave');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ==========================================================================
   Fetch Products from Backend API (with fallback)
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
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeToggleIcons();

  // Initialize currency selector
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.value = state.currency;
    currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      saveState();
      renderAll();
      showToast(`Currency changed to ${CURRENCIES[state.currency].name}`, 'info');
    });
  }

  // Initialize Hero Slider
  initHeroSlider();

  // Initialize Flash Sale Countdown
  startFlashCountdown();

  // Initialize Search & Filter Event Listeners
  setupSearchAndFilters();

  // Render Everything
  renderAll();

  // Fetch latest products from FastAPI backend
  loadProductsFromBackend();

  // Setup Modals and Drawers
  setupDrawersAndModals();

  // Setup Checkout steps
  setupCheckout();

  // Render Reviews
  renderReviews();
});

/* ==========================================================================
   Hero Slider
   ========================================================================== */
function initHeroSlider() {
  const slideElem = document.getElementById('hero-slide');
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');

  if (!slideElem) return;

  function renderSlide() {
    const slide = HERO_SLIDES[state.heroIndex];
    slideElem.style.backgroundImage = `url('${slide.image}')`;
    slideElem.innerHTML = `
      <div class="hero-content">
        <span class="hero-pill">${slide.pill}</span>
        <h1 class="hero-title">${slide.title}</h1>
        <p class="hero-subtitle">${slide.subtitle}</p>
        <div class="hero-cta-group">
          <button class="btn btn-primary" onclick="filterByCategory('${slide.category}')">
            ${slide.btnText}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <a href="#products-section" class="btn btn-outline-white">Browse All</a>
        </div>
      </div>
    `;
  }

  renderSlide();

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      state.heroIndex = (state.heroIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
      renderSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.heroIndex = (state.heroIndex + 1) % HERO_SLIDES.length;
      renderSlide();
    });
  }

  // Auto slide every 6 seconds
  setInterval(() => {
    state.heroIndex = (state.heroIndex + 1) % HERO_SLIDES.length;
    renderSlide();
  }, 6000);
}

/* ==========================================================================
   Flash Sale Live Countdown Timer
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
    // Category filter
    if (state.currentCategory !== 'all' && product.category !== state.currentCategory) {
      return false;
    }
    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = (product.description || '').toLowerCase().includes(q);
      const matchCat = (product.category_name || product.categoryName || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    // Price filter
    if (product.price > state.maxPrice) {
      return false;
    }
    // Rating filter
    if (state.currentRating > 0 && product.rating < state.currentRating) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (state.sortBy === 'price-low') return a.price - b.price;
    if (state.sortBy === 'price-high') return b.price - a.price;
    if (state.sortBy === 'rating') return b.rating - a.rating;
    if (state.sortBy === 'discount') {
      const discA = (a.original_price || a.originalPrice - a.price) / (a.original_price || a.originalPrice);
      const discB = (b.original_price || b.originalPrice - b.price) / (b.original_price || b.originalPrice);
      return discB - discA;
    }
    return a.id - b.id; // Featured default
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
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 class="empty-title">No products found</h3>
        <p class="empty-desc">We couldn't find any products matching your current filters or search terms.</p>
        <button class="btn btn-primary btn-sm" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const isWishlisted = state.wishlist.includes(p.id);
    const origPrice = p.original_price || p.originalPrice || p.price;
    const discountPercent = Math.round(((origPrice - p.price) / origPrice) * 100);
    const catName = p.category_name || p.categoryName || 'General';

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-img-wrap" onclick="openQuickView(${p.id})">
          ${p.badge ? `<span class="card-badge ${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" />
          
          <div class="card-actions-floating" onclick="event.stopPropagation()">
            <button class="floating-action-btn ${isWishlisted ? 'active' : ''}" title="Save to Wishlist" onclick="toggleWishlist(${p.id})">
              <svg viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="floating-action-btn" title="Quick View" onclick="openQuickView(${p.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <div class="product-details">
          <span class="product-category">${catName}</span>
          <h4 class="product-title" onclick="openQuickView(${p.id})" title="${p.name}">${p.name}</h4>
          
          <div class="product-rating-wrap">
            <div class="rating-stars">
              ${renderStarRating(p.rating || 4.5)}
            </div>
            <span class="rating-number">${p.rating || 4.5}</span>
            <span class="rating-count">(${p.review_count || p.reviewCount || 0})</span>
          </div>

          <div class="product-price-row">
            <span class="current-price">${formatPrice(p.price)}</span>
            <span class="original-price">${formatPrice(origPrice)}</span>
            <span class="discount-tag">${discountPercent}% OFF</span>
          </div>

          <button class="add-to-cart-btn" onclick="addToCart(${p.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
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
   Filter & Search Event Listeners
   ========================================================================= */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const suggestionsBox = document.getElementById('search-suggestions');
  const sortSelect = document.getElementById('sort-select');
  const priceSlider = document.getElementById('price-slider');
  const priceMaxLabel = document.getElementById('price-max-label');

  // Search input live autocomplete
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchClear) searchClear.classList.toggle('visible', !!state.searchQuery);

      const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
      if (state.searchQuery.trim().length > 1) {
        const matches = source.filter(p => p.name.toLowerCase().includes(state.searchQuery.toLowerCase())).slice(0, 5);
        if (matches.length > 0 && suggestionsBox) {
          suggestionsBox.innerHTML = matches.map(m => `
            <div class="search-suggestion-item" onclick="openQuickView(${m.id})">
              <img src="${m.image}" class="suggestion-img" alt="${m.name}" />
              <div class="suggestion-info">
                <div class="suggestion-title">${m.name}</div>
                <div class="suggestion-price">${formatPrice(m.price)}</div>
              </div>
            </div>
          `).join('');
          suggestionsBox.classList.add('active');
        } else if (suggestionsBox) {
          suggestionsBox.classList.remove('active');
        }
      } else if (suggestionsBox) {
        suggestionsBox.classList.remove('active');
      }

      renderProductGrid();
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && suggestionsBox) {
        suggestionsBox.classList.remove('active');
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClear.classList.remove('visible');
      if (suggestionsBox) suggestionsBox.classList.remove('active');
      renderProductGrid();
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProductGrid();
    });
  }

  // Price range slider
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      state.maxPrice = Number(e.target.value);
      if (priceMaxLabel) priceMaxLabel.textContent = formatPrice(state.maxPrice);
      renderProductGrid();
    });
  }

  // Mobile Filter Drawer Toggle
  const mobileFilterBtn = document.getElementById('mobile-filter-btn');
  const filterSidebar = document.getElementById('filter-sidebar');
  const closeFilterBtn = document.getElementById('close-filter-btn');
  const backdrop = document.getElementById('drawer-backdrop');

  if (mobileFilterBtn && filterSidebar) {
    mobileFilterBtn.addEventListener('click', () => {
      filterSidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
    });
  }

  if (closeFilterBtn && filterSidebar) {
    closeFilterBtn.addEventListener('click', () => {
      filterSidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }
}

function filterByCategory(category) {
  state.currentCategory = category;

  document.querySelectorAll('.category-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
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

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const priceSlider = document.getElementById('price-slider');
  if (priceSlider) priceSlider.value = 150000;

  const priceMaxLabel = document.getElementById('price-max-label');
  if (priceMaxLabel) priceMaxLabel.textContent = formatPrice(150000);

  document.querySelectorAll('input[name="rating-filter"]').forEach(r => r.checked = false);
  const allRatingRadio = document.getElementById('rating-all');
  if (allRatingRadio) allRatingRadio.checked = true;

  document.querySelectorAll('.category-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });

  renderProductGrid();
  showToast('Filters reset to default', 'info');
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
  renderCartDrawer();
  showToast(`Added "${product.name.slice(0, 24)}..." to cart!`, 'success');
}

function updateCartQty(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;

  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
    showToast('Item removed from cart', 'info');
  }

  saveState();
  updateBadgeCounts();
  renderCartDrawer();
}

function removeCartItem(index) {
  if (!state.cart[index]) return;
  state.cart.splice(index, 1);
  saveState();
  updateBadgeCounts();
  renderCartDrawer();
  showToast('Item removed from cart', 'info');
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
  const tax = Math.round((subtotal - discount) * 0.05); // 5% GST
  const total = Math.max(0, subtotal - discount + shipping + tax);

  return { subtotal, discount, shipping, tax, total, isFreeShipping };
}

function renderCartDrawer() {
  const cartBody = document.getElementById('cart-items-list');
  const freeShippingBar = document.getElementById('free-shipping-progress');
  const cartFooter = document.getElementById('cart-footer');
  if (!cartBody) return;

  const totals = calculateCartTotals();

  // Free shipping progress calculation
  if (freeShippingBar) {
    const progress = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);

    if (totals.subtotal === 0) {
      freeShippingBar.style.display = 'none';
    } else {
      freeShippingBar.style.display = 'block';
      freeShippingBar.innerHTML = `
        <div class="free-shipping-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          ${remaining === 0 ? '🎉 You have unlocked FREE Express Delivery!' : `Add ${formatPrice(remaining)} more for <strong>FREE Delivery</strong>`}
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      `;
    }
  }

  if (state.cart.length === 0) {
    cartBody.innerHTML = `
      <div class="empty-state" style="border:none; padding: 3rem 1rem;">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h4 class="empty-title">Your cart is empty</h4>
        <p class="empty-desc">Discover our best sellers and add your favorite items to cart.</p>
        <button class="btn btn-primary btn-sm" onclick="closeAllDrawers(); filterByCategory('all');">Start Shopping</button>
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
        <div class="cart-item-meta">
          <span>Size: ${item.size}</span> | 
          <span style="display:inline-flex;align-items:center;gap:3px;">Color: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};border:1px solid #ccc;"></span></span>
        </div>
        <div class="cart-item-price-row">
          <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
          <div style="display:flex;align-items:center;">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
            </div>
            <button class="item-remove-btn" title="Remove Item" onclick="removeCartItem(${idx})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Update footer pricing
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const discountRow = document.getElementById('cart-discount-row');
  const shippingEl = document.getElementById('cart-shipping');
  const taxEl = document.getElementById('cart-tax');
  const grandTotalEl = document.getElementById('cart-total');
  const couponAppliedTag = document.getElementById('coupon-applied-tag');

  if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);
  if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
  if (taxEl) taxEl.textContent = formatPrice(totals.tax);
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(totals.total);

  if (state.appliedCoupon) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountEl) discountEl.textContent = `-${formatPrice(totals.discount)}`;
    if (couponAppliedTag) {
      couponAppliedTag.style.display = 'flex';
      couponAppliedTag.innerHTML = `
        <span>🎉 Coupon <strong>${state.appliedCoupon.code}</strong> Applied!</span>
        <button onclick="removeCoupon()" style="color:#ef4444;font-size:0.75rem;font-weight:700;">Remove</button>
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
    showToast('Please enter a coupon code', 'warning');
    return;
  }

  // Try validating with Backend API
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
      showToast(`Coupon "${code}" applied: ${data.description}`, 'success');
      return;
    }
  } catch (err) {
    console.log('Validating with local coupon table.');
  }

  // Fallback to local coupons
  if (COUPONS[code]) {
    state.appliedCoupon = { code, ...COUPONS[code] };
    renderCartDrawer();
    showToast(`Coupon "${code}" applied: ${COUPONS[code].description}`, 'success');
  } else {
    showToast('Invalid coupon code! Try SAVE20, FLASH30, or WELCOME10', 'warning');
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
  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  const product = source.find(p => p.id === productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast(`Removed from Wishlist`, 'info');
  } else {
    state.wishlist.push(productId);
    showToast(`Saved to Wishlist!`, 'success');
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
      <div class="empty-state" style="border:none; padding: 3rem 1rem;">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h4 class="empty-title">Your wishlist is empty</h4>
        <p class="empty-desc">Save your favorite items here to purchase later.</p>
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
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-primary btn-sm" style="padding:0.35rem 0.75rem;font-size:0.75rem;" onclick="addToCart(${p.id}); toggleWishlist(${p.id});">Move to Cart</button>
            <button class="item-remove-btn" onclick="toggleWishlist(${p.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Product Quick View Modal
   ========================================================================== */
function openQuickView(productId) {
  const source = state.products.length > 0 ? state.products : PRODUCTS_DATA;
  const product = source.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const modalContent = document.getElementById('quick-view-content');
  if (!modal || !modalContent) return;

  const images = (product.images && product.images.length > 0) ? product.images : [product.image];
  const colors = (product.colors && product.colors.length > 0) ? product.colors : ['#1e293b'];
  const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ['Standard'];
  const origPrice = product.original_price || product.originalPrice || product.price;

  let selectedColor = colors[0];
  let selectedSize = sizes[0];

  modalContent.innerHTML = `
    <div class="quick-view-grid">
      <div class="qv-gallery">
        <div class="qv-gallery-main">
          <img id="qv-main-img" src="${product.image}" alt="${product.name}" />
        </div>
        <div class="qv-thumbnails">
          ${images.map((img, idx) => `
            <img src="${img}" class="qv-thumb-img ${idx === 0 ? 'active' : ''}" onclick="changeQvImage('${img}', this)" alt="" />
          `).join('')}
        </div>
      </div>

      <div class="qv-info">
        <span class="product-category">${product.category_name || product.categoryName}</span>
        <h3 class="qv-title">${product.name}</h3>

        <div class="product-rating-wrap" style="margin-bottom:1rem;">
          <div class="rating-stars">${renderStarRating(product.rating || 4.5)}</div>
          <span class="rating-number">${product.rating || 4.5}</span>
          <span class="rating-count">(${product.review_count || product.reviewCount || 0} customer reviews)</span>
        </div>

        <div class="product-price-row" style="margin-bottom:1.25rem;">
          <span class="current-price" style="font-size:1.6rem;">${formatPrice(product.price)}</span>
          <span class="original-price" style="font-size:1.1rem;">${formatPrice(origPrice)}</span>
          <span class="discount-tag">${Math.round(((origPrice - product.price)/origPrice)*100)}% OFF</span>
        </div>

        <p class="qv-desc">${product.description}</p>

        <!-- Color Variant -->
        <div class="variant-group">
          <label class="variant-label">Color:</label>
          <div class="color-options">
            ${colors.map((c, i) => `
              <div class="color-dot ${i === 0 ? 'active' : ''}" style="background-color: ${c}" onclick="selectQvColor('${c}', this)"></div>
            `).join('')}
          </div>
        </div>

        <!-- Size Variant -->
        <div class="variant-group">
          <label class="variant-label">Option / Size:</label>
          <div class="size-options">
            ${sizes.map((s, i) => `
              <button class="size-pill ${i === 0 ? 'active' : ''}" onclick="selectQvSize('${s}', this)">${s}</button>
            `).join('')}
          </div>
        </div>

        <!-- Action CTA -->
        <div style="display:flex;gap:1rem;margin-top:1.5rem;">
          <button class="btn btn-primary btn-block" id="qv-add-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Add to Cart
          </button>
          <button class="btn btn-secondary" onclick="toggleWishlist(${product.id})" title="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${state.wishlist.includes(product.id)?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('qv-add-btn').onclick = () => {
    addToCart(product.id, selectedColor, selectedSize, 1);
    closeAllModals();
  };

  modal.classList.add('active');
}

function changeQvImage(imgSrc, el) {
  const mainImg = document.getElementById('qv-main-img');
  if (mainImg) mainImg.src = imgSrc;
  document.querySelectorAll('.qv-thumb-img').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}

function selectQvColor(color, el) {
  document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  if (el) el.classList.add('active');
}

function selectQvSize(size, el) {
  document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
}

/* ==========================================================================
   Multi-Step Checkout Flow & Order Processing (Connected to Backend API)
   ========================================================================== */
let checkoutStep = 1;
let selectedPaymentMethod = 'UPI / QR Code';

function openCheckout() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty! Add items first.', 'warning');
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
      showToast('Please fill out all required shipping fields', 'warning');
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
    <div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-subtle);">
      <div style="font-weight:700;margin-bottom:0.25rem;">Deliver to: ${name}</div>
      <div style="font-size:0.85rem;color:var(--text-secondary);">${address}</div>
      <div style="font-size:0.85rem;color:var(--primary);font-weight:600;margin-top:0.4rem;">Payment via: ${selectedPaymentMethod}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.875rem;">
      <div style="display:flex;justify-content:space-between;"><span>Items (${state.cart.length})</span> <span>${formatPrice(totals.subtotal)}</span></div>
      ${totals.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:var(--success);"><span>Discount</span> <span>-${formatPrice(totals.discount)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;"><span>Shipping</span> <span>${totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>GST (5%)</span> <span>${formatPrice(totals.tax)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;margin-top:0.5rem;border-top:1px dashed var(--border-subtle);padding-top:0.5rem;">
        <span>Total Payable</span> <span>${formatPrice(totals.total)}</span>
      </div>
    </div>
  `;
}

async function placeOrder() {
  const totals = calculateCartTotals();
  const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const orderPayload = {
    shipping: {
      name: document.getElementById('ship-name').value.trim(),
      phone: document.getElementById('ship-phone').value.trim(),
      address: document.getElementById('ship-address').value.trim(),
      city: document.getElementById('ship-city').value.trim(),
      pincode: document.getElementById('ship-pincode').value.trim()
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

  // Submit to FastAPI Backend API
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

  // Fallback if backend offline
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

  // Save order in state
  state.orders.unshift(createdOrderObj);
  state.cart = [];
  state.appliedCoupon = null;
  saveState();
  updateBadgeCounts();
  renderCartDrawer();

  // Show Success View in Modal
  renderOrderSuccess(createdOrderObj);

  // Trigger celebration confetti
  if (window.confetti) {
    window.confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function renderOrderSuccess(order) {
  const checkoutContainer = document.getElementById('checkout-modal-inner');
  if (!checkoutContainer) return;

  checkoutContainer.innerHTML = `
    <div class="order-success-view">
      <div class="success-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:0.5rem;">Order Placed Successfully!</h2>
      <p style="color:var(--text-secondary);font-size:0.95rem;">Thank you, ${order.shippingInfo.name}! Your order ID is <strong style="color:var(--primary);">${order.orderId}</strong>.</p>

      <div class="invoice-preview-card">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-weight:700;">
          <span>Invoice #${order.orderId}</span>
          <span style="color:var(--success);">Paid via ${order.paymentMethod}</span>
        </div>
        <div style="color:var(--text-muted);font-size:0.8rem;margin-bottom:0.8rem;">Date: ${order.date}</div>
        <div style="display:flex;flex-direction:column;gap:0.35rem;border-top:1px solid var(--border-subtle);padding-top:0.5rem;">
          ${order.items.map(it => `
            <div style="display:flex;justify-content:space-between;">
              <span>${it.name} (x${it.quantity})</span>
              <span>${formatPrice(it.price * it.quantity)}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;font-weight:800;border-top:1px dashed var(--border-subtle);padding-top:0.4rem;margin-top:0.4rem;">
            <span>Total Paid:</span>
            <span>${formatPrice(order.totals.total)}</span>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;">
        <button class="btn btn-primary" onclick="window.print()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Invoice
        </button>
        <button class="btn btn-secondary" onclick="closeAllModals(); openOrdersModal();">
          Track Order
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Order Tracking & History Modal
   ========================================================================== */
async function openOrdersModal() {
  closeAllDrawers();
  const modal = document.getElementById('orders-modal');
  const body = document.getElementById('orders-list-body');
  if (!modal || !body) return;

  // Try fetching latest live orders from backend
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
      <div class="empty-state" style="border:none; padding:3rem 1rem;">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        <h4 class="empty-title">No orders yet</h4>
        <p class="empty-desc">Once you place an order, you can track its delivery status here.</p>
        <button class="btn btn-primary btn-sm" onclick="closeAllModals();">Start Shopping</button>
      </div>
    `;
  } else {
    body.innerHTML = state.orders.map(o => `
      <div style="background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:1.25rem;margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <div>
            <span style="font-weight:800;font-size:1rem;">Order #${o.orderId}</span>
            <div style="font-size:0.75rem;color:var(--text-muted);">${o.date}</div>
          </div>
          <span style="background:var(--success-light);color:#065f46;padding:0.2rem 0.6rem;border-radius:var(--radius-full);font-size:0.75rem;font-weight:700;">${o.status}</span>
        </div>

        <!-- Tracking Timeline -->
        <div style="display:flex;justify-content:space-between;margin:1.25rem 0;position:relative;">
          <div style="text-align:center;flex:1;">
            <div style="width:24px;height:24px;border-radius:50%;background:var(--success);color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.25rem;font-size:0.7rem;">✓</div>
            <span style="font-size:0.7rem;font-weight:700;">Placed</span>
          </div>
          <div style="text-align:center;flex:1;">
            <div style="width:24px;height:24px;border-radius:50%;background:${o.status!=='Placed'?'var(--success)':'var(--border-subtle)'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.25rem;font-size:0.7rem;">✓</div>
            <span style="font-size:0.7rem;font-weight:700;">Confirmed</span>
          </div>
          <div style="text-align:center;flex:1;">
            <div style="width:24px;height:24px;border-radius:50%;background:${(o.status==='Shipped'||o.status==='Delivered')?'var(--primary)':'var(--border-subtle)'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.25rem;font-size:0.7rem;">🚚</div>
            <span style="font-size:0.7rem;font-weight:700;color:var(--primary);">Shipped</span>
          </div>
          <div style="text-align:center;flex:1;">
            <div style="width:24px;height:24px;border-radius:50%;background:${o.status==='Delivered'?'var(--success)':'var(--border-subtle)'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.25rem;font-size:0.7rem;">📦</div>
            <span style="font-size:0.7rem;color:var(--text-muted);">Delivered</span>
          </div>
        </div>

        <div style="border-top:1px solid var(--border-subtle);padding-top:0.75rem;display:flex;justify-content:space-between;align-items:center;font-size:0.875rem;">
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

  // Cart Drawer Triggers
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

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeAllDrawers);
  }

  // Wishlist Drawer Triggers
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

  if (closeWishlistBtn) {
    closeWishlistBtn.addEventListener('click', closeAllDrawers);
  }

  // Mobile Bottom Navigation Links
  const mobNavHome = document.getElementById('mob-nav-home');
  const mobNavCategories = document.getElementById('mob-nav-categories');
  const mobNavWishlist = document.getElementById('mob-nav-wishlist');
  const mobNavCart = document.getElementById('mob-nav-cart');
  const mobNavOrders = document.getElementById('mob-nav-orders');

  if (mobNavHome) {
    mobNavHome.addEventListener('click', () => {
      closeAllDrawers();
      closeAllModals();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (mobNavCategories) {
    mobNavCategories.addEventListener('click', () => {
      closeAllDrawers();
      const catSection = document.getElementById('categories-section');
      if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (mobNavWishlist) {
    mobNavWishlist.addEventListener('click', () => {
      closeAllDrawers();
      wishlistDrawer.classList.add('active');
      backdrop.classList.add('active');
      renderWishlistDrawer();
    });
  }

  if (mobNavCart) {
    mobNavCart.addEventListener('click', () => {
      closeAllDrawers();
      cartDrawer.classList.add('active');
      backdrop.classList.add('active');
      renderCartDrawer();
    });
  }

  if (mobNavOrders) {
    mobNavOrders.addEventListener('click', () => {
      openOrdersModal();
    });
  }

  // Backdrop click closes everything
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeAllDrawers();
      closeAllModals();
    });
  }

  // Close modals on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDrawers();
      closeAllModals();
    }
  });

  // Mobile search toggle button
  const mobileSearchBtn = document.getElementById('mobile-search-toggle');
  const searchWrapper = document.getElementById('search-wrapper');
  if (mobileSearchBtn && searchWrapper) {
    mobileSearchBtn.addEventListener('click', () => {
      searchWrapper.classList.toggle('mobile-expanded');
      const input = document.getElementById('search-input');
      if (input && searchWrapper.classList.contains('mobile-expanded')) {
        input.focus();
      }
    });
  }
}

function closeAllDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
  const filterSidebar = document.getElementById('filter-sidebar');
  if (filterSidebar) filterSidebar.classList.remove('mobile-open');
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

/* ==========================================================================
   Checkout Setup
   ========================================================================== */
function setupCheckout() {
  const proceedBtn = document.getElementById('proceed-to-checkout-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', openCheckout);
  }
}

/* ==========================================================================
   Theme Switcher (Dark / Light)
   ========================================================================== */
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

/* ==========================================================================
   Badge Counts & Sync
   ========================================================================== */
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

/* ==========================================================================
   Reviews Rendering
   ========================================================================== */
function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  grid.innerHTML = REVIEWS_DATA.map(r => `
    <div class="review-card">
      <div class="review-header">
        <img src="${r.avatar}" alt="${r.name}" class="reviewer-avatar" />
        <div>
          <div class="reviewer-name">${r.name}</div>
          <div class="review-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Verified Buyer • ${r.date}
          </div>
        </div>
      </div>
      <div class="rating-stars" style="margin-bottom:0.75rem;">
        ${renderStarRating(r.rating)}
      </div>
      <p class="review-text">"${r.comment}"</p>
    </div>
  `).join('');
}

/* ==========================================================================
   Master Render Trigger
   ========================================================================== */
function renderAll() {
  updateBadgeCounts();
  renderProductGrid();
  renderCartDrawer();
  renderWishlistDrawer();
}
