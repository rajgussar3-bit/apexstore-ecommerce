# 🚀 ApexStore - Vercel & Render Deployment Guide

Follow this simple 2-step process to deploy your full-stack E-Commerce application live on the internet with free hosting.

---

## 🌟 Step 1: Deploy Backend on Render.com (Free)

1. Sign up / Log in to [Render.com](https://render.com) (Log in with GitHub).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository containing the `ecommerce-store` folder.
4. Fill in these settings:
   - **Name**: `apexstore-backend`
   - **Root Directory**: `ecommerce-store/backend` (or `backend`)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Once deployed, Render will provide a live URL like:
   `https://apexstore-backend.onrender.com`

---

## 🌟 Step 2: Deploy Frontend on Vercel (Free)

1. Open `ecommerce-store/js/config.js` and paste your Render URL:
   ```javascript
   window.APEX_CONFIG = {
     API_BASE_URL: "https://your-render-app-name.onrender.com"
   };
   ```
2. Log in to [Vercel.com](https://vercel.com) (Log in with GitHub).
3. Click **Add New...** → **Project**.
4. Import your GitHub repository.
5. In **Root Directory**, click *Edit* and select: `ecommerce-store`.
6. Click **Deploy**!
7. Vercel will instantly generate a live HTTPS URL like:
   `https://apexstore.vercel.app`

---

## 🎉 Done!
Your storefront will be live on Vercel and seamlessly communicating with the FastAPI SQLite backend on Render!
