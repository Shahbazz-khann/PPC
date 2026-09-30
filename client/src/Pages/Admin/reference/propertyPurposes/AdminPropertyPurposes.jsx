import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminPropertyPurposes = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminPropertyPurposesTitle', 'Property Purposes')}
      description={t('admin:AdminPropertyPurposesDesc', 'Manage Property Purposes reference data.')}
      columns={columns}
    />
  );
};

export default AdminPropertyPurposes;
