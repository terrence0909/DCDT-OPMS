// src/models/ReportingPeriod.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportingPeriod = sequelize.define('ReportingPeriod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('Monthly', 'Quarterly', 'Annual'),
    allowNull: false
  },
  period_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g., "April 2024", "Q1 2024"'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  opening_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Req 4.1.1.21 - System opens for reporting'
  },
  closing_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Req 4.1.1.21 - System closes for reporting'
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Req 4.1.1.21 - Administrators control accessibility'
  },
  locked_at: {
    type: DataTypes.DATE
  },
  locked_by: {
    type: DataTypes.UUID
  }
}, {
  tableName: 'reporting_periods',
  indexes: [
    {
      unique: true,
      fields: ['type', 'period_name']
    },
    {
      fields: ['is_open']
    },
    {
      fields: ['opening_date', 'closing_date']
    }
  ]
});

module.exports = ReportingPeriod;