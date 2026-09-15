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
        console.log('--- NOT NULL CONSTRAINTS ---');
        const notNull = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'property_demand' AND is_nullable = 'NO';
        `);
        notNull.rows.forEach(r => console.log(r.column_name));

        console.log('\n--- FOREIGN KEYS ---');
        const fks = await pool.query(`
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'property_demand';
        `);
        fks.rows.forEach(r => console.log(`${r.constraint_name}: ${r.column_name} -> ${r.foreign_table_name}(${r.foreign_column_name})`));

        console.log('\n--- INDEXES & OTHER CONSTRAINTS ---');
        const indexes = await pool.query(`
            SELECT indexdef FROM pg_indexes WHERE tablename = 'property_demand';
        `);
        indexes.rows.forEach(r => console.log(`IndexDef: ${r.indexdef}`));

        console.log('\n--- CHECK CONSTRAINTS ---');
        const checks = await pool.query(`
            SELECT tc.constraint_name, pg_get_constraintdef(c.oid) AS constraint_def
            FROM information_schema.table_constraints tc
            JOIN pg_constraint c ON c.conname = tc.constraint_name
            WHERE tc.table_name = 'property_demand' AND tc.constraint_type = 'CHECK';
        `);
        checks.rows.forEach(r => console.log(`${r.constraint_name}: ${r.constraint_def}`));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
