import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminCustomerRequestStatusTypes = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminCustomerRequestStatusTypesTitle', 'Customer Request Status Types')}
      description={t('admin:AdminCustomerRequestStatusTypesDesc', 'Manage Customer Request Status Types reference data.')}
      columns={columns}
    />
  );
};

export default AdminCustomerRequestStatusTypes;
