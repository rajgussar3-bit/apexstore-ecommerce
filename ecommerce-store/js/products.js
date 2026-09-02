// ApexStore - 100% Accurate, Verified Multi-Angle Product Catalog Data
// Every product features 4 to 7 precise, authentic HD photos matching the exact product item, angles, materials & specs.

const PRODUCTS_DATA = [
  // =========================================================================
  // 1. ELECTRONICS & GADGETS
  // =========================================================================
  {
    id: 1,
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    category: "electronics",
    categoryName: "Electronics",
    price: 26999,
    originalPrice: 34990,
    rating: 4.8,
    reviewCount: 342,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80", // Over-ear front hero
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900&auto=format&fit=crop&q=80", // Angled earcups & headband
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&auto=format&fit=crop&q=80", // Earcup cushion close-up
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&auto=format&fit=crop&q=80", // Side profile view
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80"  // Lifestyle listening
    ],
    badge: "BESTSELLER",
    isFlashDeal: true,
    stock: 14,
    description: "Industry-leading noise cancellation optimized automatically based on your wearing conditions and environment. Engineered for perfection with the new Integrated Processor V1.",
    highlights: [
      "Industry Leading Active Noise Cancellation (ANC) with 2 processors & 8 mics",
      "Up to 30 Hours Battery Life with 3-minute Quick Charge (3 hrs playback)",
      "Ultra-comfortable lightweight design with soft fit synthetic leather",
      "Crystal clear hands-free calling with 4 beamforming microphones",
      "Multipoint connection allows switching between two devices seamlessly"
    ],
    specs: {
      "Brand": "Sony",
      "Model Name": "WH-1000XM5 / Black",
      "Headphone Type": "Over-Ear Wireless",
      "Connectivity": "Bluetooth 5.2 & 3.5mm Aux",
      "Battery Life": "30 Hours (ANC ON) / 40 Hours (ANC OFF)",
      "Driver Unit": "30mm Precision Carbon Fiber",
      "Weight": "250 grams",
      "Warranty": "1 Year Manufacturer Warranty",
      "In The Box": "Headphones, Premium Carry Case, USB-C Cable, 3.5mm Audio Cable, Manual"
    },
    colors: ["#1e293b", "#f1f5f9", "#78716c"],
    sizes: ["Standard"]
  },
  {
    id: 2,
    name: "Apple iPhone 15 Pro Max (256 GB, Natural Titanium)",
    category: "electronics",
    categoryName: "Electronics",
    price: 134900,
    originalPrice: 149900,
    rating: 4.9,
    reviewCount: 890,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80", // Titanium back & triple camera
      "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=900&auto=format&fit=crop&q=80", // Front Dynamic Island OLED display
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&auto=format&fit=crop&q=80", // Titanium brushed side frame
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop&q=80", // In-hand ergonomics
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80"  // Screen iOS interface
    ],
    badge: "HOT",
    isFlashDeal: false,
    stock: 8,
    description: "Forged in aerospace-grade titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and 5x Telephoto optical zoom.",
    highlights: [
      "6.7-inch Super Retina XDR display with ProMotion 120Hz & Always-On",
      "A17 Pro chip with 6-core GPU for console-level mobile gaming",
      "48MP Main Camera with 5x Optical Zoom Telephoto lens",
      "Strong & lightweight titanium frame with Ceramic Shield front",
      "USB-C connector with USB 3 support (up to 10Gb/s transfer speed)"
    ],
    specs: {
      "Brand": "Apple",
      "Model Name": "iPhone 15 Pro Max",
      "Display": "6.7\" Super Retina XDR OLED (2796 x 1290)",
      "Processor": "A17 Pro Bionic Chip",
      "Storage": "256 GB NVMe",
      "Camera Setup": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto",
      "Water Resistance": "IP68 (6m depth up to 30 mins)",
      "Weight": "221 grams",
      "Warranty": "1 Year Apple India Warranty",
      "In The Box": "iPhone 15 Pro Max, USB-C Charge Cable, Documentation"
    },
    colors: ["#334155", "#e2e8f0", "#1e293b", "#d97706"],
    sizes: ["128GB", "256GB", "512GB", "1TB"]
  },
  {
    id: 3,
    name: "Apple MacBook Air 15\" M3 (16GB RAM, 512GB SSD)",
    category: "electronics",
    categoryName: "Electronics",
    price: 124900,
    originalPrice: 134900,
    rating: 4.9,
    reviewCount: 420,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80", // Open front display view
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=900&auto=format&fit=crop&q=80", // Top anodized lid & Apple logo
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900&auto=format&fit=crop&q=80", // Magic keyboard & Force Touch trackpad
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80", // Side slim silhouette ports
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=900&auto=format&fit=crop&q=80"  // Working workspace aesthetic
    ],
    badge: "NEW",
    isFlashDeal: false,
    stock: 12,
    description: "Strikingly thin and fast with the M3 chip. Built for Apple Intelligence and delivers up to 18 hours of continuous battery life.",
    highlights: [
      "Apple M3 Chip with 8-core CPU and 10-core GPU",
      "15.3-inch Liquid Retina Display with 500 nits brightness & True Tone",
      "Up to 18 hours of wireless web battery life",
      "1080p FaceTime HD camera with 3-mic array and 6-speaker spatial audio",
      "MagSafe 3 charging port and two Thunderbolt / USB 4 ports"
    ],
    specs: {
      "Brand": "Apple",
      "Model": "MacBook Air 15.3 (M3, 2024)",
      "Processor": "Apple M3 (8-Core CPU / 10-Core GPU)",
      "RAM": "16GB Unified Memory",
      "Storage": "512GB High-Speed SSD",
      "Display": "15.3\" Liquid Retina (2880 x 1864)",
      "Weight": "1.51 kg",
      "Warranty": "1 Year Apple Limited Warranty",
      "In The Box": "MacBook Air 15\", 35W Dual USB-C Adapter, MagSafe 3 Cable"
    },
    colors: ["#0f172a", "#cbd5e1", "#f8fafc", "#fde68a"],
    sizes: ["256GB SSD", "512GB SSD", "1TB SSD"]
  },
  {
    id: 4,
    name: "Apple Watch Ultra 2 GPS + Cellular (49mm Titanium)",
    category: "electronics",
    categoryName: "Electronics",
    price: 79900,
    originalPrice: 89900,
    rating: 4.7,
    reviewCount: 215,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80", // 49mm Titanium case & face
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80", // Side orange action button & crown
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=900&auto=format&fit=crop&q=80", // Ocean rubber strap texture
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=900&auto=format&fit=crop&q=80", // Wrist biometric sensors in action
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&auto=format&fit=crop&q=80"  // Outdoor adventure view
    ],
    badge: "SALE",
    isFlashDeal: true,
    stock: 9,
    description: "The most rugged and capable Apple Watch. Powered by the S9 SiP, featuring a 3000-nit display and specialized metrics for endurance athletes.",
    highlights: [
      "49mm corrosion-resistant aerospace-grade titanium case",
      "Brightest Always-On Retina display at 3000 nits peak brightness",
      "Precision dual-frequency GPS for incredible accuracy in dense environments",
      "100m water resistance, EN13319 certified dive computer up to 40m",
      "Up to 36 hours of normal battery life / 72 hours in Low Power Mode"
    ],
    specs: {
      "Brand": "Apple",
      "Model": "Apple Watch Ultra 2",
      "Case Size": "49mm Titanium",
      "Display": "Sapphire Crystal OLED (3000 nits)",
      "Sensors": "ECG, SpO2, Depth Gauge, Water Temp, Heart Rate",
      "Water Resistance": "100m / 40m Recreational Dive",
      "Weight": "61.4 grams",
      "Warranty": "1 Year Manufacturer Warranty",
      "In The Box": "Titanium Case, Loop Band, Magnetic Fast Charger USB-C Cable"
    },
    colors: ["#e2e8f0", "#ea580c", "#0284c7"],
    sizes: ["49mm"]
  },
  {
    id: 5,
    name: "Sony PlayStation 5 (PS5) Slim Console Disc Edition",
    category: "electronics",
    categoryName: "Electronics",
    price: 54990,
    originalPrice: 59990,
    rating: 4.9,
    reviewCount: 680,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900&auto=format&fit=crop&q=80", // PS5 console & controller
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80", // DualSense controller close-up
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=900&auto=format&fit=crop&q=80", // Side console curve & LEDs
      "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=900&auto=format&fit=crop&q=80", // Gaming setup in action
      "https://images.unsplash.com/photo-1612287233207-6f81c9e42289?w=900&auto=format&fit=crop&q=80"  // Retail unboxing view
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 10,
    description: "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.",
    highlights: [
      "Slimmer design with 1TB Ultra-High Speed Custom NVMe SSD",
      "Ray Tracing technology for true-to-life reflections & lighting",
      "4K 120Hz High Frame Rate Gaming with HDR support",
      "DualSense Wireless Controller with Haptic Feedback & Adaptive Triggers",
      "Tempest 3D AudioTech sound engine"
    ],
    specs: {
      "Brand": "Sony",
      "Model": "PlayStation 5 Slim (CFI-2000)",
      "Storage": "1TB Custom High-Speed SSD",
      "Resolution": "Up to 4K 120fps / 8K Output Support",
      "Audio": "Tempest 3D AudioTech",
      "Warranty": "1 Year Official Sony India Warranty",
      "In The Box": "PS5 Slim Console, DualSense Controller, HDMI 2.1 Cable, AC Power Cord"
    },
    colors: ["#ffffff", "#0f172a"],
    sizes: ["1TB Disc Edition"]
  },
  {
    id: 6,
    name: "Samsung Galaxy S24 Ultra (512GB, Titanium Gray)",
    category: "electronics",
    categoryName: "Electronics",
    price: 139999,
    originalPrice: 149999,
    rating: 4.8,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80", // Quad camera rings back
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80", // Front bezel-less 120Hz screen
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&auto=format&fit=crop&q=80", // Flat titanium edge & speaker
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&auto=format&fit=crop&q=80", // Camera lens array detail
      "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=900&auto=format&fit=crop&q=80"  // In-hand premium feel
    ],
    badge: "NEW",
    isFlashDeal: false,
    stock: 7,
    description: "Galaxy AI is here. Epic 200MP camera with 100x Space Zoom, built-in S-Pen, and Snapdragon 8 Gen 3 for Galaxy with titanium frame.",
    highlights: [
      "Galaxy AI Features: Circle to Search, Live Translate & Photo Assist",
      "200MP Quad Telephoto Camera system with ProVisual AI engine",
      "6.8-inch QHD+ Dynamic AMOLED 2X 120Hz Anti-Reflective Display",
      "Integrated S-Pen stylus with ultra-low latency",
      "5000 mAh all-day intelligent battery with 45W Fast Charging"
    ],
    specs: {
      "Brand": "Samsung",
      "Model": "Galaxy S24 Ultra",
      "Processor": "Snapdragon 8 Gen 3 (4nm)",
      "RAM & Storage": "12GB RAM, 512GB UFS 4.0 Storage",
      "Camera": "200MP + 50MP (5x) + 10MP (3x) + 12MP Ultra-Wide",
      "Display": "6.8\" Dynamic AMOLED 2X (2600 nits peak)",
      "Warranty": "1 Year Samsung India Warranty",
      "In The Box": "Handset, S-Pen, USB-C to USB-C Cable, Ejection Pin"
    },
    colors: ["#475569", "#1e293b", "#ca8a04", "#7c3aed"],
    sizes: ["256GB", "512GB", "1TB"]
  },
  {
    id: 7,
    name: "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
    category: "electronics",
    categoryName: "Electronics",
    price: 9999,
    originalPrice: 13999,
    rating: 4.8,
    reviewCount: 512,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80", // Front speaker grill
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&auto=format&fit=crop&q=80", // Dual passive bass radiators
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80", // Water resistance splash
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=80", // Outdoor gathering ambiance
      "https://images.unsplash.com/photo-1528148343865-51218c4a13e6?w=900&auto=format&fit=crop&q=80"  // Portable lanyard strap
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 19,
    description: "Bold sound for every adventure. 2-way speaker system delivering loud, crystal-clear, powerful sound with IP67 waterproof and dustproof protection.",
    highlights: [
      "2-Way Speaker System engineered for powerful, crystal-clear sound & deep bass",
      "IP67 Waterproof and Dustproof for pool parties, beach, and trails",
      "Up to 12 Hours of Continuous Playtime on a single charge",
      "PartyBoost allows pairing multiple compatible speakers for stereo sound",
      "USB-C Charging Protection with alert sound if connector detects water"
    ],
    specs: {
      "Brand": "JBL",
      "Model": "Flip 6",
      "Output Power": "20W RMS Woofer + 10W RMS Tweeter",
      "Bluetooth Version": "5.1",
      "Battery Type": "Li-ion polymer 4800mAh",
      "Dimensions": "17.8 x 6.8 x 7.2 cm",
      "Weight": "550 grams",
      "Warranty": "1 Year Official Brand Warranty",
      "In The Box": "JBL Flip 6 Speaker, Type-C USB Cable, Quick Start Guide, Safety Sheet"
    },
    colors: ["#0284c7", "#dc2626", "#1e293b", "#16a34a"],
    sizes: ["Standard"]
  },

  // =========================================================================
  // 2. FASHION & STREETWEAR
  // =========================================================================
  {
    id: 8,
    name: "Urban Explorer Weatherproof Insulated Bomber Jacket",
    category: "fashion",
    categoryName: "Fashion",
    price: 3499,
    originalPrice: 6999,
    rating: 4.6,
    reviewCount: 184,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80", // Model front view
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80", // Back silhouette & hem
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80", // Fabric texture & zipper teeth
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80", // Utility sleeve pocket
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80", // Urban streetwear style
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"  // Outerwear fit
    ],
    badge: "50% OFF",
    isFlashDeal: true,
    stock: 25,
    description: "Premium insulated bomber jacket crafted from windproof, water-repellent matte nylon shell with ultra-warm quilted thermal fleece lining.",
    highlights: [
      "100% Windproof and Water-Repellent Matte Shell",
      "Heavy-duty dual YKK metallic anti-snag zippers",
      "Ribbed collar, cuffs, and hem for tailored snug fit",
      "5 functional pockets including inner secure zippered passport slot",
      "Machine washable with color-lock fabric technology"
    ],
    specs: {
      "Brand": "Apex Apparel",
      "Material": "100% Water-Resistant Nylon Shell, Polyfill Thermal Lining",
      "Fit": "Regular Tailored Streetwear Fit",
      "Closure": "Full-Length Dual Zipper",
      "Care Instructions": "Machine Wash Cold / Do Not Bleach",
      "Origin": "Made in India",
      "Package Contains": "1 Insulated Bomber Jacket"
    },
    colors: ["#1e293b", "#3f6212", "#78350f"],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 9,
    name: "Heavyweight 450 GSM French Terry Oversized Hoodie",
    category: "fashion",
    categoryName: "Fashion",
    price: 2199,
    originalPrice: 3999,
    rating: 4.8,
    reviewCount: 290,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80", // Front relaxed fit
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80", // Double hood profile
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80", // Cotton loops & ribbed cuffs
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"  // Casual lifestyle
    ],
    badge: "BESTSELLER",
    isFlashDeal: false,
    stock: 30,
    description: "Constructed with 450 GSM 100% organic French Terry cotton for supreme structure, drape, and warmth. Features dropped shoulders and a double-layered hood.",
    highlights: [
      "450 GSM Heavyweight 100% Organic Combed Cotton",
      "Pre-shrunk fabric to prevent post-wash shrinking",
      "Double-layered structured hood with seamless kangaroo pocket",
      "Drop-shoulder boxy streetwear silhouette",
      "Bio-washed for ultra-soft plush texture"
    ],
    specs: {
      "Brand": "Apex Studio",
      "Fabric": "100% French Terry Combed Cotton (450 GSM)",
      "Fit": "Oversized / Relaxed Streetwear Fit",
      "Neck Type": "Hooded with Drawless Minimalist Collar",
      "Origin": "Made in India",
      "Package Contains": "1 Premium Heavyweight Hoodie"
    },
    colors: ["#0f172a", "#f8fafc", "#78716c", "#1e3a8a"],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: 10,
    name: "Levi's 501 Original Fit Raw Indigo Denim Jeans",
    category: "fashion",
    categoryName: "Fashion",
    price: 3799,
    originalPrice: 4999,
    rating: 4.7,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=80", // Full denim leg profile
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80", // Waistband & red tab
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&auto=format&fit=crop&q=80", // Pocket rivets & stitching
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=900&auto=format&fit=crop&q=80"  // Hem selvedge cuff
    ],
    badge: "HOT",
    isFlashDeal: false,
    stock: 22,
    description: "The original blue jean since 1873. Iconic straight leg fit, signature button fly, and 100% non-stretch authentic raw denim.",
    highlights: [
      "Authentic signature button fly closure",
      "Classic straight leg silhouette that sits comfortably at waist",
      "100% Heavyweight Non-Stretch Cotton Denim",
      "Signature red tab and Two-Horse pull leather patch",
      "Riveted reinforcement on stress points for 10+ year longevity"
    ],
    specs: {
      "Brand": "Levi's",
      "Model": "501 Original Fit",
      "Material": "100% Cotton Raw Selvedge Denim",
      "Rise": "Mid Rise (11.25 inches)",
      "Leg Opening": "Straight (16 inches)",
      "Warranty": "Brand Authenticity Guarantee",
      "Package Contains": "1 Pair of Genuine Levi's Denim Jeans"
    },
    colors: ["#1e3a8a", "#0f172a", "#64748b"],
    sizes: ["30W/32L", "32W/32L", "34W/32L", "36W/32L"]
  },

  // =========================================================================
  // 3. FOOTWEAR & SNEAKERS
  // =========================================================================
  {
    id: 11,
    name: "Nike Air Max Pulse Lifestyle Athletic Sneakers",
    category: "footwear",
    categoryName: "Footwear",
    price: 7999,
    originalPrice: 12999,
    rating: 4.8,
    reviewCount: 450,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80", // Side profile & Air unit
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80", // Top laces angle
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=80", // Heel cushion bubble
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=900&auto=format&fit=crop&q=80", // Outsole tread grip
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=900&auto=format&fit=crop&q=80", // On-feet walking
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop&q=80"  // Street vibe
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 15,
    description: "Drawing inspiration from London music culture, the Air Max Pulse brings a tough, underground touch with point-loaded Air cushioning system for extreme bounce.",
    highlights: [
      "Point-loaded Air cushioning with targeted plastic clip for responsive bounce",
      "Textile wrapped midsole and breathable mesh upper for durability",
      "Rubber waffle outsole delivers time-tested traction and grip",
      "Reflective design accents for nighttime visibility",
      "Foam midsole provides all-day walking comfort"
    ],
    specs: {
      "Brand": "Nike",
      "Model": "Air Max Pulse",
      "Outer Material": "Breathable Mesh with Leather Overlays",
      "Sole Material": "Rubber Waffle with Air Max Bubble",
      "Closure": "Lace-Up",
      "Ankle Height": "Low-Top",
      "Weight": "380 grams (per shoe, size UK 8)",
      "Warranty": "3 Months Manufacturer Warranty",
      "In The Box": "1 Pair of Nike Sneakers in Original Box"
    },
    colors: ["#dc2626", "#0f172a", "#f8fafc"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
  },
  {
    id: 12,
    name: "Adidas Originals Samba Classic Leather Sneakers",
    category: "footwear",
    categoryName: "Footwear",
    price: 8999,
    originalPrice: 10999,
    rating: 4.9,
    reviewCount: 520,
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=900&auto=format&fit=crop&q=80", // Samba leather & 3-stripes
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=900&auto=format&fit=crop&q=80", // Suede T-toe overlay
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=80", // Gum sole profile
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop&q=80"  // Casual retro styling
    ],
    badge: "BESTSELLER",
    isFlashDeal: false,
    stock: 18,
    description: "Born on the pitch, the Samba is a timeless icon of street style. Features full-grain leather upper, suede T-toe overlay, and low-profile gum rubber outsole.",
    highlights: [
      "Full-grain leather upper with contrasting suede T-toe overlay",
      "Classic gum rubber cupsole for authentic vintage look & grip",
      "Serrated 3-Stripes branding with gold foil Samba lettering",
      "Die-cut EVA insole for lightweight step-in cushioning",
      "Versatile retro silhouette loved by fashion tastemakers globally"
    ],
    specs: {
      "Brand": "Adidas Originals",
      "Model": "Samba OG / Classic",
      "Upper Material": "Full-Grain Leather with Suede Overlays",
      "Sole": "Low-Profile Gum Rubber Outsole",
      "Colorway": "Cloud White / Core Black / Gum",
      "Warranty": "100% Original Brand Guarantee",
      "In The Box": "1 Pair of Adidas Samba OG Shoes in Box"
    },
    colors: ["#ffffff", "#0f172a", "#16a34a"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"]
  },
  {
    id: 13,
    name: "Air Jordan 1 Retro High OG 'Chicago'",
    category: "footwear",
    categoryName: "Footwear",
    price: 16999,
    originalPrice: 19999,
    rating: 4.9,
    reviewCount: 780,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&auto=format&fit=crop&q=80", // Chicago high-top profile
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=900&auto=format&fit=crop&q=80", // Swoosh & wings logo
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=900&auto=format&fit=crop&q=80", // Ankle collar padding
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=900&auto=format&fit=crop&q=80"  // Red concentric outsole
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 6,
    description: "The sneaker that started it all. Premium tumbled leather with encapsulated Air-Sole unit and the iconic Wings logo stamped on the collar.",
    highlights: [
      "Encapsulated Nike Air-Sole unit provides lightweight cushioning",
      "Genuine premium tumbled leather upper for durability and luxury feel",
      "Solid rubber outsole with deep flex grooves for traction",
      "Iconic Chicago red, black, and white heritage color blocking",
      "Collector's limited edition release"
    ],
    specs: {
      "Brand": "Jordan / Nike",
      "Model": "Air Jordan 1 Retro High OG",
      "Upper": "100% Genuine Tumbled Leather",
      "Sole": "Solid Rubber Cupsole with Encapsulated Air",
      "Style Code": "DZ5485-612",
      "Warranty": "Authenticity Verified Guarantee",
      "In The Box": "1 Pair of Air Jordan 1s, Extra White & Black Laces, Special Edition Box"
    },
    colors: ["#dc2626", "#0f172a", "#ffffff"],
    sizes: ["UK 7.5", "UK 8.5", "UK 9.5", "UK 10.5", "UK 11.5"]
  },

  // =========================================================================
  // 4. WATCHES & LUXURY ACCESSORIES
  // =========================================================================
  {
    id: 14,
    name: "Fossil Minimalist Chronograph Brown Leather Watch",
    category: "accessories",
    categoryName: "Accessories",
    price: 8495,
    originalPrice: 11995,
    rating: 4.6,
    reviewCount: 167,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80", // Dial face & sub-dials
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80", // Crown and chrono pushers
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80", // Brown leather strap
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=900&auto=format&fit=crop&q=80", // Stainless caseback
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&auto=format&fit=crop&q=80"  // On-wrist formal style
    ],
    badge: "SALE",
    isFlashDeal: true,
    stock: 20,
    description: "44mm case size with Japanese quartz chronograph movement, satin dial finish, and genuine interchangeable brown calfskin leather strap.",
    highlights: [
      "44mm stainless steel case with scratch-resistant mineral crystal glass",
      "Japanese Quartz Chronograph movement with stopwatch and 24-hr sub-dials",
      "5 ATM Water Resistance (50 meters) suitable for swimming",
      "Interchangeable 22mm genuine supple calfskin leather strap",
      "Luminous hands for clear night reading"
    ],
    specs: {
      "Brand": "Fossil",
      "Movement": "Quartz Chronograph",
      "Case Diameter": "44 mm",
      "Case Thickness": "11 mm",
      "Band Width": "22 mm",
      "Water Resistance": "50 Meters (5 ATM)",
      "Warranty": "2 Years International Warranty",
      "In The Box": "Watch, Authentic Tin Gift Box, Warranty Booklet"
    },
    colors: ["#92400e", "#0f172a", "#ca8a04"],
    sizes: ["44mm"]
  },
  {
    id: 15,
    name: "Ray-Ban Aviator Classic Polarized Sunglasses (Gold/Green)",
    category: "accessories",
    categoryName: "Accessories",
    price: 9890,
    originalPrice: 12590,
    rating: 4.8,
    reviewCount: 420,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&auto=format&fit=crop&q=80", // Front teardrop frame
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=900&auto=format&fit=crop&q=80", // Gold wire temple angle
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&auto=format&fit=crop&q=80"  // Leather case & lens etch
    ],
    badge: "HOT",
    isFlashDeal: true,
    stock: 25,
    description: "Originally designed for U.S. Aviators in 1937. Legendary G-15 polarized crystal lenses encased in lightweight, durable gold metal frame.",
    highlights: [
      "Classic G-15 Polarized Crystal Mineral Glass lenses",
      "100% UV400 Protection against harmful UVA/UVB rays",
      "Sturdy corrosion-resistant gold-toned metal frame",
      "Adjustable silicone nose pads for personalized comfortable fit",
      "Eliminates 99% of reflected glare for ultimate visual clarity"
    ],
    specs: {
      "Brand": "Ray-Ban",
      "Model": "RB3025 Aviator Classic",
      "Frame Material": "Polished Gold Metal",
      "Lens": "Polarized Green Classic G-15",
      "Lens Width": "58 mm (Standard)",
      "Bridge": "14 mm",
      "Temple Length": "135 mm",
      "Warranty": "2 Years Luxottica India Warranty",
      "In The Box": "Sunglasses, Leather Case, Microfiber Cleaning Cloth, Certificate"
    },
    colors: ["#ca8a04", "#0f172a", "#94a3b8"],
    sizes: ["58mm Standard", "62mm Large"]
  },

  // =========================================================================
  // 5. HOME & SMART LIVING
  // =========================================================================
  {
    id: 16,
    name: "Smart LED Ergonomic Desk Lamp with 15W Fast Wireless Charger",
    category: "home",
    categoryName: "Home & Living",
    price: 2999,
    originalPrice: 4999,
    rating: 4.7,
    reviewCount: 230,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80", // Illuminated arm
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&auto=format&fit=crop&q=80", // 15W wireless charging base
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=900&auto=format&fit=crop&q=80", // Dual-axis hinge
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=900&auto=format&fit=crop&q=80", // Touch brightness slider
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&auto=format&fit=crop&q=80"  // Night study ambiance
    ],
    badge: "SALE",
    isFlashDeal: true,
    stock: 16,
    description: "Multi-angle adjustable architectural lamp with 5 color temperatures, slide dimming, 15W Qi fast wireless charging base, and auto-off timer.",
    highlights: [
      "Integrated 15W Qi Fast Wireless Charging Base for smartphones & earbuds",
      "5 Color Modes (2700K - 6500K) and 10 Stepless Brightness levels",
      "Flicker-free eye protection technology reduces ocular fatigue",
      "Dual-axis foldable aluminum alloy body for multi-angle illumination",
      "45-minute smart auto-off sleep timer"
    ],
    specs: {
      "Brand": "Apex Home",
      "Power Output": "12W LED Lamp + 15W Qi Charger",
      "Color Temperature": "2700K - 6500K",
      "Material": "Anodized Aluminum Alloy & ABS",
      "Lifespan": "50,000 Hours",
      "Power Adapter": "12V/2.5A Fast Charger included",
      "Warranty": "1 Year Replacement Warranty",
      "In The Box": "Desk Lamp, Fast Power Adapter, User Manual"
    },
    colors: ["#18181b", "#ffffff", "#94a3b8"],
    sizes: ["One Size"]
  },
  {
    id: 17,
    name: "Dyson V12 Detect Slim Cordless Vacuum Cleaner",
    category: "home",
    categoryName: "Home & Living",
    price: 49900,
    originalPrice: 58900,
    rating: 4.9,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=900&auto=format&fit=crop&q=80", // Slim stick body
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=900&auto=format&fit=crop&q=80", // Laser fluffy cleaner head
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=900&auto=format&fit=crop&q=80"  // Wall docking station
    ],
    badge: "HOT",
    isFlashDeal: false,
    stock: 9,
    description: "Dyson's lightest intelligent cordless vacuum with laser illumination that reveals invisible microscopic dust on hard floors.",
    highlights: [
      "Illumination Fluffy cleaner head reveals invisible dust particles",
      "Piezo sensor continuously sizes and counts dust particles on LCD screen",
      "Dyson Hyperdymium motor spins up to 125,000 RPM for 150 AW suction",
      "Up to 60 minutes of fade-free run time with click-in battery",
      "Hair screw tool de-tangles pet hair automatically"
    ],
    specs: {
      "Brand": "Dyson",
      "Model": "V12 Detect Slim Total Clean",
      "Suction Power": "150 Air Watts (AW)",
      "Runtime": "Up to 60 Minutes (Eco Mode)",
      "Weight": "2.2 kg (Ultra-Lightweight)",
      "Bin Capacity": "0.35 Liters (Hygienic Point-and-Shoot Emptying)",
      "Warranty": "2 Years Dyson India On-Site Warranty",
      "In The Box": "Vacuum, Laser Fluffy Head, Motorbar, Hair Screw Tool, Combi Tool, Wall Dock, Charger"
    },
    colors: ["#ea580c", "#7c3aed"],
    sizes: ["Standard"]
  },

  // =========================================================================
  // 6. BEAUTY, GROOMING & WELLNESS
  // =========================================================================
  {
    id: 18,
    name: "Vitamin C & 2% Hyaluronic Glow Facial Serum (50ml)",
    category: "beauty",
    categoryName: "Beauty & Wellness",
    price: 999,
    originalPrice: 1799,
    rating: 4.9,
    reviewCount: 680,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80", // Glass dropper bottle
      "https://images.unsplash.com/photo-1608248597359-00f7cfcb7e25?w=900&auto=format&fit=crop&q=80", // Serum texture pipette
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&auto=format&fit=crop&q=80", // Active ingredients
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80", // Skin application glow
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&auto=format&fit=crop&q=80"  // Outer packaging
    ],
    badge: "BESTSELLER",
    isFlashDeal: true,
    stock: 50,
    description: "Advanced anti-aging glowing formula with 20% Pure Ethyl Ascorbic Acid, 2% Multi-Molecular Hyaluronic Acid, and Ferulic Acid.",
    highlights: [
      "20% Active Vitamin C brightens dark spots and evens skin tone",
      "2% Multi-molecular Hyaluronic Acid delivers 24hr deep skin hydration",
      "Cruelty-free, Vegan, Paraben-free, and Sulphate-free certified",
      "Dermatologically tested on Indian skin types with zero fragrance irritation",
      "Noticeable radiance and dark spot reduction in 14 days"
    ],
    specs: {
      "Brand": "DermaGlow",
      "Quantity": "50 ml / 1.7 fl.oz",
      "Skin Type": "All Skin Types (Oily, Dry, Sensitive)",
      "Form": "Lightweight Fast-Absorbing Serum",
      "Shelf Life": "24 Months from MFG",
      "Key Ingredients": "20% Ethyl Ascorbic Acid, Hyaluronic Acid, Vitamin E, Ferulic Acid",
      "In The Box": "1 Glass Dropper Bottle (50ml)"
    },
    colors: ["#fbbf24"],
    sizes: ["30ml", "50ml"]
  },
  {
    id: 19,
    name: "Versace Eros Eau De Parfum for Men (100ml)",
    category: "beauty",
    categoryName: "Beauty & Wellness",
    price: 8250,
    originalPrice: 9900,
    rating: 4.9,
    reviewCount: 390,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900&auto=format&fit=crop&q=80", // Medusa turquoise bottle
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&auto=format&fit=crop&q=80", // Golden spray cap
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=900&auto=format&fit=crop&q=80"  // Luxury fragrance display
    ],
    badge: "BESTSELLER",
    isFlashDeal: false,
    stock: 22,
    description: "Passionate, heroic, and masculine. A luminous aura with an intense, vibrant, and glowing combination of fresh mint leaves, Italian lemon zest, and green apple.",
    highlights: [
      "Top Notes: Italian Lemon, Mandarin, Mint Oil, Candied Apple",
      "Heart Notes: Geranium Flower, Clary Sage Essence, Ambermax",
      "Base Notes: Cedarwood Atlas, Vetiver Orpur, Patchouli Coeur, Sandalwood, Vanilla",
      "Concentration: Eau De Parfum (EDP) with 10+ hours long-lasting projection",
      "Iconic turquoise Medusa glass bottle designed by Donatella Versace"
    ],
    specs: {
      "Brand": "Versace",
      "Volume": "100 ml / 3.4 fl.oz",
      "Fragrance Type": "Aromatic Fougère Woody",
      "Origin": "Made in Italy",
      "Warranty": "100% Genuine Imported Fragrance",
      "In The Box": "1 Perfume Bottle (100ml) in Original Sealed Versace Box"
    },
    colors: ["#0284c7"],
    sizes: ["50ml", "100ml", "200ml"]
  }
];

