# Mode: resume-analyze — Professional Summary Analyzer

## Purpose

Analyze the current Professional Summary in `cv.md` against research-backed criteria for what works (and what doesn't) in recruiter-facing summaries. Produce a scored report saved to `reports/resume-analysis-{YYYY-MM-DD}.md` and present a structured summary in chat.

---

## Inputs

Read these files before starting:

1. `cv.md` — extract the **Resumo Profissional** (or "Professional Summary") section
2. `config/profile.yml` — candidate name, target roles, headline
3. `modes/_profile.md` — archetypes, deal-breakers, North Star (for alignment scoring)

---

## Evaluation Criteria

Score each criterion from 0 to 2:
- **2** = Criterion fully met with evidence
- **1** = Partially met or could be stronger
- **0** = Not met, active weakness

### Criterion 1 — Structure (4 essential elements)
Does the summary contain:
- [ ] Professional title or target role
- [ ] Years of experience in the area
- [ ] 2-3 key competencies essential for the target function
- [ ] 1-2 notable achievements demonstrating qualifications

### Criterion 2 — Quantification
Are achievements expressed with concrete numbers?
- **0**: No numbers at all ("improved processes", "grew the team")
- **1**: Some numbers but vague ("several clients", "significant growth")
- **2**: Specific, verifiable numbers ("25 paying clients", "40% revenue increase in 9 months")

### Criterion 3 — JD Keyword Alignment
Check `modes/_profile.md` for target archetypes and roles. Does the summary use vocabulary that mirrors how target JDs are written?
- **0**: Generic terms, no alignment with target role vocabulary
- **1**: Partial alignment with some target keywords
- **2**: Strong keyword alignment with primary archetype vocabulary

### Criterion 4 — Third Person Voice (no "I")
- **2**: No first-person pronouns — reads as a distanced, factual statement
- **1**: Mostly third person but slips in one or two first-person constructions
- **0**: Written in first person ("I built", "I led")

### Criterion 5 — Length and Density
- **2**: 2-4 sentences, tight, no filler — reads as an elevator pitch. Each sentence carries one idea; related proof points grouped into one sentence rather than fragmented.
- **1**: 5-6 sentences, or sentences that stack multiple ideas/clauses (title + context + operational detail all in one), making the reader work too hard.
- **0**: Too short (1 sentence, no context) or too long (7+ sentences, becomes a wall). Or every sentence is overloaded — subordinate clauses exceeding 12 words each.

### Criterion 6 — No Prohibited Buzzwords
Check for: "hardworking", "team player", "proven track record", "works well under pressure", "quick learner", "people person", "passionate about", "results-oriented", "leveraged", "spearheaded", "synergies", "cutting-edge", "go-getter", "detail-oriented", "creative", "dynamic", "motivated self-starter"
- **2**: Zero prohibited terms
- **1**: 1-2 generic phrases present
- **0**: 3+ buzzwords — significant noise

### Criterion 7 — Show, Don't Tell (evidence over claims)
Does each claim have evidence behind it? Apply the test: *"Could this appear in any other candidate's summary?"*
- **2**: Every claim is specific to this candidate's trajectory — not portable to another person
- **1**: Mix of specific and generic claims
- **0**: All claims are generic ("strategic thinker", "collaborative leader") — could belong to anyone

### Criterion 8 — North Star Alignment
Compare the summary to the primary archetypes in `modes/_profile.md`. Does the summary immediately signal the target role category?
- **2**: First sentence places the candidate squarely in the target archetype
- **1**: Archetype emerges but requires reading the whole summary
- **0**: Summary is misaligned with current target archetypes — signals a different type of candidate

### Criterion 9 — Industry Trend Awareness (optional signal)
Does the summary reference a relevant industry trend in a specific, non-buzzwordy way?
- **2**: Mentions a concrete trend with context (e.g., "delivering GenAI features in production", not just "AI enthusiast")
- **1**: References trend but vaguely
- **0**: No industry signal, or mentions outdated/generic trend

---

## Scoring

| Score | Interpretation |
|-------|---------------|
| 16-18 | Excellent — submit as-is, minor polish only |
| 12-15 | Good — targeted improvements will materially increase callback rate |
| 8-11  | Needs work — several structural or quality gaps |
| 0-7   | Rewrite recommended — current summary actively hurts more than helps |

---

## Output Format

### Chat response (show first)

Present a compact scorecard:

```
## Resume Summary Analysis

**Score: X/18** — [Excellent / Good / Needs Work / Rewrite Recommended]

| # | Criterion | Score | Finding |
|---|-----------|-------|---------|
| 1 | Structure | X/2 | [one-line finding] |
| 2 | Quantification | X/2 | [one-line finding] |
| 3 | Keyword Alignment | X/2 | [one-line finding] |
| 4 | Third Person Voice | X/2 | [one-line finding] |
| 5 | Length & Density | X/2 | [one-line finding] |
| 6 | No Buzzwords | X/2 | [one-line finding] |
| 7 | Show Don't Tell | X/2 | [one-line finding] |
| 8 | North Star Alignment | X/2 | [one-line finding] |
| 9 | Industry Trend | X/2 | [one-line finding] |

**Top 3 improvements (ordered by impact):**
1. [Highest-impact improvement with specific rewrite suggestion]
2. [Second improvement]
3. [Third improvement]

Full report saved: reports/resume-analysis-{YYYY-MM-DD}.md
```

### File to save: `reports/resume-analysis-{YYYY-MM-DD}.md`

```markdown
# Resume Summary Analysis — {YYYY-MM-DD}

**Candidate:** {name from config/profile.yml}
**Target Archetypes:** {from _profile.md}
**Score:** X/18 — {interpretation}

## Current Summary (as analyzed)

> {paste the exact current summary from cv.md}

## Detailed Scoring

### 1. Structure — X/2
{2-3 sentences explaining the score with evidence from the text}

### 2. Quantification — X/2
{evidence: which numbers exist, which claims lack them}

### 3. Keyword Alignment — X/2
{which target keywords are present / missing}

### 4. Third Person Voice — X/2
{exact quotes of any first-person constructions found}

### 5. Length & Density — X/2
{sentence count, filler phrases identified}

### 6. No Buzzwords — X/2
{list any prohibited terms found}

### 7. Show Don't Tell — X/2
{which claims pass the "any candidate" test, which fail}

### 8. North Star Alignment — X/2
{how clearly does the summary signal the primary archetype}

### 9. Industry Trend Awareness — X/2
{what trend signals are present or absent}

## Priority Improvements

| Priority | Criterion | Current | Suggested Rewrite |
|----------|-----------|---------|-------------------|
| 1 | [criterion] | "[exact current phrase]" | "[suggested replacement]" |
| 2 | [criterion] | "[exact current phrase]" | "[suggested replacement]" |
| 3 | [criterion] | "[exact current phrase]" | "[suggested replacement]" |

## Rewrite Suggestion (Optional Preview)

> {A rewritten version of the summary incorporating the top improvements. Mark clearly: "DRAFT — review before applying via /career-ops resume-optimize"}

---
*Generated by career-ops resume-analyze*
```

---

## Rules

- **Never edit `cv.md` in this mode.** Analysis only — no modifications.
- If `article-digest.md` exists, use it to verify whether numeric claims in the summary have backing proof points.
- The rewrite preview in the report is a suggestion, not an applied change. Direct the user to `/career-ops resume-optimize` to apply it.
- If the summary is in Portuguese, score and report in Portuguese. Prohibited buzzwords list applies equivalently to Portuguese equivalents ("apaixonado por", "orientado a resultados", "proativo", "comunicativo", "dinâmico").
