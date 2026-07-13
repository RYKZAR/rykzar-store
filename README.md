# RYKZAR — Full Project (Mandiri, Tanpa Emergent)

Project e-commerce lengkap: FastAPI (backend) + React (frontend) + MongoDB.
Semua dependensi khusus Emergent (`emergentintegrations`, script tracking, badge) sudah dihapus/diganti supaya bisa jalan di server manapun.

## Struktur
```
backend/     -> FastAPI + MongoDB + Stripe (official SDK)
frontend/    -> React (CRA + craco) + Tailwind
```

## 1. Jalankan di Laptop (Local)

### Syarat
- Python 3.10+
- Node.js 18+ dan Yarn (`npm install -g yarn`)
- MongoDB (bisa install lokal, atau pakai MongoDB Atlas gratis — lihat bagian bawah)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Edit `backend/.env`:
- `MONGO_URL` — isi dengan connection string MongoDB kamu (lokal atau Atlas)
- `STRIPE_API_KEY` — ambil dari https://dashboard.stripe.com/test/apikeys (pakai yang "Secret key", mode Test)
- `STRIPE_WEBHOOK_SECRET` — opsional untuk awal, dari Stripe CLI atau dashboard webhook

Jalankan:
```bash
uvicorn server:app --reload --port 8000
```
Backend akan jalan di `http://localhost:8000`. Cek `http://localhost:8000/api/health`.

### Frontend
```bash
cd frontend
yarn install
yarn start
```
Buka `http://localhost:3000`.

Login admin (sudah auto-seed saat backend pertama kali start):
- Email: `admin@rykzar.com`
- Password: `Admin@Rykzar2026`

## 2. MongoDB Gratis (kalau tidak mau install lokal)
1. Daftar di https://www.mongodb.com/cloud/atlas/register (gratis, tier M0)
2. Buat cluster gratis → "Connect" → "Drivers" → copy connection string
3. Paste ke `MONGO_URL` di `backend/.env`, ganti `<password>` dengan password database kamu

## 3. Deploy Gratis/Murah (biar online, tanpa Emergent)

**Frontend** → Vercel atau Netlify (gratis)
- Push folder ini ke GitHub
- Import project di vercel.com, set Root Directory ke `frontend`
- Set environment variable `REACT_APP_BACKEND_URL` = URL backend kamu (langkah berikutnya)

**Backend** → Render.com (gratis untuk mulai) atau Railway.app
- Buat "Web Service" baru, root directory `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Isi semua environment variable dari `.env` di dashboard Render/Railway

**Database** → MongoDB Atlas (langkah di atas)

Setelah backend online, update `REACT_APP_BACKEND_URL` di Vercel ke URL backend Render/Railway kamu, lalu redeploy frontend.

## 4. Stripe Test Card
Kartu test: `4242 4242 4242 4242`, tanggal apa saja di masa depan, CVC apa saja.

## Catatan
- Semua foto produk masih pakai URL Unsplash sementara — ganti dengan foto produk asli kamu lewat Admin Panel.
- Fitur Phase 2 (wishlist, review, Instagram gallery, coupon, dll) belum dikerjakan.
