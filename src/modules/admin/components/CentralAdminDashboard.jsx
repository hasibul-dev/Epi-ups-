import React from 'react';
import ExecutiveDashboard from './ExecutiveDashboard.jsx';

/**
 * Backward-compatible wrapper for CentralAdminDashboard.
 * Renders the dedicated ExecutiveDashboard component.
 */
export default function CentralAdminDashboard(props) {
  return <ExecutiveDashboard {...props} />;
}
