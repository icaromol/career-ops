# Mode: cv-review — CV × JD Deep Review

<!-- ============================================================
     CV Review Agent — keyword coverage, ATS audit, bullet quality
     Based on: Jobscan 2024, Resume Worded, Harvard Career Services,
     Scale.Jobs, LinkedIn Talent Blog 2025 research
     ============================================================ -->

## Invocation

```
/career-ops cv-review                        # uses JD + CV from context
/career-ops cv-review {report-slug}          # pulls JD from reports/{slug}.md
/career-ops cv-review {path/to/cv.html}      # reviews specific tailored CV file
```

If no JD in context → ask: "Cole a JD aqui ou informe o slug do report (ex: `126-ifood`)."
If no tailored CV in context → use `cv.md` as fallback, warn the user.

---

## STEP 0 — Load Sources

Read all of these before starting:

1. **CV source** — in priority order:
   - Tailored CV markdown if path provided or recently generated (check `/tmp/cv-*.html` or `output/cv-*.md`)
   - `cv.md` as fallback (warn: "Usando cv.md base — para revisão mais precisa, informe o CV tailorizado")

2. **JD source** — in priority order:
   - JD text already in conversation context
   - If slug provided: read `reports/{slug}.md` and extract the original JD text from the report
   - Otherwise: ask the user to paste

3. **Profile**: read `config/profile.yml` and `modes/_profile.md` for context

Confirm sources before proceeding:
```
Fontes carregadas:
  CV: {source path or "cv.md base"}
  JD: {company} — {role}
  Perfil: {candidate name}

Iniciando review em 14 passos...
```

---

## STEP 1 — Keyword Extraction from JD

Extract ALL keywords from JD and categorize into 4 layers. For each keyword, record **JD frequency** (how many times it appears — higher = higher priority).

| Layer | What to extract | Weight in scoring |
|-------|----------------|-------------------|
| **Hard Skills — Required** | Tools, languages, frameworks, methodologies explicitly marked as required/must-have | HIGH (35%) |
| **Hard Skills — Preferred** | "nice to have", "preferred", "plus", "desejável" | MEDIUM |
| **Domain Keywords** | Industry-specific terminology appearing 2+ times in the JD | MEDIUM (20%) |
| **Culture/Mindset Keywords** | Values, working style, cultural fit words | LOW |

**Extraction rules:**
- Include both acronym AND full form: "IA" → also flag "Inteligência Artificial"
- Flag keywords that appear 3+ times as **CRITICAL**
- Flag keywords that appear 2 times as **HIGH**
- Flag keywords appearing once as **NORMAL**
- Identify "required" vs "preferred" sections explicitly

Output: Numbered keyword list with layer, frequency, and priority level.

---

## STEP 2 — CV Keyword Coverage Scan

For EVERY keyword from STEP 1, scan the CV and classify:

- **✅ PRESENTE** — exact match or clear semantic equivalent (ex: "product discovery" = "discovery de produto")
- **⚠️ PARCIAL** — concept present but different language from JD → opportunity for mirroring
- **❌ AUSENTE** — not found in any form

For each PRESENTE keyword, record WHERE it appears:
- `[T]` — Job title / headline
- `[S]` — Professional Summary
- `[K]` — Skills section
- `[E]` — Experience bullet (note which role)
- `[F]` — Education/Formation

**The 3-Position Rule:** Keywords appearing in [S] + [K] + [E] get maximum ATS weight. Track this explicitly.

Build the full coverage table:

```
| Keyword          | Layer    | Freq JD | CV Status | Positions    | 3-Pos? |
|------------------|----------|---------|-----------|--------------|--------|
| product discovery| Required | 3x ⚠️  | ✅ PRESENTE| [S][K][E]    | ✅     |
| antifraude       | Preferred| 4x ⚠️  | ⚠️ PARCIAL | [K]          | ❌     |
| PLD              | Domain   | 2x      | ❌ AUSENTE | —            | ❌     |
```

