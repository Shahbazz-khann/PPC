/**
 * @file adminPageRegistry.js
 * @description Canonical administrative page registry for Pakistan Property Care (PPC).
 * Defines the authoritative 37 governable Admin pages, stable permission keys,
 * route associations, presentation grouping, and explicit support-read dependency mappings.
 *
 * LOCKED T2 RULES:
 * 1. Contains exactly 37 independently governable page keys.
 * 2. Includes PAGE_REF_PROPERTY_STATUS_TYPES and PAGE_REF_UOM as first-class keys.
 * 3. /admin/customers/:customerId inherits PAGE_ADMIN_CUSTOMERS (no separate customer detail key).
 * 4. Support-read dependencies are explicit, directional (child -> required ancestor lookups),
 *    and NEVER grant mutating permissions (POST/PUT/PATCH/DELETE).
 * 5. This module is immutable (frozen) application configuration.
 */

const ADMIN_PAGE_KEYS = Object.freeze({
  // --- Admin Dashboard (1) ---
  PAGE_ADMIN_DASHBOARD: 'PAGE_ADMIN_DASHBOARD',

  // --- Administration (6) ---
  PAGE_ADMIN_USERS: 'PAGE_ADMIN_USERS',
  PAGE_ADMIN_ROLES: 'PAGE_ADMIN_ROLES',
  PAGE_ADMIN_EMPLOYEES: 'PAGE_ADMIN_EMPLOYEES',
  PAGE_ADMIN_SERVICE_PROVIDERS: 'PAGE_ADMIN_SERVICE_PROVIDERS',
  PAGE_ADMIN_SYSTEM_CONFIG: 'PAGE_ADMIN_SYSTEM_CONFIG',
  PAGE_ADMIN_API_LOGS: 'PAGE_ADMIN_API_LOGS',

  // --- Reference Tables - Location (8) ---
  PAGE_REF_COUNTRIES: 'PAGE_REF_COUNTRIES',
  PAGE_REF_PROVINCES: 'PAGE_REF_PROVINCES',
  PAGE_REF_DIVISIONS: 'PAGE_REF_DIVISIONS',
  PAGE_REF_DISTRICTS: 'PAGE_REF_DISTRICTS',
  PAGE_REF_TEHSILS: 'PAGE_REF_TEHSILS',
  PAGE_REF_CITIES: 'PAGE_REF_CITIES',
  PAGE_REF_SOCIETIES: 'PAGE_REF_SOCIETIES',
  PAGE_REF_AREAS: 'PAGE_REF_AREAS',

  // --- Reference Tables - Property (6) ---
  PAGE_REF_PROPERTY_TYPES: 'PAGE_REF_PROPERTY_TYPES',
  PAGE_REF_PROPERTY_STATUS_TYPES: 'PAGE_REF_PROPERTY_STATUS_TYPES',
  PAGE_REF_PROPERTY_PURPOSES: 'PAGE_REF_PROPERTY_PURPOSES',
  PAGE_REF_PROPERTY_DEMAND_TYPES: 'PAGE_REF_PROPERTY_DEMAND_TYPES',
  PAGE_REF_PROPERTY_USE: 'PAGE_REF_PROPERTY_USE',
  PAGE_REF_UOM: 'PAGE_REF_UOM',

  // --- Reference Tables - Requests & Workflow (2) ---
  PAGE_REF_CUST_REQ_STATUS_TYPES: 'PAGE_REF_CUST_REQ_STATUS_TYPES',
  PAGE_REF_APPROVAL_STAGES: 'PAGE_REF_APPROVAL_STAGES',

  // --- Reference Tables - Services (2) ---
  PAGE_REF_PPC_SERVICE_TYPES: 'PAGE_REF_PPC_SERVICE_TYPES',
  PAGE_REF_PPC_SERVICES: 'PAGE_REF_PPC_SERVICES',

  // --- Reference Tables - Employee / Access (3) ---
  PAGE_REF_USER_TYPES: 'PAGE_REF_USER_TYPES',
  PAGE_REF_ROLES_MASTER: 'PAGE_REF_ROLES_MASTER',
  PAGE_REF_DESIGNATIONS: 'PAGE_REF_DESIGNATIONS',

  // --- Reference Tables - Finance (1) ---
  PAGE_REF_CURRENCIES: 'PAGE_REF_CURRENCIES',

  // --- Operations (6) ---
  PAGE_ADMIN_CUSTOMERS: 'PAGE_ADMIN_CUSTOMERS',
  PAGE_ADMIN_PROPERTIES: 'PAGE_ADMIN_PROPERTIES',
  PAGE_ADMIN_REQUESTS: 'PAGE_ADMIN_REQUESTS',
  PAGE_ADMIN_PROPERTY_VISITS: 'PAGE_ADMIN_PROPERTY_VISITS',
  PAGE_ADMIN_INSPECTIONS: 'PAGE_ADMIN_INSPECTIONS',
  PAGE_ADMIN_VERIFICATIONS: 'PAGE_ADMIN_VERIFICATIONS',

  // --- Pending / Later (2) ---
  PAGE_ADMIN_REGISTRY: 'PAGE_ADMIN_REGISTRY',
  PAGE_ADMIN_PAYMENTS: 'PAGE_ADMIN_PAYMENTS',
});

