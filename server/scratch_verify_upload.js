const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

const token = jwt.sign(
  { user_id: 3, role_name: 'owner' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

async function testProperty(propertyId, imageCount) {
  // Clear previous test images for this property from DB
  const { pool } = require('./config/db');
  await pool.query('DELETE FROM property_media WHERE property_id = $1', [propertyId]);

  console.log(`Testing with property ID: ${propertyId}, Images: ${imageCount}`);

  // Upload images
  const blob = new Blob(['dummy content'], { type: 'image/jpeg' });
  const uploadPromises = [];
  
  for (let i = 0; i < imageCount; i++) {
    const formData = new FormData();
    formData.append('media', blob, `test_image_${i}.jpg`);
    formData.append('is_primary', i === 0 ? 'true' : 'false');
    
    uploadPromises.push(
      fetch(`http://localhost:5000/api/v1/owner/properties/${propertyId}/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }).then(res => res.json())
    );
  }
  
  const uploadResults = await Promise.all(uploadPromises);
  const successes = uploadResults.filter(r => r.success);
  console.log(`Uploaded ${successes.length}/${imageCount} images successfully.`);
  
  // Verify DB
  const dbRes = await pool.query('SELECT media_url, is_primary FROM property_media WHERE property_id = $1 ORDER BY media_id ASC', [propertyId]);
  console.log("DB Records:");
  console.log(dbRes.rows);
  return dbRes.rows;
}

async function run() {
  try {
    console.log("--- TEST 1 IMAGE ---");
    await testProperty(20, 1);
    
    console.log("\n--- TEST 6 IMAGES ---");
    await testProperty(20, 6);
    
  } catch (e) {
    console.error("TEST FAILED:", e.message);
  } finally {
    process.exit(0);
  }
}

run();
