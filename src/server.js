require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const webhookRouter = require('./routes/webhook');
const adminRouter = require('./routes/admin');
const publicRouter = require('./routes/public');
const shopRouter = require('./routes/shop');
const accountRouter = require('./routes/account');
const { initCollection } = require('./services/qdrant');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBSITE_DIR = path.join(__dirname, '../website');

// ── Middleware ──────────────────────────────────────────────────────────────────

// Capture the raw body so webhook signatures (e.g. Razorpay) can be verified.
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Admin UI pages (static HTML that fetch the protected APIs with a bearer token).
// Registered before the static + API middleware so the clean URLs resolve to the
// pages with a 200, while the data endpoints (/admin/token, /admin/users,
// /admin/medicines, ...) still fall through to the API router below.
//
// Some page URLs collide with a data endpoint of the same path (e.g. the page
// /admin/stories and the API GET /admin/stories). `adminPage` disambiguates:
// authenticated fetches carry a Bearer token → fall through to the API router;
// plain browser navigation has no Authorization header → serve the HTML page.
function adminPage(file) {
  return (req, res, next) => {
    if (req.headers.authorization) return next();
    res.sendFile(path.join(WEBSITE_DIR, file));
  };
}

app.get('/admin', adminPage('admin/index.html'));
app.get('/admin/login', adminPage('admin/login.html'));
app.get('/admin/user', adminPage('admin/user.html'));
app.get('/admin/messages', adminPage('admin/messages.html'));
app.get('/admin/stories', adminPage('admin/stories.html'));
app.get('/admin/story-edit', adminPage('admin/story-edit.html'));
app.get('/admin/products', adminPage('admin/products.html'));
app.get('/admin/product-edit', adminPage('admin/product-edit.html'));
app.get('/admin/orders', adminPage('admin/orders.html'));
app.get('/admin/order', adminPage('admin/order.html'));

// Serve static files from /public (assets, if any)
app.use(express.static(path.join(__dirname, '../public')));

// Serve website assets (shared stylesheet, images, .html files)
app.use(express.static(WEBSITE_DIR));

// ── Database (lazy, serverless-safe) ────────────────────────────────────────────
// On serverless platforms (Vercel) the module is required on every cold start.
// We must NOT connect at import time or call process.exit — that crashes the
// function and returns a 500 before any route runs. Instead connect on demand
// and cache the promise so warm invocations reuse the same connection.

let dbPromise = null;

function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!dbPromise) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatchat';
    dbPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((conn) => {
        console.log('[MongoDB] Connected');
        return conn;
      })
      .catch((err) => {
        dbPromise = null; // allow a later request to retry
        console.error('[MongoDB] Connection failed:', err.message);
        throw err;
      });
  }
  return dbPromise;
}

// Gate DB-backed routes behind a live connection. Static pages never hit this,
// so the website keeps loading even if the database is down.
async function requireDB(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

// ── Routes ──────────────────────────────────────────────────────────────────────

app.use('/webhook', requireDB, webhookRouter);
app.use('/admin', requireDB, adminRouter);
app.use('/api/shop', requireDB, shopRouter);
app.use('/api/account', requireDB, accountRouter);
app.use('/api', requireDB, publicRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── Website pages ─────────────────────────────────────────────────────────────
const pages = {
  '/': 'index.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/privacy': 'privacy.html',
  '/terms': 'terms.html',
  '/stories': 'stories.html',
  '/shop': 'shop.html',
  '/product': 'product.html',
  '/cart': 'cart.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/account': 'account.html',
  '/order': 'order.html',
};

for (const [route, file] of Object.entries(pages)) {
  app.get(route, (req, res) => res.sendFile(path.join(WEBSITE_DIR, file)));
  // Also allow the .html form so direct links keep working.
  if (route !== '/') app.get(`${route}.html`, (req, res) => res.sendFile(path.join(WEBSITE_DIR, file)));
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Startup ─────────────────────────────────────────────────────────────────────
// Only listen / bootstrap when run directly (local dev or a normal Node host).
// On Vercel the platform imports `app` and invokes it per-request, so we must
// not call app.listen there.

if (require.main === module) {
  // Start listening immediately so the website serves even before (or without)
  // a database connection. DB/Qdrant are warmed up in the background.
  app.listen(PORT, () => {
    console.log(`[Server] WhatChat running on port ${PORT}`);
    console.log(`[Server] Webhook: POST /webhook`);
    console.log(`[Server] Admin:   /admin/medicines`);
    console.log(`[Server] Health:  /health`);
  });

  connectDB().catch((err) =>
    console.error('[MongoDB] Initial connection failed:', err.message)
  );

  initCollection()
    .then(() => console.log('[Qdrant] Collection ready'))
    .catch((err) =>
      console.warn('[Qdrant] Collection init warning (continuing):', err.message)
    );
}

module.exports = app;
