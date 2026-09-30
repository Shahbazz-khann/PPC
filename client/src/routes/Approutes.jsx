import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Guards
import ProtectedRoute from '../Components/common/ProtectedRoutes';
import AdminRoute from '../Components/common/AdminRoute';
import GuestRoute from '../Components/common/GuestRoute';
import Logout from '../Components/common/Logout';
import DashboardLayout from '../Layout/DashboardLayout';

// Public Pages
import Home from '../Pages/Home';
import About from '../Pages/About';
import ServicesPage from '../Pages/ServicesPage';
import Properties from '../Pages/Properties';
import PublicPropertyDetails from '../Pages/public/PublicPropertyDetails';
import Resources from '../Pages/Resources';
import Contact from '../Pages/Contact';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import ForgotPassword from '../Pages/ForgotPassword';
import ResetPassword from '../Pages/ResetPassword';

// Customer Pages
import CustomerDashboard from '../Pages/customer/CustomerDashboard';
import CustomerProfile from '../Pages/customer/CustomerProfile';
import PlaceholderPage from '../Pages/customer/PlaceholderPage';

// Customer Properties
import CustomerPropertiesList from '../Pages/customer/properties/CustomerPropertiesList';
import CustomerPropertyAdd from '../Pages/customer/properties/CustomerPropertyAdd';
import CustomerPropertyDetails from '../Pages/customer/properties/CustomerPropertyDetails';
import CustomerPropertyEdit from '../Pages/customer/properties/CustomerPropertyEdit';

// Customer Requests
import CustomerRequestsList from '../Pages/customer/requests/CustomerRequestsList';
import CustomerRequestCreate from '../Pages/customer/requests/CustomerRequestCreate';
import CustomerRequestDetails from '../Pages/customer/requests/CustomerRequestDetails';

// Customer Property Visits
import CustomerPropertyVisits from '../Pages/customer/visits/CustomerPropertyVisits';
import CustomerVisitDetails from '../Pages/customer/visits/CustomerVisitDetails';

// Customer Inspection Reports
import CustomerInspectionReports from '../Pages/customer/inspections/CustomerInspectionReports';
import CustomerInspectionDetails from '../Pages/customer/inspections/CustomerInspectionDetails';

// Customer Verification Reports
import CustomerVerificationReports from '../Pages/customer/verifications/CustomerVerificationReports';
import CustomerVerificationDetails from '../Pages/customer/verifications/CustomerVerificationDetails';

// Customer Inbox / Messaging
import CustomerInbox from '../Pages/customer/inbox/CustomerInbox';
import CustomerMessageCreate from '../Pages/customer/inbox/CustomerMessageCreate';
import CustomerMessageDetails from '../Pages/customer/inbox/CustomerMessageDetails';

// Admin Pages
import AdminDashboard from '../Pages/Admin/AdminDashboard';

// Admin Operations
import AdminCustomers from '../Pages/Admin/customers/AdminCustomers';
import AdminCustomerDetails from '../Pages/Admin/customers/AdminCustomerDetails';
import AdminProperties from '../Pages/Admin/properties/AdminProperties';
import AdminRequests from '../Pages/Admin/requests/AdminRequests';
import AdminPropertyVisits from '../Pages/Admin/visits/AdminPropertyVisits';
import AdminInspectionReports from '../Pages/Admin/inspections/AdminInspectionReports';
import AdminVerificationReports from '../Pages/Admin/verifications/AdminVerificationReports';

// Admin Pending
import AdminPropertyRegistry from '../Pages/Admin/registry/AdminPropertyRegistry';
import AdminPaymentSummary from '../Pages/Admin/payments/AdminPaymentSummary';

// Administration
import AdminUsers from '../Pages/Admin/users/AdminUsers';
import AdminRoleManagement from '../Pages/Admin/roles/AdminRoleManagement';
import AdminEmployees from '../Pages/Admin/employees/AdminEmployees';
import AdminServiceProviders from '../Pages/Admin/serviceProviders/AdminServiceProviders';
import AdminSystemConfig from '../Pages/Admin/systemConfig/AdminSystemConfig';
import AdminApiLogs from '../Pages/Admin/apiLogs/AdminApiLogs';

// Reference Tables - Location
import AdminCountries from '../Pages/Admin/reference/countries/AdminCountries';
import AdminProvinces from '../Pages/Admin/reference/provinces/AdminProvinces';
import AdminDivisions from '../Pages/Admin/reference/divisions/AdminDivisions';
import AdminDistricts from '../Pages/Admin/reference/districts/AdminDistricts';
import AdminTehsils from '../Pages/Admin/reference/tehsils/AdminTehsils';
import AdminCities from '../Pages/Admin/reference/cities/AdminCities';
import AdminSocieties from '../Pages/Admin/reference/societies/AdminSocieties';
import AdminAreas from '../Pages/Admin/reference/areas/AdminAreas';

// Reference Tables - Property
import AdminPropertyTypes from '../Pages/Admin/reference/propertyTypes/AdminPropertyTypes';
import AdminPropertyStatusTypes from '../Pages/Admin/reference/propertyStatusTypes/AdminPropertyStatusTypes';
import AdminPropertyPurposes from '../Pages/Admin/reference/propertyPurposes/AdminPropertyPurposes';
import AdminPropertyDemandTypes from '../Pages/Admin/reference/propertyDemandTypes/AdminPropertyDemandTypes';
import AdminPropertyUse from '../Pages/Admin/reference/propertyUse/AdminPropertyUse';
import AdminUom from '../Pages/Admin/reference/uom/AdminUom';

