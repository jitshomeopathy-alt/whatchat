const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const adminAuth = require('../middleware/adminAuth');
const Medicine = require('../models/Medicine');
const { upsertMedicine, deleteMedicine } = require('../services/qdrant');

const path = require('path');
const fs = require('fs');

// ── Token endpoint (not protected) ─────────────────────────────────────────────

/**
 * POST /admin/token
 * Exchange ADMIN_SECRET for a signed JWT with admin role.
 * Body: { secret: string }
 */
router.post('/token', (req, res) => {
  const { secret } = req.body;

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  const token = jwt.sign({ role: 'admin', sub: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return res.json({ token, expiresIn: '24h' });
});

// ── All routes below require admin JWT ────────────────────────────────────────

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

module.exports = router;
