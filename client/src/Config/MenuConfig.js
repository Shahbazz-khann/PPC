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
      path: '/dashboard',
      icon: Home,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'My Properties',
      path: '/my-properties',
      icon: Building2,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Active Services',
      path: '/active-services',
      icon: Briefcase,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Service Requests',
      path: '/service-requests',
      icon: ClipboardCheck,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Inspection Reports',
      path: '/inspection-reports',
      icon: FileText,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Rent Collection',
      path: '/rent-collection',
      icon: CreditCard,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Legal Documents',
      path: '/legal-documents',
      icon: FileCheck,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Renovation Progress',
      path: '/renovation-progress',
      icon: Hammer,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Maintenance History',
      path: '/maintenance-history',
      icon: History,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Payments & Invoices',
      path: '/payments-invoices',
      icon: Receipt,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Support Center',
      path: '/support-center',
      icon: Headset,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Rewards & Offers',
      path: '/rewards-offers',
      icon: Award,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Account Settings',
      path: '/account-settings',
      icon: Settings,
      roles: [ROLES.CUSTOMER],
    },
    {
      title: 'Logout',
      path: '/logout',
      icon: LogOut,
      roles: [ROLES.CUSTOMER],
    },
  ],

  [ROLES.ADMIN]: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Properties',
      path: '/properties',
      icon: Building2,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Services',
      path: '/services',
      icon: Briefcase,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Service Requests',
      path: '/service-requests',
      icon: ClipboardCheck,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Technicians',
      path: '/technicians',
      icon: Wrench,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Appointments',
      path: '/appointments',
      icon: Calendar,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Payments',
      path: '/payments',
      icon: CreditCard,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Reports & Analytics',
      path: '/reports-analytics',
      icon: BarChart3,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'CMS Management',
      path: '/cms-management',
      icon: FolderKanban,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: [ROLES.ADMIN],
    },
    {
      title: 'Logout',
      path: '/logout',
      icon: LogOut,
      roles: [ROLES.ADMIN],
    },
  ],

  [ROLES.INSPECTOR]: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Inspections',
      path: '/inspections',
      icon: ClipboardCheck,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Schedules',
      path: '/schedules',
      icon: Calendar,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Properties',
      path: '/properties',
      icon: Building2,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: User,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: [ROLES.INSPECTOR],
    },
    {
      title: 'Logout',
      path: '/logout',
      icon: LogOut,
      roles: [ROLES.INSPECTOR],
    },
  ],

  [ROLES.OWNER]: [
    {
      title: 'Overview',
      path: '/overview',
      icon: LayoutDashboard,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Properties',
      path: '/properties',
      icon: Building2,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Tenants',
      path: '/tenants',
      icon: Users,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Rent Collection',
      path: '/rent-collection',
      icon: CreditCard,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Expenses',
      path: '/expenses',
      icon: DollarSign,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Documents',
      path: '/documents',
      icon: FileText,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      roles: [ROLES.OWNER],
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
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
