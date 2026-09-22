import { LayoutDashboard, User, Home, FileText, Calendar, ClipboardCheck, ShieldCheck, Settings, Inbox, CreditCard } from 'lucide-react';

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