/**
 * Full Canonical Page Registry (Exactly 37 Pages)
 */
const ADMIN_PAGE_REGISTRY = Object.freeze([
  // 1. Dashboard
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_DASHBOARD,
    labelKey: 'admin:dashboardTitle',
    defaultLabel: 'Dashboard',
    route: '/admin/dashboard',
    subroutes: [],
    groupKey: 'dashboard',
    groupLabelKey: 'admin:dashboardTitle',
    apiPrefix: '/admin/dashboard',
    isRootLocked: false,
  }),

  // 2. User Management (Root-locked for Admin)
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_USERS,
    labelKey: 'admin:navUserManagement',
    defaultLabel: 'User Management',
    route: '/admin/users',
    subroutes: [],
    groupKey: 'administration',
    groupLabelKey: 'admin:navAdministration',
    apiPrefix: '/admin/users',
    isRootLocked: true,
  }),

  // 3. Role Management (Root-locked for Admin)
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_ROLES,
    labelKey: 'admin:navRoleManagement',
    defaultLabel: 'Role Management',
    route: '/admin/roles',
    subroutes: [],
    groupKey: 'administration',
    groupLabelKey: 'admin:navAdministration',
    apiPrefix: '/admin/roles',
    isRootLocked: true,
  }),

  // 4. Employee Management
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_EMPLOYEES,
    labelKey: 'admin:navEmployeeManagement',
    defaultLabel: 'Employee Management',
    route: '/admin/employees',
    subroutes: [],
    groupKey: 'administration',
    groupLabelKey: 'admin:navAdministration',
    apiPrefix: '/admin/employees',
    isRootLocked: false,
  }),

  // 5. Service Provider Management
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_SERVICE_PROVIDERS,
    labelKey: 'admin:navServiceProviderManagement',
    defaultLabel: 'Service Provider Management',
    route: '/admin/service-providers',
    subroutes: [],
    groupKey: 'administration',
    groupLabelKey: 'admin:navAdministration',
    apiPrefix: '/admin/service-providers',
    isRootLocked: false,
  }),

  // 6. System Configuration
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_SYSTEM_CONFIG,
    labelKey: 'admin:navSystemConfiguration',
    defaultLabel: 'System Configuration',
    route: '/admin/system-configuration',
    subroutes: [],
    groupKey: 'administration',
    groupLabelKey: 'admin:navAdministration',
    apiPrefix: '/admin/system-configuration',
    isRootLocked: false,
  }),

  // 7. API Logs
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_API_LOGS,
    labelKey: 'admin:navApiLogs',
    defaultLabel: 'API Logs',
    route: '/admin/api-logs',
    subroutes: [],
    groupKey: 'administration',
    groupLabelKey: 'admin:navAdministration',
    apiPrefix: '/admin/api-logs',
    isRootLocked: false,
  }),

  // 8. Countries
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
    labelKey: 'admin:navCountries',
    defaultLabel: 'Countries',
    route: '/admin/reference/countries',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/countries',
    isRootLocked: false,
  }),

  // 9. Provinces
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES,
    labelKey: 'admin:navProvinces',
    defaultLabel: 'Provinces',
    route: '/admin/reference/provinces',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/provinces',
    isRootLocked: false,
  }),

  // 10. Divisions
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS,
    labelKey: 'admin:navDivisions',
    defaultLabel: 'Divisions',
    route: '/admin/reference/divisions',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/divisions',
    isRootLocked: false,
  }),

  // 11. Districts
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS,
    labelKey: 'admin:navDistricts',
    defaultLabel: 'Districts',
    route: '/admin/reference/districts',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/districts',
    isRootLocked: false,
  }),

  // 12. Tehsils
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS,
    labelKey: 'admin:navTehsils',
    defaultLabel: 'Tehsils',
    route: '/admin/reference/tehsils',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/tehsils',
    isRootLocked: false,
  }),

  // 13. Cities
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_CITIES,
    labelKey: 'admin:navCities',
    defaultLabel: 'Cities',
    route: '/admin/reference/cities',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/cities',
    isRootLocked: false,
  }),

  // 14. Societies
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_SOCIETIES,
    labelKey: 'admin:navSocieties',
    defaultLabel: 'Societies',
    route: '/admin/reference/societies',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/societies',
    isRootLocked: false,
  }),

  // 15. Areas
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_AREAS,
    labelKey: 'admin:navAreas',
    defaultLabel: 'Areas',
    route: '/admin/reference/areas',
    subroutes: [],
    groupKey: 'reference_location',
    groupLabelKey: 'admin:navLocation',
    apiPrefix: '/admin/reference/location/areas',
    isRootLocked: false,
  }),

  // 16. Property Types
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_TYPES,
    labelKey: 'admin:navPropertyTypes',
    defaultLabel: 'Property Types',
    route: '/admin/reference/property-types',
    subroutes: [],
    groupKey: 'reference_property',
    groupLabelKey: 'admin:navPropertyRef',
    apiPrefix: '/admin/reference/property/property-types',
    isRootLocked: false,
  }),

  // 17. Property Status Types (Approved Real Orphan Page #1)
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_STATUS_TYPES,
    labelKey: 'admin:navPropertyStatusTypes',
    defaultLabel: 'Property Status Types',
    route: '/admin/reference/property-status-types',
    subroutes: [],
    groupKey: 'reference_property',
    groupLabelKey: 'admin:navPropertyRef',
    apiPrefix: '/admin/reference/property/property-status-types',
    isRootLocked: false,
  }),

  // 18. Property Purposes
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_PURPOSES,
    labelKey: 'admin:navPropertyPurposes',
    defaultLabel: 'Property Purposes',
    route: '/admin/reference/property-purposes',
    subroutes: [],
    groupKey: 'reference_property',
    groupLabelKey: 'admin:navPropertyRef',
    apiPrefix: '/admin/reference/property/property-purposes',
    isRootLocked: false,
  }),

  // 19. Property Demand Types
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_DEMAND_TYPES,
    labelKey: 'admin:navPropertyDemandTypes',
    defaultLabel: 'Property Demand Types',
    route: '/admin/reference/property-demand-types',
    subroutes: [],
    groupKey: 'reference_property',
    groupLabelKey: 'admin:navPropertyRef',
    apiPrefix: '/admin/reference/property/property-demand-types',
    isRootLocked: false,
  }),

  // 20. Property Use
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_USE,
    labelKey: 'admin:navPropertyUse',
    defaultLabel: 'Property Use',
    route: '/admin/reference/property-use',
    subroutes: [],
    groupKey: 'reference_property',
    groupLabelKey: 'admin:navPropertyRef',
    apiPrefix: '/admin/reference/property/property-use',
    isRootLocked: false,
  }),

  // 21. Units of Measurement (Approved Real Orphan Page #2)
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_UOM,
    labelKey: 'admin:navUom',
    defaultLabel: 'Units of Measurement',
    route: '/admin/reference/uom',
    subroutes: [],
    groupKey: 'reference_property',
    groupLabelKey: 'admin:navPropertyRef',
    apiPrefix: '/admin/reference/property/uom',
    isRootLocked: false,
  }),

  // 22. Customer Request Status Types
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_CUST_REQ_STATUS_TYPES,
    labelKey: 'admin:navCustomerRequestStatusTypes',
    defaultLabel: 'Customer Request Status Types',
    route: '/admin/reference/customer-request-status-types',
    subroutes: [],
    groupKey: 'reference_requests',
    groupLabelKey: 'admin:navRequestsWorkflow',
    apiPrefix: '/admin/reference/requests/customer-request-status-types',
    isRootLocked: false,
  }),

  // 23. Approval Stages
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_APPROVAL_STAGES,
    labelKey: 'admin:navApprovalStages',
    defaultLabel: 'Approval Stages',
    route: '/admin/reference/approval-stages',
    subroutes: [],
    groupKey: 'reference_requests',
    groupLabelKey: 'admin:navRequestsWorkflow',
    apiPrefix: '/admin/reference/requests/approval-stages',
    isRootLocked: false,
  }),

  // 24. PPC Service Types
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICE_TYPES,
    labelKey: 'admin:navPpcServiceTypes',
    defaultLabel: 'PPC Service Types',
    route: '/admin/reference/ppc-service-types',
    subroutes: [],
    groupKey: 'reference_services',
    groupLabelKey: 'admin:navServicesRef',
    apiPrefix: '/admin/reference/services/ppc-service-types',
    isRootLocked: false,
  }),

  // 25. PPC Services
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICES,
    labelKey: 'admin:navPpcServices',
    defaultLabel: 'PPC Services',
    route: '/admin/reference/ppc-services',
    subroutes: [],
    groupKey: 'reference_services',
    groupLabelKey: 'admin:navServicesRef',
    apiPrefix: '/admin/reference/services/ppc-services',
    isRootLocked: false,
  }),

  // 26. User Types
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_USER_TYPES,
    labelKey: 'admin:navUserTypes',
    defaultLabel: 'User Types',
    route: '/admin/reference/user-types',
    subroutes: [],
    groupKey: 'reference_access',
    groupLabelKey: 'admin:navEmployeeAccess',
    apiPrefix: '/admin/reference/access/user-types',
    isRootLocked: false,
  }),

  // 27. Roles Master
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_ROLES_MASTER,
    labelKey: 'admin:navRoles',
    defaultLabel: 'Roles Master',
    route: '/admin/reference/roles',
    subroutes: [],
    groupKey: 'reference_access',
    groupLabelKey: 'admin:navEmployeeAccess',
    apiPrefix: '/admin/reference/access/roles',
    isRootLocked: false,
  }),

  // 28. Designations
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_DESIGNATIONS,
    labelKey: 'admin:navDesignations',
    defaultLabel: 'Designations',
    route: '/admin/reference/designations',
    subroutes: [],
    groupKey: 'reference_access',
    groupLabelKey: 'admin:navEmployeeAccess',
    apiPrefix: '/admin/reference/access/designations',
    isRootLocked: false,
  }),

  // 29. Currencies
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_REF_CURRENCIES,
    labelKey: 'admin:navCurrencies',
    defaultLabel: 'Currencies',
    route: '/admin/reference/currencies',
    subroutes: [],
    groupKey: 'reference_finance',
    groupLabelKey: 'admin:navFinanceRef',
    apiPrefix: '/admin/reference/finance/currencies',
    isRootLocked: false,
  }),

  // 30. Customers (Subroutes explicitly include customerId detail route)
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_CUSTOMERS,
    labelKey: 'admin:customers',
    defaultLabel: 'Customers',
    route: '/admin/customers',
    subroutes: ['/admin/customers/:customerId'],
    groupKey: 'operations',
    groupLabelKey: 'admin:navOperations',
    apiPrefix: '/admin/customers',
    isRootLocked: false,
  }),

  // 31. Properties
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_PROPERTIES,
    labelKey: 'admin:propertiesModule',
    defaultLabel: 'Properties',
    route: '/admin/properties',
    subroutes: [],
    groupKey: 'operations',
    groupLabelKey: 'admin:navOperations',
    apiPrefix: '/admin/properties',
    isRootLocked: false,
  }),

  // 32. Requests
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_REQUESTS,
    labelKey: 'admin:requestsModule',
    defaultLabel: 'Customer Requests',
    route: '/admin/requests',
    subroutes: [],
    groupKey: 'operations',
    groupLabelKey: 'admin:navOperations',
    apiPrefix: '/admin/requests',
    isRootLocked: false,
  }),

  // 33. Property Visits
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_PROPERTY_VISITS,
    labelKey: 'admin:visitsModule',
    defaultLabel: 'Property Visits',
    route: '/admin/property-visits',
    subroutes: [],
    groupKey: 'operations',
    groupLabelKey: 'admin:navOperations',
    apiPrefix: '/admin/property-visits',
    isRootLocked: false,
  }),

  // 34. Inspection Reports
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_INSPECTIONS,
    labelKey: 'common:inspectionReports',
    defaultLabel: 'Inspection Reports',
    route: '/admin/inspection-reports',
    subroutes: [],
    groupKey: 'operations',
    groupLabelKey: 'admin:navOperations',
    apiPrefix: '/admin/inspections',
    isRootLocked: false,
  }),

  // 35. Verification Reports
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_VERIFICATIONS,
    labelKey: 'common:verificationReports',
    defaultLabel: 'Verification Reports',
    route: '/admin/verification-reports',
    subroutes: [],
    groupKey: 'operations',
    groupLabelKey: 'admin:navOperations',
    apiPrefix: '/admin/verifications',
    isRootLocked: false,
  }),

  // 36. Property Registry
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_REGISTRY,
    labelKey: 'admin:propertyRegistry',
    defaultLabel: 'Property Registry',
    route: '/admin/property-registry',
    subroutes: [],
    groupKey: 'pending',
    groupLabelKey: 'admin:navPending',
    apiPrefix: '/admin/property-registry',
    isRootLocked: false,
  }),

  // 37. Payment Summary
  Object.freeze({
    key: ADMIN_PAGE_KEYS.PAGE_ADMIN_PAYMENTS,
    labelKey: 'common:paymentSummary',
    defaultLabel: 'Payment Summary',
    route: '/admin/payment-summary',
    subroutes: [],
    groupKey: 'pending',
    groupLabelKey: 'admin:navPending',
    apiPrefix: '/admin/payments',
    isRootLocked: false,
  }),
]);

