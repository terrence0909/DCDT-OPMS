// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employee_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: 'State employee number'
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    comment: 'Active Directory username'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  department: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Administrator', 'Manager', 'Officer', 'Viewer'),
    defaultValue: 'Viewer',
    allowNull: false
  },
  ad_object_guid: {
    type: DataTypes.STRING(100),
    unique: true,
    comment: 'Active Directory Object GUID'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true // For AD users, password stored in AD
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['employee_number']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      fields: ['department']
    },
    {
      fields: ['role']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

module.exports = User;
// Define associations
User.associate = function(models) {
  User.hasMany(models.KPI, {
    foreignKey: 'owner_user_id',
    as: 'ownedKPIs'
  });
  
  User.hasMany(models.KPI, {
    foreignKey: 'assigned_to_user_id',
    as: 'assignedKPIs'
  });
  
  User.hasMany(models.KPIUpdate, {
    foreignKey: 'reported_by',
    as: 'reportedUpdates'
  });
  
  User.hasMany(models.KPIUpdate, {
    foreignKey: 'approved_by',
    as: 'approvedUpdates'
  });
  
  User.hasMany(models.Document, {
    foreignKey: 'uploaded_by',
    as: 'uploadedDocuments'
  });
  
  User.hasMany(models.AuditLog, {
    foreignKey: 'changed_by',
    as: 'auditLogs'
  });
};
