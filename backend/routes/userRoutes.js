const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user (Admin only)
// @access  Private/Admin
router.post(
  '/register',
  [
    // The validation checks are now part of the main array
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Please include a valid role').isIn(['admin', 'teacher', 'parent', 'student']),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
  ],
  userController.registerUser
);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  userController.authUser
);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', [auth, adminAuth], userController.getUsers);

// @route   PUT /api/users/update-avatar
// @desc    Update user's avatar
// @access  Private
router.put(
  '/update-avatar',
  auth,
  [
    check('avatar', 'Avatar URL is required').not().isEmpty()
  ],
  userController.updateAvatar
);

module.exports = router;
