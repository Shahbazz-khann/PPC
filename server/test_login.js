async function run() {
    try {
        console.log('Testing old password...');
        const loginResOld = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'saadcoder10@gmail.com', password: 'Test@1234' })
        });
        console.log('Old password status:', loginResOld.status);
        console.log('Old password response:', await loginResOld.json());

        console.log('Testing new password...');
        const loginResNew = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'saadcoder10@gmail.com', password: 'Test@123456' })
        });
        console.log('New password status:', loginResNew.status);
        const newData = await loginResNew.json();
        console.log('New password response success:', newData.success);
    } catch (e) {
        console.error(e);
    }
}
run();
