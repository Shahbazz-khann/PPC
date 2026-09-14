const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'PPC_UPDATED',
    user: 'postgres',
    password: '8811287512@s'
});

async function run() {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'customers' AND column_name = 'gender_id';
        `);
        console.log('customers.gender_id column:', columns.rows);
        
        const genders = await pool.query(`SELECT * FROM genders`);
        console.log('genders table data:', genders.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
