import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Filter,
  Clock,
  Share2,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

const PLATFORMS = ['All', 'Facebook', 'LinkedIn', 'YouTube', 'Instagram'];
const STATUSES = ['All', 'Scheduled', 'Published', 'Draft', 'In Review'];

export default function ContentCalendarPage() {
  const { data, openPostModal, deletePost, isMarketingRole } = useMarketing();
  const { posts } = data;

  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPosts = posts.filter((p) => {
    const matchesPlatform = platformFilter === 'All' || p.platform === platformFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesPlatform && matchesStatus;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete post "${title}"?`)) {
      deletePost(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">EDITORIAL CONTENT</div>
          <h2>Editorial Content Planning & Calendar</h2>
          <p>
            Schedule social posts, technical articles, and promotional creatives with full review workflows
          </p>
        </div>
        <button
          onClick={() => openPostModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>Schedule Post</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Platform:</span>
          <div className="flex flex-wrap gap-1">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  platformFilter === plat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No editorial posts found matching the selected filters.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="mkt-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      post.platform === 'LinkedIn'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : post.platform === 'Facebook'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {post.platform}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      post.status === 'Published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : post.status === 'Scheduled'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white line-clamp-2">{post.title}</h2>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <Clock size={12} className="text-slate-500" />
                    <span>
                      {post.scheduledDate} at {post.scheduledTime}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 font-sans line-clamp-4 whitespace-pre-line">
                  {post.content}
                </div>

                {post.hashtags && (
                  <div className="text-[11px] text-sky-400 font-mono line-clamp-1">
                    {post.hashtags}
                  </div>
                )}
              </div>

              {/* Footer info & actions */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                {post.status === 'Published' && (
                  <div className="grid grid-cols-3 gap-2 text-center py-1.5 px-2 rounded-lg bg-slate-800/60 text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px]">Reach</div>
                      <div className="font-semibold text-white">{post.reach?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Engagement</div>
                      <div className="font-semibold text-sky-300">{post.engagement}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Inquiries</div>
                      <div className="font-semibold text-emerald-400">{post.inquiries}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    By: <strong className="text-slate-300">{post.assignedEmployee}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openPostModal(post)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
