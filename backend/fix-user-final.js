const fs = require('fs');
const content = fs.readFileSync('src/models/User.js', 'utf8');

// Find the associate method
if (content.includes('User.associate')) {
  // Extract just the associate method
  const start = content.indexOf('User.associate');
  const end = content.indexOf('};', start) + 2;
  const associateMethod = content.substring(start, end);
  
  // Check for duplicate ownedKPIs
  const ownedKPIsCount = (associateMethod.match(/ownedKPIs/g) || []).length;
  
  if (ownedKPIsCount > 1) {
    console.log('Found duplicate ownedKPIs, fixing...');
    
    // Remove the associate method and add a clean one
    const newContent = content.substring(0, start) + content.substring(end);
    
    // Add clean associate method at the end
    const cleanAssociate = `
// Define associations
User.associate = function(models) {
  User.hasMany(models.KPI, {
    foreignKey: "owner_user_id",
    as: "ownedKPIs"
  });
  
  User.hasMany(models.KPI, {
    foreignKey: "assigned_to_user_id",
    as: "assignedKPIs"
  });
  
  User.hasMany(models.KPIUpdate, {
    foreignKey: "reported_by",
    as: "reportedUpdates"
  });
  
  User.hasMany(models.KPIUpdate, {
    foreignKey: "approved_by",
    as: "approvedUpdates"
  });
  
  User.hasMany(models.Document, {
    foreignKey: "uploaded_by",
    as: "uploadedDocuments"
  });
  
  User.hasMany(models.AuditLog, {
    foreignKey: "changed_by",
    as: "auditLogs"
  });
};`;
    
    fs.writeFileSync('src/models/User.js', newContent + cleanAssociate);
    console.log('✅ Fixed User associations');
  } else {
    console.log('✅ User associations look OK');
  }
} else {
  console.log('No associate method found in User.js');
}
