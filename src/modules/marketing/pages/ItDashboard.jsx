import React from 'react';
import {
  Wrench,
  Ticket,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Shield,
  Server,
  Network,
  Users,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function ItDashboard() {
  const { data, openTicketModal, openDeviceModal, openTicketDetails } = useMarketing();
  const navigate = useNavigate();
  const { tickets, devices, softwareAccounts, maintenance } = data;

  const openTickets = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status));
  const resolvedTickets = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High');
  const operationalDevices = devices.filter((d) => d.status === 'Operational');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">IT OPERATIONS & HELPDESK</div>
          <h2>IT Support & Infrastructure Command Dashboard</h2>
          <p>
            Enterprise helpdesk tickets, hardware asset inventory, licensed software, and network uptime monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openDeviceModal()}
            className="btn-mkt-secondary"
          >
            + Register Hardware
          </button>
          <button
            onClick={() => openTicketModal()}
            className="btn-mkt-primary"
          >
            <Plus size={14} />
            <span>Create IT Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="mkt-kpi-grid">
        <div
          onClick={() => navigate('/marketing/tickets')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-header">
            <span className="mkt-stat-label">Active Tickets</span>
            <div className="mkt-stat-icon icon-amber">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mkt-stat-val text-amber-400">{openTickets.length}</div>
          <div className="mkt-stat-sub">
            <span className="text-red-400 font-semibold">{criticalTickets.length} Critical / High</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/marketing/tickets')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-header">
            <span className="mkt-stat-label">Resolved Tickets</span>
            <div className="mkt-stat-icon icon-green">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mkt-stat-val text-emerald-400">{resolvedTickets.length}</div>
          <div className="mkt-stat-sub text-emerald-400">
            {tickets.length > 0
              ? `${Math.round((resolvedTickets.length / tickets.length) * 100)}% Resolution Rate`
              : '0%'}
          </div>
        </div>

        <div
          onClick={() => navigate('/marketing/devices')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-header">
            <span className="mkt-stat-label">Hardware Inventory</span>
            <div className="mkt-stat-icon icon-cyan">
              <Laptop size={16} />
            </div>
          </div>
          <div className="mkt-stat-val text-white">{devices.length}</div>
          <div className="mkt-stat-sub text-cyan-400">{operationalDevices.length} Fully Operational</div>
        </div>

        <div
          onClick={() => navigate('/marketing/software')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-header">
            <span className="mkt-stat-label">Software & Licenses</span>
            <div className="mkt-stat-icon icon-blue">
              <Shield size={16} />
            </div>
          </div>
          <div className="mkt-stat-val text-white">{softwareAccounts.length}</div>
          <div className="mkt-stat-sub text-sky-400">Active License Pools</div>
        </div>
      </div>

      {/* Urgent Tickets Queue */}
      <div className="mkt-card space-y-4">
        <div className="mkt-card-header">
          <div>
            <h2 className="mkt-card-title flex items-center gap-2">
              <Ticket size={16} className="text-amber-400" />
              <span>Active IT Support Ticket Queue</span>
            </h2>
            <p className="mkt-card-desc">Pending issues, technician assignments and priority triage</p>
          </div>
          <button
            onClick={() => navigate('/marketing/tickets')}
            className="btn-glass-action btn-glass-amber"
          >
            All Helpdesk Tickets →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Subject / Issue</th>
                <th className="py-2.5 px-3">Department & User</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tickets.slice(0, 5).map((tick) => (
                <tr key={tick.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">{tick.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white max-w-[240px] truncate">{tick.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Logged {tick.createdDate} at {tick.createdTime}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200">{tick.department}</div>
                    <div className="text-[11px] text-slate-400">{tick.requestingEmployee}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{tick.issueCategory}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`mkt-badge ${
                        tick.priority === 'Critical'
                          ? 'mkt-badge-red'
                          : tick.priority === 'High'
                          ? 'mkt-badge-amber'
                          : 'mkt-badge-blue'
                      }`}
                    >
                      {tick.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">
                    {tick.assignedTechnician || 'Unassigned'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`mkt-badge ${
                        tick.status === 'Resolved' || tick.status === 'Closed'
                          ? 'mkt-badge-green'
                          : tick.status === 'In Progress'
                          ? 'mkt-badge-amber'
                          : 'mkt-badge-blue'
                      }`}
                    >
                      {tick.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => openTicketDetails(tick)}
                      className="btn-mkt-action"
                    >
                      View / Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Hardware Device Distribution & Network Maintenance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Health Overview */}
        <div className="mkt-card space-y-3">
          <div className="mkt-card-header">
            <h2 className="mkt-card-title flex items-center gap-2">
              <Server size={16} className="text-cyan-400" />
              <span>Computer & Network Inventory</span>
            </h2>
            <button
              onClick={() => navigate('/marketing/devices')}
              className="btn-glass-action btn-glass-cyan"
            >
              Manage Inventory →
            </button>
          </div>

          <div className="space-y-2">
            {devices.slice(0, 4).map((dev) => (
              <div
                key={dev.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{dev.deviceTag}</span>
                    <span>{dev.brandModel}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    User: {dev.assignedTo} ({dev.department}) • IP: {dev.ipAddress}
                  </div>
                </div>
                <span
                  className={`mkt-badge ${
                    dev.status === 'Operational'
                      ? 'mkt-badge-green'
                      : 'mkt-badge-amber'
                  }`}
                >
                  {dev.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Log Summary */}
        <div className="mkt-card space-y-3">
          <div className="mkt-card-header">
            <h2 className="mkt-card-title flex items-center gap-2">
              <Network size={16} className="text-emerald-400" />
              <span>Network & Preventive Logs</span>
            </h2>
            <button
              onClick={() => navigate('/marketing/maintenance')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-2">
            {maintenance.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1 text-xs hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{m.type}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                </div>
                <p className="text-[11px] text-slate-300">{m.findings}</p>
                <div className="text-[10px] text-emerald-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>Action: {m.actionTaken}</span>
                  <span>Tech: {m.technician}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
