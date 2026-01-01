const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperationalPlan = sequelize.define('OperationalPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  annual_plan_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  program: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  branch: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'operational_plans'
});

module.exports = OperationalPlan;