"""
ApexStore - High-Performance FastAPI Backend Server
Provides full REST APIs for Products, Orders, Coupons, Newsletter & Admin Analytics.
"""

import os
import json
import random
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from database import init_db, get_db_connection

# Initialize FastAPI App
app = FastAPI(
    title="ApexStore E-Commerce API",
    description="Modern REST API backend for ApexStore e-commerce store with SQLite persistence.",
    version="1.0.0"
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Startup Event: Initialize SQLite Database
@app.on_event("startup")
def startup_event():
    init_db()
    print("[INFO] SQLite Database initialized and seeded successfully.")

# --------------------------------------------------------------------------
# Pydantic Request Models
# --------------------------------------------------------------------------
class OrderItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int
    color: Optional[str] = "Default"
    size: Optional[str] = "Standard"

class ShippingDetails(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    pincode: str

class CreateOrderRequest(BaseModel):
    shipping: ShippingDetails
    items: List[OrderItem]
    coupon_code: Optional[str] = None
    payment_method: str = "UPI / QR Code"

class CouponValidateRequest(BaseModel):
    code: str

class NewsletterRequest(BaseModel):
    email: str

class UpdateOrderStatusRequest(BaseModel):
    status: str

class CreateProductRequest(BaseModel):
    name: str
    category: str
    category_name: str
    price: float
    original_price: float
    rating: Optional[float] = 4.5
    review_count: Optional[int] = 0
    image: str
    images: Optional[List[str]] = []
    badge: Optional[str] = None
    is_flash_deal: Optional[bool] = False
    stock: Optional[int] = 20
    description: str
    features: Optional[List[str]] = []
    colors: Optional[List[str]] = []
    sizes: Optional[List[str]] = []

# --------------------------------------------------------------------------
# Helper to convert SQLite product row to Python dict
# --------------------------------------------------------------------------
def parse_product_row(row) -> dict:
    p = dict(row)
    p["images"] = json.loads(p.get("images_json", "[]"))
    p["features"] = json.loads(p.get("features_json", "[]"))
    p["colors"] = json.loads(p.get("colors_json", "[]"))
    p["sizes"] = json.loads(p.get("sizes_json", "[]"))
    p["is_flash_deal"] = bool(p.get("is_flash_deal", 0))
    # cleanup json string columns
    p.pop("images_json", None)
    p.pop("features_json", None)
    p.pop("colors_json", None)
    p.pop("sizes_json", None)
    return p

# --------------------------------------------------------------------------
# 1. Products API
# --------------------------------------------------------------------------
@app.get("/api/products", tags=["Products"])
def get_products(
    category: Optional[str] = "all",
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort_by: Optional[str] = "featured"
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR category_name LIKE ?)"
        s = f"%{search.strip()}%"
        params.extend([s, s, s])

    if min_price is not None:
        query += " AND price >= ?"
        params.append(min_price)

    if max_price is not None:
        query += " AND price <= ?"
        params.append(max_price)

    if min_rating is not None and min_rating > 0:
        query += " AND rating >= ?"
        params.append(min_rating)

    if sort_by == "price-low":
        query += " ORDER BY price ASC"
    elif sort_by == "price-high":
        query += " ORDER BY price DESC"
    elif sort_by == "rating":
        query += " ORDER BY rating DESC"
    elif sort_by == "discount":
        query += " ORDER BY ((original_price - price)/original_price) DESC"
    else:
        query += " ORDER BY id ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    products = [parse_product_row(r) for r in rows]
    return {"total": len(products), "products": products}

@app.get("/api/products/{product_id}", tags=["Products"])
def get_product_detail(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    return parse_product_row(row)

@app.post("/api/products", tags=["Products"], status_code=status.HTTP_201_CREATED)
def create_product(prod: CreateProductRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    images_json = json.dumps(prod.images if prod.images else [prod.image])
    features_json = json.dumps(prod.features if prod.features else [])
    colors_json = json.dumps(prod.colors if prod.colors else ["#0f172a"])
    sizes_json = json.dumps(prod.sizes if prod.sizes else ["Standard"])

    cursor.execute("""
    INSERT INTO products (
        name, category, category_name, price, original_price, rating, review_count,
        image, images_json, badge, is_flash_deal, stock, description, features_json, colors_json, sizes_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        prod.name, prod.category, prod.category_name, prod.price, prod.original_price,
        prod.rating, prod.review_count, prod.image, images_json, prod.badge,
        1 if prod.is_flash_deal else 0, prod.stock, prod.description,
        features_json, colors_json, sizes_json
    ))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"message": "Product created successfully", "id": new_id}

# --------------------------------------------------------------------------
# 2. Coupon Validation API
# --------------------------------------------------------------------------
@app.post("/api/coupons/validate", tags=["Coupons"])
def validate_coupon(req: CouponValidateRequest):
    code = req.code.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons WHERE code = ?", (code,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=400, detail="Invalid promo code! Try SAVE20, FLASH30, or WELCOME10")

    return {
        "valid": True,
        "code": row["code"],
        "discount_percent": row["discount_percent"],
        "free_shipping": bool(row["free_shipping"]),
        "description": row["description"]
    }

# --------------------------------------------------------------------------
# 3. Orders API
# --------------------------------------------------------------------------
@app.post("/api/orders", tags=["Orders"], status_code=status.HTTP_201_CREATED)
def create_order(req: CreateOrderRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Calculate Subtotal
    subtotal = sum(item.price * item.quantity for item in req.items)
    discount = 0
    is_free_shipping = subtotal >= 999

    # Check coupon if provided
    if req.coupon_code:
        c_code = req.coupon_code.strip().upper()
        cursor.execute("SELECT * FROM coupons WHERE code = ?", (c_code,))
        c_row = cursor.fetchone()
        if c_row:
            if c_row["discount_percent"] > 0:
                discount = (subtotal * c_row["discount_percent"]) / 100
            if c_row["free_shipping"]:
                is_free_shipping = True

    shipping = 0 if is_free_shipping else 99
    tax = round((subtotal - discount) * 0.05, 2)
    total = max(0, round(subtotal - discount + shipping + tax, 2))

    # Generate Order ID
    order_id = f"APX-{random.randint(100000, 999999)}"

    # Save to SQLite
    items_json = json.dumps([item.dict() for item in req.items])

    cursor.execute("""
    INSERT INTO orders (
        order_id, customer_name, customer_phone, customer_address, customer_city, customer_pincode,
        items_json, subtotal, discount, shipping, tax, total, payment_method, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
    """, (
        order_id, req.shipping.name, req.shipping.phone, req.shipping.address,
        req.shipping.city, req.shipping.pincode, items_json, subtotal, discount,
        shipping, tax, total, req.payment_method
    ))

    # Update product stock
    for item in req.items:
        cursor.execute("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", (item.quantity, item.id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Order placed successfully!",
        "order_id": order_id,
        "totals": {
            "subtotal": subtotal,
            "discount": discount,
            "shipping": shipping,
            "tax": tax,
            "total": total
        },
        "payment_method": req.payment_method,
        "status": "Confirmed"
    }

@app.get("/api/orders", tags=["Orders"])
def list_orders(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    orders = []
    for r in rows:
        o = dict(r)
        o["items"] = json.loads(o.get("items_json", "[]"))
        o.pop("items_json", None)
        orders.append(o)

    return {"total": len(orders), "orders": orders}

@app.get("/api/orders/{order_id}", tags=["Orders"])
def get_order_tracking(order_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id.strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    order = dict(row)
    order["items"] = json.loads(order.get("items_json", "[]"))
    order.pop("items_json", None)

    # Tracking timeline milestones
    status_steps = ["Placed", "Confirmed", "Shipped", "Delivered"]
    current_status = order["status"]
    current_index = status_steps.index(current_status) if current_status in status_steps else 1

    order["timeline"] = [
        {"step": s, "completed": idx <= current_index, "current": idx == current_index}
        for idx, s in enumerate(status_steps)
    ]

    return order

@app.patch("/api/orders/{order_id}/status", tags=["Orders"])
def update_order_status(order_id: str, req: UpdateOrderStatusRequest):
    allowed_statuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"]
    if req.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {allowed_statuses}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE order_id = ?", (req.status, order_id.strip()))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    conn.commit()
    conn.close()

    return {"message": f"Order {order_id} status updated to {req.status}"}

# --------------------------------------------------------------------------
# 4. Newsletter Subscription API
# --------------------------------------------------------------------------
@app.post("/api/newsletter", tags=["Newsletter"])
def subscribe_newsletter(req: NewsletterRequest):
    email = req.email.strip().lower()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO subscribers (email) VALUES (?)", (email,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # Already subscribed
    finally:
        conn.close()

    return {"message": "Subscribed successfully to ApexStore VIP Club!"}

# --------------------------------------------------------------------------
# 5. Admin Dashboard Analytics API
# --------------------------------------------------------------------------
@app.get("/api/admin/stats", tags=["Admin"])
def get_admin_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total Sales Revenue & Order Count
    cursor.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE status != 'Cancelled'")
    sales_data = cursor.fetchone()

    # Total Products & Low Stock Alert
    cursor.execute("SELECT COUNT(*) as total_products, SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END) as low_stock_count FROM products")
    prod_data = cursor.fetchone()

    # Total Subscribers
    cursor.execute("SELECT COUNT(*) as total_subscribers FROM subscribers")
    sub_data = cursor.fetchone()

    # Recent 10 Orders
    cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 10")
    recent_orders_rows = cursor.fetchall()
    conn.close()

    recent_orders = []
    for r in recent_orders_rows:
        o = dict(r)
        o["items"] = json.loads(o.get("items_json", "[]"))
        o.pop("items_json", None)
        recent_orders.append(o)

    return {
        "total_revenue": round(sales_data["total_revenue"], 2),
        "total_orders": sales_data["total_orders"],
        "total_products": prod_data["total_products"],
        "low_stock_count": prod_data["low_stock_count"],
        "total_subscribers": sub_data["total_subscribers"],
        "recent_orders": recent_orders
    }

# --------------------------------------------------------------------------
# 6. Static Files & Frontend Serving
# --------------------------------------------------------------------------
# Mount CSS and JS folders
if os.path.exists(os.path.join(BASE_DIR, "css")):
    app.mount("/css", StaticFiles(directory=os.path.join(BASE_DIR, "css")), name="css")
if os.path.exists(os.path.join(BASE_DIR, "js")):
    app.mount("/js", StaticFiles(directory=os.path.join(BASE_DIR, "js")), name="js")

@app.get("/", include_in_schema=False)
def serve_home():
    index_file = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "ApexStore API is live. Visit /docs for API documentation."}

@app.get("/admin.html", include_in_schema=False)
def serve_admin():
    admin_file = os.path.join(BASE_DIR, "admin.html")
    if os.path.exists(admin_file):
        return FileResponse(admin_file)
    return {"message": "Admin dashboard file not found."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
