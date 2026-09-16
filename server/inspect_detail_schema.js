require('dotenv').config();
const { pool } = require('./config/db');

async function run() {
    // 1. properties schema
    const propCols = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties' ORDER BY ordinal_position"
    );
    console.log("=== properties columns ===");
    propCols.rows.forEach(r => console.log(r.column_name, '-', r.data_type));

    // 2. related tables schemas
    const tables = [
        'property_pictures', 'property_videos', 'property_amenities', 'amenities',
        'property_approvals', 'approval_stages', 'property_status', 'property_status_types',
        'property_demand', 'property_demand_types',
        'property_types', 'property_use', 'property_locations', 'uom', 'marla_sizes',
        'areas', 'societies', 'cities', 'tehsils', 'districts', 'divisions', 'provinces', 'countries'
    ];

    for (const t of tables) {
        try {
            const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`);
            if (res.rows.length > 0) {
                console.log(`\n=== ${t} columns ===`);
                res.rows.forEach(r => console.log(r.column_name, '-', r.data_type));
            } else {
                console.log(`\n=== ${t}: NO COLUMNS FOUND (table may not exist) ===`);
            }
        } catch(e) {
            console.log(`\n=== ${t}: ERROR - ${e.message} ===`);
        }
    }

    // 3. sample data for property 6 (known good)
    console.log("\n=== sample property 6 ===");
    const p6 = await pool.query('SELECT * FROM properties WHERE property_id = 6');
    console.log(p6.rows[0]);

    // 4. property_demand for known properties
    console.log("\n=== property_demand ===");
    const pd = await pool.query('SELECT * FROM property_demand LIMIT 5');
    console.log(pd.rows);

    // 5. property_demand_types
    console.log("\n=== property_demand_types ===");
    const pdt = await pool.query('SELECT * FROM property_demand_types LIMIT 10');
    console.log(pdt.rows);

    // 6. property_locations table?
    try {
        const pl = await pool.query('SELECT * FROM property_locations LIMIT 5');
        console.log("\n=== property_locations ===", pl.rows);
    } catch(e) {
        console.log("\n=== property_locations: not found ===");
    }

    // 7. property_location_types?
    try {
        const plt = await pool.query('SELECT * FROM property_location_types LIMIT 5');
        console.log("\n=== property_location_types ===", plt.rows);
    } catch(e) {
        console.log("\n=== property_location_types: not found ===");
    }

    // 8. What does property_location_id reference?
    const fkCheck = await pool.query(`
        SELECT
            tc.table_name, kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'properties'
        ORDER BY kcu.column_name
    `);
    console.log("\n=== properties FKs ===");
    fkCheck.rows.forEach(r => console.log(r.column_name, '->', r.foreign_table_name, '.', r.foreign_column_name));

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
