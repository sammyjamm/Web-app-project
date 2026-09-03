import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Globe, Share2, CheckCircle2, XCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

export function VerificationRunner({ lead, onClose, onVerificationComplete }) {
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const [finalResult, setFinalResult] = useState(null);

  const startVerification = async () => {
    setRunning(true);
    setStepIndex(1);
    setLogs([{ stage: 1, type: 'web_search', text: `Initiating Stage 1: Web Search for "${lead.name}" in ${lead.city}...` }]);

    try {
      // Simulate step delays for clear visual feedback
      await new Promise(r => setTimeout(r, 800));
      setStepIndex(2);
      setLogs(prev => [...prev, { stage: 2, type: 'social_bio', text: `Initiating Stage 2: Social Media Bio & Profile Link inspection...` }]);

      await new Promise(r => setTimeout(r, 800));
      setStepIndex(3);
      setLogs(prev => [...prev, { stage: 3, type: 'domain_guess', text: `Initiating Stage 3: Testing HTTP HEAD on candidate domain patterns...` }]);

      await new Promise(r => setTimeout(r, 600));
      const res = await fetch(`/api/leads/${lead.id}/verify`, { method: 'POST' });
      const data = await res.json();

      setFinalResult(data.result);
      setStepIndex(4);
      if (onVerificationComplete) onVerificationComplete();
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    startVerification();
  }, [lead.id]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Automated Lead Verification</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.name} • {lead.city}</span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Verification Progress Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {/* Step 1 */}
          <div className="card" style={{
            padding: '1rem',
            background: stepIndex >= 1 ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
            borderColor: stepIndex === 1 ? 'var(--accent-blue)' : 'var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={18} color="var(--accent-blue)" />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>1. Web Search Check</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inspects search results for domain ownership vs directories</p>
                </div>
              </div>
              {stepIndex > 1 ? <CheckCircle2 size={20} color="var(--accent-emerald)" /> : stepIndex === 1 ? <RefreshCw size={18} className="spin" color="var(--accent-blue)" /> : <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pending</span>}
            </div>
          </div>

          {/* Step 2 */}
          <div className="card" style={{
            padding: '1rem',
            background: stepIndex >= 2 ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
            borderColor: stepIndex === 2 ? 'var(--accent-blue)' : 'var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Share2 size={18} color="var(--accent-purple)" />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>2. Social Bio Check</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Checks Facebook & Instagram profile links</p>
                </div>
              </div>
              {stepIndex > 2 ? <CheckCircle2 size={20} color="var(--accent-emerald)" /> : stepIndex === 2 ? <RefreshCw size={18} className="spin" color="var(--accent-blue)" /> : <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pending</span>}
            </div>
          </div>

          {/* Step 3 */}
          <div className="card" style={{
            padding: '1rem',
            background: stepIndex >= 3 ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
            borderColor: stepIndex === 3 ? 'var(--accent-blue)' : 'var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Globe size={18} color="var(--accent-amber)" />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>3. Domain Pattern Pings</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tests common HTTP HEAD domain resolutions</p>
                </div>
              </div>
              {stepIndex > 3 ? <CheckCircle2 size={20} color="var(--accent-emerald)" /> : stepIndex === 3 ? <RefreshCw size={18} className="spin" color="var(--accent-blue)" /> : <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pending</span>}
            </div>
          </div>
        </div>

        {/* Final Conclusion Box */}
        {stepIndex === 4 && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: finalResult?.status === 'likely_no_website' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${finalResult?.status === 'likely_no_website' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: finalResult?.status === 'likely_no_website' ? '#34d399' : '#fbbf24', fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {finalResult?.status === 'likely_no_website' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {finalResult?.status === 'likely_no_website' ? 'CONFIRMED: Likely No Website (High Quality Lead)' : 'Needs Review / Website Detected'}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              All 3 automated checks completed. This business has been updated in your lead database.
            </p>
          </div>
        )}

        {/* Audit Log Box */}
        <div style={{ background: '#090d16', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'monospace', color: '#94a3b8', maxHeight: '180px', overflowY: 'auto' }}>
          <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Audit Trail Logs:</div>
          {logs.map((l, i) => (
            <div key={i} style={{ marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--accent-blue)' }}>[{new Date().toLocaleTimeString()}]</span> {l.text}
            </div>
          ))}
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {stepIndex === 4 && (
            <button className="btn btn-primary" onClick={onClose}>
              Done & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
