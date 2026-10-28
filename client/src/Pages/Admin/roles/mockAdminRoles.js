/**
 * Mock & Initial Reference Data for Admin Role Management
 * Sourced directly from PostgreSQL schema and Canonical Admin Page Registry (37 pages).
 */

export const INITIAL_ROLES = [
  {
    "role_id": "3",
    "role_english": "Admin",
    "role_urdu": "منتظم",
    "role_abb": null,
    "is_active": true
  },
  {
    "role_id": "1",
    "role_english": "Management",
    "role_urdu": "انتظامیہ",
    "role_abb": null,
    "is_active": true
  },
  {
    "role_id": "2",
    "role_english": "Inspector",
    "role_urdu": "انسپکٹر",
    "role_abb": null,
    "is_active": true
  }
];

export const INITIAL_ROLE_MATRICES = {
  "1": {
    "role_id": "1",
    "role_english": "Management",
    "is_admin_root": false,
    "is_editable": true,
    "permissions": [
      {
        "page_key": "PAGE_ADMIN_DASHBOARD",
        "can_access": true,
        "default_label": "Dashboard",
        "label_key": "admin:dashboardTitle",
        "group_key": "dashboard",
        "group_label_key": "admin:dashboardTitle",
        "route": "/admin/dashboard",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_USERS",
        "can_access": false,
        "default_label": "User Management",
        "label_key": "admin:navUserManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/users",
        "is_root_locked": true
      },
      {
        "page_key": "PAGE_ADMIN_ROLES",
        "can_access": false,
        "default_label": "Role Management",
        "label_key": "admin:navRoleManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/roles",
        "is_root_locked": true
      },
      {
        "page_key": "PAGE_ADMIN_EMPLOYEES",
        "can_access": false,
        "default_label": "Employee Management",
        "label_key": "admin:navEmployeeManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/employees",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_SERVICE_PROVIDERS",
        "can_access": false,
        "default_label": "Service Provider Management",
        "label_key": "admin:navServiceProviderManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/service-providers",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_SYSTEM_CONFIG",
        "can_access": false,
        "default_label": "System Configuration",
        "label_key": "admin:navSystemConfiguration",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/system-configuration",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_API_LOGS",
        "can_access": false,
        "default_label": "API Logs",
        "label_key": "admin:navApiLogs",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/api-logs",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_COUNTRIES",
        "can_access": true,
        "default_label": "Countries",
        "label_key": "admin:navCountries",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/countries",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROVINCES",
        "can_access": true,
        "default_label": "Provinces",
        "label_key": "admin:navProvinces",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/provinces",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DIVISIONS",
        "can_access": true,
        "default_label": "Divisions",
        "label_key": "admin:navDivisions",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/divisions",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DISTRICTS",
        "can_access": true,
        "default_label": "Districts",
        "label_key": "admin:navDistricts",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/districts",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_TEHSILS",
        "can_access": true,
        "default_label": "Tehsils",
        "label_key": "admin:navTehsils",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/tehsils",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CITIES",
        "can_access": true,
        "default_label": "Cities",
        "label_key": "admin:navCities",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/cities",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_SOCIETIES",
        "can_access": true,
        "default_label": "Societies",
        "label_key": "admin:navSocieties",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/societies",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_AREAS",
        "can_access": true,
        "default_label": "Areas",
        "label_key": "admin:navAreas",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/areas",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_TYPES",
        "can_access": true,
        "default_label": "Property Types",
        "label_key": "admin:navPropertyTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_STATUS_TYPES",
        "can_access": true,
        "default_label": "Property Status Types",
        "label_key": "admin:navPropertyStatusTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-status-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_PURPOSES",
        "can_access": true,
        "default_label": "Property Purposes",
        "label_key": "admin:navPropertyPurposes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-purposes",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_DEMAND_TYPES",
        "can_access": true,
        "default_label": "Property Demand Types",
        "label_key": "admin:navPropertyDemandTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-demand-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_USE",
        "can_access": true,
        "default_label": "Property Use",
        "label_key": "admin:navPropertyUse",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-use",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_UOM",
        "can_access": true,
        "default_label": "Units of Measurement",
        "label_key": "admin:navUom",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/uom",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CUST_REQ_STATUS_TYPES",
        "can_access": false,
        "default_label": "Customer Request Status Types",
        "label_key": "admin:navCustomerRequestStatusTypes",
        "group_key": "reference_requests",
        "group_label_key": "admin:navRequestsWorkflow",
        "route": "/admin/reference/customer-request-status-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_APPROVAL_STAGES",
        "can_access": false,
        "default_label": "Approval Stages",
        "label_key": "admin:navApprovalStages",
        "group_key": "reference_requests",
        "group_label_key": "admin:navRequestsWorkflow",
        "route": "/admin/reference/approval-stages",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PPC_SERVICE_TYPES",
        "can_access": false,
        "default_label": "PPC Service Types",
        "label_key": "admin:navPpcServiceTypes",
        "group_key": "reference_services",
        "group_label_key": "admin:navServicesRef",
        "route": "/admin/reference/ppc-service-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PPC_SERVICES",
        "can_access": false,
        "default_label": "PPC Services",
        "label_key": "admin:navPpcServices",
        "group_key": "reference_services",
        "group_label_key": "admin:navServicesRef",
        "route": "/admin/reference/ppc-services",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_USER_TYPES",
        "can_access": false,
        "default_label": "User Types",
        "label_key": "admin:navUserTypes",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/user-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_ROLES_MASTER",
        "can_access": false,
        "default_label": "Roles Master",
        "label_key": "admin:navRoles",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/roles",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DESIGNATIONS",
        "can_access": false,
        "default_label": "Designations",
        "label_key": "admin:navDesignations",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/designations",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CURRENCIES",
        "can_access": false,
        "default_label": "Currencies",
        "label_key": "admin:navCurrencies",
        "group_key": "reference_finance",
        "group_label_key": "admin:navFinanceRef",
        "route": "/admin/reference/currencies",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_CUSTOMERS",
        "can_access": true,
        "default_label": "Customers",
        "label_key": "admin:customers",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/customers",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PROPERTIES",
        "can_access": true,
        "default_label": "Properties",
        "label_key": "admin:propertiesModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/properties",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_REQUESTS",
        "can_access": true,
        "default_label": "Customer Requests",
        "label_key": "admin:requestsModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/requests",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PROPERTY_VISITS",
        "can_access": true,
        "default_label": "Property Visits",
        "label_key": "admin:visitsModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/property-visits",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_INSPECTIONS",
        "can_access": true,
        "default_label": "Inspection Reports",
        "label_key": "common:inspectionReports",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/inspection-reports",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_VERIFICATIONS",
        "can_access": true,
        "default_label": "Verification Reports",
        "label_key": "common:verificationReports",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/verification-reports",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_REGISTRY",
        "can_access": false,
        "default_label": "Property Registry",
        "label_key": "admin:propertyRegistry",
        "group_key": "pending",
        "group_label_key": "admin:navPending",
        "route": "/admin/property-registry",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PAYMENTS",
        "can_access": false,
        "default_label": "Payment Summary",
        "label_key": "common:paymentSummary",
        "group_key": "pending",
        "group_label_key": "admin:navPending",
        "route": "/admin/payment-summary",
        "is_root_locked": false
      }
    ]
  },
  "2": {
    "role_id": "2",
    "role_english": "Inspector",
    "is_admin_root": false,
    "is_editable": true,
    "permissions": [
      {
        "page_key": "PAGE_ADMIN_DASHBOARD",
        "can_access": true,
        "default_label": "Dashboard",
        "label_key": "admin:dashboardTitle",
        "group_key": "dashboard",
        "group_label_key": "admin:dashboardTitle",
        "route": "/admin/dashboard",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_USERS",
        "can_access": false,
        "default_label": "User Management",
        "label_key": "admin:navUserManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/users",
        "is_root_locked": true
      },
      {
        "page_key": "PAGE_ADMIN_ROLES",
        "can_access": false,
        "default_label": "Role Management",
        "label_key": "admin:navRoleManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/roles",
        "is_root_locked": true
      },
      {
        "page_key": "PAGE_ADMIN_EMPLOYEES",
        "can_access": false,
        "default_label": "Employee Management",
        "label_key": "admin:navEmployeeManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/employees",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_SERVICE_PROVIDERS",
        "can_access": false,
        "default_label": "Service Provider Management",
        "label_key": "admin:navServiceProviderManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/service-providers",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_SYSTEM_CONFIG",
        "can_access": false,
        "default_label": "System Configuration",
        "label_key": "admin:navSystemConfiguration",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/system-configuration",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_API_LOGS",
        "can_access": false,
        "default_label": "API Logs",
        "label_key": "admin:navApiLogs",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/api-logs",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_COUNTRIES",
        "can_access": false,
        "default_label": "Countries",
        "label_key": "admin:navCountries",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/countries",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROVINCES",
        "can_access": false,
        "default_label": "Provinces",
        "label_key": "admin:navProvinces",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/provinces",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DIVISIONS",
        "can_access": false,
        "default_label": "Divisions",
        "label_key": "admin:navDivisions",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/divisions",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DISTRICTS",
        "can_access": false,
        "default_label": "Districts",
        "label_key": "admin:navDistricts",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/districts",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_TEHSILS",
        "can_access": false,
        "default_label": "Tehsils",
        "label_key": "admin:navTehsils",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/tehsils",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CITIES",
        "can_access": false,
        "default_label": "Cities",
        "label_key": "admin:navCities",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/cities",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_SOCIETIES",
        "can_access": false,
        "default_label": "Societies",
        "label_key": "admin:navSocieties",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/societies",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_AREAS",
        "can_access": false,
        "default_label": "Areas",
        "label_key": "admin:navAreas",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/areas",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_TYPES",
        "can_access": false,
        "default_label": "Property Types",
        "label_key": "admin:navPropertyTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_STATUS_TYPES",
        "can_access": false,
        "default_label": "Property Status Types",
        "label_key": "admin:navPropertyStatusTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-status-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_PURPOSES",
        "can_access": false,
        "default_label": "Property Purposes",
        "label_key": "admin:navPropertyPurposes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-purposes",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_DEMAND_TYPES",
        "can_access": false,
        "default_label": "Property Demand Types",
        "label_key": "admin:navPropertyDemandTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-demand-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_USE",
        "can_access": false,
        "default_label": "Property Use",
        "label_key": "admin:navPropertyUse",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-use",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_UOM",
        "can_access": false,
        "default_label": "Units of Measurement",
        "label_key": "admin:navUom",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/uom",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CUST_REQ_STATUS_TYPES",
        "can_access": false,
        "default_label": "Customer Request Status Types",
        "label_key": "admin:navCustomerRequestStatusTypes",
        "group_key": "reference_requests",
        "group_label_key": "admin:navRequestsWorkflow",
        "route": "/admin/reference/customer-request-status-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_APPROVAL_STAGES",
        "can_access": false,
        "default_label": "Approval Stages",
        "label_key": "admin:navApprovalStages",
        "group_key": "reference_requests",
        "group_label_key": "admin:navRequestsWorkflow",
        "route": "/admin/reference/approval-stages",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PPC_SERVICE_TYPES",
        "can_access": false,
        "default_label": "PPC Service Types",
        "label_key": "admin:navPpcServiceTypes",
        "group_key": "reference_services",
        "group_label_key": "admin:navServicesRef",
        "route": "/admin/reference/ppc-service-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PPC_SERVICES",
        "can_access": false,
        "default_label": "PPC Services",
        "label_key": "admin:navPpcServices",
        "group_key": "reference_services",
        "group_label_key": "admin:navServicesRef",
        "route": "/admin/reference/ppc-services",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_USER_TYPES",
        "can_access": false,
        "default_label": "User Types",
        "label_key": "admin:navUserTypes",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/user-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_ROLES_MASTER",
        "can_access": false,
        "default_label": "Roles Master",
        "label_key": "admin:navRoles",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/roles",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DESIGNATIONS",
        "can_access": false,
        "default_label": "Designations",
        "label_key": "admin:navDesignations",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/designations",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CURRENCIES",
        "can_access": false,
        "default_label": "Currencies",
        "label_key": "admin:navCurrencies",
        "group_key": "reference_finance",
        "group_label_key": "admin:navFinanceRef",
        "route": "/admin/reference/currencies",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_CUSTOMERS",
        "can_access": false,
        "default_label": "Customers",
        "label_key": "admin:customers",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/customers",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PROPERTIES",
        "can_access": true,
        "default_label": "Properties",
        "label_key": "admin:propertiesModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/properties",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_REQUESTS",
        "can_access": false,
        "default_label": "Customer Requests",
        "label_key": "admin:requestsModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/requests",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PROPERTY_VISITS",
        "can_access": true,
        "default_label": "Property Visits",
        "label_key": "admin:visitsModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/property-visits",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_INSPECTIONS",
        "can_access": true,
        "default_label": "Inspection Reports",
        "label_key": "common:inspectionReports",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/inspection-reports",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_VERIFICATIONS",
        "can_access": false,
        "default_label": "Verification Reports",
        "label_key": "common:verificationReports",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/verification-reports",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_REGISTRY",
        "can_access": false,
        "default_label": "Property Registry",
        "label_key": "admin:propertyRegistry",
        "group_key": "pending",
        "group_label_key": "admin:navPending",
        "route": "/admin/property-registry",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PAYMENTS",
        "can_access": false,
        "default_label": "Payment Summary",
        "label_key": "common:paymentSummary",
        "group_key": "pending",
        "group_label_key": "admin:navPending",
        "route": "/admin/payment-summary",
        "is_root_locked": false
      }
    ]
  },
  "3": {
    "role_id": "3",
    "role_english": "Admin",
    "is_admin_root": true,
    "is_editable": false,
    "permissions": [
      {
        "page_key": "PAGE_ADMIN_DASHBOARD",
        "can_access": true,
        "default_label": "Dashboard",
        "label_key": "admin:dashboardTitle",
        "group_key": "dashboard",
        "group_label_key": "admin:dashboardTitle",
        "route": "/admin/dashboard",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_USERS",
        "can_access": true,
        "default_label": "User Management",
        "label_key": "admin:navUserManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/users",
        "is_root_locked": true
      },
      {
        "page_key": "PAGE_ADMIN_ROLES",
        "can_access": true,
        "default_label": "Role Management",
        "label_key": "admin:navRoleManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/roles",
        "is_root_locked": true
      },
      {
        "page_key": "PAGE_ADMIN_EMPLOYEES",
        "can_access": true,
        "default_label": "Employee Management",
        "label_key": "admin:navEmployeeManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/employees",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_SERVICE_PROVIDERS",
        "can_access": true,
        "default_label": "Service Provider Management",
        "label_key": "admin:navServiceProviderManagement",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/service-providers",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_SYSTEM_CONFIG",
        "can_access": true,
        "default_label": "System Configuration",
        "label_key": "admin:navSystemConfiguration",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/system-configuration",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_API_LOGS",
        "can_access": true,
        "default_label": "API Logs",
        "label_key": "admin:navApiLogs",
        "group_key": "administration",
        "group_label_key": "admin:navAdministration",
        "route": "/admin/api-logs",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_COUNTRIES",
        "can_access": true,
        "default_label": "Countries",
        "label_key": "admin:navCountries",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/countries",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROVINCES",
        "can_access": true,
        "default_label": "Provinces",
        "label_key": "admin:navProvinces",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/provinces",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DIVISIONS",
        "can_access": true,
        "default_label": "Divisions",
        "label_key": "admin:navDivisions",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/divisions",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DISTRICTS",
        "can_access": true,
        "default_label": "Districts",
        "label_key": "admin:navDistricts",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/districts",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_TEHSILS",
        "can_access": true,
        "default_label": "Tehsils",
        "label_key": "admin:navTehsils",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/tehsils",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CITIES",
        "can_access": true,
        "default_label": "Cities",
        "label_key": "admin:navCities",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/cities",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_SOCIETIES",
        "can_access": true,
        "default_label": "Societies",
        "label_key": "admin:navSocieties",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/societies",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_AREAS",
        "can_access": true,
        "default_label": "Areas",
        "label_key": "admin:navAreas",
        "group_key": "reference_location",
        "group_label_key": "admin:navLocation",
        "route": "/admin/reference/areas",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_TYPES",
        "can_access": true,
        "default_label": "Property Types",
        "label_key": "admin:navPropertyTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_STATUS_TYPES",
        "can_access": true,
        "default_label": "Property Status Types",
        "label_key": "admin:navPropertyStatusTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-status-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_PURPOSES",
        "can_access": true,
        "default_label": "Property Purposes",
        "label_key": "admin:navPropertyPurposes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-purposes",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_DEMAND_TYPES",
        "can_access": true,
        "default_label": "Property Demand Types",
        "label_key": "admin:navPropertyDemandTypes",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-demand-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PROPERTY_USE",
        "can_access": true,
        "default_label": "Property Use",
        "label_key": "admin:navPropertyUse",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/property-use",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_UOM",
        "can_access": true,
        "default_label": "Units of Measurement",
        "label_key": "admin:navUom",
        "group_key": "reference_property",
        "group_label_key": "admin:navPropertyRef",
        "route": "/admin/reference/uom",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CUST_REQ_STATUS_TYPES",
        "can_access": true,
        "default_label": "Customer Request Status Types",
        "label_key": "admin:navCustomerRequestStatusTypes",
        "group_key": "reference_requests",
        "group_label_key": "admin:navRequestsWorkflow",
        "route": "/admin/reference/customer-request-status-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_APPROVAL_STAGES",
        "can_access": true,
        "default_label": "Approval Stages",
        "label_key": "admin:navApprovalStages",
        "group_key": "reference_requests",
        "group_label_key": "admin:navRequestsWorkflow",
        "route": "/admin/reference/approval-stages",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PPC_SERVICE_TYPES",
        "can_access": true,
        "default_label": "PPC Service Types",
        "label_key": "admin:navPpcServiceTypes",
        "group_key": "reference_services",
        "group_label_key": "admin:navServicesRef",
        "route": "/admin/reference/ppc-service-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_PPC_SERVICES",
        "can_access": true,
        "default_label": "PPC Services",
        "label_key": "admin:navPpcServices",
        "group_key": "reference_services",
        "group_label_key": "admin:navServicesRef",
        "route": "/admin/reference/ppc-services",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_USER_TYPES",
        "can_access": true,
        "default_label": "User Types",
        "label_key": "admin:navUserTypes",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/user-types",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_ROLES_MASTER",
        "can_access": true,
        "default_label": "Roles Master",
        "label_key": "admin:navRoles",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/roles",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_DESIGNATIONS",
        "can_access": true,
        "default_label": "Designations",
        "label_key": "admin:navDesignations",
        "group_key": "reference_access",
        "group_label_key": "admin:navEmployeeAccess",
        "route": "/admin/reference/designations",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_REF_CURRENCIES",
        "can_access": true,
        "default_label": "Currencies",
        "label_key": "admin:navCurrencies",
        "group_key": "reference_finance",
        "group_label_key": "admin:navFinanceRef",
        "route": "/admin/reference/currencies",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_CUSTOMERS",
        "can_access": true,
        "default_label": "Customers",
        "label_key": "admin:customers",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/customers",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PROPERTIES",
        "can_access": true,
        "default_label": "Properties",
        "label_key": "admin:propertiesModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/properties",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_REQUESTS",
        "can_access": true,
        "default_label": "Customer Requests",
        "label_key": "admin:requestsModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/requests",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PROPERTY_VISITS",
        "can_access": true,
        "default_label": "Property Visits",
        "label_key": "admin:visitsModule",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/property-visits",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_INSPECTIONS",
        "can_access": true,
        "default_label": "Inspection Reports",
        "label_key": "common:inspectionReports",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/inspection-reports",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_VERIFICATIONS",
        "can_access": true,
        "default_label": "Verification Reports",
        "label_key": "common:verificationReports",
        "group_key": "operations",
        "group_label_key": "admin:navOperations",
        "route": "/admin/verification-reports",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_REGISTRY",
        "can_access": true,
        "default_label": "Property Registry",
        "label_key": "admin:propertyRegistry",
        "group_key": "pending",
        "group_label_key": "admin:navPending",
        "route": "/admin/property-registry",
        "is_root_locked": false
      },
      {
        "page_key": "PAGE_ADMIN_PAYMENTS",
        "can_access": true,
        "default_label": "Payment Summary",
        "label_key": "common:paymentSummary",
        "group_key": "pending",
        "group_label_key": "admin:navPending",
        "route": "/admin/payment-summary",
        "is_root_locked": false
      }
    ]
  }
};

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
