const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(authMiddleware.isAdmin);

// GET /api/admin/dashboard - Admin dashboard
router.get('/dashboard', adminController.getDashboard);

// GET /api/admin/system-health - System health check
router.get('/system-health', adminController.getSystemHealth);

// GET /api/admin/audit-logs - Get audit logs
router.get('/audit-logs',
  [
    param('page').optional().isInt({ min: 1 }),
    param('limit').optional().isInt({ min: 1, max: 100 }),
    param('action').optional().isString(),
    param('user').optional().isUUID()
  ],
  adminController.getAuditLogs
);

// GET /api/admin/access-requests - Get pending access requests
router.get('/access-requests', adminController.getAccessRequests);

// POST /api/admin/access-requests/:id/approve - Approve access request
router.post('/access-requests/:id/approve',
  param('id').isUUID().withMessage('Invalid request ID'),
  body('role').isIn(['Viewer', 'Officer', 'Manager', 'Administrator']).withMessage('Valid role required'),
  adminController.approveAccessRequest
);

// POST /api/admin/access-requests/:id/reject - Reject access request
router.post('/access-requests/:id/reject',
  param('id').isUUID().withMessage('Invalid request ID'),
  body('reason').optional().trim(),
  adminController.rejectAccessRequest
);

// POST /api/admin/users/:id/disable - Disable user account
router.post('/users/:id/disable',
  param('id').isUUID().withMessage('Invalid user ID'),
  body('reason').optional().trim(),
  adminController.disableUser
);

// POST /api/admin/users/:id/enable - Enable user account
router.post('/users/:id/enable',
  param('id').isUUID().withMessage('Invalid user ID'),
  adminController.enableUser
);

// GET /api/admin/reports - Generate admin reports
router.get('/reports',
  [
    param('type').isIn(['usage', 'performance', 'compliance']).withMessage('Valid report type required'),
    param('startDate').optional().isISO8601(),
    param('endDate').optional().isISO8601()
  ],
  adminController.generateReport
);

// POST /api/admin/system/maintenance - Toggle maintenance mode
router.post('/system/maintenance',
  body('enabled').isBoolean().withMessage('Enabled must be boolean'),
  body('message').optional().trim(),
  adminController.toggleMaintenance
);

module.exports = router;
