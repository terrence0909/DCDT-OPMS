const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

// Validation rules
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const accessRequestValidation = [
  body('employeeNumber').notEmpty().withMessage('Employee number is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('requestedRole').isIn(['Viewer', 'Officer', 'Manager', 'Administrator'])
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/request-access', accessRequestValidation, authController.requestAccess);
router.post('/logout', authMiddleware, authController.logout);
router.get('/session-status', authMiddleware, authController.getSessionStatus);

module.exports = router;