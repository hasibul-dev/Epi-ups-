import React, { useState, useEffect } from 'react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { X, Target, Save } from 'lucide-react';
import { today, addDays } from '../../sales/utils/helpers.js';

export default function CampaignModal() {
  const { campaignModal, closeCampaignModal, saveCampaign } = useMarketing();
  const { open, item } = campaignModal;

  const [formData, setFormData] = useState({
    name: '',
    objective: 'Lead Generation',
    platforms: ['Facebook', 'LinkedIn'],
    targetAudience: '',
    startDate: today(),
    endDate: addDays(today(), 30),
    budget: 50000,
    spend: 0,
    leadTarget: 100,
    leadsGenerated: 0,
    impressions: 0,
    clicks: 0,
    assignedEmployee: '',
    status: 'Planning',
    focusProduct: '',
    notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        platforms: Array.isArray(item.platforms) ? item.platforms : ['Facebook'],
      });
    } else {
      setFormData({
        name: '',
        objective: 'Lead Generation',
        platforms: ['Facebook', 'LinkedIn'],
        targetAudience: 'RMG, Garments, Healthcare & Corporate Offices',
        startDate: today(),
        endDate: addDays(today(), 30),
        budget: 50000,
        spend: 0,
        leadTarget: 100,
        leadsGenerated: 0,
        impressions: 0,
        clicks: 0,
        assignedEmployee: 'Tanvir Ahmed',
        status: 'Active',
        focusProduct: 'EPI 10kVA - 40kVA Online UPS (EPI-OL10K-31)',
        notes: '',
      });
    }
  }, [item, open]);

  if (!open) return null;

  const togglePlatform = (p) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    saveCampaign({
      ...formData,
      budget: Number(formData.budget) || 0,
      spend: Number(formData.spend) || 0,
      leadTarget: Number(formData.leadTarget) || 0,
      leadsGenerated: Number(formData.leadsGenerated) || 0,
      impressions: Number(formData.impressions) || 0,
      clicks: Number(formData.clicks) || 0,
    });
    closeCampaignModal();
  };

  return (
    <div className="mkt-modal-backdrop" onClick={closeCampaignModal}>
      <div className="mkt-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="mkt-modal-header">
          <h3>
            <Target size={18} style={{ color: '#38bdf8' }} />
            {item ? 'Edit Marketing Campaign' : 'Create New Marketing Campaign'}
          </h3>
          <button className="mkt-modal-close" onClick={closeCampaignModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mkt-modal-body">
            <div className="mkt-form-group">
              <label className="mkt-form-label">Campaign Name *</label>
              <input
                className="mkt-form-input"
                placeholder="e.g. EPI Industrial Online UPS Summer Shield 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Objective</label>
                <select
                  className="mkt-form-select"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                >
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Brand Awareness & Inquiries">Brand Awareness & Inquiries</option>
                  <option value="Direct B2B Sales">Direct B2B Sales</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Festive Promo">Festive Promo</option>
                </select>
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Campaign Status</label>
                <select
                  className="mkt-form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Target Channels / Platforms</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Facebook', 'LinkedIn', 'YouTube', 'Google Ads', 'Email'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`btn-mkt-secondary ${formData.platforms.includes(p) ? 'active-mkt' : ''}`}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      borderColor: formData.platforms.includes(p) ? '#38bdf8' : undefined,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Target Audience / Industries</label>
              <input
                className="mkt-form-input"
                placeholder="e.g. Textile Mills, Garments, Diagnostic Centers in Dhaka & Gazipur"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Start Date</label>
                <input
                  type="date"
                  className="mkt-form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">End Date</label>
                <input
                  type="date"
                  className="mkt-form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Total Budget (BDT)</label>
                <input
                  type="number"
                  className="mkt-form-input"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Spend To Date (BDT)</label>
                <input
                  type="number"
                  className="mkt-form-input"
                  value={formData.spend}
                  onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                />
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Lead Target</label>
                <input
                  type="number"
                  className="mkt-form-input"
                  value={formData.leadTarget}
                  onChange={(e) => setFormData({ ...formData, leadTarget: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Leads Generated</label>
                <input
                  type="number"
                  className="mkt-form-input"
                  value={formData.leadsGenerated}
                  onChange={(e) => setFormData({ ...formData, leadsGenerated: e.target.value })}
                />
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Campaign Lead / Assigned Specialist</label>
                <input
                  className="mkt-form-input"
                  placeholder="e.g. Tanvir Ahmed"
                  value={formData.assignedEmployee}
                  onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Focus Equipment / Model</label>
                <input
                  className="mkt-form-input"
                  placeholder="e.g. EPI-OL10K 10kVA Online UPS"
                  value={formData.focusProduct}
                  onChange={(e) => setFormData({ ...formData, focusProduct: e.target.value })}
                />
              </div>
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Strategy Notes & Key Value Propositions</label>
              <textarea
                className="mkt-form-textarea"
                rows={3}
                placeholder="Key selling points, promotional offer, VAT 15% invoice, on-site commissioning warranty..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="mkt-modal-footer">
            <button type="button" className="btn-mkt-secondary" onClick={closeCampaignModal}>
              Cancel
            </button>
            <button type="submit" className="btn-mkt-primary">
              <Save size={14} />
              <span>{item ? 'Save Changes' : 'Create Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
