# SOMA Portfolio: Complete Project History

**Status:** 🟢 LIVE | **Domain:** https://eeshans.com | **Current Version:** Astro 4.4.15 | **Updated:** Nov 2025

---

## Instructions for AI Assistant

Please read through project_history.md in extreme detail so you understand where I am right now .. pay attention to working principles. Explore the codebase of soma-portfolio and soma-analytics repos so you understand the code in context of my project history doc. Let me know once you have perfect understand of my code and work. 

go through the js files to see if there are any redundancies, dead code or opportunities to optimize without breaking anything and then give me a plan (don't do anything)

1. Read the "Working Principles" section above (defines how you think)
2. Check the "Tech Stack & Architecture" section (current state)
3. Understand the three repos: Hugo (archived), Streamlit (still running), Astro (current)
4. If something breaks, look at "Critical Fixes" first (you've seen these problems before)
5. Keep this file updated with each major change

This document is your north star. Update it. Reference it.

## Memory Refresh for AI Assistant (Read This First)

**What is SOMA?** A demonstration portfolio site showcasing enterprise-grade analytics, experimentation, and data science workflows through an interactive A/B test simulator.

**Four Repos:**
1. `soma-blog-hugo` - Original Hugo blog (ARCHIVED - local only, Fly deployment removed, DNS removed)
2. `soma-streamlit-dashboard` - Analytics dashboard (ARCHIVED - local only)
3. `soma-portfolio` - Astro portfolio (PRODUCTION - live at https://eeshans.com)
4. `soma-analytics` - FastAPI backend (PRODUCTION - live at https://soma-analytics.fly.dev/)

-- using Cloudflare reverse proxy to get around ad blockers - https://api-v2.eeshans.com

**Key Insight:** Each phase solved a different problem. Hugo + PostHog + Supabase + Streamlit proved the concept. Astro migration consolidated everything into one clean, modern stack.

**Most Important File:** This file. Keep it current.

---

## Working Principles for AI Assistant [READ AND MEMORIZE]

Applied consistently across all three projects:

- **Fix root causes, not symptoms** — Research docs/code deeply before claiming to understand a problem
- **Chunk-based delivery** — Complete small, verifiable pieces. Test before proceeding to next chunk
- **Brutalize scope** — Remove features/configs/dependencies that don't earn their weight. Prefer simplicity over completeness
- **Enterprise mindset** — Every decision should be defensible in a real company context. No toy code
- **Tools over custom code** — Prefer established tools (PostHog, Streamlit, Tailwind) over rolling custom solutions
- **Test thoroughly before shipping** — Build locally, test all features, verify production-like behavior
- **Commit small, clear changes** — One logical fix per commit. Descriptive messages. Easy to review and rollback
- **Code inspection over assumptions** — Read actual files/output. Don't guess about behavior
- **Brutally minimal documentation** - don't create new md files
- **Favorite metric from AI assistant** - I always like when AI assistant tells me what % of line of code it reduced after it does work for me

**When restarting:** Re-read these principles first. They define your decision-making framework.

---


## Tech Stack & Architecture

### Current Stack (Astro Era)

**Frontend:** Astro 4.4.15 (static site generation) + Tailwind CSS + React (islands)  
**Runtime:** Node.js 20 (build time only)  
**Styling:** Tailwind utilities (no custom CSS)  
**Animations:** Tailwind transforms (formerly Framer Motion)  
**Components:** React for timeline, pure Astro/HTML for everything else

**Deployment Stack:**
```
npm run build          → Astro compiles pages to dist/ (1.07s locally)
Docker multi-stage    → Node 20 build → Nginx Alpine (~23MB image)
Fly.io                → soma-portfolio app, dfw region, 2 machines
Let's Encrypt         → SSL/TLS (eeshans.com + www, auto-renewing)
GitHub Actions        → Auto-deploy on main push (needs FLY_API_TOKEN secret)
Cloudflare            → DNS records (A + AAAA + CNAME for www)
```

### Local runs
* For Astro site: ```npm run dev```
* For Hugo site: ```hugo server -D```
* For Streamlit: ```streamlit run app.py```

### Previous Stack (Hugo Era - ARCHIVED)

**Frontend:** Hugo (Go templates) + Rusty Typewriter theme + custom CSS  
**Backend:** FastAPI (Python) on Fly.io - REMOVED  
**Analytics:** PostHog SDK → Supabase Edge Function webhook → PostgreSQL  
**Dashboard:** Streamlit app (still live, embedding in Astro now)

### Shared Infrastructure (Both Eras)

**PostHog:** Feature flags + event tracking
- API Key: `phc_zfue5Ca8VaxypRHPCi9j2h2R3Qy1eytEHt3TMPWlOOS`
- Host: `https://us.i.posthog.com`
- Feature flag: `word_search_difficulty_v2` (50/50 A/B test)

**Supabase:** PostgreSQL database + Edge Functions
- Project: `nazioidbiydxduonenmb`
- Host: `aws-1-us-east-2.pooler.supabase.com` (connection pooler on port 6543)
- Webhook: PostHog → Edge Function → Events table
- Views: v_variant_stats, v_conversion_funnel, v_stats_by_hour

**Streamlit:** Analytics dashboard (Python app)
- Repo: soma-streamlit-dashboard
- Deployed on: Fly.io (private, local access only)
- Refresh: 10-second cache TTL
- Embedding: Iframe in `/projects/ab-test-simulator` page

### Configuration Files (Critical)

**astro.config.mjs** - Site URL must be `https://eeshans.com` (affects canonical URLs & sitemap)  
**Dockerfile** - Nginx must have `port_in_redirect off;` (prevents :8080 in URLs)  
**fly.toml** - No PORT env variable (kept bloat-free)  
**.env** - Contains `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` (git-ignored)

---

## Complete Project Timeline

**Total Project Time:** ~25.75 hours | **Status:** ✅ Complete & Live

### Phase 0: Hugo Blog Foundation (Sept 2025)
Started with Hugo (Go templates) + custom CSS (130 lines) + vanilla JavaScript (489 lines) + A/B puzzle game hosted on Fly.io. Problem: Everything custom-built, hard to iterate, stats calculation scattered.

### Phase 1: PostHog + Supabase Integration (Oct 25, 2025) — 11 hours
Built modern data pipeline by replacing FastAPI middleware with established tools. Split into 7 chunks:
- PostHog SDK integration + event tracking (2h)
- PostHog webhook → Supabase pipeline + database schema (3h)
- Streamlit dashboard built in Python (3h)
- Streamlit iframe embedded in Hugo + end-to-end testing (1h)
- Documentation + polish (1h)

**Key Result:** Enterprise-grade data pipeline proven. Switched from custom code to tools-first approach (PostHog → Supabase → Streamlit).

### Phase 2: Hugo to Astro Migration (Nov 1-8, 2025) — 14.75 hours
Migrated to modern Astro framework while preserving all integrations:
- Setup + content migration (1.25h)
- Built React Timeline component with 7 company logos (1.5h)
- Personalized homepage, projects, simulator pages (3h)
- Re-integrated PostHog + Streamlit embed (1.5h)
- Minimized JavaScript 489→250 lines (49%) + CSS 130→0 lines (Tailwind) (1.5h)
- Removed framer-motion dependency, migrated animations to Tailwind (0.5h)
- Docker multi-stage build + Fly.io deployment (2h)
- Custom domain (eeshans.com) + Let's Encrypt SSL (1.5h)
- Fixed :8080 port issue in Nginx `port_in_redirect off;` (1h)

**Result:** Modern portfolio site live at https://eeshans.com with all 11 pages working, zero console errors, 23MB Docker image.

### Phase 3: Production Polish (Nov 8, 2025)
- Copied profile image from Hugo to Astro assets (69KB)
- Updated header branding from "resume" to "Eeshan S."
- Increased profile image size from h-28 to 200px
- Scaled Hugo site to zero machines (preserved, not deleted)
- Disabled GitHub Actions on Hugo (preserved workflow code)
  
- **Homepage Redesign:** Replaced static CTA with data-driven utility section
  - Two-column grid: Newsletter (left, icon + label + description) + Utilities (right: A/B Simulator, Browse Projects)
  - Created `src/data/social-links.yaml` for configurable social links (no hardcoding)
  - Integrated astro-icon with @iconify-json/simple-icons for brand logos

- **Analytics Backend Replacement (Nov 8-9, 2025 - COMPLETE)**
  - Replaced Streamlit iframe with FastAPI + Vanilla JS + Plotly.js
  - Created `soma-analytics` repo: Minimal FastAPI backend (126 lines)
  - Extracted analysis logic to `analysis/ab_test.py` - pure Python functions (no notebooks, no frameworks)
  - Deployed to https://soma-analytics.fly.dev
  - Frontend: Vanilla JavaScript (~70 lines) with Plotly.js for charts
  - Auto-detects local vs production API URL
  - Real-time updates every 10 seconds

  **Architecture:**
  ```
  Python analysis (analysis/ab_test.py)
    ↓
  FastAPI JSON endpoints (api.py)
    ↓
  Vanilla JS fetch in Astro (ab-test-simulator.astro)
    ↓
  Plotly.js renders charts (no React, no frameworks)
  ```

## Phase 4: Real-Time Dashboard Optimization (Nov 9, 2025)

**Problem:** Dashboard updates were slow (15-20 seconds) even with 5-second polling. Elements updated partially, causing poor UX.

**Optimizations implemented:**

1. **Removed API caching** (`soma-analytics/api.py`)
   - Deleted `_cache` dict and `get_cached()` function
   - All endpoints now return fresh data on every request
   - **Code reduction:** ~15 lines removed

2. **Simplified conversion funnel query**
   - Replaced expensive self-JOIN with direct `WHERE event = 'puzzle_repeated'` query
   - Changed from: `INNER JOIN posthog_events ON timestamp > c.timestamp` (O(n²) complexity)
   - Changed to: Simple COUNT on `puzzle_repeated` events (O(n) complexity)
   - **Query optimization:** ~10x faster execution


---

## Phase 5: Global Leaderboard Implementation (Nov 9, 2025)

**Problem:** Leaderboard was localStorage-only (single user), used tiny username dictionary (10 adjectives × 10 animals = 100 combinations, high collision risk).

**Solution:** Implemented global leaderboard with unique-names-generator library (1400+ adjectives × 350+ animals) backed by API queries to PostHog data in Supabase.

**Changes made:**

1. **Username Generation Upgrade**
   - Installed `unique-names-generator` v4.7.1 npm package
   - Integrated via inline Astro script (module import) in `ab-test-simulator.astro`
   - Username format: "Speedy Tiger" style (capital case, space separator)
   - Removed old 2-line custom dictionary (ADJECTIVES, ANIMALS arrays)

2. **PostHog Identity Tracking**
   - Added `posthog.identify(username)` when username first generated
   - Added `username` property to all event tracking calls
   - Username stored in `properties` JSONB column in Supabase `posthog_events` table

3. **Backend Leaderboard Query** (`soma-analytics/analysis/ab_test.py`)
   - Created `get_leaderboard(variant='A', limit=10)` function
   - SQL: `SELECT properties->>'username', MIN(completion_time_seconds), COUNT(*) FROM posthog_events WHERE event='puzzle_completed' GROUP BY username ORDER BY best_time`
   - Returns list of dicts: `{username, best_time, total_completions}`

4. **API Endpoint** (`soma-analytics/api.py`)
   - Added `/api/leaderboard?variant=A&limit=10` endpoint
   - Query params validated (variant must be A/B, limit max 50)
   - Returns JSON array sorted by best_time ascending

5. **Frontend Display** (`public/js/ab-simulator.js`)
   - Replaced localStorage logic with API fetch
   - Shows top 5 with medals (🥇🥈🥉🏅)
   - If user ranked 6+, shows their rank below top 5 with separator
   - Highlights current user with blue background + 🌟 star
   - Auto-refreshes every 5 seconds (synced with dashboard polling)
   - Fetches immediately after puzzle completion

6. **UI Polish**
   - Top 5 always shown with rank indicators
   - User's personal best appears below if ranked 6th or lower
   - Empty state: "Complete to rank"
   - Error state: "Loading..." with console error logging

**Architecture:**
```
User completes puzzle
  ↓
PostHog captures event with username property
  ↓
Supabase webhook stores in posthog_events.properties->>'username'
  ↓
FastAPI queries MIN(completion_time) grouped by username
  ↓
Frontend fetches /api/leaderboard and renders with medals
```

---

## Phase 6: Memory Game Transformation (Nov 9, 2025)

**Problem:** Word search puzzle was text-heavy, lacked visual engagement, and didn't demonstrate modern UI patterns.

**Solution:** Transformed into pineapple hunting memory game with visual feedback, countdown timer, and improved UX.

**Key Changes:**

1. **Game Mechanics Overhaul**
   - Replaced word search with 5x5 fruit grid memory game
   - Variant A: 3 pineapples (easier), Variant B: 4 pineapples (harder)
   - 2-second memorization phase → 5-second visual countdown (5,4,3,2,1,HIDE) → 60-second game phase
   - Always-visible gray boxes with hidden fruits, click to reveal

2. **Visual Design System**
   - Gray boxes always visible (border-2 border-gray-500) → Green (memorize/correct) → Red flash (incorrect)
   - 5-second countdown timer with large red numbers and "Get Ready!" message
   - Simple wrong feedback: red flash + fruit for 1 second, then fade back to gray
   - Pure Tailwind utilities, no custom CSS

3. **Code Architecture Updates**
   - `puzzle-config.js`: 5x5 fruit grids with random pineapple placement
   - `ab-simulator.js`: Complete rewrite for memory game logic with proper timer sequencing
   - `ab-test-simulator.astro`: Added countdown timer HTML, memorize message, removed word input
   - Maintained PostHog events: puzzle_started, puzzle_completed, puzzle_failed

4. **Analytics Integration**
   - Tracks pineapples found vs total clicks
   - Completion time in milliseconds
   - Real-time A/B test comparison preserved
   - Leaderboard system unchanged (still works)

**Result:** Engaging memory game with modern UI, proper countdown sequence, and enterprise-grade analytics tracking.


## How to Maintain This

**If you need to change the puzzle game:**
- Edit: `public/js/ab-simulator.js`
- Test: `npm run dev` → navigate to `/projects/ab-test-simulator`
- Verify: Play game, check PostHog events 30 seconds later
- Deploy: `git add -A && git commit -m "fix: ..."` → `git push origin main`

**If you need to change styling:**
- Edit: `tailwind.config.js` or `src/styles/app.css`
- No custom CSS files (everything is Tailwind)
- Test locally, then deploy

**If you need to add a blog post:**
- Create: `src/content/post/[slug].md` with frontmatter
- Test: `npm run dev` → check `/blog` and `/blog/[slug]`
- Deploy: Push to main

**If you need to change analytics/add new metrics:**
- Edit: `soma-analytics/analysis/ab_test.py` (add Python function)
- Add endpoint: `soma-analytics/api.py` (return function result as JSON)
- Test locally: `python3 api.py` → `curl http://localhost:8000/api/your-endpoint`
- Deploy: `cd soma-analytics && fly deploy`
- Update viz: Edit vanilla JS in `src/pages/projects/ab-test-simulator.astro`

**If PostHog events aren't tracking:**
- Check: `.env` has `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST`
- Test: Open browser DevTools → Network → look for posthog requests
- Verify: Post to `https://us.i.posthog.com/e/` should exist
- Check PostHog dashboard directly

**If site won't build:**
- Run: `npm run build` locally to see error details
- Check: All astro.config.mjs settings correct
- Verify: No TypeScript errors
- Test: `npm run preview` to simulate production

---

## Quick Reference

**Critical Files to Know:**
- `astro.config.mjs` - Build config, integrations, site URL
- `Dockerfile` - Container build (Node 20 → Nginx Alpine)
- `fly.toml` - Fly.io config (app name, region, port)
- `src/pages/index.astro` - Homepage
- `src/pages/projects/ab-test-simulator.astro` - Puzzle page
- `public/js/ab-simulator.js` - Game logic & PostHog tracking
- `.env` - PostHog credentials (git-ignored)
- `.github/workflows/deploy.yml` - CI/CD pipeline

**Most Common Commands:**
- `npm run dev` - Start dev server (localhost:4321)
- `npm run build` - Build for production (creates dist/)
- `npm run preview` - Test production build locally
- `fly deploy` - Deploy to Fly.io manually
- `fly logs` - Check deployment logs
- `fly certs check eeshans.com` - Verify SSL certificate

**Useful One-Liners:**
```bash
# Deploy and see live logs
git push origin main && sleep 5 && fly logs -a soma-portfolio

# Test production build works
npm run build && npm run preview

# Reset PostHog variant (in browser console)
localStorage.clear(); posthog.reset(); location.reload();
```

---

## Temporary Recommendations (Nov 10, 2025)

Documenting concrete, low-risk improvements to consider next. No code changes made yet—this is a review checklist for tomorrow.

1) Performance and Network
- Coalesce API calls: Merge `/api/variant-stats` and `/api/comparison` (comparison derives from stats). Expected: -1 HTTP request per 5s refresh (≈12/hr/user); risk: low.
- FastAPI CORS lockdown: Restrict `allow_origins` to `https://eeshans.com` and localhost (keep dev smooth). Risk: low.
- Dashboard dev host check: Expand localhost detection to include `127.0.0.1` and local IPs (e.g., `hostname.startsWith('192.168.')`). Risk: low.
- Supabase indexes (DB side): Ensure indexes on `(event, variant)`, and on `properties->>'username'` for leaderboard MIN/COUNT query. Risk: low, ops task.

2) UX polish and copy consistency
- Comparison labels: In `src/pages/projects/ab-test-simulator.astro`, the comparison card still references “3 words / 4 words”. Update to pineapple counts or neutral labels (e.g., “Control (A)” / “Treatment (B)”). Risk: low.
- Found items label: `found-words-list` now displays pineapples. Rename to `found-pineapples` for clarity (JS + HTML). Risk: low.
- Feature flag naming: Consider renaming `word_search_difficulty_v2` to a memory-game-specific flag for clarity once data collection is stable. Risk: low.

3) JS audit: redundancies, dead code, and micro-optimizations
- Duplicate IDs (bug): `ab-test-simulator.astro` declares two elements with id `try-again-inline-button` (one in controls row, one in result card). Use unique IDs or a class selector, and update listeners in `ab-simulator.js`. Risk: low.
- Dead/legacy state in `ab-simulator.js`:
   - `guessedWords`, `foundWords`, and `updateFoundWordsList()` are remnants from word-search; no longer used in the memory game flow. Candidate for removal.
   - `memorizeTime: 5000` is defined in state but not used; memorize step is hard-coded with `setTimeout(2000)` + a 5s countdown. Either wire `memorizeTime` into the flow or remove it.
   - `input-section` and `word-input` remain in the DOM but are hidden and unused—carryover from the old mechanic. Safe to delete with corresponding JS.
- Error UI target mismatch in `dashboard.js`: error path updates `#comparison-card`, but this element ID doesn’t exist in the page DOM. Either add a wrapper with this ID or switch to an existing container. Risk: low.
- Timer render cadence: Consider using `requestAnimationFrame` (or a 250ms interval) for display updates; keep the underlying timing via `Date.now()` for accuracy. Risk: low.
- Small utilities: Deduplicate DOM helpers (`$, show, hide, toggle`) for reuse between `ab-simulator.js` and `dashboard.js` via a tiny shared `public/js/utils.js`. Expected JS LOC reduction: ~20–40 lines (≈3–4%). Risk: low.
- Leaderboard flicker: Cache the user’s personal best in `localStorage` and render immediately while awaiting API; then reconcile with server response. Risk: low.

4) Reliability and resilience
- Feature flag retry: Before declaring a PostHog flag failure, retry once after ~500ms; if still unresolved, show the current helpful error block. Risk: low.
- API input validation: `/api/recent-completions` clamps `limit` (good). Mirror explicit min bound (e.g., floor to 1) for completeness. Risk: low.

