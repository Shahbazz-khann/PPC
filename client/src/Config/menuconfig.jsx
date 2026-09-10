import { LayoutDashboard, User, Home, FileText, Calendar, ClipboardCheck, ShieldCheck, Settings, Inbox, CreditCard } from 'lucide-react';

export const customerMenu = [
  { title: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
  { title: 'My Profile', path: '/customer/profile', icon: User },
  { title: 'My Properties', path: '/customer/properties', icon: Home },
  { title: 'My Requests', path: '/customer/requests', icon: FileText },
  { title: 'Property Visits', path: '/customer/visits', icon: Calendar },
  { title: 'Inspection Reports', path: '/customer/inspections', icon: ClipboardCheck },
  { title: 'Verification Reports', path: '/customer/verifications', icon: ShieldCheck },
  { title: 'Inbox', path: '/customer/inbox', icon: Inbox },
  { title: 'Payment Summary', path: '/customer/payments', icon: CreditCard },
  { title: 'Account Settings', path: '/customer/settings', icon: Settings },
];