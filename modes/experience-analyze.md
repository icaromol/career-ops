# Mode: experience-analyze — Work Experience Section Analyzer

## Purpose

Analyze the Work Experience (Experiência Profissional) section of `cv.md` against 6 research-backed dimensions. Produce a scored report saved to `reports/experience-analysis-{YYYY-MM-DD}.md` and present a structured scorecard in chat.

If a job description or target role is provided, include a keyword-gap table showing which JD terms are missing from the experience section.

---

## Inputs

Read these files before starting:

1. `cv.md` — extract the **Experiência Profissional** (or "Work Experience") section — all entries
2. `config/profile.yml` — candidate name, target roles, headline
3. `modes/_profile.md` — archetypes, North Star, deal-breakers (for ATS keyword alignment)

**Optional input:** If the user passed a JD or target role as an argument, or pastes one after invocation, use it for Dimension 5 (ATS Compatibility). Ask if not provided:

```
Quer incluir uma vaga específica para análise de keywords? (cole o texto ou URL, ou diga "não" para análise geral)
```

---

## Evaluation Dimensions

Score each dimension from 0 to 2:
- **2** = Fully met with evidence
- **1** = Partially met or could be stronger
- **0** = Not met, active weakness

---

### Dimension 1 — Structure & Required Information

For **each experience entry**, verify the presence of:
- [ ] Job title (cargo)
- [ ] Company name (empresa)
- [ ] Date range (mês/ano início e fim, or "Atual")
- [ ] Location or remote indication (when relevant)

Score the **section as a whole:**
- **2**: All entries are complete and consistently formatted
- **1**: Minor gaps (1-2 entries missing period or location)
- **0**: Multiple entries missing critical fields (title, company, or dates)

---

### Dimension 2 — Achievements vs. Responsibilities

This is the most critical dimension.

For **every bullet point** in every entry, classify as:
- `CONQUISTA` — describes a result the candidate produced ("Reduziu o tempo de onboarding em 40%")
- `RESPONSABILIDADE` — describes a duty or task expected of the role ("Responsável por gerenciar o backlog")

Score:
- **2**: 70%+ of bullets are CONQUISTAs with clear before/after framing
- **1**: Mix — some CONQUISTAs but majority still read as RESPONSABILIDADEs
- **0**: Virtually all bullets are RESPONSABILIDADEs — no evidence of results

In the report, list the CONQUISTA/RESPONSABILIDADE classification for every bullet in the two most recent entries.

---

### Dimension 3 — Quantification & Evidence

Classify **each bullet** as:
- `QUANTIFICADO` — contains a concrete metric (%, R$, number of users, time saved, volume, NPS, revenue, team size, etc.)
- `PARCIALMENTE QUANTIFICADO` — has context but no number ("para uma base grande de clientes", "em prazo reduzido")
- `VAGO` — no measurable evidence at all

Score:
- **2**: 60%+ of CONQUISTA bullets are QUANTIFICADOS
- **1**: Some metrics present but majority of conquistas lack numbers
- **0**: No quantified achievements anywhere in the section

Count and report: X QUANTIFICADO, Y PARCIALMENTE QUANTIFICADO, Z VAGO across all entries.

---

### Dimension 4 — Language & Action Verbs

Check every bullet for:
- Does it **start with a strong action verb**? (past tense for closed roles, present for current)
- Are there **weak verbs** that signal passivity: "auxiliei", "participei", "apoiei", "ajudei", "colaborei", "fui responsável por", "trabalhei com"?
- Is there **verb repetition** — same verb used in multiple bullets within the same entry?

Strong verbs (preferred): liderou, implementou, reduziu, aumentou, estruturou, desenvolveu, negociou, otimizou, entregou, construiu, criou, conduziu, definiu, lançou, escalou, migrou, automatizou, redesenhou, captou, validou

Score:
- **2**: All bullets start with strong action verbs, no repetition, no passive constructions
- **1**: Mostly strong verbs but 2-3 weak instances or 1-2 repeated verbs
- **0**: Pervasive weak verbs, passive voice ("fui responsável por"), or heavy repetition

List any weak verbs or repeated verbs found.

---

### Dimension 5 — ATS Compatibility

**If a JD/vaga was provided:**
- Extract the top 10-15 keywords from the JD (technical skills, tools, methodologies, role-specific vocabulary)
- Check which of those keywords appear naturally in the experience section
- Produce a keyword-gap table

**If no JD was provided:**
- Use the primary archetype vocabulary from `modes/_profile.md` as the keyword baseline
- Note that analysis would be more precise with a specific JD

Also check for ATS-hostile formatting signals (if visible in the text): columns, tables, icons, special bullets — flag if detected.

Score:
- **2**: 70%+ of target keywords present; no formatting red flags
- **1**: 40-69% keyword coverage, or minor formatting concerns
- **0**: Below 40% keyword coverage, or clear ATS formatting issues

---

### Dimension 6 — Narrative Coherence & Progression

