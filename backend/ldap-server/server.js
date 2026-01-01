const ldap = require('ldapjs');
const fs = require('fs');
const path = require('path');

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

console.log('🔐 Starting DCDT LDAP Server...');

// Create LDAP server
const server = ldap.createServer();

// Store users in memory (in production, this would be real AD)
const users = {
  // Service Account for OPMS
  'cn=svc_opms,dc=dcdt,dc=local': {
    dn: 'cn=svc_opms,dc=dcdt,dc=local',
    attributes: {
      cn: 'svc_opms',
      sn: 'OPMS Service',
      objectClass: ['simpleSecurityObject', 'organizationalRole'],
      description: 'Service account for OPMS system',
      userPassword: 'ServiceAccountPass123!'
    }
  },
  // DCDT Users
  'cn=jdoe,dc=dcdt,dc=local': {
    dn: 'cn=jdoe,dc=dcdt,dc=local',
    attributes: {
      cn: 'jdoe',
      sn: 'Doe',
      givenName: 'John',
      mail: 'john.doe@dcdt.gov.za',
      objectClass: ['inetOrgPerson', 'organizationalPerson', 'person'],
      userPassword: 'Password123!',
      department: 'ICT',
      title: 'System Administrator',
      employeeNumber: 'EMP001',
      memberOf: ['cn=OPMS_Admins,dc=dcdt,dc=local']
    }
  },
  'cn=jsmith,dc=dcdt,dc=local': {
    dn: 'cn=jsmith,dc=dcdt,dc=local',
    attributes: {
      cn: 'jsmith',
      sn: 'Smith',
      givenName: 'Jane',
      mail: 'jane.smith@dcdt.gov.za',
      objectClass: ['inetOrgPerson', 'organizationalPerson', 'person'],
      userPassword: 'Password123!',
      department: 'Broadband',
      title: 'Senior Manager',
      employeeNumber: 'EMP002',
      memberOf: ['cn=OPMS_Managers,dc=dcdt,dc=local']
    }
  },
  'cn=rbrown,dc=dcdt,dc=local': {
    dn: 'cn=rbrown,dc=dcdt,dc=local',
    attributes: {
      cn: 'rbrown',
      sn: 'Brown',
      givenName: 'Robert',
      mail: 'robert.brown@dcdt.gov.za',
      objectClass: ['inetOrgPerson', 'organizationalPerson', 'person'],
      userPassword: 'Password123!',
      department: 'Digital Economy',
      title: 'Project Officer',
      employeeNumber: 'EMP003',
      memberOf: ['cn=OPMS_Officers,dc=dcdt,dc=local']
    }
  },
  'cn=swilson,dc=dcdt,dc=local': {
    dn: 'cn=swilson,dc=dcdt,dc=local',
    attributes: {
      cn: 'swilson',
      sn: 'Wilson',
      givenName: 'Sarah',
      mail: 'sarah.wilson@dcdt.gov.za',
      objectClass: ['inetOrgPerson', 'organizationalPerson', 'person'],
      userPassword: 'Password123!',
      department: 'Governance',
      title: 'Policy Analyst',
      employeeNumber: 'EMP004',
      memberOf: ['cn=OPMS_Viewers,dc=dcdt,dc=local']
    }
  },
  // AD Groups
  'cn=OPMS_Admins,dc=dcdt,dc=local': {
    dn: 'cn=OPMS_Admins,dc=dcdt,dc=local',
    attributes: {
      cn: 'OPMS_Admins',
      objectClass: ['groupOfNames'],
      description: 'OPMS System Administrators',
      member: ['cn=jdoe,dc=dcdt,dc=local']
    }
  },
  'cn=OPMS_Managers,dc=dcdt,dc=local': {
    dn: 'cn=OPMS_Managers,dc=dcdt,dc=local',
    attributes: {
      cn: 'OPMS_Managers',
      objectClass: ['groupOfNames'],
      description: 'OPMS Department Managers',
      member: ['cn=jsmith,dc=dcdt,dc=local']
    }
  },
  'cn=OPMS_Officers,dc=dcdt,dc=local': {
    dn: 'cn=OPMS_Officers,dc=dcdt,dc=local',
    attributes: {
      cn: 'OPMS_Officers',
      objectClass: ['groupOfNames'],
      description: 'OPMS Project Officers',
      member: ['cn=rbrown,dc=dcdt,dc=local']
    }
  },
  'cn=OPMS_Viewers,dc=dcdt,dc=local': {
    dn: 'cn=OPMS_Viewers,dc=dcdt,dc=local',
    attributes: {
      cn: 'OPMS_Viewers',
      objectClass: ['groupOfNames'],
      description: 'OPMS Report Viewers',
      member: ['cn=swilson,dc=dcdt,dc=local']
    }
  }
};

