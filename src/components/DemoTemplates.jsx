import React from 'react';

export function ModernServiceTemplate({ config, business }) {
  const primaryColor = config.primary_color || '#3b82f6';
  const accentColor = config.accent_color || '#10b981';

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b',
      background: '#ffffff',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner */}
      <header style={{
        background: '#0f172a',
        color: '#ffffff',
        padding: '1rem 2rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        borderBottom: `4px solid ${primaryColor}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: primaryColor,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            {business?.name ? business.name.charAt(0) : 'B'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{business?.name || 'Local Business'}</h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{config.tagline}</span>
          </div>
        </div>
        <div>
          <a
            href={`tel:${config.contact_phone}`}
            style={{
              background: accentColor,
              color: 'white',
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}
          >
            📞 {config.contact_phone}
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: 0 }}>
          <div style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: accentColor,
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            ★ {business?.rating || 4.8} Rated in {business?.city || 'Your Area'} ({business?.review_count || 35}+ Reviews)
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
            {config.hero_headline}
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', marginBottom: '2rem' }}>
            {config.hero_subheadline}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button style={{
              background: primaryColor,
              color: 'white',
              border: 'none',
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59,130,246,0.4)'
            }}>
              Get Free Quote
            </button>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Our Services
            </button>
          </div>
        </div>
      </section>

      {/* About & Features */}
      <section style={{ padding: '3.5rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', marginBottom: '1rem', color: '#0f172a' }}>
            Why Choose {business?.name || 'Us'}?
          </h2>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
            {config.about_text}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {(config.services || []).map((s, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '1.75rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: `${primaryColor}15`,
                  color: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}>
                  0{i + 1}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>{s.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '3.5rem 2rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', color: '#0f172a' }}>
            What Our Customers Say
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {(config.reviews || []).map((r, i) => (
              <div key={i} style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                borderLeft: `4px solid ${accentColor}`
              }}>
                <div style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {'★'.repeat(r.rating || 5)}
                </div>
                <p style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  "{r.text}"
                </p>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>— {r.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <footer style={{
        background: '#0f172a',
        color: 'white',
        padding: '3rem 2rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.75rem' }}>{business?.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>📍 {config.contact_address}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>📞 {config.contact_phone}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#e2e8f0' }}>Business Hours</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Monday – Friday: 8:00 AM – 6:00 PM</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Saturday: 9:00 AM – 3:00 PM</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sunday: Closed</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '1.25rem', color: '#64748b', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} {business?.name || 'Local Business'}. All rights reserved. Demo created with LeadForge.
        </div>
      </footer>
    </div>
  );
}
