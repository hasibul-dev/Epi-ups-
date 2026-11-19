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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="text-amber-400" size={20} />
            IT Support & Infrastructure Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise helpdesk tickets, hardware asset inventory, licensed software, and network uptime monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openDeviceModal()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            + Register Hardware
          </button>
          <button
            onClick={() => openTicketModal()}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Create IT Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/marketing/tickets')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Active Tickets</span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{openTickets.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-red-400 font-semibold">{criticalTickets.length} Critical / High</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/marketing/tickets')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Resolved Tickets</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{resolvedTickets.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {tickets.length > 0
              ? `${Math.round((resolvedTickets.length / tickets.length) * 100)}% Resolution Rate`
              : '0%'}
          </div>
        </div>

        <div
          onClick={() => navigate('/marketing/devices')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Hardware Inventory</span>
            <Laptop size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{devices.length}</div>
          <div className="text-[11px] text-cyan-400 mt-1">{operationalDevices.length} Fully Operational</div>
        </div>

        <div
          onClick={() => navigate('/marketing/software')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Software & Licenses</span>
            <Shield size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{softwareAccounts.length}</div>
          <div className="text-[11px] text-purple-400 mt-1">Active License Pools</div>
        </div>
      </div>

      {/* Urgent Tickets Queue */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Active IT Support Ticket Queue</h2>
          </div>
          <button
            onClick={() => navigate('/marketing/tickets')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
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
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tick.priority === 'Critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : tick.priority === 'High'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-300'
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
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => openTicketDetails(tick)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
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
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server size={16} className="text-cyan-400" />
              Computer & Network Inventory Breakdown
            </h2>
            <button
              onClick={() => navigate('/marketing/devices')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Manage Inventory →
            </button>
          </div>

          <div className="space-y-2">
            {devices.slice(0, 4).map((dev) => (
              <div
                key={dev.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="font-mono text-cyan-400">{dev.deviceTag}</span>
                    <span>{dev.brandModel}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    User: {dev.assignedTo} ({dev.department}) • IP: {dev.ipAddress}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    dev.status === 'Operational'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {dev.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Log Summary */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Network size={16} className="text-emerald-400" />
              Network & Preventive Maintenance Logs
            </h2>
            <button
              onClick={() => navigate('/marketing/maintenance')}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-2">
            {maintenance.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{m.type}</span>
                  <span className="text-[10px] text-slate-400">{m.date}</span>
                </div>
                <p className="text-[11px] text-slate-300">{m.findings}</p>
                <div className="text-[10px] text-emerald-400 flex items-center justify-between pt-1 border-t border-slate-700/40">
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
