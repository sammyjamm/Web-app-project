import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { runVerificationPipeline } from './verificationEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// 1. Google Places Discovery & Import
// -------------------------------------------------------------
app.get('/api/places/search', async (req, res) => {
  const { city = 'Austin, TX', category = 'Plumber' } = req.query;

  const settings = db.getSettings();
  const apiKey = settings.google_places_api_key;

  // Real Google Places Text Search if API key configured
  if (apiKey && apiKey.trim().length > 0) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category + ' in ' + city)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        const parsed = data.results.map(item => ({
          name: item.name,
          category: category,
          address: item.formatted_address || '',
          city: city,
          phone: '',
          google_place_id: item.place_id,
          rating: item.rating || 4.5,
          review_count: item.user_ratings_total || 12,
          google_website_field: null, // text search requires details call for website
          confidence_status: 'unverified'
        }));
        return res.json({ source: 'live_google_places', results: parsed });
      }
    } catch (err) {
      console.error('Places API fetch error:', err);
    }
  }

  // Fallback Realistic Simulator when no key or API error
  const sampleNames = [
    `${city.split(',')[0]} ${category} Specialists`,
    `Pro ${category} & Repair Co.`,
    `Precision ${category} Group`,
    `Reliable ${category} Masters`,
    `Heritage ${category} Workshop`,
    `Citywide ${category} Express`,
    `Top Choice ${category} Pros`,
    `Sunrise ${category} Solutions`
  ];

  const simulatedResults = sampleNames.map((name, idx) => {
    // 60% missing website, 40% has website in initial place data
    const hasWebsiteInitially = idx % 3 === 0;
    const placeId = `place_sim_${city.toLowerCase().replace(/[^a-z]/g, '')}_${idx + 101}`;
    
    return {
      name,
      category,
      address: `${100 + idx * 14} Main Street`,
      city,
      phone: `(${city.includes('Austin') ? '512' : '206'}) 555-0${120 + idx}`,
      google_place_id: placeId,
      rating: parseFloat((4.2 + (idx % 8) * 0.1).toFixed(1)),
      review_count: 15 + idx * 9,
      google_website_field: hasWebsiteInitially ? `http://www.${name.toLowerCase().replace(/[^a-z]/g, '')}.com` : null,
      confidence_status: hasWebsiteInitially ? 'has_website' : 'unverified'
    };
  });

  res.json({ source: 'demo_simulation', results: simulatedResults });
});

// Import discovered places into lead database
app.post('/api/places/import', (req, res) => {
  const { businesses } = req.body;
  if (!Array.isArray(businesses)) {
    return res.status(400).json({ error: 'Expected array of businesses' });
  }

  const savedList = businesses.map(b => db.saveBusiness(b));
  res.json({ success: true, count: savedList.length, saved: savedList });
});

// -------------------------------------------------------------
// 2. Lead Pipeline Management
// -------------------------------------------------------------
app.get('/api/leads', (req, res) => {
  const { lead_status, confidence_status, search, category, city } = req.query;
  let leads = db.getBusinesses();

  if (lead_status) {
    leads = leads.filter(l => l.lead_status === lead_status);
  }
  if (confidence_status) {
    leads = leads.filter(l => l.confidence_status === confidence_status);
  }
  if (category) {
    leads = leads.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }
  if (city) {
    leads = leads.filter(l => l.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.address.toLowerCase().includes(q) ||
      (l.phone && l.phone.includes(q))
    );
  }

  res.json(leads);
});

app.get('/api/leads/:id', (req, res) => {
  const lead = db.getBusinessById(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  const checks = db.getVerificationChecks(lead.id);
  const demo = db.getDemoByBusinessId(lead.id);

  res.json({ lead, checks, demo });
});

app.patch('/api/leads/:id', (req, res) => {
  const { lead_status, follow_up_date, notes } = req.body;
  const updated = db.updateBusinessStatus(req.params.id, lead_status, follow_up_date, notes);
  if (!updated) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json(updated);
});

// -------------------------------------------------------------
// 3. Verification Runner
// -------------------------------------------------------------
app.post('/api/leads/:id/verify', async (req, res) => {
  try {
    const result = await runVerificationPipeline(req.params.id);
    const updatedLead = db.getBusinessById(req.params.id);
    const checks = db.getVerificationChecks(req.params.id);
    res.json({ result, lead: updatedLead, checks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. Demo Site Generator
// -------------------------------------------------------------
app.post('/api/demos/generate', (req, res) => {
  const { business_id, template_used = 'modern_service', config = {} } = req.body;
  
  const lead = db.getBusinessById(business_id);
  if (!lead) {
    return res.status(404).json({ error: 'Business lead not found' });
  }

  const defaultConfig = {
    hero_headline: `Quality ${lead.category} Services You Can Count On`,
    hero_subheadline: `Serving ${lead.city} & surrounding areas with 5-star rated expertise.`,
    primary_color: '#3b82f6',
    accent_color: '#10b981',
    template: template_used,
    tagline: `Fast, Reliable, & Affordable ${lead.category}`,
    about_text: `${lead.name} has been serving residents and business owners in ${lead.city} with top-tier ${lead.category.toLowerCase()} services. Rated ${lead.rating || 4.8}/5 based on ${lead.review_count || 30}+ customer reviews.`,
    services: [
      { name: `Emergency ${lead.category} Response`, desc: 'Fast turnaround and immediate dispatch for urgent requests.' },
      { name: 'Standard Maintenance & Inspection', desc: 'Comprehensive multi-point checks to prevent costly damage.' },
      { name: 'Custom Upgrades & Installations', desc: 'Modern equipment installed with full satisfaction guarantee.' }
    ],
    contact_phone: lead.phone || '(512) 555-0199',
    contact_address: `${lead.address}, ${lead.city}`,
    reviews: [
      { author: 'Sarah M.', text: 'Outstanding service! They arrived on time and fixed our issue within an hour.', rating: 5 },
      { author: 'David K.', text: 'Super professional and honest pricing. Highly recommend to anyone in the area!', rating: 5 }
    ],
    ...config
  };

  const savedDemo = db.saveDemo({
    business_id,
    template_used,
    preview_config: defaultConfig
  });

  // Update lead status to 'demo_sent' if verified
  if (lead.lead_status === 'verified' || lead.lead_status === 'new') {
    db.updateBusinessStatus(business_id, 'demo_sent');
  }

  res.json({ success: true, demo: savedDemo, lead: db.getBusinessById(business_id) });
});

app.get('/api/demos/:business_id', (req, res) => {
  const demo = db.getDemoByBusinessId(req.params.business_id);
  if (!demo) {
    return res.status(404).json({ error: 'No demo found for this business' });
  }
  res.json(demo);
});

// -------------------------------------------------------------
// 5. Settings & Dashboard Stats
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.get('/api/stats', (req, res) => {
  const leads = db.getBusinesses();
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.lead_status === 'new').length,
    verified: leads.filter(l => l.lead_status === 'verified').length,
    contacted: leads.filter(l => l.lead_status === 'contacted').length,
    demo_sent: leads.filter(l => l.lead_status === 'demo_sent').length,
    sold: leads.filter(l => l.lead_status === 'sold').length,
    declined: leads.filter(l => l.lead_status === 'declined').length,
    likely_no_website: leads.filter(l => l.confidence_status === 'likely_no_website').length,
    needs_review: leads.filter(l => l.confidence_status === 'needs_review').length
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`⚡ LeadForge Backend API running on http://localhost:${PORT}`);
});
