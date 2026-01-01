const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/users - Get all users (Admin only)
router.get('/', 
  authMiddleware.isAdmin,
  userController.getAllUsers
);

// GET /api/users/me - Get current user profile
router.get('/me', userController.getMyProfile);

// GET /api/users/:id - Get user by ID
router.get('/:id',
  param('id').isUUID().withMessage('Invalid user ID'),
  userController.getUserById
);

// PUT /api/users/me - Update current user profile
router.put('/me',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
  ],
  userController.updateMyProfile
);

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id',
  authMiddleware.isAdmin,
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('role').optional().isIn(['Viewer', 'Officer', 'Manager', 'Administrator']),
    body('department').optional().trim(),
    body('is_active').optional().isBoolean()
  ],
  userController.updateUser
);

// POST /api/users/:id/reset-password - Reset password (Admin only)
router.post('/:id/reset-password',
  authMiddleware.isAdmin,
  param('id').isUUID().withMessage('Invalid user ID'),
  userController.resetPassword
);

module.exports = router;
