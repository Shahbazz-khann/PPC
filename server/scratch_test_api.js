const jwt = require('jsonwebtoken');
const FormData = require('form-data');
require('dotenv').config();

const token = jwt.sign(
  { user_id: 3, role_name: 'owner' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

async function run() {
  const form = new FormData();
  form.append('media', Buffer.from('dummy image content'), 'test.jpg');
  form.append('is_primary', 'true');

  try {
    const res = await fetch('http://localhost:5000/api/v1/owner/properties/20/media', {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    
    const data = await res.json();
    console.log("HTTP STATUS:", res.status);
    console.log("DATA:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
run();

