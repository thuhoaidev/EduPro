const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  registerDevice,
  getUserDevices,
  checkDeviceStatus,
  getViolations,
  handleViolation,
  getViolationStats,
  cleanupDevices
} = require('../controllers/deviceSecurityController');
const { auth: authMiddleware } = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// Validation rules
const registerDeviceValidation = [
  body('courseId')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ObjectId')
];

const handleViolationValidation = [
  param('violationId')
    .isMongoId()
    .withMessage('Violation ID must be a valid MongoDB ObjectId'),
  body('action')
    .isIn(['block_users', 'dismiss'])
    .withMessage('Action must be either "block_users" or "dismiss"'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string with maximum 1000 characters')
];

// User routes
router.post('/register', 
  authMiddleware, 
  registerDeviceValidation, 
  registerDevice
);

router.get('/my-devices', 
  authMiddleware, 
  getUserDevices
);

router.get('/check-status/:courseId', 
  authMiddleware, 
  checkDeviceStatus
);

// Admin routes
router.get('/violations', 
  authMiddleware, 
  checkRole('admin'), 
  getViolations
);

router.post('/violations/:violationId/handle', 
  authMiddleware, 
  checkRole('admin'), 
  handleViolationValidation, 
  handleViolation
);

router.get('/stats', 
  authMiddleware, 
  checkRole('admin'), 
  getViolationStats
);

router.post('/cleanup', 
  authMiddleware, 
  checkRole('admin'), 
  cleanupDevices
);

module.exports = router;
