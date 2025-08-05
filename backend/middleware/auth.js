const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Protect routes
const auth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Check if this is a child token
      if (decoded.isChild) {
        console.log('Processing child token for childId:', decoded.id);
        // Get child from the token
        const childId = decoded.id;
        const [children] = await db.query('SELECT * FROM children WHERE id = ?', [childId]);
        
        if (children.length === 0) {
          return res.status(401).json({ message: 'Child not found' });
        }

        // Check if child is active
        if (!children[0].is_active) {
          return res.status(401).json({ message: 'Child account is deactivated' });
        }

        // Remove password from child object and add child info
        const { password, ...child } = children[0];
        
        // Add child to request object with consistent interface
        req.user = {
          ...child,
          role: 'student',
          isChild: true,
          parentId: child.parent_id
        };
        next();
      } else {
        // Regular user authentication
        const userId = decoded.id;
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
          console.log('Auth middleware - No user found with ID:', userId);
        }

        // Check if user is active
        if (!users[0].is_active) {
          return res.status(401).json({ message: 'User account is deactivated' });
        }

        // Remove password from user object
        const { password, ...user } = users[0];
        
        // Add user to request object
        req.user = user;
        next();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Admin middleware (shorthand for authorize('admin'))
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }
  next();
};

// Teacher middleware
const teacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Teacher or admin access required'
    });
  }
  next();
};

// Parent middleware
const parent = (req, res, next) => {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Parent or admin access required'
    });
  }
  next();
};

// Student middleware
const student = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Student, teacher, or admin access required.'
    });
  }
  next();
};

module.exports = {
  auth,
  authorize,
  admin,
  teacher,
  parent,
  student
};
