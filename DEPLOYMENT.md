# TechTrio Deployment Guide

This guide describes how to deploy the **TechTrio** E-commerce application to production. Since this is a portfolio project, we use modern cloud platforms with generous free/low-cost tiers.

```mermaid
graph TD
    Client[Vite Frontend - Vercel] -->|API Requests| Server[Express Backend - Render/Railway]
    Server -->|Read/Write| DB[(PostgreSQL - Neon/Supabase)]
    Server -->|Rate Limiting / Cache| Redis[(Redis - Upstash)]
    Server -->|Image Uploads| Cloudinary[Cloudinary CDN]
    Server -->|Payments| Stripe[Stripe API]
```

---

## 1. Database Setup (Neon PostgreSQL)
1. Sign up for a free PostgreSQL database at [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
2. Create a new project named `TechTrio`.
3. Retrieve your connection string. It should look like:
   ```env
   postgres://alex:your-password@ep-cool-breeze-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. *Note:* You do not need to pre-create any database tables. The backend server automatically initializes and runs migrations (via `createTable.js`) on startup.

---

## 2. Redis Setup (Upstash Redis)
1. Sign up for a free Redis database at [Upstash](https://upstash.com/).
2. Create a new Redis database.
3. Retrieve the `REDIS_URL` (under "Node.js" tab / "iRedis" URI option). It should look like:
   ```env
   rediss://default:yourpassword@charming-ringtail-101834.upstash.io:6379
   ```

---

## 3. Backend Deployment (Render or Railway)
Deploy the Node.js Express server to a web service hosting provider.

### Option A: Render
1. Sign up/Login to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Name:** `techtrio-backend`
   - **Environment:** `Node`
   - **Root Directory:** `server` (crucial so Render runs within the server workspace context)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add the **Environment Variables** in the Render Dashboard (see the table below).

### Option B: Railway
1. Sign up/Login to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub**.
3. Select your repository.
4. Go to service settings -> **Root Directory** and set to `server`.
5. Under **Variables**, add all required backend environment variables.

### Backend Environment Variables
Configure these variables in your hosting provider's Dashboard:

| Key | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Run mode (enables database SSL) | `production` |
| `PORT` | Listening port for server | `10000` (Render provides this automatically) |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://...` |
| `REDIS_URL` | Redis connection URL | `rediss://...` |
| `FRONTEND_URL` | URL of your deployed client app | `https://techtrio-shop.vercel.app` |
| `DASHBOARD_URL` | Additional dashboard URL (or same frontend URL) | `https://techtrio-shop.vercel.app` |
| `JWT_SECRET_KEY` | Secret key for signing user sessions | *[Generate a random long string]* |
| `JWT_EXPIRES_IN` | Token lifespan duration | `30d` |
| `COOKIE_EXPIRES_IN` | Cookie age in days | `30` |
| `CLOUDINARY_CLIENT_NAME` | Cloudinary cloud name | `ddezvg7yc` |
| `CLOUDINARY_CLIENT_API` | Cloudinary API Key | `411256171566756` |
| `CLOUDINARY_CLIENT_SECRET` | Cloudinary API Secret | *[Your Cloudinary Secret]* |
| `STRIPE_PUBLISHABLE_KEY` | Stripe client publishable key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe backend secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification secret | `whsec_...` |
| `SMTP_SERVICE` | Mail provider service | `gmail` |
| `SMTP_HOST` | Mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | Mail server port | `465` |
| `SMTP_MAIL` | Sender email address | `your-email@gmail.com` |
| `SMTP_PASSWORD` | App-specific email password | `your-app-password` |
| `GEMINI_API_KEY` | Google Gemini API Key | *[Your Gemini API Key]* |
| `PINECONE_API_KEY` | Vector database API key | *[Your Pinecone Key]* |
| `PINECONE_INDEX_NAME` | Pinecone vector index name | `techtrio` |

---

## 4. Frontend Deployment (Vercel)
Vercel is the recommended host for the Vite-based React client.

1. Sign up/Login to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository.
4. Set the following project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client` (crucial so Vercel builds within the client workspace context)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Under **Environment Variables**, configure the client variables:

| Key | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL of the deployed Render/Railway server | `https://techtrio-backend.onrender.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe client key | `pk_test_...` |

6. Click **Deploy**. Vercel will build your static files and deploy them to an edge network.

---

## 5. Post-Deployment configuration (Stripe Webhook)
Once both the frontend and backend are successfully deployed:
1. Go to your **Stripe Dashboard** -> **Developers** -> **Webhooks**.
2. Click **Add endpoint**.
3. Set the endpoint URL to: `https://your-backend-url.onrender.com/api/v1/payment/webhook`.
4. Select the event: `checkout.session.completed`.
5. Reveal the signing secret (`whsec_...`) and update your backend deployment's `STRIPE_WEBHOOK_SECRET` variable with this value.
