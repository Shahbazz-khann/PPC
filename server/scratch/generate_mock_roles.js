const fs = require('fs');
const { getAdminRoles } = require('../models/Admin/roles.model');
const { getRoleById, getAllRolePageAccessByRoleIds } = require('../models/Admin/rolePageAccess.model');
const { buildRolePermissionMatrix } = require('../services/permission.service');

async function generateMockRoles() {
  const roles = await getAdminRoles();
  const matrices = {};
  for (const r of roles) {
    const stored = r.role_english.toLowerCase() === 'admin' ? [] : await getAllRolePageAccessByRoleIds([r.role_id]);
    matrices[r.role_id] = buildRolePermissionMatrix(r, stored);
  }

  // Realistic demo permissions for Management & Inspector if currently blank
  if (matrices['1']) {
    matrices['1'].permissions = matrices['1'].permissions.map(p => {
      const enable = ['dashboard', 'operations', 'reference_property', 'reference_location'].includes(p.group_key) && !p.is_root_locked;
      return { ...p, can_access: enable };
    });
  }
  if (matrices['2']) {
    matrices['2'].permissions = matrices['2'].permissions.map(p => {
      const enable = ['PAGE_ADMIN_DASHBOARD', 'PAGE_ADMIN_PROPERTIES', 'PAGE_ADMIN_PROPERTY_VISITS', 'PAGE_ADMIN_INSPECTIONS'].includes(p.page_key);
      return { ...p, can_access: enable };
    });
  }

  const fileContent = `/**
 * Mock & Initial Reference Data for Admin Role Management
 * Sourced directly from PostgreSQL schema and Canonical Admin Page Registry (37 pages).
 */

export const INITIAL_ROLES = ${JSON.stringify(roles, null, 2)};

export const INITIAL_ROLE_MATRICES = ${JSON.stringify(matrices, null, 2)};

export const ROLE_GROUPS = [
  { key: 'dashboard', label: 'Dashboard', badge: 'Core Overview' },
  { key: 'administration', label: 'Administration', badge: 'System & Governance' },
  { key: 'operations', label: 'Operations & Reports', badge: 'Core Workflow' },
  { key: 'reference_location', label: 'Reference: Location', badge: 'Geography' },
  { key: 'reference_property', label: 'Reference: Property', badge: 'Real Estate Data' },
  { key: 'reference_requests', label: 'Reference: Workflow & Stages', badge: 'Workflows' },
  { key: 'reference_services', label: 'Reference: Services', badge: 'Services Catalog' },
  { key: 'reference_access', label: 'Reference: Access Control', badge: 'IAM & Designations' },
  { key: 'reference_finance', label: 'Reference: Finance', badge: 'Monetary' },
  { key: 'pending', label: 'Pending & Financials', badge: 'Records & Invoicing' },
];
`;

  fs.writeFileSync('../client/src/Pages/Admin/roles/mockAdminRoles.js', fileContent);
  console.log('Successfully written mockAdminRoles.js');
  process.exit(0);
}

generateMockRoles().catch(e => {
  console.error(e);
  process.exit(1);
});
