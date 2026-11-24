import React from 'react';
import { MarketingProvider } from './context/MarketingContext.jsx';
import DigitalMarketingMainPage from './pages/DigitalMarketingMainPage.jsx';

// Modals & Drawers
import TaskModal from './components/TaskModal.jsx';
import TaskUpdateModal from './components/TaskUpdateModal.jsx';
import TaskPrintModal from './components/TaskPrintModal.jsx';
import TaskDetailsModal from './components/TaskDetailsModal.jsx';

function MarketingItInner() {
  return (
    <div className="marketing-module-wrapper space-y-4">
      {/* Consolidated Single Digital Marketing Interface */}
      <main className="marketing-page-content">
        <DigitalMarketingMainPage />
      </main>

      {/* Primary Work Modals */}
      <TaskModal />
      <TaskUpdateModal />
      <TaskPrintModal />
      <TaskDetailsModal />
    </div>
  );
}

export default function MarketingItModule() {
  return (
    <MarketingProvider>
      <MarketingItInner />
    </MarketingProvider>
  );
}
