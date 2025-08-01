const jwt = require('jsonwebtoken');
const db = require('../models/db');

/**
 * Middleware to check if the authenticated user has admin role
 * This should be used AFTER the auth middleware
 */
const adminAuth = (req, res, next) => {
  // Check if user exists (should be set by auth middleware)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  next();
};

module.exports = {
  adminAuth
};
