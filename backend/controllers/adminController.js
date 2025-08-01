const db = require('../models/db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// @desc    Create a new user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role, firstName, lastName, maxChildren } = req.body;
  
  try {
    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine max_children for parents
    let maxChildrenValue = 0;
    if (role === 'parent') {
      maxChildrenValue = maxChildren || 3; // Default to 3 children for parents
    }

    // Create user
    const query = 'INSERT INTO users (username, email, password, role, first_name, last_name, max_children) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [username, email, hashedPassword, role, firstName, lastName, maxChildrenValue];
    
    const [result] = await db.query(query, values);

    const newUser = {
      id: result.insertId,
      username,
      email,
      role,
      firstName,
      lastName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add max_children info for parents
    if (role === 'parent') {
      newUser.maxChildren = maxChildrenValue;
    }

    res.status(201).json({
      success: true,
      user: newUser,
      message: role === 'parent' ? 
        `Parent created successfully with ${maxChildrenValue} child license(s)` : 
        'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available license types
// @route   GET /api/admin/license-types
// @access  Private/Admin
exports.getLicenseTypes = async (req, res) => {
  try {
    // Return default license types since we're using simplified licensing
    const licenseTypes = [
      { name: 'free', display_name: 'Free', max_children: 1, price: 0 },
      { name: 'basic', display_name: 'Basic', max_children: 3, price: 9.99 },
      { name: 'premium', display_name: 'Premium', max_children: 5, price: 19.99 },
      { name: 'unlimited', display_name: 'Unlimited', max_children: 10, price: 29.99 }
    ];

    res.json({
      success: true,
      licenseTypes
    });
  } catch (error) {
    console.error('Error fetching license types:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
