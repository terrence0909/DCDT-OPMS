require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://sita-cloud.dcdt.gov.za'
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Create necessary directories
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DCDT OPMS Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'DCDT OPMS Backend API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Try to import and use routes safely
try {
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️  Auth routes not loaded:', error.message);
}

try {
  const kpiRoutes = require('./src/routes/kpis');
  app.use('/api/kpis', kpiRoutes);
  console.log('✅ KPI routes loaded');
} catch (error) {
  console.log('⚠️  KPI routes not loaded:', error.message);
}

try {
  const dashboardRoutes = require('./src/routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.log('⚠️  Dashboard routes not loaded:', error.message);
}

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error:`, err.stack);
  
  const errorResponse = {
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.statusCode || 500).json(errorResponse);
});

// Initialize database BEFORE starting server
async function initializeDatabase() {
  try {
    console.log('🚀 Starting DCDT OPMS Backend Server...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');
    
    // Initialize database if needed
    const sequelize = require('./src/config/database');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Only sync in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Syncing database models...');
      await sequelize.sync();
      console.log('✅ Database models synchronized');
      
      // Create default admin user if needed
      const User = require('./src/models/User');
      const bcrypt = require('bcryptjs');
      const adminExists = await User.findOne({ where: { username: 'admin' } });
      
      if (!adminExists) {
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
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// Start the server ONLY AFTER database is initialized
async function startServer() {
  const dbInitialized = await initializeDatabase();
  
  if (!dbInitialized) {
    console.error('❌ Cannot start server due to database initialization failure');
    process.exit(1);
  }
  
  // IMPORTANT: Only ONE app.listen() call
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
}

// Start the server
startServer();

module.exports = app;
