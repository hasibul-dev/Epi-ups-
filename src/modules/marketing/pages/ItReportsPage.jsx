import React, { useState, useRef } from 'react';
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
  Calendar,
  Search,
  Eye,
  FileSpreadsheet,
  Server,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, addDays, fmt } from '../../sales/utils/helpers.js';
import { exportToPdf, exportToCsv, triggerPrint, printFormattedReport } from '../../../services/reportExport.js';
import { PrintHeader, PrintSignatures } from '../../sales/components/PrintHeader.jsx';

const IT_REPORTS = [
  {
    id: 'ticket',
    label: 'IT Ticket Report',
    icon: Ticket,
    desc: 'Complete audit log of IT service desk tickets, issue categories, departments & priority',
  },
  {
    id: 'device',
    label: 'Device Management Report',
    icon: Laptop,
    desc: 'Hardware asset allocation, IP configuration, serial numbers & operational status',
  },
  {
    id: 'technician',
    label: 'Technician Activity Report',
    icon: Wrench,
    desc: 'Technician resolution workload, performance rate, critical fixes & ticket distribution',
  },
  {
    id: 'resolved',
    label: 'Resolved Ticket Report',
    icon: CheckCircle2,
    desc: 'Resolved and closed IT support requests with turnaround times & engineering notes',
  },
  {
    id: 'pending',
    label: 'Pending Ticket Report',
    icon: Clock,
    desc: 'Active, open, and in-progress IT assistance requests requiring urgent technician dispatch',
  },
  {
    id: 'history',
    label: 'IT Work History Report',
    icon: Database,
    desc: 'Chronological archive of enterprise network repairs, firmware setups & hardware servicing',
  },
];

