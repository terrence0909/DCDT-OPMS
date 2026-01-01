// src/models/AuditLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  table_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  record_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'),
    allowNull: false
  },
  old_values: {
    type: DataTypes.JSON,
    comment: 'Previous state (for UPDATE/DELETE)'
  },
  new_values: {
    type: DataTypes.JSON,
    comment: 'New state (for CREATE/UPDATE)'
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45),
    comment: 'IPv4 or IPv6'
  },
  user_agent: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'audit_logs',
  indexes: [
    {
      fields: ['table_name', 'record_id']
    },
    {
      fields: ['changed_by']
    },
    {
      fields: ['created_at']
    }
  ],
  comment: 'Req 4.1.1.30 - Audit trail'
});

module.exports = AuditLog;