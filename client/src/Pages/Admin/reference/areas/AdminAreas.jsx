import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminAreas = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminAreasTitle', 'Areas')}
      description={t('admin:AdminAreasDesc', 'Manage Areas reference data.')}
      columns={columns}
    />
  );
};

export default AdminAreas;
