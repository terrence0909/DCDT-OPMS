const { KPI, User } = require('./src/models');

async function createTestKPIs() {
  try {
    console.log('Creating test KPIs...');
    
    const admin = await User.findOne({ where: { username: 'admin' } });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('Found admin:', admin.username);
    
    // Create test KPIs
    const testKPIs = [
      {
        code: 'KPI-2025-001',
        name: 'Employee Training Completion Rate',
        description: 'Percentage of employees completing mandatory annual training',
        operational_plan_id: 'OP-2025-01',
        owner_user_id: admin.id,
        target_value: 95.0,
        measurement_unit: '%',
        current_value: 87.5,
        achieved_percentage: 92.1,
        status: 'OnTrack',
        program: 'Human Resources',
        department: 'HR'
      },
      {
        code: 'KPI-2025-002',
        name: 'Project Delivery On Time',
        description: 'Percentage of IT projects delivered by deadline',
        operational_plan_id: 'OP-2025-02',
        owner_user_id: admin.id,
        target_value: 90.0,
        measurement_unit: '%',
        current_value: 82.0,
        achieved_percentage: 91.1,
        status: 'AtRisk',
        program: 'IT Services',
        department: 'ICT'
      },
      {
        code: 'KPI-2025-003',
        name: 'Customer Satisfaction Score',
        description: 'Average customer satisfaction rating from surveys',
        operational_plan_id: 'OP-2025-03',
        owner_user_id: admin.id,
        target_value: 4.5,
        measurement_unit: 'stars',
        current_value: 4.2,
        achieved_percentage: 93.3,
        status: 'OnTrack',
        program: 'Customer Service',
        department: 'Operations'
      }
    ];
    
    for (const kpiData of testKPIs) {
      const existing = await KPI.findOne({ where: { code: kpiData.code } });
      if (!existing) {
        await KPI.create(kpiData);
        console.log(`✅ Created KPI: ${kpiData.code} - ${kpiData.name}`);
      } else {
        console.log(`⚠️  KPI already exists: ${kpiData.code}`);
      }
    }
    
    console.log('✅ Test KPIs created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestKPIs();
