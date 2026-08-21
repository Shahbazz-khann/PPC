const { pool } = require('../../config/db');

class OwnerModel {
  static async getDashboardSummary(ownerId) {
    const query = `
      WITH owner_properties AS (
        SELECT property_id 
        FROM properties 
        WHERE owner_id = $1 AND (is_deleted = false OR is_deleted IS NULL)
      )
      SELECT 
        (
          SELECT COUNT(*) 
          FROM owner_properties
        ) AS total_properties,
        
        (
          SELECT COUNT(*) 
          FROM property_verifications pv
          JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
          JOIN owner_properties op ON pv.property_id = op.property_id
          WHERE vs.name IN ('Pending', 'In Progress')
        ) AS pending_verification,
        
        (
          SELECT COUNT(*) 
          FROM property_visits pv
          JOIN visit_statuses vis ON pv.visit_status_id = vis.visit_status_id
          JOIN owner_properties op ON pv.property_id = op.property_id
          WHERE pv.scheduled_at > NOW() 
            AND vis.name IN ('Scheduled', 'Confirmed', 'Rescheduled')
        ) AS upcoming_visits,
        
        (
          SELECT COUNT(*) 
          FROM transactions t
          JOIN transaction_statuses ts ON t.transaction_status_id = ts.transaction_status_id
          JOIN owner_properties op ON t.property_id = op.property_id
          WHERE ts.name IN ('Pending', 'Confirmed')
        ) AS active_transactions,
        
        (
          SELECT COUNT(*) 
          FROM invoices i
          JOIN invoice_statuses invs ON i.invoice_status_id = invs.invoice_status_id
          JOIN commission_records cr ON i.commission_id = cr.commission_id
          JOIN transactions t ON cr.transaction_id = t.transaction_id
          JOIN owner_properties op ON t.property_id = op.property_id
          WHERE invs.name IN ('Issued', 'Partially Paid', 'Overdue')
        ) AS pending_invoices
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_properties: parseInt(rows[0].total_properties, 10),
      pending_verification: parseInt(rows[0].pending_verification, 10),
      upcoming_visits: parseInt(rows[0].upcoming_visits, 10),
      active_transactions: parseInt(rows[0].active_transactions, 10),
      pending_invoices: parseInt(rows[0].pending_invoices, 10),
    };
  }

  static async getMyProperties(ownerId, filters = {}) {
    const { search, property_type, property_status, verification_status, page = 1, limit = 10, sort } = filters;
    
    let whereClause = `WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)`;
    const values = [ownerId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (property_type) {
      whereClause += ` AND pt.name = $${paramIndex}`;
      values.push(property_type);
      paramIndex++;
    }

    if (property_status) {
      whereClause += ` AND ps.name = $${paramIndex}`;
      values.push(property_status);
      paramIndex++;
    }

    if (verification_status) {
      whereClause += ` AND (
        SELECT vs.name FROM property_verifications pv 
        JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id 
        WHERE pv.property_id = p.property_id 
        ORDER BY pv.created_at DESC LIMIT 1
      ) = $${paramIndex}`;
      values.push(verification_status);
      paramIndex++;
    }

    let orderBy = 'ORDER BY p.created_at DESC';
    if (sort) {
      if (sort === 'price_asc') orderBy = 'ORDER BY p.sale_price ASC, p.rent_price ASC';
      else if (sort === 'price_desc') orderBy = 'ORDER BY p.sale_price DESC, p.rent_price DESC';
      else if (sort === 'newest') orderBy = 'ORDER BY p.created_at DESC';
      else if (sort === 'oldest') orderBy = 'ORDER BY p.created_at ASC';
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        p.property_id,
        p.title,
        p.address,
        p.city,
        p.sale_price,
        p.rent_price,
        p.bedrooms,
        p.bathrooms,
        p.area_value,
        au.name AS area_unit,
        pt.name AS property_type,
        ps.name AS property_status,
        (SELECT vs.name FROM property_verifications pv 
         JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id 
         WHERE pv.property_id = p.property_id 
         ORDER BY pv.created_at DESC LIMIT 1) AS verification_status,
        (SELECT ists.name FROM inspections i 
         JOIN inspection_statuses ists ON i.inspection_status_id = ists.inspection_status_id 
         WHERE i.property_id = p.property_id 
         ORDER BY i.created_at DESC LIMIT 1) AS inspection_status,
        (SELECT ires.name FROM inspection_reports ir 
         JOIN inspections i ON ir.inspection_id = i.inspection_id 
         JOIN inspection_results ires ON ir.inspection_result_id = ires.inspection_result_id 
         WHERE i.property_id = p.property_id 
         ORDER BY ir.created_at DESC LIMIT 1) AS inspection_result,
        (SELECT COUNT(*)::int FROM property_visits v 
         JOIN visit_statuses vis ON v.visit_status_id = vis.visit_status_id 
         WHERE v.property_id = p.property_id AND v.scheduled_at > NOW() AND vis.name IN ('Scheduled', 'Confirmed', 'Rescheduled')) AS scheduled_visits_count,
        (SELECT media_url FROM property_media pm 
         WHERE pm.property_id = p.property_id AND pm.is_primary = true AND (pm.is_deleted = false OR pm.is_deleted IS NULL) 
         LIMIT 1) AS primary_image
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN property_statuses ps ON p.property_status_id = ps.property_status_id
      LEFT JOIN area_units au ON p.area_unit_id = au.area_unit_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN property_statuses ps ON p.property_status_id = ps.property_status_id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      properties: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async createProperty(ownerId, data) {
    const query = `
      WITH inserted_property AS (
        INSERT INTO properties (
          owner_id, title, description, property_type_id, property_status_id,
          address, city, area_value, area_unit_id, bedrooms, bathrooms, sale_price, rent_price
        ) VALUES (
          $1, $2, $3, $4, (SELECT property_status_id FROM property_statuses WHERE name = 'Pending'),
          $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *
      )
      SELECT ip.*, ps.name AS property_status
      FROM inserted_property ip
      JOIN property_statuses ps ON ip.property_status_id = ps.property_status_id;
    `;

    const values = [
      ownerId,
      data.title,
      data.description || null,
      data.property_type_id,
      data.address,
      data.city,
      data.area_value,
      data.area_unit_id,
      data.bedrooms,
      data.bathrooms,
      data.sale_price,
      data.rent_price
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }


  static async getVerificationSummary(ownerId) {
    const query = `
      SELECT 
        COUNT(CASE WHEN vs.name = 'Verified' THEN 1 END) AS ppc_verified,
        COUNT(CASE WHEN vs.name IN ('Pending', 'In Progress') THEN 1 END) AS under_review
      FROM property_verifications pv
      JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
      JOIN properties p ON pv.property_id = p.property_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      ppc_verified: parseInt(rows[0].ppc_verified, 10) || 0,
      under_review: parseInt(rows[0].under_review, 10) || 0
    };
  }

  static async getInspectionOverview(ownerId) {
    const query = `
      SELECT 
        i.inspection_id,
        p.property_id,
        p.title AS property_title,
        p.city,
        p.address,
        COALESCE(i.completed_at, i.scheduled_at) AS inspection_date,
        is_stat.name AS inspection_status,
        ir.name AS inspection_result,
        u.name AS inspector_name
      FROM inspections i
      JOIN properties p ON i.property_id = p.property_id
      LEFT JOIN users u ON i.inspector_id = u.user_id
      LEFT JOIN inspection_statuses is_stat ON i.inspection_status_id = is_stat.inspection_status_id
      LEFT JOIN inspection_reports irep ON i.inspection_id = irep.inspection_id
      LEFT JOIN inspection_results ir ON irep.inspection_result_id = ir.inspection_result_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
      ORDER BY COALESCE(i.completed_at, i.scheduled_at) DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async getUpcomingVisits(ownerId, limit, offset) {
    const query = `
      SELECT 
        v.visit_id,
        p.property_id,
        p.title AS property_title,
        v.scheduled_at,
        v.customer_id,
        u.name AS customer_name,
        vs.name AS visit_status
      FROM property_visits v
      JOIN properties p ON v.property_id = p.property_id
      LEFT JOIN users u ON v.customer_id = u.user_id
      JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      WHERE p.owner_id = $1 
        AND v.scheduled_at > NOW()
        AND vs.name IN ('Scheduled', 'Confirmed', 'Rescheduled')
        AND (p.is_deleted = false OR p.is_deleted IS NULL)
      ORDER BY v.scheduled_at ASC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await pool.query(query, [ownerId, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) 
      FROM property_visits v
      JOIN properties p ON v.property_id = p.property_id
      JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      WHERE p.owner_id = $1 
        AND v.scheduled_at > NOW()
        AND vs.name IN ('Scheduled', 'Confirmed', 'Rescheduled')
        AND (p.is_deleted = false OR p.is_deleted IS NULL)
    `;
    const { rows: countRows } = await pool.query(countQuery, [ownerId]);
    const totalCount = parseInt(countRows[0].count, 10);

    return {
      visits: rows,
      pagination: {
        total: totalCount,
        page: Math.floor(offset / limit) + 1,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  static async getTransactionOverview(ownerId) {
    const query = `
      SELECT 
        t.transaction_id,
        p.property_id,
        p.title AS property_title,
        tt.name AS transaction_type,
        ts.name AS transaction_status,
        t.agreed_amount,
        t.transaction_date
      FROM transactions t
      JOIN properties p ON t.property_id = p.property_id
      JOIN transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
      JOIN transaction_statuses ts ON t.transaction_status_id = ts.transaction_status_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  }

  static async getFinancialSummary(ownerId) {
    const query = `
      SELECT 
        SUM(CASE WHEN ins.name = 'Paid' THEN i.amount ELSE 0 END) AS paid_amount,
        SUM(CASE WHEN ins.name IN ('Issued', 'Partially Paid', 'Overdue') THEN i.amount ELSE 0 END) AS pending_amount
      FROM invoices i
      JOIN invoice_statuses ins ON i.invoice_status_id = ins.invoice_status_id
      JOIN commission_records cr ON i.commission_id = cr.commission_id
      JOIN transactions t ON cr.transaction_id = t.transaction_id
      JOIN properties p ON t.property_id = p.property_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      paid_amount: parseFloat(rows[0].paid_amount) || 0,
      pending_amount: parseFloat(rows[0].pending_amount) || 0
    };
  }

  static async getRecentActivity(ownerId) {
    const query = `
      SELECT 
        'Verification' AS activity_type,
        'Verification Status Updated' AS title,
        vs.name AS description,
        COALESCE(pv.verified_at, pv.updated_at) AS activity_date,
        p.property_id
      FROM property_verifications pv
      JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
      JOIN properties p ON pv.property_id = p.property_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)

      UNION ALL

      SELECT 
        'Visit' AS activity_type,
        'Property Visit Confirmed' AS title,
        vs.name AS description,
        COALESCE(v.confirmed_at, v.updated_at) AS activity_date,
        p.property_id
      FROM property_visits v
      JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      JOIN properties p ON v.property_id = p.property_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)

      UNION ALL

      SELECT 
        'Inspection' AS activity_type,
        'Inspection Report Available' AS title,
        irep.report_summary AS description,
        COALESCE(irep.reported_at, irep.created_at) AS activity_date,
        p.property_id
      FROM inspection_reports irep
      JOIN inspections i ON irep.inspection_id = i.inspection_id
      JOIN properties p ON i.property_id = p.property_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)

      UNION ALL

      SELECT 
        'Invoice' AS activity_type,
        'New Invoice Issued' AS title,
        ins.name AS description,
        COALESCE(inv.issued_at, inv.created_at) AS activity_date,
        p.property_id
      FROM invoices inv
      JOIN invoice_statuses ins ON inv.invoice_status_id = ins.invoice_status_id
      JOIN commission_records cr ON inv.commission_id = cr.commission_id
      JOIN transactions t ON cr.transaction_id = t.transaction_id
      JOIN properties p ON t.property_id = p.property_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)

      ORDER BY activity_date DESC
      LIMIT 5
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return rows;
  }

  static async getPropertiesSummary(ownerId) {
    const query = `
      SELECT 
        COUNT(*) AS total_properties,
        COUNT(CASE WHEN ps.name = 'Verified' THEN 1 END) AS verified_properties,
        COUNT(CASE WHEN ps.name IN ('Pending', 'Under Verification') THEN 1 END) AS pending_verification,
        COUNT(CASE WHEN ps.name = 'Active' THEN 1 END) AS active_properties
      FROM properties p
      LEFT JOIN property_statuses ps ON p.property_status_id = ps.property_status_id
      WHERE p.owner_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_properties: parseInt(rows[0].total_properties, 10) || 0,
      verified_properties: parseInt(rows[0].verified_properties, 10) || 0,
      pending_verification: parseInt(rows[0].pending_verification, 10) || 0,
    };
  }

  static async getPropertyDetails(propertyId, ownerId) {
    const query = `
      SELECT 
        p.property_id,
        p.title,
        p.description,
        p.address,
        p.city,
        p.sale_price,
        p.rent_price,
        p.bedrooms,
        p.bathrooms,
        p.area_value,
        au.name AS area_unit,
        pt.name AS property_type,
        ps.name AS property_status,
        (SELECT media_url FROM property_media pm 
         WHERE pm.property_id = p.property_id 
           AND pm.media_type_id = 1 
           AND pm.media_status_id = 3 
           AND pm.is_primary = true 
           AND (pm.is_deleted = false OR pm.is_deleted IS NULL) 
         LIMIT 1) AS primary_image,
        vs.name AS verification_status_name,
        vs.description AS verification_status_description
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN property_statuses ps ON p.property_status_id = ps.property_status_id
      LEFT JOIN area_units au ON p.area_unit_id = au.area_unit_id
      LEFT JOIN LATERAL (
        SELECT vs_sub.name, vs_sub.description 
        FROM property_verifications pv
        JOIN verification_statuses vs_sub ON pv.verification_status_id = vs_sub.verification_status_id
        WHERE pv.property_id = p.property_id
        ORDER BY pv.created_at DESC LIMIT 1
      ) vs ON true
      WHERE p.property_id = $1 
        AND p.owner_id = $2 
        AND (p.is_deleted = false OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [propertyId, ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async uploadPropertyMedia(ownerId, propertyId, mediaData) {
    const query = `
      INSERT INTO property_media (
        property_id, uploaded_by, media_type_id, media_status_id, media_url, is_primary, is_deleted
      ) VALUES (
        $1, $2, $3, 1, $4, $5, FALSE
      ) RETURNING *;
    `;

    const values = [
      propertyId,
      ownerId,
      mediaData.media_type_id,
      mediaData.media_url,
      mediaData.is_primary || false
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getPropertyVerificationPageSummary(ownerId) {
    const query = `
      SELECT 
        COUNT(DISTINCT p.property_id) AS total_properties,
        COUNT(DISTINCT CASE WHEN vs.name IN ('Pending', 'In Progress') THEN p.property_id END) AS pending_verification,
        COUNT(DISTINCT CASE WHEN vs.name = 'Verified' THEN p.property_id END) AS verified_properties,
        COUNT(DISTINCT CASE WHEN vs.name = 'Rejected' THEN p.property_id END) AS rejected_properties
      FROM properties p
      LEFT JOIN property_verifications pv ON p.property_id = pv.property_id
      LEFT JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
      WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_properties: parseInt(rows[0].total_properties, 10) || 0,
      pending_verification: parseInt(rows[0].pending_verification, 10) || 0,
      verified_properties: parseInt(rows[0].verified_properties, 10) || 0,
      rejected_properties: parseInt(rows[0].rejected_properties, 10) || 0
    };
  }
  static async getPropertyVerificationsList(ownerId, filters = {}) {
    const { search, status, page = 1, limit = 10, sort } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)`;
    const values = [ownerId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND vs.name = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    let orderBy = 'ORDER BY lv.created_at DESC';
    if (sort) {
      if (sort === 'date_asc') orderBy = 'ORDER BY lv.created_at ASC';
      else if (sort === 'date_desc') orderBy = 'ORDER BY lv.created_at DESC';
      else if (sort === 'title_asc') orderBy = 'ORDER BY p.title ASC';
      else if (sort === 'title_desc') orderBy = 'ORDER BY p.title DESC';
    }

    const query = `
      WITH latest_verifications AS (
        SELECT 
          pv.property_id,
          pv.verification_status_id,
          pv.verified_at,
          pv.created_at,
          pv.updated_at,
          ROW_NUMBER() OVER (PARTITION BY pv.property_id ORDER BY pv.created_at DESC) as rn
        FROM property_verifications pv
      )
      SELECT 
        p.property_id,
        p.title AS property_title,
        pt.name AS property_type,
        p.city,
        p.address,
        vs.name AS verification_status,
        vs.description AS verification_status_description,
        lv.verified_at AS verification_date,
        lv.updated_at AS last_updated
      FROM properties p
      JOIN latest_verifications lv ON p.property_id = lv.property_id AND lv.rn = 1
      JOIN verification_statuses vs ON lv.verification_status_id = vs.verification_status_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      WITH latest_verifications AS (
        SELECT 
          pv.property_id,
          pv.verification_status_id,
          ROW_NUMBER() OVER (PARTITION BY pv.property_id ORDER BY pv.created_at DESC) as rn
        FROM property_verifications pv
      )
      SELECT COUNT(*) 
      FROM properties p
      JOIN latest_verifications lv ON p.property_id = lv.property_id AND lv.rn = 1
      JOIN verification_statuses vs ON lv.verification_status_id = vs.verification_status_id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getPropertyVerificationDetails(ownerId, propertyId) {
    const query = `
      SELECT 
        p.property_id,
        p.title AS property_title,
        pt.name AS property_type,
        CONCAT_WS(', ', NULLIF(p.address, ''), NULLIF(p.city, '')) AS location,
        vs.name AS verification_status,
        pv.verification_id AS ppc_id,
        pv.verified_at AS verification_date,
        pv.updated_at AS last_updated,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image
      FROM properties p
      JOIN property_verifications pv ON p.property_id = pv.property_id
      JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      WHERE p.property_id = $1 
        AND p.owner_id = $2 
        AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
      ORDER BY pv.created_at DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [propertyId, ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }
  static async getInspectionsSummary(ownerId) {
    const query = `
      SELECT 
        COUNT(DISTINCT i.inspection_id) AS total_inspections,
        COUNT(DISTINCT CASE WHEN ists.name = 'Completed' THEN i.inspection_id END) AS completed,
        COUNT(DISTINCT CASE WHEN ists.name = 'Scheduled' THEN i.inspection_id END) AS scheduled,
        COUNT(DISTINCT CASE WHEN ists.name = 'Pending' THEN i.inspection_id END) AS pending_assignment
      FROM inspections i
      JOIN properties p ON i.property_id = p.property_id
      JOIN inspection_statuses ists ON i.inspection_status_id = ists.inspection_status_id
      WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_inspections: parseInt(rows[0].total_inspections, 10) || 0,
      completed: parseInt(rows[0].completed, 10) || 0,
      scheduled: parseInt(rows[0].scheduled, 10) || 0,
      pending_assignment: parseInt(rows[0].pending_assignment, 10) || 0
    };
  }
  static async getInspectionsList(ownerId, filters = {}) {
    const { search, status, result, page = 1, limit = 10, sort } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)`;
    const values = [ownerId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND ists.name = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (result) {
      whereClause += ` AND ires.name = $${paramIndex}`;
      values.push(result);
      paramIndex++;
    }

    let orderBy = 'ORDER BY i.scheduled_at DESC NULLS LAST';
    if (sort) {
      if (sort === 'date_asc') orderBy = 'ORDER BY COALESCE(i.completed_at, i.scheduled_at) ASC NULLS LAST';
      else if (sort === 'date_desc') orderBy = 'ORDER BY COALESCE(i.completed_at, i.scheduled_at) DESC NULLS LAST';
      else if (sort === 'title_asc') orderBy = 'ORDER BY p.title ASC';
      else if (sort === 'title_desc') orderBy = 'ORDER BY p.title DESC';
    }

    const query = `
      WITH latest_reports AS (
        SELECT 
          ir.inspection_id,
          ir.inspection_result_id,
          ROW_NUMBER() OVER (PARTITION BY ir.inspection_id ORDER BY ir.created_at DESC) as rn
        FROM inspection_reports ir
      )
      SELECT 
        i.inspection_id,
        p.property_id,
        p.title AS property_title,
        pt.name AS property_type,
        p.city,
        p.address,
        ists.name AS inspection_status,
        ires.name AS inspection_result,
        i.scheduled_at,
        i.completed_at,
        i.inspector_id,
        u.name AS inspector_name
      FROM inspections i
      JOIN properties p ON i.property_id = p.property_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN inspection_statuses ists ON i.inspection_status_id = ists.inspection_status_id
      LEFT JOIN users u ON i.inspector_id = u.user_id
      LEFT JOIN latest_reports lr ON i.inspection_id = lr.inspection_id AND lr.rn = 1
      LEFT JOIN inspection_results ires ON lr.inspection_result_id = ires.inspection_result_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      WITH latest_reports AS (
        SELECT 
          ir.inspection_id,
          ir.inspection_result_id,
          ROW_NUMBER() OVER (PARTITION BY ir.inspection_id ORDER BY ir.created_at DESC) as rn
        FROM inspection_reports ir
      )
      SELECT COUNT(*) 
      FROM inspections i
      JOIN properties p ON i.property_id = p.property_id
      LEFT JOIN inspection_statuses ists ON i.inspection_status_id = ists.inspection_status_id
      LEFT JOIN latest_reports lr ON i.inspection_id = lr.inspection_id AND lr.rn = 1
      LEFT JOIN inspection_results ires ON lr.inspection_result_id = ires.inspection_result_id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getInspectionDetails(ownerId, inspectionId) {
    const query = `
      SELECT 
        i.inspection_id,
        p.property_id,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        p.title AS property_title,
        pt.name AS property_type,
        CONCAT_WS(', ', NULLIF(p.address, ''), NULLIF(p.city, '')) AS location,
        ists.name AS inspection_status,
        ires.name AS inspection_result,
        i.scheduled_at,
        i.completed_at,
        i.updated_at AS last_updated
      FROM inspections i
      JOIN properties p ON i.property_id = p.property_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN inspection_statuses ists ON i.inspection_status_id = ists.inspection_status_id
      LEFT JOIN inspection_reports ir ON i.inspection_id = ir.inspection_id
      LEFT JOIN inspection_results ires ON ir.inspection_result_id = ires.inspection_result_id
      WHERE i.inspection_id = $1 
        AND p.owner_id = $2 
        AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
      ORDER BY ir.created_at DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [inspectionId, ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }
  static async getVisitsSummary(ownerId) {
    const query = `
      SELECT 
        COUNT(DISTINCT v.visit_id) AS total_visits,
        COUNT(DISTINCT CASE WHEN vs.name = 'Confirmed' THEN v.visit_id END) AS confirmed,
        COUNT(DISTINCT CASE WHEN vs.name = 'Scheduled' THEN v.visit_id END) AS scheduled,
        COUNT(DISTINCT CASE WHEN vs.name = 'Completed' THEN v.visit_id END) AS completed
      FROM property_visits v
      JOIN properties p ON v.property_id = p.property_id
      JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_visits: parseInt(rows[0].total_visits, 10) || 0,
      confirmed: parseInt(rows[0].confirmed, 10) || 0,
      scheduled: parseInt(rows[0].scheduled, 10) || 0,
      completed: parseInt(rows[0].completed, 10) || 0
    };
  }
  static async getVisitsList(ownerId, filters = {}) {
    const { search, status, page = 1, limit = 10, sort } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)`;
    const values = [ownerId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (
        p.title ILIKE $${paramIndex} OR 
        p.address ILIKE $${paramIndex} OR 
        p.city ILIKE $${paramIndex} OR 
        u.name ILIKE $${paramIndex} OR
        v.visit_id::text ILIKE $${paramIndex}
      )`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND vs.name = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    let orderBy = 'ORDER BY v.scheduled_at DESC NULLS LAST';
    if (sort) {
      if (sort === 'date_asc') orderBy = 'ORDER BY v.scheduled_at ASC NULLS LAST';
      else if (sort === 'date_desc') orderBy = 'ORDER BY v.scheduled_at DESC NULLS LAST';
      else if (sort === 'title_asc') orderBy = 'ORDER BY p.title ASC';
      else if (sort === 'title_desc') orderBy = 'ORDER BY p.title DESC';
    }

    const query = `
      SELECT 
        v.visit_id,
        p.property_id,
        p.title AS property_title,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        pt.name AS property_type,
        p.city,
        v.customer_id,
        u.name AS customer_name,
        v.scheduled_at,
        vs.name AS visit_status
      FROM property_visits v
      JOIN properties p ON v.property_id = p.property_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN users u ON v.customer_id = u.user_id
      LEFT JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM property_visits v
      JOIN properties p ON v.property_id = p.property_id
      LEFT JOIN users u ON v.customer_id = u.user_id
      LEFT JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getVisitDetails(ownerId, visitId) {
    const query = `
      SELECT 
        v.visit_id,
        '#VIS-' || TO_CHAR(COALESCE(v.created_at, v.scheduled_at, NOW()), 'YYYY') || '-' || LPAD(v.visit_id::text, 4, '0') AS visit_display_id,
        p.property_id,
        p.title AS property_title,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        CONCAT_WS(', ', NULLIF(p.address, ''), NULLIF(p.city, '')) AS location,
        TO_CHAR(v.scheduled_at, 'YYYY-MM-DD') AS visit_date,
        TO_CHAR(v.scheduled_at, 'HH12:MI AM') AS visit_time,
        v.customer_id,
        u.name AS customer_name,
        v.updated_at AS last_updated,
        vs.name AS visit_status
      FROM property_visits v
      JOIN properties p ON v.property_id = p.property_id
      LEFT JOIN users u ON v.customer_id = u.user_id
      LEFT JOIN visit_statuses vs ON v.visit_status_id = vs.visit_status_id
      WHERE v.visit_id = $1 
        AND p.owner_id = $2 
        AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [visitId, ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }
  static async getTransactionSummary(ownerId) {
    const query = `
      SELECT 
        COUNT(DISTINCT t.transaction_id) AS total_transactions,
        COUNT(DISTINCT CASE WHEN ts.name = 'Confirmed' THEN t.transaction_id END) AS active,
        COUNT(DISTINCT CASE WHEN ts.name = 'Completed' THEN t.transaction_id END) AS completed,
        COUNT(DISTINCT CASE WHEN ts.name = 'Pending' THEN t.transaction_id END) AS pending
      FROM transactions t
      JOIN properties p ON t.property_id = p.property_id
      JOIN transaction_statuses ts ON t.transaction_status_id = ts.transaction_status_id
      WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_transactions: parseInt(rows[0].total_transactions, 10) || 0,
      active: parseInt(rows[0].active, 10) || 0,
      completed: parseInt(rows[0].completed, 10) || 0,
      pending: parseInt(rows[0].pending, 10) || 0
    };
  }
  static async getTransactionList(ownerId, filters = {}) {
    const { search, status, page = 1, limit = 10, sort } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)`;
    const values = [ownerId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (
        p.title ILIKE $${paramIndex} OR 
        p.city ILIKE $${paramIndex} OR 
        t.transaction_id::text ILIKE $${paramIndex}
      )`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND ts.name = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    let orderBy = 'ORDER BY t.transaction_date DESC NULLS LAST';
    if (sort) {
      if (sort === 'date_asc') orderBy = 'ORDER BY t.transaction_date ASC NULLS LAST';
      else if (sort === 'date_desc') orderBy = 'ORDER BY t.transaction_date DESC NULLS LAST';
      else if (sort === 'amount_asc') orderBy = 'ORDER BY t.agreed_amount ASC NULLS LAST';
      else if (sort === 'amount_desc') orderBy = 'ORDER BY t.agreed_amount DESC NULLS LAST';
    }

    const query = `
      SELECT 
        t.transaction_id,
        p.property_id,
        p.title AS property_title,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        pt.name AS property_type,
        p.city,
        tt.name AS transaction_type,
        t.agreed_amount,
        t.transaction_date,
        ts.name AS transaction_status
      FROM transactions t
      JOIN properties p ON t.property_id = p.property_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
      LEFT JOIN transaction_statuses ts ON t.transaction_status_id = ts.transaction_status_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM transactions t
      JOIN properties p ON t.property_id = p.property_id
      LEFT JOIN transaction_statuses ts ON t.transaction_status_id = ts.transaction_status_id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getTransactionDetails(ownerId, transactionId) {
    const query = `
      SELECT 
        t.transaction_id,
        '#TRN-' || TO_CHAR(COALESCE(t.created_at, t.transaction_date, NOW()), 'YYYY') || '-' || LPAD(t.transaction_id::text, 4, '0') AS transaction_display_id,
        p.property_id,
        p.title AS property_title,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        CONCAT_WS(', ', NULLIF(p.address, ''), NULLIF(p.city, '')) AS location,
        tt.name AS transaction_type,
        t.agreed_amount,
        t.transaction_date,
        t.updated_at AS last_updated,
        ts.name AS transaction_status
      FROM transactions t
      JOIN properties p ON t.property_id = p.property_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
      LEFT JOIN transaction_statuses ts ON t.transaction_status_id = ts.transaction_status_id
      WHERE t.transaction_id = $1 
        AND p.owner_id = $2 
        AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [transactionId, ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }
  static async getInvoicesSummary(ownerId) {
    const query = `
      WITH owner_invoices AS (
        SELECT 
          i.invoice_id,
          i.amount AS invoice_amount,
          inv_s.name AS invoice_status_name
        FROM invoices i
        JOIN invoice_statuses inv_s ON i.invoice_status_id = inv_s.invoice_status_id
        JOIN commission_records c ON i.commission_id = c.commission_id
        JOIN transactions t ON c.transaction_id = t.transaction_id
        JOIN properties p ON t.property_id = p.property_id
        WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
      ),
      invoice_payments AS (
        SELECT 
          pay.invoice_id,
          SUM(pay.payment_amount) AS paid_amount
        FROM payments pay
        JOIN payment_statuses ps ON pay.payment_status_id = ps.payment_status_id
        WHERE ps.name IN ('Completed', 'Success', 'Paid')
        GROUP BY pay.invoice_id
      )
      SELECT 
        COALESCE(SUM(ip.paid_amount), 0) AS total_paid,
        COALESCE(SUM(
          CASE WHEN oi.invoice_status_name != 'Cancelled' THEN 
            oi.invoice_amount - COALESCE(ip.paid_amount, 0)
          ELSE 0 END
        ), 0) AS outstanding_amount,
        COUNT(DISTINCT CASE WHEN oi.invoice_status_name != 'Cancelled' THEN oi.invoice_id END) AS total_invoices,
        COUNT(DISTINCT CASE WHEN oi.invoice_status_name = 'Paid' THEN oi.invoice_id END) AS paid_invoices,
        COUNT(DISTINCT CASE WHEN oi.invoice_status_name IN ('Issued', 'Partially Paid') THEN oi.invoice_id END) AS pending_invoices,
        COUNT(DISTINCT CASE WHEN oi.invoice_status_name = 'Overdue' THEN oi.invoice_id END) AS overdue_invoices
      FROM owner_invoices oi
      LEFT JOIN invoice_payments ip ON oi.invoice_id = ip.invoice_id
    `;

    const { rows } = await pool.query(query, [ownerId]);
    return {
      total_paid: parseFloat(rows[0].total_paid) || 0,
      outstanding_amount: parseFloat(rows[0].outstanding_amount) || 0,
      total_invoices: parseInt(rows[0].total_invoices, 10) || 0,
      paid_invoices: parseInt(rows[0].paid_invoices, 10) || 0,
      pending_invoices: parseInt(rows[0].pending_invoices, 10) || 0,
      overdue_invoices: parseInt(rows[0].overdue_invoices, 10) || 0
    };
  }
  static async getInvoiceList(ownerId, filters = {}) {
    const { search, status, page = 1, limit = 10, sort } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)`;
    const values = [ownerId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND inv_s.name = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    } else {
      whereClause += ` AND inv_s.name != 'Cancelled'`;
    }

    if (search) {
      whereClause += ` AND (
        p.title ILIKE $${paramIndex} OR 
        p.city ILIKE $${paramIndex} OR 
        i.invoice_number ILIKE $${paramIndex} OR
        i.invoice_id::text ILIKE $${paramIndex}
      )`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    let orderBy = 'ORDER BY i.issued_at DESC NULLS LAST';
    if (sort) {
      if (sort === 'date_asc') orderBy = 'ORDER BY i.issued_at ASC NULLS LAST';
      else if (sort === 'date_desc') orderBy = 'ORDER BY i.issued_at DESC NULLS LAST';
      else if (sort === 'amount_asc') orderBy = 'ORDER BY i.amount ASC NULLS LAST';
      else if (sort === 'amount_desc') orderBy = 'ORDER BY i.amount DESC NULLS LAST';
    }

    const query = `
      SELECT 
        i.invoice_id,
        COALESCE(i.invoice_number, '#INV-' || TO_CHAR(COALESCE(i.issued_at, i.created_at, NOW()), 'YYYY') || '-' || LPAD(i.invoice_id::text, 4, '0')) AS invoice_display_id,
        p.property_id,
        p.title AS property_title,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        pt.name AS property_type,
        p.city,
        tt.name AS invoice_type,
        i.amount,
        i.issued_at AS invoice_date,
        i.due_at AS due_date,
        inv_s.name AS invoice_status
      FROM invoices i
      JOIN invoice_statuses inv_s ON i.invoice_status_id = inv_s.invoice_status_id
      JOIN commission_records c ON i.commission_id = c.commission_id
      JOIN transactions t ON c.transaction_id = t.transaction_id
      JOIN properties p ON t.property_id = p.property_id
      LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM invoices i
      JOIN invoice_statuses inv_s ON i.invoice_status_id = inv_s.invoice_status_id
      JOIN commission_records c ON i.commission_id = c.commission_id
      JOIN transactions t ON c.transaction_id = t.transaction_id
      JOIN properties p ON t.property_id = p.property_id
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getInvoiceDetails(ownerId, invoiceId) {
    const query = `
      SELECT 
        i.invoice_id,
        COALESCE(i.invoice_number, '#INV-' || TO_CHAR(COALESCE(i.issued_at, i.created_at, NOW()), 'YYYY') || '-' || LPAD(i.invoice_id::text, 4, '0')) AS invoice_display_id,
        p.property_id,
        p.title AS property_title,
        (
          SELECT media_url 
          FROM property_media pm 
          WHERE pm.property_id = p.property_id 
            AND pm.media_type_id = 1 
            AND pm.media_status_id = 3 
            AND pm.is_primary = TRUE 
            AND (pm.is_deleted = FALSE OR pm.is_deleted IS NULL) 
          LIMIT 1
        ) AS property_image,
        CONCAT_WS(', ', NULLIF(p.address, ''), NULLIF(p.city, '')) AS location,
        tt.name AS invoice_type,
        i.amount,
        i.issued_at AS invoice_date,
        i.due_at AS due_date,
        i.updated_at AS last_updated,
        inv_s.name AS invoice_status
      FROM invoices i
      JOIN invoice_statuses inv_s ON i.invoice_status_id = inv_s.invoice_status_id
      JOIN commission_records c ON i.commission_id = c.commission_id
      JOIN transactions t ON c.transaction_id = t.transaction_id
      JOIN properties p ON t.property_id = p.property_id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
      WHERE i.invoice_id = $1 
        AND p.owner_id = $2 
        AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
    `;

    const { rows } = await pool.query(query, [invoiceId, ownerId]);
    return rows.length > 0 ? rows[0] : null;
  }
  static async updateOwnerProfile(ownerId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    
    if (updates.mobile_no !== undefined) {
      fields.push(`mobile_no = $${paramIndex}`);
      values.push(updates.mobile_no);
      paramIndex++;
    }

    if (updates.country !== undefined) {
      fields.push(`country = $${paramIndex}`);
      values.push(updates.country);
      paramIndex++;
    }

    if (fields.length === 0) {
      const { rows } = await pool.query(
        'SELECT user_id, name, email, country, mobile_no, role_id, created_at FROM users WHERE user_id = $1',
        [ownerId]
      );
      return rows[0];
    }

    values.push(ownerId);
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE user_id = $${paramIndex}
      RETURNING user_id, name, email, country, mobile_no, role_id, created_at
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  }
  static async getOwnerPassword(ownerId) {
    const query = `SELECT password FROM users WHERE user_id = $1`;
    const { rows } = await pool.query(query, [ownerId]);
    return rows.length > 0 ? rows[0].password : null;
  }

  static async changePassword(ownerId, hashedPassword) {
    const query = `
      UPDATE users 
      SET password = $1 
      WHERE user_id = $2
    `;
    await pool.query(query, [hashedPassword, ownerId]);
    return true;
  }
}

module.exports = OwnerModel;
