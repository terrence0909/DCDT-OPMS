const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

// 30-minute session timeout middleware
const sessionTimeout = (req, res, next) => {
  // Skip for auth endpoints
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const now = Date.now() / 1000;
    const timeRemaining = decoded.exp - now;

    // Warn at 5 minutes remaining
    if (timeRemaining < 300 && timeRemaining > 0) {
      res.set('X-Session-Warning', `Session expires in ${Math.floor(timeRemaining)} seconds`);
    }

    // Auto-logout at expiration
    if (timeRemaining <= 0) {
      // Log automatic logout
      if (decoded.userId) {
        AuditLog.create({
          table_name: 'users',
          record_id: decoded.userId,
          action: 'SESSION_EXPIRED',
          changed_by: decoded.userId,
          ip_address: req.ip,
          user_agent: req.get('user-agent')
        }).catch(console.error);
      }

      return res.status(401).json({
        error: 'Session expired',
        code: 'SESSION_EXPIRED',
        redirectTo: '/login'
      });
    }
  } catch (error) {
    // Token verification failed
    console.error('Session timeout check error:', error);
  }

  next();
};

// Idle timeout detection (30 minutes of inactivity)
const idleTimeout = (req, res, next) => {
  if (!req.session) {
    return next();
  }

  const now = Date.now();
  const lastActivity = req.session.lastActivity || now;
  const idleTime = now - lastActivity;

  // 30 minutes idle timeout
  if (idleTime > 30 * 60 * 1000) {
    // Clear session
    req.session.destroy();
    
    return res.status(401).json({
      error: 'Session terminated due to inactivity',
      code: 'IDLE_TIMEOUT',
      redirectTo: '/login'
    });
  }

  // Update last activity
  req.session.lastActivity = now;
  next();
};

module.exports = { sessionTimeout, idleTimeout };