async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'saadcoder10@gmail.com', password: 'Test@123456' })
        });
        const loginData = await loginRes.json();
        
        if (!loginData.success) {
            console.log('Login failed', loginData);
            return;
        }

        const token = loginData.token;
        console.log('Token received');

        console.log('Testing summary API...');
        const summaryRes = await fetch('http://localhost:5000/api/v1/customer/dashboard/summary', {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Status:', summaryRes.status);
        console.log('Response:', await summaryRes.json());
        
        // Test unauthorized
        console.log('\nTesting 401...');
        const noAuthRes = await fetch('http://localhost:5000/api/v1/customer/dashboard/summary', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('401 Status:', noAuthRes.status);
    } catch (e) {
        console.error(e);
    }
}
run();
