import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Check,
  Trash2,
  X,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

export default function MarketingNotificationsDrawer({ isOpen, onClose }) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    openTaskModal,
    data,
    user,
  } = useMarketing();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  if (!isOpen) return null;

  const filteredList = (notifications || []).filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleOpenTask = (taskId) => {
    const task = (data.marketingTasks || []).find((t) => t.id === taskId);
    if (task) {
      openTaskModal(task);
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <UserCheck size={16} className="text-purple-400" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'overdue':
        return <AlertTriangle size={16} className="text-rose-400" />;
      case 'update':
      default:
        return <Clock size={16} className="text-sky-400" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'assignment':
        return <span className="mkt-badge mkt-badge-purple">Assignment</span>;
      case 'completed':
        return <span className="mkt-badge mkt-badge-emerald">Completed</span>;
      case 'overdue':
        return <span className="mkt-badge mkt-badge-red">Overdue Alert</span>;
      case 'update':
      default:
        return <span className="mkt-badge mkt-badge-blue">Deadline Updated</span>;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0a0f1d] border border-purple-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(168,85,247,0.2)] flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/30 via-slate-900 to-sky-950/20">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Work Notifications</h3>
              <p className="text-[11px] text-slate-400">
                Live task assignments, updates & alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter & Actions Bar */}
        <div className="px-4 py-2.5 bg-slate-900/50 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <Check size={12} />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => clearAllNotifications()}
                className="text-[11px] font-semibold text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <CheckCircle2 size={32} className="text-slate-600" />
              <span>No notifications in this view</span>
            </div>
          ) : (
            filteredList.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl transition-all flex items-start gap-3 ${
                  n.read
                    ? 'bg-slate-900/30 hover:bg-slate-900/60 opacity-80'
                    : 'bg-purple-950/25 border border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="mt-1 p-2 rounded-lg bg-slate-800/80 border border-white/5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(n.type)}
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium leading-relaxed mb-1.5">
                    {n.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      {n.sender && (
                        <span>From: <strong className="text-slate-300">{n.sender}</strong></span>
                      )}
                      {n.dueDate && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar size={11} className="text-slate-500" />
                          {n.dueDate} {n.dueTime || ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {n.taskId && (
                        <button
                          onClick={() => handleOpenTask(n.taskId)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 flex items-center gap-1"
                        >
                          <span>Open Task</span>
                          <ExternalLink size={10} />
                        </button>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="p-1 text-slate-400 hover:text-purple-300"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/60 border-t border-white/5 text-center text-[11px] text-slate-500">
          EPI Unified Notification Engine • Synchronized with Storage
        </div>
      </div>
    </div>
  );
}
