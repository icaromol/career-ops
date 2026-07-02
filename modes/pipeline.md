# Mode: pipeline — URL Inbox (Second Brain)

Process job URLs stored in `data/pipeline.md`. The user adds URLs at any time and then executes `/career-ops pipeline` to process them all.

## Liveness sweep

**Run this before processing any URLs.** Entries added by the scanner in headless/batch mode carry `**Verification:** unconfirmed (batch mode)` because Playwright was unavailable at scan time — they were never checked for liveness. Without a sweep, dead postings reach evaluation one tab at a time, burning time and tokens on phantom roles (a single inbox of 8 stale URLs produces 8 wasted evaluations).

Sweep all pending URLs in one batch with the zero-token liveness checker before the per-URL loop:

1. Collect every `- [ ]` URL from the "Pending" section into a temp file (one URL per line).
2. Run `node check-liveness.mjs --file <tmpfile>` (add `--throttle` for large batches to stay under WAF rate limits; it's pure Playwright, zero Claude tokens). The checker prints a per-URL verdict and exits non-zero if any are expired/uncertain.
3. For every URL the checker reports as **expired/closed**, resolve the pipeline entry instead of processing it: move it to "Processed" as `- [x] ~~URL | Company | Role~~ — posting expired (liveness sweep)` and, if it already has a tracker row, mark it `Discarded`. **Do not** extract the JD, evaluate, or generate a report/PDF for it.
4. Leave `uncertain` results in place to be confirmed during normal per-URL extraction (a transient timeout shouldn't drop a possibly-live posting).
5. Only the surviving live URLs continue to the per-URL processing loop below.

This complements — does not replace — the per-URL liveness gate in `auto-pipeline` (Step 0.5) and the `apply` preflight: the sweep drops the dead postings up front, in bulk, so the user never opens a tab or spends a token on them.

## Workflow

1. **Read** `data/pipeline.md` → search for `- [ ]` items in the "Pending" section. Run the **Liveness sweep** (above) first and drop any expired entries before continuing.
2. **For each surviving pending URL**:
   a. **Extract JD** using Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   b. If the URL is not accessible → mark as `- [!]` with a note and continue
   b.5. **Apply `modes/_shared.md` § Platform Detection: Gupy** — check if the URL host ends in `.gupy.io`. If it does, remember this for the PDF gate below (no PDF regardless of score) and for the end-of-run summary (flag it as Gupy so the candidate knows `/career-ops gupy {slug}` is available).
   c. **Run Step 0 (Archetype Detection) and Block A/B (Match with CV)** from `modes/oferta.md`, then apply the **Pre-Screen Gate** below. Only claim a `REPORT_NUM` (via `node reserve-report-num.mjs`, released via `--release <num>` after writing) once the gate says to proceed — never reserve a number for an offer that gets screened out.
   d. **If the gate says proceed**: continue the full evaluation — Blocks C-G → Report .md → PDF (if score >= `auto_pdf_score_threshold`) → Tracker. Move the entry: `- [x] #NNN | URL | Company | Role | Score/5 | PDF ✅/❌`.
   e. **If the gate says skip**: handle per the Pre-Screen Gate section below — no report, no report number, no tracker entry.

   **About the PDF gate (configurable):** **Gupy override first (see step 2.b.5 above):** if this offer was flagged as Gupy, skip PDF generation unconditionally — regardless of score — and use the exact Gupy line from `modes/_shared.md` § Platform Detection: Gupy in the report header's `**PDF:**` field. Do not evaluate the score-based gate below for Gupy offers.

   **Score-based gate (non-Gupy offers only):** Read `config/profile.yml` → `auto_pdf_score_threshold`. If the key does not exist, default to `3.0` (this mode's original gate). If the evaluation score is less than the threshold, skip PDF generation: write the report normally, show in the header `**PDF:** not generated — run /career-ops pdf {company-slug} to create on demand`, and mark PDF ❌ in the tracker. If the score is ≥ threshold, generate the PDF as usual.

   **Tuning it:** Generating a tailored PDF costs ~30–60s per entry (Playwright launch + HTML render) and produces files that often go unused — most roles score in the 2.x/3.x range and never reach the application stage. Raise `auto_pdf_score_threshold` (e.g. `4.0`) to write only the report for marginal offers and produce the PDF on demand via `/career-ops pdf {slug}`; set `0` to generate one for every offer. Both modes (Path A `/career-ops pipeline` and Path B `batch/batch-runner.sh`) read the same key, so behavior is identical regardless of which path processes an offer.
3. **If there are 3+ pending URLs**, launch agents in parallel (Agent tool with `run_in_background`) to maximize speed.
4. **At the end**, show summary table (including one row per pre-screened-out offer per the Pre-Screen Gate section below — its own steps say exactly what goes in each column, don't duplicate that here). For Gupy offers, the `Recommended action` column must note "Gupy — sem PDF; use /career-ops gupy {slug} para apresentação + habilidades" instead of a generic apply/skip recommendation:

```
| # | Company | Role | Score | PDF | Recommended action |
```

## Pre-Screen Gate (per surviving URL)

This mode never reads `modes/oferta.md`'s own Pre-Screen Gate section — step 2c above only asks for its Step 0/Block A/B *content*, not its gate. Apply this section instead: checks, thresholds, and tiers are defined once in `modes/_shared.md` § Pre-Screen Gate (Quick Estimate); this section only states pipeline.md's behavioral delta. Because this mode processes multiple URLs with the user not necessarily watching each one live, it cannot pause on a question per URL — resolve automatically instead of asking:

- **Good fit or Borderline (≥ `prescreen_score_threshold`):** proceed to Blocks C-G, as today — unlike the interactive gate, Borderline here does NOT ask; an uncertain fit is worth a real (if provisional) evaluation in a batch context, since silently skipping a possibly-good offer with no live checkpoint risks losing it permanently.
- **Clear bad fit (< `prescreen_score_threshold`, a `_profile.md` Deal-Breaker triggered, or 2+ hard-blocker CORE gaps with mitigation explicitly "none available"):** skip automatically.
  - Append one row to `data/scan-history.tsv` (status `skipped_prescreen`, matching this file's `skipped_*` convention) — note this permanently suppresses the URL from future scans on what is a provisional estimate, not a dead-link fact (same tradeoff as `oferta.md`'s gate; the user can still manually re-add the URL to force a fresh evaluation).
  - Move the entry from "Pending" to "Processed" as: `- [x] ~~URL | Company | Role~~ — pré-análise: fora do perfil (~X/5, {one-line reason})`.
  - Add one row to the end-of-run summary table (step 4 above): `Score` column shows `~X.X/5 (pré-análise)`, `PDF` shows `—`, `Recommended action` shows the one-line reason.
  - Do NOT write a report, do NOT reserve a report number, do NOT write to `data/applications.md` / `batch/tracker-additions/`.
  - Continue to the next URL.

## Format of pipeline.md

```markdown
## Pending
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Error: login required

## Processed
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

## Intelligent JD detection from URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with all SPAs.
2. **WebFetch (fallback):** For static pages or when Playwright is unavailable.
3. **WebSearch (last resort):** Search in secondary portals that index the JD.

**Special cases:**
- **LinkedIn**: May require login → mark `[!]` and ask the user to paste the text
- **PDF**: If the URL points to a PDF, read it directly with the Read tool
- **`local:` prefix**: Read the local file. Example: `local:jds/linkedin-pm-ai.md` → read `jds/linkedin-pm-ai.md`

## Automatic numbering

1. Run `node reserve-report-num.mjs` to claim the next sequential number (stdout returns `{###}`).
2. Write the report file using that number.
3. Release the sentinel by running `node reserve-report-num.mjs --release {###}` once the report is written.

## Source synchronization

Before processing any URL, verify sync:
```bash
node cv-sync-check.mjs
```
If there is a desynchronization, warn the user before continuing.
