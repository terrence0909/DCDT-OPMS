const AuditLog = require('../models/AuditLog');

const auditMiddleware = async (req, res, next) => {
  // Skip logging for certain endpoints
  const skipPaths = ['/health', '/metrics', '/uploads'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Store original end function
  const originalEnd = res.end;
  const startTime = Date.now();
  
  // Override end function to log after response
  res.end = async function(...args) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    try {
      // Only log significant actions
      const significantMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      const isSignificant = significantMethods.includes(req.method) && res.statusCode < 400;
      
      if (isSignificant && req.user?.userId) {
        await AuditLog.create({
          table_name: determineTableName(req.path),
          record_id: req.params.id || 'multiple',
          action: req.method,
          changed_by: req.user.userId,
          ip_address: req.ip,
          user_agent: req.get('user-agent'),
          new_values: {
            path: req.path,
            method: req.method,
            statusCode: res.statusCode,
            responseTime
          }
        });
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't fail the request if audit logging fails
    }
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};

function determineTableName(path) {
  if (path.includes('/kpis')) return 'kpis';
  if (path.includes('/users')) return 'users';
  if (path.includes('/reports')) return 'reports';
  if (path.includes('/documents')) return 'documents';
  if (path.includes('/auth')) return 'auth';
  return 'system';
}

module.exports = auditMiddleware;