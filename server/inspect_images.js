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
    
    const printTable = (data) => {
        if (!data || data.length === 0) {
            output += 'No data found.\n';
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
        // Search columns in specific tables
        output += `\n--- 1. SEARCHING IN users, customers, employees, service_providers ---\n`;
        const specificTablesSearch = await pool.query(`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name IN ('users', 'customers', 'employees', 'service_providers')
              AND (
                column_name ILIKE '%image%' OR 
                column_name ILIKE '%picture%' OR 
                column_name ILIKE '%photo%' OR 
                column_name ILIKE '%avatar%' OR 
                column_name ILIKE '%file_path%' OR 
                column_name ILIKE '%attachment%'
              );
        `);
        printTable(specificTablesSearch.rows);

        // Search columns in all tables
        output += `\n--- 2. SEARCHING ENTIRE SCHEMA FOR IMAGE COLUMNS ---\n`;
        const allColumnsSearch = await pool.query(`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND (
                column_name ILIKE '%image%' OR 
                column_name ILIKE '%picture%' OR 
                column_name ILIKE '%photo%' OR 
                column_name ILIKE '%avatar%' OR 
                column_name ILIKE '%file_path%' OR 
                column_name ILIKE '%attachment%'
              )
            ORDER BY table_name;
        `);
        printTable(allColumnsSearch.rows);
        
        // Search tables with similar names
        output += `\n--- 3. SEARCHING ENTIRE SCHEMA FOR MEDIA/ATTACHMENT TABLES ---\n`;
        const tablesSearch = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND (
                table_name ILIKE '%image%' OR 
                table_name ILIKE '%picture%' OR 
                table_name ILIKE '%photo%' OR 
                table_name ILIKE '%media%' OR 
                table_name ILIKE '%file%' OR 
                table_name ILIKE '%attachment%'
              )
            ORDER BY table_name;
        `);
        printTable(tablesSearch.rows);

        fs.writeFileSync('c:/Users/FT/.gemini/antigravity-ide/brain/a5027323-da89-4c06-b366-a1720c163dd7/scratch/image_inspection.txt', output, 'utf8');

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