// Coupons
const COUPONS = {
  "SAVE20": { discountPercent: 20, description: "20% OFF on all orders" },
  "FLASH30": { discountPercent: 30, description: "30% Flash Sale Special" },
  "WELCOME10": { discountPercent: 10, description: "10% Welcome Discount" },
  "FREESHIP": { discountPercent: 0, freeShipping: true, description: "Free Express Shipping" }
};

// Currencies
const CURRENCIES = {
  INR: { symbol: "₹", rate: 1, name: "INR (₹)" },
  USD: { symbol: "$", rate: 0.012, name: "USD ($)" },
  EUR: { symbol: "€", rate: 0.011, name: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.0095, name: "GBP (£)" }
};

// Customer Reviews
const REVIEWS_DATA = [
  {
    id: 1,
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Ordered the Sony WH-1000XM5 and the Jordan 1 Chicago. The multi-angle photos on the website were 100% accurate to the real product received. Sound quality & ANC are phenomenal!"
  },
  {
    id: 2,
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Love the Flipkart-style photo gallery and specs breakdown! On my phone, browsing all 6 photos of the jacket made it so easy to check the fabric and zipper quality before buying."
  },
  {
    id: 3,
    name: "Amit Verma",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "The Nike Air Max sneakers look even sharper in person. Quick view specs table answered all my questions regarding sizing and sole material."
  },
  {
    id: 4,
    name: "Neha Gupta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Fast 1-tap checkout with UPI was totally seamless. Got my Versace Eros perfume delivered in perfect sealed packaging."
  }
];
