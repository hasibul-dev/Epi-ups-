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
            className="mkt-input pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`mkt-pill-filter ${selectedCategory === cat ? 'active-purple' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full mkt-card p-8 text-center text-slate-400 text-xs">
            No assets found matching your search.
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="mkt-card flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-white/10 flex items-center justify-center">
                      {getFormatIcon(asset.format)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {asset.format}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">{asset.size}</span>
                    </div>
                  </div>

                  <span className="mkt-badge mkt-badge-purple">
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
                        className="mkt-badge mkt-badge-neutral !text-[10px] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  By <strong className="text-purple-300">{asset.uploadedBy}</strong> • {asset.uploadedAt}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAssetModal(asset)}
                    className="btn-mkt-action btn-mkt-edit"
                    title="Edit Asset"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id, asset.title)}
                    className="btn-mkt-action btn-mkt-delete"
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
