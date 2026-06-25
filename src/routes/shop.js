const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const customerAuth = require('../middleware/customerAuth');
const razorpay = require('../services/razorpay');

// Public shape of a product (everything the storefront needs).
function publicProduct(p) {
  return {
    id: String(p._id),
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl || '',
    description: p.description || '',
    price: p.price,
    status: p.status,
    // Buyable when active, marked in/few stock, and actually has stock.
    available: p.active && p.status !== 'sold_out' && p.stock > 0,
  };
}

/**
 * GET /api/shop/products
 * Public list of active products (newest first). Optional ?category= filter.
 */
router.get('/products', async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = String(req.query.category).trim();

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ total: products.length, data: products.map(publicProduct) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/shop/categories
 * Distinct categories across active products (for storefront filters).
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    return res.json({ data: categories.filter(Boolean).sort() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/shop/products/:id
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product || !product.active) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product: publicProduct(product) });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Product not found' });
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/shop/checkout
 * Create an order from a cart and return a Razorpay payment link.
 * Requires a customer token.
 *
 * Body: {
 *   items: [{ productId, quantity }],
 *   shippingAddress?: { name, phone, line1, line2, city, state, pincode }
 * }
 */
router.post('/checkout', customerAuth, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const customer = await Customer.findById(req.customer.sub);
    if (!customer) return res.status(404).json({ error: 'Account not found' });

    // Build line items from the live catalogue — never trust client prices.
    const lineItems = [];
    let total = 0;
    for (const entry of items) {
      const qty = parseInt(entry.quantity, 10) || 0;
      if (qty < 1) return res.status(400).json({ error: 'Each item needs a quantity of at least 1' });

      const product = await Product.findById(entry.productId);
      if (!product || !product.active) {
        return res.status(400).json({ error: `Product not available: ${entry.productId}` });
      }
      if (product.status === 'sold_out' || product.stock < qty) {
        return res.status(400).json({ error: `Out of stock: ${product.name}` });
      }

      lineItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        imageUrl: product.imageUrl || '',
      });
      total += product.price * qty;
    }

    // Shipping snapshot: prefer what the client sent, fall back to the profile.
    const addr = shippingAddress || {};
    const profileAddr = customer.address || {};
    const shipping = {
      name: (addr.name || customer.name || '').trim(),
      phone: (addr.phone || customer.phone || '').trim(),
      line1: (addr.line1 || profileAddr.line1 || '').trim(),
      line2: (addr.line2 || profileAddr.line2 || '').trim(),
      city: (addr.city || profileAddr.city || '').trim(),
      state: (addr.state || profileAddr.state || '').trim(),
      pincode: (addr.pincode || profileAddr.pincode || '').trim(),
    };

    const order = await Order.create({
      customerId: customer._id,
      items: lineItems,
      total,
      status: 'pending',
      shippingAddress: shipping,
    });

    // Create a Razorpay payment link if configured; otherwise leave the order
    // pending so the flow still works in dev without payment keys.
    let paymentUrl = null;
    if (razorpay.isConfigured()) {
      try {
        const link = await razorpay.createOrderPaymentLink({
          orderId: order._id,
          amountPaise: Math.round(total * 100),
          name: shipping.name,
          contact: shipping.phone,
          email: customer.email,
        });
        order.payment.paymentLinkId = link.id;
        await order.save();
        paymentUrl = link.shortUrl;
      } catch (e) {
        console.error('[Shop] Payment link creation failed:', e.message);
        return res.status(502).json({ error: 'Could not start payment. Please try again.', orderId: String(order._id) });
      }
    }

    return res.status(201).json({ orderId: String(order._id), total, paymentUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
