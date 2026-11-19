import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Save } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

const ASSET_CATEGORIES = [
  'Datasheets & Catalogs',
  'Product Photos',
  'Social Media Graphics',
  'Branding & Logos',
  'Technical Videos',
  'Customer Case Studies',
  'Other',
];

const ASSET_FORMATS = ['PDF', 'PNG', 'JPG', 'PSD / JPG', 'MP4', 'ZIP', 'DOCX', 'AI / EPS'];

export default function AssetModal() {
  const { assetModal, closeAssetModal, saveAsset, user } = useMarketing();
  const { open, item } = assetModal;

  const [form, setForm] = useState({
    title: '',
    category: 'Datasheets & Catalogs',
    format: 'PDF',
    size: '',
    fileUrl: '',
    tags: '',
    notes: '',
    uploadedBy: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        category: item.category || 'Datasheets & Catalogs',
        format: item.format || 'PDF',
        size: item.size || '',
        fileUrl: item.fileUrl || '',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
        notes: item.notes || '',
        uploadedBy: item.uploadedBy || user?.name || 'Marketing Team',
      });
    } else {
      setForm({
        title: '',
        category: 'Datasheets & Catalogs',
        format: 'PDF',
        size: '2.5 MB',
        fileUrl: '/marketing/assets/',
        tags: 'ups, catalog, commercial',
        notes: '',
        uploadedBy: user?.name || 'Marketing Team',
      });
    }
    setError('');
  }, [item, open, user]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Asset title is required');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    saveAsset({
      ...(item ? { id: item.id, uploadedAt: item.uploadedAt } : { uploadedAt: today() }),
      title: form.title.trim(),
      category: form.category,
      format: form.format,
      size: form.size.trim() || '1.0 MB',
      fileUrl: form.fileUrl.trim() || '#',
      tags: tagsArray,
      notes: form.notes.trim(),
      uploadedBy: form.uploadedBy.trim() || user?.name || 'Marketing Executive',
    });
    closeAssetModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeAssetModal}>
      <div className="marketing-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="marketing-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {item ? 'Edit Media Asset' : 'Add Creative Asset to Library'}
              </h3>
              <p className="text-xs text-slate-400">
                Catalog brochures, high-res renders, brand guidelines, and sales collateral
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAssetModal}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="marketing-modal-body space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Asset Title / Document Name *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. EPI 3-Phase Online UPS Technical Product Catalog 2026"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Asset Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Format / Extension
              </label>
              <select
                name="format"
                value={form.format}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {ASSET_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                File Size / Dimensions
              </label>
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="e.g. 14.2 MB or 3840x2160 PNG"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Internal File Path or Download URL
              </label>
              <input
                type="text"
                name="fileUrl"
                value={form.fileUrl}
                onChange={handleChange}
                placeholder="e.g. /docs/EPI-Catalog.pdf or cloud link"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="e.g. catalog, 10kva, online-ups, tender"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Uploaded By / Owner
              </label>
              <input
                type="text"
                name="uploadedBy"
                value={form.uploadedBy}
                onChange={handleChange}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Asset Notes / Usage Guidelines
            </label>
            <textarea
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Official approved catalog for corporate and hospital tenders; contains 2026 price matrix"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeAssetModal}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-medium text-white shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              <Save size={14} />
              {item ? 'Update Asset' : 'Save to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
