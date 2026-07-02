# Architecture

## System Overview

```
                    ┌─────────────────────────────────┐
                    │         AI Coding CLI Agent      │
                    │  (reads AGENTS.md/CLAUDE.md +    │
                    │   .agents/skills/career-ops/      │
                    │   SKILL.md + modes/*.md)          │
                    └──────────┬──────────────────────┘
                               │
       ┌───────────────┬──────┼──────────────┬───────────────────┐
       │                │             │                │
┌──────▼──────┐  ┌──────▼──────┐  ┌───▼─────────┐  ┌───▼────────────┐
│ Intake /     │  │ Single Eval │  │ Portal Scan │  │ Batch Process  │
│ Discovery    │  │ (auto-pipe, │  │ (scan.md)   │  │ (batch.md +    │
│ (scan/fetch) │  │  oferta.md) │  │             │  │  batch-runner) │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └───────┬────────┘
       │                │                 │                 │
       │         ┌──────▼──────┐   ┌──────▼──────┐    ┌────▼─────┐
       │         │ Pre-Screen  │   │ pipeline.md │    │ N `claude │
       │         │ Gate (Block │   │ (URL inbox) │    │ -p` workers│
       │         │ G, cheap    │   └─────────────┘    │ (headless)│
       │         │ estimate)   │                       └────┬─────┘
       │         └──────┬──────┘                             │
┌──────▼────────────────▼─────────────────────────────────────▼──────┐
│                         Output Pipeline                              │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ Report.md│  │  PDF (HTML  →   │  │ Tracker TSV                │ │
│  │ (A-G eval)│  │  Playwright)   │  │ (batch/tracker-additions/  │ │
│  │           │  │  skipped for   │  │  → merge-tracker.mjs)      │ │
│  │           │  │  Gupy postings │  │                            │ │
│  └──────────┘  └────────────────┘  └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ data/applications.md │
                    │ (canonical tracker)  │
                    └──────────┬───────────┘
                               │  node tracker.mjs sync (derived, disposable)
                    ┌──────────▼──────────┐        ┌───────────────────┐
                    │ data/applications.db │◀───────│ dashboard/ (Go TUI)│
                    │ (SQLite query index)  │        │ reads applications │
                    └───────────────────────┘        │ .md directly, not  │
                                                       │ the SQLite index   │
                                                       └───────────────────┘
```

## Evolution (339 commits, v1.0.0 → v1.12.0)

The project started as a single-CLI (Claude Code) evaluation pipeline and grew into a multi-CLI, multi-language, plugin-based job search platform. Rough phases, from `git log`:

1. **Foundation** — core `/career-ops` evaluation workflow, `applications.md` tracker, `portals.yml` scanning, German/French language packs, auto-update system with the user/system data contract.
2. **Provider expansion** — zero-token ATS scanning matured into a plugin system (`providers/*.mjs`: Greenhouse, Ashby, Lever, Workday, SmartRecruiters, Workable, Recruitee, RemoteOK, Remotive, Glints, JobStreet, Arbeitsagentur, Eightfold, and more), plus Japanese, Korean, Turkish, Portuguese (BR), and Arabic modes. The Pre-Screen Gate (Block G) and the Go TUI dashboard were introduced here.
3. **Bulk evaluation & resilience** — the batch runner (`batch-runner.sh` + `claude -p` workers) matured with model/parallelism flags, resumable state, and Playwright-based liveness checking to catch expired postings and anti-bot walls.
4. **Advanced CV & application tooling** — cover letter generation, LaTeX/Overleaf export (`build-cv-latex.mjs`, `generate-latex.mjs`), deep CV × JD review modes (`cv-review.md`, `cv-review-rewrite.md`), JD fetchers for Greenhouse/Ashby/Google/Microsoft/Meta (`fetch-jd.mjs`), and a SQLite-derived tracker index (`tracker.mjs`, RFC #918) for reliable querying at scale.
5. **Current (v1.11–v1.12)** — CLI-agnostic skill routing (Claude Code, OpenCode, Gemini CLI, Qwen, Copilot, Codex, Antigravity all read the same `modes/`), consolidation onto a single canonical CV template (`cv-template-flat.html`), Google Careers scraping (`scan-google.mjs`), and automatic Gupy-platform detection (skips PDF generation, routes to `gupy.md`).

Commit mix skews toward hardening: roughly 30% `fix`, 21% `feat`, 18% `docs` (largely README translations), 9% `chore`. Most-touched areas: docs/README translations, `scan`, `dashboard`, `update-system`, `batch`.

## Evaluation Flow (Single Offer)

1. **Input**: user pastes JD text or URL.
2. **Extract**: `fetch-jd.mjs` (Greenhouse/Ashby APIs, Playwright fallback for Google/Microsoft/Meta) or Playwright/WebFetch extracts the JD.
3. **Pre-Screen Gate** (`_shared.md` Block G): a zero-tool-call cheap estimate against deal-breakers, archetype fit, and gap severity. Below `prescreen_score_threshold` → skip with an override offer; in the ask band → confirm with the user; above `prescreen_ask_threshold` → proceed automatically to the full evaluation.
4. **Classify**: detect archetype (from `modes/_profile.md` / `config/profile.yml`).
5. **Evaluate**: blocks A–F (role summary, CV match/gaps, level strategy, comp research via WebSearch, CV personalization plan, interview prep) plus Block G (posting legitimacy tier — does not affect the numeric score).
6. **Score**: weighted average across scoring dimensions (1–5).
7. **Report**: saved as `reports/{num}-{company-slug}-{date}.md`, including a `## Machine Summary` YAML block for downstream scripts.
8. **PDF**: `generate-pdf.mjs` renders `templates/cv-template-flat.html` via headless Chromium (Playwright) — **skipped automatically for Gupy postings** (`.gupy.io` hosts), which route to `gupy.md` instead for apresentação/skills text.
9. **Track**: a TSV is written to `batch/tracker-additions/`, later merged by `merge-tracker.mjs`.

## Intake / Discovery Layer

- **`scan.mjs`** — zero-token scanner. Loads plugins from `providers/*.mjs`, each exporting `{ id, detect(entry), fetch(entry, ctx) }`. Reads `portals.yml` for tracked companies and filters, writes matches to `data/pipeline.md` and dedup history to `data/scan-history.tsv`. Supports `--verify` (Playwright liveness check before writing).
- **`providers/`** — one file per source: `greenhouse.mjs`, `ashby.mjs`, `lever.mjs`, `workday.mjs`, `smartrecruiters.mjs`, `workable.mjs`, `recruitee.mjs`, `remoteok.mjs`, `remotive.mjs`, `glints.mjs`, `jobstreet.mjs`, `arbeitsagentur.mjs`, `ibm.mjs`, `solidjobs.mjs`, `workingnomads.mjs`, `eightfold.mjs`, `local-parser.mjs` (delegates to a user-supplied script for custom SSR career pages), plus shared `_http.mjs` and `_types.js`. New sources are added as a new provider file — no changes to `scan.mjs` itself.
- **`scan-ats-full.mjs`** — reverse ATS discovery. Instead of scanning companies you already track, it walks public ATS directories (Greenhouse, Lever, Ashby, Workday) from the `job-board-aggregator` dataset and surfaces fresh postings matching your `title_filter`/`location_filter`, caching directory data for 24h.
- **`scan-google.mjs`** — Playwright scraper for Google Careers search results (paginated).
- **Liveness trio**: `liveness-core.mjs` (pattern-based classifier — expired markers, bot-challenge detection, multilingual "no longer available" text), `liveness-browser.mjs` (Playwright wrapper with realistic UA to dodge WAFs, headed-browser fallback on challenge), `check-liveness.mjs` (CLI entry point, bulk URL checking).

## Batch Processing

```
batch-input.tsv    →  batch-runner.sh  →  N × `claude -p` workers
(one URL per line)    (orchestrator)       (headless, one per offer)
                           │
                    batch-state.tsv
                    (progress, retry, resume)
```

`batch-runner.sh` is **Claude-Code-specific** — it invokes `claude -p` directly (with `--dangerously-skip-permissions` and an appended system prompt), and supports `--parallel N`, `--model`, `--retry-failed`, and `--resume-paused`. It does not take a `--cli` flag to target other CLIs. For headless batch work on other CLIs (OpenCode, Gemini, Copilot, Codex, Qwen, Antigravity), see the "Headless / Batch Mode" command table in `AGENTS.md` — those are invoked directly by the user/orchestrator, not through `batch-runner.sh`.

Each worker produces a report `.md`, a PDF (unless Gupy-detected), and a tracker TSV line in `batch/tracker-additions/`. `reserve-report-num.mjs` atomically reserves the next report number (`O_CREAT|O_EXCL`) to avoid collisions across parallel workers.

## Data Flow

```
cv.md                       →  Evaluation context (canonical CV)
article-digest.md           →  Proof points for matching (optional)
config/profile.yml          →  Candidate identity, thresholds
modes/_profile.md           →  Archetypes, narrative, negotiation scripts (user layer)
portals.yml                 →  Scanner configuration (companies, filters)
templates/states.yml        →  Canonical status values
templates/cv-template-flat.html → PDF generation template (single canonical template)
templates/cv-template.tex   →  LaTeX/Overleaf template
```

## File Naming Conventions

- Reports: `{###}-{company-slug}-{YYYY-MM-DD}.md` (3-digit zero-padded, sequential)
- PDFs: `cv-candidate-{company-slug}-{YYYY-MM-DD}.pdf`
- Tracker TSVs: `batch/tracker-additions/{num}-{company-slug}.tsv`

## Pipeline Integrity

| Script | Purpose |
|--------|---------|
| `merge-tracker.mjs` | Merges batch TSV additions into `applications.md` (handles 9-col, 8-col, and pipe-delimited formats; dedups by report number and fuzzy company+role) |
| `verify-pipeline.mjs` | Health check: canonical statuses, duplicates, broken report links, score format |
| `dedup-tracker.mjs` | Removes duplicate entries by normalized company + fuzzy role match, keeps the highest score |
| `normalize-statuses.mjs` | Maps status aliases to canonical values (`templates/states.yml`) |
| `reconcile-pipeline.mjs` | Syncs `data/pipeline.md` "Pendientes" against `batch/batch-state.tsv`, moving processed/skipped offers to "Procesadas" |
| `reserve-report-num.mjs` | Atomically reserves the next report number to prevent races in parallel batch runs |
| `role-matcher.mjs` | Shared fuzzy company/role matching used by `merge-tracker.mjs` and `dedup-tracker.mjs` |
| `tracker-links.mjs` | Normalizes report links to be relative to the tracker file's own directory |
| `cv-sync-check.mjs` | Validates setup consistency (CV present, no hardcoded metrics in system files) |
| `tracker.mjs` | Builds/queries the SQLite-derived index (`data/applications.db`) over `applications.md` — see below |

## Tracker: Markdown Source of Truth + Derived SQLite Index

`data/applications.md` remains the single source of truth; all writes go there (`merge-tracker.mjs`, hand edits). `node tracker.mjs sync` builds `data/applications.db` (SQLite, `node:sqlite`, no new dependency) as a **read-only, disposable** derived index — safe to delete at any time, it regenerates on the next sync. It exists because markdown tables degrade at scale (encoding corruption, column drift) and different models/CLIs can parse the same markdown inconsistently; the SQLite index normalizes on sync so queries are deterministic. `tracker.mjs query`/`history` auto-resync when the markdown has changed, so reads can't go stale. `tracker.mjs export` is the lossless inverse (db → markdown).

The **dashboard** (below) reads `applications.md` directly via regex parsing — it does not query the SQLite index.

## Dashboard TUI

`dashboard/` is a standalone Go TUI application (Bubble Tea/Lip Gloss) that visualizes the pipeline by parsing `data/applications.md` directly:

- Filter tabs: All, Evaluated, Applied, Interview, Top ≥4, Skip
- Sort modes: Score, Date, Company, Status
- Grouped/flat view, lazy-loaded report previews, inline status picker

## Update System

- **`update-system.mjs`** (`check` / `apply` / `rollback` / `dismiss`) — syncs system-layer files from the canonical GitHub repo against an explicit allowlist (`DATA_CONTRACT.md`'s System Layer). Never touches user-layer files. `apply` creates a timestamped backup branch before writing.
- **`doctor.mjs`** — onboarding/cold-start check: Node version, dependencies, Playwright Chromium, required files present. `doctor.mjs --json` is what `CLAUDE.md`/`AGENTS.md` invoke on first message of a session.

## CLI Integration

The canonical skill lives at `.agents/skills/career-ops/SKILL.md` and routes `/career-ops {subcommand}` to the matching `modes/*.md` file (loading `modes/_shared.md` alongside it for most modes). `.opencode/` and `.qwen/` skill directories point at the same file (symlink/reference), so Claude Code, OpenCode, Gemini CLI, Qwen Code, and other agent-skill-standard CLIs all execute identical instructions — only the CLI-specific permission/settings layer differs.

Language modes (`modes/de`, `fr`, `pt`, `ja`, `ru`, `ua`, `ar`, `tr`) each replicate `_shared.md`'s evaluation logic and the evaluation/apply/pipeline modes in the target language; `modes/languages.md` handles routing/detection.
