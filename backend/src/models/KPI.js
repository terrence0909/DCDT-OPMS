// src/models/KPI.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KPI = sequelize.define('KPI', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: 'KPI-2025-001'
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  operational_plan_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assigned_to_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Project Manager assignment'
  },
  owner_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Branch/Program head'
  },
  target_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  measurement_unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  current_value: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  achieved_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  variance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('OnTrack', 'AtRisk', 'Pending', 'NotAchieved', 'Achieved'),
    defaultValue: 'Pending'
  },
  tracking_period_years: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    comment: 'Req 4.1.1.26 - Minimum 2-year tracking'
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'kpis',
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      fields: ['operational_plan_id']
    },
    {
      fields: ['assigned_to_user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['last_updated']
    }
  ]
});

module.exports = KPI;
// Define associations
KPI.associate = function(models) {
  KPI.belongsTo(models.User, {
    foreignKey: 'owner_user_id',
    as: 'owner'
  });
  
  KPI.belongsTo(models.User, {
    foreignKey: 'assigned_to_user_id',
    as: 'assigned_to'
  });
  
  KPI.hasMany(models.KPIUpdate, {
    foreignKey: 'kpi_id',
    as: 'updates'
  });
  
  KPI.hasMany(models.Document, {
    foreignKey: 'kpi_id',
    as: 'documents'
  });
  
  KPI.hasOne(models.CatchUpPlan, {
    foreignKey: 'kpi_id',
    as: 'catchUpPlan'
  });
};
