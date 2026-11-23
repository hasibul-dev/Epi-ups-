import React, { useState, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Upload,
  Database,
  Calendar,
  CheckSquare,
  Search,
  Eye,
  FileSpreadsheet,
  Target,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, addDays, fmt } from '../../sales/utils/helpers.js';
import { exportToPdf, exportToCsv, triggerPrint } from '../../../services/reportExport.js';
import { PrintHeader, PrintSignatures } from '../../sales/components/PrintHeader.jsx';

const MKT_REPORTS = [
  { id: 'campaign', label: 'Campaign Performance Report', icon: Target, desc: 'B2B ad campaigns, budgets, actual spend, impressions, CTR & cost per lead' },
  { id: 'content', label: 'Social Media Content Report', icon: Share2, desc: 'Editorial content planning, publication schedule, themes & platforms' },
  { id: 'published', label: 'Published Posts Report', icon: FileText, desc: 'Audited log of live published social media content & engagement metrics' },
  { id: 'leads', label: 'Lead Generation Report', icon: Users, desc: 'Industrial UPS lead capture breakdown, source platform & conversion rates' },
  { id: 'activity', label: 'Marketing Activity Report', icon: CheckSquare, desc: 'Department team tasks, creative production requests & asset library usage' },
];

export default function MarketingReportsPage() {
  const { data, exportBackup, importBackup } = useMarketing();
  const { campaigns = [], posts = [], ads = [], tasks = [], creativeRequests = [], systemSettings = {} } = data;

  const [activeReport, setActiveReport] = useState('campaign');
  const [from, setFrom] = useState(addDays(today(), -30));
  const [to, setTo] = useState(today());
  const [platformFilter, setPlatformFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Quick Date Presets
  const setPreset = (preset) => {
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
      `⚠️ WARNING: OVERWRITE MARKETING & IT DATA\n\n` +
      `Importing this backup will OVERWRITE your current records.\n` +
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
        alert('Digital Marketing & IT Support data backup successfully restored!');
      } catch (err) {
        alert(`Failed to restore backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // KPI calculations
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const avgCPL = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  const q = searchQuery.trim().toLowerCase();

  // Filtered rows for current report
  const getFilteredData = () => {
    if (activeReport === 'campaign') {
      return campaigns.filter((c) => {
        if (platformFilter && !c.platforms?.includes(platformFilter)) return false;
        if (q) {
          const match = [c.name, c.focusProduct, c.targetAudience, c.assignedEmployee].filter(Boolean).join(' ').toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      });
    } else if (activeReport === 'content' || activeReport === 'published') {
      return posts.filter((p) => {
        if (activeReport === 'published' && p.status !== 'Published') return false;
        if (platformFilter && p.platform !== platformFilter) return false;
        if (from && p.scheduledDate && p.scheduledDate < from) return false;
        if (to && p.scheduledDate && p.scheduledDate > to) return false;
        if (q) {
          const match = [p.title, p.topic, p.caption, p.platform].filter(Boolean).join(' ').toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      });
    } else if (activeReport === 'leads') {
      return campaigns.map((c) => ({
        campaign: c.name,
        product: c.focusProduct,
        platforms: c.platforms?.join(', '),
        leadTarget: c.leadTarget || 0,
        leadsGenerated: c.leadsGenerated || 0,
        spend: c.spend || 0,
        cpl: c.leadsGenerated > 0 ? Math.round((c.spend || 0) / c.leadsGenerated) : 0,
        status: c.status,
      })).filter((l) => {
        if (q && !String(l.campaign + ' ' + l.product).toLowerCase().includes(q)) return false;
        return true;
      });
    } else {
      // Activity
      return tasks.filter((t) => {
        if (q) {
          const match = [t.title, t.description, t.assignedTo, t.priority, t.status].filter(Boolean).join(' ').toLowerCase();
          if (!match.includes(q)) return false;
        }
        return true;
      });
    }
  };

  const filteredData = getFilteredData();
  const activeDef = MKT_REPORTS.find((r) => r.id === activeReport) || MKT_REPORTS[0];

  // PDF Export
  const handleExportPdf = () => {
    const dateRangeStr = `${fmt(from)} to ${fmt(to)}`;
    let headers = [];
    let pdfRows = [];

    if (activeReport === 'campaign') {
      headers = ['SL', 'Campaign Name', 'Focus Product', 'Platforms', 'Budget (BDT)', 'Spend (BDT)', 'Leads', 'CPL', 'Status'];
      pdfRows = filteredData.map((c, i) => [
        i + 1,
        c.name,
        c.focusProduct || 'Industrial UPS',
        (c.platforms || []).join(', '),
        `Tk ${c.budget?.toLocaleString()}`,
        `Tk ${c.spend?.toLocaleString()}`,
        c.leadsGenerated || 0,
        c.leadsGenerated > 0 ? `Tk ${Math.round(c.spend / c.leadsGenerated)}` : '-',
        c.status || 'Active',
      ]);
    } else if (activeReport === 'content' || activeReport === 'published') {
      headers = ['SL', 'Post Title & Topic', 'Platform', 'Scheduled Date', 'Status', 'Engagement / Reach', 'Author'];
      pdfRows = filteredData.map((p, i) => [
        i + 1,
        p.title || p.topic || 'Social Post',
        p.platform || 'LinkedIn',
        p.scheduledDate ? fmt(p.scheduledDate) : 'N/A',
        p.status || 'Draft',
        p.engagement ? `${p.engagement} interactions` : (p.views ? `${p.views} views` : 'Pending'),
        p.author || 'Marketing Team',
      ]);
    } else if (activeReport === 'leads') {
      headers = ['SL', 'Campaign', 'Focus Solution', 'Platforms', 'Lead Target', 'Actual Leads', 'Spend (BDT)', 'CPL', 'Status'];
      pdfRows = filteredData.map((l, i) => [
        i + 1,
        l.campaign,
        l.product,
        l.platforms,
        l.leadTarget,
        l.leadsGenerated,
        `Tk ${l.spend?.toLocaleString()}`,
        `Tk ${l.cpl}`,
        l.status,
      ]);
    } else {
      headers = ['SL', 'Task Title', 'Assigned To', 'Priority', 'Due Date', 'Status'];
      pdfRows = filteredData.map((t, i) => [
        i + 1,
        t.title,
        t.assignedTo || 'Unassigned',
        t.priority || 'Normal',
        t.dueDate ? fmt(t.dueDate) : 'N/A',
        t.status || 'Pending',
      ]);
    }

    exportToPdf({
      title: activeDef.label,
      department: 'Marketing',
      subtitle: activeDef.desc,
      dateRange: dateRangeStr,
      headers,
      rows: pdfRows,
      summary: {
        'Total Budget': `Tk ${totalBudget.toLocaleString()}`,
        'Total Spend': `Tk ${totalSpend.toLocaleString()}`,
        'Total Leads': `${totalLeads} Leads`,
        'Average CPL': `Tk ${avgCPL}`,
        'Average CTR': `${avgCTR}%`,
      },
      orientation: 'landscape',
    });
  };

  // Excel CSV Export
  const handleExportCsv = () => {
    let headers = [];
    let csvRows = [];

    if (activeReport === 'campaign') {
      headers = ['SL No', 'Campaign Name', 'Focus Product', 'Platforms', 'Budget', 'Spend', 'Leads Generated', 'Impressions', 'Clicks', 'Status'];
      csvRows = filteredData.map((c, i) => [
        i + 1,
        c.name,
        c.focusProduct,
        (c.platforms || []).join('; '),
        c.budget,
        c.spend,
        c.leadsGenerated,
        c.impressions,
        c.clicks,
        c.status,
      ]);
    } else if (activeReport === 'content' || activeReport === 'published') {
      headers = ['SL No', 'Title', 'Platform', 'Scheduled Date', 'Status', 'Caption'];
      csvRows = filteredData.map((p, i) => [
        i + 1,
        p.title || p.topic,
        p.platform,
        p.scheduledDate,
        p.status,
        p.caption,
      ]);
    } else {
      headers = ['SL No', 'Task', 'Assigned To', 'Priority', 'Due Date', 'Status'];
      csvRows = filteredData.map((t, i) => [
        i + 1,
        t.title,
        t.assignedTo,
        t.priority,
        t.dueDate,
        t.status,
      ]);
    }

    exportToCsv({
      title: activeDef.label,
      department: 'Digital Marketing Department',
      dateRange: `${from} to ${to}`,
      headers,
      rows: csvRows,
    });
  };

  const handleTriggerPrint = () => {
    triggerPrint(`EPI-UPS-${activeDef.label.replace(/\s+/g, '-')}-${today()}`);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">PERFORMANCE AUDIT &amp; ANALYTICS</div>
          <h2>Digital Marketing Performance Reports</h2>
          <p>
            Formal company audit of marketing campaigns, B2B lead generation, social media reach &amp; team activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => exportBackup()} className="btn-mkt-secondary" title="Download JSON Backup">
            <Database size={14} className="text-sky-400" />
            <span>Backup</span>
          </button>
          <label className="btn-mkt-secondary cursor-pointer" title="Restore from JSON Backup">
            <Upload size={14} className="text-cyan-400" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* 2. Report Selector Pill Bar */}
      <div className="mkt-card no-print !p-3">
        <div className="flex flex-wrap gap-2">
          {MKT_REPORTS.map((r) => {
            const Icon = r.icon;
            const active = activeReport === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveReport(r.id)}
                className={`mkt-pill-filter ${active ? 'active-purple' : ''}`}
              >
                <Icon size={14} className={active ? 'text-purple-300' : 'text-slate-400'} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Controls Toolbar */}
      <div className="mkt-card no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h4 className="text-sm font-bold text-purple-300 m-0">{activeDef.label}</h4>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              {activeDef.desc}
            </p>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">
              Presets:
            </span>
            <button className="btn-filter" onClick={() => setPreset('today')}>Today</button>
            <button className="btn-filter" onClick={() => setPreset('7days')}>7 Days</button>
            <button className="btn-filter" onClick={() => setPreset('30days')}>30 Days</button>
            <button className="btn-filter" onClick={() => setPreset('thisMonth')}>This Month</button>
            <button className="btn-filter" onClick={() => setPreset('all')}>All Time</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mkt-input text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mkt-input text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Filter Platform</label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="mkt-select text-xs"
            >
              <option value="">All Social &amp; Ad Platforms</option>
              <option value="Facebook">Facebook Page</option>
              <option value="LinkedIn">LinkedIn Company</option>
              <option value="Google Ads">Google Search / Display</option>
              <option value="YouTube">YouTube Video</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaign, product, caption..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mkt-input pl-8 text-xs"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            className="btn-mkt-secondary text-xs !py-1.5 !px-3 !h-auto !min-h-0"
            onClick={() => setPreviewMode(!previewMode)}
            title="Toggle A4 Print Preview"
          >
            <Eye size={13} />
            <span>{previewMode ? 'Live Table' : 'Print Preview'}</span>
          </button>
          <button
            type="button"
            className="btn-mkt-secondary text-xs !py-1.5 !px-3 !h-auto !min-h-0"
            onClick={handleExportCsv}
            title="Export formatted Excel CSV"
          >
            <FileSpreadsheet size={13} className="text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            className="btn-mkt-secondary text-xs !py-1.5 !px-3 !h-auto !min-h-0"
            onClick={handleExportPdf}
            title="Export PDF Document"
          >
            <Download size={13} className="text-purple-400" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            className="btn-mkt-primary text-xs !py-1.5 !px-4 !h-auto !min-h-0"
            onClick={handleTriggerPrint}
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 4. Executive KPI Summary Cards */}
      <div className="mkt-kpi-grid mb-4">
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Allocated Budget</span>
          <span className="mkt-stat-val text-white">৳{totalBudget.toLocaleString()}</span>
          <span className="mkt-stat-sub">Across All Marketing Channels</span>
        </div>
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Actual Spend</span>
          <span className="mkt-stat-val text-purple-400">৳{totalSpend.toLocaleString()}</span>
          <span className="mkt-stat-sub">Audited Commercial Spend</span>
        </div>
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Leads Generated</span>
          <span className="mkt-stat-val text-emerald-400">{totalLeads} Leads</span>
          <span className="mkt-stat-sub">B2B Industrial Inquiries</span>
        </div>
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Average Cost Per Lead (CPL)</span>
          <span className="mkt-stat-val text-sky-400">৳{avgCPL}</span>
          <span className="mkt-stat-sub">Cost Efficiency Index</span>
        </div>
      </div>

      {/* 5. Print Preview or Live Table */}
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
            department="DIGITAL MARKETING DEPARTMENT"
            dateRange={`${fmt(from)} to ${fmt(to)}`}
            subtitle={activeDef.desc}
          />

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: 11, color: '#334155' }}>SL</th>
                {activeReport === 'campaign' ? (
                  <>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Campaign Name</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Focus Solution</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Platforms</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>Budget</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>Actual Spend</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>Leads</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Status</th>
                  </>
                ) : activeReport === 'content' || activeReport === 'published' ? (
                  <>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Post Title &amp; Topic</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Platform</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Scheduled Date</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Status</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Engagement</th>
                  </>
                ) : activeReport === 'leads' ? (
                  <>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Campaign</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Target Product</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>Target Leads</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>Actual Leads</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>Spend</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', fontSize: 11, color: '#334155' }}>CPL</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Task Title</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Assigned To</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Priority</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Due Date</th>
                    <th style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, color: '#334155' }}>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={row.id || i} style={{ borderBottom: '1px solid #e2e8f0', fontSize: 10.5 }}>
                    <td style={{ padding: '6px 6px', color: '#64748b' }}>{i + 1}</td>
                    {activeReport === 'campaign' ? (
                      <>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row.name}</td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{row.focusProduct || 'Industrial UPS'}</td>
                        <td style={{ padding: '6px 8px', color: '#7c3aed', fontWeight: 600 }}>{(row.platforms || []).join(', ')}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>৳{row.budget?.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>৳{row.spend?.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>{row.leadsGenerated || 0}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9.5, fontWeight: 700, background: '#ecfdf5', color: '#059669' }}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    ) : activeReport === 'content' || activeReport === 'published' ? (
                      <>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row.title || row.topic}</td>
                        <td style={{ padding: '6px 8px', color: '#0052cc', fontWeight: 600 }}>{row.platform}</td>
                        <td style={{ padding: '6px 8px' }}>{row.scheduledDate ? fmt(row.scheduledDate) : '-'}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9.5, fontWeight: 700, background: '#f1f5f9', color: '#334155' }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', color: '#059669' }}>{row.engagement || 'Recorded Live'}</td>
                      </>
                    ) : activeReport === 'leads' ? (
                      <>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row.campaign}</td>
                        <td style={{ padding: '6px 8px' }}>{row.product}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{row.leadTarget}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{row.leadsGenerated}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>৳{row.spend?.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#0052cc', fontWeight: 600 }}>৳{row.cpl}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row.title}</td>
                        <td style={{ padding: '6px 8px' }}>{row.assignedTo || 'Unassigned'}</td>
                        <td style={{ padding: '6px 8px' }}>{row.priority}</td>
                        <td style={{ padding: '6px 8px' }}>{row.dueDate ? fmt(row.dueDate) : '-'}</td>
                        <td style={{ padding: '6px 8px' }}>{row.status}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                    No records found for the selected period and criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <PrintSignatures
            roles={['Marketing Executive', 'Head of Digital Marketing', 'Managing Director']}
          />
        </div>
      ) : (
        /* Live Table */
        <div className="mkt-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">SL</th>
                  {activeReport === 'campaign' ? (
                    <>
                      <th className="py-2.5 px-3">Campaign Name</th>
                      <th className="py-2.5 px-3">Platforms</th>
                      <th className="py-2.5 px-3 text-right">Budget</th>
                      <th className="py-2.5 px-3 text-right">Actual Spend</th>
                      <th className="py-2.5 px-3 text-right">Leads</th>
                      <th className="py-2.5 px-3 text-right">Est. CPL</th>
                      <th className="py-2.5 px-3">Status</th>
                    </>
                  ) : activeReport === 'content' || activeReport === 'published' ? (
                    <>
                      <th className="py-2.5 px-3">Post Title</th>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-3">Scheduled Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Reach</th>
                    </>
                  ) : activeReport === 'leads' ? (
                    <>
                      <th className="py-2.5 px-3">Campaign</th>
                      <th className="py-2.5 px-3">Focus Product</th>
                      <th className="py-2.5 px-3 text-right">Target Leads</th>
                      <th className="py-2.5 px-3 text-right">Actual Leads</th>
                      <th className="py-2.5 px-3 text-right">Spend</th>
                      <th className="py-2.5 px-3 text-right">CPL</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-3">Task Title</th>
                      <th className="py-2.5 px-3">Assigned To</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr key={row.id || i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-500">{i + 1}</td>
                      {activeReport === 'campaign' ? (
                        <>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{row.name}</div>
                            <div className="text-[11px] text-slate-400">{row.focusProduct}</div>
                          </td>
                          <td className="py-2.5 px-3 text-purple-300 font-semibold">
                            {(row.platforms || []).join(', ')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            ৳{row.budget?.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-semibold">
                            ৳{row.spend?.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {row.leadsGenerated || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sky-300">
                            ৳{row.leadsGenerated > 0 ? Math.round(row.spend / row.leadsGenerated) : 0}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </>
                      ) : activeReport === 'content' || activeReport === 'published' ? (
                        <>
                          <td className="py-2.5 px-3 font-semibold text-white">{row.title || row.topic}</td>
                          <td className="py-2.5 px-3 text-sky-400">{row.platform}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.scheduledDate ? fmt(row.scheduledDate) : '-'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400">{row.engagement || 'Active'}</td>
                        </>
                      ) : activeReport === 'leads' ? (
                        <>
                          <td className="py-2.5 px-3 font-semibold text-white">{row.campaign}</td>
                          <td className="py-2.5 px-3 text-slate-300">{row.product}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">{row.leadTarget}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{row.leadsGenerated}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-200">৳{row.spend?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-sky-300">৳{row.cpl}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-3 font-semibold text-white">{row.title}</td>
                          <td className="py-2.5 px-3 text-slate-300">{row.assignedTo || 'Unassigned'}</td>
                          <td className="py-2.5 px-3 text-amber-300">{row.priority}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.dueDate ? fmt(row.dueDate) : '-'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No records match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
