import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

const AdminSystemConfig = () => {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="font-sans pb-12 min-h-[600px]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('admin:AdminSystemConfigTitle', 'System Configuration')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin:AdminSystemConfigDesc', 'PPC system configuration options will appear here.')}
        </p>
      </div>

      <div className="bg-white rounded-[24px] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-[400px]">
        <Settings className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">System Configuration</h3>
        <p className="text-gray-500 max-w-md">
          {t('admin:AdminSystemConfigDesc', 'PPC system configuration options will appear here.')}
        </p>
      </div>
    </div>
  );
};

export default AdminSystemConfig;
