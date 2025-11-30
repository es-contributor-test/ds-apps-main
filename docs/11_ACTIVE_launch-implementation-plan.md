# Launch Implementation Plan

**Goal:** Ship a polished site with visible proof, honest framing, and DRY patterns that scale to future projects.

---

## Principles

| # | Principle | Implication |
|---|-----------|-------------|
| 1 | **Data lives in YAML, logic in TS** | `projects.yaml` is source of truth for project metadata, stats config, AI story |
| 2 | **One component, multiple contexts** | `<ProjectCard>`, `<StatsCard>`, `<Timeline>` work on home, hub, stack, contribute |
| 3 | **Content links to projects** | Posts have `projectId` frontmatter; `getPostsByProject()` util queries them |
| 4 | **Patterns before pages** | Extract shared components first, then build pages that compose them |

---

## Phase 1: Shared Infrastructure ✅ COMPLETE

**Why:** Build reusable pieces before creating pages that use them.

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | `projects.yaml` with id, name, status, description, tags, stats config | Done |
| ✅ | `projects.ts` with `parseProjectsYaml`, `getProjectsByStatus`, `STATUS_CONFIG` | Done |
| ✅ | `<ProjectCard>` with stats hydration (full + compact variants) | Done |
| ✅ | Add `projectId` to post schema (`src/content/config.ts`) | Done |
| ✅ | Create `getPostsByProject(projectId)` util in `src/lib/posts.ts` | Done |
| ✅ | Add `aiStory` field to `projects.yaml` (array of bullets) | Done |
| ✅ | Extract `<Timeline>` to `packages/shared/src/components/Timeline.astro` | Done |
| ✅ | Create `<ConnectionStatus>` component | Done |

---

## Phase 2: Project Hub + Game Polish ✅ COMPLETE

**Why:** Hub is the shareable portfolio piece. Game stays focused on play with minimal chrome.

**Architecture:**
```
/projects (index)
├── Live projects (ProjectCard full variant)
├── What's Next (Timeline component)
└── Add to nav

/projects/ab-simulator (hub)
├── Hero + [Play Game →]
├── Stats (reuses StatsCard logic from ProjectCard)
├── AI Story (from projects.yaml.aiStory)
├── Related Content (getPostsByProject)
└── [Play Again →]

/ab-simulator (game)
├── <ConnectionStatus /> top bar
├── Nav: [← Back] [Project Docs]
└── Game UI (unchanged)
```

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Create `/projects/index.astro` | ProjectCard (full) + Timeline, add to nav |
| ✅ | Create `/projects/ab-simulator.astro` hub page | Template for future hubs |
| ✅ | Hero with project name, description, [Play Game →] CTA | From `projects.yaml` |
| ✅ | Stats section using same Supabase fetch as ProjectCard | Done |
| ✅ | AI Story section rendering `projects.yaml.aiStory` bullets | Done |
| ✅ | Related Content section using `getPostsByProject('ab-simulator')` | Done |
| ✅ | Add `<ConnectionStatus>` to game page header | Green/red dots for PostHog/Supabase |
| ✅ | Add nav to game + "Project Docs" button | Done |

---

## Phase 3: Contribute + Content ✅ COMPLETE

**Why:** Honest framing for contribute. Analysis post proves DS chops and feeds hub.

**Key Decision:** Replace React-powered GitHub table with **static Markdown page**.

