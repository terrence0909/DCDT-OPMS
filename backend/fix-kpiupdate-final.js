const fs = require('fs');
const content = fs.readFileSync('src/models/KPIUpdate.js', 'utf8');

// Remove existing associate method
const lines = content.split('\n');
let inAssociate = false;
let newContent = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('KPIUpdate.associate')) {
    inAssociate = true;
  }
  
  if (!inAssociate) {
    newContent.push(lines[i]);
  }
  
  if (inAssociate && lines[i].trim() === '};') {
    inAssociate = false;
  }
}

// Add corrected associate method
newContent.push('');
newContent.push('// Define associations');
newContent.push('KPIUpdate.associate = function(models) {');
newContent.push('  KPIUpdate.belongsTo(models.KPI, {');
newContent.push('    foreignKey: "kpi_id",');
newContent.push('    as: "kpi"');
newContent.push('  });');
newContent.push('  ');
newContent.push('  KPIUpdate.belongsTo(models.User, {');
newContent.push('    foreignKey: "reported_by",');
newContent.push('    as: "reporter"');  // Different name from column
newContent.push('  });');
newContent.push('  ');
newContent.push('  KPIUpdate.belongsTo(models.User, {');
newContent.push('    foreignKey: "approved_by",');
newContent.push('    as: "approver"');  // Different name from column
newContent.push('  });');
newContent.push('};');

fs.writeFileSync('src/models/KPIUpdate.js', newContent.join('\n'));
console.log('✅ Fixed KPIUpdate associations');
