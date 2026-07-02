# Mode: job — Full A-G Evaluation

When the candidate pastes a job (text or URL), ALWAYS deliver the 7 blocks (A-F evaluation + G legitimacy):

## Liveness gate (URL inputs)

When the candidate pastes a **URL** (not JD text), confirm the posting is still live before doing any evaluation. A dead link must never reach Block A — a 404/expired page wastes a full A-G evaluation, report, and PDF on phantom content.

1. Get the page content: if you arrived here from `auto-pipeline` (its Step 0.5 already navigated and cleared the link), reuse that snapshot — do not navigate again. On a direct URL entry, navigate with Playwright (`browser_navigate` + `browser_snapshot`) and read the title, URL, and visible content.
2. Classify the posting:
   - **active posting evidence:** title/role + a real job description or an application/apply path
   - **closed posting evidence:** expired/closed/"no longer accepting applications", missing JD with only nav/footer, hard redirect to a generic careers/search page, or 404/410
3. If the posting appears closed, **stop before Block A**: tell the candidate the link is dead, and if the entry came from `data/pipeline.md`, mark it `- [x] ~~Company | Role~~ — oferta nieaktywna`. Do not generate an evaluation, report, or CV.
4. If the candidate pasted JD text (no URL), liveness cannot be verified — note that and proceed; there is no link to check.

Do not continue to Block A until this gate is resolved. The snapshot captured here is reused by Block G's freshness signals.

## Step 0.5 — JD Fetch via API or Playwright

Before archetype detection, run `fetch-jd.mjs` for any of these supported platforms:

**API-based (zero browser, instant):**
- `job-boards.greenhouse.io`, `boards.greenhouse.io`, `job-boards.eu.greenhouse.io` (Anthropic, PlayStation, Life360, Reddit, and others)
- `jobs.ashbyhq.com` (Decagon and others)

**Playwright-based (headless browser, ~25s):**
- `www.google.com/about/careers` (Google Careers SPA)
- `jobs.microsoft.com` (Microsoft Jobs SPA)
- `metacareers.com` (Meta Careers — login wall likely, see below)

Run:
```bash
node fetch-jd.mjs <url>
```

**Interpreting the result:**
- `description` field present: use it as the JD for all blocks A-G. Mark the report header:
  - `**Verification:** confirmed (Greenhouse API)` for Greenhouse URLs
  - `**Verification:** confirmed (Ashby API)` for Ashby URLs
  - `**Verification:** confirmed (Playwright)` for Google/Microsoft
  Skip or abbreviate the Playwright navigation from the Liveness gate.
- `"error": "job-not-found"`: posting is dead — stop before Block A, same as the liveness gate rule.
- `"error": "login-required"`: Meta's login wall blocked the JD. Fall back to Playwright snapshot; mark `**Verification:** unconfirmed (login wall)` in the report.
- `"error": "jd-not-found"`: page loaded but JD markers were absent (role may have changed structure). Fall back to Playwright snapshot.
- Any other `error` (timeout, network-error, empty-description, unsupported-platform): fall back to the Playwright snapshot from the Liveness gate.

For all other URLs (LinkedIn, Lever, Workday, etc.): skip this step entirely and use the Playwright snapshot.

## Step 0 — Archetype Detection

Classify the job into one of the 6 archetypes (see `_shared.md`). If it is a hybrid, indicate the 2 closest ones. This determines:
- Which proof points to prioritize in block B
- How to rewrite the summary in block E
- Which STAR stories to prepare in block F

## Step 0.7 — Gupy Platform Detection

Apply `modes/_shared.md` § Platform Detection: Gupy — check if the URL host ends in `.gupy.io`. If it does, this offer is Gupy: no PDF will be generated regardless of score (see the Post-evaluation section below), the report header carries the Gupy PDF line, and the chat output must tell the candidate this is a Gupy posting and that `/career-ops gupy {slug}` is available on request. Do not generate the apresentação/skills text automatically — only note availability.

## Block A — Role Summary

Table with:
- Archetype detected
- Domain (platform/agentic/LLMOps/ML/enterprise)
- Function (build/consult/manage/deploy)
- Seniority
- Remote (full/hybrid/onsite)
- Team size (if mentioned)
- TL;DR in 1 sentence

## Block B — Match with CV

Read `cv.md`. Create a table with each JD requirement mapped to exact lines in the CV. Keep this block's rigor intact even under time pressure — the Pre-Screen Gate below reads its Gaps section directly, so a rushed or abbreviated gap analysis here degrades the gate's decision.