---

## STEP 3 — Keyword Density Analysis

Count total words in CV body (exclude header/contact info).

For the top 10 keywords by JD frequency, calculate individual density (occurrences / total words × 100):

```
Total words in CV: ~{N}

Top keyword density:
  "product discovery": {N} occurrences = {X}% → {status}
  ...
```

Thresholds per keyword:
- < 0.5%: suboptimized — probably needs more placement
- 0.5-2%: good
- > 3% on a single keyword: potential stuffing flag

Overall keyword density (all tracked keywords combined):
- < 2%: underoptimized
- 2-4%: **IDEAL ZONE**
- > 5%: risk of ATS stuffing flag

---

## STEP 4 — Bullet Quality Audit (ACOE Formula)

Score EVERY experience bullet on 5 criteria (0 or 1 each = max 5/5):

| Criterion | Score 1 if... | Score 0 if... |
|-----------|--------------|---------------|
| **A — Action verb forte** | Starts with strong specific verb: Construí, Reduzi, Liderei, Defini, Migrei, Captei | Starts with "Responsável por", "Trabalhei em", "Ajudei a", "Participei" |
| **C — Contexto claro** | Scope is clear: which product, team size, company context | Vague: "in my role", "for the team" |
| **O — Outcome quantificado** | Has %, R$, time saved, count | "Melhorei", "Aumentei" without number |
| **E — Evidence/escala** | Scale present: "25 clientes", "13 pessoas", "150+ entrevistas" | Outcome without scale |
| **K — Keyword integrada** | At least 1 JD keyword appears naturally in the bullet | Zero JD keywords in the bullet |

**Score thresholds:**
- 5/5: Excellent — no change needed
- 4/5: Good — minor tweak
- 3/5: Acceptable — optimize if time allows
- < 3/5: **FLAG FOR REWRITE** — priority action

List ALL bullets with their scores. Flag every bullet scoring < 3.

---

## STEP 5 — ATS Formatting Audit

Check the CV (HTML or markdown) for ATS compatibility issues:

| Check | Criteria | Status |
|-------|----------|--------|
| Single-column layout | No sidebars, no 2-column sections | ✅/❌ |
| No tables in body text | Tables invisible to most ATS parsers | ✅/❌ |
| No images embedded in text flow | Decorative images/icons = ATS blind | ✅/❌ |
| Consistent date format | Same format throughout (mês/ano or MM/YYYY) | ✅/❌ |
| Standard section headers | Experiência, Formação, Habilidades (not creative alternatives) | ✅/❌ |
| No special separator characters | No ❖ ► ✦ ● as bullets (use · or -) | ✅/❌ |
| Acronym + full form | Tech terms introduced with full form first | ✅/❌ |
| Soft skills demonstrated | Soft skills proven by results, not just listed as adjectives | ✅/❌ |
| Contact info in body | Not in header/footer (ATS often ignores those) | ✅/❌ |
| Em-dashes / special chars | No — used as separators (ATS parses inconsistently) | ✅/❌ |

