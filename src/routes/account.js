const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const customerAuth = require('../middleware/customerAuth');

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(customer) {
  return jwt.sign(
    { role: 'customer', sub: String(customer._id), email: customer.email, name: customer.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Shape a customer document for the client (never leak the password hash).
function publicCustomer(c) {
  return {
    id: String(c._id),
    email: c.email,
    name: c.name,
    phone: c.phone || '',
    address: c.address || {},
    createdAt: c.createdAt,
  };
}

/**
 * POST /api/account/register
 * Body: { name, email, password, phone? }
 */
router.post('/register', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server auth is not configured (JWT_SECRET missing)' });
    }
    const { name, email, password, phone } = req.body || {};

    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !EMAIL_RX.test(String(email).trim())) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await Customer.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const customer = await Customer.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? String(phone).trim() : '',
    });

    return res.status(201).json({ token: signToken(customer), customer: publicCustomer(customer) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'An account with this email already exists' });
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/account/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server auth is not configured (JWT_SECRET missing)' });
    }
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const customer = await Customer.findOne({ email: String(email).trim().toLowerCase() });
    if (!customer) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(String(password), customer.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    return res.json({ token: signToken(customer), customer: publicCustomer(customer) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── All routes below require a customer token ───────────────────────────────────

/**
 * GET /api/account/me
 * Current customer's profile.
 */
router.get('/me', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.sub);
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    return res.json({ customer: publicCustomer(customer) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/account/me
 * Update profile. Body: partial { name, phone, address: {...} }
 * Email and password are intentionally not editable here.
 */
router.put('/me', customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.sub);
    if (!customer) return res.status(404).json({ error: 'Account not found' });

    const { name, phone, address } = req.body || {};
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: 'Name cannot be empty' });
      customer.name = String(name).trim();
    }
    if (phone !== undefined) customer.phone = String(phone || '').trim();
    if (address && typeof address === 'object') {
      const a = customer.address || {};
      for (const key of ['line1', 'line2', 'city', 'state', 'pincode']) {
        if (address[key] !== undefined) a[key] = String(address[key] || '').trim();
      }
      customer.address = a;
    }
    customer.updatedAt = new Date();
    await customer.save();

    return res.json({ customer: publicCustomer(customer) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/account/orders
 * Current customer's orders, newest first.
 */
router.get('/orders', customerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customer.sub })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ total: orders.length, data: orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/account/orders/:id
 * A single order, scoped to the current customer.
 */
router.get('/orders/:id', customerAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.customer.sub }).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Order not found' });
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