Review the experience section as a whole:
- Does the sequence of roles tell a story of **growth in scope, responsibility, or seniority**?
- Are there **unexplained time gaps** (more than 3 months between roles)?
- Are **old experiences** (10+ years ago) taking disproportionate space?
- For candidates in a career transition: does the narrative support or contradict the repositioning signaled in `modes/_profile.md`?

Score:
- **2**: Clear upward trajectory, no gaps, recent experience weighted correctly
- **1**: Mostly coherent but minor gaps or some old experience with excess detail
- **0**: No growth narrative, unexplained gaps, or old roles dominating the section

---

## Scoring

| Score | Interpretation |
|-------|---------------|
| 10–12 | Excellent — experience section is recruiter-ready |
| 7–9   | Good — targeted improvements will meaningfully increase callback rate |
| 4–6   | Needs work — multiple structural or quality gaps |
| 0–3   | Rewrite recommended — current section actively hurts more than helps |

---

## Output Format

### Chat response (show first)

```
## Work Experience Analysis

**Score: X/12** — [Excellent / Good / Needs Work / Rewrite Recommended]

**Diagnóstico Geral:** [2-3 sentences: direct assessment of the current state]

| # | Dimension | Score | Finding |
|---|-----------|-------|---------|
| 1 | Structure & Required Info | X/2 | [one-line finding] |
| 2 | Achievements vs. Responsibilities | X/2 | [one-line finding — X conquistas, Y responsabilidades] |
| 3 | Quantification & Evidence | X/2 | [X quantificado, Y parcial, Z vago] |
| 4 | Language & Action Verbs | X/2 | [one-line finding] |
| 5 | ATS Compatibility | X/2 | [keywords coverage or archetype alignment note] |
| 6 | Narrative Coherence | X/2 | [one-line finding] |

**Top 3 improvements (ordered by impact):**
1. [Highest-impact improvement with specific example from the CV]
2. [Second improvement]
3. [Third improvement]

Full report saved: reports/experience-analysis-{YYYY-MM-DD}.md
Run `/career-ops experience-optimize` to rewrite with discovery loop for missing metrics.
```

### File to save: `reports/experience-analysis-{YYYY-MM-DD}.md`

```markdown
# Work Experience Analysis — {YYYY-MM-DD}

**Candidate:** {name from config/profile.yml}
**Target Archetypes:** {from _profile.md}
**Score:** X/12 — {interpretation}
**JD used for ATS analysis:** {JD title/company or "Archetype baseline from _profile.md"}

## Diagnóstico Geral
{2-3 sentences on the overall state of the section}

## Detailed Scoring

### 1. Structure & Required Information — X/2
{List any entries with missing fields. Confirm which are complete.}

### 2. Achievements vs. Responsibilities — X/2

**Classification (2 most recent entries):**

| Entry | Bullet (excerpt) | Classification |
|-------|-----------------|----------------|
| {Company / Role} | {bullet excerpt} | CONQUISTA / RESPONSABILIDADE |
| ... | ... | ... |

{Summary: X% are CONQUISTAs across the section}

### 3. Quantification & Evidence — X/2

**Bullet inventory:**
- QUANTIFICADO: X bullets
- PARCIALMENTE QUANTIFICADO: Y bullets
- VAGO: Z bullets

**Examples of VAGO bullets that should be quantified:**
- "{bullet}" → suggest asking: {what metric would make this concrete?}

### 4. Language & Action Verbs — X/2
**Weak verbs found:** {list}
**Repeated verbs:** {list with entry name}
**Bullets starting with non-verb:** {list}

### 5. ATS Compatibility — X/2

**Keyword gap analysis:**

| Keyword | Present in CV? | Context (if present) |
|---------|---------------|---------------------|
| {keyword} | ✅ / ❌ | {where it appears or "missing"} |

**Coverage:** X/Y target keywords present ({%})

### 6. Narrative Coherence & Progression — X/2
{Assessment of growth trajectory, any gaps flagged, old roles note}

## Priority Improvements

| Priority | Dimension | Issue | Suggested Fix |
|----------|-----------|-------|---------------|
| 1 | {dimension} | {specific issue} | {specific action} |
| 2 | {dimension} | {specific issue} | {specific action} |
| 3 | {dimension} | {specific issue} | {specific action} |

---
*Generated by career-ops experience-analyze*
```

---

## Rules

- **Never edit `cv.md` in this mode.** Analysis only — no modifications.
- If `article-digest.md` exists, use it to verify whether numeric claims in experience bullets have documented proof points.
- The keyword-gap table is only as good as the JD provided. If none was provided, label the table "Archetype Baseline (no JD provided)" and suggest running again with a specific JD.
- If the experience section is in Portuguese, score and report in Portuguese. Weak verb list applies to Portuguese equivalents ("auxiliei", "apoiei", "participei", "colaborei", "fui responsável por").
- Direct the user to `/career-ops experience-optimize` to rewrite bullets — never rewrite in this mode.
