const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');

class LocalAuthService {
  async authenticateLocal(username, password) {
    try {
      console.log(`🔍 LocalAuth: Searching for user "${username}"`);
      
      // Find user in local database
      const user = await User.findOne({ 
        where: { 
          username: username
        }
      });
      
      if (!user) {
        console.log(`❌ LocalAuth: User "${username}" not found in database`);
        return null;
      }
      
      // Check if user is active
      if (!user.is_active) {
        console.log(`❌ LocalAuth: User "${username}" is not active`);
        return null;
      }
      
      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        console.log(`❌ LocalAuth: User "${username}" account is locked until ${user.locked_until}`);
        return null;
      }
      
      // Verify password - check if user has password_hash (local users only)
      if (!user.password_hash) {
        console.log(`❌ LocalAuth: User "${username}" has no local password (likely LDAP user)`);
        return null;
      }
      
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        console.log(`❌ LocalAuth: Invalid password for "${username}"`);
        return null;
      }
      
      console.log(`✅ LocalAuth: Successful for "${username}"`);
      
      // Return user data
      return {
        id: user.id,
        employee_number: user.employee_number,
        username: user.username,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        ad_object_guid: user.ad_object_guid,
        is_active: user.is_active,
        last_login: user.last_login
      };
      
    } catch (error) {
      console.error('❌ LocalAuth error:', error);
      return null;
    }
  }
  
  generateToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      employee_number: user.employee_number
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'DCDT-OPMS-SECRET-KEY-2025-CHANGE-IN-PRODUCTION',
      { expiresIn: '30m' } // Match your existing JWT expiry
    );
  }
}

module.exports = new LocalAuthService();
