const { pool } = require('../../config/db');
const { getAdminPropertyStats } = require('./properties.model');
const { getAdminRequestStats } = require('./requests.model');
const { getAdminVisitStats } = require('./visits.model');
const { getAdminInspectionStats } = require('./inspections.model');
const { getAdminCustomerStats } = require('./customers.model');

/**
 * Retrieves aggregated executive summary statistics for Admin Dashboard.
 * Gathers KPIs across properties, requests, visits, inspections, customers, and action triage.
 *
 * @returns {Promise<Object>} Aggregated dashboard summary
 */
const getAdminDashboardSummary = async () => {
  const [
    propertyStats,
    requestStats,
    visitStats,
    inspectionStats,
    customerStats
  ] = await Promise.all([
    getAdminPropertyStats().catch(() => ({
      total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0, active: 0, inactive: 0, forSale: 0, forRent: 0
    })),
    getAdminRequestStats().catch(() => ({
      total: 0, pending: 0, underReview: 0, inOps: 0, completed: 0, rejected: 0, withdrawn: 0, propertyReqs: 0, serviceReqs: 0
    })),
    getAdminVisitStats().catch(() => ({
      total: 0, scheduled: 0, completed: 0, overdue: 0, cancelled: 0
    })),
    getAdminInspectionStats().catch(() => ({
      total: 0, verified: 0, flagged: 0, scheduled: 0
    })),
    getAdminCustomerStats().catch(() => ({
      total_customers: '0', active_customers: '0', inactive_customers: '0', new_customers: '0'
    }))
  ]);

  const totalActionRequired =
    (propertyStats.pending || 0) +
    (requestStats.pending || 0) +
    (visitStats.overdue || 0) +
    (inspectionStats.flagged || 0);

  const totalInspected = (inspectionStats.verified || 0) + (inspectionStats.flagged || 0);
  const complianceRate = totalInspected > 0
    ? Math.round(((inspectionStats.verified || 0) / totalInspected) * 100)
    : 100;

  const requestResolutionRate = (requestStats.total || 0) > 0
    ? Math.round(((requestStats.completed || 0) / requestStats.total) * 100)
    : 0;

  const propertyApprovalRate = (propertyStats.total || 0) > 0
    ? Math.round(((propertyStats.approved || 0) / propertyStats.total) * 100)
    : 0;

  return {
    properties: propertyStats,
    requests: requestStats,
    visits: visitStats,
    inspections: {
      ...inspectionStats,
      complianceRate
    },
    customers: customerStats,
    triage: {
      pendingProperties: propertyStats.pending || 0,
      pendingRequests: requestStats.pending || 0,
      overdueVisits: visitStats.overdue || 0,
      flaggedInspections: inspectionStats.flagged || 0,
      totalActionRequired
    },
    performance: {
      complianceRate,
      requestResolutionRate,
      propertyApprovalRate
    }
  };
};

/**
 * Retrieves top recent operational activity records for the Admin Dashboard feed.
 *
 * @param {number} [limit=5]
 * @returns {Promise<{ recentProperties: Array, recentRequests: Array, recentVisits: Array }>}
 */
