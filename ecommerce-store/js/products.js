// ApexStore - Rich Product Catalog Data
const PRODUCTS_DATA = [
  // --- ELECTRONICS ---
  {
    id: 1,
    name: "Sony WH-1000XM5 Wireless Headphones",
    category: "electronics",
    categoryName: "Electronics",
    price: 26999,
    originalPrice: 34990,
    rating: 4.8,
    reviewCount: 342,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "BESTSELLER",
    isFlashDeal: true,
    stock: 14,
    description: "Industry-leading noise canceling with two processors and 8 microphones for unprecedented sound quality. Up to 30-hour battery life with quick charging.",
    features: ["Industry-leading Active Noise Cancellation", "Up to 30 hours battery life", "Ultra-comfortable lightweight design", "Multipoint connection support"],
    colors: ["#1e293b", "#f1f5f9", "#78716c"],
    sizes: ["Standard"]
  },
  {
    id: 2,
    name: "Apple iPhone 15 Pro Max (256 GB)",
    category: "electronics",
    categoryName: "Electronics",
    price: 134900,
    originalPrice: 149900,
    rating: 4.9,
    reviewCount: 890,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "HOT",
    isFlashDeal: false,
    stock: 8,
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
    features: ["Titanium with textured matte glass back", "A17 Pro chip with 6-core GPU", "48MP Main camera with 5x optical zoom", "USB-C with USB 3 speeds"],
    colors: ["#334155", "#e2e8f0", "#1e293b", "#d97706"],
    sizes: ["128GB", "256GB", "512GB", "1TB"]
  },
  {
    id: 3,
    name: "MacBook Air 15\" M3 Chip 16GB",
    category: "electronics",
    categoryName: "Electronics",
    price: 124900,
    originalPrice: 134900,
    rating: 4.9,
    reviewCount: 420,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "NEW",
    isFlashDeal: false,
    stock: 12,
    description: "Strikingly thin and fast with the M3 chip. Built for Apple Intelligence and delivers up to 18 hours of continuous battery life.",
    features: ["Apple M3 chip with 8-core CPU & 10-core GPU", "15.3-inch Liquid Retina display", "1080p FaceTime HD camera", "MagSafe 3 charging & 2 Thunderbolt ports"],
    colors: ["#0f172a", "#cbd5e1", "#f8fafc", "#fde68a"],
    sizes: ["256GB SSD", "512GB SSD", "1TB SSD"]
  },
  {
    id: 4,
    name: "Apple Watch Ultra 2 GPS + Cellular",
    category: "electronics",
    categoryName: "Electronics",
    price: 79900,
    originalPrice: 89900,
    rating: 4.7,
    reviewCount: 215,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "SALE",
    isFlashDeal: true,
    stock: 9,
    description: "The most rugged and capable Apple Watch. Powered by the S9 SiP, with a 3000-nit display and specialized metrics for endurance athletes and adventurers.",
    features: ["49mm aerospace-grade titanium case", "Dual-frequency precision GPS", "100m water resistance & depth gauge", "Up to 36 hours regular battery life"],
    colors: ["#e2e8f0", "#ea580c", "#0284c7"],
    sizes: ["49mm"]
  },

  // --- FASHION ---
  {
    id: 5,
    name: "Urban Explorer Weatherproof Bomber Jacket",
    category: "fashion",
    categoryName: "Fashion",
    price: 3499,
    originalPrice: 6999,
    rating: 4.6,
    reviewCount: 184,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "50% OFF",
    isFlashDeal: true,
    stock: 25,
    description: "Premium insulated bomber jacket crafted from water-repellent matte nylon. Features ribbed trims, zippered utility pockets, and thermal fleece lining.",
    features: ["Windproof & Water-resistant shell", "Warm thermal quilted insulation", "Heavy-duty dual YKK zippers", "Multi-pocket functional design"],
    colors: ["#1e293b", "#3f6212", "#78350f"],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 6,
    name: "Vintage Distressed Slim-Fit Denim Jacket",
    category: "fashion",
    categoryName: "Fashion",
    price: 2499,
    originalPrice: 4499,
    rating: 4.5,
    reviewCount: 129,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "TRENDING",
    isFlashDeal: false,
    stock: 18,
    description: "100% authentic cotton denim washed for an effortless vintage aesthetic. Tailored fit that pairs effortlessly with tees and hoodies.",
    features: ["Pure ring-spun breathable cotton", "Reinforced button placket", "Chest flap pockets with button closure", "Pre-shrunk durable denim"],
    colors: ["#3b82f6", "#1e3a8a", "#0f172a"],
    sizes: ["M", "L", "XL"]
  },
  {
    id: 7,
    name: "Organic Cotton Heavyweight Oversized Hoodie",
    category: "fashion",
    categoryName: "Fashion",
    price: 1899,
    originalPrice: 3299,
    rating: 4.7,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "SALE",
    isFlashDeal: false,
    stock: 40,
    description: "450 GSM luxury brushed French terry cotton. Generous drop-shoulder silhouette designed for maximum comfort and streetwear styling.",
    features: ["450 GSM 100% Organic French Terry", "Double-layered structured hood", "Drop shoulder relaxed fit", "Kangaroo pocket with bar-tack stitching"],
    colors: ["#475569", "#f8fafc", "#18181b", "#831843"],
    sizes: ["S", "M", "L", "XL"]
  },

  // --- FOOTWEAR ---
  {
    id: 8,
    name: "Nike Air Max Pulse Lifestyle Sneakers",
    category: "footwear",
    categoryName: "Footwear",
    price: 7999,
    originalPrice: 12999,
    rating: 4.8,
    reviewCount: 450,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 15,
    description: "Featuring a point-loaded Air cushioning system that delivers bouncy responsiveness. Clean textile upper with leather overlays for sleek street style.",
    features: ["Point-loaded Air Max cushioning", "Breathable mesh upper with synthetic overlays", "Rubber waffle outsole for traction", "Reflective safety accents"],
    colors: ["#dc2626", "#0f172a", "#f8fafc"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
  },
  {
    id: 9,
    name: "Classic Handcrafted Leather Oxford Shoes",
    category: "footwear",
    categoryName: "Footwear",
    price: 4999,
    originalPrice: 8999,
    rating: 4.7,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "PREMIUM",
    isFlashDeal: false,
    stock: 10,
    description: "Handcrafted from full-grain Italian leather with Goodyear welted construction. Cushioned memory foam insole for day-long formal comfort.",
    features: ["100% Full Grain Leather", "Hand-stitched Goodyear welted sole", "High-density cushioned insole", "Non-slip rubber heel cap"],
    colors: ["#78350f", "#0f172a", "#451a03"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"]
  },

  // --- WATCHES & ACCESSORIES ---
  {
    id: 10,
    name: "Fossil Minimalist Chronograph Watch",
    category: "accessories",
    categoryName: "Accessories",
    price: 8495,
    originalPrice: 11995,
    rating: 4.6,
    reviewCount: 167,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "SALE",
    isFlashDeal: true,
    stock: 20,
    description: "44mm case size with Japanese quartz chronograph movement. Genuine interchangeable brown leather strap and scratch-resistant mineral crystal.",
    features: ["Stainless steel 44mm case", "5 ATM water resistance (50 meters)", "Sub-dials for stopwatch 24hr timer", "Genuine calfskin leather strap"],
    colors: ["#92400e", "#0f172a", "#ca8a04"],
    sizes: ["44mm"]
  },
  {
    id: 11,
    name: "Ray-Ban Polarized Aviator Sunglasses",
    category: "accessories",
    categoryName: "Accessories",
    price: 6790,
    originalPrice: 9490,
    rating: 4.8,
    reviewCount: 520,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "BESTSELLER",
    isFlashDeal: false,
    stock: 30,
    description: "Timeless classic aviator frame with crystal green polarized lenses. 100% UV400 protection eliminates 99% of reflected glare.",
    features: ["100% UV400 polarized glass lenses", "Durable lightweight gold metal frame", "Adjustable soft silicone nose pads", "Includes leather protective case"],
    colors: ["#ca8a04", "#475569", "#0f172a"],
    sizes: ["Standard (58mm)"]
  },
  {
    id: 12,
    name: "Bellroy Slim RFID Leather Bi-Fold Wallet",
    category: "accessories",
    categoryName: "Accessories",
    price: 2799,
    originalPrice: 3999,
    rating: 4.7,
    reviewCount: 140,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "POPULAR",
    isFlashDeal: false,
    stock: 22,
    description: "Engineered to hold 4-12 cards and flat bills without excess bulk. Built-in RFID protection safeguards cards against skimming theft.",
    features: ["Certified eco-tanned leather", "Integrated RFID blocking layer", "Quick-access card pull tab", "Dedicated SIM/pin micro storage"],
    colors: ["#78350f", "#0f172a", "#15803d"],
    sizes: ["Slim"]
  },

  // --- HOME & LIVING ---
  {
    id: 13,
    name: "Smart LED Ergonomic Desk Lamp with Wireless Charger",
    category: "home",
    categoryName: "Home & Living",
    price: 2999,
    originalPrice: 4999,
    rating: 4.7,
    reviewCount: 230,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "SALE",
    isFlashDeal: true,
    stock: 16,
    description: "Multi-angle adjustable architectural lamp with 5 color temperatures, slide dimming, 15W Qi fast wireless charging base, and auto-off timer.",
    features: ["15W Qi Fast Wireless Charging Base", "5 Color Temperatures & 10 Brightness levels", "Eye-care flicker-free LED technology", "USB-A secondary output port"],
    colors: ["#18181b", "#ffffff", "#94a3b8"],
    sizes: ["One Size"]
  },
  {
    id: 14,
    name: "Ultrasonic Essential Oil Aromatherapy Diffuser",
    category: "home",
    categoryName: "Home & Living",
    price: 1499,
    originalPrice: 2499,
    rating: 4.6,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "NEW",
    isFlashDeal: false,
    stock: 35,
    description: "500ml ultrasonic cool mist humidifier with 7 soothing ambient LED light colors, whisper-quiet operation, and auto shut-off protection.",
    features: ["500ml high-capacity water tank", "7 ambient LED mood light settings", "Up to 12 hours continuous misting", "Waterless auto shut-off sensor"],
    colors: ["#d97706", "#fef3c7", "#1e293b"],
    sizes: ["500ml"]
  },
  {
    id: 15,
    name: "Handmade Ceramic Coffee Mug & Saucer Set",
    category: "home",
    categoryName: "Home & Living",
    price: 899,
    originalPrice: 1599,
    rating: 4.8,
    reviewCount: 95,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "TRENDING",
    isFlashDeal: false,
    stock: 45,
    description: "Artisan stoneware mug with ergonomic handle and reactive glazed finish. Microwave and dishwasher safe, perfect for morning espresso and latte.",
    features: ["Handcrafted durable stoneware ceramic", "350ml capacity with matching saucer", "Microwave & Dishwasher safe", "Non-toxic lead-free glaze"],
    colors: ["#334155", "#e2e8f0", "#78716c"],
    sizes: ["350ml"]
  },

  // --- BEAUTY & WELLNESS ---
  {
    id: 16,
    name: "Vitamin C & Hyaluronic Glow Facial Serum",
    category: "beauty",
    categoryName: "Beauty & Wellness",
    price: 999,
    originalPrice: 1799,
    rating: 4.9,
    reviewCount: 680,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "BESTSELLER",
    isFlashDeal: true,
    stock: 50,
    description: "Advanced anti-aging formula with 20% Pure Vitamin C, Hyaluronic Acid, and Vitamin E. Brightens hyperpigmentation and boosts collagen production.",
    features: ["20% Active Vitamin C + Hyaluronic Acid", "Paraben, sulphate & cruelty-free", "Dermatologist tested on sensitive skin", "Fast-absorbing non-greasy texture"],
    colors: ["#fbbf24"],
    sizes: ["30ml", "50ml"]
  },
  {
    id: 17,
    name: "Luxury Cedarwood Beard Grooming & Care Kit",
    category: "beauty",
    categoryName: "Beauty & Wellness",
    price: 1299,
    originalPrice: 2199,
    rating: 4.7,
    reviewCount: 175,
    image: "https://images.unsplash.com/photo-1503925804368-5d77322ae711?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1503925804368-5d77322ae711?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "SALE",
    isFlashDeal: false,
    stock: 28,
    description: "Complete 5-piece beard care set containing organic beard oil, balm, boar bristle brush, dual-tooth sandalwood comb, and stainless steel trimming scissors.",
    features: ["100% natural organic oils & beeswax", "Boar bristle brush for styling", "Handmade anti-static sandalwood comb", "Packaged in luxury magnetic gift box"],
    colors: ["#78350f"],
    sizes: ["Full Kit"]
  },
  {
    id: 18,
    name: "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
    category: "electronics",
    categoryName: "Electronics",
    price: 9999,
    originalPrice: 13999,
    rating: 4.8,
    reviewCount: 512,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 19,
    description: "Bold sound for every adventure. 2-way speaker system delivering loud, crystal-clear, powerful sound with IP67 waterproof and dustproof protection.",
    features: ["IP67 Waterproof and Dustproof", "12 Hours of Playtime on single charge", "PartyBoost pair multiple speakers", "Deep rich bass radiator"],
    colors: ["#0284c7", "#dc2626", "#1e293b", "#16a34a"],
    sizes: ["Standard"]
  }
];

// Coupon Codes
const COUPONS = {
  "SAVE20": { discountPercent: 20, description: "20% OFF on all orders" },
  "WELCOME10": { discountPercent: 10, description: "10% Welcome Discount" },
  "FLASH30": { discountPercent: 30, description: "30% Flash Sale Special" },
  "FREESHIP": { discountPercent: 0, freeShipping: true, description: "Free Express Shipping" }
};

// Available Currencies with exchange rates (Base: INR)
const CURRENCIES = {
  INR: { symbol: "₹", rate: 1, name: "INR (₹)" },
  USD: { symbol: "$", rate: 0.012, name: "USD ($)" },
  EUR: { symbol: "€", rate: 0.011, name: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.0095, name: "GBP (£)" }
};

// Customer Testimonials
const REVIEWS_DATA = [
  {
    id: 1,
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 days ago",
    comment: "Ordered the Sony WH-1000XM5 headphones. The delivery was super fast (2 days) and the product is 100% genuine. The mobile interface was extremely smooth!",
    verified: true
  },
  {
    id: 2,
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 week ago",
    comment: "Love the UI of this store! Both on my laptop and iPhone, checkout was effortless with instant UPI payment simulation and invoice generation.",
    verified: true
  },
  {
    id: 3,
    name: "Amit Verma",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    rating: 4,
    date: "2 weeks ago",
    comment: "The Nike sneakers look even better in real life. Customer service assisted me with sizing quickly. Highly recommended!",
    verified: true
  }
];
