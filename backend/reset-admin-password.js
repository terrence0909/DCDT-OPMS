const { User } = require('./src/models');
const bcrypt = require('bcrypt');

async function resetPassword() {
  try {
    const admin = await User.findOne({ where: { username: 'admin' } });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    // Reset to "admin123"
    const newHash = await bcrypt.hash('admin123', 10);
    admin.password_hash = newHash;
    await admin.save();
    
    console.log('✅ Admin password reset to "admin123"');
    console.log('New hash:', newHash.substring(0, 30) + '...');
    
    // Verify it works
    const isValid = await bcrypt.compare('admin123', newHash);
    console.log('Verification test:', isValid ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

resetPassword();
