// ApexStore - Rich Multi-Angle Product Catalog Data (4 to 7 HD Photos per Product with Flipkart-Style Specs)
const PRODUCTS_DATA = [
  // --- 1. SONY WH-1000XM5 HEADPHONES ---
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
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80", // Front hero view
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900&auto=format&fit=crop&q=80", // Angled lifestyle shot
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&auto=format&fit=crop&q=80", // Ear cup detail close-up
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&auto=format&fit=crop&q=80", // Side profile view
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=900&auto=format&fit=crop&q=80", // Folded / carry case view
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80"  // In-use studio setup
    ],
    badge: "BESTSELLER",
    isFlashDeal: true,
    stock: 14,
    description: "Industry-leading noise cancellation optimized automatically based on your wearing conditions and environment. Engineered for perfection with the new Integrated Processor V1.",
    highlights: [
      "Industry Leading Active Noise Cancellation (ANC) with 2 processors & 8 mics",
      "Up to 30 Hours Battery Life with 3-minute Quick Charge (3 hrs playback)",
      "Ultra-comfortable, lightweight design with soft fit leather",
      "Crystal clear hands-free calling with 4 beamforming microphones",
      "Multipoint connection allows switching between two devices seamlessly"
    ],
    specs: {
      "Brand": "Sony",
      "Model Name": "WH-1000XM5 / Black",
      "Headphone Type": "Over-Ear Wireless",
      "Connectivity": "Bluetooth 5.2 & 3.5mm Aux",
      "Battery Life": "30 Hours (ANC ON) / 40 Hours (ANC OFF)",
      "Charging Time": "3.5 Hours (USB Type-C)",
      "Driver Unit": "30mm Precision Carbon Fiber",
      "Weight": "250 grams",
      "Warranty": "1 Year Manufacturer Warranty",
      "In The Box": "Headphones, Premium Carry Case, USB-C Cable, 3.5mm Audio Cable, User Manual"
    },
    colors: ["#1e293b", "#f1f5f9", "#78716c"],
    sizes: ["Standard"]
  },

  // --- 2. APPLE IPHONE 15 PRO MAX ---
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
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80", // Hero back & triple camera
      "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=900&auto=format&fit=crop&q=80", // Front Dynamic Island display
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&auto=format&fit=crop&q=80", // Side titanium edge profile
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&auto=format&fit=crop&q=80", // Camera lens macro view
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop&q=80", // In-hand lifestyle shot
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80"  // Display UI experience
    ],
    badge: "HOT",
    isFlashDeal: false,
    stock: 8,
    description: "Forged in aerospace-grade titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and 5x Telephoto optical zoom.",
    highlights: [
      "6.7-inch Super Retina XDR display with ProMotion 120Hz & Always-On",
      "A17 Pro chip with 6-core GPU for next-level mobile gaming",
      "48MP Main Camera with 5x Optical Zoom Telephoto lens",
      "Strong & light aerospace-grade titanium design with ceramic shield front",
      "USB-C connector with USB 3 support for up to 20x faster transfer speeds"
    ],
    specs: {
      "Brand": "Apple",
      "Model Name": "iPhone 15 Pro Max",
      "Display": "6.7 inch OLED Super Retina XDR (2796 x 1290)",
      "Processor": "A17 Pro Bionic Chip",
      "Internal Storage": "256 GB NVMe",
      "Camera Setup": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto",
      "Front Camera": "12MP TrueDepth with Autofocus",
      "Water Resistance": "IP68 (6 meters up to 30 mins)",
      "Weight": "221 grams",
      "Warranty": "1 Year Apple India Warranty",
      "In The Box": "iPhone with iOS 17, USB-C Charge Cable (1m), Documentation"
    },
    colors: ["#334155", "#e2e8f0", "#1e293b", "#d97706"],
    sizes: ["128GB", "256GB", "512GB", "1TB"]
  },

  // --- 3. MACBOOK AIR 15" M3 ---
  {
    id: 3,
    name: "Apple MacBook Air 15\" M3 (16GB Unified RAM, 512GB SSD)",
    category: "electronics",
    categoryName: "Electronics",
    price: 124900,
    originalPrice: 134900,
    rating: 4.9,
    reviewCount: 420,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80", // Open front display view
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=900&auto=format&fit=crop&q=80", // Top shell and Apple logo
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900&auto=format&fit=crop&q=80", // Magic keyboard & trackpad view
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80", // Side thin profile ports
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=900&auto=format&fit=crop&q=80"  // Desk working lifestyle
    ],
    badge: "NEW",
    isFlashDeal: false,
    stock: 12,
    description: "Strikingly thin and fast MacBook Air with the M3 chip. Delivers up to 18 hours of battery life with an expansive 15.3-inch Liquid Retina display.",
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
      "Battery": "66.5-watt-hour lithium-polymer",
      "Weight": "1.51 kg",
      "Warranty": "1 Year Apple Limited Warranty",
      "In The Box": "15-inch MacBook Air, 35W Dual USB-C Port Power Adapter, USB-C to MagSafe 3 Cable"
    },
    colors: ["#0f172a", "#cbd5e1", "#f8fafc", "#fde68a"],
    sizes: ["256GB SSD", "512GB SSD", "1TB SSD"]
  },

  // --- 4. APPLE WATCH ULTRA 2 ---
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
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80", // Front dial view
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80", // Side crown & action button
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=900&auto=format&fit=crop&q=80", // Ocean band texture close-up
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=900&auto=format&fit=crop&q=80", // Wrist fitness tracking shot
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&auto=format&fit=crop&q=80"  // Outdoor rugged lifestyle
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
      "Sensors": "ECG, Blood Oxygen, Depth Gauge, Water Temp, Heart Rate",
      "Water Resistance": "100m / 40m Recreational Dive",
      "Battery": "Up to 36 Hours Normal Use",
      "Weight": "61.4 grams (Case only)",
      "Warranty": "1 Year Manufacturer Warranty",
      "In The Box": "Titanium Case, Loop/Band, Apple Watch Magnetic Fast Charger to USB-C Cable"
    },
    colors: ["#e2e8f0", "#ea580c", "#0284c7"],
    sizes: ["49mm"]
  },

  // --- 5. URBAN BOMBER JACKET ---
  {
    id: 5,
    name: "Urban Explorer Weatherproof Insulated Bomber Jacket",
    category: "fashion",
    categoryName: "Fashion",
    price: 3499,
    originalPrice: 6999,
    rating: 4.6,
    reviewCount: 184,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80", // Front model view
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80", // Back angle & fit
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80", // Fabric texture & zipper close-up
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80", // Side sleeve pocket detail
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80", // Streetwear urban lifestyle
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"  // Casual outdoor style
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

  // --- 6. NIKE AIR MAX SNEAKERS ---
  {
    id: 6,
    name: "Nike Air Max Pulse Lifestyle Athletic Sneakers",
    category: "footwear",
    categoryName: "Footwear",
    price: 7999,
    originalPrice: 12999,
    rating: 4.8,
    reviewCount: 450,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80", // Side hero profile
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80", // Pair top-down angle
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=80", // Heel air unit close-up
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=900&auto=format&fit=crop&q=80", // Outsole grip & traction
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=900&auto=format&fit=crop&q=80", // On-feet walking lifestyle
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop&q=80"  // Street fashion aesthetic
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

  // --- 7. FOSSIL CHRONOGRAPH WATCH ---
  {
    id: 7,
    name: "Fossil Minimalist Chronograph Brown Leather Watch",
    category: "accessories",
    categoryName: "Accessories",
    price: 8495,
    originalPrice: 11995,
    rating: 4.6,
    reviewCount: 167,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80", // Front dial view
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80", // Side crown & pushers angle
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80", // Leather strap texture
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=900&auto=format&fit=crop&q=80", // Caseback & buckle
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&auto=format&fit=crop&q=80"  // On-wrist formal lifestyle
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

  // --- 8. SMART DESK LAMP ---
  {
    id: 8,
    name: "Smart LED Ergonomic Desk Lamp with 15W Fast Wireless Charger",
    category: "home",
    categoryName: "Home & Living",
    price: 2999,
    originalPrice: 4999,
    rating: 4.7,
    reviewCount: 230,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80", // Hero lighted lamp
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&auto=format&fit=crop&q=80", // Wireless charging base close-up
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=900&auto=format&fit=crop&q=80", // Adjustable dual-hinge arm angle
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=900&auto=format&fit=crop&q=80", // Touch control dimming slider
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&auto=format&fit=crop&q=80"  // Night desk ambiance shot
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

  // --- 9. VITAMIN C SERUM ---
  {
    id: 9,
    name: "Vitamin C & 2% Hyaluronic Glow Facial Serum (50ml)",
    category: "beauty",
    categoryName: "Beauty & Wellness",
    price: 999,
    originalPrice: 1799,
    rating: 4.9,
    reviewCount: 680,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80", // Front bottle & dropper
      "https://images.unsplash.com/photo-1608248597359-00f7cfcb7e25?w=900&auto=format&fit=crop&q=80", // Dropper texture pipette
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&auto=format&fit=crop&q=80", // Ingredients & botanical aesthetic
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80", // Application on skin
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&auto=format&fit=crop&q=80"  // Packaging box & seal
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

  // --- 10. JBL FLIP 6 SPEAKER ---
  {
    id: 10,
    name: "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
    category: "electronics",
    categoryName: "Electronics",
    price: 9999,
    originalPrice: 13999,
    rating: 4.8,
    reviewCount: 512,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80", // Hero speaker profile
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&auto=format&fit=crop&q=80", // Bass radiator end cap close-up
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80", // Water splash proof demonstration
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=80", // Party outdoor music setting
      "https://images.unsplash.com/photo-1528148343865-51218c4a13e6?w=900&auto=format&fit=crop&q=80"  // Hanging strap / travel view
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
      "Battery Type": "Li-ion polymer 17.28Wh (equivalent to 3.6V/4800mAh)",
      "Charging Time": "2.5 Hours",
      "Dimensions": "17.8 x 6.8 x 7.2 cm",
      "Weight": "550 grams",
      "Warranty": "1 Year Official Brand Warranty",
      "In The Box": "JBL Flip 6 Speaker, Type-C USB Cable, Quick Start Guide, Safety Sheet"
    },
    colors: ["#0284c7", "#dc2626", "#1e293b", "#16a34a"],
    sizes: ["Standard"]
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

// Reviews
const REVIEWS_DATA = [
  {
    id: 1,
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Ordered the Sony WH-1000XM5. The multi-angle photos on the website were 100% accurate to the real product received. Sound quality & ANC are phenomenal!"
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
  }
];
