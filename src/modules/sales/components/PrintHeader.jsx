import React from 'react';
import { CompanyPrintHeader, PrintSignatures as BasePrintSignatures } from '../../../components/CompanyPrintHeader.jsx';

// Centralized Unified EPI UPS Company Header wrapper for Sales & Existing Modules
export function PrintHeader({
  title,
  department = 'SALES DEPARTMENT',
  dateRange = '',
  subtitle = '',
  metaItems = [],
  badge = '',
}) {
  return (
    <CompanyPrintHeader
      title={title}
      department={department}
      dateRange={dateRange}
      subtitle={subtitle}
      metaItems={metaItems}
      badge={badge}
    />
  );
}

export function PrintSignatures(props) {
  return <BasePrintSignatures {...props} />;
}

export { CompanyPrintHeader };
