require('dotenv').config();
const { pool } = require('./config/db');

async function inspectFKs() {
    const query = `
        SELECT
            tc.table_name, 
            kcu.column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='properties' AND ccu.column_name='property_id';
    `;
    const res = await pool.query(query);
    console.log("Tables referencing properties.property_id:", res.rows);
    process.exit(0);
}

inspectFKs().catch(err => {
    console.error(err);
    process.exit(1);
});
