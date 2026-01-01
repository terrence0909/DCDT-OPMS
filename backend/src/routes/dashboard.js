const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/overview - Dashboard overview
router.get('/overview', dashboardController.getOverview);

// GET /api/dashboard/my-kpis - User's KPIs
router.get('/my-kpis', dashboardController.getMyKPIs);

// GET /api/dashboard/department - Department dashboard
router.get('/department', dashboardController.getDepartmentDashboard);

// GET /api/dashboard/alerts - Alerts
router.get('/alerts', dashboardController.getAlerts);

// GET /api/dashboard/recent-activity - Recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

// GET /api/dashboard/performance-trends - Performance trends
router.get('/performance-trends', dashboardController.getPerformanceTrends);

module.exports = router;
