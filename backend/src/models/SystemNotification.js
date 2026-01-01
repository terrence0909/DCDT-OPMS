const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemNotification = sequelize.define('SystemNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Deadline', 'Target', 'Alert', 'Downtime', 'Info'),
    defaultValue: 'Info'
  },
  target_role: {
    type: DataTypes.STRING(50)
  },
  target_department: {
    type: DataTypes.STRING(200)
  },
  target_user_id: {
    type: DataTypes.UUID
  },
  is_broadcast: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expires_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'system_notifications'
});

module.exports = SystemNotification;