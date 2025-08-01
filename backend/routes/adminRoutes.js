const express = require('express');
const { check } = require('express-validator');
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');

const router = express.Router();

// @route   POST /api/admin/users
// @desc    Create a new user (Admin only)
// @access  Private/Admin
router.post(
  '/users',
  [
    auth,
    adminAuth,
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Please include a valid role').isIn(['admin', 'teacher', 'student']),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty()
  ],
  adminController.createUser
);

module.exports = router;
