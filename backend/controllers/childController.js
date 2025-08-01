const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token for child
const generateToken = (child, parentId) => {
  return jwt.sign(
    { 
      id: child.id, 
      username: child.username, 
      role: 'student',
      parentId: parentId,
      isChild: true 
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' }
  );
};

// @desc    Create a new child (Parent only)
// @route   POST /api/children
// @access  Private/Parent
exports.createChild = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, username, age, gender, avatar } = req.body;
  const parentId = req.user.id;

  try {
    // Verify parent role and check max_children limit
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can create child profiles' });
    }
    
    // Get parent's current max_children and current children count
    const [parent] = await db.query(
      'SELECT max_children, (SELECT COUNT(*) FROM children WHERE parent_id = ?) as current_children FROM users WHERE id = ?',
      [parentId, parentId]
    );
    
    if (parent.length === 0) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    const { max_children, current_children } = parent[0];
    
    // Check if parent has reached their child limit
    if (current_children >= max_children) {
      return res.status(403).json({ 
        message: `You have reached the maximum number of children (${max_children}) allowed for your account.`
      });
    }

    // Check if username already exists
    const [existingChild] = await db.query(
      'SELECT * FROM children WHERE username = ?',
      [username]
    );

    if (existingChild.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Generate email and password automatically (not used for login)
    const email = `${username}@child.local`;
    const password = 'not_used'; // Placeholder since children don't login directly

    // Create child
    const [result] = await db.query(
      'INSERT INTO children (parent_id, first_name, username, email, password, age, gender, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [parentId, first_name, username, email, password, age, gender, avatar || null]
    );

    // Initialize child streak
    await db.query(
      'INSERT INTO child_streaks (child_id, current_streak, longest_streak) VALUES (?, 0, 0)',
      [result.insertId]
    );

    const newChild = {
      id: result.insertId,
      parent_id: parentId,
      first_name: first_name,
      username,
      email,
      age,
      gender,
      avatar,
      is_active: 1,
      progress: {},
      streak: 0,
      badges: []
    };

    res.status(201).json({
      success: true,
      message: 'Child profile created successfully',
      child: newChild
    });
  } catch (error) {
    console.error('Error creating child:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all children for a parent
// @route   GET /api/children
// @access  Private/Parent
exports.getChildren = async (req, res) => {
  try {
    const parentId = req.user.id;

    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can view child profiles' });
    }

    const [children] = await db.query(
      `SELECT 
        c.*,
        cs.current_streak,
        cs.longest_streak,
        cs.last_activity_date
      FROM children c
      LEFT JOIN child_streaks cs ON c.id = cs.child_id
      WHERE c.parent_id = ? AND c.is_active = 1
      ORDER BY c.created_at DESC`,
      [parentId]
    );

    // Get progress for each child
    for (let child of children) {
      const [progress] = await db.query(
        'SELECT activity_type, activity_id, progress_value FROM child_progress WHERE child_id = ?',
        [child.id]
      );

      const [badges] = await db.query(
        'SELECT badge_name, badge_icon FROM child_badges WHERE child_id = ?',
        [child.id]
      );

      child.progress = {};
      progress.forEach(p => {
        child.progress[`${p.activity_type}_${p.activity_id}`] = p.progress_value;
      });

      child.badges = badges.map(b => ({
        name: b.badge_name,
        icon: b.badge_icon
      }));

      child.streak = child.current_streak || 0;
    }

    res.json({
      success: true,
      children
    });
  } catch (error) {
    console.error('Error getting children:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate child & get token
// @route   POST /api/children/login
// @access  Public
exports.childLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if child exists
    const [children] = await db.query(
      `SELECT c.*, cs.current_streak, cs.longest_streak 
       FROM children c 
       LEFT JOIN child_streaks cs ON c.id = cs.child_id 
       WHERE c.email = ?`,
      [email]
    );

    if (children.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const child = children[0];

    // Check password
    const isMatch = await bcrypt.compare(password, child.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if child is active
    if (!child.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Get child's progress
    const [progress] = await db.query(
      'SELECT activity_type, activity_id, progress_value FROM child_progress WHERE child_id = ?',
      [child.id]
    );

    const [badges] = await db.query(
      'SELECT badge_name, badge_icon FROM child_badges WHERE child_id = ?',
      [child.id]
    );

    // Format progress data
    const progressData = {};
    progress.forEach(p => {
      progressData[`${p.activity_type}_${p.activity_id}`] = p.progress_value;
    });

    const badgeData = badges.map(b => ({
      name: b.badge_name,
      icon: b.badge_icon
    }));

    // Generate token
    const token = generateToken(child, child.parent_id);

    // Prepare user data (make it compatible with existing frontend)
    const userData = {
      id: child.id,
      username: child.username,
      email: child.email,
      role: 'student',
      first_name: child.first_name,
      last_name: '',
      avatar: child.avatar,
      age: child.age,
      gender: child.gender,
      progress: progressData,
      streak: child.current_streak || 0,
      badges: badgeData,
      isChild: true,
      parentId: child.parent_id
    };

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Error authenticating child:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update child progress
// @route   PUT /api/children/:childId/progress
// @access  Private
exports.updateChildProgress = async (req, res) => {
  const { childId } = req.params;
  const { activityType, activityId, progressValue, completed } = req.body;

  try {
    // Verify access (parent or the child themselves)
    if (req.user.role === 'parent') {
      // Verify child belongs to parent
      const [children] = await db.query(
        'SELECT id FROM children WHERE id = ? AND parent_id = ?',
        [childId, req.user.id]
      );
      if (children.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'student' && req.user.isChild) {
      // Verify child is updating their own progress
      if (req.user.id != childId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update or insert progress
    await db.query(
      `INSERT INTO child_progress (child_id, activity_type, activity_id, progress_value, completed, completed_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       progress_value = VALUES(progress_value),
       completed = VALUES(completed),
       completed_at = VALUES(completed_at),
       updated_at = NOW()`,
      [childId, activityType, activityId, progressValue, completed || 0, completed ? new Date() : null]
    );

    // Update streak if activity completed
    if (completed) {
      await updateChildStreak(childId);
    }

    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating child progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update child streak
const updateChildStreak = async (childId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [streakData] = await db.query(
      'SELECT * FROM child_streaks WHERE child_id = ?',
      [childId]
    );

    if (streakData.length === 0) {
      await db.query(
        'INSERT INTO child_streaks (child_id, current_streak, longest_streak, last_activity_date) VALUES (?, 1, 1, ?)',
        [childId, today]
      );
    } else {
      const streak = streakData[0];
      const lastActivityDate = streak.last_activity_date;
      
      if (lastActivityDate === today) {
        // Already completed activity today, no streak update needed
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak;
      if (lastActivityDate === yesterdayStr) {
        // Consecutive day, increment streak
        newStreak = streak.current_streak + 1;
      } else {
        // Streak broken, start new streak
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streak.longest_streak);

      await db.query(
        'UPDATE child_streaks SET current_streak = ?, longest_streak = ?, last_activity_date = ? WHERE child_id = ?',
        [newStreak, longestStreak, today, childId]
      );
    }
  } catch (error) {
    console.error('Error updating child streak:', error);
  }
};

// @desc    Switch to child context (Parent only)
// @route   POST /api/children/:childId/switch
// @access  Private/Parent
exports.switchToChild = async (req, res) => {
  const { childId } = req.params;

  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can switch to child context' });
    }

    // Verify child belongs to parent and get child data
    const [children] = await db.query(
      `SELECT c.*, cs.current_streak, cs.longest_streak 
       FROM children c 
       LEFT JOIN child_streaks cs ON c.id = cs.child_id 
       WHERE c.id = ? AND c.parent_id = ? AND c.is_active = 1`,
      [childId, req.user.id]
    );

    if (children.length === 0) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    const child = children[0];

    // Get child's progress
    const [progress] = await db.query(
      'SELECT activity_type, activity_id, progress_value FROM child_progress WHERE child_id = ?',
      [child.id]
    );

    const [badges] = await db.query(
      'SELECT badge_name, badge_icon FROM child_badges WHERE child_id = ?',
      [child.id]
    );

    // Format progress data
    const progressData = {};
    progress.forEach(p => {
      progressData[`${p.activity_type}_${p.activity_id}`] = p.progress_value;
    });

    const badgeData = badges.map(b => ({
      name: b.badge_name,
      icon: b.badge_icon
    }));

    // Generate token for child context
    const token = generateToken(child, child.parent_id);

    // Prepare child data for frontend
    const childData = {
      id: child.id,
      username: child.username,
      email: child.email,
      role: 'student',
      first_name: child.first_name,
      last_name: '',
      avatar: child.avatar,
      age: child.age,
      gender: child.gender,
      progress: progressData,
      streak: child.current_streak || 0,
      badges: badgeData,
      isChild: true,
      parentId: child.parent_id,
      parentContext: true // Flag to indicate parent is accessing child context
    };

    res.json({
      success: true,
      token,
      user: childData
    });
  } catch (error) {
    console.error('Error switching to child:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete child (Parent only)
// @route   DELETE /api/children/:childId
// @access  Private/Parent
exports.deleteChild = async (req, res) => {
  const { childId } = req.params;

  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can delete child profiles' });
    }

    // Verify child belongs to parent
    const [children] = await db.query(
      'SELECT id FROM children WHERE id = ? AND parent_id = ?',
      [childId, req.user.id]
    );

    if (children.length === 0) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    // Soft delete (set is_active to 0)
    await db.query(
      'UPDATE children SET is_active = 0 WHERE id = ?',
      [childId]
    );

    res.json({
      success: true,
      message: 'Child profile deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting child:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports;