5) Analytics depth (optional nicety)
- Percentiles endpoint: Add `/api/leaderboard-stats` or enrich existing stats with p50/p90 completion times per variant using current views. Useful for dashboard narrative without heavy UI changes. Risk: low.

Estimated impact summary
- Network: fewer requests (coalesced stats) and tighter CORS
- JS hygiene: -50 to -100 LOC across `public/js` from dead code and utility extraction (≈6–10% within that folder), reduced confusion surface
- UX clarity: consistent copy and IDs prevent rare bugs

If you want, I can start with the JS audit cleanups first (dead code removal, duplicate ID fix, feature flag retry). That’s the safest set with immediate LOC and clarity wins.


## AI Resumption Prompt (for tomorrow)

Copy-paste this prompt to rehydrate full context and continue seamlessly:

```
You are assisting on the SOMA Portfolio/Analytics project. Rehydrate context and regain full working memory, then wait for my instruction on which task to execute:

1) Read /Users/eeshans/dev/soma-portfolio/PROJECT_HISTORY.md end-to-end.
   - Memorize the Working Principles, Tech Stack & Architecture, and the section "Temporary Recommendations (Nov 10, 2025)".

2) Confirm key files and roles without editing any code yet:
   - soma-portfolio: astro.config.mjs, package.json, tailwind.config.js, tsconfig.json,
     src/pages/index.astro, src/pages/projects/ab-test-simulator.astro,
     src/components/BaseHead.astro,
     public/js/ab-simulator.js, public/js/puzzle-config.js, public/js/dashboard.js,
     src/data/social-links.yaml
   - soma-analytics: api.py, analysis/ab_test.py, requirements.txt, Dockerfile, fly.toml

3) Summarize (briefly) the current architecture and experiment pipeline, then restate the "Temporary Recommendations" as a prioritized checklist. Note any deltas since last run if files have changed.

4) When I say "proceed", start with the JS audit items unless I specify otherwise:
   - Fix duplicate IDs (try-again button)
   - Remove dead/legacy code (guessedWords/foundWords/updateFoundWordsList, unused input box, unused memorizeTime constant)
   - Add a single feature-flag retry before erroring
   - Optional: extract small DOM utils to public/js/utils.js
   Provide an estimated LOC reduction and how you’ll validate (build + quick manual test steps).

Do not make any code changes until I confirm the first task to execute.
```

