import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  DollarSign,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function MarketingReportsPage() {
  const { data } = useMarketing();
  const { campaigns, posts, ads, systemSettings } = data;
  const printRef = useRef();

  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);

  const avgCPL = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'Campaign Name,Status,Platforms,Budget,Spend,Leads Generated,Lead Target,Impressions,Clicks,Assigned\n';
    campaigns.forEach((c) => {
      csv += `"${c.name}","${c.status}","${c.platforms.join('; ')}",${c.budget},${c.spend},${c.leadsGenerated},${c.leadTarget},${c.impressions},${c.clicks},"${c.assignedEmployee}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EPI-Marketing-Performance-Report-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="text-purple-400" size={20} />
            Marketing Analytics & Performance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Executive audit of campaign ROI, B2B lead generation efficiency, and social engagement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div ref={printRef} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4">
          <div>
            <div className="text-lg font-bold text-white">{systemSettings.companyName}</div>
            <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider mt-0.5">
              {systemSettings.departmentName} — Executive Performance Report
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 mt-2 sm:mt-0">
            <div>Generated: {today()}</div>
            <div>Prepared by: {systemSettings.marketingLead}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Total Budget Allocated</div>
            <div className="text-xl font-bold text-white mt-1">৳{totalBudget.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Actual Spend: ৳{totalSpend.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Total Leads Generated</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{totalLeads} Leads</div>
            <div className="text-[11px] text-slate-400 mt-1">Average CPL: ৳{avgCPL}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Total Impressions</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">{totalImpressions.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Clicks: {totalClicks.toLocaleString()}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-[11px] text-slate-400">Average Click-Through Rate</div>
            <div className="text-xl font-bold text-purple-400 mt-1">{avgCTR}%</div>
            <div className="text-[11px] text-emerald-400 mt-1">Above B2B industry average</div>
          </div>
        </div>

        {/* Detailed Campaigns Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white">Campaign Details & Financial Auditing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Platforms</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3 text-right">Budget</th>
                  <th className="py-2.5 px-3 text-right">Spend</th>
                  <th className="py-2.5 px-3 text-right">Leads</th>
                  <th className="py-2.5 px-3 text-right">Est. CPL</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {campaigns.map((camp) => {
                  const cpl = camp.leadsGenerated > 0 ? Math.round(camp.spend / camp.leadsGenerated) : 0;
                  return (
                    <tr key={camp.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{camp.name}</div>
                        <div className="text-[11px] text-slate-400">{camp.focusProduct}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{camp.platforms.join(', ')}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {camp.startDate} to {camp.endDate}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        ৳{camp.budget?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-semibold">
                        ৳{camp.spend?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {camp.leadsGenerated}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-300">
                        ৳{cpl}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            camp.status === 'Active'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Publishing Summary */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white">Social Media Outreach & Inquiry Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="text-xs font-semibold text-blue-400">Facebook Channel Performance</div>
              <p className="text-xs text-slate-300">
                Total 4 publications this period. High engagement from factory engineers and maintenance officers in Gazipur and Savar. Over 28,450 page followers with a 96% inquiry response rate.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="text-xs font-semibold text-sky-400">LinkedIn Corporate Channel</div>
              <p className="text-xs text-slate-300">
                Direct engagement from plant directors, electrical leads, and textile operations heads. 5.8% organic engagement rate, generating 24 direct tender and quotation leads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