**Adapted to the archetype:**
- If FDE → prioritize delivery speed and client-facing proof points
- If SA → prioritize system design and integrations
- If PM → prioritize product discovery and metrics
- If LLMOps → prioritize evals, observability, pipelines
- If Agentic → prioritize multi-agent, HITL, orchestration
- If Transformation → prioritize change management, adoption, scaling

**Gaps** section with mitigation strategy for each. For each gap:
1. Is it a hard blocker or a nice-to-have?
2. Can the candidate demonstrate adjacent experience?
3. Is there a portfolio project that covers this gap?
4. Concrete mitigation plan (phrase for cover letter, quick project, etc.)

## Pre-Screen Gate

**Skip this entire section if this Block B was invoked from `modes/pipeline.md`** — that mode applies its own Pre-Screen Gate section instead, and its per-URL loop already accounts for the fact no live user may be watching. Continuing past Block B straight into `pipeline.md`'s own gate (rather than reading this section at all) avoids ever landing in this section's interactive "ask and wait" behavior during a semi-autonomous multi-URL run.

For direct `/career-ops oferta` or single-URL `auto-pipeline` invocations: stop here and apply the Pre-Screen Gate (checks, thresholds, and tiers defined in `modes/_shared.md` § Pre-Screen Gate (Quick Estimate)) before committing to Blocks C-G — the WebSearch-heavy, interview-plan-heavy ~70% of this mode. Use only what Step 0 (archetype) and Block B (gaps) already produced. Zero new tool calls.

**Outcome, using the thresholds `_shared.md` resolved from `config/profile.yml`:**

- **≥ `prescreen_ask_threshold` (good fit):** proceed straight to Block C below. No summary, no interruption.
- **`prescreen_score_threshold`–`prescreen_ask_threshold` (borderline):** show the Pre-Screen Summary (format below) and ask: *"Fit incerto (~X/5). Quer a análise completa (Blocks C-G + WebSearch + relatório) ou prefere pular?"* Wait for the answer. If proceed → continue to Block C. If skip → handle as below.
- **< `prescreen_score_threshold`, a Deal-Breaker fired, or 2+ unmitigated hard-blocker CORE gaps (clear bad fit):** show the Pre-Screen Summary, state the full evaluation is being skipped by default, and offer a brief one-line override (e.g. "responda se quiser a análise completa mesmo assim"). Do not block waiting for a response — treat silence/moving on as confirmation to skip.

**Pre-Screen Summary format** (shown in chat, never saved as a report file):

```markdown
**Pré-análise: {Company} — {Role}**
- Arquétipo: {detected} ({fit tier from config/profile.yml, or "fora dos arquétipos-alvo" if none})
- Gap central: {the single strongest reason, 1 sentence}
- Estimativa: ~{X.X-Y.Y}/5 ({tier label})
```

The tier-specific question/notice sentence from the Outcome bullets above is the recommendation — don't template a separate line for it.

**When skipping (either tier):**
- Do NOT call `reserve-report-num.mjs`. Do NOT write a report file. Do NOT write a TSV to `batch/tracker-additions/`. Do NOT touch `data/applications.md`.
- If the offer came from a URL (not raw pasted JD text), append one row to `data/scan-history.tsv` (existing columns: `url, first_seen, portal, title, company, status, location`) with status `skipped_prescreen` — matching this file's existing `skipped_*` naming convention (`skipped_title`, `skipped_dup`, `skipped_expired`, etc.) — today's date, and whatever company/title/location is known. Skip this log for raw pasted JD text — nothing to dedup against. **Tradeoff to flag to the user if they ask why an offer never resurfaced:** every non-`added` status in this file permanently suppresses that URL from future `/career-ops scan` results, with no recheck window. Unlike the other `skipped_*` statuses (which record deterministic facts — a dead link, a blocked host), `skipped_prescreen` is written from a cheap, no-WebSearch estimate that could be wrong. If the user's target archetypes broaden later, or they think the gate misjudged an offer, they can still manually re-add the URL to `data/pipeline.md` to force a fresh evaluation — the scan-history entry only suppresses automatic resurfacing, not manual re-entry.

**When proceeding:** continue to Block C exactly as below — nothing else changes.

## Block C — Level and Strategy

1. **Level detected** in the JD vs **candidate's natural level for that archetype**
2. **"Sell senior without lying" plan**: specific phrases adapted to the archetype, concrete achievements to highlight, how to position founder experience as an advantage
3. **"If they downlevel me" plan**: accept if compensation is fair, negotiate 6-month review, clear promotion criteria

