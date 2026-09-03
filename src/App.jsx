import React, { useState, useEffect } from 'react';
import { DiscoveryModule } from './components/DiscoveryModule.jsx';
import { PipelineDashboard } from './components/PipelineDashboard.jsx';
import { VerificationRunner } from './components/VerificationRunner.jsx';
import { SiteGeneratorStudio } from './components/SiteGeneratorStudio.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { Search, LayoutGrid, Sparkles, Settings, Flame, ShieldAlert, BarChart3 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'discovery', 'pipeline', 'studio'
  const [selectedLeadForDemo, setSelectedLeadForDemo] = useState(null);
  const [verifyingLead, setVerifyingLead] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ total: 0, likely_no_website: 0, verified: 0, demo_sent: 0 });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <a href="#" className="brand-logo">
          <div className="brand-icon">
            <Flame size={22} color="#fff" />
          </div>
          <span>LeadForge <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pro</span></span>
        </a>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'discovery' ? 'active' : ''}`}
            onClick={() => setActiveTab('discovery')}
          >
            <Search size={16} /> Discovery
          </button>
          <button
            className={`nav-tab ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <LayoutGrid size={16} /> Pipeline ({stats.total || 0})
          </button>
          <button
            className={`nav-tab ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            <Sparkles size={16} /> Demo Studio
          </button>
        </div>

        {/* Header Actions & Quick Metrics */}
        <div className="header-actions">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge chip-likely_no_website" style={{ fontSize: '0.75rem' }}>
              🎯 {stats.likely_no_website || 0} Targets
            </span>
            <span className="badge badge-demo_sent" style={{ fontSize: '0.75rem' }}>
              🚀 {stats.demo_sent || 0} Demos
            </span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowSettings(true)}>
            <Settings size={16} /> API Keys
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'discovery' && (
          <DiscoveryModule
            onLeadsImported={() => {
              fetchStats();
              setActiveTab('pipeline');
            }}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineDashboard
            onSelectLeadForDemo={(lead) => {
              setSelectedLeadForDemo(lead);
              setActiveTab('studio');
            }}
            onRunVerification={(lead) => {
              setVerifyingLead(lead);
            }}
          />
        )}

        {activeTab === 'studio' && (
          <SiteGeneratorStudio
            lead={selectedLeadForDemo}
            onDemoCreated={() => {
              fetchStats();
            }}
          />
        )}
      </main>

      {/* Verification Modal Runner */}
      {verifyingLead && (
        <VerificationRunner
          lead={verifyingLead}
          onClose={() => setVerifyingLead(null)}
          onVerificationComplete={() => {
            fetchStats();
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
