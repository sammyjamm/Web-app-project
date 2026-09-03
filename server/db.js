import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'data', 'leadforge.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Database Structure
const defaultDb = {
  businesses: [
    {
      id: "b1",
      name: "Apex Plumbing & Rooter Services",
      category: "Plumber",
      address: "1420 N Main St, Suite 102",
      city: "Austin, TX",
      phone: "(512) 555-0198",
      google_place_id: "ChIJ_apex_plumb_01",
      rating: 4.8,
      review_count: 42,
      google_website_field: null,
      confidence_status: "likely_no_website",
      verification_notes: "Checked web search & FB bio: No active website found.",
      lead_status: "verified",
      follow_up_date: "2026-09-05",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "b2",
      name: "Heritage Artisan Bakery",
      category: "Bakery",
      address: "408 E 6th Street",
      city: "Austin, TX",
      phone: "(512) 555-0341",
      google_place_id: "ChIJ_heritage_bake_02",
      rating: 4.9,
      review_count: 89,
      google_website_field: null,
      confidence_status: "likely_no_website",
      verification_notes: "Domain guess heritagebakery.com failed. FB has address only.",
      lead_status: "new",
      follow_up_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "b3",
      name: "Lone Star Auto Detailers",
      category: "Auto Repair",
      address: "8902 S Congress Ave",
      city: "Austin, TX",
      phone: "(512) 555-0872",
      google_place_id: "ChIJ_lonestar_auto_03",
      rating: 4.6,
      review_count: 31,
      google_website_field: null,
      confidence_status: "needs_review",
      verification_notes: "Found directory listing on Yelp, needs human verification.",
      lead_status: "new",
      follow_up_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  verification_checks: [
    {
      id: "v1",
      business_id: "b1",
      check_type: "web_search",
      result: "Searched Google for 'Apex Plumbing & Rooter Services Austin, TX'. Top 10 results are directory links only.",
      found_url: null,
      checked_at: new Date().toISOString()
    },
    {
      id: "v2",
      business_id: "b1",
      check_type: "social_bio",
      result: "Located Facebook Page @apexplumbingaustin. Bio link field is empty.",
      found_url: null,
      checked_at: new Date().toISOString()
    },
    {
      id: "v3",
      business_id: "b1",
      check_type: "domain_guess",
      result: "Pinging apexplumbing.com, apexplumbingaustin.com - HTTP HEAD connection timeout.",
      found_url: null,
      checked_at: new Date().toISOString()
    }
  ],
  demos: [],
  settings: {
    google_places_api_key: "",
    custom_search_api_key: "",
    custom_search_cx: ""
  }
};

class FileDatabase {
  constructor() {
    this.read();
  }

  read() {
    if (!fs.existsSync(dbFilePath)) {
      this.data = defaultDb;
      this.write();
    } else {
      try {
        const raw = fs.readFileSync(dbFilePath, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        this.data = defaultDb;
        this.write();
      }
    }
  }

  write() {
    fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  getBusinesses() {
    this.read();
    return this.data.businesses;
  }

  getBusinessById(id) {
    this.read();
    return this.data.businesses.find(b => b.id === id);
  }

  saveBusiness(businessData) {
    this.read();
    const existingIndex = this.data.businesses.findIndex(b => 
      b.id === businessData.id || (b.google_place_id && b.google_place_id === businessData.google_place_id)
    );

    const now = new Date().toISOString();
    let saved;

    const googlePlaceId = businessData.google_place_id || `place_${Date.now()}`;
    const mapsUrl = businessData.google_maps_url || `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`;
    const fetchedAt = businessData.fetched_at || now;
    const isMock = businessData.is_mock !== undefined ? businessData.is_mock : false;

    if (existingIndex >= 0) {
      saved = {
        ...this.data.businesses[existingIndex],
        ...businessData,
        google_maps_url: mapsUrl,
        fetched_at: fetchedAt,
        is_mock: isMock,
        updated_at: now
      };
      this.data.businesses[existingIndex] = saved;
    } else {
      saved = {
        id: businessData.id || `b_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        created_at: now,
        updated_at: now,
        fetched_at: fetchedAt,
        is_mock: isMock,
        google_maps_url: mapsUrl,
        lead_status: businessData.lead_status || 'new',
        confidence_status: businessData.confidence_status || 'unverified',
        ...businessData
      };
      this.data.businesses.unshift(saved);
    }
    this.write();
    return saved;
  }

  updateBusinessStatus(id, lead_status, follow_up_date, notes) {
    this.read();
    const b = this.data.businesses.find(item => item.id === id);
    if (!b) return null;

    if (lead_status) b.lead_status = lead_status;
    if (follow_up_date !== undefined) b.follow_up_date = follow_up_date;
    if (notes !== undefined) b.verification_notes = notes;
    b.updated_at = new Date().toISOString();

    this.write();
    return b;
  }

  deleteBusiness(id) {
    this.read();
    const initialLen = this.data.businesses.length;
    this.data.businesses = this.data.businesses.filter(b => b.id !== id);
    this.data.verification_checks = this.data.verification_checks.filter(c => c.business_id !== id);
    this.data.demos = this.data.demos.filter(d => d.business_id !== id);
    this.write();
    return this.data.businesses.length < initialLen;
  }

  addVerificationCheck(check) {
    this.read();
    const newCheck = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      checked_at: new Date().toISOString(),
      ...check
    };
    this.data.verification_checks.push(newCheck);
    this.write();
    return newCheck;
  }

  getVerificationChecks(businessId) {
    this.read();
    return this.data.verification_checks.filter(c => c.business_id === businessId);
  }

  saveDemo(demo) {
    this.read();
    const newDemo = {
      id: `demo_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...demo
    };
    this.data.demos.unshift(newDemo);
    this.write();
    return newDemo;
  }

  getDemoByBusinessId(businessId) {
    this.read();
    return this.data.demos.find(d => d.business_id === businessId);
  }

  getSettings() {
    this.read();
    return this.data.settings || {};
  }

  updateSettings(settings) {
    this.read();
    this.data.settings = { ...this.data.settings, ...settings };
    this.write();
    return this.data.settings;
  }
}

export const db = new FileDatabase();
