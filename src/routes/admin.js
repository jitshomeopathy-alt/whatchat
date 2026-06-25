const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { randomUUID: uuidv4 } = require('crypto');
const adminAuth = require('../middleware/adminAuth');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const AnalysisHistory = require('../models/AnalysisHistory');
const Story = require('../models/Story');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { upsertMedicine, deleteMedicine } = require('../services/qdrant');
const { uploadImage } = require('../services/imagekit');
const { sendText } = require('../services/whatsapp');

// In-memory upload handling for story photos (5MB cap, images only).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

const path = require('path');
const fs = require('fs');

// ── Token endpoint (not protected) ─────────────────────────────────────────────

/**
 * POST /admin/token
 * Exchange ADMIN_SECRET for a signed JWT with admin role.
 * Body: { secret: string }
 */
router.post('/token', (req, res) => {
  const { secret } = req.body || {};

  if (!process.env.ADMIN_SECRET || !process.env.JWT_SECRET) {
    console.error('[Admin] Missing ADMIN_SECRET or JWT_SECRET in environment');
    return res.status(500).json({ error: 'Server auth is not configured (ADMIN_SECRET / JWT_SECRET missing)' });
  }

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  try {
    const token = jwt.sign({ role: 'admin', sub: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.json({ token, expiresIn: '24h' });
  } catch (err) {
    console.error('[Admin] Token signing failed:', err.message);
    return res.status(500).json({ error: 'Failed to issue admin token' });
  }
});

// ── All routes below require admin JWT ────────────────────────────────────────

/**
 * GET /admin/users
 * Paginated list of registered users (newest first).
 * Optional ?q= filters by name / email / whatsappId.
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const q = (req.query.q || '').trim();

    const filter = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { whatsappId: rx }];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/users/:id
 * A single user's profile plus their consultation history (answers, the AI
 * result shown to them, and the internal medicine suggestions).
 */
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = await AnalysisHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ user, history });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/messages/send
 * Send a custom free-text WhatsApp message to one or more users.
 * Body: { recipients: string[], message: string }
 *   - recipients: array of WhatsApp numbers (whatsappId) to send to.
 *   - message:    the custom text to send (1-4096 chars; longer is auto-chunked).
 *
 * NOTE (WhatsApp policy): free-text messages only deliver to users who have
 * messaged the bot within the last 24h (the "customer service window"). Outside
 * that window Meta drops the message unless it's a pre-approved template — those
 * errors are surfaced per-recipient in the `results` array below.
 */
