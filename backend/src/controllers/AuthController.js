const jwt = require('jsonwebtoken');
const ActiveDirectoryService = require('../services/ActiveDirectoryService');
const { User, AuditLog } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      console.log(`🔐 Login attempt for: ${username} from IP: ${ipAddress}`);

      // Find user in database
      const user = await User.findOne({ where: { username } });
      
      // Check if user is locked
      if (user && user.locked_until && user.locked_until > new Date()) {
        return res.status(423).json({
          error: 'Account locked. Too many failed attempts.',
          lockedUntil: user.locked_until
        });
      }

      // 1. Try local authentication (for admin in SQLite)
      if (user && user.password_hash) {
        console.log(`🔍 Trying local authentication for ${username}`);
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (validPassword) {
          console.log(`✅ Local authentication successful for "${username}"`);
          
          // Update user
          user.login_attempts = 0;
          user.locked_until = null;
          user.last_login = new Date();
          await user.save();
          
          // Generate token
          const token = jwt.sign(
            {
              userId: user.id,
              username: user.username,
              role: user.role,
              department: user.department
            },
            process.env.JWT_SECRET || 'DCDT-OPMS-SECRET-KEY-2025-CHANGE-IN-PRODUCTION',
            { expiresIn: '30m' }
          );

          // Log
          await AuditLog.create({
            table_name: 'users',
            record_id: user.id,
            action: 'LOGIN_SUCCESS',
            changed_by: user.id,
            ip_address: ipAddress,
            user_agent: userAgent
          });

          return res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              lastLogin: user.last_login
            },
            expiresIn: 1800
          });
        } else {
          console.log(`❌ Local authentication failed for "${username}"`);
          
          // Update failed attempts
          if (user) {
            user.login_attempts += 1;
            if (user.login_attempts >= 4) {
              user.locked_until = new Date(Date.now() + 30 * 60 * 1000);
            }
            await user.save();
          }
          
          await AuditLog.create({
            table_name: 'users',
            record_id: user?.id || 'unknown',
            action: 'LOGIN_FAILED',
            changed_by: user?.id || null,
            ip_address: ipAddress,
            user_agent: userAgent,
            new_values: { username, reason: 'Invalid password' }
          });
        }
      }

      // 2. If local auth failed or user doesn't exist, try LDAP
      console.log(`🔄 Trying LDAP authentication for ${username}`);
      
      const adResult = await ActiveDirectoryService.authenticate(username, password);
      
      if (adResult && adResult.success) {
        console.log(`✅ LDAP authentication successful for ${username}`);
        
        // LDAP user handling would go here
        // For now, just return error since LDAP is disabled
        
        return res.status(401).json({ 
          error: 'LDAP authentication is currently disabled',
          hint: 'Use local admin: username=admin, password=admin123'
        });
      }
      
      // 3. If all authentication methods failed
      console.log(`❌ All authentication methods failed for ${username}`);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        hint: 'Try username=admin, password=admin123'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await AuditLog.create({
          table_name: 'users',
          record_id: userId,
          action: 'LOGOUT',
          changed_by: userId,
          ip_address: req.ip,
          user_agent: req.get('user-agent')
        });
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSessionStatus(req, res) {
    const expiresAt = new Date(req.user.exp * 1000);
    const remainingSeconds = Math.floor((expiresAt - new Date()) / 1000);
    
    res.json({
      expiresAt,
      remainingSeconds,
      timeoutWarning: remainingSeconds < 300
    });
  }

  async requestAccess(req, res) {
    try {
      const { employeeNumber, name, email, department, requestedRole, justification } = req.body;
      const ipAddress = req.ip;

      // Simplified for now
      return res.status(201).json({
        message: 'Access request feature not implemented in demo',
        requestId: 'demo-123'
      });

    } catch (error) {
      console.error('Access request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
