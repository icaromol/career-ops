# Mode: experience-optimize — Work Experience Section Optimizer

## Purpose

Rewrite the Work Experience (Experiência Profissional) section of `cv.md` to maximize recruiter impact. For every bullet that lacks a quantifiable metric, run a **discovery loop** — ask the user targeted questions, collect real data, then rewrite with that data.

Every new metric or story collected during discovery is saved to `article-digest.md` so it can be reused in future CVs, cover letters, and evaluations.

Changes are applied to `cv.md` **only after explicit user confirmation**.

---

## Inputs

### Step 0 — Check for existing analysis (MANDATORY before anything else)

Search `reports/` for files matching `experience-analysis-*.md`. Sort by date descending.

**If a report exists:**
Read the most recent one. Use the bullet classifications (CONQUISTA / RESPONSABILIDADE / VAGO) and priority improvements as the brief for rewriting. Do not re-diagnose what is already documented.

**If no report exists:**
Do not proceed to optimization. Ask the user:

```
Não encontrei nenhuma análise anterior da seção de experiência.

Para otimizar com precisão, preciso primeiro diagnosticar os pontos fracos.
Quer que eu rode a análise agora antes de continuar?

- "sim" → executo /career-ops experience-analyze e depois otimizo em sequência
- "não" → otimizo sem análise prévia (menos preciso, discovery loop ainda acontece)
```

If "sim": execute `experience-analyze` mode fully, save the report, then continue using that fresh report. Do not ask again — proceed automatically.

If "não": proceed using only `cv.md` + `_profile.md`, classify bullets yourself before starting.

### Files to read after Step 0:

