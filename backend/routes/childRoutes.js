const express = require('express');
const { check } = require('express-validator');
const childController = require('../controllers/childController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/children
// @desc    Create a new child profile (Parent only)
// @access  Private/Parent
router.post(
  '/',
  [
    auth,
    check('first_name', 'First name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('age', 'Age must be a number between 3 and 12').isInt({ min: 3, max: 12 }),
    check('gender', 'Gender must be either boy or girl').isIn(['boy', 'girl']),
  ],
  childController.createChild
);

// @route   GET /api/children
// @desc    Get all children for a parent
// @access  Private/Parent
router.get('/', auth, childController.getChildren);

// @route   POST /api/children/:childId/switch
// @desc    Switch to child context (Parent only)
// @access  Private/Parent
router.post('/:childId/switch', auth, childController.switchToChild);

// @route   PUT /api/children/:childId/progress
// @desc    Update child progress
// @access  Private (Parent or Child themselves)
router.put(
  '/:childId/progress',
  [
    auth,
    check('activityType', 'Activity type is required').not().isEmpty(),
    check('activityId', 'Activity ID is required').not().isEmpty(),
    check('progressValue', 'Progress value must be a number').isNumeric(),
  ],
  childController.updateChildProgress
);

// @route   DELETE /api/children/:childId
// @desc    Delete/deactivate child profile (Parent only)
// @access  Private/Parent
router.delete('/:childId', auth, childController.deleteChild);

// @route   GET /api/children/all
// @desc    Get all children (for teachers to enroll)
// @access  Private/Teacher
router.get('/all', auth, childController.getAllChildren);

module.exports = router;
