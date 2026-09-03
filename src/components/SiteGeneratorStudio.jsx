import React, { useState, useEffect } from 'react';
import { ModernServiceTemplate } from './DemoTemplates.jsx';
import { Monitor, Tablet, Smartphone, Download, Send, Sparkles, RefreshCw, Palette, Type, Phone, Layers } from 'lucide-react';

export function SiteGeneratorStudio({ lead, onDemoCreated }) {
  const [device, setDevice] = useState('desktop'); // 'desktop', 'tablet', 'mobile'
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'style', 'services'
  const [saving, setSaving] = useState(false);
  const [exported, setExported] = useState(false);

  const [config, setConfig] = useState({
    hero_headline: lead ? `Top Rated ${lead.category} in ${lead.city}` : 'Quality Local Business Services',
    hero_subheadline: lead ? `Serving ${lead.city} & surrounding areas with 5-star expertise.` : 'Professional services tailored for you.',
    tagline: lead ? `Fast, Reliable & Licensed ${lead.category}` : 'Your Trusted Local Experts',
    primary_color: '#3b82f6',
    accent_color: '#10b981',
    contact_phone: lead?.phone || '(512) 555-0199',
    contact_address: lead ? `${lead.address}, ${lead.city}` : 'Main Street, Austin, TX',
    about_text: lead ? `${lead.name} is a premier ${lead.category.toLowerCase()} business dedicated to fast response times, transparent pricing, and 100% customer satisfaction.` : 'Dedicated local experts.',
    services: [
      { name: 'Emergency Service Response', desc: 'Fast turnaround and immediate dispatch.' },
      { name: 'Full Inspection & Maintenance', desc: 'Preventative care and routine checks.' },
      { name: 'Custom Upgrades & Installations', desc: 'Modern equipment backed by full warranty.' }
    ],
    reviews: [
      { author: 'Sarah M.', text: 'Outstanding work! Arrived on time and solved our issue fast.', rating: 5 },
      { author: 'David K.', text: 'Fair pricing and super friendly service. Highly recommend!', rating: 5 }
    ]
  });

  useEffect(() => {
    if (lead) {
      setConfig(prev => ({
        ...prev,
        hero_headline: `Top Rated ${lead.category} in ${lead.city}`,
        hero_subheadline: `Serving ${lead.city} & surrounding areas with 5-star expertise.`,
        tagline: `Fast, Reliable & Licensed ${lead.category}`,
        contact_phone: lead.phone || '(512) 555-0199',
        contact_address: `${lead.address}, ${lead.city}`,
        about_text: `${lead.name} is a premier ${lead.category.toLowerCase()} business in ${lead.city} dedicated to fast response times and 100% customer satisfaction.`
      }));
    }
  }, [lead?.id]);

  const handleGenerateAndSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch('/api/demos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: lead.id,
          template_used: 'modern_service',
          config
        })
      });
      const data = await res.json();
      setExported(true);
      if (onDemoCreated) onDemoCreated();
    } catch (err) {
      console.error('Save demo error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!lead) {
    return (
      <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
        <h3>No Lead Selected for Site Generator</h3>
        <p style={{ marginTop: '0.5rem' }}>Select any verified lead from your Pipeline Dashboard to launch the Site Generator Studio!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Sidebar Editor Controls */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-blue)" /> Demo Site Studio
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Building for <strong style={{ color: '#fff' }}>{lead.name}</strong>
          </span>
        </div>

        {/* Customization Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(15,23,42,0.8)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'content' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('content')}
          >
            <Type size={14} /> Copy
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'style' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('style')}
          >
            <Palette size={14} /> Colors
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setActiveTab('services')}
          >
            <Layers size={14} /> Services
          </button>
        </div>

        {/* Tab 1: Content */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hero Headline</label>
              <input
                type="text"
                className="form-input"
                value={config.hero_headline}
                onChange={(e) => setConfig({ ...config, hero_headline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero Subheadline</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={config.hero_subheadline}
                onChange={(e) => setConfig({ ...config, hero_subheadline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={config.contact_phone}
                onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Address</label>
              <input
                type="text"
                className="form-input"
                value={config.contact_address}
                onChange={(e) => setConfig({ ...config, contact_address: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Colors */}
        {activeTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Brand Accent</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={config.primary_color}
                  onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Call to Action Accent</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.accent_color}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                  style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={config.accent_color}
                  onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Services */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(config.services || []).map((s, idx) => (
              <div key={idx} style={{ padding: '0.75rem', background: 'rgba(15,23,42,0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginBottom: '0.4rem', fontWeight: 'bold' }}
                  value={s.name}
                  onChange={(e) => {
                    const next = [...config.services];
                    next[idx].name = e.target.value;
                    setConfig({ ...config, services: next });
                  }}
                />
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={s.desc}
                  onChange={(e) => {
                    const next = [...config.services];
                    next[idx].desc = e.target.value;
                    setConfig({ ...config, services: next });
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Save & Publish Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button className="btn btn-success" onClick={handleGenerateAndSave} disabled={saving}>
            <Send size={16} /> {saving ? 'Publishing Demo...' : 'Save & Mark Demo Sent'}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Device Viewport Bar */}
        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Device Frame:</span>
            <button
              className={`btn btn-sm ${device === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDevice('desktop')}
            >
              <Monitor size={16} /> Desktop
            </button>
            <button
              className={`btn btn-sm ${device === 'tablet' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDevice('tablet')}
            >
              <Tablet size={16} /> Tablet
            </button>
            <button
              className={`btn btn-sm ${device === 'mobile' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDevice('mobile')}
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>

          <span className="badge badge-verified">
            Live Preview Mode
          </span>
        </div>

        {/* Canvas Frame Container */}
        <div className={`device-viewport ${device}`}>
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <ModernServiceTemplate config={config} business={lead} />
          </div>
        </div>
      </div>
    </div>
  );
}
