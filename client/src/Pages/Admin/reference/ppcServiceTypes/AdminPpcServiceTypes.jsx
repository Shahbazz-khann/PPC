import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminPpcServiceTypes = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminPpcServiceTypesTitle', 'PPC Service Types')}
      description={t('admin:AdminPpcServiceTypesDesc', 'Manage PPC Service Types reference data.')}
      columns={columns}
    />
  );
};

export default AdminPpcServiceTypes;
