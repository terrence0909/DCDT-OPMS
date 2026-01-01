const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const kpiController = require('../controllers/KPIController');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All routes require authentication
router.use(authMiddleware);

// GET /api/kpis - Get all KPIs
router.get('/', 
  [
    query('program').optional().isString(),
    query('status').optional().isIn(['OnTrack', 'AtRisk', 'Pending', 'NotAchieved', 'Achieved']),
    query('assignedTo').optional().isUUID(),
    query('year').optional().isInt({ min: 2020, max: 2030 })
  ],
  kpiController.getKPIs
);

// GET /api/kpis/:id - Get single KPI with history
router.get('/:id',
  [
    param('id').isUUID().withMessage('Invalid KPI ID'),
    query('years').optional().isInt({ min: 1, max: 5 })
  ],
  kpiController.getKPI
);

// POST /api/kpis/:id/update - Update KPI value
router.post('/:id/update', 
  [
    param('id').isUUID().withMessage('Invalid KPI ID'),
    body('currentValue').isFloat({ min: 0 }).withMessage('Valid current value required'),
    body('achievements').optional().isString().trim().isLength({ max: 500 }),
    body('challenges').optional().isString().trim().isLength({ max: 500 }),
    body('correctiveActions').optional().isString().trim().isLength({ max: 500 }),
    body('reportingDate').optional().isISO8601().withMessage('Valid date required')
  ],
  kpiController.updateKPI
);

// POST /api/kpis/:id/assign - Assign KPI to user (Admin/Manager only)
router.post('/:id/assign', 
  authMiddleware.isManagerOrAdmin,
  [
    param('id').isUUID().withMessage('Invalid KPI ID'),
    body('userId').isUUID().withMessage('Valid user ID required')
  ],
  kpiController.assignKPI
);

// POST /api/kpis/:id/documents - Upload document (50MB max)
router.post('/:id/documents',
  upload.single('document'),
  handleUploadError,
  kpiController.uploadDocument
);

// GET /api/kpis/:id/documents - Get KPI documents
router.get('/:id/documents',
  param('id').isUUID().withMessage('Invalid KPI ID'),
  kpiController.getKPIDocuments
);

// GET /api/kpis/stats - Get KPI statistics
router.get('/stats',
  [
    query('year').optional().isInt({ min: 2020, max: 2030 }),
    query('department').optional().isString()
  ],
  kpiController.getStats
);

// GET /api/kpis/export - Export KPIs
router.get('/export',
  [
    query('format').isIn(['csv', 'excel', 'pdf']).withMessage('Invalid export format'),
    query('year').optional().isInt({ min: 2020, max: 2030 })
  ],
  kpiController.exportKPIs
);

module.exports = router;
