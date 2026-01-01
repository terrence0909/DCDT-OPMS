// src/models/StrategicPlan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StrategicPlan = sequelize.define('StrategicPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'e.g., "2025-2030 Strategic Plan"'
  },
  financial_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Starting financial year'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  document_path: {
    type: DataTypes.STRING(500),
    comment: 'Path to uploaded PDF'
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'strategic_plans',
  indexes: [
    {
      unique: true,
      fields: ['financial_year', 'version']
    }
  ]
});

module.exports = StrategicPlan;