Note: flags base64 in HTML are invisible to ATS text extraction — this is fine (they're decorative), but the skill-level text that follows them IS parsed. No issue.

Count: {X}/10 checks passing.

---

## STEP 6 — Language Mirroring Analysis

Compare exact phrases in the JD vs. what the CV uses for the same concept. Find the 8-10 most impactful mirroring opportunities:

```
JD phrase              → CV uses              → Recommendation
"product discovery"    → "discovery"          → Mirror: use "product discovery" in [S]
"roadmap estratégico"  → "roadmap"            → Mirror: add "estratégico" qualifier
"times cross-func."    → "times multidisc."   → Both OK semantically — keep as is
"PLD"                  → not present          → Add acronym + full form in [K]
"AI FIRST"             → "IA em produção"     → Mirror company's exact branding in [S]
```

Mirroring priority: use exact JD phrasing for CRITICAL and HIGH keywords, especially in [S] and [K].

---

## STEP 7 — Inconsistency & Red Flag Detection

Scan for mismatches between CV claims and JD requirements:

**Seniority check:**
- JD expects: {seniority from JD}
- CV presents: {effective seniority shown by scope/team size/decisions}
- Gap? Y/N

**Experience years check:**
- JD requires: {X years in domain Y}
- CV shows: {years calculable from dates}
- Gap? Y/N

**Technology claims without evidence:**
- List skills in Skills section that have ZERO occurrence in any experience bullet
- These are "bare claims" — a recruiter WILL ask for examples
- Flag each one

**Timeline gaps:**
- Any period > 3 months unaccounted for in CV dates?

**Title mismatch:**
- CV job titles vs. JD title — would a recruiter's keyword search find this CV?

**Location/modality:**
- JD says: {remote/hybrid/onsite/city}
- CV declares: {what CV says}
- Compatible? Y/N

---

## STEP 8 — Match Score Calculation

Calculate score across 5 weighted dimensions:

```
DIMENSION 1 — Hard Skills Coverage (35 pts max)
  Required keywords found: {X} of {Y}
  Score: (X/Y) × 35 = {pts}

DIMENSION 2 — Domain Keywords Coverage (20 pts max)
  Domain keywords found: {X} of {Y}
  Score: (X/Y) × 20 = {pts}

DIMENSION 3 — 3-Position Rule (15 pts max)
  Top 10 critical keywords with [S]+[K]+[E]: {X} of 10
  Score: (X/10) × 15 = {pts}

DIMENSION 4 — Bullet Quality ACOE (20 pts max)
  Average bullet score: {avg}/5
  Score: (avg/5) × 20 = {pts}

DIMENSION 5 — ATS Formatting (10 pts max)
  Checks passing: {X} of 10
  Score: (X/10) × 10 = {pts}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE: {sum}/100

85-100 → Excelente — aplicar agora
70-84  → Bom — aplicar após ajustes menores
55-69  → Razoável — reescritas necessárias antes de aplicar
< 55   → Fraco — reconstruir CV tailorizado do zero
```

---

## STEP 9 — Prioritized Improvement Plan

Group all findings into 3 priority tiers, ordered by estimated score impact:

**🔴 CRÍTICO — Implementar agora (impacto estimado > 5 pts cada)**
List specific actionable items. For each:
- What to fix
- Where in the CV
- Estimated score gain

**🟡 ALTO — Implementar antes de aplicar (impacto 2-5 pts)**

**🟢 BAIXO — Nice to have (impacto < 2 pts)**

---

## STEP 10 — Concrete Bullet Rewrites

For every bullet flagged in STEP 4 (score < 3), provide a full rewrite:

```
━━━ BULLET {N} — {Company} ━━━

ORIGINAL:
"{exact bullet text}"

PROBLEMS:
  ✗ {criterion}: {specific issue}
  ✗ {criterion}: {specific issue}
SCORE: {X}/5

REWRITE SUGGESTION:
"{new bullet text with keywords naturally integrated}"

KEYWORDS ADDED: {keyword} (JD freq: {N}x), {keyword} (JD freq: {N}x)
ESTIMATED NEW SCORE: {X}/5
ESTIMATED SCORE IMPACT: +{N} pts on Dimension 4
```

---

## STEP 11 — Missing Keywords Insertion Guide

For every AUSENTE keyword from STEP 2, provide specific insertion guidance:

```
━━━ MISSING: "{keyword}" (JD freq: {N}x — {priority}) ━━━

Suggested insertions:
  → [S] Summary: "...{how to weave it in}..."
  → [K] Skills: add to {skill category} section
  → [E] Bullet: "{which role}" — suggest: "{how to integrate}"

Estimated impact: +{X} pts
```

---

## STEP 12 — Unresolvable Red Flags

List items the agent flags but that only the user can validate or address:

```
⚠️  RED FLAG: Skill "{X}" listed in Skills section but zero experience bullets demonstrate it.
    A recruiter WILL ask for a real example. Either:
    a) Add a brief bullet showing usage, or
    b) Remove from Skills if you can't defend it

⚠️  RED FLAG: Date gap {month/year} to {month/year} — {N} months unexplained.
    Prepare a clear 1-sentence answer for the interview.

⚠️  RED FLAG: Metric "{claim}" — can you back this up if asked for specifics?
```

---

## STEP 13 — Save Report

Save full report to `reports/cv-review-{company-slug}-{YYYY-MM-DD}.md`.

Report structure:

```markdown
# CV Review — {Company} × {Role}
**Data:** {date} | **Score:** {X}/100 | **Recomendação:** {Aplicar / Ajustar / Reconstruir}
**CV revisado:** {path} | **JD source:** {source}

---

## Score por Dimensão
| Dimensão | Pts obtidos | Peso | Contribuição |
|----------|------------|------|-------------|
| Hard skills obrigatórias | X/10 | 35% | X pts |
| Keywords de domínio | X/10 | 20% | X pts |
| Posicionamento (3 posições) | X/10 | 15% | X pts |
| Qualidade bullets (ACOE) | X/10 | 20% | X pts |
| ATS formatting | X/10 | 10% | X pts |
| **TOTAL** | | | **X/100** |

---

## Keyword Coverage Completa
| Keyword | Layer | Freq JD | Status | Posições | 3-Pos | Ação |
|---------|-------|---------|--------|----------|-------|------|
...

---

## Melhorias Críticas
...

## Melhorias Altas
...

## Reescritas Sugeridas
...

## ATS Checklist
...

## Red Flags
...

## Keywords Ausentes — Guia de Inserção
...
```

---

## STEP 14 — Offer Next Actions

After presenting the review summary in chat, always close with:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review completo. Score atual: {X}/100 ({label}).
Relatório salvo em reports/cv-review-{slug}-{date}.md

Próximos passos:
  A) Aplicar as correções críticas agora e re-gerar PDF (estimado: +{N} pts → {new score}/100)
  B) Ver reescritas completas de todos os bullets flaggados
  C) Aplicar keywords ausentes no CV e atualizar HTML
  D) Ver live preview do HTML atualizado em localhost:8765
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Never end without proposing next steps. If the user picks option A, execute immediately.

