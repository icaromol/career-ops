# Mode: cv-review-rewrite — CV × JD Review + Rewrite Automático

<!-- ============================================================
     Executa o cv-review completo (14 passos) E aplica todas as
     melhorias automaticamente, entregando um CV final corrigido
     pronto para PDF.
     ============================================================ -->

## Invocation

```
/career-ops cv-review-rewrite                        # usa JD + CV do contexto
/career-ops cv-review-rewrite {report-slug}          # puxa JD de reports/{slug}.md
/career-ops cv-review-rewrite {path/to/cv.html}      # revisa CV específico
```

Se não houver JD no contexto → perguntar: "Cole a JD aqui ou informe o slug do report (ex: `146-hostgator`)."
Se não houver CV tailorizado → usar `cv.md` como fallback e avisar.

---

## Diferença em relação ao cv-review

| cv-review | cv-review-rewrite |
|-----------|-------------------|
| Analisa e produz plano de melhorias | Analisa, planeja E aplica as melhorias |
| Entrega relatório + lista de ações | Entrega CV corrigido pronto para uso |
| Usuário precisa aplicar manualmente | Tudo aplicado automaticamente |
| Salva em `reports/cv-review-*.md` | Salva review EM + CV corrigido em texto |

---

## FASE 1 — Review Completo (Steps 0–8)

Execute todos os passos do `modes/cv-review.md` de STEP 0 a STEP 8 inclusive:

- STEP 0: Load Sources (CV + JD + Profile)
- STEP 1: Keyword Extraction da JD (4 layers, freq, prioridade)
- STEP 2: CV Keyword Coverage Scan (✅ PRESENTE / ⚠️ PARCIAL / ❌ AUSENTE)
- STEP 3: Keyword Density Analysis
- STEP 4: Bullet Quality Audit (ACOE+K, 0-5 por bullet)
- STEP 5: ATS Formatting Audit (10 checks)
- STEP 6: Language Mirroring Analysis
- STEP 7: Inconsistency & Red Flag Detection
- STEP 8: Match Score Calculation (score /100)

**Ao final da Fase 1, exibir resumo compacto:**

```
━━━ REVIEW COMPLETO ━━━
Score atual: {X}/100
Bullets flagados (< 3/5): {N}
Keywords ausentes (❌): {N}
Keywords parciais (⚠️): {N}
ATS checks falhando: {N}/10
Score projetado pós-rewrite: ~{X}/100

Aplicando todas as melhorias agora...
━━━━━━━━━━━━━━━━━━━━━━━
```

Não esperar confirmação do usuário — prosseguir direto para a Fase 2.

---

## FASE 2 — Rewrite Sistemático

Execute cada categoria de melhoria na ordem abaixo. Para cada item aplicado, marcar internamente como ✅ feito.

### 2.1 — Resumo Profissional

Reescrever o Resumo Profissional aplicando simultaneamente:
- Todas as keywords CRITICAL e HIGH ausentes ou parciais que caibam naturalmente
- Language mirroring: substituir frases do CV por frases exatas da JD onde relevante
- Manter tom e voz do candidato — sem buzzwords, sem passivo, sem em-dashes

Regras de reescrita do Resumo:
- Máximo 4 linhas / ~80 palavras
- Primeira frase: arquétipo + diferencial principal + prova de resultado
- Segunda frase: keywords do domínio da vaga inseridas naturalmente
- Terceira frase (opcional): diferencial único que outros candidatos não têm

### 2.2 — Rewrite de Bullets Flagados (score < 3/5)

Para cada bullet com score < 3/5 do STEP 4:

1. Identificar qual(is) critério(s) ACOE+K falharam
2. Reescrever preservando o fato real — NUNCA inventar métricas
3. Inserir keywords ausentes da JD de forma natural
4. Verificar que o novo bullet atinge mínimo 4/5

Exibir antes/depois para cada bullet reescrito.

