import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Components/common/Sidebar';
import Topbar from '../Components/common/Topbar';

const DashboardLayout = () => {
  const location = useLocation();
  const isCustomerDashboard = location.pathname === '/customer/dashboard';
  const isCustomerProfile = location.pathname === '/customer/profile';
  const noPadding = isCustomerDashboard || isCustomerProfile;

  return (
    <div className="flex h-screen w-full bg-[#FAF8F3] overflow-hidden">
      {/* Sidebar - fixed left */}
      <Sidebar />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar - fixed top */}
        {!isCustomerDashboard && <Topbar />}
        
        {/* Main Content Area - scrollable */}
        <main className={`flex-1 overflow-y-auto bg-[#FAF8F3] ${noPadding ? '' : 'p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
