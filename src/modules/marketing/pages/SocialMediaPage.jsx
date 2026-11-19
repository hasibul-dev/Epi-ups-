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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="text-purple-400" size={20} />
            Social Media Page Management (Facebook & LinkedIn)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain official corporate brand presence, B2B industry outreach, and client inquiry response
          </p>
        </div>
        <button
          onClick={() => openPostModal()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Social Post</span>
        </button>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveChannel('Facebook')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeChannel === 'Facebook'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Facebook Page: EPI UPS Bangladesh Ltd.</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[10px]">
            {fbPosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveChannel('LinkedIn')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeChannel === 'LinkedIn'
              ? 'bg-sky-600/20 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>LinkedIn Corporate: Energy Pac & Industrial UPS</span>
          <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-[10px]">
            {liPosts.length}
          </span>
        </button>
      </div>

      {/* Channel Summary Metrics */}
      {activeChannel === 'Facebook' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Page Followers</div>
            <div className="text-xl font-bold text-white">28,450+</div>
            <div className="text-[11px] text-emerald-400 mt-1">+340 this month</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Monthly Post Reach</div>
            <div className="text-xl font-bold text-white">62,800</div>
            <div className="text-[11px] text-blue-400 mt-1">High factory engineer CTR</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Inquiry Response Rate</div>
            <div className="text-xl font-bold text-white">96%</div>
            <div className="text-[11px] text-slate-400 mt-1">Avg 15 min reply time</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Review Rating</div>
            <div className="text-xl font-bold text-amber-400">4.9 / 5.0</div>
            <div className="text-[11px] text-slate-400 mt-1">112 verified reviews</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">B2B Company Followers</div>
            <div className="text-xl font-bold text-white">6,240</div>
            <div className="text-[11px] text-sky-400 mt-1">Chief Engineers & Procurement</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Organic Engagement Rate</div>
            <div className="text-xl font-bold text-white">5.8%</div>
            <div className="text-[11px] text-emerald-400 mt-1">Industry avg is 2.4%</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Decision Maker Connections</div>
            <div className="text-xl font-bold text-white">1,890</div>
            <div className="text-[11px] text-slate-400 mt-1">Textile, Pharma & IT Execs</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">B2B Tender Inquiries</div>
            <div className="text-xl font-bold text-purple-400">24</div>
            <div className="text-[11px] text-slate-400 mt-1">Forwarded to Sales CRM</div>
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
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              + Create Post
            </button>
          </div>

          <div className="space-y-3">
            {channelPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostModal(post)}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{post.title}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Schedule: {post.scheduledDate} {post.scheduledTime}</span>
                      <span>•</span>
                      <span>By: {post.assignedEmployee}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                      post.status === 'Published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 text-xs text-slate-300 whitespace-pre-line line-clamp-3">
                  {post.content}
                </div>

                {post.hashtags && (
                  <div className="text-[11px] text-purple-400 font-mono">
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
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-purple-300">{cap.title}</span>
                  <button
                    onClick={() => copyToClipboard(cap.text, cap.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy text to clipboard"
                  >
                    {copiedId === cap.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                  {cap.text}
                </p>

                <div className="flex flex-wrap gap-1">
                  {cap.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400"
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