### 2.3 — Otimização de Bullets com Score 3-4/5

Para bullets com score 3 ou 4, aplicar apenas:
- Language mirroring: substituir sinônimo do CV pela frase exata da JD se o impacto for 0.5+ pts
- Inserção de keyword ausente se encaixar em < 5 palavras adicionais
- Não reescrever estruturalmente — só ajustes cirúrgicos

### 2.4 — Seção de Competências

Reconstruir a seção de Competências aplicando:
- Inserir todos os keywords ❌ AUSENTE que pertencem naturalmente a Skills
- Inserir todos os keywords ⚠️ PARCIAL na forma exata da JD
- Manter agrupamento lógico (Produto / Infra / Cloud / IA / etc.)
- Ordenar por relevância para esta vaga: categorias mais relevantes primeiro

### 2.5 — Validação Final

Após todas as reescritas, re-executar mentalmente o STEP 2 (coverage scan) no CV corrigido:
- Confirmar que todos os CRITICAL keywords estão agora em pelo menos 2 posições
- Confirmar que keywords HIGH estão em pelo menos 1 posição
- Confirmar que nenhum bullet caiu abaixo de 3/5 no processo

---

## FASE 3 — Entrega

### 3.1 — CV Corrigido Completo

Exibir o CV completo corrigido em markdown, pronto para uso, com esta estrutura:

```
━━━ CV CORRIGIDO — {Company} ━━━
Score estimado: {X}/100 (+{delta} vs. original)

[CV completo em markdown]

━━━ MUDANÇAS APLICADAS ━━━
Resumo: {N} keywords inseridas, {N} frases espelhadas
Bullets reescritos: {N} (score médio: {before} → {after})
Bullets otimizados: {N} ajustes cirúrgicos
Competências: +{N} keywords adicionadas
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.2 — Salvar Report

Salvar relatório completo (Fase 1 + delta de melhorias) em:
`reports/cv-review-rewrite-{company-slug}-{YYYY-MM-DD}.md`

Estrutura do report:

```markdown
# CV Review + Rewrite — {Company} × {Role}
**Data:** {date} | **Score antes:** {X}/100 | **Score depois:** {Y}/100
**Delta:** +{Z} pts | **Recomendação:** {Aplicar agora / Revisar red flags primeiro}

---

## Score por Dimensão — Antes e Depois
| Dimensão | Antes | Depois | Delta |
|---|---|---|---|
...

## Keywords — Cobertura Final
| Keyword | Status antes | Status depois | Ação aplicada |
...

## Bullets Reescritos
[antes/depois de cada bullet reescrito]

## Red Flags Remanescentes
[itens que só o usuário pode resolver]
```

### 3.3 — Próximos Passos

Sempre fechar com:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rewrite concluído. Score: {before} → {after}/100.
Report salvo em reports/cv-review-rewrite-{slug}-{date}.md

Próximos passos:
  A) Gerar PDF com este CV (/career-ops pdf)
  B) Ver red flags remanescentes que precisam da sua validação
  C) Revisar bullets reescritos e ajustar voz se necessário
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Regras Absolutas (herdadas de _shared.md)

- NUNCA inventar métricas ou experiências
- NUNCA modificar cv.md ou article-digest.md
- NUNCA usar em-dashes (—) em nenhum texto gerado
- NUNCA usar buzzwords: "passionate", "leveraged", "spearheaded", "synergies", "robust", "seamless"
- SEMPRE preservar voz e tom do candidato
- SEMPRE citar fonte de cada métrica (cv.md linha X ou article-digest.md)
- Soft skills: demonstrar por resultado, nunca listar como adjetivo

## Prioridade das fontes de métricas

1. `cv.md` — fonte primária
2. `config/profile.yml` seção `proof_points` — contexto adicional
3. `article-digest.md` — se existir, tem precedência sobre cv.md para métricas de artigos/projetos
4. NADA mais — não inventar
