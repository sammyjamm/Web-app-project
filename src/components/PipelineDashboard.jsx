import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Play, ShieldAlert, FileText, Phone, MapPin, 
  Search, Filter, Plus, Calendar, Star, LayoutGrid, List, Sparkles, Globe, Trash2, ExternalLink, Clock
} from 'lucide-react';

export function PipelineDashboard({ onSelectLeadForDemo, onRunVerification }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotesLead, setEditingNotesLead] = useState(null);
  const [notesInput, setNotesInput] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = '/api/leads?';
      if (statusFilter !== 'all') url += `lead_status=${statusFilter}&`;
      if (confidenceFilter !== 'all') url += `confidence_status=${confidenceFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Fetch leads error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, confidenceFilter, searchTerm]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_status: newStatus })
      });
      fetchLeads();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleFlagHasWebsite = async (id) => {
    try {
      await fetch(`/api/leads/${id}/flag_has_website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_url: '' })
      });
      fetchLeads();
    } catch (err) {
      console.error('Flag website error:', err);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Remove this lead from your pipeline?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      fetchLeads();
    } catch (err) {
      console.error('Delete lead error:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!editingNotesLead) return;
    try {
      await fetch(`/api/leads/${editingNotesLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesInput })
      });
      setEditingNotesLead(null);
      fetchLeads();
    } catch (err) {
      console.error('Notes update error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dashboard Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Lead Pipeline & Outreach Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage verified local business prospects, track outreach stages, and generate single-page demo sites.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View Toggle */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.25rem' }}>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              <List size={16} /> Table
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={16} /> Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', width: '100%' }}
            placeholder="Search business name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lead Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="form-label">Pipeline Stage:</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="verified">Verified (Ready for Demo)</option>
            <option value="contacted">Contacted</option>
            <option value="demo_sent">Demo Sent</option>
            <option value="sold">Sold Client 🎉</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="form-label">Verification Status:</label>
          <select
            className="form-select"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="likely_no_website">Likely No Website</option>
            <option value="needs_review">Needs Review</option>
            <option value="has_website">Has Website</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business Name & City</th>
                <th>Category</th>
                <th>Verification</th>
                <th>Pipeline Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No business leads match your search criteria. Try switching filters or search a new city in Discovery!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const mapsUrl = lead.google_maps_url || `https://www.google.com/maps/place/?q=place_id:${lead.google_place_id}`;
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{lead.name}</strong>
                            {lead.is_mock && (
                              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.65rem' }}>
                                ⚠️ TEST DATA - NOT REAL
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.2rem' }}>
                            <span>📍 {lead.address}, {lead.city}</span>
                            {lead.phone && <span>📞 {lead.phone}</span>}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                            >
                              <ExternalLink size={12} /> Google Maps (place_id: {lead.google_place_id})
                            </a>

                            <span style={{ color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={11} /> Fetched: {new Date(lead.fetched_at || lead.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.category}</span>
                      </td>
                      <td>
                        <span className={`badge chip-${lead.confidence_status}`}>
                          {lead.confidence_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    <td>
                      <select
                        className={`form-select badge badge-${lead.lead_status}`}
                        style={{ cursor: 'pointer', outline: 'none' }}
                        value={lead.lead_status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="verified">Verified</option>
                        <option value="contacted">Contacted</option>
                        <option value="demo_sent">Demo Sent</option>
                        <option value="sold">Sold</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <div
                        onClick={() => {
                          setEditingNotesLead(lead);
                          setNotesInput(lead.verification_notes || '');
                        }}
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title="Click to edit notes"
                      >
                        {lead.verification_notes || 'Click to add notes...'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Run automated verification checks"
                          onClick={() => onRunVerification(lead)}
                        >
                          <ShieldAlert size={14} /> Verify
                        </button>
                        
                        <button
                          className="btn btn-primary btn-sm"
                          title="Generate starter demo site"
                          onClick={() => onSelectLeadForDemo(lead)}
                        >
                          <Sparkles size={14} /> Demo Studio
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#fb7185', padding: '0.4rem 0.5rem' }}
                          title="Flag as already having a website (Mark Declined)"
                          onClick={() => handleFlagHasWebsite(lead.id)}
                        >
                          <Globe size={14} /> Has Website
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--accent-rose)', padding: '0.4rem 0.5rem' }}
                          title="Delete lead from pipeline"
                          onClick={() => handleDeleteLead(lead.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {['new', 'verified', 'contacted', 'demo_sent', 'sold'].map((columnStatus) => {
            const columnLeads = leads.filter(l => l.lead_status === columnStatus);
            return (
              <div key={columnStatus} className="card" style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span className={`badge badge-${columnStatus}`} style={{ fontSize: '0.8rem' }}>
                    {columnStatus.replace('_', ' ')} ({columnLeads.length})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, minHeight: '300px' }}>
                  {columnLeads.map((lead) => (
                    <div key={lead.id} className="card" style={{ padding: '0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.35rem' }}>{lead.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        📍 {lead.city} • {lead.category}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className={`badge chip-${lead.confidence_status}`} style={{ fontSize: '0.65rem' }}>
                          {lead.confidence_status.replace(/_/g, ' ')}
                        </span>

                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => onSelectLeadForDemo(lead)}
                        >
                          Demo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Editor Modal */}
      {editingNotesLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Notes for {editingNotesLead.name}</h3>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Verification & Outreach Notes</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Enter client outreach details, phone call findings, or demo feedback..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setEditingNotesLead(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveNotes}>Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