// Reference Tables - Requests & Workflow
import AdminCustomerRequestStatusTypes from '../Pages/Admin/reference/customerRequestStatusTypes/AdminCustomerRequestStatusTypes';
import AdminApprovalStages from '../Pages/Admin/reference/approvalStages/AdminApprovalStages';

// Reference Tables - Services
import AdminPpcServiceTypes from '../Pages/Admin/reference/ppcServiceTypes/AdminPpcServiceTypes';
import AdminPpcServices from '../Pages/Admin/reference/ppcServices/AdminPpcServices';

// Reference Tables - Employee / Access
import AdminUserTypes from '../Pages/Admin/reference/userTypes/AdminUserTypes';
import AdminRolesMaster from '../Pages/Admin/reference/roles/AdminRolesMaster';
import AdminDesignations from '../Pages/Admin/reference/designations/AdminDesignations';

// Reference Tables - Finance
import AdminCurrencies from '../Pages/Admin/reference/currencies/AdminCurrencies';

const Approutes = () => {
  return (
    <Routes>
      {/* Public / Landing Page Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:propertyId" element={<PublicPropertyDetails />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes (Requires Authentication) */}
      <Route element={<ProtectedRoute />}>
        {/* Customer Dashboard Routes */}
        <Route path="/customer" element={<DashboardLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="profile" element={<CustomerProfile />} />
          
          {/* Properties Module */}
          <Route path="properties" element={<CustomerPropertiesList />} />
          <Route path="properties/new" element={<CustomerPropertyAdd />} />
          <Route path="properties/:propertyId" element={<CustomerPropertyDetails />} />
          <Route path="properties/:propertyId/edit" element={<CustomerPropertyEdit />} />
          
          {/* Requests Module */}
          <Route path="requests" element={<CustomerRequestsList />} />
          <Route path="requests/new" element={<CustomerRequestCreate />} />
          <Route path="requests/:requestId" element={<CustomerRequestDetails />} />

          {/* Visits Module */}
          <Route path="visits" element={<CustomerPropertyVisits />} />
          <Route path="visits/:visitId" element={<CustomerVisitDetails />} />
          {/* Inspections Module */}
          <Route path="inspection-reports" element={<CustomerInspectionReports />} />
          <Route path="inspection-reports/:inspectionId" element={<CustomerInspectionDetails />} />
          {/* Verifications Module */}
          <Route path="verification-reports" element={<CustomerVerificationReports />} />
          <Route path="verification-reports/:propertyId" element={<CustomerVerificationDetails />} />
          
          {/* Inbox / Messaging Module */}
          <Route path="inbox" element={<CustomerInbox />} />
          <Route path="inbox/new" element={<CustomerMessageCreate />} />
          <Route path="inbox/:messageId" element={<CustomerMessageDetails />} />
          
          <Route path="payments" element={<PlaceholderPage title="Payment Summary" />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Administration */}
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoleManagement />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="service-providers" element={<AdminServiceProviders />} />
            <Route path="system-configuration" element={<AdminSystemConfig />} />
            <Route path="api-logs" element={<AdminApiLogs />} />

            {/* Reference Tables - Location */}
            <Route path="reference/countries" element={<AdminCountries />} />
            <Route path="reference/provinces" element={<AdminProvinces />} />
            <Route path="reference/divisions" element={<AdminDivisions />} />
            <Route path="reference/districts" element={<AdminDistricts />} />
            <Route path="reference/tehsils" element={<AdminTehsils />} />
            <Route path="reference/cities" element={<AdminCities />} />
            <Route path="reference/societies" element={<AdminSocieties />} />
            <Route path="reference/areas" element={<AdminAreas />} />

            {/* Reference Tables - Property */}
            <Route path="reference/property-types" element={<AdminPropertyTypes />} />
            <Route path="reference/property-status-types" element={<AdminPropertyStatusTypes />} />
            <Route path="reference/property-purposes" element={<AdminPropertyPurposes />} />
            <Route path="reference/property-demand-types" element={<AdminPropertyDemandTypes />} />
            <Route path="reference/property-use" element={<AdminPropertyUse />} />
            <Route path="reference/uom" element={<AdminUom />} />

            {/* Reference Tables - Requests & Workflow */}
            <Route path="reference/customer-request-status-types" element={<AdminCustomerRequestStatusTypes />} />
            <Route path="reference/approval-stages" element={<AdminApprovalStages />} />

            {/* Reference Tables - Services */}
            <Route path="reference/ppc-service-types" element={<AdminPpcServiceTypes />} />
            <Route path="reference/ppc-services" element={<AdminPpcServices />} />

            {/* Reference Tables - Employee / Access */}
            <Route path="reference/user-types" element={<AdminUserTypes />} />
            <Route path="reference/roles" element={<AdminRolesMaster />} />
            <Route path="reference/designations" element={<AdminDesignations />} />

            {/* Reference Tables - Finance */}
            <Route path="reference/currencies" element={<AdminCurrencies />} />

            {/* Operations */}
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:customerId" element={<AdminCustomerDetails />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="property-visits" element={<AdminPropertyVisits />} />
            <Route path="inspection-reports" element={<AdminInspectionReports />} />
            <Route path="verification-reports" element={<AdminVerificationReports />} />

            {/* Pending */}
            <Route path="property-registry" element={<AdminPropertyRegistry />} />
            <Route path="payment-summary" element={<AdminPaymentSummary />} />
          </Route>
        </Route>

        <Route path="/logout" element={<Logout />} />
      </Route>
    </Routes>
  );
};

export default Approutes;