// Bind operation (authentication)
server.bind('dc=dcdt,dc=local', (req, res, next) => {
  const dn = req.dn.toString();
  const password = req.credentials;
  
  console.log(`🔐 Bind attempt: ${dn}`);
  
  const user = users[dn];
  
  if (!user) {
    console.log(`❌ User not found: ${dn}`);
    return next(new ldap.NoSuchObjectError(dn));
  }
  
  if (user.attributes.userPassword !== password) {
    console.log(`❌ Invalid password for: ${dn}`);
    return next(new ldap.InvalidCredentialsError());
  }
  
  console.log(`✅ Authentication successful: ${dn}`);
  res.end();
  return next();
});

// Search operation
server.search('dc=dcdt,dc=local', (req, res, next) => {
  const base = req.dn.toString();
  const filter = req.filter;
  
  console.log(`🔍 Search request: ${base}, Filter: ${filter.toString()}`);
  
  Object.values(users).forEach(user => {
    if (user.dn.toLowerCase().includes(base.toLowerCase())) {
      // Check if user matches the filter
      if (matchesFilter(user, filter)) {
        console.log(`   Found: ${user.dn}`);
        res.send(user);
      }
    }
  });
  
  res.end();
  next();
});

// Helper function to check if user matches LDAP filter
function matchesFilter(user, filter) {
  if (filter.type === 'and') {
    return filter.filters.every(f => matchesFilter(user, f));
  }
  
  if (filter.type === 'or') {
    return filter.filters.some(f => matchesFilter(user, f));
  }
  
  if (filter.type === 'equal') {
    const attribute = filter.attribute;
    const value = filter.value;
    
    if (user.attributes[attribute]) {
      if (Array.isArray(user.attributes[attribute])) {
        return user.attributes[attribute].includes(value);
      }
      return user.attributes[attribute] === value;
    }
    
    return false;
  }
  
  return true;
}

// Start server - CHANGED PORT FROM 389 TO 1389
const PORT = 1389;
server.listen(PORT, () => {
  console.log(`
======================================================
✅ DCDT LDAP SERVER RUNNING
======================================================
📍 Port: ${PORT}
🌐 URL: ldap://localhost:${PORT}
📁 Base DN: dc=dcdt,dc=local
======================================================
AVAILABLE ACCOUNTS:
• Service Account: cn=svc_opms,dc=dcdt,dc=local
  Password: ServiceAccountPass123!
• Admin: cn=jdoe,dc=dcdt,dc=local
  Password: Password123!
  Role: Administrator
• Manager: cn=jsmith,dc=dcdt,dc=local
  Password: Password123!
  Role: Manager
• Officer: cn=rbrown,dc=dcdt,dc=local
  Password: Password123!
  Role: Officer
• Viewer: cn=swilson,dc=dcdt,dc=local
  Password: Password123!
  Role: Viewer
======================================================
Test with: ldapsearch -x -H ldap://localhost:${PORT} -b "dc=dcdt,dc=local"
======================================================
  `);
});

// Handle errors
server.on('error', (err) => {
  console.error('LDAP Server Error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down LDAP server...');
  server.close(() => {
    console.log('✅ LDAP server stopped');
    process.exit(0);
  });
});