## Block D — Comp and Demand

Use WebSearch for:
- Current salaries for the role (Glassdoor, Levels.fyi, Blind)
- Company's compensation reputation
- Demand trend for the role

Table with data and cited sources. If there is no data, state it instead of inventing.

## Block E — Customization Plan

| # | Section | Current status | Proposed change | Why |
|---|---------|---------------|------------------|---------|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 changes to CV + Top 5 changes to LinkedIn to maximize match.

## Block F — Interview Plan

6-10 STAR+R stories mapped to JD requirements (STAR + **Reflection**):

| # | JD Requirement | STAR+R Story | S | T | A | R | Reflection |
|---|-----------------|-----------------|---|---|---|---|------------|

The **Reflection** column captures what was learned or what would be done differently. This signals seniority — junior candidates describe what happened, senior candidates extract lessons.

**Story Bank:** If `interview-prep/story-bank.md` exists, check if any of these stories are already there. If not, append new ones. Over time this builds a reusable bank of 5-10 master stories that can be adapted to any interview question.

**Selected and framed according to the archetype:**
- FDE → emphasize delivery speed and client-facing
- SA → emphasize architectural decisions
- PM → emphasize discovery and trade-offs
- LLMOps → emphasize metrics, evals, production hardening
- Agentic → emphasize orchestration, error handling, HITL
- Transformation → emphasize adoption, organizational change

Also include:
- 1 recommended case study (which of their projects to present and how)
- Red-flag questions and how to answer them (e.g., "why did you sell your company?", "do you have a team of reports?")

## Block G — Posting Legitimacy

Analyze the job posting for signals that indicate whether this is a real, active opening. This helps the user prioritize their effort on opportunities most likely to result in a hiring process.

**Ethical framing:** Present observations, not accusations. Every signal has legitimate explanations. The user decides how to weigh them.

### Signals to analyze (in order):

**1. Posting Freshness** (from the Playwright snapshot captured during the liveness gate, or in `auto-pipeline` Step 0; unavailable if only JD text was pasted):
- Date posted or "X days ago" -- extract from page
- Apply button state (active / closed / missing / redirects to generic page)
- If URL redirected to generic careers page, note it

**2. Description Quality** (from JD text):
- Does it name specific technologies, frameworks, tools?
- Does it mention team size, reporting structure, or org context?
- Are requirements realistic? (years of experience vs technology age)
- Is there a clear scope for the first 6-12 months?
- Is salary/compensation mentioned?
- What ratio of the JD is role-specific vs generic boilerplate?
- Any internal contradictions? (entry-level title + staff requirements, etc.)

**3. Company Hiring Signals** (2-3 WebSearch queries, combine with Block D research):
- Search: `"{company}" layoffs {year}` -- note date, scale, departments
- Search: `"{company}" hiring freeze {year}` -- note any announcements
- If layoffs found: are they in the same department as this role?

**4. Reposting Detection** (from scan-history.tsv):
- Check if company + similar role title appeared before with a different URL
- Note how many times and over what period

**5. Role Market Context** (qualitative, no additional queries):
- Is this a common role that typically fills in 4-6 weeks?
- Does the role make sense for this company's business?
- Is the seniority level one that legitimately takes longer to fill?

### Output format:

**Assessment:** One of three tiers:
- **High Confidence** -- Multiple signals suggest a real, active opening
- **Proceed with Caution** -- Mixed signals worth noting
- **Suspicious** -- Multiple ghost job indicators, investigate before investing time

**Signals table:** Each signal observed with its finding and weight (Positive / Neutral / Concerning).

**Context Notes:** Any caveats (niche role, government job, evergreen position, etc.) that explain potentially concerning signals.

### Edge case handling:
- **Government/academic postings:** Longer timelines are standard. Adjust thresholds (60-90 days is normal).
- **Evergreen/continuous hire postings:** If the JD explicitly says "ongoing" or "rolling," note it as context -- this is not a ghost job, it is a pipeline role.
- **Niche/executive roles:** Staff+, VP, Director, or highly specialized roles legitimately stay open for months. Adjust age thresholds accordingly.
- **Startup / pre-revenue:** Early-stage companies may have vague JDs because the role is genuinely undefined. Weight description vagueness less heavily.
- **No date available:** If posting age cannot be determined and no other signals are concerning, default to "Proceed with Caution" with a note that limited data was available. NEVER default to "Suspicious" without evidence.
- **Recruiter-sourced (no public posting):** Freshness signals unavailable. Note that active recruiter contact is itself a positive legitimacy signal.

