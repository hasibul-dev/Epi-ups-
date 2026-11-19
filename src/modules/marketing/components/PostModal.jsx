import React, { useState, useEffect } from 'react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { X, Calendar, Save, Share2 } from 'lucide-react';
import { today } from '../../sales/utils/helpers.js';

export default function PostModal() {
  const { postModal, closePostModal, savePost, data } = useMarketing();
  const { open, item } = postModal;

  const [formData, setFormData] = useState({
    title: '',
    platform: 'Facebook',
    campaignId: '',
    contentType: 'Product Spotlight',
    content: '',
    hashtags: '#EPIUPS #PowerBackup #Bangladesh',
    scheduledDate: today(),
    scheduledTime: '11:00',
    assignedEmployee: '',
    status: 'Scheduled',
    assetTitle: '',
    notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({
        title: '',
        platform: 'Facebook',
        campaignId: data.campaigns?.[0]?.id || '',
        contentType: 'Product Spotlight',
        content: '',
        hashtags: '#EPIUPS #PowerBackup #Bangladesh',
        scheduledDate: today(),
        scheduledTime: '11:00',
        assignedEmployee: 'Samia Jahan',
        status: 'Scheduled',
        assetTitle: '',
        notes: '',
      });
    }
  }, [item, open, data.campaigns]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a post title');
      return;
    }
    savePost(formData);
    closePostModal();
  };

  return (
    <div className="mkt-modal-backdrop" onClick={closePostModal}>
      <div className="mkt-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="mkt-modal-header">
          <h3>
            <Share2 size={18} style={{ color: '#38bdf8' }} />
            {item ? 'Edit Social Media Post' : 'Schedule New Post'}
          </h3>
          <button className="mkt-modal-close" onClick={closePostModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mkt-modal-body">
            <div className="mkt-form-group">
              <label className="mkt-form-label">Post Title / Content Hook *</label>
              <input
                className="mkt-form-input"
                placeholder="e.g. EPI 3-Phase Online UPS 10kVA Specification Breakdown & Delivery Notice"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Platform Channel</label>
                <select
                  className="mkt-form-select"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="Facebook">Facebook Page</option>
                  <option value="LinkedIn">LinkedIn B2B Company Page</option>
                  <option value="YouTube">YouTube Channel</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Website Blog">Website Knowledge Base & Blog</option>
                </select>
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Linked Campaign</label>
                <select
                  className="mkt-form-select"
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                >
                  <option value="">-- Independent General Post --</option>
                  {(data.campaigns || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Content Format</label>
                <select
                  className="mkt-form-select"
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                >
                  <option value="Product Spotlight">Product Spotlight</option>
                  <option value="Technical Video">Technical Video</option>
                  <option value="Promotional Banner">Promotional Banner</option>
                  <option value="Customer Testimonial">Customer Testimonial</option>
                  <option value="Industrial Case Study">Industrial Case Study</option>
                  <option value="Maintenance Tips">Maintenance Tips</option>
                </select>
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Publication Status</label>
                <select
                  className="mkt-form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Published">Published (Manually verified)</option>
                </select>
              </div>
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Post Caption & Body Text (Bilingual support)</label>
              <textarea
                className="mkt-form-textarea"
                rows={5}
                placeholder="Write the full post caption, Bengali technical details, customer benefits, hotline phone number..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Hashtags</label>
              <input
                className="mkt-form-input"
                placeholder="#EPIUPS #OnlineUPS #IndustrialPower #Dhaka"
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              />
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Scheduled Date</label>
                <input
                  type="date"
                  className="mkt-form-input"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Scheduled Time</label>
                <input
                  type="time"
                  className="mkt-form-input"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Assigned Copywriter / Designer</label>
                <input
                  className="mkt-form-input"
                  placeholder="e.g. Samia Jahan"
                  value={formData.assignedEmployee}
                  onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Attached Graphic / Media Asset</label>
                <input
                  className="mkt-form-input"
                  placeholder="e.g. EPI-10kVA-Banner-FB-Square.jpg"
                  value={formData.assetTitle}
                  onChange={(e) => setFormData({ ...formData, assetTitle: e.target.value })}
                />
              </div>
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Internal Editorial Notes</label>
              <input
                className="mkt-form-input"
                placeholder="Targeting notes, client approval status..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="mkt-modal-footer">
            <button type="button" className="btn-mkt-secondary" onClick={closePostModal}>
              Cancel
            </button>
            <button type="submit" className="btn-mkt-primary">
              <Save size={14} />
              <span>{item ? 'Save Changes' : 'Schedule Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
