import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminPPCServices = () => {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <h1 className="text-xl font-bold text-[#1a2b25]">
            {t('admin:AdminPPCServicesTitle', 'PPC Services')}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">PPC Services</h2>
          <p className="text-gray-500 max-w-md">
            {t('admin:AdminPPCServicesDesc', 'PPC Services management will be connected to backend data in a later step.')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminPPCServices;