/**
 * EXPLICIT SUPPORT-READ ALLOW-MAP FOUNDATION
 * Directional: Child page key -> Array of ancestor/reference page keys whose
 * read-only (GET) endpoints are required to populate UI dropdowns/filters.
 *
 * CRITICAL SECURITY RULE:
 * This map NEVER grants mutating rights (POST, PUT, PATCH, DELETE).
 * Actual enforcement is handled in T3.4.
 */
const SUPPORT_READ_MAP = Object.freeze({
  [ADMIN_PAGE_KEYS.PAGE_ADMIN_USERS]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_ADMIN_ROLES,
    ADMIN_PAGE_KEYS.PAGE_REF_USER_TYPES,
  ]),
  [ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
  ]),
  [ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
    ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES,
  ]),
  [ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
    ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES,
    ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS,
  ]),
  [ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
    ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES,
    ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS,
    ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS,
  ]),
  [ADMIN_PAGE_KEYS.PAGE_REF_CITIES]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
    ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES,
    ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS,
    ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS,
    ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS,
  ]),
  [ADMIN_PAGE_KEYS.PAGE_REF_SOCIETIES]: Object.freeze([
    ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES,
    ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES,
    ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS,
    ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS,
    ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS,
    ADMIN_PAGE_KEYS.PAGE_REF_CITIES,
  ]),
});

