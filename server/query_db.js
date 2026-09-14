require('dotenv').config();
const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const hash = await bcrypt.hash('Test@1234', 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'saadcoder10@gmail.com'", [hash]);
        console.log("Updated password for saadcoder10@gmail.com to Test@1234");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
