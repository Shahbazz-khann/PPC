import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Guards
import ProtectedRoute from '../Components/common/ProtectedRoutes';
import GuestRoute from '../Components/common/GuestRoute';
import Logout from '../Components/common/Logout';
import DashboardLayout from '../Layout/DashboardLayout';

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

const Approutes = () => {
  return (
    <Routes>
      {/* Public / Landing Page Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/properties" element={<Properties />} />
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

        <Route path="/logout" element={<Logout />} />
      </Route>
    </Routes>
  );
};

export default Approutes;
