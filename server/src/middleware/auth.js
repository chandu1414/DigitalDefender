const jwt = require('jsonwebtoken');
const { Users } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'digitaldefender_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required. Please log in to access this resource.',
      code: 'AUTH_REQUIRED'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired session token. Please log in again.',
        code: 'TOKEN_INVALID'
      });
    }

    const user = Users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User account no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Your account has been deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Administrator privileges are required.',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded && decoded.id) {
      const user = Users.findById(decoded.id);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    next();
  });
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAdmin,
  optionalAuth
};
