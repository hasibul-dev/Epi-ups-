import { useState, useEffect, useRef } from 'react';
import { today, addDays, fmt, inRange, formatTime12h, compareTimes } from '../utils/helpers.js';
import { PrintHeader, PrintSignatures } from './PrintHeader.jsx';
import ExpandableText from './ExpandableText.jsx';
import { exportToPdf, exportToCsv, triggerPrint } from '../../../services/reportExport.js';
import {
  Printer,
  Plus,
  Save,
  Check,
  Trash2,
  RefreshCw,
  Download,
  FileText,
  Calendar,
  Users,
  CheckSquare,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

const REPORT_TABS = [
  { id: 'client', label: 'Sales Client Report', icon: Users, desc: 'Corporate clients, contact persons, equipment models & follow-up status' },
  { id: 'daily', label: 'Daily Work Report', icon: FileText, desc: 'Date-wise log of sales visits, client calls, product presentations & demos' },
  { id: 'followup', label: 'Follow-up Report', icon: Clock, desc: 'Clients with pending or overdue follow-up milestones' },
  { id: 'upcoming', label: 'Upcoming Work Report', icon: Calendar, desc: 'Future scheduled meetings, site visits, and proposal follow-ups' },
  { id: 'overdue', label: 'Overdue Work Report', icon: AlertTriangle, desc: 'Unresolved tasks and follow-ups past their target completion date' },
  { id: 'monthly', label: 'Monthly Activity Report', icon: CheckSquare, desc: 'Aggregated monthly sales performance, visits, and win rates' },
  { id: 'history', label: 'Client History Report', icon: FileText, desc: 'Complete historical timeline of client engagements and outcomes' },
];

const isCompleted = (status) => String(status || '').trim().toLowerCase() === 'completed';

export default function Reports({ db, store, onPrint, initialReport = 'daily' }) {
  const [activeReport, setActiveReport] = useState(initialReport);
  const [from, setFrom] = useState(addDays(today(), -30));
  const [to, setTo] = useState(today());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [rows, setRows] = useState([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const lastRow = useRef(null);

  const tDate = today();

  // Quick Date Presets
  const setPreset = (preset) => {
    const t = today();
    if (preset === 'today') {
      setFrom(t);
      setTo(t);
    } else if (preset === 'yesterday') {
      const y = addDays(t, -1);
      setFrom(y);
      setTo(y);
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
    } else if (preset === 'ytd') {
      const parts = t.split('-');
      setFrom(`${parts[0]}-01-01`);
      setTo(t);
    } else if (preset === 'all') {
      setFrom('2020-01-01');
      setTo('2099-12-31');
    }
  };

  // Build rows dynamically based on the active report tab
  useEffect(() => {
    const fromDate = from || today();
    const toDate = to || from || today();
    const q = searchQuery.trim().toLowerCase();

    const historyWorkIds = new Set(
      (db.history || [])
        .flatMap((h) => [h.workId, h.id])
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map(String)
    );
    const historyNewWorkIds = new Set(
      (db.history || [])
        .flatMap((h) => [h.newWorkId, h.id])
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map(String)
    );

    let res = [];

    if (activeReport === 'client') {
      // 1. Sales Client Report
      (db.clients || []).forEach((c) => {
        if (selectedClientId && c.id !== selectedClientId) return;
        if (statusFilter && c.category !== statusFilter && c.status !== statusFilter) return;
        if (q) {
          const match = [c.name, c.company, c.phone, c.email, c.category, c.product, c.serial, c.notes]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!match.includes(q)) return;
        }
        res.push({
          key: 'c-' + c.id,
          rawId: c.id,
          source: 'client_master',
          date: c.saleDate || c.createdAt?.slice(0, 10) || '',
          clientName: c.name,
          company: c.company || '',
          phone: c.phone || '',
          category: c.category || 'Potential',
          product: c.product || c.model || 'UPS System',
          serial: c.serial || 'N/A',
          warranty: `${c.wValue || 1} ${c.wUnit || 'years'} (${c.wType || 'Standard'})`,
          nextDate: c.nextDate || '',
          activity: `${c.name} — ${c.company || 'Direct'} (${c.category || 'Potential'})`,
          notes: c.notes || '',
          status: c.category || 'Active',
        });
      });
    } else if (activeReport === 'followup') {
      // 2. Follow-up Report
      (db.clients || [])
        .filter((c) => c.nextDate && inRange(c.nextDate, fromDate, toDate))
        .forEach((c) => {
          if (selectedClientId && c.id !== selectedClientId) return;
          const isOver = c.nextDate < tDate && !isCompleted(c.status);
          if (statusFilter === 'Overdue' && !isOver) return;
          if (statusFilter === 'Pending' && (isOver || isCompleted(c.status))) return;
          if (statusFilter === 'Completed' && !isCompleted(c.status)) return;

          if (q) {
            const match = [c.name, c.company, c.phone, c.category, c.notes].filter(Boolean).join(' ').toLowerCase();
            if (!match.includes(q)) return;
          }

          res.push({
            key: 'fu-' + c.id,
            rawId: c.id,
            source: 'client',
            date: c.nextDate,
            time: '',
            clientName: c.name,
            company: c.company || '',
            phone: c.phone || '',
            activity: `Follow-up: ${c.name} (${c.company || 'Corporate Client'})`,
            notes: c.notes || '',
            category: c.category || 'Follow-up',
            status: isCompleted(c.status) ? 'Completed' : isOver ? 'Overdue' : 'Pending',
            isModified: false,
            isSaving: false,
          });
        });
    } else if (activeReport === 'upcoming') {
      // 3. Upcoming Work Report
      const minDate = tDate;
      const combined = [
        ...(db.work || []).map((w) => ({ ...w, src: 'work' })),
        ...(db.newWork || []).map((w) => ({ ...w, src: 'new' })),
      ];

      combined
        .filter((w) => w.date >= minDate && inRange(w.date, fromDate, toDate) && !isCompleted(w.status))
        .forEach((w) => {
          if (q && !String(w.text + ' ' + (w.notes || '')).toLowerCase().includes(q)) return;
          res.push({
            key: 'up-' + w.id,
            rawId: w.id,
            source: w.src,
            date: w.date,
            time: w.time ? formatTime12h(w.time) : '',
            activity: w.text,
            notes: w.notes || '',
            status: 'Scheduled (Upcoming)',
            isModified: false,
            isSaving: false,
          });
        });

      (db.clients || [])
        .filter((c) => c.nextDate >= minDate && inRange(c.nextDate, fromDate, toDate) && !isCompleted(c.status))
        .forEach((c) => {
          if (selectedClientId && c.id !== selectedClientId) return;
          if (q && !String(c.name + ' ' + c.company + ' ' + c.notes).toLowerCase().includes(q)) return;
          res.push({
            key: 'upc-' + c.id,
            rawId: c.id,
            source: 'client',
            date: c.nextDate,
            time: '',
            activity: `Scheduled Follow-up: ${c.name} - ${c.company}`,
            notes: c.notes || '',
            status: 'Upcoming Follow-up',
            isModified: false,
            isSaving: false,
          });
        });
    } else if (activeReport === 'overdue') {
      // 4. Overdue Work Report
      (db.work || [])
        .filter((w) => w.date < tDate && !isCompleted(w.status))
        .forEach((w) => {
          if (q && !String(w.text + ' ' + (w.notes || '')).toLowerCase().includes(q)) return;
          res.push({
            key: 'od-w-' + w.id,
            rawId: w.id,
            source: 'work',
            date: w.date,
            time: w.time ? formatTime12h(w.time) : '',
            activity: w.text,
            notes: w.notes || '',
            status: 'Overdue Task',
            isModified: false,
            isSaving: false,
          });
        });

      (db.clients || [])
        .filter((c) => c.nextDate && c.nextDate < tDate && !isCompleted(c.status))
        .forEach((c) => {
          if (selectedClientId && c.id !== selectedClientId) return;
          if (q && !String(c.name + ' ' + c.company + ' ' + c.notes).toLowerCase().includes(q)) return;
          res.push({
            key: 'od-c-' + c.id,
            rawId: c.id,
            source: 'client',
            date: c.nextDate,
            time: '',
            activity: `Overdue Follow-up: ${c.name} - ${c.company}`,
            notes: c.notes || '',
            status: 'Overdue Follow-up',
            isModified: false,
            isSaving: false,
          });
        });
    } else if (activeReport === 'history') {
      // 5. Client History Report
      (db.history || [])
        .filter((h) => inRange(h.date, fromDate, toDate))
        .forEach((h) => {
          if (selectedClientId && h.clientId !== selectedClientId) return;
          if (q) {
            const match = [h.text, h.client, h.company, h.notes, h.type].filter(Boolean).join(' ').toLowerCase();
            if (!match.includes(q)) return;
          }
          res.push({
            key: 'h-' + h.id,
            rawId: h.id,
            source: 'history',
            date: h.date,
            time: h.time ? formatTime12h(h.time) : '',
            clientName: h.client || '',
            company: h.company || '',
            activity: h.text || `${h.type || 'Activity'} — ${h.client || 'Client'}`,
            notes: h.notes || '',
            status: h.status || 'Completed',
            isModified: false,
            isSaving: false,
          });
        });
    } else {
      // 6. Daily Work Report & Monthly Activity Report (Standard / Work Mode)
      (db.history || [])
        .filter((h) => inRange(h.date, fromDate, toDate))
        .forEach((h) => {
          if (selectedClientId && h.clientId !== selectedClientId) return;
          if (statusFilter && h.status !== statusFilter) return;
          if (q) {
            const match = [h.text, h.client, h.company, h.notes, h.type].filter(Boolean).join(' ').toLowerCase();
            if (!match.includes(q)) return;
          }
          res.push({
            key: 'h-' + h.id,
            rawId: h.id,
            source: 'history',
            date: h.date,
            time: h.time ? formatTime12h(h.time) : '',
            activity: h.text || `${h.type || 'Work'} - ${h.client || ''}${h.company ? ' - ' + h.company : ''}`,
            notes: h.notes || '',
            status: h.status || 'Completed',
            isModified: false,
            isSaving: false,
          });
        });

      (db.work || [])
        .filter((w) => inRange(w.date, fromDate, toDate) && (!isCompleted(w.status) || !historyWorkIds.has(String(w.id))))
        .forEach((w) => {
          if (statusFilter && w.status !== statusFilter) return;
          if (q && !String(w.text + ' ' + (w.notes || '')).toLowerCase().includes(q)) return;
          res.push({
            key: 'w-' + w.id,
            rawId: w.id,
            source: 'work',
            date: w.date,
            time: w.time ? formatTime12h(w.time) : '',
            activity: w.text,
            notes: w.notes || '',
            status: w.status || 'Pending',
            isModified: false,
            isSaving: false,
          });
        });

      (db.newWork || [])
        .filter((w) => inRange(w.date, fromDate, toDate) && (!isCompleted(w.status) || !historyNewWorkIds.has(String(w.id))))
        .forEach((w) => {
          if (statusFilter && w.status !== statusFilter) return;
          if (q && !String(w.text + ' ' + (w.notes || '')).toLowerCase().includes(q)) return;
          res.push({
            key: 'n-' + w.id,
            rawId: w.id,
            source: 'new',
            date: w.date,
            time: w.time ? formatTime12h(w.time) : '',
            activity: w.text,
            notes: w.notes || '',
            status: w.status || 'Pending',
            isModified: false,
            isSaving: false,
          });
        });

      (db.clients || [])
        .filter((c) => c.nextDate && inRange(c.nextDate, fromDate, toDate) && isCompleted(c.status))
        .forEach((c) => {
          if (selectedClientId && c.id !== selectedClientId) return;
          if (statusFilter && c.status !== statusFilter) return;
          if (q && !String(c.name + ' ' + c.company + ' ' + c.notes).toLowerCase().includes(q)) return;
          res.push({
            key: 'fc-' + c.id,
            rawId: c.id,
            source: 'client',
            date: c.nextDate,
            time: '',
            activity: `Follow-up: ${c.name} — ${c.company || 'Direct'}`,
            notes: c.notes || '',
            status: 'Completed',
            isModified: false,
            isSaving: false,
          });
        });
    }

    res.sort((a, b) => {
      const dComp = (b.date || '').localeCompare(a.date || '');
      if (dComp !== 0) return dComp;
      return compareTimes(a.time, b.time);
    });

    setRows(res);
  }, [db, activeReport, from, to, searchQuery, selectedClientId, statusFilter]);

  // Row inline edit handler for work/daily entries
  const editRow = (i, key, value) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [key]: value, isModified: true } : r))
    );
  };

  const handleSaveRow = async (targetIndex) => {
    const r = rows[targetIndex];
    if (!r) return;
    if (!r.activity?.trim()) {
      alert('Activity description cannot be empty.');
      return;
    }
    if (!r.date) {
      alert('Date cannot be empty.');
      return;
    }

    setRows((prev) => prev.map((row, idx) => (idx === targetIndex ? { ...row, isSaving: true } : row)));

    try {
      const formattedTime = r.time ? formatTime12h(r.time) : '';
      if (r.source === 'manual') {
        const newDoc = await store.addHistoricalWork(
          r.date,
          formattedTime,
          r.activity.trim(),
          r.notes || '',
          r.status || 'Completed'
        );
        if (newDoc) {
          setRows((prev) =>
            prev.map((row, idx) =>
              idx === targetIndex
                ? { ...row, rawId: newDoc.id, source: 'history', key: 'h-' + newDoc.id, isModified: false, isSaving: false }
                : row
            )
          );
        }
      } else if (r.source === 'work' && store.editWork) {
        await store.editWork(r.rawId, {
          date: r.date,
          time: formattedTime,
          text: r.activity.trim(),
          notes: r.notes || '',
          status: r.status,
        });
        setRows((prev) =>
          prev.map((row, idx) => (idx === targetIndex ? { ...row, isModified: false, isSaving: false } : row))
        );
      } else if (r.source === 'history' && store.editHistoricalWork) {
        await store.editHistoricalWork(r.rawId, {
          date: r.date,
          time: formattedTime,
          text: r.activity.trim(),
          notes: r.notes || '',
          status: r.status,
        });
        setRows((prev) =>
          prev.map((row, idx) => (idx === targetIndex ? { ...row, isModified: false, isSaving: false } : row))
        );
      }
    } catch (e) {
      alert('Failed to save row: ' + e.message);
      setRows((prev) => prev.map((row, idx) => (idx === targetIndex ? { ...row, isSaving: false } : row)));
    }
  };

  const handleDeleteRow = async (targetIndex) => {
    const r = rows[targetIndex];
    if (!r) return;
    if (!window.confirm(`Permanently delete this ${r.status || ''} entry?`)) return;

    try {
      if (r.source === 'work' && store.deleteWork) {
        await store.deleteWork(r.rawId);
      } else if (r.source === 'history' && store.deleteHistoricalWork) {
        await store.deleteHistoricalWork(r.rawId);
      }
      setRows((prev) => prev.filter((_, idx) => idx !== targetIndex));
    } catch (e) {
      alert('Failed to delete row: ' + e.message);
    }
  };

  const handleAddNewRow = () => {
    const newEntry = {
      key: 'manual-' + Date.now(),
      rawId: null,
      source: 'manual',
      date: today(),
      time: '10:00 AM',
      activity: '',
      notes: '',
      status: 'Pending',
      isModified: true,
      isSaving: false,
    };
    setRows([newEntry, ...rows]);
  };

  // Report Summary Statistics
  const totalCount = rows.length;
  const completedCount = rows.filter((r) => isCompleted(r.status) || r.status === 'Resolved').length;
  const pendingCount = rows.filter((r) => r.status === 'Pending' || r.status?.includes('Upcoming')).length;
  const overdueCount = rows.filter((r) => r.status?.includes('Overdue')).length;

  const activeDef = REPORT_TABS.find((t) => t.id === activeReport) || REPORT_TABS[0];

  // PDF Export
  const handleExportPdf = () => {
    const dateRangeStr = `${fmt(from)} to ${fmt(to)}`;
    let headers = [];
    let pdfRows = [];

    if (activeReport === 'client') {
      headers = ['SL', 'Client Name', 'Company', 'Phone', 'Category', 'Product / Model', 'Serial No', 'Follow-up'];
      pdfRows = rows.map((r, i) => [
        i + 1,
        r.clientName || 'N/A',
        r.company || 'N/A',
        r.phone || 'N/A',
        r.category || 'Potential',
        r.product || 'UPS',
        r.serial || 'N/A',
        r.nextDate ? fmt(r.nextDate) : 'None',
      ]);
    } else {
      headers = ['SL', 'Date', 'Time', 'Activity Details', 'Client / Company', 'Status', 'Notes'];
      pdfRows = rows.map((r, i) => [
        i + 1,
        r.date ? fmt(r.date) : '',
        r.time || '-',
        r.activity || '',
        r.company || r.clientName || 'Direct Client',
        r.status || 'Pending',
        r.notes || '',
      ]);
    }

    exportToPdf({
      title: activeDef.label,
      department: 'Sales',
      subtitle: activeDef.desc,
      dateRange: dateRangeStr,
      headers,
      rows: pdfRows,
      summary: {
        'Total Records': totalCount,
        'Completed': completedCount,
        'Pending': pendingCount,
        'Overdue': overdueCount,
      },
      orientation: 'landscape',
    });
  };

  // Excel / CSV Export
  const handleExportExcel = () => {
    const dateRangeStr = `${from} to ${to}`;
    let headers = [];
    let csvRows = [];

    if (activeReport === 'client') {
      headers = ['SL No', 'Client Name', 'Company', 'Phone', 'Category', 'Product', 'Serial Number', 'Warranty', 'Next Follow-up', 'Notes'];
      csvRows = rows.map((r, i) => [
        i + 1,
        r.clientName,
        r.company,
        r.phone,
        r.category,
        r.product,
        r.serial,
        r.warranty,
        r.nextDate,
        r.notes,
      ]);
    } else {
      headers = ['SL No', 'Date', 'Time', 'Activity Details', 'Status', 'Notes'];
      csvRows = rows.map((r, i) => [
        i + 1,
        r.date,
        r.time,
        r.activity,
        r.status,
        r.notes,
      ]);
    }

    exportToCsv({
      title: activeDef.label,
      department: 'Sales Department',
      dateRange: dateRangeStr,
      headers,
      rows: csvRows,
    });
  };

  // Native Print
  const handleTriggerPrint = () => {
    triggerPrint(`EPI-UPS-${activeDef.label.replace(/\s+/g, '-')}-${today()}`);
  };

  return (
    <section className="page active space-y-4">
      {/* 1. Report Selector Tab Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 14 }}>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 750, color: '#fff', margin: 0 }}>
            📊 Sales Department Official Reports &amp; Printing System
          </h2>
          <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
            Generate, filter, preview, and print official company records with full letterhead, signatures, and Excel/PDF export
          </div>
        </div>

        {/* 7 Report Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReport(tab.id)}
                className={`btn ${active ? 'btn-primary-highlight' : 'btn-secondary'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  border: active
                    ? '1px solid rgba(26, 115, 232, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Filters & Controls Toolbar */}
      <div className="panel no-print" style={{ padding: '16px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <b style={{ color: '#38bdf8', fontSize: 14 }}>{activeDef.label}</b>
            <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
              {activeDef.desc}
            </span>
          </div>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginRight: 4, textTransform: 'uppercase' }}>
              Presets:
            </span>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('today')}>Today</button>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('yesterday')}>Yesterday</button>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('7days')}>7 Days</button>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('30days')}>30 Days</button>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('thisMonth')}>This Month</button>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('ytd')}>YTD</button>
            <button className="secondary" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setPreset('all')}>All Time</button>
          </div>
        </div>

        <div className="report-toolbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, alignItems: 'end' }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }} />
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }} />
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>Filter Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 12 }}
            >
              <option value="">All Corporate Clients</option>
              {(db.clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company ? `${c.company} (${c.name})` : c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>Search Keyword</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search clients, tasks, serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '6px 10px 6px 30px', fontSize: 12, width: '100%' }}
              />
              <Search size={13} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPreviewMode(!previewMode)}
              style={{ padding: '7px 12px', fontSize: 12.5 }}
              title="Toggle A4 Print Preview"
            >
              <Eye size={13} />
              <span>{previewMode ? 'Live Table' : 'Print Preview'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportExcel}
              style={{ padding: '7px 12px', fontSize: 12.5 }}
              title="Export formatted Excel CSV"
            >
              <FileSpreadsheet size={13} />
              <span>Excel</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportPdf}
              style={{ padding: '7px 12px', fontSize: 12.5 }}
              title="Export PDF Document"
            >
              <Download size={13} />
              <span>PDF</span>
            </button>
            <button
              type="button"
              className="btn btn-primary-highlight"
              onClick={handleTriggerPrint}
              style={{ padding: '7px 14px', fontSize: 12.5 }}
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Summary Metrics Bar */}
      <div className="grid" style={{ marginBottom: 14 }}>
        <div className="stat">
          <b>{totalCount}</b>
          <span>Total Filtered Records</span>
        </div>
        <div className="stat">
          <b style={{ color: '#34d399' }}>{completedCount}</b>
          <span>Completed Activities</span>
        </div>
        <div className="stat">
          <b style={{ color: '#38bdf8' }}>{pendingCount}</b>
          <span>Pending / Scheduled</span>
        </div>
        <div className="stat">
          <b style={{ color: '#f87171' }}>{overdueCount}</b>
          <span>Overdue Action Items</span>
        </div>
      </div>

      {/* 4. Print Preview Card or Editable Table */}
      {previewMode ? (
        <div
          className="panel print-page-container"
          style={{
            background: '#ffffff',
            color: '#0f172a',
            padding: '32px 36px',
            borderRadius: 8,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <PrintHeader
            title={activeDef.label}
            department="SALES DEPARTMENT"
            dateRange={`${fmt(from)} to ${fmt(to)}`}
            subtitle={activeDef.desc}
          />

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: 11, color: '#334155' }}>SL</th>
                <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Date &amp; Time</th>
                {activeReport === 'client' ? (
                  <>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Client / Company</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Contact Info</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Category</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Equipment / Serial</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Next Follow-up</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Activity Description</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Client Organization</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Status</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Notes &amp; Remarks</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r, i) => (
                  <tr key={r.key || i} style={{ borderBottom: '1px solid #e2e8f0', fontSize: 10.5 }}>
                    <td style={{ padding: '6px 6px', color: '#64748b' }}>{i + 1}</td>
                    <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                      {fmt(r.date)} {r.time ? <span style={{ color: '#64748b' }}>· {r.time}</span> : null}
                    </td>
                    {activeReport === 'client' ? (
                      <>
                        <td style={{ padding: '6px 8px' }}>
                          <b>{r.clientName}</b>
                          {r.company && <div style={{ color: '#475569', fontSize: 10 }}>{r.company}</div>}
                        </td>
                        <td style={{ padding: '6px 8px', color: '#334155' }}>{r.phone || '-'}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{ fontWeight: 600, color: '#0052cc' }}>{r.category}</span>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <div>{r.product}</div>
                          {r.serial && r.serial !== 'N/A' && <div style={{ fontSize: 9.5, color: '#64748b' }}>S/N: {r.serial}</div>}
                        </td>
                        <td style={{ padding: '6px 8px', fontWeight: 600, color: r.nextDate ? '#059669' : '#94a3b8' }}>
                          {r.nextDate ? fmt(r.nextDate) : 'None'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '6px 8px', color: '#0f172a' }}>{r.activity}</td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{r.company || r.clientName || 'General Client'}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 9.5,
                              fontWeight: 700,
                              background: isCompleted(r.status) ? '#ecfdf5' : '#fef2f2',
                              color: isCompleted(r.status) ? '#059669' : '#dc2626',
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{r.notes || '-'}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeReport === 'client' ? 7 : 6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                    No records found for the selected period and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <PrintSignatures />
        </div>
      ) : (
        /* Standard Editable View (Preserving inline quick-add & modification capability) */
        <div className="panel">
          <div className="head" style={{ marginBottom: 12 }}>
            <div>
              <h2>
                {activeDef.label} ({rows.length} Records)
              </h2>
              <div className="muted" style={{ fontSize: 12 }}>
                Live database records. Click <b>Print Preview</b> to review official letterhead before printing.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {(activeReport === 'daily' || activeReport === 'monthly') && (
                <button className="secondary" onClick={handleAddNewRow} style={{ padding: '6px 12px', fontSize: 12.5 }}>
                  <Plus size={13} strokeWidth={2.2} /> Add Activity
                </button>
              )}
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 45 }}>SL</th>
                  <th style={{ width: 130 }}>Date</th>
                  <th style={{ width: 100 }}>Time</th>
                  <th>Activity / Client Details</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((r, i) => (
                    <tr
                      key={r.key || i}
                      ref={i === rows.length - 1 ? lastRow : null}
                      style={{
                        background: r.isModified ? 'rgba(245, 158, 11, 0.06)' : undefined,
                        borderLeft: r.isModified ? '3px solid #f59e0b' : undefined,
                      }}
                    >
                      <td style={{ color: '#64748b', fontSize: 11 }}>{i + 1}</td>
                      <td>
                        {r.source === 'manual' || r.source === 'work' || r.source === 'history' ? (
                          <input
                            className="report-edit"
                            type="date"
                            value={r.date}
                            onChange={(e) => editRow(i, 'date', e.target.value)}
                            style={{ width: 120, fontSize: 11.5 }}
                          />
                        ) : (
                          <span style={{ fontSize: 12 }}>{fmt(r.date)}</span>
                        )}
                      </td>
                      <td>
                        {r.source === 'manual' || r.source === 'work' || r.source === 'history' ? (
                          <input
                            className="report-edit"
                            type="text"
                            placeholder="10:00 AM"
                            value={r.time || ''}
                            onChange={(e) => editRow(i, 'time', e.target.value)}
                            style={{ width: 85, fontSize: 11.5 }}
                          />
                        ) : (
                          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{r.time || '-'}</span>
                        )}
                      </td>
                      <td>
                        {r.source === 'manual' || r.source === 'work' || r.source === 'history' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              className="report-edit"
                              type="text"
                              value={r.activity}
                              onChange={(e) => editRow(i, 'activity', e.target.value)}
                              placeholder="Activity / Client details..."
                              style={{ flex: 1, fontSize: 12 }}
                            />
                            {r.notes && (
                              <ExpandableText
                                text={r.notes}
                                title={`Notes for: ${r.activity}`}
                                subtitle={fmt(r.date)}
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            <b style={{ color: '#f1f5f9' }}>{r.activity}</b>
                            {r.notes && (
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                Note: {r.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {r.source === 'manual' || r.source === 'work' || r.source === 'history' ? (
                          <select
                            className="report-edit"
                            value={r.status}
                            onChange={(e) => editRow(i, 'status', e.target.value)}
                            style={{ fontSize: 11.5 }}
                          >
                            <option>Pending</option>
                            <option>Completed</option>
                          </select>
                        ) : (
                          <span
                            className={`badge ${
                              isCompleted(r.status) ? 'done' : r.status?.includes('Overdue') ? 'badge-ruby' : 'badge-planned'
                            }`}
                          >
                            {r.status}
                          </span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {r.source === 'manual' || r.source === 'work' || r.source === 'history' ? (
                          <>
                            <button
                              className="data-edit"
                              style={{
                                background: r.isModified || r.source === 'manual' ? '#059669' : undefined,
                                color: r.isModified || r.source === 'manual' ? '#fff' : undefined,
                                fontWeight: 700,
                              }}
                              onClick={() => handleSaveRow(i)}
                              disabled={r.isSaving}
                              title="Save permanently"
                            >
                              {r.isSaving ? '...' : <><Check size={11} strokeWidth={2.4} /> Save</>}
                            </button>{' '}
                            <button
                              className="data-delete"
                              onClick={() => handleDeleteRow(i)}
                              disabled={r.isSaving}
                              title="Delete permanently"
                            >
                              <Trash2 size={11} strokeWidth={2.2} />
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: '#64748b' }}>DB Linked</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty">
                      No records found for the selected date range ({fmt(from)} to {fmt(to)}).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
