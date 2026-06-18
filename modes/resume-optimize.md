# Mode: resume-optimize — Professional Summary Optimizer (Base CV)

## Purpose

Rewrite the Professional Summary in `cv.md` to maximize recruiter impact following research-backed criteria. The optimized version is saved to `output/cv-summary-optimized.md` for review. The change is applied to `cv.md` **only after explicit user approval**.

---

## Inputs

### Step 0 — Check for existing analysis (MANDATORY before anything else)

Search `reports/` for files matching `resume-analysis-*.md`. Sort by date descending.

**If a report exists:**
Read the most recent one. It contains the scored gaps and rewrite suggestions already identified. Use it as the primary brief for optimization — do not re-diagnose what is already documented there.

**If no report exists:**
Do not proceed to optimization. Ask the user:

```
Não encontrei nenhuma análise anterior do seu resumo.

Para otimizar com precisão, preciso primeiro diagnosticar os pontos fracos.
Quer que eu rode a análise agora antes de continuar?

- "sim" → executo /career-ops resume-analyze e depois otimizo em sequência
- "não" → otimizo sem análise prévia (menos preciso)
```

If the user says "sim" (or equivalent): execute the full `resume-analyze` mode first, save the report, then continue with optimization using that fresh report as input. Do not ask the user again — proceed automatically.

If the user says "não": proceed to optimization using only `cv.md` + `_profile.md` as context, and note in the output that no prior analysis was available.

### Files to read after Step 0:

1. `cv.md` — full CV content (source of truth for all proof points)
2. `config/profile.yml` — candidate name, target roles, headline, location
3. `modes/_profile.md` — archetypes, North Star, narrative, deal-breakers
4. `article-digest.md` (if exists) — detailed proof points with metrics
5. `reports/resume-analysis-{latest date}.md` — the analysis report located in Step 0

---

## Optimization Rules (apply in order)

### Rule 1 — Structure: 4 required elements
The rewritten summary MUST contain all four:
1. **Professional title or target role** — aligned with `_profile.md` primary archetype
2. **Years of experience** — calculated from `cv.md` experience section (earliest role to present)
3. **2-3 core competencies** — pulled from the archetype vocabulary in `_profile.md`, not generic terms
4. **1-2 quantified achievements** — taken verbatim (exact numbers) from `cv.md` or `article-digest.md`

### Rule 2 — Quantification (mandatory)
Every achievement claim must carry a number. Extract real numbers from `cv.md`:
- Never invent or approximate metrics
- Never write "several", "significant", "numerous", "various" in place of real numbers
- If a real number exists in `cv.md`, use it. If no number exists for a claim, cut the claim or replace with one that does have a number.

### Rule 3 — Keyword alignment with primary archetype
From `_profile.md`, identify the primary archetype and its vocabulary. Mirror the exact terminology used in JDs for that archetype:
- Use "product discovery" not "research"
- Use "roadmap" not "planning"
- Use "go-to-market" not "launch"
- Use the exact technical stack terms present in `cv.md` (do not add or remove)

### Rule 4 — Third person, no "I"
- Never use "I", "my", "me", "we" in the summary
- Rewrite all first-person constructions as distanced factual statements
- Correct: "Product Manager with 4 years building SaaS B2B products..."
- Wrong: "I'm a Product Manager who has spent 4 years..."

### Rule 5 — Length: 2-4 sentences maximum
- Sentence 1: Title + years + primary competency domain
- Sentence 2: Most impactful quantified achievement
- Sentence 3 (optional): Secondary differentiator or industry signal
- Sentence 4 (optional): One-line bridge to target role or unique angle

No sentence should exceed 30 words. No paragraph.

### Rule 6 — Zero prohibited terms
Remove or replace any of: "hardworking", "team player", "proven track record", "works well under pressure", "quick learner", "people person", "passionate about", "results-oriented", "leveraged", "spearheaded", "synergies", "cutting-edge", "go-getter", "detail-oriented", "creative", "dynamic", "motivated self-starter", "apaixonado por", "orientado a resultados", "proativo", "comunicativo", "dinâmico".

Replace with specific evidence of the underlying claim.

### Rule 7 — Show don't tell
Apply the "any candidate" test to every phrase: *"Could this appear in any other candidate's CV?"*
- If yes: rewrite with specific evidence
- The goal: every sentence must be uniquely true about this candidate

### Rule 8 — North Star alignment
The first sentence must immediately signal the target archetype from `_profile.md`. A recruiter reading only the first sentence should know the candidate's category within 3 seconds.

### Rule 9 — Preserve language
If `cv.md` summary is in Portuguese, write the optimized version in Portuguese. Maintain consistency with the rest of the CV.

### Rule 10 — Sentence clarity (one idea per sentence)
Each sentence carries exactly one idea. Never stack title + context + operational detail into a single sentence.

**Wrong:** "Product Manager com background técnico de founder — construiu e lançou do zero um SaaS B2B atuando como PM e CTO: do discovery ao deploy, liderando time de até 13 pessoas e todas as decisões de arquitetura."

