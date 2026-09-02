"""
ApexStore - SQLite Database Layer
Stores products, orders, coupons, and customer inquiries with auto-seeding.
Provides 4 to 7 angle photos and Flipkart-style specifications for each product.
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

    # Always re-seed products to sync with mega catalog
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
    json_path = os.path.join(os.path.dirname(__file__), "products.json")
    
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            products = json.load(f)
            for p in products:
                cursor.execute("""
                INSERT INTO products (id, name, category, category_name, price, original_price, rating, review_count, image, images_json, badge, is_flash_deal, stock, description, features_json, colors_json, sizes_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    p.get("id"),
                    p.get("name"),
                    p.get("category"),
                    p.get("categoryName") or p.get("category_name"),
                    p.get("price"),
                    p.get("originalPrice") or p.get("original_price") or p.get("price"),
                    p.get("rating", 4.5),
                    p.get("reviewCount") or p.get("review_count", 0),
                    p.get("image"),
                    json.dumps(p.get("images", [p.get("image")])),
                    p.get("badge"),
                    1 if p.get("isFlashDeal") or p.get("is_flash_deal") else 0,
                    p.get("stock", 20),
                    p.get("description", ""),
                    json.dumps(p.get("highlights") or p.get("features", [])),
                    json.dumps(p.get("colors", [])),
                    json.dumps(p.get("sizes", []))
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
        item["images"] = json.loads(item["images_json"]) if item["images_json"] else [item["image"]]
        item["features"] = json.loads(item["features_json"]) if item["features_json"] else []
        item["colors"] = json.loads(item["colors_json"]) if item["colors_json"] else []
        item["sizes"] = json.loads(item["sizes_json"]) if item["sizes_json"] else []
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
    item["images"] = json.loads(item["images_json"]) if item["images_json"] else [item["image"]]
    item["features"] = json.loads(item["features_json"]) if item["features_json"] else []
    item["colors"] = json.loads(item["colors_json"]) if item["colors_json"] else []
    item["sizes"] = json.loads(item["sizes_json"]) if item["sizes_json"] else []
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
