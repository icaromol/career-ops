# Mode: resume-update — CV Updater

## Purpose

Update `cv.md` with new content pasted directly in the chat. Shows a diff of changes and requires explicit confirmation before writing — including a double-confirmation when existing experience entries would be removed.

---

## Inputs

Read before starting:

1. `cv.md` — current CV state (keep in memory for diffing)

---

## Flow

### Step 0 — Load current cv.md

Read `cv.md` and hold it in memory. Do not display it.

### Step 1 — Receive new content

- If the user invoked the mode with content already pasted: use it directly.
- If invoked with no content: ask:

  > "Cole aqui o novo conteúdo do seu CV (texto completo ou só as seções que mudaram)."

  Wait for the user to paste. Do not proceed until content is received.

### Step 2 — Detect and present changes

Compare the new content against the current `cv.md`. Present a structured diff in chat:

```
## Mudanças detectadas no CV

### Resumo Profissional
[ALTERADO] → mostra old vs. new se mudou; [SEM MUDANÇA] se igual

### Experiências
[ADICIONADO] NomeDaEmpresa — Cargo
[ALTERADO]   NomeDaEmpresa — Cargo
[REMOVIDO]   NomeDaEmpresa — Cargo   ⚠️

### Competências
[ALTERADO] → lista as categorias que mudaram; [SEM MUDANÇA] se igual

### Formação
[ALTERADO / SEM MUDANÇA]

### Idiomas e Reconhecimentos
[ALTERADO / SEM MUDANÇA]

### Novas métricas ou conquistas detectadas
- [lista os números/prêmios novos encontrados no conteúdo colado]
```

Rules for the diff:
- Mark each section as `[ALTERADO]`, `[ADICIONADO]`, `[REMOVIDO]` or `[SEM MUDANÇA]`.
- Mark any removed experience entry with ⚠️ — it was in the old cv.md and is absent in the new content.
- List any new quantified metrics or awards found in the new content under "Novas métricas".

### Step 3 — Confirmation

After presenting the diff:

**If no entries are marked `[REMOVIDO]`:**

> "Confirma a atualização do cv.md com essas mudanças? (s/n)"

Wait for the user's response. Only proceed on explicit affirmative ("s", "sim", "yes", "ok", "confirma").

**If any entries are marked `[REMOVIDO]` (⚠️):**

> "Atenção: as seguintes experiências estão no cv.md atual mas ausentes no novo conteúdo e serão removidas:
> - [lista]
>
> Isso é intencional? Confirma a remoção e a atualização do cv.md? (s/n)"

Wait for explicit affirmative before proceeding.

On any negative or ambiguous response: abort. Say "Atualização cancelada. cv.md não foi modificado." and stop.

### Step 4 — Save

After confirmed:

1. Format the pasted content as clean markdown following the system conventions:
   - `#` for the candidate name (h1)
   - `##` for main sections (Resumo Profissional, Experiencia Profissional, Competencias, etc.)
   - `###` for company names, `####` for role titles (or `###` for role + bold company below, matching the existing style in cv.md)
   - `-` for bullet points (no `*`)
   - No HTML tags
   - Preserve the language of the pasted content (PT/EN/DE/etc.)
   - `---` horizontal rules between major sections

2. Write the formatted content to `cv.md`, replacing it entirely.

3. Confirm in chat:

   > "cv.md atualizado com sucesso."

---

## Rules

- **NEVER write to cv.md without explicit user confirmation.**
- **NEVER invent or modify metrics.** Use exactly what the user provided — no rounding, no paraphrasing numbers.
- **ALWAYS alert when experience entries are removed** — even if the removal looks intentional.
- Preserve the language of the content (if the user pastes in Portuguese, write Portuguese; if English, write English).
- If the user pastes only a section (e.g., only the summary), ask: "Quer atualizar só essa seção ou substituir o CV completo?" before proceeding.
- Do not run `resume-analyze` or `resume-optimize` automatically. The user can invoke those separately afterward.
