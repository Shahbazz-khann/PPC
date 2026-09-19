require('dotenv').config();
const { pool } = require('./config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting Migration...");

        // 1. RENAME CUSTOMER_REQUEST COLUMNS
        console.log("1. Renaming columns in customer_requests...");
        const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'customer_requests'`);
        const colNames = cols.rows.map(r => r.column_name);
        
        if (colNames.includes('request_purpose_description')) {
            await client.query(`ALTER TABLE customer_requests RENAME COLUMN request_purpose_description TO request_description`);
            console.log("   Renamed request_purpose_description -> request_description");
        } else if (colNames.includes('request_description')) {
            console.log("   request_description already exists, skipping rename");
        }
        
        if (colNames.includes('request_purpose_audio')) {
            await client.query(`ALTER TABLE customer_requests RENAME COLUMN request_purpose_audio TO request_audio_url`);
            console.log("   Renamed request_purpose_audio -> request_audio_url");
        } else if (colNames.includes('request_audio_url')) {
            console.log("   request_audio_url already exists, skipping rename");
        }

        // 2. CREATE REQUEST STATUS MASTER
        console.log("2. Creating customer_request_status_types...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_request_status_types (
                request_status_type_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                request_status_english varchar NOT NULL,
                request_status_urdu varchar,
                request_status_abb varchar,
                is_active boolean NOT NULL DEFAULT true
            )
        `);

        console.log("   Seeding customer_request_status_types...");
        const statuses = [
            { eng: 'Pending', abb: 'PND' },
            { eng: 'Under Review', abb: 'REV' },
            { eng: 'Assigned', abb: 'ASN' },
            { eng: 'In Progress', abb: 'INP' },
            { eng: 'Completed', abb: 'CMP' },
            { eng: 'Rejected', abb: 'REJ' },
            { eng: 'Withdrawn', abb: 'WDR' }
        ];
        
        for (const s of statuses) {
            await client.query(`
                INSERT INTO customer_request_status_types (request_status_english, request_status_abb, is_active)
                SELECT $1::varchar, $2::varchar, true
                WHERE NOT EXISTS (
                    SELECT 1 FROM customer_request_status_types WHERE request_status_english = $1::varchar
                )
            `, [s.eng, s.abb]);
        }

        // 3. CREATE REQUEST STATUS HISTORY LEDGER
        console.log("3. Creating customer_request_status_history...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_request_status_history (
                request_status_history_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                request_id bigint NOT NULL,
                request_status_type_id bigint NOT NULL,
                effective_date date NOT NULL DEFAULT CURRENT_DATE,
                status_remarks text,
                creation_date_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                update_date_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by_user bigint,
                is_active boolean NOT NULL DEFAULT true,
                gps_coordinates varchar,
                url_used text
            )
        `);

        // Add constraints if they don't exist
        const addFkIfNotExists = async (table, constraintName, definition) => {
            const check = await client.query(`
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = $1 AND table_name = $2
            `, [constraintName, table]);
            if (check.rows.length === 0) {
                await client.query(`ALTER TABLE ${table} ADD CONSTRAINT ${constraintName} ${definition}`);
            }
        };

        await addFkIfNotExists('customer_request_status_history', 'fk_cust_req_status_history_request', 'FOREIGN KEY (request_id) REFERENCES customer_requests(request_id)');
        await addFkIfNotExists('customer_request_status_history', 'fk_cust_req_status_history_type', 'FOREIGN KEY (request_status_type_id) REFERENCES customer_request_status_types(request_status_type_id)');
        await addFkIfNotExists('customer_request_status_history', 'fk_cust_req_status_history_user', 'FOREIGN KEY (created_by_user) REFERENCES users(user_id)');

        // 4. CURRENT STATUS PROTECTION
        console.log("4. Creating partial unique index on status history...");
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_req_status_one_active 
            ON customer_request_status_history (request_id) 
            WHERE is_active = true
        `);

        // 5. REQUEST INDEXES
        console.log("5. Creating useful indexes on customer_requests and history...");
        await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_requests_customer_id ON customer_requests(customer_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_requests_property_id ON customer_requests(property_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_requests_purpose_id ON customer_requests(request_purpose_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_requests_service_id ON customer_requests(service_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cust_req_status_history_req_id ON customer_request_status_history(request_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cust_req_status_history_type_id ON customer_request_status_history(request_status_type_id)`);

        // 6. CREATE/SEED PPC SERVICE TYPES
        console.log("6. Seeding ppc_service_types...");
        // Ensure table exists (it should, but just to be sure)
        await client.query(`
            CREATE TABLE IF NOT EXISTS ppc_service_types (
                service_type_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                service_type_english varchar NOT NULL,
                service_type_urdu varchar,
                service_type_abb varchar,
                is_active boolean NOT NULL DEFAULT true
            )
        `);

        const serviceTypes = [
            { eng: 'Property Maintenance', abb: 'MNT' },
            { eng: 'Cleaning & Hygiene', abb: 'CLN' },
            { eng: 'Plumbing & Drainage', abb: 'PLB' },
            { eng: 'Electrical & HVAC', abb: 'EHV' },
            { eng: 'Finishing & Woodwork', abb: 'FIN' },
            { eng: 'Landscaping', abb: 'LND' }
        ];

        for (const st of serviceTypes) {
            await client.query(`
                INSERT INTO ppc_service_types (service_type_english, service_type_abb, is_active)
                SELECT $1::varchar, $2::varchar, true
                WHERE NOT EXISTS (
                    SELECT 1 FROM ppc_service_types WHERE service_type_english = $1::varchar
                )
            `, [st.eng, st.abb]);
        }

        // 7. SEED APPROVED PPC SERVICES
        console.log("7. Seeding ppc_services...");
        const servicesMap = {
            'Property Maintenance': ['Property Care (Regular Maintenance)', 'General Repair and Maintenance'],
            'Cleaning & Hygiene': ['Cleaning Services', 'Water Tank Cleaning', 'Pest Control'],
            'Plumbing & Drainage': ['Plumbing Services', 'Drain and Gutter Cleaning'],
            'Electrical & HVAC': ['Electrical Services', 'AC Repair and Maintenance'],
            'Finishing & Woodwork': ['Painting Services', 'Carpentry Services'],
            'Landscaping': ['Gardening / Lawn Maintenance']
        };

        for (const [typeEng, services] of Object.entries(servicesMap)) {
            // Get the ID for this service type
            const typeRes = await client.query(`SELECT service_type_id FROM ppc_service_types WHERE service_type_english = $1::varchar`, [typeEng]);
            if (typeRes.rows.length === 0) throw new Error(`Service type not found: ${typeEng}`);
            const typeId = typeRes.rows[0].service_type_id;

            for (const s of services) {
                await client.query(`
                    INSERT INTO ppc_services (service_type_id, service_english, is_active)
                    SELECT $1::bigint, $2::varchar, true
                    WHERE NOT EXISTS (
                        SELECT 1 FROM ppc_services WHERE service_english = $2::varchar AND service_type_id = $1::bigint
                    )
                `, [typeId, s]);
            }
        }

        await client.query('COMMIT');
        console.log("Migration successful.");

        // Verification checks
        console.log("\n========================================");
        console.log("VERIFICATION REPORT");
        console.log("========================================");
        
        // Final customer_requests schema
        const crCols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customer_requests'`);
        console.log("\ncustomer_requests Columns:");
        console.log(crCols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        
        // CHECK constraint
        const checkConst = await client.query(`
            SELECT pg_get_constraintdef(c.oid) AS definition
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'customer_requests' AND c.contype = 'c'
        `);
        console.log("\ncustomer_requests CHECK Constraints:");
        console.log(checkConst.rows.map(r => r.definition).join(', '));
        
        // Row counts
        const stCount = await client.query(`SELECT COUNT(*) FROM customer_request_status_types WHERE is_active=true`);
        const shCount = await client.query(`SELECT COUNT(*) FROM customer_request_status_history`);
        const ppcStCount = await client.query(`SELECT COUNT(*) FROM ppc_service_types WHERE is_active=true`);
        const ppcSCount = await client.query(`SELECT COUNT(*) FROM ppc_services WHERE is_active=true`);
        
        console.log(`\nRow Counts:`);
        console.log(`customer_request_status_types: ${stCount.rows[0].count} (Expected: 7)`);
        console.log(`customer_request_status_history: ${shCount.rows[0].count} (Expected: 0)`);
        console.log(`ppc_service_types: ${ppcStCount.rows[0].count} (Expected: 6)`);
        console.log(`ppc_services: ${ppcSCount.rows[0].count} (Expected: 12)`);
        
        // Print ppc_services with mapping
        const mappedServices = await client.query(`
            SELECT s.service_english, t.service_type_english 
            FROM ppc_services s 
            JOIN ppc_service_types t ON s.service_type_id = t.service_type_id
            ORDER BY t.service_type_english, s.service_english
        `);
        console.log("\nMapped Services:");
        mappedServices.rows.forEach(r => {
            console.log(`- ${r.service_english} -> [${r.service_type_english}]`);
        });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration failed. Rolled back.", e);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
