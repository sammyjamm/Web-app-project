import React, { useState, useEffect } from 'react';
import { Key, Save, CheckCircle, X } from 'lucide-react';

export function SettingsModal({ onClose }) {
  const [googlePlacesKey, setGooglePlacesKey] = useState('');
  const [customSearchKey, setCustomSearchKey] = useState('');
  const [customSearchCx, setCustomSearchCx] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setGooglePlacesKey(data.google_places_api_key || '');
        setCustomSearchKey(data.custom_search_api_key || '');
        setCustomSearchCx(data.custom_search_cx || '');
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_places_api_key: googlePlacesKey,
          custom_search_api_key: customSearchKey,
          custom_search_cx: customSearchCx
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Key size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>API & Integration Settings</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Leave blank to use the built-in realistic place discovery and verification engine out-of-the-box. Add keys to execute live Google Places API queries.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Google Places API Key</label>
            <input
              type="password"
              className="form-input"
              value={googlePlacesKey}
              onChange={(e) => setGooglePlacesKey(e.target.value)}
              placeholder="AIzaSy..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Google Custom Search API Key (Optional)</label>
            <input
              type="password"
              className="form-input"
              value={customSearchKey}
              onChange={(e) => setCustomSearchKey(e.target.value)}
              placeholder="AIzaSy..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Search Engine ID (CX) (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={customSearchCx}
              onChange={(e) => setCustomSearchCx(e.target.value)}
              placeholder="0123456789..."
            />
          </div>

          {saved && (
            <div style={{ color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} /> API Settings Saved Successfully!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