export default function ItReportsPage() {
  const { data, exportBackup, importBackup } = useMarketing();
  const { tickets = [], devices = [], softwareAccounts = [], systemSettings = {} } = data;

  const [activeReport, setActiveReport] = useState('ticket');
  const [from, setFrom] = useState(addDays(today(), -30));
  const [to, setTo] = useState(today());
  const [deptFilter, setDeptFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [activePreset, setActivePreset] = useState('30days');

  // Quick Date Presets
  const setPreset = (preset) => {
    setActivePreset(preset);
    const t = today();
    if (preset === 'today') {
      setFrom(t);
      setTo(t);
    } else if (preset === '7days') {
      setFrom(addDays(t, -6));
      setTo(t);
    } else if (preset === '30days') {
      setFrom(addDays(t, -29));
      setTo(t);
    } else if (preset === 'thisMonth') {
      const parts = t.split('-');
      setFrom(`${parts[0]}-${parts[1]}-01`);
      setTo(t);
    } else if (preset === 'all') {
      setFrom('2020-01-01');
      setTo('2099-12-31');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const confirmed = window.confirm(
      `⚠️ WARNING: OVERWRITE IT SUPPORT & INFRASTRUCTURE DATA\n\n` +
      `Importing this backup will OVERWRITE your current records:\n` +
      `- IT Tickets: ${tickets.length}\n` +
      `- Registered Devices: ${devices.length}\n` +
      `- Software Accounts: ${softwareAccounts.length}\n\n` +
      `Existing records will be completely replaced by the data in the imported backup file.\n` +
      `Are you sure you want to proceed?`
    );
    if (!confirmed) {
      e.target.value = '';
      return;
    }
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

  // Unique lists for dropdown filters
  const allDepartments = Array.from(
    new Set([
      ...tickets.map((t) => t.department).filter(Boolean),
      ...devices.map((d) => d.department).filter(Boolean),
    ])
  ).sort();

  const allTechnicians = Array.from(
    new Set(tickets.map((t) => t.assignedTechnician).filter(Boolean))
  ).sort();

  const q = searchQuery.trim().toLowerCase();

  // Filtered dataset for the active report
  const getFilteredData = () => {
    if (activeReport === 'ticket') {
      return tickets.filter((t) => {
        if (deptFilter && t.department !== deptFilter) return false;
        if (priorityFilter && t.priority !== priorityFilter) return false;
        if (techFilter && t.assignedTechnician !== techFilter) return false;
        if (from && t.createdDate && t.createdDate < from) return false;
        if (to && t.createdDate && t.createdDate > to) return false;
        if (q) {
          const match = [
            t.id,
            t.title,
            t.description,
            t.requestingEmployee,
            t.department,
            t.issueCategory,
            t.assignedTechnician,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      });
    }

    if (activeReport === 'device') {
      return devices.filter((d) => {
        if (deptFilter && d.department !== deptFilter) return false;
        if (q) {
          const match = [
            d.id,
            d.deviceTag,
            d.deviceType,
            d.brandModel,
            d.specifications,
            d.serialNumber,
            d.assignedTo,
            d.department,
            d.ipAddress,
            d.status,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      });
    }

    if (activeReport === 'technician') {
      // Aggregate performance per technician
      const techMap = {};
      tickets.forEach((t) => {
        const name = t.assignedTechnician || 'Unassigned';
        if (!techMap[name]) {
          techMap[name] = {
            technician: name,
            totalTickets: 0,
            resolved: 0,
            pending: 0,
            criticalResolved: 0,
            categories: new Set(),
          };
        }
        // Apply date range
        if (from && t.createdDate && t.createdDate < from) return;
        if (to && t.createdDate && t.createdDate > to) return;

        techMap[name].totalTickets += 1;
        if (['Resolved', 'Closed'].includes(t.status)) {
          techMap[name].resolved += 1;
          if (t.priority === 'Critical' || t.priority === 'High') {
            techMap[name].criticalResolved += 1;
          }
        } else {
          techMap[name].pending += 1;
        }
        if (t.issueCategory) techMap[name].categories.add(t.issueCategory);
      });

      return Object.values(techMap)
        .map((tech) => ({
          ...tech,
          categories: Array.from(tech.categories).join(', '),
          rate:
            tech.totalTickets > 0
              ? `${Math.round((tech.resolved / tech.totalTickets) * 100)}%`
              : '100%',
        }))
        .filter((tech) => {
          if (techFilter && tech.technician !== techFilter) return false;
          if (q && !tech.technician.toLowerCase().includes(q)) return false;
          return true;
        });
    }

    if (activeReport === 'resolved') {
      return tickets
        .filter((t) => ['Resolved', 'Closed'].includes(t.status))
        .filter((t) => {
          if (deptFilter && t.department !== deptFilter) return false;
          if (priorityFilter && t.priority !== priorityFilter) return false;
          if (techFilter && t.assignedTechnician !== techFilter) return false;
          const resDate = t.completionDate || t.createdDate;
          if (from && resDate && resDate < from) return false;
          if (to && resDate && resDate > to) return false;
          if (q) {
            const match = [
              t.id,
              t.title,
              t.requestingEmployee,
              t.department,
              t.assignedTechnician,
              t.resolutionDetails,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (!match.includes(q)) return false;
          }
          return true;
        });
    }

    if (activeReport === 'pending') {
      return tickets
        .filter((t) => ['Open', 'In Progress'].includes(t.status))
        .filter((t) => {
          if (deptFilter && t.department !== deptFilter) return false;
          if (priorityFilter && t.priority !== priorityFilter) return false;
          if (techFilter && t.assignedTechnician !== techFilter) return false;
          if (from && t.createdDate && t.createdDate < from) return false;
          if (to && t.createdDate && t.createdDate > to) return false;
          if (q) {
            const match = [
              t.id,
              t.title,
              t.requestingEmployee,
              t.department,
              t.assignedTechnician,
              t.description,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (!match.includes(q)) return false;
          }
          return true;
        });
    }

    if (activeReport === 'history') {
      // Chronological log of all actions
      return [...tickets]
        .sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''))
        .filter((t) => {
          if (deptFilter && t.department !== deptFilter) return false;
          if (techFilter && t.assignedTechnician !== techFilter) return false;
          if (from && t.createdDate && t.createdDate < from) return false;
          if (to && t.createdDate && t.createdDate > to) return false;
          if (q) {
            const match = [
              t.id,
              t.title,
              t.description,
              t.requestingEmployee,
              t.department,
              t.assignedTechnician,
              t.resolutionDetails,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (!match.includes(q)) return false;
          }
          return true;
        });
    }

    return tickets;
  };

  const filteredData = getFilteredData();
  const activeDef = IT_REPORTS.find((r) => r.id === activeReport) || IT_REPORTS[0];

  // High level KPIs
  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status)).length;
  const resolvedCount = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;
  const criticalCount = tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High').length;
  const operationalDevices = devices.filter((d) => d.status === 'Operational').length;

  const dateRangeStr = `${fmt(from)} to ${fmt(to)}`;

  // PDF Export
  const handleExportPdf = () => {
    let headers = [];
    let pdfRows = [];

    if (activeReport === 'ticket') {
      headers = ['SL', 'Ticket ID', 'Issue Title', 'User & Dept', 'Category', 'Priority', 'Technician', 'Status', 'Date'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        `${t.requestingEmployee || 'N/A'} (${t.department || ''})`,
        t.issueCategory || 'General',
        t.priority || 'Normal',
        t.assignedTechnician || 'Unassigned',
        t.status || 'Open',
        t.createdDate ? fmt(t.createdDate) : 'N/A',
      ]);
    } else if (activeReport === 'device') {
      headers = ['SL', 'Asset Tag', 'Device Model & Type', 'Specs / CPU / RAM', 'Serial No', 'Assigned User', 'Dept', 'IP Address', 'Status'];
      pdfRows = filteredData.map((d, i) => [
        i + 1,
        d.deviceTag,
        `${d.brandModel} (${d.deviceType})`,
        d.specifications || '-',
        d.serialNumber || '-',
        d.assignedTo || 'Unassigned',
        d.department || 'General',
        d.ipAddress || '-',
        d.status || 'Operational',
      ]);
    } else if (activeReport === 'technician') {
      headers = ['SL', 'IT Support Technician', 'Assigned Tickets', 'Resolved', 'Pending Work', 'Critical Resolved', 'Resolution Rate'];
      pdfRows = filteredData.map((tech, i) => [
        i + 1,
        tech.technician,
        tech.totalTickets,
        tech.resolved,
        tech.pending,
        tech.criticalResolved,
        tech.rate,
      ]);
    } else if (activeReport === 'resolved') {
      headers = ['SL', 'Ticket ID', 'Issue Title', 'Requester & Dept', 'Assigned Tech', 'Resolution Date', 'Engineering Resolution Details'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        `${t.requestingEmployee} (${t.department})`,
        t.assignedTechnician || 'Unassigned',
        t.completionDate ? fmt(t.completionDate) : fmt(t.createdDate),
        t.resolutionDetails || 'Verified & resolved by IT Support Engineer',
      ]);
    } else if (activeReport === 'pending') {
      headers = ['SL', 'Ticket ID', 'Pending Issue Title', 'Requester & Dept', 'Category', 'Priority', 'Technician', 'Created Date', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        `${t.requestingEmployee} (${t.department})`,
        t.issueCategory || 'General',
        t.priority || 'Normal',
        t.assignedTechnician || 'Pending Assignment',
        t.createdDate ? fmt(t.createdDate) : 'N/A',
        t.status || 'Open',
      ]);
    } else {
      // History
      headers = ['SL', 'Ticket ID', 'Event / Problem Title', 'Department', 'Technician', 'Created Date', 'Resolved Date', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.department || 'Office',
        t.assignedTechnician || 'Staff',
        t.createdDate ? fmt(t.createdDate) : 'N/A',
        t.completionDate ? fmt(t.completionDate) : 'In Progress',
        t.status || 'Open',
      ]);
    }

    exportToPdf({
      title: activeDef.label,
      department: 'IT Support',
      subtitle: activeDef.desc,
      dateRange: dateRangeStr,
      headers,
      rows: pdfRows,
      summary: {
        'Total Logged Tickets': `${totalTickets} Tickets`,
        'Open / In Progress': `${openCount} Tickets`,
        'Resolved Work': `${resolvedCount} Tickets`,
        'Active Hardware Assets': `${devices.length} Units`,
        'Resolution Rate': totalTickets > 0 ? `${Math.round((resolvedCount / totalTickets) * 100)}%` : '100%',
      },
      orientation: 'landscape',
    });
  };

  // Excel CSV Export
  const handleExportCsv = () => {
    let headers = [];
    let csvRows = [];

    if (activeReport === 'ticket') {
      headers = ['SL No', 'Ticket ID', 'Issue Title', 'Description', 'Requesting User', 'Department', 'Category', 'Priority', 'Technician', 'Status', 'Created Date', 'Resolved Date'];
      csvRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.description || '',
        t.requestingEmployee,
        t.department,
        t.issueCategory,
        t.priority,
        t.assignedTechnician,
        t.status,
        t.createdDate,
        t.completionDate || '',
      ]);
    } else if (activeReport === 'device') {
      headers = ['SL No', 'Asset Tag', 'Device Model', 'Device Type', 'Specifications', 'Serial Number', 'Assigned User', 'Department', 'IP Address', 'Status'];
      csvRows = filteredData.map((d, i) => [
        i + 1,
        d.deviceTag,
        d.brandModel,
        d.deviceType,
        d.specifications,
        d.serialNumber,
        d.assignedTo,
        d.department,
        d.ipAddress,
        d.status,
      ]);
    } else if (activeReport === 'technician') {
      headers = ['SL No', 'Technician', 'Total Tickets', 'Resolved', 'Pending', 'Critical Resolved', 'Resolution Rate', 'Covered Categories'];
      csvRows = filteredData.map((tech, i) => [
        i + 1,
        tech.technician,
        tech.totalTickets,
        tech.resolved,
        tech.pending,
        tech.criticalResolved,
        tech.rate,
        tech.categories,
      ]);
    } else if (activeReport === 'resolved') {
      headers = ['SL No', 'Ticket ID', 'Issue Title', 'User', 'Department', 'Technician', 'Created Date', 'Resolved Date', 'Resolution Details'];
      csvRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.requestingEmployee,
        t.department,
        t.assignedTechnician,
        t.createdDate,
        t.completionDate || '',
        t.resolutionDetails || '',
      ]);
    } else if (activeReport === 'pending') {
      headers = ['SL No', 'Ticket ID', 'Issue Title', 'User', 'Department', 'Priority', 'Technician', 'Created Date', 'Current Status', 'Description'];
      csvRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.requestingEmployee,
        t.department,
        t.priority,
        t.assignedTechnician,
        t.createdDate,
        t.status,
        t.description || '',
      ]);
    } else {
      // History
      headers = ['SL No', 'Ticket ID', 'Title', 'Department', 'Technician', 'Created Date', 'Completion Date', 'Status', 'Resolution Details'];
      csvRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.department,
        t.assignedTechnician,
        t.createdDate,
        t.completionDate || '',
        t.status,
        t.resolutionDetails || '',
      ]);
    }

    exportToCsv({
      title: activeDef.label,
      department: 'IT Support & Infrastructure',
      dateRange: dateRangeStr,
      headers,
      rows: csvRows,
    });
  };

  const handlePrint = () => {
    let headers = [];
    let pdfRows = [];

    if (activeReport === 'ticket') {
      headers = ['SL', 'Ticket ID', 'Issue Title', 'User', 'Department', 'Category', 'Priority', 'Technician', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.requestingEmployee,
        t.department,
        t.issueCategory,
        t.priority,
        t.assignedTechnician,
        t.status,
      ]);
    } else if (activeReport === 'device') {
      headers = ['SL', 'Asset Tag', 'Device Model', 'Type', 'Serial No', 'Assigned To', 'Department', 'Status'];
      pdfRows = filteredData.map((d, i) => [
        i + 1,
        d.deviceTag,
        d.brandModel,
        d.deviceType,
        d.serialNumber || 'N/A',
        d.assignedTo || 'Unassigned',
        d.department || 'General',
        d.status,
      ]);
    } else if (activeReport === 'technician') {
      headers = ['SL', 'Technician Name', 'Total Assigned', 'Resolved', 'Pending', 'Critical Done', 'Efficiency'];
      pdfRows = filteredData.map((tech, i) => [
        i + 1,
        tech.name,
        tech.total,
        tech.resolved,
        tech.pending,
        tech.criticalDone,
        `${tech.rate}%`,
      ]);
    } else if (activeReport === 'hardware') {
      headers = ['SL', 'Ticket ID', 'Device', 'Problem Details', 'User', 'Technician', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.deviceId || 'IT Infrastructure',
        t.title,
        t.requestingEmployee,
        t.assignedTechnician,
        t.status,
      ]);
    } else if (activeReport === 'pending') {
      headers = ['SL', 'Ticket ID', 'Issue Title', 'User', 'Department', 'Priority', 'Technician', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.requestingEmployee,
        t.department,
        t.priority,
        t.assignedTechnician,
        t.status,
      ]);
    } else {
      headers = ['SL', 'Ticket ID', 'Work Order / Title', 'Department', 'Technician', 'Resolved Date', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.id,
        t.title,
        t.department,
        t.assignedTechnician,
        t.completionDate ? fmt(t.completionDate) : 'Pending',
        t.status,
      ]);
    }

    printFormattedReport({
      title: activeDef.label,
      department: 'IT Support & Technical Infrastructure',
      dateRange: dateRangeStr,
      subtitle: activeDef.desc,
      headers,
      rows: pdfRows,
      summary: {
        'Total Logged Tickets': `${totalTickets} Tickets`,
        'Open / In Progress': `${openCount} Tickets`,
        'Resolved Work': `${resolvedCount} Tickets`,
        'Active Hardware Assets': `${devices.length} Units`,
      },
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">IT SUPPORT & INFRASTRUCTURE REPORTING</div>
          <h2>IT Support Helpdesk & Hardware Inventory Reports</h2>
          <p>
            Complete enterprise audit logs for IT service requests, device assignments, technician efficiency, and work history
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
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-mkt-secondary"
            title="Toggle Print Preview"
          >
            <Eye size={14} className="text-sky-400" />
            <span>{previewMode ? 'Live Mode' : 'Print Preview'}</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="btn-mkt-secondary"
            title="Export to Microsoft Excel CSV"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="btn-mkt-secondary"
            title="Download Official Corporate PDF"
          >
            <Download size={14} className="text-purple-400" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-mkt-it"
            title="Print Official Report with Letterhead"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="mkt-card !p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {IT_REPORTS.map((rep) => {
            const Icon = rep.icon;
            const isActive = activeReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setActiveReport(rep.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-sky-500/15 border-sky-500/40 text-white shadow-lg shadow-sky-500/10'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
                <span className="text-xs font-bold mt-1.5 leading-tight">{rep.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mkt-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar size={13} className="text-sky-400" />
              Presets:
            </span>
            <button
              onClick={() => setPreset('today')}
              className={`btn-filter ${activePreset === 'today' ? 'active' : ''}`}
            >
              Today
            </button>
            <button
              onClick={() => setPreset('7days')}
              className={`btn-filter ${activePreset === '7days' ? 'active' : ''}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPreset('30days')}
              className={`btn-filter ${activePreset === '30days' ? 'active' : ''}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setPreset('thisMonth')}
              className={`btn-filter ${activePreset === 'thisMonth' ? 'active' : ''}`}
            >
              This Month
            </button>
            <button
              onClick={() => setPreset('all')}
              className={`btn-filter ${activePreset === 'all' ? 'active' : ''}`}
            >
              All Time
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Date Range:</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mkt-input text-xs !py-1 !px-2.5 !w-auto"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mkt-input text-xs !py-1 !px-2.5 !w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="mkt-select text-xs"
            >
              <option value="">All Departments</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Technician
            </label>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="mkt-select text-xs"
            >
              <option value="">All Technicians</option>
              {allTechnicians.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="mkt-select text-xs"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, title, user, tag..."
                className="mkt-input pl-8 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mkt-kpi-grid mb-4">
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Tickets</span>
          <span className="mkt-stat-val text-white">{totalTickets}</span>
          <span className="mkt-stat-sub">Across All Enterprise Departments</span>
        </div>
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Open / In Progress</span>
          <span className="mkt-stat-val text-amber-400">{openCount}</span>
          <span className="mkt-stat-sub">Requiring Technician Support</span>
        </div>
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Resolved Work</span>
          <span className="mkt-stat-val text-emerald-400">{resolvedCount}</span>
          <span className="mkt-stat-sub">
            {totalTickets > 0 ? `${Math.round((resolvedCount / totalTickets) * 100)}% resolution` : '100%'}
          </span>
        </div>
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Hardware Assets</span>
          <span className="mkt-stat-val text-cyan-400">{devices.length} Units</span>
          <span className="mkt-stat-sub">{operationalDevices} Operational</span>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className={`mkt-card p-6 space-y-6 ${previewMode ? 'bg-white text-slate-900 shadow-2xl ring-2 ring-indigo-500' : ''}`}>
        {/* Printable Official Header */}
        <PrintHeader
          title={activeDef.label}
          department="IT Support & Infrastructure Department"
          dateRange={dateRangeStr}
          metaItems={[
            { label: 'Department', value: deptFilter || 'All Departments' },
            { label: 'Technician', value: techFilter || 'All Technicians' },
            { label: 'Priority', value: priorityFilter || 'All Priorities' },
            { label: 'Total Records', value: `${filteredData.length}` },
          ]}
        />

        {/* 1. IT Ticket Report Table */}
        {activeReport === 'ticket' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse text-xs ${previewMode ? 'text-slate-800' : 'text-slate-300'}`}>
              <thead>
                <tr className={`border-b ${previewMode ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800/60 text-slate-400'} text-[11px] uppercase tracking-wider font-bold`}>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Issue Title & Details</th>
                  <th className="py-2.5 px-3">Requesting User</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${previewMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-500">
                      No IT tickets found matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((t, idx) => (
                    <tr key={t.id} className={previewMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{t.id}</td>
                      <td className="py-2.5 px-3">
                        <div className={`font-semibold ${previewMode ? 'text-slate-900' : 'text-white'}`}>{t.title}</div>
                        <div className="text-[11px] text-slate-400 max-w-[280px] truncate">{t.description}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium">{t.requestingEmployee}</div>
                        <div className="text-[10px] text-slate-500">{t.department}</div>
                      </td>
                      <td className="py-2.5 px-3">{t.issueCategory}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : t.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{t.assignedTechnician || 'Unassigned'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : t.status === 'In Progress'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-indigo-500/20 text-indigo-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {t.createdDate ? fmt(t.createdDate) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Device Management Report Table */}
        {activeReport === 'device' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse text-xs ${previewMode ? 'text-slate-800' : 'text-slate-300'}`}>
              <thead>
                <tr className={`border-b ${previewMode ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800/60 text-slate-400'} text-[11px] uppercase tracking-wider font-bold`}>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Asset Tag</th>
                  <th className="py-2.5 px-3">Brand & Model</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Hardware Specifications</th>
                  <th className="py-2.5 px-3">Serial Number</th>
                  <th className="py-2.5 px-3">Assigned User</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${previewMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-slate-500">
                      No hardware assets found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((d, idx) => (
                    <tr key={d.id} className={previewMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{d.deviceTag}</td>
                      <td className={`py-2.5 px-3 font-medium ${previewMode ? 'text-slate-900' : 'text-white'}`}>{d.brandModel}</td>
                      <td className="py-2.5 px-3 text-slate-400">{d.deviceType}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-[200px] truncate">{d.specifications || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{d.serialNumber || '-'}</td>
                      <td className="py-2.5 px-3 font-medium">{d.assignedTo || 'Unassigned'}</td>
                      <td className="py-2.5 px-3">{d.department}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-400">{d.ipAddress || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'Operational' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Technician Activity Report Table */}
        {activeReport === 'technician' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse text-xs ${previewMode ? 'text-slate-800' : 'text-slate-300'}`}>
              <thead>
                <tr className={`border-b ${previewMode ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800/60 text-slate-400'} text-[11px] uppercase tracking-wider font-bold`}>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Technician Name</th>
                  <th className="py-2.5 px-3">Assigned Tickets</th>
                  <th className="py-2.5 px-3">Resolved</th>
                  <th className="py-2.5 px-3">Pending</th>
                  <th className="py-2.5 px-3">Critical / High Fixed</th>
                  <th className="py-2.5 px-3">Resolution Rate</th>
                  <th className="py-2.5 px-3">Covered Categories</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${previewMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No technician activity records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((tech, idx) => (
                    <tr key={tech.technician} className={previewMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className={`py-2.5 px-3 font-bold ${previewMode ? 'text-slate-900' : 'text-white'}`}>{tech.technician}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-400">{tech.totalTickets}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{tech.resolved}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">{tech.pending}</td>
                      <td className="py-2.5 px-3 font-bold text-rose-400">{tech.criticalResolved}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                          {tech.rate}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-[250px] truncate">{tech.categories || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Resolved Ticket Report Table */}
        {activeReport === 'resolved' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse text-xs ${previewMode ? 'text-slate-800' : 'text-slate-300'}`}>
              <thead>
                <tr className={`border-b ${previewMode ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800/60 text-slate-400'} text-[11px] uppercase tracking-wider font-bold`}>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Issue Title</th>
                  <th className="py-2.5 px-3">Requester & Dept</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Resolved Date</th>
                  <th className="py-2.5 px-3">Resolution Details & Notes</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${previewMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No resolved tickets found for the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((t, idx) => (
                    <tr key={t.id} className={previewMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{t.id}</td>
                      <td className={`py-2.5 px-3 font-semibold ${previewMode ? 'text-slate-900' : 'text-white'}`}>{t.title}</td>
                      <td className="py-2.5 px-3">
                        <div>{t.requestingEmployee}</div>
                        <div className="text-[10px] text-slate-500">{t.department}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{t.assignedTechnician}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {t.completionDate ? fmt(t.completionDate) : fmt(t.createdDate)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-[320px]">
                        {t.resolutionDetails || 'Issue successfully diagnosed and resolved.'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pending Ticket Report Table */}
        {activeReport === 'pending' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse text-xs ${previewMode ? 'text-slate-800' : 'text-slate-300'}`}>
              <thead>
                <tr className={`border-b ${previewMode ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800/60 text-slate-400'} text-[11px] uppercase tracking-wider font-bold`}>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Pending Issue Title</th>
                  <th className="py-2.5 px-3">Requester & Dept</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Assigned Tech</th>
                  <th className="py-2.5 px-3">Logged Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Issue Description</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${previewMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-500">
                      Zero pending tickets! All IT support requests are resolved.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((t, idx) => (
                    <tr key={t.id} className={previewMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{t.id}</td>
                      <td className={`py-2.5 px-3 font-semibold ${previewMode ? 'text-slate-900' : 'text-white'}`}>{t.title}</td>
                      <td className="py-2.5 px-3">
                        <div>{t.requestingEmployee}</div>
                        <div className="text-[10px] text-slate-500">{t.department}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-400'
                              : t.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{t.assignedTechnician || 'Pending Assignment'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.createdDate ? fmt(t.createdDate) : 'N/A'}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-[280px] truncate">{t.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. IT Work History Report Table */}
        {activeReport === 'history' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse text-xs ${previewMode ? 'text-slate-800' : 'text-slate-300'}`}>
              <thead>
                <tr className={`border-b ${previewMode ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-700 bg-slate-800/60 text-slate-400'} text-[11px] uppercase tracking-wider font-bold`}>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Event / Work Order</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Logged Date</th>
                  <th className="py-2.5 px-3">Resolved Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${previewMode ? 'divide-slate-200' : 'divide-slate-800'}`}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No IT work history found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((t, idx) => (
                    <tr key={t.id} className={previewMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{t.id}</td>
                      <td className="py-2.5 px-3">
                        <div className={`font-semibold ${previewMode ? 'text-slate-900' : 'text-white'}`}>{t.title}</div>
                        <div className="text-[11px] text-slate-400 max-w-[280px] truncate">{t.resolutionDetails || t.description}</div>
                      </td>
                      <td className="py-2.5 px-3">{t.department}</td>
                      <td className="py-2.5 px-3 font-medium">{t.assignedTechnician}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.createdDate ? fmt(t.createdDate) : 'N/A'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.completionDate ? fmt(t.completionDate) : 'Pending'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'Resolved' || t.status === 'Closed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3-Role Official Corporate Signatures */}
        <div className="pt-8 border-t border-slate-800/80">
          <PrintSignatures
            signatories={[
              { title: 'IT Support Specialist', note: 'Prepared By' },
              { title: 'IT Systems Manager', note: 'Verified By' },
              { title: 'Director / MD', note: 'Approved By' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
