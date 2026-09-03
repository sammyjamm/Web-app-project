import React, { useState } from 'react';
import { Search, PlusCircle, CheckCircle, AlertTriangle, Building, Globe, MapPin, Phone, Star } from 'lucide-react';

export function DiscoveryModule({ onLeadsImported }) {
  const [city, setCity] = useState('Austin, TX');
  const [category, setCategory] = useState('Plumber');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [importedStatus, setImportedStatus] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImportedStatus(null);
    try {
      const res = await fetch(`/api/places/search?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`);
      const data = await res.json();
      setResults(data.results || []);
      
      // Auto select items missing website
      const autoSelected = new Set(
        (data.results || [])
          .filter(item => !item.google_website_field)
          .map(item => item.google_place_id)
      );
      setSelectedIds(autoSelected);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkImport = async () => {
    const toImport = results.filter(r => selectedIds.has(r.google_place_id));
    if (toImport.length === 0) return;

    try {
      const res = await fetch('/api/places/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: toImport })
      });
      const data = await res.json();
      setImportedStatus(`Successfully imported ${data.count} leads to your pipeline!`);
      if (onLeadsImported) onLeadsImported();
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Search Header Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={22} color="var(--accent-blue)" /> Discover Local Businesses Missing Websites
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Search any city and category. Google Places results will be analyzed to detect missing website links.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">City / Region</label>
            <input
              type="text"
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Austin, TX"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Plumber">Plumber</option>
              <option value="Bakery">Bakery</option>
              <option value="Auto Repair">Auto Repair</option>
              <option value="Electrician">Electrician</option>
              <option value="HVAC">HVAC / Air Conditioning</option>
              <option value="Landscaper">Landscaper</option>
              <option value="Dentist">Dentist</option>
              <option value="Coffee Shop">Coffee Shop / Cafe</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
            {loading ? 'Searching Places...' : 'Find Businesses'}
          </button>
        </form>
      </div>

      {/* Notification Banner */}
      {importedStatus && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '600'
        }}>
          <CheckCircle size={20} /> {importedStatus}
        </div>
      )}

      {/* Results Header Actions */}
      {results.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Discovered Places ({results.length})</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {results.filter(r => !r.google_website_field).length} marked as missing website in Places API.
            </span>
          </div>

          <button
            onClick={handleBulkImport}
            disabled={selectedIds.size === 0}
            className="btn btn-success"
          >
            <PlusCircle size={18} /> Import {selectedIds.size} Selected Leads
          </button>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid-2">
        {results.map((item) => {
          const isMissingWebsite = !item.google_website_field;
          const isChecked = selectedIds.has(item.google_place_id);

          return (
            <div
              key={item.google_place_id}
              className="card"
              style={{
                borderColor: isChecked ? 'var(--accent-blue)' : 'var(--border-color)',
                background: isChecked ? 'rgba(30, 41, 59, 0.95)' : 'var(--bg-card)',
                cursor: 'pointer'
              }}
              onClick={() => toggleSelect(item.google_place_id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{item.category} • {item.city}</span>
                  </div>
                </div>

                {isMissingWebsite ? (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <AlertTriangle size={12} /> No Website
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
                    <Globe size={12} /> Website Exists
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} color="var(--accent-blue)" /> {item.address}
                </div>
                {item.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="var(--accent-emerald)" /> {item.phone}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={14} color="var(--accent-amber)" fill="var(--accent-amber)" />
                  <strong style={{ color: '#fff' }}>{item.rating}</strong> ({item.review_count} ratings)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
