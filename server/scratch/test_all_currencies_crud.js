require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testAllCurrenciesCRUD() {
  const token = jwt.sign(
    { id: 14, user_id: 14, email: '2412473@szabist-isb.pk', role: 'admin', user_type: 'employee' },
    process.env.JWT_SECRET || 'ppc_secret_key_12345',
    { expiresIn: '1h' }
  );

  const baseUrl = 'http://localhost:5000/api/v1/admin/reference/finance/currencies';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  try {
    console.log('=== 1. TESTING GET (Fetch Currencies) ===');
    const getRes = await fetch(baseUrl, { headers });
    const getData = await getRes.json();
    console.log('GET Status:', getRes.status, 'Count:', getData.data ? getData.data.length : 0);
    if (!getData.success) throw new Error('GET failed: ' + JSON.stringify(getData));

    console.log('\n=== 2. TESTING POST (Create Currency) ===');
    const postPayload = {
      currency_english: 'Test Kuwaiti Dinar',
      currency_urdu: 'کویتی دینار',
      currency_code: 'KWD',
      currency_symbol: 'د.ك',
      is_active: true
    };
    const postRes = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(postPayload)
    });
    const postData = await postRes.json();
    console.log('POST Status:', postRes.status, 'Response:', postData);
    if (!postData.success) throw new Error('POST failed: ' + JSON.stringify(postData));
    const createdId = postData.data.currency_id;
    console.log('Created Currency ID:', createdId);

    console.log('\n=== 3. TESTING PUT (Update Currency) ===');
    const putPayload = {
      currency_english: 'Kuwaiti Dinar Updated',
      currency_urdu: 'کویتی دینار تبدیل شدہ',
      currency_code: 'KWD',
      currency_symbol: 'KD',
      is_active: false
    };
    const putRes = await fetch(`${baseUrl}/${createdId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putPayload)
    });
    const putData = await putRes.json();
    console.log('PUT Status:', putRes.status, 'Response:', putData);
    if (!putData.success) throw new Error('PUT failed: ' + JSON.stringify(putData));

    console.log('\n=== 4. TESTING DELETE (Delete Currency) ===');
    const deleteRes = await fetch(`${baseUrl}/${createdId}`, {
      method: 'DELETE',
      headers
    });
    const deleteData = await deleteRes.json();
    console.log('DELETE Status:', deleteRes.status, 'Response:', deleteData);
    if (!deleteData.success) throw new Error('DELETE failed: ' + JSON.stringify(deleteData));

    console.log('\n>>> ALL 4 CRUD APIS (GET, POST, PUT, DELETE) ARE 100% OPERATIONAL AND VERIFIED! <<<');
    process.exit(0);
  } catch (err) {
    console.error('CRUD Test Error:', err.message);
    process.exit(1);
  }
}

testAllCurrenciesCRUD();
