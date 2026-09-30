import React from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';

const AdminDesignations = () => {
  const { t } = useTranslation(['admin']);

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colStatus', 'Status')
  ];

  return (
    <ReferenceTablePage 
      title={t('admin:AdminDesignationsTitle', 'Designations')}
      description={t('admin:AdminDesignationsDesc', 'Manage Designations reference data.')}
      columns={columns}
    />
  );
};

export default AdminDesignations;