1. `cv.md` — full Experiência Profissional section (source of truth)
2. `config/profile.yml` — candidate name, target roles, headline
3. `modes/_profile.md` — archetypes, North Star, narrative framing
4. `config/profile.yml` → `proof_points` section — existing proof points with metrics (check before asking user for data that's already documented). Fallback: `article-digest.md` if it exists.
5. `reports/experience-analysis-{latest date}.md` — classifications and priorities from Step 0

---

## Rewrite Principles (apply to every bullet)

### P1 — Fidelidade à análise
Execute the diagnosis from `experience-analyze`. Every rewrite must be traceable to a flagged problem. If the analysis said "manter" — do not change it.

### P2 — Fidelidade ao candidato
Never invent metrics. Never expand scope beyond what was described. Never substitute specific technical terms with generic synonyms. If the candidate used "NestJS", do not write "backend framework". If they said "squad de produto", do not write "equipe de desenvolvimento".

### P3 — Impacto sem exagero
Every bullet must be stronger than the original but credible. Test: could the candidate answer a recruiter question about this bullet naturally? If yes, ship it. If no, pull back.

### P4 — Voz ativa, verbo forte no início, resultado no fim

Standard structure for every rewritten bullet:

```
[VERBO FORTE] + [O QUÊ] + [COMO/CONTEXTO] + [RESULTADO MENSURÁVEL]
```

Examples:
- "Reduziu o tempo de onboarding de clientes em 40% ao estruturar fluxo de ativação automatizado com 5 etapas sequenciais"
- "Liderou migração de MongoDB para PostgreSQL, eliminando gargalos de performance em consultas críticas de relatório"
- "Definiu e priorizou backlog de 3 squads usando framework RICE, alinhando entregas a OKRs trimestrais da diretoria"

When no number is available after the discovery loop, use honest descriptive scale: "para base de mais de 200 usuários", "ao longo de 3 ciclos trimestrais", "adotado como padrão pela equipe de engenharia".

### P5 — Dois leitores simultâneos
Each bullet serves ATS (keywords present naturally) and a human recruiter (clear cause-and-effect narrative in under 2 lines). If it passes ATS but sounds robotic — rewrite. If it sounds good but missing keywords — rewrite.

---

## Step 1 — Classify all bullets

For each entry in Experiência Profissional, classify every bullet:

| Type | Description | Action |
|------|-------------|--------|
| `CONQUISTA_QUANTIFICADA` | Already has strong verb + result with metric | Keep; may polish verb or tighten phrasing |
| `CONQUISTA_SEM_METRICA` | Has result framing but no number | Discovery loop → rewrite |
| `RESPONSABILIDADE` | Describes duty/task, not result | Discovery loop → transform to conquista |
| `FRACA` | Has some result intent but weak verb or passive construction | Rewrite with strong verb; discovery loop if metric missing |

If the analysis report exists, use its classifications directly. Otherwise, classify yourself now.

---

## Step 2 — Discovery Loop

**Before running the discovery loop**, check `config/profile.yml` → `proof_points` section. If a relevant metric for this bullet already exists there, use it directly — do not ask the user for data they have already provided. Fallback: check `article-digest.md` if it exists.

For every bullet classified as `CONQUISTA_SEM_METRICA`, `RESPONSABILIDADE`, or `FRACA`, ask the user targeted questions. Do NOT rewrite until you have the answers.

### Discovery question format:

```
🔍 Descoberta — [Empresa / Cargo]

Bullet original:
"[exact bullet text]"

Pra transformar isso em conquista mensurável, preciso de contexto:
1. Quantas pessoas, clientes, usuários ou transações isso afetou diretamente?
2. Qual era o estado antes do seu trabalho e qual ficou depois? (tempo, custo, taxa de erro, velocidade, receita)
3. Esse resultado foi reconhecido — por métricas de produto, pela liderança, ou por algum prêmio/marco?
4. Tem algum número que represente o impacto — mesmo que seja uma estimativa aproximada?

Se não tiver nenhum número possível, me diga — a gente usa escala descritiva honesta.
```

### Discovery modes:

**Sequential (padrão):** Ask one bullet at a time and wait for the answer before moving to the next. Recommended when there are 5 or fewer bullets to discover.

**Batch mode:** If the user prefers, present all discovery questions at once (numbered per bullet) and wait for a single batch response. Activate if the user says "pode mandar tudo de uma vez" or if there are 6+ bullets to discover.

---

## Step 3 — Rewrite with collected data

After receiving discovery answers for a bullet:

1. Apply Principles P1–P5
2. Write the rewritten bullet
3. Record what changed and why (for the rastreável output)

**Verb selection guide:**

| Action type | Strong verbs (PT) |
|-------------|-------------------|
| Leading / managing | Liderou, coordenou, dirigiu, gerenciou |
| Building / creating | Construiu, desenvolveu, criou, implementou, lançou |
| Optimizing / reducing | Reduziu, otimizou, acelerou, eliminou, cortou |
| Growing / scaling | Escalou, expandiu, aumentou, captou, converteu |
| Designing / structuring | Estruturou, definiu, redesenhou, mapeou, modelou |
| Delivering / shipping | Entregou, finalizou, migrou, automatizou, integrou |
| Analyzing / measuring | Identificou, diagnosticou, priorizou, validou, mensurou |

**Verb repetition rule:** No two bullets in the same entry may start with the same verb.

---

## Step 4 — Save new proof points to `config/profile.yml`

After every discovery conversation that produces a new metric, story, or context — add a new entry under `proof_points` in `config/profile.yml`. This is the candidate's persistent knowledge base.

Read the current `config/profile.yml`, find the `proof_points` list, and append or update the relevant company entry. Format for each new entry:

```yaml
    - company: "[Company]"
      role: "[Role]"
      period: "[period]"
      hero_metric: "[one-line summary of the strongest metric]"
      details:
        - metric: "[concrete number or qualitative finding from discovery]"
          tags: [comma, separated, tags]
```

If the company already exists in `proof_points`, add new `details` entries rather than duplicating the company block.

---

## Step 5 — Present and save (before touching cv.md)

After rewriting all bullets, present the full section in chat in the rastreável format. Then immediately save the non-destructive output file. Only prompt for `cv.md` update after that.

### Chat presentation (rastreável layer):

```
## Experiência Profissional — Reescrita

---

**[CARGO] | [EMPRESA] | [PERÍODO]**

| # | Original | Reescrito | Mudança |
|---|----------|-----------|---------|
| 1 | [original text] | [rewritten text] | [what changed and why] |
| 2 | [original text] | [rewritten text] | [what changed and why] |
| 3 | [original text] | MANTIDO | [reason: already strong] |

---

[repeat for each entry]

---

**Novos dados salvos em config/profile.yml → proof_points:** X proof points adicionados
**Versão limpa salva em:** output/experience-rewrite-{YYYY-MM-DD}.md

Aplicar ao cv.md? (sim / não — o arquivo original não foi tocado ainda)
```

### File: `output/experience-rewrite-{YYYY-MM-DD}.md` (save immediately, no confirmation needed)

```markdown
# Experience Section Rewrite — {YYYY-MM-DD}

> Generated by career-ops experience-optimize.
> Apply to cv.md with explicit confirmation, or use as reference for job-specific CVs.

## Versão Limpa (pronta pra colar no cv.md)

### [CARGO]
[Empresa] | [Localização ou Remoto] | [Período]

- [Bullet 1 reescrito]
- [Bullet 2 reescrito]
- [Bullet 3 reescrito]

### [CARGO ANTERIOR]
[Empresa] | [Localização ou Remoto] | [Período]

- [Bullet 1 reescrito]
...

---

## Notas do Reescritor

- **Ainda falta:** [bullets that couldn't be fully quantified without more data from user]
- **Keywords da vaga cobertas:** [if JD was provided — confirm coverage]
- **Sugestão pós-aplicação:** executar `/career-ops experience-analyze` para verificar score atualizado
```

---

## Step 6 — Apply to cv.md (only with explicit confirmation)

If the user says "sim", "aplica", "confirmo", or equivalent:

1. Read `cv.md`
2. Locate the Experiência Profissional section (between its heading and the next `---` or `##` heading)
3. Replace only that section with the clean version from `output/experience-rewrite-{YYYY-MM-DD}.md`
4. Confirm:

```
cv.md atualizado com a seção de Experiência Profissional reescrita.
output/experience-rewrite-{YYYY-MM-DD}.md mantido como backup.
config/profile.yml atualizado com X novos proof points em proof_points.

Execute `/career-ops experience-analyze` para ver o score atualizado.
```

If the user says "não" or "por enquanto não":

```
cv.md não foi alterado — seção original preservada.
Reescrita salva em output/experience-rewrite-{YYYY-MM-DD}.md para consulta.
Quando quiser aplicar, diga "aplica" ou rode /career-ops experience-optimize novamente.
```

---

## Rules

- **Never apply to `cv.md` without explicit user confirmation** ("sim", "aplica", "confirmo")
- **Never invent metrics** — if the user says there's no number, use honest descriptive scale
- **Never delete a bullet without flagging it** — if a bullet is redundant or irrelevant, note it in the Notas section and ask the user; do not remove silently
- **Never substitute technical terms** with generic synonyms (NestJS → "framework backend", PostgreSQL → "banco de dados", OKR → "meta")
- **Max 6 bullets per entry** — if original has 7+, flag in Notas and ask user which to keep
- **Never use these phrases:** "contribuiu para o crescimento", "fez parte de uma equipe de alto desempenho", "colaborou para alcançar resultados", "atuou de forma proativa", "profissional apaixonado"
- **After applying**, always suggest running `/career-ops experience-analyze` to see the updated score
- **Preserve language** — if the experience section is in Portuguese, rewrite in Portuguese
- **Check `config/profile.yml` → `proof_points` before asking** — never ask for a metric that the user has already documented there
