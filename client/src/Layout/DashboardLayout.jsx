import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/common/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />
      <main className="dashboard-content flex-1 overflow-y-auto min-w-0 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
