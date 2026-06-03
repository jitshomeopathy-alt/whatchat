require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const webhookRouter = require('./routes/webhook');
const adminRouter = require('./routes/admin');
const { initCollection } = require('./services/qdrant');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, '../public')));

// ── Routes ──────────────────────────────────────────────────────────────────────

app.use('/webhook', webhookRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Root — serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Database connections & startup ─────────────────────────────────────────────

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatchat';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('[MongoDB] Connected to', mongoUri);
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }

  // Initialise Qdrant collection
  try {
    await initCollection();
    console.log('[Qdrant] Collection ready');
  } catch (err) {
    console.warn('[Qdrant] Collection init warning (continuing):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`[Server] WhatChat running on port ${PORT}`);
    console.log(`[Server] Webhook: POST /webhook`);
    console.log(`[Server] Admin:   /admin/medicines`);
    console.log(`[Server] Health:  /health`);
  });
}

start();

module.exports = app;
