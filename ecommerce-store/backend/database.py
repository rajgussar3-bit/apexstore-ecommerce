"""
ApexStore - SQLite Database Layer
Stores products, orders, coupons, and customer inquiries with auto-seeding.
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

    # Check if products need seeding
    cursor.execute("SELECT COUNT(*) as cnt FROM products")
    if cursor.fetchone()["cnt"] == 0:
        seed_initial_data(conn)

    # Check if coupons need seeding
    cursor.execute("SELECT COUNT(*) as cnt FROM coupons")
    if cursor.fetchone()["cnt"] == 0:
        cursor.execute("INSERT OR IGNORE INTO coupons VALUES ('SAVE20', 20, 0, '20% OFF on all orders')")
        cursor.execute("INSERT OR IGNORE INTO coupons VALUES ('FLASH30', 30, 0, '30% Flash Sale Special')")
        cursor.execute("INSERT OR IGNORE INTO coupons VALUES ('WELCOME10', 10, 0, '10% Welcome Discount')")
        cursor.execute("INSERT OR IGNORE INTO coupons VALUES ('FREESHIP', 0, 1, 'Free Express Shipping')")
        conn.commit()

    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    products = [
        {
            "id": 1,
            "name": "Sony WH-1000XM5 Wireless Headphones",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 26999,
            "original_price": 34990,
            "rating": 4.8,
            "review_count": 342,
            "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
            ],
            "badge": "BESTSELLER",
            "is_flash_deal": 1,
            "stock": 14,
            "description": "Industry-leading noise canceling with two processors and 8 microphones for unprecedented sound quality. Up to 30-hour battery life with quick charging.",
            "features": ["Industry-leading Active Noise Cancellation", "Up to 30 hours battery life", "Ultra-comfortable lightweight design", "Multipoint connection support"],
            "colors": ["#1e293b", "#f1f5f9", "#78716c"],
            "sizes": ["Standard"]
        },
        {
            "id": 2,
            "name": "Apple iPhone 15 Pro Max (256 GB)",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 134900,
            "original_price": 149900,
            "rating": 4.9,
            "review_count": 890,
            "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&auto=format&fit=crop&q=80"
            ],
            "badge": "HOT",
            "is_flash_deal": 0,
            "stock": 8,
            "description": "Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
            "features": ["Titanium with textured matte glass back", "A17 Pro chip with 6-core GPU", "48MP Main camera with 5x optical zoom", "USB-C with USB 3 speeds"],
            "colors": ["#334155", "#e2e8f0", "#1e293b", "#d97706"],
            "sizes": ["128GB", "256GB", "512GB", "1TB"]
        },
        {
            "id": 3,
            "name": "MacBook Air 15\" M3 Chip 16GB",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 124900,
            "original_price": 134900,
            "rating": 4.9,
            "review_count": 420,
            "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
            ],
            "badge": "NEW",
            "is_flash_deal": 0,
            "stock": 12,
            "description": "Strikingly thin and fast with the M3 chip. Built for Apple Intelligence and delivers up to 18 hours of continuous battery life.",
            "features": ["Apple M3 chip with 8-core CPU & 10-core GPU", "15.3-inch Liquid Retina display", "1080p FaceTime HD camera", "MagSafe 3 charging & 2 Thunderbolt ports"],
            "colors": ["#0f172a", "#cbd5e1", "#f8fafc", "#fde68a"],
            "sizes": ["256GB SSD", "512GB SSD", "1TB SSD"]
        },
        {
            "id": 4,
            "name": "Apple Watch Ultra 2 GPS + Cellular",
            "category": "electronics",
            "category_name": "Electronics",
            "price": 79900,
            "original_price": 89900,
            "rating": 4.7,
            "review_count": 215,
            "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"],
            "badge": "SALE",
            "is_flash_deal": 1,
            "stock": 9,
            "description": "The most rugged and capable Apple Watch. Powered by the S9 SiP, with a 3000-nit display and specialized metrics for endurance athletes.",
            "features": ["49mm aerospace-grade titanium case", "Dual-frequency precision GPS", "100m water resistance & depth gauge", "Up to 36 hours regular battery life"],
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
            "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"],
            "badge": "50% OFF",
            "is_flash_deal": 1,
            "stock": 25,
            "description": "Premium insulated bomber jacket crafted from water-repellent matte nylon with thermal fleece lining.",
            "features": ["Windproof & Water-resistant shell", "Warm thermal quilted insulation", "Heavy-duty dual YKK zippers"],
            "colors": ["#1e293b", "#3f6212", "#78350f"],
            "sizes": ["S", "M", "L", "XL", "XXL"]
        },
        {
            "id": 6,
            "name": "Nike Air Max Pulse Lifestyle Sneakers",
            "category": "footwear",
            "category_name": "Footwear",
            "price": 7999,
            "original_price": 12999,
            "rating": 4.8,
            "review_count": 450,
            "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"],
            "badge": "HOT",
            "is_flash_deal": 1,
            "stock": 15,
            "description": "Featuring a point-loaded Air cushioning system that delivers bouncy responsiveness and sleek street style.",
            "features": ["Point-loaded Air Max cushioning", "Breathable mesh upper with synthetic overlays", "Rubber waffle outsole for traction"],
            "colors": ["#dc2626", "#0f172a", "#f8fafc"],
            "sizes": ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
        },
        {
            "id": 7,
            "name": "Fossil Minimalist Chronograph Watch",
            "category": "accessories",
            "category_name": "Accessories",
            "price": 8495,
            "original_price": 11995,
            "rating": 4.6,
            "review_count": 167,
            "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"],
            "badge": "SALE",
            "is_flash_deal": 1,
            "stock": 20,
            "description": "44mm case size with Japanese quartz chronograph movement and genuine interchangeable brown leather strap.",
            "features": ["Stainless steel 44mm case", "5 ATM water resistance", "Sub-dials for stopwatch 24hr timer"],
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
            "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"],
            "badge": "SALE",
            "is_flash_deal": 1,
            "stock": 16,
            "description": "Multi-angle architectural lamp with 5 color temperatures, slide dimming, and 15W Qi fast wireless charging base.",
            "features": ["15W Qi Fast Wireless Charging Base", "5 Color Temperatures & 10 Brightness levels", "Eye-care flicker-free LED"],
            "colors": ["#18181b", "#ffffff", "#94a3b8"],
            "sizes": ["One Size"]
        },
        {
            "id": 9,
            "name": "Vitamin C & Hyaluronic Glow Facial Serum",
            "category": "beauty",
            "category_name": "Beauty & Wellness",
            "price": 999,
            "original_price": 1799,
            "rating": 4.9,
            "review_count": 680,
            "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"],
            "badge": "BESTSELLER",
            "is_flash_deal": 1,
            "stock": 50,
            "description": "Advanced anti-aging formula with 20% Pure Vitamin C, Hyaluronic Acid, and Vitamin E.",
            "features": ["20% Active Vitamin C + Hyaluronic Acid", "Paraben & cruelty-free", "Dermatologist tested"],
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
            "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"],
            "badge": "HOT",
            "is_flash_deal": 1,
            "stock": 19,
            "description": "Bold sound for every adventure with 2-way speaker system and IP67 waterproof/dustproof protection.",
            "features": ["IP67 Waterproof and Dustproof", "12 Hours Playtime", "PartyBoost pairing"],
            "colors": ["#0284c7", "#dc2626", "#1e293b", "#16a34a"],
            "sizes": ["Standard"]
        }
    ]

    for p in products:
        cursor.execute("""
        INSERT INTO products (
            name, category, category_name, price, original_price, rating, review_count,
            image, images_json, badge, is_flash_deal, stock, description, features_json, colors_json, sizes_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["name"], p["category"], p["category_name"], p["price"], p["original_price"],
            p["rating"], p["review_count"], p["image"], json.dumps(p["images"]),
            p["badge"], p["is_flash_deal"], p["stock"], p["description"],
            json.dumps(p["features"]), json.dumps(p["colors"]), json.dumps(p["sizes"])
        ))

    # Seed sample orders for demo
    sample_order = {
        "order_id": "APX-928410",
        "customer_name": "Rahul Sharma",
        "customer_phone": "9876543210",
        "customer_address": "Flat 402, Sunshine Heights, MG Road",
        "customer_city": "Mumbai",
        "customer_pincode": "400001",
        "items": [
            {"id": 1, "name": "Sony WH-1000XM5 Wireless Headphones", "price": 26999, "quantity": 1, "size": "Standard", "color": "#1e293b"}
        ],
        "subtotal": 26999,
        "discount": 5399.8,
        "shipping": 0,
        "tax": 1079.96,
        "total": 22679.16,
        "payment_method": "UPI / QR Code",
        "status": "Confirmed"
    }

    cursor.execute("""
    INSERT INTO orders (
        order_id, customer_name, customer_phone, customer_address, customer_city, customer_pincode,
        items_json, subtotal, discount, shipping, tax, total, payment_method, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sample_order["order_id"], sample_order["customer_name"], sample_order["customer_phone"],
        sample_order["customer_address"], sample_order["customer_city"], sample_order["customer_pincode"],
        json.dumps(sample_order["items"]), sample_order["subtotal"], sample_order["discount"],
        sample_order["shipping"], sample_order["tax"], sample_order["total"],
        sample_order["payment_method"], sample_order["status"]
    ))

    conn.commit()
