import { Routes, Route } from 'react-router-dom';
import Home from '../Pages/Home';
import About from '../Pages/About';
import ServicesPage from '../Pages/ServicesPage';
import Properties from '../Pages/Properties';
import Resources from '../Pages/Resources';
import Contact from '../Pages/Contact';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import DashboardLayout from '../Layout/DashboardLayout';
import Dashboard from "../Pages/Customer/Dashboard";

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

      {/* Dashboard Routes Layout (Contains Sidebar + Outlet) */}
   <Route element={<DashboardLayout />}>
    <Route
        path="/customer/dashboard"
        element={<Dashboard />}
    />
  </Route>
    </Routes>
  );
};

export default Approutes;
