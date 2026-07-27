import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/common/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout flex">
      <Sidebar />
      <main className="dashboard-content flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
