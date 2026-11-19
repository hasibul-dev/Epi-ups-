import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  Search,
  Download,
  FileText,
  Image,
  Video,
  Archive,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

const CATEGORIES = [
  'All',
  'Datasheets & Catalogs',
  'Product Photos',
  'Social Media Graphics',
  'Branding & Logos',
  'Technical Videos',
];

export default function AssetLibraryPage() {
  const { data, openAssetModal, deleteAsset, isMarketingRole } = useMarketing();
  const { assets } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAssets = assets.filter((a) => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete asset "${title}"?`)) {
      deleteAsset(id);
    }
  };

  const getFormatIcon = (format) => {
    const fmt = format.toUpperCase();
    if (fmt.includes('PNG') || fmt.includes('JPG') || fmt.includes('PSD')) {
      return <Image size={18} className="text-sky-400" />;
    }
    if (fmt.includes('PDF')) {
      return <FileText size={18} className="text-red-400" />;
    }
    if (fmt.includes('MP4') || fmt.includes('VIDEO')) {
      return <Video size={18} className="text-sky-400" />;
    }
    return <Archive size={18} className="text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">DIGITAL ASSETS</div>
          <h2>Marketing Digital Asset Library</h2>
          <p>
            Central repository of product catalogs, 3D machine renders, technical datasheets, and brand files
          </p>
        </div>
        <button
          onClick={() => openAssetModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by title, product tag, format..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No assets found matching your search.
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="mkt-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                      {getFormatIcon(asset.format)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {asset.format}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">{asset.size}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {asset.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{asset.title}</h3>
                  {asset.notes && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{asset.notes}</p>
                  )}
                </div>

                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  By {asset.uploadedBy} • {asset.uploadedAt}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAssetModal(asset)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Asset"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id, asset.title)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
