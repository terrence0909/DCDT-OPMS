// src/models/Document.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  kpi_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    comment: 'S3/Blob storage path'
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      max: 52428800, // 50MB in bytes
      min: 1
    },
    comment: 'Req 4.1.1.14 - Maximum 50MB'
  },
  description: {
    type: DataTypes.TEXT
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'documents',
  indexes: [
    {
      fields: ['kpi_id']
    },
    {
      fields: ['uploaded_by']
    }
  ]
});

module.exports = Document;
// Define associations
Document.associate = function(models) {
  Document.belongsTo(models.KPI, {
    foreignKey: 'kpi_id',
    as: 'kpi'
  });
  
  Document.belongsTo(models.User, {
    foreignKey: 'uploaded_by',
    as: 'uploadedBy'
  });
};
