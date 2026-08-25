const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  { user_id: 3, role_name: 'owner' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

async function testCreateProperty() {
  const propRes = await fetch('http://localhost:5000/api/v1/owner/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Test Property 99',
      description: 'Test description',
      property_type_id: 1, // House
      city: 'Islamabad',
      address: 'Test Address',
      area_value: 5,
      area_unit_id: 3,
      bedrooms: 3,
      bathrooms: 2,
      sale_price: 1000000
    })
  });
  
  const propData = await propRes.json();
  console.log("Create Property Response:", propData);
}

testCreateProperty();
