const { pool } = require('./server/config/db');

async function inspect() {
  const report = {};
  
  try {
    // 1. Inspect societies PRIMARY KEY
    const pkQuery = `
      SELECT 
        c.column_name, 
        c.data_type, 
        c.is_nullable, 
        c.column_default,
        tc.constraint_name
      FROM information_schema.columns c
      JOIN information_schema.key_column_usage kcu
        ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE c.table_name = 'societies' 
        AND tc.constraint_type = 'PRIMARY KEY';
    `;
    const pkRes = await pool.query(pkQuery);
    report.pk = pkRes.rows[0];

    // 2. Find EVERY FK REFERENCING societies.society_id
    const fkQuery = `
      SELECT
        tc.table_name AS child_table,
        kcu.column_name AS child_column,
        tc.constraint_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column,
        rc.update_rule AS on_update,
        rc.delete_rule AS on_delete,
        c.data_type AS child_type,
        c.is_nullable AS child_nullable
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      JOIN information_schema.columns AS c
        ON c.table_name = tc.table_name AND c.column_name = kcu.column_name
      WHERE constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'societies'
        AND ccu.column_name = 'society_id';
    `;
    const fkRes = await pool.query(fkQuery);
    report.fks = fkRes.rows;

    // Analyze dependencies
    report.childCounts = {};
    report.orphanCounts = {};
    const societiesWithDeps = new Set();

    for (const fk of report.fks) {
      const childTable = fk.child_table;
      const childCol = fk.child_column;

      // 4. TOTAL CHILD-REFERENCE COUNT
      const countRes = await pool.query(`SELECT COUNT(*) FROM ${childTable} WHERE ${childCol} IS NOT NULL`);
      report.childCounts[childTable] = parseInt(countRes.rows[0].count, 10);

      // Orphan check
      const orphanRes = await pool.query(`
        SELECT COUNT(*) FROM ${childTable} 
        WHERE ${childCol} IS NOT NULL 
          AND ${childCol} NOT IN (SELECT society_id FROM societies)
      `);
      report.orphanCounts[childTable] = parseInt(orphanRes.rows[0].count, 10);

      // Collect societies with deps
      const distRes = await pool.query(`
        SELECT ${childCol} as id, COUNT(*) as cnt
        FROM ${childTable}
        WHERE ${childCol} IS NOT NULL
        GROUP BY ${childCol}
      `);
      distRes.rows.forEach(r => societiesWithDeps.add(r.id));
    }

    report.societiesWithDepsCount = societiesWithDeps.size;

    // Total Societies
    const totRes = await pool.query(`SELECT COUNT(*), SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_count, SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as inactive_count FROM societies`);
    report.totalSocieties = parseInt(totRes.rows[0].count, 10);
    report.activeSocieties = parseInt(totRes.rows[0].active_count, 10);
    report.inactiveSocieties = parseInt(totRes.rows[0].inactive_count, 10);

    report.societiesZeroDepsCount = report.totalSocieties - report.societiesWithDepsCount;

    // Max dependency logic requires grouping across all tables. Let's just find examples.
    
    // Example society with deps
    if (report.fks.length > 0 && societiesWithDeps.size > 0) {
      const exId = Array.from(societiesWithDeps)[0];
      const exRes = await pool.query(`
        SELECT s.society_id, s.society_english, c.city_id, c.city_english
        FROM societies s
        JOIN cities c ON s.city_id = c.city_id
        WHERE s.society_id = $1
      `, [exId]);
      report.exampleWithDeps = exRes.rows[0];

      report.exampleWithDepsCounts = {};
      for (const fk of report.fks) {
         const cRes = await pool.query(`SELECT COUNT(*) FROM ${fk.child_table} WHERE ${fk.child_column} = $1`, [exId]);
         report.exampleWithDepsCounts[fk.child_table] = parseInt(cRes.rows[0].count, 10);
      }
    }

    // Example zero dependency
    let zeroDepQuery = `SELECT s.society_id, s.society_english, c.city_id, c.city_english FROM societies s JOIN cities c ON s.city_id = c.city_id`;
    if (societiesWithDeps.size > 0) {
       zeroDepQuery += ` WHERE s.society_id NOT IN (${Array.from(societiesWithDeps).join(',')})`;
    }
    zeroDepQuery += ` LIMIT 1`;
    const zRes = await pool.query(zeroDepQuery);
    report.exampleZeroDeps = zRes.rows[0];

    // Suspicious
    const suspQuery = `
      SELECT society_id, society_english, city_id 
      FROM societies 
      WHERE society_english ILIKE '%test%' 
         OR society_english ILIKE '%temp%' 
         OR society_english ILIKE '%dummy%'
    `;
    const suspRes = await pool.query(suspQuery);
    report.suspicious = suspRes.rows;

    // Transaction 1: Dependent physical delete test
    if (report.exampleWithDeps) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM societies WHERE society_id = $1', [report.exampleWithDeps.society_id]);
        report.dependentDelete = "Success? Should not happen if RESTRICT";
      } catch (err) {
        report.dependentDelete = { code: err.code, message: err.message, detail: err.detail };
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    }

    // Transaction 2: Temp Society Zero-Dep delete test
    const client2 = await pool.connect();
    try {
      await client2.query('BEGIN');
      const cityId = (await client2.query('SELECT city_id FROM cities LIMIT 1')).rows[0].city_id;
      const insertRes = await client2.query(`
        INSERT INTO societies (city_id, society_english, is_active) 
        VALUES ($1, 'TEST_ZERO_DEP', true) RETURNING society_id
      `, [cityId]);
      const tempId = insertRes.rows[0].society_id;
      const delRes = await client2.query(`DELETE FROM societies WHERE society_id = $1 RETURNING society_id`, [tempId]);
      report.zeroDepDelete = delRes.rows.length === 1 ? 'Success' : 'Failed';
    } catch (err) {
      report.zeroDepDelete = { error: err.message };
    } finally {
      await client2.query('ROLLBACK');
      client2.release();
    }

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspect();
