const { Pool } = require('pg');
const pool = new Pool({
    database: 'PPC_UPDATED',
    user: 'postgres',
    password: '8811287512@s'
});
pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('customers', 'users') ORDER BY table_name, column_name;")
    .then(r => {
        console.table(r.rows);
        pool.end();
    })
    .catch(console.error);
