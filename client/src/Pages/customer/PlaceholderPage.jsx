import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">This section is currently under development.</p>
      </div>
      
      <div className="flex-1 mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Coming Soon</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            The {title} functionality will be implemented in the upcoming development phases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
