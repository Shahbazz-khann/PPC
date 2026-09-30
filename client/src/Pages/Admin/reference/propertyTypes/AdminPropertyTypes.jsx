import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminPropertyTypes = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminPropertyTypesTitle', 'Property Types')}
      description={t('admin:AdminPropertyTypesDesc', 'Manage Property Types reference data.')}
      columns={columns}
    />
  );
};

export default AdminPropertyTypes;
