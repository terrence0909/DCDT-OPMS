const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const AuditLog = require('./AuditLog');
const KPI = require('./KPI');
const KPIUpdate = require('./KPIUpdate');
const CatchUpPlan = require('./CatchUpPlan');
const Document = require('./Document');
const ReportSubmission = require('./ReportSubmission');
const SystemNotification = require('./SystemNotification');

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  User,
  AuditLog,
  KPI,
  KPIUpdate,
  CatchUpPlan,
  Document,
  ReportSubmission,
  SystemNotification
};

// Call associate methods if they exist
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

module.exports = db;
