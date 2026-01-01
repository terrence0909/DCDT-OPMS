const KPI = require('../models/KPI');
const sequelize = require("../config/database");

const KPIUpdate = require('../models/KPIUpdate');
const CatchUpPlan = require('../models/CatchUpPlan');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { Op } = require('sequelize');

class KPIController {
  // Get all KPIs with filters
  async getKPIs(req, res) {
    try {
      const { program, status, assignedTo, year } = req.query;
      const userId = req.user.userId;
      const userRole = req.user.role;

      let where = {};
      
      // Filter by program
      if (program) {
        where.program = program;
      }
      
      // Filter by status
      if (status) {
        where.status = status;
      }
      
      // Filter by assigned user
      if (assignedTo) {
        where.assigned_to_user_id = assignedTo;
      }
      
      // Filter by year
      if (year) {
        where.year = year;
      }

      // Role-based filtering
      if (userRole === 'Officer') {
        where.assigned_to_user_id = userId;
      } else if (userRole === 'Manager') {
        // Managers see KPIs in their department
        const user = await User.findByPk(userId);
        where.department = user.department;
      }
      // Admins see all

      const kpis = await KPI.findAll({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'assigned_to',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: kpis
      });
    } catch (error) {
      console.error('Error getting KPIs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single KPI with history
  async getKPI(req, res) {
    try {
      const { id } = req.params;
      const { years = 1 } = req.query;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const kpi = await KPI.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'assigned_to',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Document,
            as: 'documents',
            attributes: ['id', 'filename', 'original_name', 'file_size', 'uploaded_by', 'created_at']
          }
        ]
      });

      if (!kpi) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      // Check access rights
      if (userRole === 'Officer' && kpi.assigned_to_user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get historical data
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);

      const history = await KPIUpdate.findAll({
        where: {
          kpi_id: id,
          created_at: { [Op.gte]: startDate }
        },
        order: [['reporting_period', 'DESC']],
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Get catch-up plans if any
      const catchUpPlans = await CatchUpPlan.findAll({
        where: { kpi_id: id },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          kpi,
          history,
          catchUpPlans
        }
      });
    } catch (error) {
      console.error('Error getting KPI:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update KPI value
  async updateKPI(req, res) {
    try {
      const { id } = req.params;
      const { currentValue, achievements, challenges, correctiveActions, reportingDate } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const kpi = await KPI.findByPk(id);
      if (!kpi) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      // Check access rights
      if (userRole === 'Officer' && kpi.assigned_to_user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create update record
      const update = await KPIUpdate.create({
        kpi_id: id,
        current_value: currentValue,
        achievements: achievements || null,
        challenges: challenges || null,
        corrective_actions: correctiveActions || null,
        reporting_period: reportingDate || new Date(),
        reported_by: userId,
        approval_status: userRole === 'Officer' ? 'pending' : 'approved',
        approved_by: userRole !== 'Officer' ? userId : null
      });

      // Update KPI current value
      kpi.current_value = currentValue;
      kpi.last_updated = new Date();
      
      // Recalculate status based on target
      const percentage = (currentValue / kpi.target_value) * 100;
      if (percentage >= 100) {
        kpi.status = 'Achieved';
      } else if (percentage >= 80) {
        kpi.status = 'OnTrack';
      } else if (percentage >= 50) {
        kpi.status = 'AtRisk';
      } else {
        kpi.status = 'NotAchieved';
      }

      await kpi.save();

      // Check if catch-up plan is needed
      if (percentage < 80) {
        await this.createCatchUpPlanIfNeeded(kpi, userId);
      }

      // Log the action
      await AuditLog.create({
        table_name: 'kpi_updates',
        record_id: update.id,
        action: 'CREATE',
        changed_by: userId,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        new_values: JSON.stringify(update.toJSON())
      });

      res.json({
        success: true,
        message: 'KPI updated successfully',
        data: update
      });
    } catch (error) {
      console.error('Error updating KPI:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Assign KPI to user
  async assignKPI(req, res) {
    try {
      const { id } = req.params;
      const { userId: assignToUserId } = req.body;
      const assignedByUserId = req.user.userId;

      const kpi = await KPI.findByPk(id);
      if (!kpi) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      const userToAssign = await User.findByPk(assignToUserId);
      if (!userToAssign) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update KPI assignment
      const oldAssignedTo = kpi.assigned_to_user_id;
      kpi.assigned_to_user_id = assignToUserId;
      kpi.assigned_at = new Date();
      await kpi.save();

      // Log the action
      await AuditLog.create({
        table_name: 'kpis',
        record_id: id,
        action: 'ASSIGN',
        changed_by: assignedByUserId,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        old_values: JSON.stringify({ assigned_to_user_id: oldAssignedTo }),
        new_values: JSON.stringify({ assigned_to_user_id: assignToUserId })
      });

      res.json({
        success: true,
        message: 'KPI assigned successfully',
        data: kpi
      });
    } catch (error) {
      console.error('Error assigning KPI:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create catch-up plan if needed
  async createCatchUpPlanIfNeeded(kpi, userId) {
    try {
      // Check if there's already an active catch-up plan
      const existingPlan = await CatchUpPlan.findOne({
        where: {
          kpi_id: kpi.id,
          status: 'active'
        }
      });

      if (!existingPlan) {
        const catchUpPlan = await CatchUpPlan.create({
          kpi_id: kpi.id,
          title: `Catch-up Plan for ${kpi.name}`,
          description: `Automatic catch-up plan created due to performance below 80% target.`,
          target_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          created_by: userId,
          status: 'active'
        });

        await AuditLog.create({
          table_name: 'catch_up_plans',
          record_id: catchUpPlan.id,
          action: 'CREATE',
          changed_by: userId,
          new_values: JSON.stringify(catchUpPlan.toJSON())
        });
      }
    } catch (error) {
      console.error('Error creating catch-up plan:', error);
    }
  }

  // Upload document
  async uploadDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const kpi = await KPI.findByPk(id);
      if (!kpi) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      // Check access rights
      if (userRole === 'Officer' && kpi.assigned_to_user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const document = await Document.create({
        kpi_id: id,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: userId,
        document_type: req.body.documentType || 'Supporting Document'
      });

      // Log the action
      await AuditLog.create({
        table_name: 'documents',
        record_id: document.id,
        action: 'UPLOAD',
        changed_by: userId,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        new_values: JSON.stringify({
          filename: document.filename,
          original_name: document.original_name,
          file_size: document.file_size
        })
      });

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get KPI comparison
  async getComparison(req, res) {
    try {
      const { kpiId1, kpiId2 } = req.query;

      const kpi1 = await KPI.findByPk(kpiId1);
      const kpi2 = await KPI.findByPk(kpiId2);

      if (!kpi1 || !kpi2) {
        return res.status(404).json({ error: 'One or both KPIs not found' });
      }

      // Get historical data for comparison
      const history1 = await KPIUpdate.findAll({
        where: { kpi_id: kpiId1 },
        order: [['reporting_period', 'DESC']],
        limit: 12
      });

      const history2 = await KPIUpdate.findAll({
        where: { kpi_id: kpiId2 },
        order: [['reporting_period', 'DESC']],
        limit: 12
      });

      res.json({
        success: true,
        data: {
          kpi1: {
            ...kpi1.toJSON(),
            history: history1
          },
          kpi2: {
            ...kpi2.toJSON(),
            history: history2
          },
          comparison: {
            performanceDiff: ((kpi1.current_value / kpi1.target_value) * 100) - ((kpi2.current_value / kpi2.target_value) * 100),
            statusDiff: kpi1.status === kpi2.status ? 'Same' : 'Different'
          }
        }
      });
    } catch (error) {
      console.error('Comparison error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get KPI documents - MISSING METHOD
  async getKPIDocuments(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const kpi = await KPI.findByPk(id);
      if (!kpi) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      // Check access rights
      if (userRole === 'Officer' && kpi.assigned_to_user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const documents = await Document.findAll({
        where: { kpi_id: id },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'uploadedBy',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Error getting KPI documents:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete document - MISSING METHOD
  async deleteDocument(req, res) {
    try {
      const { id, docId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const document = await Document.findByPk(docId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check if document belongs to KPI
      if (document.kpi_id !== id) {
        return res.status(400).json({ error: 'Document does not belong to this KPI' });
      }

      // Check permissions
      if (userRole !== 'Administrator' && document.uploaded_by !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete document
      await document.destroy();

      // Log the action
      await AuditLog.create({
        table_name: 'documents',
        record_id: docId,
        action: 'DELETE',
        changed_by: userId,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        old_values: JSON.stringify(document.toJSON())
      });

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get KPI statistics - MISSING METHOD
  async getStats(req, res) {
    try {
      const { year, department } = req.query;
      const userRole = req.user.role;
      const userDepartment = req.user.department;

      let where = {};
      
      if (year) {
        where.year = year;
      }
      
      // Department filter for non-admins
      if (userRole !== 'Administrator') {
        where.department = userDepartment;
      } else if (department) {
        where.department = department;
      }

      const stats = await KPI.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting KPI stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export KPIs - MISSING METHOD
  async exportKPIs(req, res) {
    try {
      const { format, year } = req.query;
      
      // This would generate export file based on format
      // For now, return placeholder
      res.json({
        success: true,
        message: `Exporting KPIs in ${format} format`,
        year: year,
        data: [] // In real implementation, this would be the export data
      });
    } catch (error) {
      console.error('Error exporting KPIs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new KPIController();
