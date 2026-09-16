require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function inspect() {
  const client = await pool.connect();
  try {
    const tableQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;";
    const res = await client.query(tableQuery);
    const allTables = res.rows.map(r => r.table_name);
    console.log("All tables:", allTables);

    const checkTables = [
      'property_types', 'propertytypes',
      'property_uses', 'propertyuses',
      'property_locations', 'propertylocations',
      'uom', 'uoms', 'unit_of_measures',
      'marla_sizes', 'marlasizes',
      'amenities', 'property_amenities'
    ];

    const existing = allTables.filter(t => checkTables.includes(t));
    console.log("Existing target tables:", existing);

    for (const t of existing) {
      console.log("\\n--- Table:", t, "---");
      const colQuery = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position";
      const cols = await client.query(colQuery, [t]);
      console.log("Columns:", cols.rows.map(c => c.column_name + ' (' + c.data_type + ')').join(', '));
      const count = await client.query("SELECT COUNT(*) FROM " + t);
      console.log("Row count:", count.rows[0].count);
      if (parseInt(count.rows[0].count) > 0) {
        const sample = await client.query("SELECT * FROM " + t + " LIMIT 1");
        console.log("Sample:", sample.rows[0]);
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
inspect();
