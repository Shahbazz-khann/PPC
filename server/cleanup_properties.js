require('dotenv').config();
const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

const tables = [
    'customer_requests',
    'property_inspection_schedule',
    'property_amenities',
    'property_commission',
    'property_demand',
    'property_pictures',
    'property_status',
    'property_verifications',
    'property_videos',
    'property_visits',
    'property_approvals'
];

async function cleanup() {
    const propIds = [9, 10];
    const client = await pool.connect();
    
    try {
        console.log("--- 1. INSPECT FIRST ---");
        let mediaFiles = [];
        
        for (const table of tables) {
            const res = await client.query(`SELECT * FROM ${table} WHERE property_id = ANY($1)`, [propIds]);
            console.log(`Table ${table} has ${res.rowCount} rows for properties 9,10.`);
            
            if (table === 'property_pictures') {
                res.rows.forEach(r => mediaFiles.push(r.picture_url));
            }
            if (table === 'property_videos') {
                res.rows.forEach(r => mediaFiles.push(r.video_url));
            }
        }

        console.log("\n--- 2. MEDIA FILES ---");
        let deletedFiles = 0;
        mediaFiles.forEach(url => {
            if (url) {
                const filename = path.basename(url);
                let dir = '';
                if (url.includes('property-pictures')) {
                    dir = path.join(__dirname, 'uploads', 'property-pictures');
                } else if (url.includes('property-videos')) {
                    dir = path.join(__dirname, 'uploads', 'property-videos');
                }
                
                if (dir) {
                    const fullPath = path.join(dir, filename);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log(`Deleted file: ${fullPath}`);
                        deletedFiles++;
                    } else {
                        console.log(`File not found on disk: ${fullPath}`);
                    }
                }
            }
        });
        console.log(`Total media files deleted: ${deletedFiles}`);

        console.log("\n--- 3. DATABASE DELETE ---");
        await client.query('BEGIN');
        
        let deletedRowsMap = {};
        for (const table of tables) {
            const res = await client.query(`DELETE FROM ${table} WHERE property_id = ANY($1)`, [propIds]);
            deletedRowsMap[table] = res.rowCount;
            console.log(`Deleted ${res.rowCount} rows from ${table}`);
        }
        
        const propRes = await client.query(`DELETE FROM properties WHERE property_id = ANY($1)`, [propIds]);
        console.log(`Deleted ${propRes.rowCount} rows from properties`);
        deletedRowsMap['properties'] = propRes.rowCount;
        
        if (propRes.rowCount > 2) {
            throw new Error(`Expected at most 2 properties to be deleted, but got ${propRes.rowCount}. Aborting.`);
        }
        
        await client.query('COMMIT');
        
        console.log("\n--- 4. VERIFY ---");
        const verifyRes = await client.query(`SELECT * FROM properties WHERE property_id = ANY($1)`, [propIds]);
        console.log(`Properties remaining for IDs 9,10: ${verifyRes.rowCount} rows.`);
        
        const verifyUnrelated = await client.query(`SELECT property_id FROM properties WHERE property_id IN (1,2,3,6,7,8) ORDER BY property_id`);
        console.log(`Unrelated properties still intact:`, verifyUnrelated.rows.map(r => r.property_id));

        console.log("\n--- REPORT ---");
        console.log("1. Dependent tables found: ", tables.join(', '));
        console.log("2. Rows deleted from each table: ", deletedRowsMap);
        console.log(`3. Media files deleted: ${deletedFiles}`);
        console.log(`4. Properties deleted: ${propRes.rowCount}`);
        console.log(`5. Verification result: Properties 9,10 = ${verifyRes.rowCount} rows. Unrelated remain: ${verifyUnrelated.rows.length === 6}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error occurred, rolled back transaction.", error);
    } finally {
        client.release();
        process.exit(0);
    }
}

cleanup();
