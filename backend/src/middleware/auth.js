const jwt = require('jsonwebtoken');

// Main authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'DCDT-OPMS-SECRET-KEY-2025-CHANGE-IN-PRODUCTION'
    );
    
    // Attach user to request
    req.user = decoded;
    req.user.userId = decoded.userId || decoded.id; // Support both userId and id
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role checking middleware
authMiddleware.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Admin only middleware
authMiddleware.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Administrator') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator role required.'
    });
  }
  next();
};

// Manager or Admin middleware
authMiddleware.isManagerOrAdmin = (req, res, next) => {
  if (!req.user || !['Administrator', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager or Administrator role required.'
    });
  }
  next();
};

module.exports = authMiddleware;
