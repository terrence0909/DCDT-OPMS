const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');  // ADD THIS LINE - missing import
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('dev'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "DCDT OPMS Backend",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'DCDT OPMS Backend API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Try to import and use routes safely
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️  Auth routes not loaded:', error.message);
}

try {
  const kpiRoutes = require('./routes/kpis');
  app.use('/api/kpis', kpiRoutes);
  console.log('✅ KPI routes loaded');
} catch (error) {
  console.log('⚠️  KPI routes not loaded:', error.message);
}

try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.log('⚠️  Dashboard routes not loaded:', error.message);
}

// REMOVE THE 404 HANDLER FROM HERE - it's in the wrong place
// We'll add it at the end

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error:`, err.stack);
  
  const errorResponse = {
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.statusCode || 500).json(errorResponse);
});

// ADD 404 HANDLER HERE - after all routes but before database init
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Database and server initialization
const { sequelize } = require('./models');

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database models
    await sequelize.sync();
    console.log('✅ Database models synchronized');
    
    // Check for default admin user
    const { User } = require('./models');
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      const bcrypt = require('bcrypt');
      await User.create({
        employee_number: 'EMP001',
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@dcdt.gov.za',
        department: 'ICT',
        role: 'Administrator',
        is_active: true,
        last_login: new Date(),
        password_hash: bcrypt.hashSync('admin123', 10)
      });
      
      console.log('👤 Default admin user created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    }
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`
======================================================
✅ DCDT OPMS BACKEND SERVER RUNNING
======================================================
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
======================================================
AVAILABLE ENDPOINTS:
• Health Check: http://localhost:${PORT}/health
• API Test: http://localhost:${PORT}/api/test
• Login: http://localhost:${PORT}/api/auth/login
• KPIs: http://localhost:${PORT}/api/kpis
• Dashboard: http://localhost:${PORT}/api/dashboard
======================================================
TEST CREDENTIALS:
• Username: admin
• Password: admin123
======================================================
      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
