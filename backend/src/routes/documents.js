const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const documentController = require('../controllers/DocumentController');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All routes require authentication
router.use(authMiddleware);

// Document Management Routes
router.get('/', documentController.getAll);
router.get('/:id', param('id').isInt(), documentController.getById);
router.get('/kpi/:kpiId', param('kpiId').isInt(), documentController.getByKPI);

// Upload document - requires appropriate role
router.post(
  '/upload',
  authMiddleware.checkRole(['Officer', 'Manager', 'Administrator']),
  upload.single('document'),
  handleUploadError,
  body('kpi_id').optional().isInt(),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').isIn(['KPI', 'Policy', 'Report', 'Other']),
  documentController.upload
);

// Update document metadata - requires appropriate role
router.put(
  '/:id',
  authMiddleware.checkRole(['Officer', 'Manager', 'Administrator']),
  param('id').isInt(),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('category').optional().isIn(['KPI', 'Policy', 'Report', 'Other']),
  documentController.update
);

// Delete document - only Admins
router.delete(
  '/:id',
  authMiddleware.isAdmin, // Changed from authorize('Administrator') to isAdmin
  param('id').isInt(),
  documentController.delete
);

// Download document
router.get('/:id/download', param('id').isInt(), documentController.download);

module.exports = router;
