const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Admin only)
// @route   POST /api/users/register
// @access  Private/Admin
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role, firstName, lastName } = req.body;
  
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

    // Set default max_children based on role
    const maxChildren = role === 'parent' ? 3 : 0;
    
    // Create user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, first_name, last_name, max_children) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, firstName, lastName, maxChildren]
    );

    const newUser = {
      id: result.insertId,
      username,
      email,
      role,
      first_name: firstName,
      last_name: lastName,
      max_children: maxChildren,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
exports.authUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response and ensure proper field mapping
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      max_children: user.max_children,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const [user] = await db.query(
      'SELECT id, username, email, role, first_name, last_name, avatar, max_children, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      role: user[0].role,
      first_name: user[0].first_name,
      last_name: user[0].last_name,
      avatar: user[0].avatar,
      max_children: user[0].max_children,
      created_at: user[0].created_at,
      updated_at: user[0].updated_at
    };

    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  
  try {
    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [firstName, lastName, email, req.user.id]
    );

    const [updatedUser] = await db.query(
      'SELECT id, username, email, role, first_name as firstName, last_name as lastName, max_children as maxChildren FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // 1. Get the optional 'role' from the query parameters.
    const { role } = req.query;

    // 2. Start with the base SQL query.
    let query = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        first_name AS firstName, 
        last_name AS lastName, 
        is_active, 
        max_children AS maxChildren, 
        created_at 
      FROM users
    `;

    // 3. Create an array to hold the parameters for the query to prevent SQL injection.
    const params = [];

    // 4. If a 'role' was provided in the URL, add a WHERE clause to the query.
    if (role) {
      // Note: Using a WHERE clause is better than filtering an entire table in JavaScript.
      query += ' WHERE role = ?';
      params.push(role);
    }

    // 5. Add an ORDER BY clause for consistent results.
    query += ' ORDER BY created_at DESC';

    // 6. Execute the query using the dynamically built query string and parameters.
    const [users] = await db.query(query, params);

    // 7. Send the result.
    res.json(users);

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, firstName, lastName, maxChildren } = req.body;
    
    // Check if user exists
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email or username is already taken by another user
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, req.params.id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    // Only update max_children if it's a number and not negative
    const maxChildrenValue = typeof maxChildren === 'number' && maxChildren >= 0 
      ? maxChildren 
      : (role === 'parent' ? 3 : 0);

    // Update user
    await db.query(
      'UPDATE users SET username = ?, email = ?, role = ?, first_name = ?, last_name = ?, max_children = ? WHERE id = ?',
      [username, email, role, firstName, lastName, maxChildrenValue, req.params.id]
    );

    res.json({ 
      message: 'User updated successfully',
      user: {
        id: req.params.id,
        username,
        email,
        role,
        firstName,
        lastName,
        maxChildren: maxChildrenValue
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user's avatar
// @route   PUT /api/users/update-avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user.id;

    // Update user's avatar in the database
    await db.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatar, userId]
    );

    // Get the updated user data
    const [users] = await db.query(
      'SELECT id, username, email, role, first_name as firstName, last_name as lastName, avatar FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