// Fast lookup map by key
const ADMIN_PAGE_REGISTRY_MAP = Object.freeze(
  ADMIN_PAGE_REGISTRY.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {})
);

/**
 * Lightweight Registry Validation
 * Runs once at startup/import to ensure absolute configuration integrity.
 */
function validateAdminPageRegistry() {
  const errors = [];
  const validKeys = new Set(Object.values(ADMIN_PAGE_KEYS));

  // 1. Count check
  if (ADMIN_PAGE_REGISTRY.length !== 37) {
    errors.push(`Expected exactly 37 pages in ADMIN_PAGE_REGISTRY, found ${ADMIN_PAGE_REGISTRY.length}`);
  }

  // 2. Uniqueness checks
  const seenKeys = new Set();
  const seenRoutes = new Set();
  for (const page of ADMIN_PAGE_REGISTRY) {
    if (!page.key) {
      errors.push('Found page entry with missing or empty key');
      continue;
    }
    if (seenKeys.has(page.key)) {
      errors.push(`Duplicate page key found in registry: ${page.key}`);
    }
    seenKeys.add(page.key);

    if (seenRoutes.has(page.route)) {
      errors.push(`Duplicate route found in registry: ${page.route}`);
    }
    seenRoutes.add(page.route);

    if (!validKeys.has(page.key)) {
      errors.push(`Page key ${page.key} not defined in ADMIN_PAGE_KEYS`);
    }
  }

  // 3. Confirm orphan keys exist
  if (!seenKeys.has(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_STATUS_TYPES)) {
    errors.push('Required approved orphan key PAGE_REF_PROPERTY_STATUS_TYPES missing from registry');
  }
  if (!seenKeys.has(ADMIN_PAGE_KEYS.PAGE_REF_UOM)) {
    errors.push('Required approved orphan key PAGE_REF_UOM missing from registry');
  }

  // 4. Confirm customer detail is NOT a separate key
  if (seenKeys.has('PAGE_CUSTOMER_DETAIL') || seenKeys.has('PAGE_ADMIN_CUSTOMER_DETAILS')) {
    errors.push('Customer detail route must inherit PAGE_ADMIN_CUSTOMERS and NOT have a separate page key');
  }

  // 5. Support-read validation
  for (const [sourceKey, targetKeys] of Object.entries(SUPPORT_READ_MAP)) {
    if (!seenKeys.has(sourceKey)) {
      errors.push(`Support-read source key ${sourceKey} is not a valid canonical page key`);
    }
    const seenTargets = new Set();
    for (const targetKey of targetKeys) {
      if (!seenKeys.has(targetKey)) {
        errors.push(`Support-read target key ${targetKey} for source ${sourceKey} is not a valid canonical page key`);
      }
      if (sourceKey === targetKey) {
        errors.push(`Page key ${sourceKey} lists itself as a support-read dependency`);
      }
      if (seenTargets.has(targetKey)) {
        errors.push(`Duplicate support-read target ${targetKey} in source ${sourceKey}`);
      }
      seenTargets.add(targetKey);
    }
  }

  if (errors.length > 0) {
    throw new Error(`AdminPageRegistry Validation Failed:\n- ${errors.join('\n- ')}`);
  }

  return true;
}

