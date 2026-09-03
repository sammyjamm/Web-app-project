Update the business list so every result is easy for me to manually verify and impossible to fake or mock:

1. For every business shown in the dashboard, display: name, full address, phone number, google_place_id, and a direct clickable Google Maps link built from the place_id (format: https://www.google.com/maps/place/?q=place_id:{place_id}). I should be able to click straight through to the real listing for any business on the list.

2. Only display data that came directly from a live Places API response. Do not use any hardcoded, sample, seed, or placeholder business data anywhere in the app — if the API returns zero results, show an empty state, not fallback/mock data.

3. Add a visible indicator (like a timestamp) showing when each business's data was last fetched from the API, so I know it's live and not cached/stale.

4. Log the raw API response for each search to the console or a debug panel so I can cross-check what came back from Google against what's rendered in the UI.

5. If any part of the code path could fall back to generated/mock data (e.g. for testing or if the API call fails), make that fallback impossible to trigger silently — either throw a visible error in the UI or clearly label the data as "TEST DATA - NOT REAL" so I can never mistake it for a real lead.
