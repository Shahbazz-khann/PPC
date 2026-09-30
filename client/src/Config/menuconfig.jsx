import { LayoutDashboard, User, Users, Briefcase, Home, FileText, Calendar, ClipboardCheck, ShieldCheck, Settings, Inbox, CreditCard, FolderArchive, Database, Shield, MapPin, Activity, List, Code, CheckSquare, Coins, Layers, Flag, Map, Circle, Globe, MapIcon, Building, ClipboardList } from 'lucide-react';

export const customerMenu = [
  { key: 'dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
  { key: 'myProperties', path: '/customer/properties', icon: Home },
  { key: 'myRequests', path: '/customer/requests', icon: FileText },
  { key: 'propertyVisits', path: '/customer/visits', icon: Calendar },
  { key: 'inspectionReports', path: '/customer/inspection-reports', icon: ClipboardCheck },
  { key: 'verificationReports', path: '/customer/verification-reports', icon: ShieldCheck },
  { key: 'inbox', path: '/customer/inbox', icon: Inbox },
  { key: 'paymentSummary', path: '/customer/payments', icon: CreditCard },
];

export const adminMenu = [
  { key: 'dashboardTitle', namespace: 'admin', path: '/admin/dashboard', icon: LayoutDashboard },
  
  {
    key: 'navAdministration', namespace: 'admin', icon: Shield, children: [
      { key: 'navUserManagement', namespace: 'admin', path: '/admin/users' },
      { key: 'navRoleManagement', namespace: 'admin', path: '/admin/roles' },
      { key: 'navEmployeeManagement', namespace: 'admin', path: '/admin/employees' },
      { key: 'navServiceProviderManagement', namespace: 'admin', path: '/admin/service-providers' },
      { key: 'navSystemConfiguration', namespace: 'admin', path: '/admin/system-configuration' },
      { key: 'navApiLogs', namespace: 'admin', path: '/admin/api-logs' },
    ]
  },

  {
    key: 'navReferenceTables', namespace: 'admin', icon: Database, children: [
      {
        key: 'navLocation', namespace: 'admin', icon: MapPin, children: [
          { key: 'navCountries', namespace: 'admin', path: '/admin/reference/countries' },
          { key: 'navProvinces', namespace: 'admin', path: '/admin/reference/provinces' },
          { key: 'navDivisions', namespace: 'admin', path: '/admin/reference/divisions' },
          { key: 'navDistricts', namespace: 'admin', path: '/admin/reference/districts' },
          { key: 'navTehsils', namespace: 'admin', path: '/admin/reference/tehsils' },
          { key: 'navCities', namespace: 'admin', path: '/admin/reference/cities' },
          { key: 'navSocieties', namespace: 'admin', path: '/admin/reference/societies' },
          { key: 'navAreas', namespace: 'admin', path: '/admin/reference/areas' },
        ]
      },
      {
        key: 'navPropertyRef', namespace: 'admin', icon: Home, children: [
          { key: 'navPropertyTypes', namespace: 'admin', path: '/admin/reference/property-types' },
          { key: 'navPropertyStatusTypes', namespace: 'admin', path: '/admin/reference/property-status-types' },
          { key: 'navPropertyPurposes', namespace: 'admin', path: '/admin/reference/property-purposes' },
          { key: 'navPropertyDemandTypes', namespace: 'admin', path: '/admin/reference/property-demand-types' },
          { key: 'navPropertyUse', namespace: 'admin', path: '/admin/reference/property-use' },
          { key: 'navUom', namespace: 'admin', path: '/admin/reference/uom' },
        ]
      },
      {
        key: 'navRequestsWorkflow', namespace: 'admin', icon: ClipboardList, children: [
          { key: 'navCustomerRequestStatusTypes', namespace: 'admin', path: '/admin/reference/customer-request-status-types' },
          { key: 'navApprovalStages', namespace: 'admin', path: '/admin/reference/approval-stages' },
        ]
      },
      {
        key: 'navServicesRef', namespace: 'admin', icon: Settings, children: [
          { key: 'navPpcServiceTypes', namespace: 'admin', path: '/admin/reference/ppc-service-types' },
          { key: 'navPpcServices', namespace: 'admin', path: '/admin/reference/ppc-services' },
        ]
      },
      {
        key: 'navEmployeeAccess', namespace: 'admin', icon: Users, children: [
          { key: 'navUserTypes', namespace: 'admin', path: '/admin/reference/user-types' },
          { key: 'navRoles', namespace: 'admin', path: '/admin/reference/roles' },
          { key: 'navDesignations', namespace: 'admin', path: '/admin/reference/designations' },
        ]
      },
      {
        key: 'navFinanceRef', namespace: 'admin', icon: Coins, children: [
          { key: 'navCurrencies', namespace: 'admin', path: '/admin/reference/currencies' },
        ]
      }
    ]
  },

  {
    key: 'navOperations', namespace: 'admin', icon: Activity, children: [
      { key: 'customers', namespace: 'admin', path: '/admin/customers' },
      { key: 'propertiesModule', namespace: 'admin', path: '/admin/properties' },
      { key: 'requestsModule', namespace: 'admin', path: '/admin/requests' },
      { key: 'visitsModule', namespace: 'admin', path: '/admin/property-visits' },
      { key: 'inspectionReports', namespace: 'common', path: '/admin/inspection-reports' },
      { key: 'verificationReports', namespace: 'common', path: '/admin/verification-reports' },
    ]
  },

  {
    key: 'navPending', namespace: 'admin', icon: FolderArchive, children: [
      { key: 'propertyRegistry', namespace: 'admin', path: '/admin/property-registry' },
      { key: 'paymentSummary', namespace: 'common', path: '/admin/payment-summary' },
    ]
  }
];