// src/models/CatchUpPlan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CatchUpPlan = sequelize.define('CatchUpPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  kpi_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  challenges: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  root_cause_analysis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mitigation_strategy: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  action_plan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  target_completion_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  responsible_person_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Approved', 'InProgress', 'Completed', 'Cancelled'),
    defaultValue: 'Draft'
  },
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'catch_up_plans',
  comment: 'Req 4.1.1.25 - Catch-up plan component'
});

module.exports = CatchUpPlan;