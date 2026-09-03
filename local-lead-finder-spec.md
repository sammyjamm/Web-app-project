# Local Business Lead Finder + Site Generator — Build Spec

## 1. Overview

A web app with two connected modules:

1. **Lead Finder** — discovers local businesses without a website (verified, low false-positive rate) and manages them as a pipeline of leads.
2. **Site Generator** — takes a confirmed lead's business data and produces a starter one-page website that can be used as a sales demo.

Target user: solo operator prospecting one city/category at a time, manually reviewing and reaching out to leads.

---

## 2. Data Model

### `businesses`
| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | |
| category | text | e.g. "plumber", "bakery" |
| address | text | |
| city | text | |
| phone | text | nullable |
| google_place_id | text | for dedup / re-checks |
| rating | float | nullable |
| review_count | int | nullable |
| google_website_field | text | raw value from Places API, usually null for target leads |
| confidence_status | enum | `has_website`, `likely_no_website`, `needs_review`, `unverified` |
| verification_notes | text | what the checks found (e.g. "found FB bio link") |
| lead_status | enum | `new`, `verified`, `contacted`, `demo_sent`, `sold`, `declined` |
| created_at | timestamp | |
| updated_at | timestamp | |

### `verification_checks`
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK |
| check_type | enum | `web_search`, `social_bio`, `domain_guess` |
| result | text | raw finding |
| found_url | text | nullable |
| checked_at | timestamp | |

### `demos`
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK |
| generated_url | text | where the demo site is hosted/preview |
| template_used | text | |
| created_at | timestamp | |

---

## 3. Pipeline / Core Logic

### Stage 1 — Discovery
- Input: city/region + one or more business categories.
- Call Google Places API (Text Search or Nearby Search) for each category.
- Store all results in `businesses`, deduped by `google_place_id`.
- Any result with a non-empty `google_website_field` → set `confidence_status = has_website` immediately, skip further checks.

### Stage 2 — Verification (false-positive reduction)
Run only on businesses where `google_website_field` is empty. Run checks in this order, stopping early if a website is found:

1. **Web search check** — query `"{business name}" {city}` via a search API. Inspect top results for a domain that plausibly belongs to the business itself (not Yelp/Facebook/Instagram/directory sites). If found → `has_website`, log the URL.
2. **Social bio check** — look up the business's Facebook/Instagram page (Graph API where possible, otherwise a targeted search) and check the bio/about section for a website URL. If found → `has_website`, log the URL.
3. **Domain guess check** — try 2–3 likely domain patterns (e.g. `businessname.com`) with an HTTP HEAD request. If one resolves with a 200 and content that matches the business → `has_website`.
4. If none of the above find anything → `confidence_status = likely_no_website`.
5. If checks disagree or are inconclusive (e.g. a domain resolves but content doesn't clearly match) → `confidence_status = needs_review`.

Log every check's result in `verification_checks` regardless of outcome, so you can audit false positives/negatives later.

### Stage 3 — Manual review
A UI view filtered to `likely_no_website` and `needs_review`, where you can eyeball each one and flip `lead_status` to `verified` (or reject it back out).

### Stage 4 — Lead management
A table/board view of all `businesses`, filterable by `lead_status`, `confidence_status`, category, and city. Basic CRUD: edit notes, change status, add follow-up date.

### Stage 5 — Site generation
For a `verified` business:
- Pull its stored data (name, category, address, phone, rating/reviews, hours if available, photos if available).
- Feed it into a reusable page template (hero section, about, services/menu placeholder, contact/map, reviews snippet).
- Output a static site (HTML/CSS or a simple React build) to a preview URL.
- Store the result in `demos`, link back to the `business_id`.

---

## 4. Suggested Tech Stack

- **Frontend:** React (or plain HTML/JS if you want it simpler) for the lead dashboard.
- **Backend:** Node/Express or a serverless functions approach — mainly needed to keep API keys off the client and to run the verification checks server-side.
- **Database:** SQLite or Postgres (SQLite is fine for a single-user tool at this scale).
- **APIs needed:**
  - Google Places API (discovery + `website` field)
  - A search API for the web search check (e.g. a search API with an API key — Google Custom Search API or a similar provider)
  - Facebook Graph API (optional, for social bio check — has its own auth requirements)
- **Site generator output:** static HTML/CSS template with placeholders, or a lightweight static site generator.

---

## 5. Build Order (MVP → full version)

1. **MVP:** Discovery + basic table view, no verification — just show businesses missing the `website` field from Places. Manually confirm each one yourself.
2. **Add verification:** Implement the web search check first (highest value, catches most false positives). Add confidence_status field and filtering.
3. **Add social bio + domain guess checks** to tighten accuracy further.
4. **Add lead management UI:** status pipeline, notes, filters.
5. **Add site generator:** start with one solid template, wire up data → template rendering.
6. **Polish:** add multiple templates, export/preview links, maybe a simple outreach tracker (last contacted date, follow-up reminders).

---

## 6. Prompt to give Antigravity to start

> "Build a web app with a database of local businesses. It should let me search a city and category using the Google Places API, store results, and flag which ones are missing a website. For the ones missing a website, add a verification step that does a web search for the business name + city and checks if a real website turns up before trusting the 'no website' flag. Include a dashboard table to filter and manage these as leads with a status field (new, verified, contacted, demo sent, sold, declined)."

Start here, review the plan it proposes, and then layer in the site-generator module once the lead finder is working end to end.
