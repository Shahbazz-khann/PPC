const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: '8811287512@s', host: 'localhost', database: 'PPC_UPDATED' });
pool.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('currencies', 'property_demand', 'property_demand_types') ORDER BY table_name, ordinal_position`).then(res => console.table(res.rows)).finally(() => pool.end());
