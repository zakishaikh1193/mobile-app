const db = require('../models/db');
const { validationResult } = require('express-validator');

// ============================================
// GRADES MANAGEMENT
// ============================================

// @desc    Get all grades
// @route   GET /api/education/grades
// @access  Private/Admin
exports.getGrades = async (req, res) => {
  try {
    const [grades] = await db.query(`
      SELECT 
        id,
        name,
        description,
        academic_year,
        created_at,
        updated_at
      FROM grades
      ORDER BY name, academic_year
    `);

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Error getting grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new grade
// @route   POST /api/education/grades
// @access  Private/Admin
exports.createGrade = async (req, res) => {
  try {
    const { name, description, academic_year = '2024-2025' } = req.body;

    const [result] = await db.query(`
      INSERT INTO grades (name, description, academic_year)
      VALUES (?, ?, ?)
    `, [name, description, academic_year]);

    const [newGrade] = await db.query(`
      SELECT * FROM grades WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      grade: newGrade[0]
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a grade
// @route   PUT /api/education/grades/:id
// @access  Private/Admin
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, academic_year } = req.body;

    await db.query(`
      UPDATE grades 
      SET name = ?, description = ?, academic_year = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, description, academic_year, id]);

    const [updatedGrade] = await db.query(`
      SELECT * FROM grades WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      grade: updatedGrade[0]
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a grade
// @route   DELETE /api/education/grades/:id
// @access  Private/Admin
exports.deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if grade has books
    const [books] = await db.query(`
      SELECT COUNT(*) as count FROM books WHERE grade_id = ?
    `, [id]);

    if (books[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete grade - it has associated books' 
      });
    }

    await db.query('DELETE FROM grades WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// BOOKS MANAGEMENT
// ============================================

// @desc    Get all books
// @route   GET /api/education/books
// @access  Private/Admin
exports.getBooks = async (req, res) => {
  try {
    const [books] = await db.query(`
      SELECT 
        b.id,
        b.title,
        b.description,
        b.cover_image,
        b.order_number,
        b.is_active,
        b.academic_year,
        b.created_at,
        b.updated_at,
        g.id as grade_id,
        g.name as grade_name
      FROM books b
      JOIN grades g ON b.grade_id = g.id
      ORDER BY g.name, b.order_number
    `);

    res.json({
      success: true,
      books
    });
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get books by grade
// @route   GET /api/education/grades/:gradeId/books
// @access  Private/Admin
exports.getBooksByGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;

    const [books] = await db.query(`
      SELECT 
        id,
        title,
        description,
        cover_image,
        order_number,
        is_active,
        academic_year,
        created_at,
        updated_at
      FROM books
      WHERE grade_id = ?
      ORDER BY order_number
    `, [gradeId]);

    res.json({
      success: true,
      books
    });
  } catch (error) {
    console.error('Error getting books by grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new book
// @route   POST /api/education/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      grade_id, 
      cover_image, 
      order_number = 0,
      academic_year = '2024-2025' 
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO books (title, description, grade_id, cover_image, order_number, academic_year)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, grade_id, cover_image, order_number, academic_year]);

    const [newBook] = await db.query(`
      SELECT 
        b.*,
        g.name as grade_name
      FROM books b
      JOIN grades g ON b.grade_id = g.id
      WHERE b.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      book: newBook[0]
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a book
// @route   PUT /api/education/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      grade_id, 
      cover_image, 
      order_number,
      is_active,
      academic_year 
    } = req.body;

    await db.query(`
      UPDATE books 
      SET title = ?, description = ?, grade_id = ?, cover_image = ?, 
          order_number = ?, is_active = ?, academic_year = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description, grade_id, cover_image, order_number, is_active, academic_year, id]);

    const [updatedBook] = await db.query(`
      SELECT 
        b.*,
        g.name as grade_name
      FROM books b
      JOIN grades g ON b.grade_id = g.id
      WHERE b.id = ?
    `, [id]);

    res.json({
      success: true,
      book: updatedBook[0]
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/education/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book has lessons
    const [lessons] = await db.query(`
      SELECT COUNT(*) as count FROM lessons WHERE book_id = ?
    `, [id]);

    if (lessons[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete book - it has associated lessons' 
      });
    }

    await db.query('DELETE FROM books WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// LESSONS MANAGEMENT
// ============================================

// @desc    Get all lessons
// @route   GET /api/education/lessons
// @access  Private/Admin
exports.getLessons = async (req, res) => {
  try {
    const [lessons] = await db.query(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.lesson_number,
        l.is_active,
        l.is_unlocked,
        l.unlocked_by,
        l.unlocked_at,
        l.created_at,
        l.updated_at,
        b.id as book_id,
        b.title as book_title,
        g.id as grade_id,
        g.name as grade_name
      FROM lessons l
      JOIN books b ON l.book_id = b.id
      JOIN grades g ON b.grade_id = g.id
      ORDER BY g.name, b.order_number, l.lesson_number
    `);

    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Error getting lessons:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get lessons by book
// @route   GET /api/education/books/:bookId/lessons
// @access  Private/Admin
exports.getLessonsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const [lessons] = await db.query(`
      SELECT 
        id,
        title,
        description,
        lesson_number,
        is_active,
        is_unlocked,
        unlocked_by,
        unlocked_at,
        created_at,
        updated_at
      FROM lessons
      WHERE book_id = ?
      ORDER BY lesson_number
    `, [bookId]);

    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Error getting lessons by book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new lesson
// @route   POST /api/education/lessons
// @access  Private/Admin
exports.createLesson = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      book_id, 
      lesson_number,
      is_active = true 
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO lessons (title, description, book_id, lesson_number, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, book_id, lesson_number, is_active]);

    const [newLesson] = await db.query(`
      SELECT 
        l.*,
        b.title as book_title,
        g.name as grade_name
      FROM lessons l
      JOIN books b ON l.book_id = b.id
      JOIN grades g ON b.grade_id = g.id
      WHERE l.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      lesson: newLesson[0]
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a lesson
// @route   PUT /api/education/lessons/:id
// @access  Private/Admin
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      book_id, 
      lesson_number,
      is_active 
    } = req.body;

    await db.query(`
      UPDATE lessons 
      SET title = ?, description = ?, book_id = ?, lesson_number = ?, 
          is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description, book_id, lesson_number, is_active, id]);

    const [updatedLesson] = await db.query(`
      SELECT 
        l.*,
        b.title as book_title,
        g.name as grade_name
      FROM lessons l
      JOIN books b ON l.book_id = b.id
      JOIN grades g ON b.grade_id = g.id
      WHERE l.id = ?
    `, [id]);

    res.json({
      success: true,
      lesson: updatedLesson[0]
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/education/lessons/:id
// @access  Private/Admin
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lesson has units
    const [units] = await db.query(`
      SELECT COUNT(*) as count FROM units WHERE lesson_id = ?
    `, [id]);

    if (units[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete lesson - it has associated units' 
      });
    }

    await db.query('DELETE FROM lessons WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// UNITS MANAGEMENT
// ============================================

// @desc    Get all units
// @route   GET /api/education/units
// @access  Private/Admin
exports.getUnits = async (req, res) => {
  try {
    const [units] = await db.query(`
      SELECT 
        u.id,
        u.title,
        u.description,
        u.unit_number,
        u.is_active,
        u.created_at,
        u.updated_at,
        l.id as lesson_id,
        l.title as lesson_title,
        b.id as book_id,
        b.title as book_title,
        g.id as grade_id,
        g.name as grade_name
      FROM units u
      JOIN lessons l ON u.lesson_id = l.id
      JOIN books b ON l.book_id = b.id
      JOIN grades g ON b.grade_id = g.id
      ORDER BY g.name, b.order_number, l.lesson_number, u.unit_number
    `);

    res.json({
      success: true,
      units
    });
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get units by lesson
// @route   GET /api/education/lessons/:lessonId/units
// @access  Private/Admin
exports.getUnitsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const [units] = await db.query(`
      SELECT 
        id,
        title,
        description,
        unit_number,
        is_active,
        created_at,
        updated_at
      FROM units
      WHERE lesson_id = ?
      ORDER BY unit_number
    `, [lessonId]);

    res.json({
      success: true,
      units
    });
  } catch (error) {
    console.error('Error getting units by lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new unit
// @route   POST /api/education/units
// @access  Private/Admin
exports.createUnit = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      lesson_id, 
      unit_number,
      is_active = true 
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO units (title, description, lesson_id, unit_number, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, lesson_id, unit_number, is_active]);

    const [newUnit] = await db.query(`
      SELECT 
        u.*,
        l.title as lesson_title,
        b.title as book_title,
        g.name as grade_name
      FROM units u
      JOIN lessons l ON u.lesson_id = l.id
      JOIN books b ON l.book_id = b.id
      JOIN grades g ON b.grade_id = g.id
      WHERE u.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      unit: newUnit[0]
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a unit
// @route   PUT /api/education/units/:id
// @access  Private/Admin
exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      lesson_id, 
      unit_number,
      is_active 
    } = req.body;

    await db.query(`
      UPDATE units 
      SET title = ?, description = ?, lesson_id = ?, unit_number = ?, 
          is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description, lesson_id, unit_number, is_active, id]);

    const [updatedUnit] = await db.query(`
      SELECT 
        u.*,
        l.title as lesson_title,
        b.title as book_title,
        g.name as grade_name
      FROM units u
      JOIN lessons l ON u.lesson_id = l.id
      JOIN books b ON l.book_id = b.id
      JOIN grades g ON b.grade_id = g.id
      WHERE u.id = ?
    `, [id]);

    res.json({
      success: true,
      unit: updatedUnit[0]
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a unit
// @route   DELETE /api/education/units/:id
// @access  Private/Admin
exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if unit has activities
    const [activities] = await db.query(`
      SELECT COUNT(*) as count FROM activities WHERE unit_id = ?
    `, [id]);

    if (activities[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete unit - it has associated activities' 
      });
    }

    await db.query('DELETE FROM units WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// TEACHER LESSON UNLOCKING
// ============================================

// @desc    Unlock a lesson (Teacher only)
// @route   POST /api/education/lessons/:id/unlock
// @access  Private/Teacher
exports.unlockLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { unlockNotes } = req.body;

    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Teacher or admin access required' });
    }

    await db.query(`
      UPDATE lessons 
      SET is_unlocked = 1, unlocked_by = ?, unlocked_at = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [req.user.id, id]);

    res.json({
      success: true,
      message: 'Lesson unlocked successfully'
    });
  } catch (error) {
    console.error('Error unlocking lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Lock a lesson (Teacher only)
// @route   POST /api/education/lessons/:id/lock
// @access  Private/Teacher
exports.lockLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Teacher or admin access required' });
    }

    await db.query(`
      UPDATE lessons 
      SET is_unlocked = 0, unlocked_by = NULL, unlocked_at = NULL, updated_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Lesson locked successfully'
    });
  } catch (error) {
    console.error('Error locking lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// UNIT LOCKING/UNLOCKING
// ============================================

// @desc    Unlock a unit (Teacher only)
// @route   POST /api/education/units/:id/unlock
// @access  Private/Teacher
exports.unlockUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { unlockNotes } = req.body;

    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Teacher or admin access required' });
    }

    await db.query(`
      UPDATE units 
      SET is_unlocked = 1, unlocked_by = ?, unlocked_at = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [req.user.id, id]);

    res.json({
      success: true,
      message: 'Unit unlocked successfully'
    });
  } catch (error) {
    console.error('Error unlocking unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Lock a unit (Teacher only)
// @route   POST /api/education/units/:id/lock
// @access  Private/Teacher
exports.lockUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is teacher or admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Teacher or admin access required' });
    }

    await db.query(`
      UPDATE units 
      SET is_unlocked = 0, unlocked_by = NULL, unlocked_at = NULL, updated_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Unit locked successfully'
    });
  } catch (error) {
    console.error('Error locking unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = exports; 