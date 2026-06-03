const jwt = require('jsonwebtoken');

/**
 * Admin authentication middleware.
 * Verifies the JWT and checks for admin role.
 *
 * To generate an admin token for use with the /admin routes, POST to /admin/token
 * with body: { secret: process.env.ADMIN_SECRET }
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}

module.exports = adminAuth;
