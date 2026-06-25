const jwt = require('jsonwebtoken');

/**
 * Storefront customer authentication middleware.
 * Verifies the JWT and checks for the `customer` role. Customer tokens are
 * signed with the same JWT_SECRET as admin tokens but carry role: 'customer'
 * and sub: <customerId>, so they can never satisfy adminAuth and vice-versa.
 *
 * Sets req.customer = { sub, role, ... } on success.
 */
function customerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'customer') {
      return res.status(403).json({ error: 'Forbidden: customer role required' });
    }

    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = customerAuth;