---

## ATS Knowledge Base (reference for analysis)

Use this as your scoring and analysis reference — do not output this section to the user.

**Keyword weighting in ATS systems:**
- Hard skills: 40-50% of ATS score
- Job titles: 20-25%
- Soft skills: 10-15% (inferred from evidence, not listed)
- Education/certs: 5-10%

**Density targets:**
- Primary keywords: 2-4% of total words
- Any single keyword > 3%: stuffing risk
- Total keyword density > 5%: flag

**ATS parsing failures (automatic disqualifiers):**
- Multi-column layout: ATS reads row-by-row, scrambles content
- Images/icons in text flow: completely invisible
- Custom bullets (►, ✦, ❖): appear as ? or skipped
- Em-dashes (—) used as separators: inconsistent parsing
- Dates like '21 instead of 2021: parsing failure
- Section headers like "My Journey", "The Toolkit": not recognized

**3-Position Rule impact:**
- Keyword in 1 position: ~50% match weight
- Keyword in 3 positions [S]+[K]+[E]: ~75-80% match weight

**ACOE formula (Action-Context-Outcome-Evidence):**
The gold standard for experience bullets. Every strong bullet has all 4 elements.
Strong verbs: Construí, Defini, Migrei, Liderei, Captei, Reduzi, Aumentei, Conduzi, Estruturei, Implementei
Weak verbs: Responsável por, Trabalhei em, Ajudei, Participei, Contribuí
