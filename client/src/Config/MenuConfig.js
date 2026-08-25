/**
 * Menu Configuration for Sidebar Navigation
 * Single source of truth for role-based navigation.
 * 
 * Ready for Role-Based Access Control (RBAC).
 */

import {
  Home,
  Building2,
  Briefcase,
  ClipboardCheck,
  FileText,
  CreditCard,
  FileCheck,
  Hammer,
  History,
  Receipt,
  Headset,
  Award,
  Settings,
  LogOut,
  Users,
  Wrench,
  Calendar,
  BarChart3,
  FolderKanban,
  MessageSquare,
  User,
  LayoutDashboard,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

// Supported Application Roles
export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  OWNER: 'owner',
};

// Menu Configuration grouped by Role
export const menuConfig = {
  [ROLES.CUSTOMER]: [
    {
      title: 'Dashboard',
      path: '/customer/dashboard',
      icon: Home,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Properties',
      path: '/customer/properties',
      icon: Building2,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'My Visits',
      path: '/customer/my-visits',
      icon: Calendar,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'My Transactions',
      path: '/customer/my-transactions',
      icon: FileText,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Inspection Reports',
      path: '/customer/inspection-reports',
      icon: ClipboardCheck,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Payments & Invoices',
      path: '/customer/payments-invoices',
      icon: Receipt,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Account Settings',
      path: '/customer/account-settings',
      icon: Settings,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Logout',
      path: '/customer/logout',
      icon: LogOut,
      roles: [ROLES.CUSTOMER],
    },
  ],


  [ROLES.ADMIN]: [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Properties',
      path: '/admin/properties',
      icon: Building2,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: Users,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Services',
      path: '/admin/services',
      icon: Briefcase,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Service Requests',
      path: '/admin/service-requests',
      icon: ClipboardCheck,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Technicians',
      path: '/admin/technicians',
      icon: Wrench,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Appointments',
      path: '/admin/appointments',
      icon: Calendar,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Payments',
      path: '/admin/payments',
      icon: CreditCard,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Reports & Analytics',
      path: '/admin/reports-analytics',
      icon: BarChart3,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'CMS Management',
      path: '/admin/cms-management',
      icon: FolderKanban,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Logout',
      path: '/admin/logout',
      icon: LogOut,
      roles: [ROLES.ADMIN],
    },
  ],

  [ROLES.INSPECTOR]: [
    {
      title: 'Dashboard',
      path: '/inspector/dashboard',
      icon: Home,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Inspections',
      path: '/inspector/inspections',
      icon: ClipboardCheck,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Schedules',
      path: '/inspector/schedules',
      icon: Calendar,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Reports',
      path: '/inspector/reports',
      icon: FileText,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Properties',
      path: '/inspector/properties',
      icon: Building2,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Messages',
      path: '/inspector/messages',
      icon: MessageSquare,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Profile',
      path: '/inspector/profile',
      icon: User,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Settings',
      path: '/inspector/settings',
      icon: Settings,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Logout',
      path: '/inspector/logout',
      icon: LogOut,
      roles: [ROLES.INSPECTOR],
    },
  ],

  [ROLES.OWNER]: [
    {
      title: 'Dashboard',
      path: '/owner/dashboard',
      icon: Home,
      roles: [ROLES.OWNER],
    },
    {
      title: 'My Properties',
      path: '/owner/properties',
      icon: Building2,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Property Status',
      path: '/owner/property-verification',
      icon: ShieldCheck,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Inspections',
      path: '/owner/inspections',
      icon: ClipboardCheck,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Property Visits',
      path: '/owner/property-visits',
      icon: Calendar,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Transactions',
      path: '/owner/transactions',
      icon: FileText,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Payments & Invoices',
      path: '/owner/payments-invoices',
      icon: Receipt,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Account Settings',
      path: '/owner/account-settings',
      icon: Settings,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Logout',
      path: '/owner/logout',
      icon: LogOut,
      roles: [ROLES.OWNER],
    },
  ],
};

/**
 * Helper function to retrieve menu configuration by role for RBAC filtering
 * @param {string} role - The current user's role
 * @returns {Array} Array of menu items accessible by the role
 */
export const getMenuByRole = (role) => {
  return menuConfig[role] || [];
};

export default menuConfig;
