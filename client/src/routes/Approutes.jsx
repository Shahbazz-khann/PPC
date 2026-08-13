import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Guards
import DashboardLayout from '../Layout/DashboardLayout';
import ProtectedRoute from '../Components/common/ProtectedRoutes';

// Public Pages
import Home from '../Pages/Home';
import About from '../Pages/About';
import ServicesPage from '../Pages/ServicesPage';
import Properties from '../Pages/Properties';
import Resources from '../Pages/Resources';
import Contact from '../Pages/Contact';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import ForgotPassword from '../Pages/ForgotPassword';
import ResetPassword from '../Pages/ResetPassword';

// Customer Pages
import CustomerDashboard       from '../Pages/Customer/Dashboard';
import CustomerProperties      from '../Pages/Customer/MyProperties';
import CustomerMyVisits        from '../Pages/Customer/Myvisit';
import CustomerMyTransactions  from '../Pages/Customer/MyTransactions';
import CustomerInspectionReport from '../Pages/Customer/InspectionReport';
import CustomerPaymentAndInvoices from '../Pages/Customer/PaymentAndInvoices';
import CustomerAccountSetting  from '../Pages/Customer/AccountSetting';
import CustomerLogout          from '../Pages/Customer/Logout';
import CustomerPropertyDetails from '../Pages/Customer/PropertyDetails';

// Admin Pages
import AdminDashboard from '../Pages/Admin/Dashboard';
import AdminAppointment from '../Pages/Admin/Appointment';
import AdminCmsMangement from '../Pages/Admin/CmsMangement';
import AdminLogout from '../Pages/Admin/Logout';
import AdminPayments from '../Pages/Admin/Payments';
import AdminProperties from '../Pages/Admin/Properties';
import AdminReportsAndAnalytics from '../Pages/Admin/ReportsAndAnalytics';
import AdminServiceRequest from '../Pages/Admin/ServiceRequest';
import AdminServices from '../Pages/Admin/Services';
import AdminSetting from '../Pages/Admin/Setting';
import AdminTechnician from '../Pages/Admin/Technician';
import AdminUsers from '../Pages/Admin/Users';

// Inspector Pages
import InspectorDashboard from '../Pages/Inspector/Dashboard';
import InspectorInspection from '../Pages/Inspector/Inspection';
import InspectorMessages from '../Pages/Inspector/Messages';
import InspectorProfile from '../Pages/Inspector/Profile';
import InspectorProperties from '../Pages/Inspector/Properties';
import InspectorReports from '../Pages/Inspector/Reports';
import InspectorSchedule from '../Pages/Inspector/Schedule';
import InspectorSetting from '../Pages/Inspector/Setting';

// Property Owner Pages
import OwnerDashboard            from '../Pages/PropertyOwner/Dashboard';
import OwnerProperties           from '../Pages/PropertyOwner/Properties';
import OwnerPropertyVerification from '../Pages/PropertyOwner/PropertyVerification';
import OwnerInspections          from '../Pages/PropertyOwner/Inspections';
import OwnerPropertyVisits       from '../Pages/PropertyOwner/PropertyVisits';
import OwnerTransactions         from '../Pages/PropertyOwner/Transactions';
import OwnerPaymentAndInvoices   from '../Pages/PropertyOwner/PaymentAndInvoices';
import OwnerAccountSetting       from '../Pages/PropertyOwner/AccountSetting';
import OwnerLogout               from '../Pages/PropertyOwner/Logout';

const Approutes = () => {
  return (
    <Routes>
      {/* Public / Landing Page Routes (No Sidebar) */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Dashboard Routes (Requires Authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ── Customer Routes (finalized) ── */}
          <Route path="/customer/dashboard"          element={<CustomerDashboard />} />
          <Route path="/customer/properties"         element={<CustomerProperties />} />
          <Route path="/customer/my-visits"          element={<CustomerMyVisits />} />
          <Route path="/customer/my-transactions"    element={<CustomerMyTransactions />} />
          <Route path="/customer/inspection-reports" element={<CustomerInspectionReport />} />
          <Route path="/customer/payments-invoices"  element={<CustomerPaymentAndInvoices />} />
          <Route path="/customer/account-settings"   element={<CustomerAccountSetting />} />
          <Route path="/customer/logout"             element={<CustomerLogout />} />
          <Route path="/customer/properties/:id"     element={<CustomerPropertyDetails />} />

          {/* Admin Role Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/service-requests" element={<AdminServiceRequest />} />
          <Route path="/admin/technicians" element={<AdminTechnician />} />
          <Route path="/admin/appointments" element={<AdminAppointment />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports-analytics" element={<AdminReportsAndAnalytics />} />
          <Route path="/admin/cms-management" element={<AdminCmsMangement />} />
          <Route path="/admin/settings" element={<AdminSetting />} />
          <Route path="/admin/logout" element={<AdminLogout />} />

          {/* Inspector Role Routes */}
          <Route path="/inspector/dashboard" element={<InspectorDashboard />} />
          <Route path="/inspector/inspections" element={<InspectorInspection />} />
          <Route path="/inspector/schedules" element={<InspectorSchedule />} />
          <Route path="/inspector/reports" element={<InspectorReports />} />
          <Route path="/inspector/properties" element={<InspectorProperties />} />
          <Route path="/inspector/messages" element={<InspectorMessages />} />
          <Route path="/inspector/profile" element={<InspectorProfile />} />
          <Route path="/inspector/settings" element={<InspectorSetting />} />
          {/* TODO: Create InspectorLogout component and map /inspector/logout route */}

          {/* Property Owner Role Routes */}
          <Route path="/owner/dashboard"             element={<OwnerDashboard />} />
          <Route path="/owner/properties"            element={<OwnerProperties />} />
          <Route path="/owner/property-verification" element={<OwnerPropertyVerification />} />
          <Route path="/owner/inspections"           element={<OwnerInspections />} />
          <Route path="/owner/property-visits"       element={<OwnerPropertyVisits />} />
          <Route path="/owner/transactions"          element={<OwnerTransactions />} />
          <Route path="/owner/payments-invoices"     element={<OwnerPaymentAndInvoices />} />
          <Route path="/owner/account-settings"      element={<OwnerAccountSetting />} />
          <Route path="/owner/logout"                element={<OwnerLogout />} />

          {/* Legacy Owner Route Redirects */}
          <Route path="/owner/overview"        element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="/owner/rent-collection" element={<Navigate to="/owner/payments-invoices" replace />} />
          <Route path="/owner/settings"        element={<Navigate to="/owner/account-settings" replace />} />
          <Route path="/owner/tenants"         element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="/owner/expenses"        element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="/owner/reports"         element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="/owner/documents"       element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="/owner/messages"        element={<Navigate to="/owner/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Approutes;
