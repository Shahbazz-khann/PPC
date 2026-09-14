const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'PPC_UPDATED',
    user: 'postgres',
    password: '8811287512@s'
});

async function run() {
    try {
        console.log('--- Checking Genders ---');
        const gendersBefore = await pool.query('SELECT * FROM genders');
        console.log('Genders before:', gendersBefore.rows);

        const gendersToInsert = [
            { id: 1, eng: 'Male', urdu: 'مرد', abb: 'M' },
            { id: 2, eng: 'Female', urdu: 'عورت', abb: 'F' },
            { id: 3, eng: 'Others', urdu: 'دیگر', abb: 'O' }
        ];

        for (const g of gendersToInsert) {
            await pool.query(`
                INSERT INTO genders (gender_id, gender_english, gender_urdu, gender_abb, is_active)
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (gender_id) DO NOTHING
            `, [g.id, g.eng, g.urdu, g.abb]);
        }

        const gendersAfter = await pool.query('SELECT * FROM genders');
        console.log('Genders after:', gendersAfter.rows);


        console.log('\n--- Checking Customer Titles ---');
        const titlesBefore = await pool.query('SELECT * FROM customer_titles');
        console.log('Titles before:', titlesBefore.rows);

        const titlesToInsert = [
            { desc: 'Mister', urdu: 'مسٹر', abb: 'Mr.' },
            { desc: 'Missus', urdu: 'مسز', abb: 'Mrs.' },
            { desc: 'Ms', urdu: 'مس', abb: 'Ms.' },
            { desc: 'Doctor', urdu: 'ڈاکٹر', abb: 'Dr.' },
            { desc: 'Engineer', urdu: 'انجینئر', abb: 'Engr.' },
            { desc: 'Colonel', urdu: 'کرنل', abb: 'Col.' },
            { desc: 'Lieutenant Colonel', urdu: 'لیفٹیننٹ کرنل', abb: 'Lt. Col.' },
            { desc: 'Major', urdu: 'میجر', abb: 'Maj.' },
            { desc: 'Captain', urdu: 'کیپٹن', abb: 'Capt.' },
            { desc: 'Professor', urdu: 'پروفیسر', abb: 'Prof.' }
        ];

        for (const t of titlesToInsert) {
            // Check if exists by desc
            const exists = await pool.query('SELECT * FROM customer_titles WHERE title_description = $1', [t.desc]);
            if (exists.rows.length === 0) {
                await pool.query(`
                    INSERT INTO customer_titles (title_description, title_urdu, title_abb, is_active)
                    VALUES ($1, $2, $3, true)
                `, [t.desc, t.urdu, t.abb]);
            }
        }

        const titlesAfter = await pool.query('SELECT * FROM customer_titles');
        console.log('Titles after:', titlesAfter.rows);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

run();
