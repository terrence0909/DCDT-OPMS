const fs = require('fs');
let content = fs.readFileSync('src/controllers/KPIController.js', 'utf8');

// Replace all instances of the old association names
content = content.replace(/as: 'reported_by'/g, "as: 'reporter'");
content = content.replace(/as: 'approved_by'/g, "as: 'approver'");

fs.writeFileSync('src/controllers/KPIController.js', content);
console.log('✅ Updated KPIController association names');