router.post('/messages/send', adminAuth, async (req, res) => {
  try {
    const { recipients, message } = req.body || {};

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'recipients must be a non-empty array of numbers' });
    }
    const text = String(message || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'message is required' });
    }

    // De-duplicate and keep only non-empty numbers.
    const numbers = [...new Set(recipients.map((r) => String(r || '').trim()).filter(Boolean))];
    if (numbers.length === 0) {
      return res.status(400).json({ error: 'No valid recipient numbers provided' });
    }

    // Send sequentially so we stay well under Meta's rate limits and can report
    // a precise per-recipient outcome.
    const results = [];
    for (const to of numbers) {
      try {
        await sendText(to, text);
        results.push({ to, status: 'sent' });
      } catch (err) {
        console.error(`[Admin] Message send failed for ${to}:`, err.message);
        results.push({ to, status: 'failed', error: err.message });
      }
    }

    const sent = results.filter((r) => r.status === 'sent').length;
    const failed = results.length - sent;

    return res.json({ total: results.length, sent, failed, results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


/**
 * POST /admin/medicines/seed
 * Bulk seed medicines from /data/medicines_seed.json
 */
router.post('/medicines/seed', adminAuth, async (req, res) => {
  try {
    const seedPath = path.join(__dirname, '../../data/medicines_seed.json');

    if (!fs.existsSync(seedPath)) {
      return res.status(404).json({ error: 'Seed file not found at data/medicines_seed.json' });
    }

    const raw = fs.readFileSync(seedPath, 'utf8');
    const medicines = JSON.parse(raw);

    if (!Array.isArray(medicines)) {
      return res.status(400).json({ error: 'Seed file must be a JSON array' });
    }

    const results = [];
    const errors = [];

    for (const med of medicines) {
      try {
        // Assign a unique qdrantId if not present
        const qdrantId = med.qdrantId || uuidv4();
        const medicineData = {
          qdrantId,
          name: med.name,
          description: med.description,
          category: med.category,
          tags: med.tags || [],
          keynotes: med.keynotes || null,
          source: med.source || '',
        };

        // Upsert in MongoDB
        await Medicine.findOneAndUpdate({ qdrantId }, { ...medicineData, updatedAt: new Date() }, { upsert: true });

        // Upsert in Qdrant
        await upsertMedicine(medicineData);

        results.push({ name: med.name, qdrantId, status: 'ok' });
      } catch (err) {
        console.error(`[Admin] Seed error for ${med.name}:`, err.message);
        errors.push({ name: med.name, error: err.message });
      }
    }

    return res.json({
      seeded: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (err) {
    console.error('[Admin] Seed error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/medicines
 * List all medicines from MongoDB.
 */
router.get('/medicines', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const category = req.query.category;

    const filter = {};
    if (category) filter.category = category;

    const total = await Medicine.countDocuments(filter);
    const medicines = await Medicine.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: medicines,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/medicines
 * Add a single medicine.
 * Body: { name, description, category, tags, keynotes, source }
 */
router.post('/medicines', adminAuth, async (req, res) => {
  try {
    const { name, description, category, tags, keynotes, source } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'name, description, and category are required' });
    }

    const allowedCategories = ['physical', 'mental', 'chronic'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${allowedCategories.join(', ')}` });
    }

    const qdrantId = uuidv4();

    const medicineData = {
      qdrantId,
      name: name.trim(),
      description: description.trim(),
      category,
      tags: Array.isArray(tags) ? tags : [],
      keynotes: keynotes || null,
      source: source || '',
    };

    const medicine = await Medicine.create({ ...medicineData, updatedAt: new Date() });
    await upsertMedicine(medicineData);

    return res.status(201).json(medicine);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A medicine with this qdrantId already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /admin/medicines/:id
 * Update a medicine by MongoDB _id.
 * Body: partial { name, description, category, tags, keynotes, source }
 */
router.put('/medicines/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, tags, keynotes, source } = req.body;

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    if (category) {
      const allowedCategories = ['physical', 'mental', 'chronic'];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: `category must be one of: ${allowedCategories.join(', ')}` });
      }
    }

    // Apply updates
    if (name) medicine.name = name.trim();
    if (description) medicine.description = description.trim();
    if (category) medicine.category = category;
    if (tags) medicine.tags = Array.isArray(tags) ? tags : [];
    if (keynotes !== undefined) medicine.keynotes = keynotes || null;
    if (source !== undefined) medicine.source = source;
    medicine.updatedAt = new Date();

    await medicine.save();

    // Re-upsert in Qdrant with updated embedding
    await upsertMedicine({
      qdrantId: medicine.qdrantId,
      name: medicine.name,
      description: medicine.description,
      category: medicine.category,
      tags: medicine.tags,
      keynotes: medicine.keynotes,
      source: medicine.source,
    });

    return res.json(medicine);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /admin/medicines/:id
 * Delete a medicine from MongoDB and Qdrant.
 */
router.delete('/medicines/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    const { qdrantId } = medicine;

    // Delete from Qdrant first
    try {
      await deleteMedicine(qdrantId);
    } catch (err) {
      console.warn(`[Admin] Qdrant delete warning for ${qdrantId}:`, err.message);
    }

    // Delete from MongoDB
    await Medicine.deleteOne({ _id: id });

    return res.json({ message: 'Medicine deleted successfully', qdrantId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Success stories ───────────────────────────────────────────────────────────

/**
 * POST /admin/uploads
 * Upload a single image (multipart field "file") to ImageKit.
 * Returns { url }. Used by the success-story editor for the user photo.
 */
router.post('/uploads', adminAuth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded (field "file")' });
    }
    try {
      const safe = (req.file.originalname || 'story').replace(/[^a-zA-Z0-9._-]/g, '_');
      const url = await uploadImage(req.file.buffer, `story_${Date.now()}_${safe}`);
      return res.json({ url });
    } catch (e) {
      console.error('[Admin] Story image upload failed:', e.message);
      return res.status(500).json({ error: e.message });
    }
  });
});

/**
 * GET /admin/stories
 * List all success stories (newest first), including unpublished ones.
 */
router.get('/stories', adminAuth, async (req, res) => {
  try {
    // Disable conditional caching: the request carries an Authorization header,
    // so a revalidated 304 would arrive bodyless and break the admin fetch.
    res.set('Cache-Control', 'no-store');
    const stories = await Story.find().sort({ createdAt: -1 }).lean();
    return res.json({ total: stories.length, data: stories });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

function parseRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return null;
  const rounded = Math.round(rating);
  if (rounded < 1 || rounded > 10) return null;
  return rounded;
}

/**
 * POST /admin/stories
 * Create a success story.
 * Body: { name, description, rating (1-10), photoUrl?, published? }
 */
router.post('/stories', adminAuth, async (req, res) => {
  try {
    const { name, description, rating, photoUrl, published } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!description || !String(description).trim()) {
      return res.status(400).json({ error: 'description is required' });
    }
    const parsedRating = parseRating(rating);
    if (parsedRating === null) {
      return res.status(400).json({ error: 'rating must be a whole number between 1 and 10' });
    }

    const story = await Story.create({
      name: String(name).trim(),
      description: String(description).trim(),
      rating: parsedRating,
      photoUrl: photoUrl ? String(photoUrl).trim() : '',
      published: published === undefined ? true : !!published,
    });

    return res.status(201).json(story);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /admin/stories/:id
 * Update a success story. Body: partial { name, description, rating, photoUrl, published }
 */
router.put('/stories/:id', adminAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const { name, description, rating, photoUrl, published } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: 'name cannot be empty' });
      story.name = String(name).trim();
    }
    if (description !== undefined) {
      if (!String(description).trim()) return res.status(400).json({ error: 'description cannot be empty' });
      story.description = String(description).trim();
    }
    if (rating !== undefined) {
      const parsedRating = parseRating(rating);
      if (parsedRating === null) {
        return res.status(400).json({ error: 'rating must be a whole number between 1 and 10' });
      }
      story.rating = parsedRating;
    }
    if (photoUrl !== undefined) story.photoUrl = photoUrl ? String(photoUrl).trim() : '';
    if (published !== undefined) story.published = !!published;
    story.updatedAt = new Date();

    await story.save();
    return res.json(story);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /admin/stories/:id
 */
router.delete('/stories/:id', adminAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    await Story.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Story deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Products ────────────────────────────────────────────────────────────────

const PRODUCT_STATUSES = Product.STATUSES;

function parsePrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) return null;
  return price;
}

function parseStock(value) {
  const stock = parseInt(value, 10);
  if (!Number.isFinite(stock) || stock < 0) return null;
  return stock;
}

/**
 * GET /admin/products
 * List all products (newest first), including hidden ones.
 */
router.get('/products', adminAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ total: products.length, data: products });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/products/:id
 */
router.get('/products/:id', adminAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Product not found' });
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /admin/products
 * Body: { name, category, imageUrl?, description?, price, stock, status?, active? }
 */
router.post('/products', adminAuth, async (req, res) => {
  try {
    const { name, category, imageUrl, description, price, stock, status, active } = req.body || {};

    if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
    if (!category || !String(category).trim()) return res.status(400).json({ error: 'category is required' });

    const parsedPrice = parsePrice(price);
    if (parsedPrice === null) return res.status(400).json({ error: 'price must be a number ≥ 0' });

    const parsedStock = parseStock(stock);
    if (parsedStock === null) return res.status(400).json({ error: 'stock must be a whole number ≥ 0' });

    if (status !== undefined && !PRODUCT_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${PRODUCT_STATUSES.join(', ')}` });
    }

    const product = await Product.create({
      name: String(name).trim(),
      category: String(category).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      description: description ? String(description).trim() : '',
      price: parsedPrice,
      stock: parsedStock,
      status: status || 'in_stock',
      active: active === undefined ? true : !!active,
    });

    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /admin/products/:id
 * Body: partial { name, category, imageUrl, description, price, stock, status, active }
 */
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { name, category, imageUrl, description, price, stock, status, active } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: 'name cannot be empty' });
      product.name = String(name).trim();
    }
    if (category !== undefined) {
      if (!String(category).trim()) return res.status(400).json({ error: 'category cannot be empty' });
      product.category = String(category).trim();
    }
    if (imageUrl !== undefined) product.imageUrl = imageUrl ? String(imageUrl).trim() : '';
    if (description !== undefined) product.description = description ? String(description).trim() : '';
    if (price !== undefined) {
      const parsedPrice = parsePrice(price);
      if (parsedPrice === null) return res.status(400).json({ error: 'price must be a number ≥ 0' });
      product.price = parsedPrice;
    }
    if (stock !== undefined) {
      const parsedStock = parseStock(stock);
      if (parsedStock === null) return res.status(400).json({ error: 'stock must be a whole number ≥ 0' });
      product.stock = parsedStock;
    }
    if (status !== undefined) {
      if (!PRODUCT_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${PRODUCT_STATUSES.join(', ')}` });
      }
      product.status = status;
    }
    if (active !== undefined) product.active = !!active;
    product.updatedAt = new Date();

    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /admin/products/:id
 */
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await Product.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Orders ──────────────────────────────────────────────────────────────────

/**
 * GET /admin/orders
 * List orders (newest first), with the customer's name/email joined. Optional
 * ?status= filter.
 */
router.get('/orders', adminAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email phone')
      .lean();

    return res.json({ total: orders.length, data: orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/orders/:id
 */
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Order not found' });
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /admin/orders/:id/status
 * Body: { status }
 */
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!Order.ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${Order.ORDER_STATUSES.join(', ')}` });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.updatedAt = new Date();
    await order.save();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
