import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Users,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

export default function SocialMediaPage() {
  const { data, openPostModal } = useMarketing();
  const { posts, captions } = data;

  const [activeChannel, setActiveChannel] = useState('Facebook');
  const [copiedId, setCopiedId] = useState(null);

  const fbPosts = posts.filter((p) => p.platform === 'Facebook');
  const liPosts = posts.filter((p) => p.platform === 'LinkedIn');

  const channelPosts = activeChannel === 'Facebook' ? fbPosts : liPosts;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">SOCIAL MEDIA OPERATIONS</div>
          <h2>Social Media Page Management (Facebook & LinkedIn)</h2>
          <p>
            Maintain official corporate brand presence, B2B industry outreach, and client inquiry response
          </p>
        </div>
        <button
          onClick={() => openPostModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>New Social Post</span>
        </button>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex items-center gap-2.5 pb-2">
        <button
          onClick={() => setActiveChannel('Facebook')}
          className={`mkt-pill-filter ${activeChannel === 'Facebook' ? 'active-blue' : ''}`}
        >
          <span>Facebook Page: EPI UPS Bangladesh Ltd.</span>
          <span className="mkt-badge mkt-badge-blue !text-[10px] !py-0.5 !px-1.5">
            {fbPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveChannel('LinkedIn')}
          className={`mkt-pill-filter ${activeChannel === 'LinkedIn' ? 'active-purple' : ''}`}
        >
          <span>LinkedIn Corporate: Energy Pac & Industrial UPS</span>
          <span className="mkt-badge mkt-badge-purple !text-[10px] !py-0.5 !px-1.5">
            {liPosts.length}
          </span>
        </button>
      </div>

      {/* Channel Summary Metrics */}
      {activeChannel === 'Facebook' ? (
        <div className="mkt-kpi-grid">
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">Page Followers</div>
            <div className="mkt-stat-val text-white">28,450+</div>
            <div className="mkt-stat-sub text-emerald-400">+340 this month</div>
          </div>
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">Monthly Post Reach</div>
            <div className="mkt-stat-val text-white">62,800</div>
            <div className="mkt-stat-sub text-sky-400">High factory engineer CTR</div>
          </div>
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">Inquiry Response Rate</div>
            <div className="mkt-stat-val text-white">96%</div>
            <div className="mkt-stat-sub text-slate-400">Avg 15 min reply time</div>
          </div>
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">Review Rating</div>
            <div className="mkt-stat-val text-amber-400">4.9 / 5.0</div>
            <div className="mkt-stat-sub text-slate-400">112 verified reviews</div>
          </div>
        </div>
      ) : (
        <div className="mkt-kpi-grid">
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">B2B Company Followers</div>
            <div className="mkt-stat-val text-white">6,240</div>
            <div className="mkt-stat-sub text-purple-400">Chief Engineers & Procurement</div>
          </div>
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">Organic Engagement Rate</div>
            <div className="mkt-stat-val text-white">5.8%</div>
            <div className="mkt-stat-sub text-emerald-400">Industry avg is 2.4%</div>
          </div>
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">Decision Maker Connections</div>
            <div className="mkt-stat-val text-white">1,890</div>
            <div className="mkt-stat-sub text-slate-400">Textile, Pharma & IT Execs</div>
          </div>
          <div className="mkt-stat-card">
            <div className="mkt-stat-label">B2B Tender Inquiries</div>
            <div className="mkt-stat-val text-sky-400">24</div>
            <div className="mkt-stat-sub text-slate-400">Forwarded to Sales CRM</div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Channel Posts & Approved Caption Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts on this channel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              {activeChannel} Publications & Scheduled Queue
            </h2>
            <button
              onClick={() => openPostModal()}
              className="btn-glass-action btn-glass-purple"
            >
              + Create Post
            </button>
          </div>

          <div className="space-y-3">
            {channelPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostModal(post)}
                className="mkt-card cursor-pointer space-y-3 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{post.title}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Schedule: {post.scheduledDate} {post.scheduledTime}</span>
                      <span>•</span>
                      <span>By: <strong className="text-purple-300">{post.assignedEmployee}</strong></span>
                    </div>
                  </div>
                  <span
                    className={`mkt-badge ${
                      post.status === 'Published'
                        ? 'mkt-badge-green'
                        : 'mkt-badge-blue'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5 text-xs text-slate-300 whitespace-pre-line line-clamp-3">
                  {post.content}
                </div>

                {post.hashtags && (
                  <div className="text-[11px] text-purple-300 font-mono">
                    {post.hashtags}
                  </div>
                )}

                {post.status === 'Published' && (
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Reach: <strong className="text-white">{post.reach?.toLocaleString()}</strong></span>
                    <span>Engagement: <strong className="text-purple-300">{post.engagement}</strong></span>
                    <span>Direct Inquiries: <strong className="text-emerald-400">{post.inquiries}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Approved Captions Library */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Approved Captions & Snippets</h2>
          </div>

          <div className="space-y-3">
            {captions.map((cap) => (
              <div
                key={cap.id}
                className="mkt-card space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-purple-300">{cap.title}</span>
                  <button
                    onClick={() => copyToClipboard(cap.text, cap.id)}
                    className="btn-mkt-action"
                    title="Copy text to clipboard"
                  >
                    {copiedId === cap.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                  {cap.text}
                </p>

                <div className="flex flex-wrap gap-1">
                  {cap.tags.map((t) => (
                    <span
                      key={t}
                      className="mkt-badge mkt-badge-purple !text-[10px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
