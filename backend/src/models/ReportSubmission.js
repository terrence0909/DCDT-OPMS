const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportSubmission = sequelize.define('ReportSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reporting_period_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  submitted_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Overdue'),
    defaultValue: 'Draft'
  },
  comments: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'report_submissions'
});

module.exports = ReportSubmission;