const getAdminDashboardActivity = async (limit = 5) => {
  const parsedLimit = Math.max(1, Math.min(20, parseInt(limit, 10) || 5));

  // 1. Recent Properties Query
  const propertiesQuery = `
    SELECT
      p.property_id::text,
      'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
      TRIM(CONCAT_WS(' ', ct.title_abb, cu.customer_first_name, cu.customer_last_name)) AS customer_name,
      pt.property_type_description AS property_type,
      s.society_english AS society,
      ci.city_english AS city,
      pd.demand_amount,
      pdt.demand_type_english AS demand_type,
      COALESCE(aps.approval_stage_english, 'Pending') AS approval_stage,
      pp.picture_url AS cover_image,
      p.creation_date_time
    FROM properties p
    JOIN customers cu ON p.customer_id = cu.customer_id
    LEFT JOIN customer_titles ct ON cu.customer_title_id = ct.customer_title_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies s ON a.society_id = s.society_id
    LEFT JOIN cities ci ON s.city_id = ci.city_id
    LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
    LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id
    LEFT JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
    LEFT JOIN approval_stages aps ON pa.approval_stage_id = aps.approval_stage_id
    LEFT JOIN property_pictures pp ON pp.property_picture_id = (
      SELECT pp_sub.property_picture_id FROM property_pictures pp_sub 
      WHERE pp_sub.property_id = p.property_id AND pp_sub.is_active = true 
      ORDER BY pp_sub.property_picture_id ASC LIMIT 1
    )
    ORDER BY p.creation_date_time DESC
    LIMIT $1;
  `;

  // 2. Recent Requests Query
  const requestsQuery = `
    SELECT
      cr.request_id::text,
      'REQ-' || LPAD(cr.request_id::text, 3, '0') AS formatted_id,
      TRIM(CONCAT_WS(' ', ct.title_abb, cu.customer_first_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      COALESCE(pst.service_english, rp.purpose_description, 'General Request') AS service_type_description,
      ci.city_english AS city,
      COALESCE(st.request_status_english, 'Pending') AS status,
      cr.creation_date_time
    FROM customer_requests cr
    LEFT JOIN customers cu ON cr.customer_id = cu.customer_id
    LEFT JOIN customer_titles ct ON cu.customer_title_id = ct.customer_title_id
    LEFT JOIN ppc_services pst ON cr.service_id = pst.service_id
    LEFT JOIN property_purposes rp ON cr.request_purpose_id = rp.purpose_id
    LEFT JOIN properties p ON cr.property_id = p.property_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies s ON a.society_id = s.society_id
    LEFT JOIN cities ci ON s.city_id = ci.city_id
    LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
    LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    WHERE cr.is_active = true
    ORDER BY cr.creation_date_time DESC
    LIMIT $1;
  `;

  // 3. Recent Visits Query
  const visitsQuery = `
    SELECT
      pv.visit_id::text,
      'VIS-' || LPAD(pv.visit_id::text, 3, '0') AS formatted_id,
      'PRP-' || LPAD(pv.property_id::text, 3, '0') AS property_formatted_id,
      pv.property_id::text,
      TRIM(CONCAT_WS(' ', ct.title_abb, cu.customer_first_name, cu.customer_last_name)) AS customer_name,
      TRIM(CONCAT_WS(' ', e.first_name, e.last_name)) AS employee_name,
      pv.visit_scheduled_date,
      pv.visit_actual_date,
      CASE WHEN pv.visit_actual_date IS NOT NULL THEN 'Completed' ELSE 'Scheduled' END AS status,
      pv.creation_date_time
    FROM property_visits pv
    LEFT JOIN customers cu ON pv.visitor_customer_id = cu.customer_id
    LEFT JOIN customer_titles ct ON cu.customer_title_id = ct.customer_title_id
    LEFT JOIN employees e ON pv.visit_conducted_employee_id = e.employee_id
    WHERE pv.is_active = true
    ORDER BY pv.visit_scheduled_date DESC
    LIMIT $1;
  `;

  const [propsResult, reqsResult, visitsResult] = await Promise.all([
    pool.query(propertiesQuery, [parsedLimit]).catch(() => ({ rows: [] })),
    pool.query(requestsQuery, [parsedLimit]).catch(() => ({ rows: [] })),
    pool.query(visitsQuery, [parsedLimit]).catch(() => ({ rows: [] }))
  ]);

  return {
    recentProperties: propsResult.rows || [],
    recentRequests: reqsResult.rows || [],
    recentVisits: visitsResult.rows || []
  };
};

/**
 * Retrieves both summary statistics and recent activity in a single unified payload.
 *
 * @param {number} [limit=5]
 * @returns {Promise<Object>} Full executive dashboard payload
 */
const getAdminDashboardOverview = async (limit = 5) => {
  const [summary, activity] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminDashboardActivity(limit)
  ]);

  return {
    ...summary,
    ...activity
  };
};

module.exports = {
  getAdminDashboardSummary,
  getAdminDashboardActivity,
  getAdminDashboardOverview
};