**Right:**
- Sentence 1: title + framing ("Product Manager com background técnico de founder: construiu do zero um SaaS B2B como PM e CTO — do discovery ao deploy.")
- Sentence 2: team + results grouped together ("Liderou time de até 13 pessoas, validou 25 clientes pagantes e captou R$60k, conquistando 2 prêmios nacionais.")

Group related proof points (team size + clients + revenue + awards) into one sentence rather than fragmenting them across the summary. Keep subordinate clauses short — if a clause exceeds 12 words, split it into its own sentence.

---

## Generation Process

### Step 1 — Extract all available proof points
From `cv.md` and `article-digest.md`, compile:
- All quantified achievements (with exact numbers)
- Technical stack and tools (exact terms)
- Role titles held
- Industry domains worked in
- Career span (years)

### Step 2 — Identify the primary archetype
From `_profile.md`: what is the #1 target role/archetype? What vocabulary does that archetype use?

### Step 3 — Draft 2-3 candidate summaries
Write 2-3 variant summaries, each emphasizing a different strength angle:
- **Variant A**: Lead with the founder/builder angle
- **Variant B**: Lead with the technical PM angle
- **Variant C**: Lead with the quantified business impact angle

Each variant must satisfy Rules 1-9 above.

### Step 4 — Self-score each variant
For each variant, run the 9-criterion checklist from `modes/resume-analyze.md` mentally. Show the score for each variant (X/18).

### Step 5 — Present and save all variants

Show all three variants in chat with scores. Then **immediately save all three** to `output/resume-summaries.md` without waiting for confirmation — these are the user's variant library, not a destructive change.

After saving, ask only: "Qual variante aplicar ao `cv.md` agora? (A / B / C / blend / nenhuma por enquanto)"

---

## Output Format

### Chat presentation

```
## Resumo Profissional — 3 Variantes Otimizadas

**Base:** cv.md + _profile.md (arquétipo primário: {archetype})

---

### Variante A — Ângulo Builder/Founder (Score: X/18)
> {2-4 sentence summary}

### Variante B — Ângulo Technical PM (Score: X/18)
> {2-4 sentence summary}

### Variante C — Ângulo Business Impact (Score: X/18)
> {2-4 sentence summary}

---

**O que mudou em todas:**
- Removido: [buzzwords/claims vagos removidos]
- Adicionado: [números/keywords adicionados]
- Reestruturado: [mudanças estruturais]

Todas salvas em: output/resume-summaries.md

Qual aplicar ao cv.md agora? (A / B / C / blend / nenhuma por enquanto)
Na hora de gerar PDF para uma vaga específica, o modo pdf escolhe automaticamente a melhor variante.
```

---

## After Presenting Variants

### Step 6 — Save all variants to library (always, immediately after Step 5)

Write to `output/resume-summaries.md`:

```markdown
# Resume Summary Variants — {YYYY-MM-DD}

> Generated by career-ops resume-optimize. Use `/career-ops pdf` for job-specific PDFs —
> the pdf mode reads this file and picks the best variant for each JD automatically.

## Variante A — Builder/Founder (Score: X/18)

**Melhor para:** vagas de 0-to-1, startups early-stage, Founder/CPO, Head of Product com DNA builder

{summary text}

## Variante B — Technical PM (Score: X/18)

**Melhor para:** vagas de Technical PM, AI PM, engenharia-heavy, squads de produto técnico

{summary text}

## Variante C — Business Impact (Score: X/18)

**Melhor para:** vagas de Senior PM SaaS B2B, growth, GTM, empresas orientadas a métricas

{summary text}

---

**Aplicada ao cv.md:** {A / B / C / nenhuma — atualizado em {YYYY-MM-DD}}

**Histórico de análise:** reports/resume-analysis-{YYYY-MM-DD}.md
```

### Step 7 — Apply to cv.md (only if user explicitly selects a variant)

If the user says "nenhuma por enquanto" or equivalent: do not touch `cv.md`. Confirm:

```
Variantes salvas em output/resume-summaries.md.
cv.md não foi alterado — o resumo original permanece.
Na hora de gerar um PDF, o modo pdf usará a variante mais adequada para a vaga.
```

If the user selects a variant (A / B / C / blend):

1. Read `cv.md`
2. Locate the section between `## Resumo Profissional` and the next `---`
3. Replace only that section with the selected variant text
4. Update the `**Aplicada ao cv.md:**` line in `output/resume-summaries.md`
5. Confirm:

```
cv.md atualizado com Variante {X}.
output/resume-summaries.md atualizado.
Execute `/career-ops resume-analyze` para verificar o novo score.
```

---

## Rules

- **Never apply to `cv.md` without explicit user confirmation** ("apply", "yes apply", "confirmo", "aplica")
- **Never invent metrics** — every number must exist in `cv.md` or `article-digest.md`
- **Never remove experience bullets or other sections** — this mode touches only the summary
- **If `article-digest.md` has richer metrics than `cv.md`**, use them in the summary but flag: "This number comes from article-digest.md — confirm it's still current"
- **After applying**, suggest running `/career-ops resume-analyze` to get the updated score
