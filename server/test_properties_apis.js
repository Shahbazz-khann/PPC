async function run() {
    try {
        // Since we don't know the exact current password, we can just login with the new one
        // If it fails, maybe it's Test@1234
        let loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'saadcoder10@gmail.com', password: 'Test@123456' })
        });
        
        let loginData = await loginRes.json();
        
        if (!loginData.token) {
            loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'saadcoder10@gmail.com', password: 'Test@1234' })
            });
            loginData = await loginRes.json();
        }

        const token = loginData.token;
        if (!token) {
            console.error("Failed to get token:", loginData);
            return;
        }
        console.log('Got token, length:', token.length);

        console.log('--- GET /api/v1/customer/properties ---');
        const resProps = await fetch('http://localhost:5000/api/v1/customer/properties', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Status:', resProps.status);
        console.log('Response:', await resProps.json());

        console.log('--- GET /api/v1/customer/dashboard/properties ---');
        const resDash = await fetch('http://localhost:5000/api/v1/customer/dashboard/properties', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Status:', resDash.status);
        console.log('Response:', await resDash.json());

    } catch (e) {
        console.error(e);
    }
}
run();
