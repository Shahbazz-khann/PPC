const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  { user_id: 3, role_name: 'owner' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

async function run() {
  const res = await fetch('http://localhost:5000/api/v1/owner/properties', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