**Rationale:**
- Delete **3,834 lines** of code (fetch script, JSON data, 11 React components, types)
- Match existing doc pattern (like `docs/11_ACTIVE_...`)
- Manual updates force honest, current content
- GraphQL refactor (#21) stays open for future polish

**What Was Deleted:**
| File | Lines |
|------|-------|
| `scripts/fetch-build-log.mjs` | 397 |
| `src/data/build-log-data.json` | 2,387 |
| `src/components/contribute/*.tsx` (11 files) | 884 |
| `src/lib/build-log-config.ts` | 27 |
| `src/lib/build-log-types.ts` | 71 |
| `src/data/build-log/build-log-config.ts` | 68 |
| **Total deleted** | **3,834** |
| **New page created** | 230 |
| **Net reduction** | **-3,604** |

**New `/contribute` Structure:**
```markdown
# Build With Me
> Living document. Last updated: {date}

## 🎯 Current Focus
| Project | Status | Try It | Docs |

## 📋 Active Work  
| Phase | Description | Status | GitHub |

## 🔗 Quick Links
- All Open Issues
- Good First Issues
- Project Board

## 🚀 How to Contribute
4-step process + stack summary

## 👥 Contributors
Manual table

## 📰 Follow the Build
Substack, Twitter, RSS

## ❓ FAQ
```

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Delete React components + fetch script | 3,834 lines deleted |
| ✅ | Create `/contribute` as Markdown-rendered page | 230 lines, clean Astro |
| ✅ | Structure: Focus, Active Work, Links, How-to, Contributors, FAQ | All sections present |
| ✅ | Add passive follow options | RSS, Substack, Twitter links |
| ☐ | Extend analysis notebook | Power, frequentist, Bayesian, CUPED |
| ☐ | Create analysis blog post | `projectId: ab-simulator`, `featured: true` |
| ☐ | Add 1-2 more launch anchor posts | "How I Built This", one essay |

---

## Phase 4: Stack + Documentation ✅ COMPLETE

**Why:** Architecture is non-obvious. Document it once for contributors and curious visitors.

**Site map:**
```
eeshans.com/
├── /                          # Home
├── /about                     # About
├── /projects/{id}             # Project hubs
├── /stack/                    # Architecture + workflows
├── /writing/{slug}            # Posts (with projectId)
└── /contribute/               # Follow the build
```

**Nav order:** About | Projects | Stack | Writing | Contribute

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Create `/stack` page with architecture diagram | HTML/Tailwind boxes |
| ✅ | Document analytics flow | 6-step pipeline |
| ✅ | Document project bootstrap workflow | 8 steps |
| ✅ | Add shared `<Timeline>` component to stack | Reuses from home |
| ✅ | Writing workflow section | Frontmatter example |
| ✅ | Key file reference links | supabase-schema, cloudflare-proxy, projects.yaml |
| ✅ | Add `/stack` to nav | Order: About, Projects, Stack, Writing, Contribute |

---

## DRY Inventory

| Pattern | Location | Used By |
|---------|----------|---------|
| Project metadata | `projects.yaml` | Home, hub, stack, contribute, ProjectCard |
| Status badges | `STATUS_CONFIG` in `projects.ts` | ProjectCard, Timeline, hub |
| Stats fetch | Inline in ProjectCard → extract to `fetchProjectStats()` | ProjectCard, hub, home |
| Post-project linking | `getPostsByProject()` | Hub, home featured |
| Timeline | Inline in index.astro → extract to `<Timeline>` | Home, stack |
| Connection status | New `<ConnectionStatus>` | Game, contribute |
| AI story | `projects.yaml.aiStory` | Hub |

---

## Execution Order

1. **Phase 1** (remaining): Schema + utils + component extraction
2. **Phase 2**: Hub page (consumes Phase 1 patterns), then game polish
3. **Phase 3**: Contribute reframe + analysis post (hub links to it)
4. **Phase 4**: Stack page documents what we built

---

## GitHub Issues

| Phase | Issue | Tasks |
|-------|-------|-------|
| 1 | [#86 Shared Infrastructure](https://github.com/eeshansrivastava89/soma-portfolio/issues/86) | 5 |
| 2 | [#87 Project Hub + Game Polish](https://github.com/eeshansrivastava89/soma-portfolio/issues/87) | 7 |
| 3 | [#88 Contribute + Content](https://github.com/eeshansrivastava89/soma-portfolio/issues/88) | 8 |
| 4 | [#89 Stack + Documentation](https://github.com/eeshansrivastava89/soma-portfolio/issues/89) | 7 |
