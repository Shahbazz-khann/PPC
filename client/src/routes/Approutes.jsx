import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Guards
import ProtectedRoute from '../Components/common/ProtectedRoutes';
import GuestRoute from '../Components/common/GuestRoute';
import Logout from '../Components/common/Logout';

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

const Approutes = () => {
  return (
    <Routes>
      {/* Public / Landing Page Routes */}
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes (Requires Authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/logout" element={<Logout />} />
      </Route>
    </Routes>
  );
};

export default Approutes;
