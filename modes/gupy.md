# Mode: gupy — Gupy Application Assistant (on-demand)

Gera os dois artefatos específicos de aplicação Gupy somente quando pedido explicitamente — nunca automaticamente no momento da avaliação (ver `modes/_shared.md` § Platform Detection: Gupy). Acionado por `/career-ops gupy {slug}` ou por pedido em linguagem natural como "gera a apresentação Gupy para {empresa}" / "gera a apresentação dessa vaga".

## Step 0 — Carregar contexto

1. Resolver `{slug}` (ou nome da empresa do pedido em linguagem natural) contra `reports/` — match case-insensitive no nome do arquivo ou no header `# Evaluation:`/`# Avaliação:`.
2. Se não achar, pedir para o usuário confirmar empresa/vaga ou rodar `/career-ops oferta` primeiro — este modo nunca avalia do zero.
3. Ler o relatório completo: Bloco B (Match with CV — proof points e gaps) e Bloco F (Interview Plan — histórias STAR+R).
4. Confirmar que o header do relatório indica detecção Gupy (a linha de PDF do `_shared.md`). Se não indicar — ex: usuário pedindo isso numa vaga não-Gupy — perguntar uma vez: "Essa vaga não foi marcada como Gupy na avaliação. Quer mesmo assim gerar o texto no formato apresentação Gupy?" Só prosseguir após confirmação.
5. Ler `config/profile.yml` → `ats_profiles.gupy.skills` (lista fixa já cadastrada no perfil Gupy do usuário). Se a chave não existir, parar e avisar o usuário para adicioná-la — nunca inventar uma lista de habilidades.

## Step 1 — Gerar texto "Apresente-se!" (~1500 caracteres)

O campo da Gupy pede uma trajetória pessoal conectada ao desafio da vaga — é uma **apresentação pessoal em primeira pessoa dentro de um campo de formulário**, não uma carta de apresentação. Diferenças em relação ao output de `modes/cover.md`:
- Sem saudação nem fechamento formal — é campo de formulário, não carta.
- Tamanho alvo: 1300-1500 caracteres (limite da Gupy é ~1500) — escrever para preencher bem, sem enrolar.
- Estrutura: 3-4 parágrafos curtos — (1) quem é o candidato + proof point mais forte, (2) o arco da trajetória conectado ao desafio desta vaga específica (usar o framing "sell senior" do Bloco C e o TL;DR do relatório), (3) 1-2 conquistas concretas do Bloco B com métricas reais, (4) fechamento curto sobre por que esse desafio/empresa específica.
- Aplicar Voice DNA Tier 2 (voz conversacional) de `_shared.md` — é prosa voltada ao candidato, mesmo nível de cover letters, não texto formal de CV/ATS.
- Aplicar as regras de Professional Writing de `_shared.md` (sem clichês, sem em-dash, voz ativa, especificidade em vez de abstração).
- Nunca inventar métricas — usar apenas o que vem de `cv.md`/`article-digest.md` via Bloco B do relatório.

Mostrar contagem de caracteres durante a redação, ajustando para ficar na faixa 1300-1500.

## Step 2 — Sugerir 3 habilidades da lista fixa Gupy

1. Ler a JD do header/URL do relatório (buscar de novo só se o relatório não tiver JD suficiente para julgar relevância).
2. Pontuar cada item de `ats_profiles.gupy.skills` contra os requisitos explícitos da JD e o arquétipo detectado no relatório — priorizar matches literais ou quase-literais (ex: JD menciona "RAG" → "RAG (Retrieval-Augmented Generation)" da lista é match direto).
3. Selecionar exatamente 3. Se menos de 3 tiverem match real, dizer isso explicitamente em vez de forçar matches fracos — escolher os mais fortes disponíveis e sinalizar a limitação.
4. Apresentar as 3 (ou menos) com uma justificativa de uma linha cada, citando a frase da JD que embasa a escolha.

## Formato de saída

```markdown
## Apresentação Gupy — {Empresa} — {Vaga}

**Baseado no report #{num} | Score: {X.X}/5**

---

### Texto para "Apresente-se!" ({contagem}/1500 caracteres)

{texto gerado, pronto para copiar e colar}

---

### Habilidades sugeridas (selecionar até 3 na Gupy)

1. **{habilidade da lista fixa}** — {justificativa de uma linha citando a JD}
2. **{habilidade da lista fixa}** — {justificativa de uma linha citando a JD}
3. **{habilidade da lista fixa}** — {justificativa de uma linha citando a JD}

---

*Perguntas de triagem extras da empresa (se houver) não são cobertas por este fluxo — cole-as aqui ou use `/career-ops apply` com o formulário aberto para respostas ao vivo.*
```

## Step 3 — Opcional: salvar no relatório

Perguntar ao usuário se quer que isso seja salvo de volta no arquivo do relatório, numa nova seção `## Gupy Application Draft` (append-only, mesmo padrão da seção "Cover Letter Draft" de `oferta.md`). Se sim, adicionar com esse heading; se a seção já existir, substituir (mesma regra de "exatamente uma seção canônica" usada em Writing Style de `_shared.md`).

## Escopo

Este modo não preenche o formulário Gupy ao vivo (sem Playwright dirigindo a página). Para isso, usar `/career-ops apply` com o formulário aberto — Step 6/7 de `apply.md` já lida com perguntas de formulário arbitrárias, incluindo as perguntas de triagem extras da Gupy (sim/não, múltipla escolha). Este modo só prepara os dois artefatos Gupy-específicos (texto de apresentação + habilidades) que `apply.md` não especializa.
