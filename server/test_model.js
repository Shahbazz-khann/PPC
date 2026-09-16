require('dotenv').config();
const customerModel = require('./models/Customer/customer.model');
const { pool } = require('./config/db');

async function testModel() {
  try {
    const userRes = await pool.query('SELECT u.user_id FROM users u JOIN customers c ON u.user_id = c.user_id WHERE u.is_active = true LIMIT 1');
    if (userRes.rowCount === 0) { console.log('No user found'); process.exit(1); }
    const userId = userRes.rows[0].user_id;

    const areaRes = await pool.query('SELECT a.area_id FROM areas a WHERE a.is_active = true LIMIT 1');
    if (areaRes.rowCount === 0) { console.log('No area found'); process.exit(1); }
    const areaId = areaRes.rows[0].area_id;

    const data = {
      area_id: areaId,
      propertyType: 1, // House
      propertyDescription: 'Integration Test Description',
      rooms: 3,
      swimmingPool: true,
      amenities: ['Custom Amenity Test', 'Built-in Wardrobes', '']
    };

    console.log('Testing addProperty...');
    const propId = await customerModel.addProperty(userId, data);
    console.log('Successfully created property ID:', propId);
    
    const propData = await pool.query('SELECT * FROM properties WHERE property_id = $1', [propId]);
    console.log('Property Description:', propData.rows[0].property_description);
    
    const amData = await pool.query('SELECT a.amenity_description FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.amenity_id WHERE pa.property_id = $1', [propId]);
    console.log('Linked Amenities:', amData.rows.map(r => r.amenity_description));
    
    const appData = await pool.query('SELECT ast.approval_stage_english FROM property_approvals pa JOIN approval_stages ast ON pa.approval_stage_id = ast.approval_stage_id WHERE pa.property_id = $1', [propId]);
    console.log('Approval Status:', appData.rows[0]?.approval_stage_english);
    
    const statData = await pool.query('SELECT pst.status_english FROM property_status ps JOIN property_status_types pst ON ps.status_id = pst.status_id WHERE ps.property_id = $1', [propId]);
    console.log('Property Status:', statData.rows[0]?.status_english);
    
    // Testing duplicate handling
    console.log('Testing duplicate amenities handling by adding another property with same amenities...');
    const propId2 = await customerModel.addProperty(userId, data);
    console.log('Successfully created property ID:', propId2, '(Duplicate constraint passed)');
    
    console.log('Testing rollback... (will supply invalid area_id)');
    try {
      await customerModel.addProperty(userId, { ...data, area_id: 999999 });
      console.log('Rollback Test FAILED (should have thrown error)');
    } catch (e) {
      console.log('Rollback Test PASSED. Error caught:', e.message);
    }
    
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    pool.end();
  }
}
testModel();
