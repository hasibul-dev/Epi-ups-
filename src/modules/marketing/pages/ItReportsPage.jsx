import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Ticket,
  Wrench,
  CheckCircle2,
  Clock,
  Laptop,
  Database,
  Upload,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function ItReportsPage() {
  const { data, exportBackup, importBackup } = useMarketing();
  const { tickets, devices, softwareAccounts, systemSettings } = data;
  const printRef = useRef();

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importBackup(event.target.result);
        alert('IT Support & Infrastructure data backup successfully restored!');
      } catch (err) {
        alert(`Failed to restore backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openTickets = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status));
  const resolvedTickets = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High');

  const operationalDevices = devices.filter((d) => d.status === 'Operational');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'Ticket ID,Subject,Requesting User,Department,Category,Priority,Technician,Status,Created Date,Resolved Date\n';
    tickets.forEach((t) => {
      csv += `"${t.id}","${t.title}","${t.requestingEmployee}","${t.department}","${t.issueCategory}","${t.priority}","${t.assignedTechnician}","${t.status}","${t.createdDate}","${t.completionDate || 'N/A'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EPI-IT-Support-Audit-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">IT AUDIT & AUDITING</div>
          <h2>IT Support Helpdesk & Hardware Inventory Reports</h2>
          <p>
            Complete audit log of IT service tickets, resolution performance, and company hardware assignments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportBackup()}
            className="btn-mkt-secondary"
            title="Download JSON Backup"
          >
            <Database size={14} className="text-amber-400" />
            <span>Backup JSON</span>
          </button>
          <label
            className="btn-mkt-secondary cursor-pointer"
            title="Restore from JSON Backup"
          >
            <Upload size={14} className="text-cyan-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportCSV}
            className="btn-mkt-secondary"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-mkt-primary"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div ref={printRef} className="mkt-card space-y-6">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4">
          <div>
            <div className="text-lg font-bold text-white">{systemSettings.companyName}</div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-0.5">
              IT Support Department — Service & Inventory Audit Report
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 mt-2 sm:mt-0">
            <div>Report Date: {today()}</div>
            <div>IT Lead: {systemSettings.leadEngineer}</div>
          </div>
        </div>

        {/* High Level Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Total Logged Tickets</div>
            <div className="text-xl font-bold text-white mt-1">{tickets.length} Tickets</div>
            <div className="text-[11px] text-slate-400 mt-1">Across all 4 departments</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Resolution Rate</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {tickets.length > 0
                ? `${Math.round((resolvedTickets.length / tickets.length) * 100)}%`
                : '100%'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">{resolvedTickets.length} Resolved</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Managed Hardware Devices</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">{devices.length} Units</div>
            <div className="text-[11px] text-cyan-400 mt-1">{operationalDevices.length} Operational</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">High / Critical Issues</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{criticalTickets.length} Tickets</div>
            <div className="text-[11px] text-slate-400 mt-1">Fiber, NAS & displays</div>
          </div>
        </div>

        {/* Tickets Detailed Audit Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white">IT Service Tickets Full Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Issue Title</th>
                  <th className="py-2.5 px-3">User & Dept</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Resolved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tickets.map((tick) => (
                  <tr key={tick.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{tick.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{tick.title}</div>
                      <div className="text-[11px] text-slate-400 max-w-[250px] truncate">
                        {tick.description}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      <div>{tick.requestingEmployee}</div>
                      <div className="text-[11px] text-slate-500">{tick.department}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{tick.issueCategory}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tick.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-300'
                            : tick.priority === 'High'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {tick.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">
                      {tick.assignedTechnician}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tick.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : tick.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {tick.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {tick.completionDate || 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hardware Devices Inventory Summary */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white">Hardware Asset Allocation Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-2 px-3">Asset Tag</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Assigned User</th>
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3">IP Address</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-mono font-bold text-cyan-400">{d.deviceTag}</td>
                    <td className="py-2 px-3 text-white font-medium">{d.brandModel}</td>
                    <td className="py-2 px-3 text-slate-400">{d.deviceType}</td>
                    <td className="py-2 px-3 text-slate-200">{d.assignedTo}</td>
                    <td className="py-2 px-3 text-slate-300">{d.department}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{d.ipAddress}</td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-400 font-semibold">{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
