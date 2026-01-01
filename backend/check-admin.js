const { User } = require('./src/models');

async function checkAdmin() {
  try {
    const admin = await User.findOne({ where: { username: 'admin' } });
    
    if (!admin) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('  Username:', admin.username);
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Password hash exists:', !!admin.password_hash);
    console.log('  Password hash length:', admin.password_hash?.length || 0);
    console.log('  Password hash first 20 chars:', admin.password_hash?.substring(0, 20) || 'none');
    
    // Check if we can verify the password
    const bcrypt = require('bcrypt');
    const testPassword = 'admin123';
    
    if (admin.password_hash) {
      const isValid = await bcrypt.compare(testPassword, admin.password_hash);
      console.log('  Password "admin123" matches:', isValid);
      
      // Also try to hash the password to see what we get
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('  New hash for "admin123":', newHash.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
