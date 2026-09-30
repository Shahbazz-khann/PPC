const fs = require('fs');
const path = require('path');

const refPages = [
  // Location
  { folder: 'reference/countries', file: 'AdminCountries.jsx', title: 'Countries' },
  { folder: 'reference/provinces', file: 'AdminProvinces.jsx', title: 'Provinces' },
  { folder: 'reference/divisions', file: 'AdminDivisions.jsx', title: 'Divisions' },
  { folder: 'reference/districts', file: 'AdminDistricts.jsx', title: 'Districts' },
  { folder: 'reference/tehsils', file: 'AdminTehsils.jsx', title: 'Tehsils' },
  { folder: 'reference/cities', file: 'AdminCities.jsx', title: 'Cities' },
  { folder: 'reference/societies', file: 'AdminSocieties.jsx', title: 'Societies' },
  { folder: 'reference/areas', file: 'AdminAreas.jsx', title: 'Areas' },

  // Property
  { folder: 'reference/propertyTypes', file: 'AdminPropertyTypes.jsx', title: 'Property Types' },
  { folder: 'reference/propertyStatusTypes', file: 'AdminPropertyStatusTypes.jsx', title: 'Property Status Types' },
  { folder: 'reference/propertyPurposes', file: 'AdminPropertyPurposes.jsx', title: 'Property Purposes' },
  { folder: 'reference/propertyDemandTypes', file: 'AdminPropertyDemandTypes.jsx', title: 'Property Demand Types' },
  { folder: 'reference/propertyUse', file: 'AdminPropertyUse.jsx', title: 'Property Use' },
  { folder: 'reference/uom', file: 'AdminUom.jsx', title: 'Units of Measurement' },

  // Requests & Workflow
  { folder: 'reference/customerRequestStatusTypes', file: 'AdminCustomerRequestStatusTypes.jsx', title: 'Customer Request Status Types' },
  { folder: 'reference/approvalStages', file: 'AdminApprovalStages.jsx', title: 'Approval Stages' },

  // Services
  { folder: 'reference/ppcServiceTypes', file: 'AdminPpcServiceTypes.jsx', title: 'PPC Service Types' },
  { folder: 'reference/ppcServices', file: 'AdminPpcServices.jsx', title: 'PPC Services' },

  // Employee / Access
  { folder: 'reference/userTypes', file: 'AdminUserTypes.jsx', title: 'User Types' },
  { folder: 'reference/roles', file: 'AdminRolesMaster.jsx', title: 'Roles Master' },
  { folder: 'reference/designations', file: 'AdminDesignations.jsx', title: 'Designations' },

  // Finance
  { folder: 'reference/currencies', file: 'AdminCurrencies.jsx', title: 'Currencies' },
];

const adminPages = [
  { folder: 'users', file: 'AdminUsers.jsx', title: 'User Management', desc: 'Internal PPC account directory.' },
  { folder: 'roles', file: 'AdminRoleManagement.jsx', title: 'Role Management', desc: 'Assign and manage roles for employees.' },
  { folder: 'systemConfig', file: 'AdminSystemConfig.jsx', title: 'System Configuration', desc: 'PPC system configuration options will appear here.' },
  { folder: 'apiLogs', file: 'AdminApiLogs.jsx', title: 'API Logs', desc: 'API logging infrastructure is pending.' },
];

const basePath = path.join(__dirname, 'src', 'Pages', 'Admin');

// Generate Reference Tables
refPages.forEach(page => {
  const dirPath = path.join(basePath, page.folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const ${page.file.split('.')[0]} = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:${page.file.split('.')[0]}Title', '${page.title}')}
      description={t('admin:${page.file.split('.')[0]}Desc', 'Manage ${page.title} reference data.')}
      columns={columns}
    />
  );
};

export default ${page.file.split('.')[0]};
`;
  fs.writeFileSync(path.join(dirPath, page.file), content);
});

// Generate Admin Operation shells
adminPages.forEach(page => {
  const dirPath = path.join(basePath, page.folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

const ${page.file.split('.')[0]} = () => {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="font-sans pb-12 min-h-[600px]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('admin:${page.file.split('.')[0]}Title', '${page.title}')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin:${page.file.split('.')[0]}Desc', '${page.desc}')}
        </p>
      </div>

      <div className="bg-white rounded-[24px] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-[400px]">
        <Settings className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">${page.title}</h3>
        <p className="text-gray-500 max-w-md">
          {t('admin:${page.file.split('.')[0]}Desc', '${page.desc}')}
        </p>
      </div>
    </div>
  );
};

export default ${page.file.split('.')[0]};
`;

  fs.writeFileSync(path.join(dirPath, page.file), content);
});

console.log('Admin & Reference pages regenerated.');
