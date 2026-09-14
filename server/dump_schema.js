const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'PPC_UPDATED',
    user: 'postgres',
    password: '8811287512@s'
});

async function run() {
    let output = '';
    
    // Polyfill console.table to append to output
    const printTable = (data) => {
        if (!data || data.length === 0) {
            output += 'No data\n';
            return;
        }
        const keys = Object.keys(data[0]);
        output += keys.join(' | ') + '\n';
        output += keys.map(k => '---').join('-|-') + '\n';
        for (const row of data) {
            output += keys.map(k => String(row[k])).join(' | ') + '\n';
        }
    };

    try {
        const tables = ['users', 'customers', 'identity_types', 'customer_titles', 'genders', 'countries'];
        
        for (const table of tables) {
            output += `\n\n--- TABLE: ${table} ---\n`;
            const res = await pool.query(`
                SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            printTable(res.rows);
            
            output += `\n--- CONSTRAINTS FOR ${table} ---\n`;
            const constraints = await pool.query(`
                SELECT
                    tc.constraint_name, 
                    tc.constraint_type,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    LEFT JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.table_name = $1;
            `, [table]);
            printTable(constraints.rows);
        }
        
        output += `\n--- DATA: identity_types ---\n`;
        try {
            const idTypes = await pool.query(`SELECT * FROM identity_types`);
            printTable(idTypes.rows);
        } catch(e) { output += 'Error: ' + e.message + '\n'; }
        
        output += `\n--- DATA: customer_titles ---\n`;
        try {
            const titles = await pool.query(`SELECT * FROM customer_titles`);
            printTable(titles.rows);
        } catch (e) {
            output += 'Error fetching customer_titles: ' + e.message + '\n';
        }
        
        output += `\n--- DATA: genders ---\n`;
        try {
            const genders = await pool.query(`SELECT * FROM genders`);
            printTable(genders.rows);
        } catch (e) {
            output += 'Error fetching genders: ' + e.message + '\n';
        }

        fs.writeFileSync('c:/Users/FT/.gemini/antigravity-ide/brain/a5027323-da89-4c06-b366-a1720c163dd7/scratch/dump_schema.txt', output, 'utf8');

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
