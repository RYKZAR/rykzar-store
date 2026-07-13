from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated, Any

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from bson import ObjectId
import stripe

# --- Config ---
JWT_ALGO = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]
STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
stripe.api_key = STRIPE_API_KEY

# --- DB ---
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# --- App ---
app = FastAPI(title="RYKZAR API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rykzar")


# --- Helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=True, samesite="none", max_age=7 * 24 * 3600, path="/",
    )


# --- Schemas ---
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    name: str
    description: str
    price: float
    category: str  # hoodies, tees, outerwear, pants, accessories
    images: List[str] = []
    sizes: List[str] = ["S", "M", "L", "XL"]
    colors: List[str] = ["#0B0B0B"]
    stock: int = 100
    featured: bool = False
    best_seller: bool = False
    new_arrival: bool = False


class ProductOut(ProductIn):
    id: str
    created_at: str


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)
    size: str
    color: str


class CheckoutIn(BaseModel):
    items: List[CartItem]
    origin_url: str


# --- Startup ---
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@rykzar.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "RYKZAR Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )

    # Seed products if empty
    count = await db.products.count_documents({})
    if count == 0:
        await seed_products()


async def seed_products():
    hoodie_m = "https://images.unsplash.com/photo-1673092147872-5ddb03194341?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
    hoodie_w = "https://images.unsplash.com/photo-1633292750937-120a94f5c2bb?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
    featured = "https://images.unsplash.com/photo-1575354196644-9de51010f481?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
    brand_story = "https://images.unsplash.com/photo-1763504015875-7ecef998af64?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"

    seeds = [
        {
            "name": "OBSIDIAN HOODIE", "description": "Heavyweight oversized hoodie in matte black. Constructed from 500 GSM brushed cotton with a raised RYKZAR sigil.",
            "price": 189.00, "category": "hoodies", "images": [hoodie_m, featured, brand_story],
            "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["#0B0B0B", "#1A1A1A"],
            "stock": 40, "featured": True, "best_seller": True, "new_arrival": False,
        },
        {
            "name": "CRIMSON EYE TEE", "description": "Boxy fit t-shirt with embroidered blood-red horse. 100% Supima cotton.",
            "price": 79.00, "category": "tees", "images": [featured, hoodie_m],
            "sizes": ["S", "M", "L", "XL"], "colors": ["#0B0B0B"],
            "stock": 120, "featured": True, "best_seller": True, "new_arrival": True,
        },
        {
            "name": "RIDER'S SHELL JACKET", "description": "Waterproof technical shell with red-glow reflective piping. Storm hood, articulated sleeves.",
            "price": 349.00, "category": "outerwear", "images": [hoodie_w, brand_story],
            "sizes": ["S", "M", "L", "XL"], "colors": ["#0B0B0B"],
            "stock": 25, "featured": True, "best_seller": False, "new_arrival": True,
        },
        {
            "name": "SIGIL CARGO PANTS", "description": "Relaxed technical cargo with hidden utility pockets. Ripstop cotton blend.",
            "price": 219.00, "category": "pants", "images": [hoodie_m, hoodie_w],
            "sizes": ["28", "30", "32", "34", "36"], "colors": ["#0B0B0B", "#1A1A1A"],
            "stock": 60, "featured": False, "best_seller": True, "new_arrival": False,
        },
        {
            "name": "LEGACY BOMBER", "description": "Cropped bomber with satin lining. Embroidered horse on back panel.",
            "price": 279.00, "category": "outerwear", "images": [hoodie_w, featured],
            "sizes": ["S", "M", "L", "XL"], "colors": ["#0B0B0B"],
            "stock": 30, "featured": True, "best_seller": False, "new_arrival": True,
        },
        {
            "name": "MYSTERY LONGSLEEVE", "description": "Ribbed longsleeve with tonal RYKZAR wordmark down the sleeve.",
            "price": 99.00, "category": "tees", "images": [hoodie_m, hoodie_w],
            "sizes": ["S", "M", "L", "XL"], "colors": ["#0B0B0B", "#1A1A1A"],
            "stock": 80, "featured": False, "best_seller": True, "new_arrival": True,
        },
        {
            "name": "LOYALTY CAP", "description": "Structured 6-panel cap with metal horse emblem. Adjustable strap.",
            "price": 65.00, "category": "accessories", "images": [featured, brand_story],
            "sizes": ["ONE SIZE"], "colors": ["#0B0B0B"],
            "stock": 100, "featured": False, "best_seller": True, "new_arrival": False,
        },
        {
            "name": "FREEDOM SWEATPANTS", "description": "Fleece-lined heavyweight sweats with tapered leg. Signature red drawcord.",
            "price": 149.00, "category": "pants", "images": [hoodie_w, hoodie_m],
            "sizes": ["S", "M", "L", "XL"], "colors": ["#0B0B0B", "#1A1A1A"],
            "stock": 70, "featured": True, "best_seller": False, "new_arrival": True,
        },
    ]
    now = datetime.now(timezone.utc).isoformat()
    for s in seeds:
        s["_id"] = ObjectId()
        s["created_at"] = now
    await db.products.insert_many(seeds)
    logger.info(f"Seeded {len(seeds)} products")


