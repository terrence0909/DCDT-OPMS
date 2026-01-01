const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnnualPerformancePlan = sequelize.define('AnnualPerformancePlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  strategic_plan_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'e.g., "2025/26 APP"'
  },
  financial_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0'
  },
  document_path: {
    type: DataTypes.STRING(500),
    comment: 'Path to uploaded PDF'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'annual_performance_plans',
  indexes: [
    {
      unique: true,
      fields: ['financial_year', 'version']
    }
  ]
});

module.exports = AnnualPerformancePlan;