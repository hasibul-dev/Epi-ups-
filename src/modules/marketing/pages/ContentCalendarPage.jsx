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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Platform:</span>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`mkt-pill-filter ${platformFilter === plat ? 'active-purple' : ''}`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mkt-select !w-auto text-xs !py-1.5 !px-3"
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
          <div className="col-span-full mkt-card p-8 text-center text-slate-400 text-xs">
            No editorial posts found matching the selected filters.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="mkt-card flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="space-y-3">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`mkt-badge ${
                      post.platform === 'LinkedIn'
                        ? 'mkt-badge-purple'
                        : post.platform === 'Facebook'
                        ? 'mkt-badge-blue'
                        : 'mkt-badge-red'
                    }`}
                  >
                    {post.platform}
                  </span>

                  <span
                    className={`mkt-badge ${
                      post.status === 'Published'
                        ? 'mkt-badge-green'
                        : post.status === 'Scheduled'
                        ? 'mkt-badge-blue'
                        : 'mkt-badge-neutral'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white line-clamp-2">{post.title}</h2>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <Clock size={12} className="text-purple-400" />
                    <span>
                      {post.scheduledDate} at {post.scheduledTime}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5 text-xs text-slate-300 font-sans line-clamp-4 whitespace-pre-line">
                  {post.content}
                </div>

                {post.hashtags && (
                  <div className="text-[11px] text-purple-300 font-mono line-clamp-1">
                    {post.hashtags}
                  </div>
                )}
              </div>

              {/* Footer info & actions */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                {post.status === 'Published' && (
                  <div className="grid grid-cols-3 gap-2 text-center py-1.5 px-2 rounded-lg bg-slate-900/70 border border-white/5 text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px]">Reach</div>
                      <div className="font-semibold text-white">{post.reach?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Engagement</div>
                      <div className="font-semibold text-purple-300">{post.engagement}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Inquiries</div>
                      <div className="font-semibold text-emerald-400">{post.inquiries}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    By: <strong className="text-purple-300">{post.assignedEmployee}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openPostModal(post)}
                      className="btn-mkt-secondary !py-1 !px-2.5 !h-auto !min-h-0 text-xs flex items-center gap-1"
                    >
                      <Edit2 size={12} className="text-purple-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="btn-mkt-action btn-mkt-delete"
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
