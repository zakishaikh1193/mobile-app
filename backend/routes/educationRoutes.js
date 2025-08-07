const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');
const educationController = require('../controllers/educationController');

// ============================================
// GRADES ROUTES
// ============================================

// @route   GET /api/education/grades
// @desc    Get all grades
// @access  Private/Admin
router.get('/grades', auth, adminAuth, educationController.getGrades);

// @route   POST /api/education/grades
// @desc    Create a new grade
// @access  Private/Admin
router.post('/grades', [
  auth,
  adminAuth,
  [
    check('name', 'Grade name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('academic_year', 'Academic year is required').not().isEmpty()
  ]
], educationController.createGrade);

// @route   PUT /api/education/grades/:id
// @desc    Update a grade
// @access  Private/Admin
router.put('/grades/:id', [
  auth,
  adminAuth,
  [
    check('name', 'Grade name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('academic_year', 'Academic year is required').not().isEmpty()
  ]
], educationController.updateGrade);

// @route   DELETE /api/education/grades/:id
// @desc    Delete a grade
// @access  Private/Admin
router.delete('/grades/:id', auth, adminAuth, educationController.deleteGrade);

// ============================================
// BOOKS ROUTES
// ============================================

// @route   GET /api/education/books
// @desc    Get all books
// @access  Private/Admin
router.get('/books', auth, adminAuth, educationController.getBooks);

// @route   GET /api/education/grades/:gradeId/books
// @desc    Get books by grade
// @access  Private/Admin
router.get('/grades/:gradeId/books', auth, adminAuth, educationController.getBooksByGrade);

// @route   POST /api/education/books
// @desc    Create a new book
// @access  Private/Admin
router.post('/books', [
  auth,
  adminAuth,
  [
    check('title', 'Book title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('grade_id', 'Grade ID is required').isInt(),
    check('order_number', 'Order number is required').isInt()
  ]
], educationController.createBook);

// @route   PUT /api/education/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/books/:id', [
  auth,
  adminAuth,
  [
    check('title', 'Book title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('grade_id', 'Grade ID is required').isInt(),
    check('order_number', 'Order number is required').isInt()
  ]
], educationController.updateBook);

// @route   DELETE /api/education/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/books/:id', auth, adminAuth, educationController.deleteBook);

// ============================================
// UNITS ROUTES
// ============================================

// @route   GET /api/education/units
// @desc    Get all units
// @access  Private/Admin
router.get('/units', auth, adminAuth, educationController.getUnits);

// @route   GET /api/education/books/:bookId/units
// @desc    Get units by book
// @access  Private/Admin
router.get('/books/:bookId/units', auth, adminAuth, educationController.getUnitsByBook);

// @route   POST /api/education/units
// @desc    Create a new unit
// @access  Private/Admin
router.post('/units', [
  auth,
  adminAuth,
  [
    check('title', 'Unit title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('book_id', 'Book ID is required').isInt(),
    check('unit_number', 'Unit number is required').isInt()
  ]
], educationController.createUnit);

// @route   PUT /api/education/units/:id
// @desc    Update a unit
// @access  Private/Admin
router.put('/units/:id', [
  auth,
  adminAuth,
  [
    check('title', 'Unit title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('book_id', 'Book ID is required').isInt(),
    check('unit_number', 'Unit number is required').isInt()
  ]
], educationController.updateUnit);

// @route   DELETE /api/education/units/:id
// @desc    Delete a unit
// @access  Private/Admin
router.delete('/units/:id', auth, adminAuth, educationController.deleteUnit);

// ============================================
// LESSONS ROUTES
// ============================================

// @route   GET /api/education/lessons
// @desc    Get all lessons
// @access  Private/Admin
router.get('/lessons', auth, adminAuth, educationController.getLessons);

// @route   GET /api/education/units/:unitId/lessons
// @desc    Get lessons by unit
// @access  Private/Admin
router.get('/units/:unitId/lessons', auth, adminAuth, educationController.getLessonsByUnit);

// @route   POST /api/education/lessons
// @desc    Create a new lesson
// @access  Private/Admin
router.post('/lessons', [
  auth,
  adminAuth,
  [
    check('title', 'Lesson title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('unit_id', 'Unit ID is required').isInt(),
    check('lesson_number', 'Lesson number is required').isInt()
  ]
], educationController.createLesson);

// @route   PUT /api/education/lessons/:id
// @desc    Update a lesson
// @access  Private/Admin
router.put('/lessons/:id', [
  auth,
  adminAuth,
  [
    check('title', 'Lesson title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('unit_id', 'Unit ID is required').isInt(),
    check('lesson_number', 'Lesson number is required').isInt()
  ]
], educationController.updateLesson);

// @route   DELETE /api/education/lessons/:id
// @desc    Delete a lesson
// @access  Private/Admin
router.delete('/lessons/:id', auth, adminAuth, educationController.deleteLesson);

// ============================================
// TEACHER LESSON UNLOCKING ROUTES
// ============================================

// @route   POST /api/education/lessons/:id/unlock
// @desc    Unlock a lesson (Teacher only)
// @access  Private/Teacher
router.post('/lessons/:id/unlock', [
  auth,
  [
    check('unlockNotes', 'Unlock notes are required').not().isEmpty()
  ]
], educationController.unlockLesson);

// @route   POST /api/education/lessons/:id/lock
// @desc    Lock a lesson (Teacher only)
// @access  Private/Teacher
router.post('/lessons/:id/lock', auth, educationController.lockLesson);

// ============================================
// UNIT LOCKING ROUTES
// ============================================

// @route   POST /api/education/units/:id/unlock
// @desc    Unlock a unit (Teacher only)
// @access  Private/Teacher
router.post('/units/:id/unlock', [
  auth,
  [
    check('unlockNotes', 'Unlock notes are required').not().isEmpty()
  ]
], educationController.unlockUnit);

// @route   POST /api/education/units/:id/lock
// @desc    Lock a unit (Teacher only)
// @access  Private/Teacher
router.post('/units/:id/lock', auth, educationController.lockUnit);

module.exports = router; 