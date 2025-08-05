const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');
const educationalController = require('../controllers/educationalController');

// ============================================
// EDUCATIONAL HIERARCHY ROUTES
// ============================================

// @route   GET /api/educational/hierarchy/:childId
// @desc    Get complete educational hierarchy for a child
// @access  Private (Parent/Child/Teacher)
router.get('/hierarchy/:childId', auth, educationalController.getEducationalHierarchy);

// @route   GET /api/educational/available-topics/:childId
// @desc    Get available topics for a child (considering chapter release and completion)
// @access  Private (Parent/Child/Teacher)
router.get('/available-topics/:childId', auth, educationalController.getAvailableTopics);

// @route   GET /api/educational/topics/:topicId/activities
// @desc    Get activities for a specific topic
// @access  Private (Parent/Child/Teacher)
router.get('/topics/:topicId/activities', auth, educationalController.getTopicActivities);

// @route   GET /api/educational/progress/:childId
// @desc    Get child's learning progress overview
// @access  Private (Parent/Child/Teacher)
router.get('/progress/:childId', auth, educationalController.getChildProgress);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   POST /api/educational/admin/release-chapter
// @desc    Release a chapter (Admin only)
// @access  Private/Admin
router.post('/admin/release-chapter', [
  auth,
  adminAuth,
  [
    check('chapterId', 'Chapter ID is required').isInt(),
    check('releaseDate', 'Release date is required').isDate(),
    check('releaseNotes', 'Release notes are required').not().isEmpty()
  ]
], educationalController.releaseChapter);

// @route   GET /api/educational/admin/chapters
// @desc    Get all chapters with release status (Admin)
// @access  Private/Admin
router.get('/admin/chapters', auth, adminAuth, educationalController.getChaptersForAdmin);

// ============================================
// PROGRESS TRACKING ROUTES
// ============================================

// @route   POST /api/educational/complete-topic
// @desc    Complete a topic (called when all activities in topic are completed)
// @access  Private (Parent/Child)
router.post('/complete-topic', [
  auth,
  [
    check('topicId', 'Topic ID is required').isInt(),
    check('childId', 'Child ID is required').isInt(),
    check('completionScore', 'Completion score is required').isFloat({ min: 0, max: 100 })
  ]
], educationalController.completeTopic);

module.exports = router; 