---

## Cover Letter Draft (auto-generated after Block G)

After saving the report and recording in the tracker, append a cover letter draft to the report file under `## Cover Letter Draft`. This is a starting point — not the final letter. The user completes it via `/career-ops cover {slug}`.

**How to generate the draft:**

1. Read `cv.md` — select 4 achievement bullets most relevant to the JD's top requirements (exact wording, real metrics only)
2. Read `config/profile.yml` — extract candidate name, current role, years of experience
3. Write a 2-sentence opening based on the role title and JD mission language
4. Write a 1-paragraph profile intro from the cv.md summary, adapted to the JD domain
5. Leave the "Problems / Why this company / Approach" section as a placeholder — this requires user input
6. Detect and flag any gaps (domain mismatch, language requirement, start date urgency) so the user sees them immediately

**Draft format to append to the report:**

```markdown
## Cover Letter Draft

> Draft generated at evaluation time. Complete via `/career-ops cover {slug}` to fill in angles, confirm research, and generate the PDF.
> Gaps flagged below — address them during the cover flow.

---

**Opening** *(placeholder — refine with your "why this role" angle)*
{2-sentence opening based on JD role title and mission language}

**Profile introduction**
{1 paragraph from cv.md summary, adapted to JD domain and required competencies}

**Key achievements** *(selected from cv.md — exact wording preserved)*
- **{lead from cv.md},** {impact sentence with metric}.
- **{lead from cv.md},** {impact sentence with metric}.
- **{lead from cv.md},** {impact sentence with metric}.
- **{lead from cv.md},** {impact sentence with metric}.

**Problems I will solve** *(placeholder — requires company research + your input)*
> To be completed: what challenges does {company} face that you'd address? How would you approach them?

**Closing**
I am happy to discuss further at your convenience.

---

**Gaps flagged:**
{List any detected gaps — domain mismatch, language requirement, start date urgency, title mismatch. If none, write "None detected."}

**JD keywords to mirror** *(extracted for ATS + human read)*
{8-10 exact phrases from the JD}

---
*Run `/career-ops cover {slug}` to complete angles, confirm company research, and generate the PDF.*
```

Apply all language rules from `_shared.md` Professional Writing section to the draft content. No em dashes, no buzzwords, active voice, concrete claims only.

---

## Post-evaluation

**ALWAYS** after generating blocks A-G:

### 1. Save report .md

Save full evaluation in `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = next sequential number (3 digits, zero-padded). To allocate it atomically and prevent race conditions, you MUST run `node reserve-report-num.mjs` to claim the number (stdout returns `{###}`), write the report, and then run `node reserve-report-num.mjs --release {###}` to release the sentinel.
- `{company-slug}` = company name in lowercase, without spaces (use hyphens)
- `{YYYY-MM-DD}` = current date

**Report format:**

```markdown
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**URL:**
**Archetype:** {detected}
**Score:** {X/5}
**Legitimacy:** {High Confidence | Proceed with Caution | Suspicious}
**PDF:** {path or pending; if Gupy platform detected (Step 0.7), always use the exact Gupy line from `modes/_shared.md` § Platform Detection: Gupy, regardless of score}

---

## A) Role Summary
(full content of block A)

## B) Match with CV
(full content of block B)

## C) Level and Strategy
(full content of block C)

## D) Comp and Demand
(full content of block D)

## E) Customization Plan
(full content of block E)

## F) Interview Plan
(full content of block F)

## G) Posting Legitimacy
(full content of block G)

## H) Draft Application Answers
(only if score >= 4.5 — draft answers for the application form)

---

## Keywords extracted
(list of 15-20 keywords from the JD for ATS optimization)
```

### 2. Record in tracker

**ALWAYS** record in `data/applications.md`:
- Next sequential number
- Current date
- Company
- Role
- Score: match average (1-5)
- Status: `Evaluated`
- PDF: ❌ (or ✅ if auto-pipeline generated PDF; always ❌ for Gupy offers, see Step 0.7)
- Report: root-relative link `[001](reports/001-company-2026-01-01.md)` (when merged via `merge-tracker.mjs` it is normalized to be relative to the tracker's own dir, e.g. `../reports/...`; see #760)

**Tracker format:**

```markdown
| # | Date | Company | Role | Score | Status | PDF | Report |
```