// Run validation immediately on load
validateAdminPageRegistry();

/**
 * Check if a page key exists in the canonical registry.
 * @param {string} pageKey
 * @returns {boolean}
 */
const isValidPageKey = (pageKey) => {
  return typeof pageKey === 'string' && Boolean(ADMIN_PAGE_REGISTRY_MAP[pageKey]);
};

/**
 * Get configuration object for a canonical page key.
 * @param {string} pageKey
 * @returns {object|null}
 */
const getPageConfig = (pageKey) => {
  return ADMIN_PAGE_REGISTRY_MAP[pageKey] || null;
};

/**
 * Get explicit support-read dependencies for a child page.
 * @param {string} sourcePageKey
 * @returns {ReadonlyArray<string>}
 */
const getSupportReadDependencies = (sourcePageKey) => {
  return SUPPORT_READ_MAP[sourcePageKey] || Object.freeze([]);
};

/**
 * Inverted mapping: Target ancestor page -> Array of dependent child pages
 * whose UI depends on reading this target.
 */
const DEPENDENTS_NEEDING_SUPPORT_READ = Object.freeze(
  Object.values(ADMIN_PAGE_KEYS).reduce((acc, targetKey) => {
    const dependents = Object.entries(SUPPORT_READ_MAP)
      .filter(([_, targets]) => targets.includes(targetKey))
      .map(([sourceKey]) => sourceKey);
    acc[targetKey] = Object.freeze(dependents);
    return acc;
  }, {})
);

/**
 * Get child pages that declare this target page as a support-read dependency.
 * @param {string} targetPageKey
 * @returns {ReadonlyArray<string>}
 */
const getPagesNeedingSupportRead = (targetPageKey) => {
  return DEPENDENTS_NEEDING_SUPPORT_READ[targetPageKey] || Object.freeze([]);
};

module.exports = {
  ADMIN_PAGE_KEYS,
  ADMIN_PAGE_REGISTRY,
  ADMIN_PAGE_REGISTRY_MAP,
  SUPPORT_READ_MAP,
  DEPENDENTS_NEEDING_SUPPORT_READ,
  validateAdminPageRegistry,
  isValidPageKey,
  getPageConfig,
  getSupportReadDependencies,
  getPagesNeedingSupportRead,
};
