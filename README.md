# 🍔 FoodDash Enterprise — Next-Gen 3D Food Delivery Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?logo=stripe&logoColor=white)](https://stripe.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Service_Worker-purple?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

An enterprise-grade, cross-platform food ordering and restaurant management solution featuring hardware-accelerated **3D WebGL visuals**, interactive card physics, dual **Web + Native Desktop (Electron)** runtime environments, real-time **Supabase PostgreSQL** database sync with Row-Level Security (RLS), and a Node.js API backend for Stripe payments and Resend transactional emails.

---

## 🌟 Key Features

### 🎨 3D WebGL Visual Experience
- **Interactive 3D Hero Canvases:** Dynamic Three.js particle systems, floating geometries, lighting effects, and cursor tracking across Dashboard, Login, Signup, Forgot Password, and 404 pages.
- **Hardware-Accelerated Tilt Cards:** Real-time 3D tilt response and specular lighting physics on restaurant listing cards.
- **Zomato-Inspired Premium UI:** Deep dark-mode aesthetics, custom glassmorphism design tokens (`backdrop-filter`), neon highlights, micro-animations, and smooth page transitions.

### 🖥️ Native Enterprise Desktop Application (Electron)
- **Frameless Window Management:** Custom draggable titlebar with minimize, maximize, pin-on-top (`📌`), and close controls.
- **Hardware POS Printer Bridge:** Direct thermal receipt printer detection via native Electron IPC (`getPrinters()`).
- **Real-Time System Bar:** Monospace status bar displaying connection health, live network ping (ms), JS heap memory footprint (MB), and keyboard shortcuts (`Ctrl+Shift+O/P/M`).

### 🛍️ Customer Experience & Ordering
- **Real-Time Search & Category Filters:** Search by cuisine, dish, or restaurant name; filter by Rating 4.0+, Fast Delivery (≤30 min), or Veg Only.
- **Interactive Cart Sidebar:** Sliding cart panel with quantity controls, coupon promo engine (`FOODDASH10` for 10% off), delivery time estimator, and bill breakdown (subtotal, delivery fee, GST).
- **Multi-Method Checkout:** Support for Credit/Debit Cards (Stripe), Cash on Delivery, JazzCash, and EasyPaisa.
- **Live Order Tracking:** Real-time visual progress tracker with interactive timeline (Pending ➔ Preparing ➔ Picked Up ➔ Delivered).

### ⚙️ Multi-Role Access Control (RLS Enforced)
- **Customer Role:** Browse menus, manage cart, place orders, write reviews, and track live status.
- **Admin Role:** Manage restaurants, add/edit menu items, inspect revenue metrics, and update order statuses.
- **Delivery Rider Role:** View assigned delivery routes, accept orders, and update real-time delivery progress.

---

## 🏗️ System Architecture

```
FoodDash System
├── 🌐 React 18 + Vite (Frontend Web App & PWA)
│   ├── Three.js WebGL Canvases (Food3DHeroCanvas, LoginHeroCanvas, etc.)
│   ├── Lucide Iconography & Custom CSS Design Tokens (index.css)
│   └── Context Providers (AuthContext, CartContext)
│
├── 🖥️ Electron Runtime (Desktop App)
│   ├── main.cjs (Main Process - IPC, Frameless Window, Tray)
│   └── preload.cjs (Context Bridge - Native Printer & Hotkeys)
│
├── 🗄️ Supabase PostgreSQL (Database & Auth)
│   ├── Complete Schema (users, restaurants, food_items, cart, orders, etc.)
│   └── Row-Level Security (RLS Policies per role)
│
└── ⚡ Node.js / Express (Backend API Server)
    ├── /create-payment-intent (Stripe Payment API)
    ├── /refund (Automated Cancellation Refunds)
    └── /order-receipt (Resend Transactional Email Receipts)
```

---

## 🛠️ Getting Started

### 📋 Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### 📥 1. Clone the Repository
```bash
git clone https://github.com/muhammadayantoorie-creator/Foody.git
cd Foody
```

### 📦 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 🔑 3. Environment Setup
Create a `.env` file in the root directory:
```env
# ─── Supabase Configuration ───────────────────────
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (your public anon key)

# ─── Optional API URL ──────────────────────────────
VITE_API_URL=http://localhost:4242
```

Create a `.env` file inside the `backend/` directory:
```env
PORT=4242
STRIPE_SECRET_KEY=sk_test_... (your Stripe secret key)
RESEND_API_KEY=re_... (your Resend API key)
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## 🗄️ Database Setup (Supabase)

1. Navigate to your [Supabase Dashboard](https://supabase.com) ➔ **SQL Editor**.
2. Run `COMPLETE_SCHEMA.sql` to create all tables and default structure.
3. Run `COMPLETE_RLS.sql` to enable Row-Level Security policies.
4. *(Optional)* Run `CREATE_DEMO_USERS.sql` to populate sample restaurants, menu items, and demo accounts.

---

## 🚀 Running the Application

### 🌐 Web Application (Vite Dev Server)
```bash
npm run dev
# Open http://localhost:5173
```

### ⚡ Backend API Server (Node.js Express)
```bash
node backend/server.js
# Health check at http://localhost:4242/health
```

### 🖥️ Native Desktop Application (Electron)
```bash
npx electron .
```

---

## 📦 Building for Production

### Build Web Frontend & PWA
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory, including PWA manifest and Workbox service worker (`dist/sw.js`).

---

## 📄 License
This project is licensed under the MIT License — feel free to customize and expand for your enterprise needs.

---

<p align="center">
  Built with ❤️ using <strong>React</strong>, <strong>Three.js</strong>, <strong>Electron</strong>, <strong>Supabase</strong> & <strong>Stripe</strong>
</p>
