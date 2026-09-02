"""
ApexStore - SQLite Database Layer
Stores products, orders, coupons, and customer inquiries with auto-seeding.
Provides 5 to 7 angle photos and Flipkart-style specifications for each product.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "apexstore.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        category_name TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL NOT NULL,
        rating REAL DEFAULT 4.5,
        review_count INTEGER DEFAULT 0,
        image TEXT NOT NULL,
        images_json TEXT NOT NULL,
        badge TEXT,
        is_flash_deal BOOLEAN DEFAULT 0,
        stock INTEGER DEFAULT 20,
        description TEXT,
        features_json TEXT,
        colors_json TEXT,
        sizes_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Orders Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        customer_city TEXT NOT NULL,
        customer_pincode TEXT NOT NULL,
        items_json TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        shipping REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Coupons Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        discount_percent INTEGER DEFAULT 0,
        free_shipping BOOLEAN DEFAULT 0,
        description TEXT
    );
    """)

    # 4. Newsletter Subscribers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()

    # Always re-seed/sync products to ensure all products have full 5-7 angle photos
    cursor.execute("DELETE FROM products")
    seed_initial_data(conn)

    # Seed coupons
    cursor.execute("INSERT OR REPLACE INTO coupons VALUES ('SAVE20', 20, 0, '20% OFF on all orders')")
    cursor.execute("INSERT OR REPLACE INTO coupons VALUES ('FLASH30', 30, 0, '30% Flash Sale Special')")
    cursor.execute("INSERT OR REPLACE INTO coupons VALUES ('WELCOME10', 10, 0, '10% Welcome Discount')")
    cursor.execute("INSERT OR REPLACE INTO coupons VALUES ('FREESHIP', 0, 1, 'Free Express Shipping')")
    conn.commit()
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    products = [
        {
            "id": 1,
            "name": "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 26999,
            "original_price": 34990,
            "rating": 4.8,
            "review_count": 342,
            "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "BESTSELLER",
            "is_flash_deal": 1,
            "stock": 14,
            "description": "Industry-leading noise cancellation optimized automatically based on your wearing conditions and environment. Engineered for perfection with the new Integrated Processor V1.",
            "features": [
                "Industry Leading Active Noise Cancellation (ANC) with 2 processors & 8 mics",
                "Up to 30 Hours Battery Life with 3-minute Quick Charge (3 hrs playback)",
                "Ultra-comfortable, lightweight design with soft fit leather",
                "Crystal clear hands-free calling with 4 beamforming microphones",
                "Multipoint connection allows switching between two devices seamlessly"
            ],
            "colors": ["#1e293b", "#f1f5f9", "#78716c"],
            "sizes": ["Standard"]
        },
        {
            "id": 2,
            "name": "Apple iPhone 15 Pro Max (256 GB, Natural Titanium)",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 134900,
            "original_price": 149900,
            "rating": 4.9,
            "review_count": 890,
            "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "HOT",
            "is_flash_deal": 0,
            "stock": 8,
            "description": "Forged in aerospace-grade titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and 5x Telephoto optical zoom.",
            "features": [
                "6.7-inch Super Retina XDR display with ProMotion 120Hz & Always-On",
                "A17 Pro chip with 6-core GPU for next-level mobile gaming",
                "48MP Main Camera with 5x Optical Zoom Telephoto lens",
                "Strong & light aerospace-grade titanium design with ceramic shield front",
                "USB-C connector with USB 3 support for up to 20x faster transfer speeds"
            ],
            "colors": ["#334155", "#e2e8f0", "#1e293b", "#d97706"],
            "sizes": ["128GB", "256GB", "512GB", "1TB"]
        },
        {
            "id": 3,
            "name": "Apple MacBook Air 15\" M3 (16GB RAM, 512GB SSD)",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 124900,
            "original_price": 134900,
            "rating": 4.9,
            "review_count": 420,
            "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "NEW",
            "is_flash_deal": 0,
            "stock": 12,
            "description": "Strikingly thin and fast with the M3 chip. Built for Apple Intelligence and delivers up to 18 hours of continuous battery life.",
            "features": [
                "Apple M3 chip with 8-core CPU & 10-core GPU",
                "15.3-inch Liquid Retina display with 500 nits brightness & True Tone",
                "1080p FaceTime HD camera with 3-mic array and 6-speaker spatial audio",
                "MagSafe 3 charging & 2 Thunderbolt ports"
            ],
            "colors": ["#0f172a", "#cbd5e1", "#f8fafc", "#fde68a"],
            "sizes": ["256GB SSD", "512GB SSD", "1TB SSD"]
        },
        {
            "id": 4,
            "name": "Apple Watch Ultra 2 GPS + Cellular (49mm Titanium)",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 79900,
            "original_price": 89900,
            "rating": 4.7,
            "review_count": 215,
            "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "SALE",
            "is_flash_deal": 1,
            "stock": 9,
            "description": "The most rugged and capable Apple Watch. Powered by the S9 SiP, with a 3000-nit display and specialized metrics for endurance athletes.",
            "features": [
                "49mm corrosion-resistant aerospace-grade titanium case",
                "Brightest Always-On Retina display at 3000 nits peak brightness",
                "Precision dual-frequency GPS for incredible accuracy in dense environments",
                "100m water resistance, EN13319 certified dive computer up to 40m"
            ],
            "colors": ["#e2e8f0", "#ea580c", "#0284c7"],
            "sizes": ["49mm"]
        },
        {
            "id": 5,
            "name": "Urban Explorer Weatherproof Bomber Jacket",
            "category": "fashion",
            "category_name": "Fashion",
            "price": 3499,
            "original_price": 6999,
            "rating": 4.6,
            "review_count": 184,
            "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "50% OFF",
            "is_flash_deal": 1,
            "stock": 25,
            "description": "Premium insulated bomber jacket crafted from windproof, water-repellent matte nylon shell with ultra-warm quilted thermal fleece lining.",
            "features": [
                "100% Windproof and Water-Repellent Matte Shell",
                "Heavy-duty dual YKK metallic anti-snag zippers",
                "Ribbed collar, cuffs, and hem for tailored snug fit",
                "5 functional pockets including inner secure zippered passport slot"
            ],
            "colors": ["#1e293b", "#3f6212", "#78350f"],
            "sizes": ["S", "M", "L", "XL", "XXL"]
        },
        {
            "id": 6,
            "name": "Nike Air Max Pulse Lifestyle Athletic Sneakers",
            "category": "footwear",
            "category_name": "Footwear",
            "price": 7999,
            "original_price": 12999,
            "rating": 4.8,
            "review_count": 450,
            "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "HOT",
            "is_flash_deal": 1,
            "stock": 15,
            "description": "Drawing inspiration from London music culture, the Air Max Pulse brings a tough, underground touch with point-loaded Air cushioning system for extreme bounce.",
            "features": [
                "Point-loaded Air cushioning with targeted plastic clip for responsive bounce",
                "Textile wrapped midsole and breathable mesh upper for durability",
                "Rubber waffle outsole delivers time-tested traction and grip"
            ],
            "colors": ["#dc2626", "#0f172a", "#f8fafc"],
            "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
        },
        {
            "id": 7,
            "name": "Fossil Minimalist Chronograph Leather Watch",
            "category": "accessories",
            "category_name": "Accessories",
            "price": 8495,
            "original_price": 11995,
            "rating": 4.6,
            "review_count": 167,
            "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "SALE",
            "is_flash_deal": 1,
            "stock": 20,
            "description": "44mm case size with Japanese quartz chronograph movement, satin dial finish, and genuine interchangeable brown calfskin leather strap.",
            "features": [
                "44mm stainless steel case with scratch-resistant mineral crystal glass",
                "Japanese Quartz Chronograph movement with stopwatch",
                "5 ATM Water Resistance (50 meters) suitable for swimming"
            ],
            "colors": ["#92400e", "#0f172a", "#ca8a04"],
            "sizes": ["44mm"]
        },
        {
            "id": 8,
            "name": "Smart LED Ergonomic Desk Lamp with Wireless Charger",
            "category": "home",
            "category_name": "Home & Living",
            "price": 2999,
            "original_price": 4999,
            "rating": 4.7,
            "review_count": 230,
            "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "SALE",
            "is_flash_deal": 1,
            "stock": 16,
            "description": "Multi-angle adjustable architectural lamp with 5 color temperatures, slide dimming, 15W Qi fast wireless charging base, and auto-off timer.",
            "features": [
                "Integrated 15W Qi Fast Wireless Charging Base",
                "5 Color Modes (2700K - 6500K) and 10 Stepless Brightness levels",
                "Flicker-free eye protection technology"
            ],
            "colors": ["#18181b", "#ffffff", "#94a3b8"],
            "sizes": ["One Size"]
        },
        {
            "id": 9,
            "name": "Vitamin C & Hyaluronic Glow Facial Serum (50ml)",
            "category": "beauty",
            "category_name": "Beauty & Wellness",
            "price": 999,
            "original_price": 1799,
            "rating": 4.9,
            "review_count": 680,
            "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1608248597359-00f7cfcb7e25?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "BESTSELLER",
            "is_flash_deal": 1,
            "stock": 50,
            "description": "Advanced glowing formula with 20% Pure Ethyl Ascorbic Acid, 2% Multi-Molecular Hyaluronic Acid, and Ferulic Acid.",
            "features": [
                "20% Active Vitamin C brightens dark spots and evens skin tone",
                "2% Multi-molecular Hyaluronic Acid delivers deep hydration",
                "Cruelty-free, Vegan, Paraben-free, and Sulphate-free"
            ],
            "colors": ["#fbbf24"],
            "sizes": ["30ml", "50ml"]
        },
        {
            "id": 10,
            "name": "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 9999,
            "original_price": 13999,
            "rating": 4.8,
            "review_count": 512,
            "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1528148343865-51218c4a13e6?w=900&auto=format&fit=crop&q=80"
            ],
            "badge": "HOT",
            "is_flash_deal": 1,
            "stock": 19,
            "description": "Bold sound for every adventure. 2-way speaker system delivering loud, crystal-clear, powerful sound with IP67 waterproof and dustproof protection.",
            "features": [
                "2-Way Speaker System engineered for powerful, crystal-clear sound",
                "IP67 Waterproof and Dustproof for all adventures",
                "Up to 12 Hours of Continuous Playtime on a single charge"
            ],
            "colors": ["#0284c7", "#dc2626", "#1e293b", "#16a34a"],
            "sizes": ["Standard"]
        }
    ]

    for p in products:
        cursor.execute("""
        INSERT INTO products (id, name, category, category_name, price, original_price, rating, review_count, image, images_json, badge, is_flash_deal, stock, description, features_json, colors_json, sizes_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"],
            p["name"],
            p["category"],
            p["category_name"],
            p["price"],
            p["original_price"],
            p["rating"],
            p["review_count"],
            p["image"],
            json.dumps(p["images"]),
            p["badge"],
            p["is_flash_deal"],
            p["stock"],
            p["description"],
            json.dumps(p["features"]),
            json.dumps(p["colors"]),
            json.dumps(p["sizes"])
        ))

    conn.commit()

# --- Helper Query Functions ---

def get_all_products(category: Optional[str] = None, max_price: Optional[float] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if max_price:
        query += " AND price <= ?"
        params.append(max_price)

    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR category_name LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        item["images"] = json.loads(item["images_json"])
        item["features"] = json.loads(item["features_json"])
        item["colors"] = json.loads(item["colors_json"])
        item["sizes"] = json.loads(item["sizes_json"])
        del item["images_json"]
        del item["features_json"]
        del item["colors_json"]
        del item["sizes_json"]
        result.append(item)
    return result

def get_product_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    item = dict(row)
    item["images"] = json.loads(item["images_json"])
    item["features"] = json.loads(item["features_json"])
    item["colors"] = json.loads(item["colors_json"])
    item["sizes"] = json.loads(item["sizes_json"])
    del item["images_json"]
    del item["features_json"]
    del item["colors_json"]
    del item["sizes_json"]
    return item

def create_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    import random
    order_id = f"APX-{random.randint(100000, 999999)}"

    # Calculate Totals
    items = order_data.get("items", [])
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    
    # Check Coupon
    coupon_code = order_data.get("coupon_code")
    discount = 0.0
    free_shipping = False

    if coupon_code:
        cursor.execute("SELECT * FROM coupons WHERE code = ?", (coupon_code.upper(),))
        c_row = cursor.fetchone()
        if c_row:
            if c_row["discount_percent"] > 0:
                discount = (subtotal * c_row["discount_percent"]) / 100.0
            if c_row["free_shipping"]:
                free_shipping = True

    shipping = 0.0 if (subtotal >= 999 or free_shipping or subtotal == 0) else 99.0
    tax = round((subtotal - discount) * 0.05, 2)
    total = max(0.0, subtotal - discount + shipping + tax)

    shipping_info = order_data.get("shipping", {})

    cursor.execute("""
    INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, customer_city, customer_pincode, items_json, subtotal, discount, shipping, tax, total, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
    """, (
        order_id,
        shipping_info.get("name", "Customer"),
        shipping_info.get("phone", ""),
        shipping_info.get("address", ""),
        shipping_info.get("city", ""),
        shipping_info.get("pincode", ""),
        json.dumps(items),
        subtotal,
        discount,
        shipping,
        tax,
        total,
        order_data.get("payment_method", "UPI / QR Code")
    ))

    # Decrement Stock
    for item in items:
        cursor.execute("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", (item["quantity"], item["id"]))

    conn.commit()
    conn.close()

    return {
        "order_id": order_id,
        "status": "Confirmed",
        "totals": {
            "subtotal": subtotal,
            "discount": discount,
            "shipping": shipping,
            "tax": tax,
            "total": total
        }
    }

def get_all_orders(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        item["items"] = json.loads(item["items_json"])
        del item["items_json"]
        result.append(item)
    return result

def get_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    item = dict(row)
    item["items"] = json.loads(item["items_json"])
    del item["items_json"]
    return item

def update_order_status(order_id: str, new_status: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE order_id = ?", (new_status, order_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def validate_coupon(code: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons WHERE code = ?", (code.upper(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_admin_dashboard_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_revenue FROM orders")
    order_stats = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total_products FROM products")
    prod_stats = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as low_stock_count FROM products WHERE stock <= 5")
    stock_stats = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as subscribers_count FROM subscribers")
    sub_stats = cursor.fetchone()

    conn.close()

    return {
        "total_revenue": order_stats["total_revenue"],
        "total_orders": order_stats["total_orders"],
        "total_products": prod_stats["total_products"],
        "low_stock_products": stock_stats["low_stock_count"],
        "subscribers": sub_stats["subscribers_count"]
    }
