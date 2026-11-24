import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  User,
  Tag,
  FileText,
  Clock,
  Layers,
  CheckSquare,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { exportToPdf } from '../../../services/reportExport.js';
import WorkPrintDocument from './WorkPrintDocument.jsx';

export default function WorkPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  const [activeReport, setActiveReport] = useState('single');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  useEffect(() => {
    if (open) {
      if (type === 'single') setActiveReport('single');
      else if (type === 'completion') setActiveReport('completion');
      else if (type === 'assignment') setActiveReport('assignment');
      else setActiveReport('history');

      setSelectedTaskId(item?.id || '');
    }
  }, [open, type, item]);

  if (!open) return null;

  const currentToday = today();
  const allTasks = data.marketingTasks || [];
  const tasksList = list && list.length > 0 ? list : allTasks;

  const singleTask =
    (selectedTaskId ? allTasks.find((t) => t.id === selectedTaskId) : null) ||
    item ||
    tasksList[0] ||
    allTasks[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const reportNames = {
      single: `EPI_Work_Order_Slip_${singleTask?.id || 'Doc'}`,
      history: 'EPI_Digital_Marketing_Work_History_Report',
      completion: 'EPI_Digital_Marketing_Work_Completion_Report',
      assignment: 'EPI_Digital_Marketing_Work_Assignment_Report',
    };
    await exportToPdf('dm-modal-print-sheet', reportNames[activeReport] || 'EPI_Report');
  };

  return (
    <div className="dm-modal-backdrop" onClick={closeTaskPrintModal}>
      <div
        className="dm-modal-card max-w-4xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/95 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Digital Marketing Print & Export Center
              </h3>
              <p className="text-xs text-slate-400">
                Official EPI UPS Corporate A4 Document Preview & PDF Generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="dm-btn dm-btn-secondary"
              title="Download high-resolution PDF file"
            >
              <Download size={14} className="text-sky-400" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="dm-btn dm-btn-primary"
              title="Print document or save using browser dialog"
            >
              <Printer size={14} />
              <span>Print Document</span>
            </button>

            <button
              type="button"
              onClick={closeTaskPrintModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/80 border-b border-white/5 no-print overflow-x-auto">
          {[
            { id: 'single', label: '1. Individual Work Slip', icon: FileText },
            { id: 'history', label: '2. Work History Report', icon: Clock },
            { id: 'completion', label: '3. Work Completion Report', icon: CheckSquare },
            { id: 'assignment', label: '4. Work Assignment Report', icon: Layers },
          ].map((tab) => {
            const active = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReport(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live A4 Document Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/90 flex justify-center">
          <div id="dm-modal-print-sheet" className="shadow-2xl">
            <WorkPrintDocument
              reportType={activeReport}
              task={singleTask}
              tasks={tasksList}
              orientation={activeReport === 'single' ? 'portrait' : 'landscape'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
