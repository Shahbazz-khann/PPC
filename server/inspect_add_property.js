require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
    try {
        const tables = [
            'properties',
            'property_amenities',
            'amenities',
            'property_features',
            'features',
            'property_pictures',
            'property_videos',
            'electricity_backup',
            'property_location_types'
        ];

        for (const table of tables) {
            console.log(`\n--- TABLE: ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            
            if (res.rows.length === 0) {
                console.log('  (Table not found or empty)');
            } else {
                res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (Nullable: ${r.is_nullable})`));
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
