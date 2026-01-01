const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAccessRequest = sequelize.define('UserAccessRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employee_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  requested_role: {
    type: DataTypes.ENUM('Viewer', 'Officer', 'Manager', 'Administrator'),
    allowNull: false
  },
  justification: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('Pending', 'SupervisorApproved', 'SystemOwnerApproved', 'ITApproved', 'Active', 'Rejected'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'user_access_requests'
});

module.exports = UserAccessRequest;