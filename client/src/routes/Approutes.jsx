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
          <Route path="properties" element={<PlaceholderPage title="My Properties" />} />
          <Route path="requests" element={<PlaceholderPage title="My Requests" />} />
          <Route path="visits" element={<PlaceholderPage title="Property Visits" />} />
          <Route path="inspections" element={<PlaceholderPage title="Inspection Reports" />} />
          <Route path="verifications" element={<PlaceholderPage title="Verification Reports" />} />
          <Route path="inbox" element={<PlaceholderPage title="Inbox" />} />
          <Route path="payments" element={<PlaceholderPage title="Payment Summary" />} />
          <Route path="settings" element={<PlaceholderPage title="Account Settings" />} />
        </Route>

        <Route path="/logout" element={<Logout />} />
      </Route>
    </Routes>
  );
};

export default Approutes;