def product_to_out(p: dict) -> dict:
    return {
        "id": str(p["_id"]),
        "name": p["name"],
        "description": p["description"],
        "price": p["price"],
        "category": p["category"],
        "images": p.get("images", []),
        "sizes": p.get("sizes", []),
        "colors": p.get("colors", []),
        "stock": p.get("stock", 0),
        "featured": p.get("featured", False),
        "best_seller": p.get("best_seller", False),
        "new_arrival": p.get("new_arrival", False),
        "created_at": p.get("created_at", ""),
    }


# --- Auth Endpoints ---
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    user_doc = {
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id, email, "customer")
    set_auth_cookie(response, token)
    return {"id": user_id, "email": email, "name": body.name, "role": "customer", "token": token}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    user_id = str(user["_id"])
    token = create_access_token(user_id, email, user.get("role", "customer"))
    set_auth_cookie(response, token)
    return {
        "id": user_id, "email": email, "name": user.get("name"),
        "role": user.get("role", "customer"), "token": token,
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# --- Products ---
@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    q: Optional[str] = None,
):
    query: dict = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if best_seller is not None:
        query["best_seller"] = best_seller
    if new_arrival is not None:
        query["new_arrival"] = new_arrival
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    docs = await db.products.find(query).to_list(200)
    return [product_to_out(d) for d in docs]


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    try:
        doc = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(400, "Invalid product id")
    if not doc:
        raise HTTPException(404, "Product not found")
    return product_to_out(doc)


@api.post("/products")
async def create_product(body: ProductIn, admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["_id"] = ObjectId()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    return product_to_out(doc)


@api.put("/products/{product_id}")
async def update_product(product_id: str, body: ProductIn, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(400, "Invalid product id")
    updates = body.model_dump()
    result = await db.products.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "Not found")
    doc = await db.products.find_one({"_id": oid})
    return product_to_out(doc)


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(400, "Invalid product id")
    await db.products.delete_one({"_id": oid})
    return {"ok": True}


# --- Checkout ---
@api.post("/checkout/session")
async def create_checkout_session(body: CheckoutIn, request: Request):
    # Fetch products from DB and calculate total server-side
    if not body.items:
        raise HTTPException(400, "Cart is empty")

    ids = []
    for it in body.items:
        try:
            ids.append(ObjectId(it.product_id))
        except Exception:
            raise HTTPException(400, "Invalid product id in cart")

    products = await db.products.find({"_id": {"$in": ids}}).to_list(200)
    price_map = {str(p["_id"]): p for p in products}

    total = 0.0
    line_summary = []
    for it in body.items:
        p = price_map.get(it.product_id)
        if not p:
            raise HTTPException(400, f"Product {it.product_id} not found")
        subtotal = float(p["price"]) * it.quantity
        total += subtotal
        line_summary.append(f"{p['name']} ({it.size}) x{it.quantity}")

    total = round(total, 2)

    # Try to get current user (optional)
    user_email = None
    user_id = None
    try:
        current = await get_current_user(request)
        user_email = current.get("email")
        user_id = current.get("id")
    except HTTPException:
        pass

    success_url = f"{body.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{body.origin_url}/cart"

    metadata = {
        "source": "rykzar_web",
        "items_summary": " | ".join(line_summary)[:400],
    }
    if user_email:
        metadata["user_email"] = user_email
    if user_id:
        metadata["user_id"] = user_id

    line_items = [{
        "price_data": {
            "currency": "usd",
            "product_data": {"name": "RYKZAR Order"},
            "unit_amount": int(round(total * 100)),
        },
        "quantity": 1,
    }]

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )

    # Save transaction
    tx = {
        "session_id": session.id,
        "amount": total,
        "currency": "usd",
        "status": "initiated",
        "payment_status": "pending",
        "metadata": metadata,
        "items": [it.model_dump() for it in body.items],
        "user_email": user_email,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(tx)

    return {"url": session.url, "session_id": session.id}


@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    session = stripe.checkout.Session.retrieve(session_id)

    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if tx and tx.get("payment_status") != "paid" and session.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": session.status, "payment_status": session.payment_status}},
        )
        # Create order
        order = {
            "session_id": session_id,
            "user_email": tx.get("user_email"),
            "user_id": tx.get("user_id"),
            "items": tx.get("items", []),
            "amount": tx.get("amount"),
            "currency": tx.get("currency"),
            "status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.orders.insert_one(order)

    return {
        "status": session.status,
        "payment_status": session.payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency,
    }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    try:
        event = stripe.Webhook.construct_event(body, sig, STRIPE_WEBHOOK_SECRET)
        obj = event["data"]["object"]
        session_id = obj.get("id")
        payment_status = obj.get("payment_status")
        if session_id and payment_status:
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": payment_status, "event_type": event["type"]}},
            )
    except Exception as e:
        logger.error(f"Webhook error: {e}")
    return {"received": True}


# --- Orders / Admin ---
@api.get("/orders/me")
async def my_orders(user: dict = Depends(get_current_user)):
    docs = await db.orders.find({"user_email": user["email"]}).sort("created_at", -1).to_list(100)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api.get("/admin/orders")
async def admin_orders(admin: dict = Depends(require_admin)):
    docs = await db.orders.find({}).sort("created_at", -1).to_list(500)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({"role": "customer"})
    revenue_agg = await db.orders.aggregate([
        {"$match": {"status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]).to_list(1)
    revenue = revenue_agg[0]["total"] if revenue_agg else 0
    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "total_users": total_users,
        "revenue": round(revenue, 2),
    }


@api.get("/health")
async def health():
    return {"status": "ok", "brand": "RYKZAR"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
