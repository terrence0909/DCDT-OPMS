// src/services/ActiveDirectoryService.js
const ldap = require('ldapjs');
const winston = require('winston');

class ActiveDirectoryService {
  constructor() {
    this.ldapAvailable = false;
    this.client = null;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'ad-auth.log' })
      ]
    });
    
    console.log('🔐 Initializing LDAP connection to:', process.env.AD_URL || 'ldap://localhost:1389');
    
    // Initialize LDAP asynchronously - don't block server startup
    this.initializeLDAP();
  }

  initializeLDAP() {
    try {
      this.client = ldap.createClient({
        url: process.env.AD_URL || 'ldap://localhost:1389',
        timeout: 3000, // Shorter timeout
        connectTimeout: 5000,
        reconnect: false // Don't auto-reconnect
      });
      
      // Bind with service account
      this.client.bind(
        process.env.AD_SERVICE_USER || 'cn=svc_opms,dc=dcdt,dc=local',
        process.env.AD_SERVICE_PASSWORD || 'ServiceAccountPass123!',
        (err) => {
          if (err) {
            this.logger.error('AD Bind failed', { error: err.message });
            console.log('⚠️  LDAP bind failed (will use local auth only):', err.message);
            this.ldapAvailable = false;
            // Don't destroy client, just mark as unavailable
          } else {
            this.logger.info('AD Bind successful');
            console.log('✅ LDAP bind successful');
            this.ldapAvailable = true;
          }
        }
      );
      
      // Handle connection errors
      this.client.on('error', (err) => {
        console.log('⚠️  LDAP connection error:', err.message);
        this.ldapAvailable = false;
      });
      
    } catch (error) {
      console.log('⚠️  LDAP initialization error (will use local auth only):', error.message);
      this.ldapAvailable = false;
    }
  }

  async authenticate(username, password) {
    // If LDAP is not available, immediately return failure
    if (!this.ldapAvailable || !this.client) {
      console.log(`⚠️  LDAP not available, skipping AD auth for ${username}`);
      return {
        success: false,
        message: 'LDAP service unavailable'
      };
    }
    
    return new Promise((resolve, reject) => {
      const searchOptions = {
        scope: 'sub',
        filter: `(cn=${username})`,
        attributes: ['dn', 'cn', 'givenName', 'sn', 'mail', 'department', 'employeeNumber', 'title', 'memberOf']
      };

      const baseDN = process.env.AD_BASE_DN || 'dc=dcdt,dc=local';
      
      console.log(`🔍 Searching for user "${username}" in ${baseDN}`);
      
      this.client.search(baseDN, searchOptions, (err, res) => {
        if (err) {
          console.log(`⚠️  AD Search error for ${username}:`, err.message);
          return resolve({ 
            success: false, 
            message: 'AD connection failed' 
          });
        }

        let userDn = null;
        let userEntry = null;
        
        res.on('searchEntry', (entry) => {
          if (entry.object && entry.object.dn) {
            userDn = entry.object.dn;
            userEntry = entry.object;
          } else if (entry.dn) {
            userDn = entry.dn;
            userEntry = entry;
          }
        });

        res.on('end', () => {
          if (!userDn) {
            console.log(`❌ User ${username} not found in AD`);
            return resolve({ 
              success: false, 
              message: 'User not found in Active Directory' 
            });
          }

          const userClient = ldap.createClient({
            url: process.env.AD_URL || 'ldap://localhost:1389'
          });

          console.log(`🔐 Attempting AD authentication for: ${userDn}`);
          
          userClient.bind(userDn, password, (bindErr) => {
            userClient.unbind();
            if (bindErr) {
              console.log(`❌ AD authentication failed for ${username}:`, bindErr.message);
              return resolve({ 
                success: false, 
                message: 'Invalid credentials' 
              });
            }

            console.log(`✅ AD authentication successful for: ${username}`);
            
            // Extract user details
            const userDetails = this.extractUserDetails(username, userEntry);
            const role = this.determineRoleFromGroups(userDetails.groups);
            
            console.log(`👤 User ${username} role: ${role}`);
            
            resolve({
              success: true,
              user: {
                ...userDetails,
                role: role
              }
            });
          });
        });

        res.on('error', (error) => {
          console.log(`⚠️  AD Search stream error for ${username}:`, error.message);
          resolve({ 
            success: false, 
            message: 'AD search error' 
          });
        });
      });
    });
  }

  extractUserDetails(username, entry) {
    const fakeObjectGuid = this.generateFakeObjectGuid(username);
    
    const userDetails = {
      username: username,
      name: entry.givenName || entry.cn || username,
      email: entry.mail || `${username}@dcdt.gov.za`,
      department: entry.department || 'Unknown',
      title: entry.title || 'User',
      employeeNumber: entry.employeeNumber || username,
      objectGuid: fakeObjectGuid,
      groups: entry.memberOf || []
    };
    
    return userDetails;
  }

  generateFakeObjectGuid(username) {
    const hash = Buffer.from(username).toString('hex').padEnd(32, '0').substring(0, 32);
    return hash.toLowerCase();
  }

  determineRoleFromGroups(groups) {
    if (!groups || !Array.isArray(groups)) {
      return 'Viewer';
    }
    
    const groupMap = {
      'cn=OPMS_Admins,dc=dcdt,dc=local': 'Administrator',
      'cn=OPMS_Managers,dc=dcdt,dc=local': 'Manager', 
      'cn=OPMS_Officers,dc=dcdt,dc=local': 'Officer',
      'cn=OPMS_Viewers,dc=dcdt,dc=local': 'Viewer'
    };

    for (const group of groups) {
      if (groupMap[group]) {
        return groupMap[group];
      }
    }

    return 'Viewer';
  }
}

module.exports = new ActiveDirectoryService();
