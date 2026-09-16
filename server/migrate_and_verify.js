require('dotenv').config();
const { pool } = require('./config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Make properties.area_id NOT NULL
        await client.query('ALTER TABLE properties ALTER COLUMN area_id SET NOT NULL;');
        
        // 2. Drop FK constraints
        await client.query('ALTER TABLE properties DROP CONSTRAINT IF EXISTS fk_properties_district;');
        await client.query('ALTER TABLE properties DROP CONSTRAINT IF EXISTS fk_properties_tehsil;');
        await client.query('ALTER TABLE properties DROP CONSTRAINT IF EXISTS fk_properties_society;');
        
        // 3. Drop columns
        await client.query('ALTER TABLE properties DROP COLUMN IF EXISTS property_district_id;');
        await client.query('ALTER TABLE properties DROP COLUMN IF EXISTS property_tehsil_id;');
        await client.query('ALTER TABLE properties DROP COLUMN IF EXISTS society_id;');
        
        await client.query('COMMIT');
        console.log('--- MIGRATION COMMITTED ---');
        
        // VERIFICATION
        const colsQuery = `
          SELECT column_name, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'properties'
          AND column_name IN ('area_id', 'property_location_id', 'gps_coordinates', 'property_district_id', 'property_tehsil_id', 'society_id');
        `;
        const colsRes = await client.query(colsQuery);
        console.log("Columns State:");
        console.table(colsRes.rows);
        
        const fkQuery = `
          SELECT
              tc.constraint_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
          FROM
              information_schema.table_constraints AS tc
              JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'properties'
          AND kcu.column_name = 'area_id';
        `;
        const fkRes = await client.query(fkQuery);
        console.log("Area_id FK State:");
        console.table(fkRes.rows);
        
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed, rolled back:', e);
    } finally {
        client.release();
        pool.end();
    }
}
migrate();
