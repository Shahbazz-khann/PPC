async function run() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'saadcoder10@gmail.com', password: 'Test@1234' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Got token, length:', token.length);

        const res = await fetch('http://localhost:5000/api/v1/customer/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: 'Test@1234',
                new_password: 'Test@123456',
                confirm_password: 'Test@123456'
            })
        });

        const resData = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', resData);
    } catch (e) {
        console.error(e);
    }
}
run();
