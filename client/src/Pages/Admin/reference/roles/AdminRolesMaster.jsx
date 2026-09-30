import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminRolesMaster = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminRolesMasterTitle', 'Roles Master')}
      description={t('admin:AdminRolesMasterDesc', 'Manage Roles Master reference data.')}
      columns={columns}
    />
  );
};

export default AdminRolesMaster;
