require('dotenv').config();
const referenceModel = require('./models/Reference/reference.model');
const { pool } = require('./config/db');

async function testApi() {
  try {
    const pt = await referenceModel.getPropertyTypes();
    console.log('Property Types:', pt);
    
    const ms = await referenceModel.getMarlaSizes();
    console.log('Marla Sizes:', ms);
    
    const am = await referenceModel.getAmenities();
    console.log('Amenities:', am);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

testApi();
