import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminPropertyDemandTypes = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminPropertyDemandTypesTitle', 'Property Demand Types')}
      description={t('admin:AdminPropertyDemandTypesDesc', 'Manage Property Demand Types reference data.')}
      columns={columns}
    />
  );
};

export default AdminPropertyDemandTypes;
