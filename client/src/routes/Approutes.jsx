import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
import CustomerDashboard from '../Pages/Customer/Dashboard';
import CustomerMyProperties from '../Pages/Customer/MyProperties';
import CustomerActiveServices from '../Pages/Customer/ActiveServices';
import CustomerServiceRequest from '../Pages/Customer/ServiceRequest';
import CustomerInspectionReport from '../Pages/Customer/InspectionReport';
import CustomerRentCollection from '../Pages/Customer/RentCollection';
import CustomerLegalDocument from '../Pages/Customer/LegalDocument';
import CustomerRenovationProgress from '../Pages/Customer/RenovationProgress';
import CustomerMaintenanceHistory from '../Pages/Customer/MaintenanceHistory';
import CustomerPaymentAndInvoices from '../Pages/Customer/PaymentAndInvoices';
import CustomerSupportCenter from '../Pages/Customer/SupportCenter';
import CustomerRewardsAndOffer from '../Pages/Customer/RewardsAndOffer';
import CustomerAccountSetting from '../Pages/Customer/AccountSetting';
import CustomerLogout from '../Pages/Customer/Logout';

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
import OwnerOverview from '../Pages/PropertyOwner/Overview';
import OwnerDocument from '../Pages/PropertyOwner/Document';
import OwnerExpenses from '../Pages/PropertyOwner/Expenses';
import OwnerMessage from '../Pages/PropertyOwner/Message';
import OwnerProperties from '../Pages/PropertyOwner/Properties';
import OwnerRentCollection from '../Pages/PropertyOwner/RentCollection';
import OwnerReports from '../Pages/PropertyOwner/Reports';
import OwnerSetting from '../Pages/PropertyOwner/Setting';
import OwnerTenants from '../Pages/PropertyOwner/Tenants';

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
          {/* Customer Role Routes */}
          <Route path="/login/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/my-properties" element={<CustomerMyProperties />} />
          <Route path="/customer/active-services" element={<CustomerActiveServices />} />
          <Route path="/customer/service-requests" element={<CustomerServiceRequest />} />
          <Route path="/customer/inspection-reports" element={<CustomerInspectionReport />} />
          <Route path="/customer/rent-collection" element={<CustomerRentCollection />} />
          <Route path="/customer/legal-documents" element={<CustomerLegalDocument />} />
          <Route path="/customer/renovation-progress" element={<CustomerRenovationProgress />} />
          <Route path="/customer/maintenance-history" element={<CustomerMaintenanceHistory />} />
          <Route path="/customer/payments-invoices" element={<CustomerPaymentAndInvoices />} />
          <Route path="/customer/support-center" element={<CustomerSupportCenter />} />
          <Route path="/customer/rewards-offers" element={<CustomerRewardsAndOffer />} />
          <Route path="/customer/account-settings" element={<CustomerAccountSetting />} />
          <Route path="/customer/logout" element={<CustomerLogout />} />

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
          <Route path="/owner/overview" element={<OwnerOverview />} />
          <Route path="/owner/properties" element={<OwnerProperties />} />
          <Route path="/owner/tenants" element={<OwnerTenants />} />
          <Route path="/owner/rent-collection" element={<OwnerRentCollection />} />
          <Route path="/owner/expenses" element={<OwnerExpenses />} />
          <Route path="/owner/reports" element={<OwnerReports />} />
          <Route path="/owner/documents" element={<OwnerDocument />} />
          <Route path="/owner/messages" element={<OwnerMessage />} />
          <Route path="/owner/settings" element={<OwnerSetting />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Approutes;
