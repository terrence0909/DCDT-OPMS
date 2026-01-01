const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const reportController = require('../controllers/ReportController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/reports - List all reports
router.get('/', reportController.getAllReports);

// GET /api/reports/types - Get report types
router.get('/types', reportController.getReportTypes);

// GET /api/reports/generate - Generate report
router.get('/generate',
  [
    query('type').isIn(['performance', 'department', 'kpi', 'compliance']).withMessage('Valid report type required'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('department').optional().isString(),
    query('format').isIn(['pdf', 'excel', 'json']).withMessage('Valid format required')
  ],
  reportController.generateReport
);

// GET /api/reports/:id - Get specific report
router.get('/:id',
  param('id').isUUID().withMessage('Invalid report ID'),
  reportController.getReport
);

// POST /api/reports - Create new report
router.post('/',
  authMiddleware.isManagerOrAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['performance', 'department', 'kpi', 'compliance']).withMessage('Valid type required'),
    body('parameters').optional().isObject(),
    body('schedule').optional().isObject()
  ],
  reportController.createReport
);

// DELETE /api/reports/:id - Delete report
router.delete('/:id',
  authMiddleware.isAdmin,
  param('id').isUUID().withMessage('Invalid report ID'),
  reportController.deleteReport
);

module.exports = router;
