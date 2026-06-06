# TechTrio — Premium Electronics & Gadgets Store

TechTrio is a high-end, modern enterprise-consumer e-commerce system built for performance and modern visual aesthetics. The storefront features a white-paper layout anchored by HP Electric Blue accent signal CTAs, geometric typography, and glassmorphic navigation.

---

## 🚀 Key Features

### 🛒 Storefront & Checkout
- **Horizontal Product Filters & Sorting**: Refined filter bar featuring category selection, price ranges, and sorting rules that collapse into a responsive drawer on mobile.
- **Visual Stepper Fulfillment Timeline**: Customers can track their order lifecycle (`Processing` ➔ `Shipped` ➔ `Delivered`) via an interactive progress bar inside their profile dashboard.
- **Secure Stripe Integration**: Streamlined checkout flow utilizing Stripe Elements and automated webhook processing (`payment_intent.succeeded`).
- **AI Chatbot**: Intelligent chatbot assistant present across customer-facing routes to resolve product questions.

### 📊 Admin Panel & Dashboard
- **Bento Grid Layout**: A sleek dashboard layout displaying business metrics (Total Sales, Total Income, Active Customers, Conversion Trends) side-by-side.
- **Fulfillment Action Queue**: A prioritized "Processing Orders" task queue displaying orders that need immediate fulfillment with a direct action CTA.
- **Interactive Visual Analytics**: Area charts rendering sales metrics over time using Recharts.
- **Automated Stock Management & Alerts**: Banner alerts warning admins when item stock levels fall below critical thresholds.

---

## 🛠️ Technology Stack

### Frontend
- **Core**: React 19, Vite, React Router 7
- **Styling**: Vanilla CSS (HP Electric Blue and steel-paper theme)
- **Charts & Motion**: Recharts, Framer Motion, React Icons
- **Payments**: Stripe React SDK (`@stripe/stripe-js`)

### Backend
- **Core**: Node.js, Express 5
- **Database**: PostgreSQL (Raw SQL queries, connection pooling)
- **Caching & Rate Limiting**: Redis, `express-rate-limit`
- **Validators & Uploads**: Zod schemas, Cloudinary SDK
- **Mailing**: Nodemailer (HTML order fulfillment status notifications)

---

## ⚙️ Environment Configuration

Create a `config.env` file under `server/config/config.env` with the following variables:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DASHBOARD_URL=http://localhost:5174

# Authentication
JWT_SECRET_KEY=your_jwt_secret_key
JWT_EXPIRES_IN=30d
COOKIE_EXPIRES_IN=30

# Database
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=your_db_password
DB_NAME=TechTrio

# Redis
REDIS_URL=redis://localhost:6379

# Email Config
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_MAIL=your_gmail_address
SMTP_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLIENT_NAME=your_cloudinary_name
CLOUDINARY_CLIENT_API=your_cloudinary_key
CLOUDINARY_CLIENT_SECRET=your_cloudinary_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 💻 Local Development

### 1. Database Setup
Ensure PostgreSQL and Redis are running locally. Run the database seeding command to set up tables and configure the default admin account:
```bash
cd server
npm run seed:admin
```

### 2. Run Backend Server
```bash
cd server
npm run dev
```

### 3. Run Frontend Storefront
```bash
cd client
npm run dev
```

### 4. Stripe Webhook Listener
To test payment flows locally, start the Stripe CLI tunnel:
```bash
stripe listen --forward-to localhost:4000/api/v1/payment/webhook
```
*(Note: In development mode, Stripe signature verification failures are bypassed to allow seamless testing of standard raw webhook events.)*
