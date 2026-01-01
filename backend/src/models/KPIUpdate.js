// src/models/KPIUpdate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KPIUpdate = sequelize.define('KPIUpdate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  kpi_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reporting_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  current_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  achievements: {
    type: DataTypes.STRING(500),
    validate: {
      maxWords(value) {
        if (value && value.split(' ').length > 50) {
          throw new Error('Maximum 50 words allowed for achievements');
        }
      }
    },
    comment: 'Req 4.1.1.15 - 50 word limit'
  },
  challenges: {
    type: DataTypes.STRING(500),
    validate: {
      maxWords(value) {
        if (value && value.split(' ').length > 50) {
          throw new Error('Maximum 50 words allowed for challenges');
        }
      }
    }
  },
  corrective_actions: {
    type: DataTypes.STRING(500),
    validate: {
      maxWords(value) {
        if (value && value.split(' ').length > 50) {
          throw new Error('Maximum 50 words allowed for corrective actions');
        }
      }
    }
  },
  approval_status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'ReturnedForCorrection'),
    defaultValue: 'Draft'
  },
  approval_comments: {
    type: DataTypes.TEXT
  },
  approved_at: {
    type: DataTypes.DATE
  },
  approved_by: {
    type: DataTypes.UUID
  }
}, {
  tableName: 'kpi_updates',
  indexes: [
    {
      fields: ['kpi_id', 'reporting_date']
    },
    {
      fields: ['approval_status']
    }
  ]
});

module.exports = KPIUpdate;
// Define associations


// Define associations
KPIUpdate.associate = function(models) {
  KPIUpdate.belongsTo(models.KPI, {
    foreignKey: "kpi_id",
    as: "kpi"
  });
  
  KPIUpdate.belongsTo(models.User, {
    foreignKey: "reported_by",
    as: "reporter"
  });
  
  KPIUpdate.belongsTo(models.User, {
    foreignKey: "approved_by",
    as: "approver"
  });
};