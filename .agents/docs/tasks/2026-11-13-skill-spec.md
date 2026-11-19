# Task: Skill `spec` (criar e atualizar spec: esclarecimento → spec.md → design.md)

- **Status:** `concluída`
- **Criado em:** 2026-11-13
- **Atualizado em:** 2026-11-15 — rodada final do teste (98% × 72%), revisão do Juno, registro no
  `AGENTS.md` e fechamento
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/estrutura-sdd-agents`

## 2. Contexto e critérios (task avulsa)

- **Problema:** o `AGENTS.md` define quando um trabalho vira spec e o `.agents/docs/templates/` tem os
  modelos `spec.md` e `design.md`, mas não existe procedimento para chegar neles nem para alterá-los quando a
  implementação traz novidades. Hoje a decisão acontece em conversa e vira prompt em notas pessoais; um agente
  sem esse histórico preencheria os modelos inventando regras ou pulando as decisões em aberto.
- **Objetivo:** skill `spec` em `.agents/skills/spec/` que:
  1. **spec nova:** entrevista o usuário em rodadas até resolver as decisões em aberto, escreve o `spec.md`,
     e depois da aprovação escreve o `design.md` com a **lista** de tasks — e para aí;
  2. **spec existente:** entrevista só sobre a mudança, edita `spec.md`/`design.md`, registra
     "Atualizado em — motivo" e avisa quais tasks são afetadas.

  Registrada na tabela do `AGENTS.md` e testada com × sem a skill.
- **Fica fora:**
  - arquivos `tasks/NN-*.md` → skill `task`;
  - decidir spec × task e orquestrar o trabalho → skill `fluxo-de-trabalho`;
  - escrever ADR → skill `adr` (a `spec` só identifica e lista como task);
  - skill de entrevista separada → só quando outra skill precisar da mesma entrevista;
  - encerramento (status, `done/`, links) → skill `encerramento`;
  - validador de governança → item próprio (até lá, conferência manual no fim de cada documento).
- **Referências:**
  - `AGENTS.md`, seção "Spec ou task?";
  - modelos `.agents/docs/templates/spec.md` e `design.md`;
  - fontes externas (lidas inteiras; registrar no `ORIGEM.md`): mattpocock `grilling` e `to-spec`
    (`5863806`, MIT), gstack `spec` (`43c815b`, MIT), spec-kit `clarify` (`2ee2b1e`, MIT).

### CA-01: Esclarece antes de escrever

- **Dado** um pedido de funcionalidade com decisões de produto em aberto
- **Quando** o agente segue a skill
- **Então** ele pergunta em rodadas de 3 a 5 decisões independentes (numeradas, com opções e
  recomendação), responde sozinho o que é fato lendo o código, e não cria o `spec.md` enquanto houver
  decisão que mude o escopo ou os critérios

### CA-02: spec.md fiel ao modelo e ao código

- **Dado** as decisões fechadas na entrevista
- **Quando** o agente escreve o `spec.md`
- **Então** ele cria a pasta `.agents/docs/specs/AAAA-MM-DD-<assunto>/` a partir do modelo, com critérios
  `CA-NN` em Dado/Quando/Então, decisões com alternativas descartadas e motivo, sem regra de negócio que não
  veio da conversa ou do código, sem placeholder sobrando, e para pedindo aprovação

### CA-03: design.md só depois da aprovação, sem arquivos de task

- **Dado** o `spec.md` aprovado
- **Quando** o agente escreve o `design.md`
- **Então** ele lê o código das camadas afetadas, pergunta só as decisões técnicas em aberto, segue o
  modelo, inclui a lista de tasks com "bloqueada por", aponta ADR novo/atualização como task e **não** cria
  `tasks/NN-*.md`

### CA-04: Pedido pequeno não vira spec

- **Dado** um pedido que não cumpre nenhum critério de spec do `AGENTS.md`
- **Quando** a skill é acionada
- **Então** o agente diz que parece task, explica por quê e não cria a pasta da spec sem confirmação

### CA-05: Atualiza spec existente

- **Dado** uma spec existente e uma descoberta durante a implementação (ex.: task nova ou cancelada)
- **Quando** a skill é acionada sobre essa spec
- **Então** o agente entrevista só sobre a mudança, edita `spec.md`/`design.md` sem duplicar nem deixar
  texto contraditório, preenche "Atualizado em — motivo" e lista as tasks afetadas

## 3. O que fazer nesta tarefa

1. Renomear a `criar-skill` para `oficina-de-skills` e registrar o padrão de nomes (commit separado).
2. Escrever o rascunho do `SKILL.md` (tipo: **técnica**, com trechos de **regra** — "não escrever antes de
   esclarecer") e o `ORIGEM.md`.
3. Criar 2–3 cenários de teste com pedidos reais do projeto e rodar com × sem a skill (ver
   `oficina-de-skills`).
4. Ajustar a skill pelo retorno do Juno e repetir até ficar boa.
5. Validar o cabeçalho e registrar na tabela de roteamento do `AGENTS.md`.

**Ler antes de começar:**

- `.agents/skills/oficina-de-skills/SKILL.md` (procedimento de criar e testar skill)
- `.agents/docs/templates/spec.md` e `design.md` (o que a skill produz)
- `AGENTS.md`, seções "Spec ou task?" e "Skills"

**Arquivos previstos:**

- criar `.agents/skills/spec/SKILL.md`, `ORIGEM.md` e, se o Juno quiser versionar os cenários,
  `evals/evals.json`;
- alterar `AGENTS.md` (linha na tabela de skills);
- alterar `.agents/docs/templates/spec.md` / `design.md` só se o teste revelar falha no modelo (com aprovação);
- **mudança de escopo aprovada (2026-11-13):** renomear `.agents/skills/criar-skill/` →
  `oficina-de-skills/` (pasta, `name:`, título, `ORIGEM.md`), atualizando `AGENTS.md`, `.agents/README.md`
  (com a regra de nomes por substantivo) e o comentário do `.gitignore`.

- **mudanças de escopo aprovadas (2026-11-14/15), vindas do teste e da revisão do Gemini:** modelos
  `spec.md` e `design.md` ("descartadas" nas decisões; em aberto bloqueia aprovação/design, não task);
  `oficina-de-skills` (linha de base primeiro, checagem estática, revisão dos critérios, modo leve,
  execuções, proibição de `.notes/` nos subagentes) e seu `ORIGEM.md`; critério 6 do `AGENTS.md`.
- **mudança de escopo aprovada (2026-11-15, decisão 3A):** corrigir `oficina-de-skills/scripts/aggregate_benchmark.py`
  (tokens lidos do `timing.json`) e registrar a modificação no `ORIGEM.md` da oficina.

**Não deve mudar:** `api/`, `web/`, `docs/`; as regras do
`AGENTS.md` fora da tabela de skills.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** nenhum (task só de documentação).

## 4. Como validar o que foi feito

| Critério | Teste que prova |
|---|---|
| CA-01 | cenário com decisões em aberto: com a skill, rodadas antes de arquivos; sem a skill, comparar |
| CA-02 | critérios de verificação no cenário: pasta e `CA-NN` no formato, nenhuma regra inventada |
| CA-03 | cenário com spec aprovada: `design.md` com lista e "bloqueada por", nenhum `tasks/NN-*.md` |
| CA-04 | cenário de pedido pequeno: o agente aponta que é task |
| CA-05 | cenário de spec existente + descoberta: edição sem contradição, "Atualizado em", tasks afetadas |

Comandos (dentro de `.agents/skills/oficina-de-skills/`):

- `rtk python3 scripts/quick_validate.py ../spec` — cabeçalho da skill
- `rtk python3 -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name spec`
- tela de comparação (`eval-viewer/generate_review.py`) para o retorno do Juno

A task só está concluída com a comparação com × sem revisada pelo Juno e a evidência registrada no
fechamento. Se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

- **O que foi feito:** skill `spec` (cria e atualiza `spec.md` + `design.md`, com entrevista em rodadas,
  exceção "escreva mesmo assim" com lacunas visíveis, contradição bloqueando aprovação e modo atualizar)
  escrita, testada em 4 rodadas com × sem a skill e registrada na tabela do `AGENTS.md`; cenários de teste
  versionados em `.agents/skills/spec/evals/`.
- **Arquivos alterados:** criados `.agents/skills/spec/SKILL.md`, `ORIGEM.md`, `evals/evals.json`,
  `evals/files/*` e esta task; alterados `AGENTS.md` (linha na tabela de skills),
  `.agents/skills/oficina-de-skills/scripts/aggregate_benchmark.py` e `ORIGEM.md` (escopo aprovado). Os
  ajustes em modelos, critério 6 e oficina já foram commitados antes (`594e90de`, `f3d2dbd5`). Nenhum
  arquivo fora dos previstos/aprovados.
- **Decisões tomadas no caminho:**
  - 1a: task, na branch atual; 1b: este arquivo; 1c: entrevista dentro da skill; 1d: para no
    `design.md`, arquivos de task ficam com a skill `task`;
  - entrevista em rodadas de 3 a 5 decisões, sem limite total (passou de ~6 rodadas → sugerir quebrar);
    revisor externo opcional (prompt pronto para o Juno colar); conferência manual no fim; respostas viram
    "Decisões de produto";
  - modo atualizar na mesma skill; design também entrevista (depois de ler o código); ADR só identificado
    e listado como task;
  - nomes de skill por substantivo; `criar-skill` → `oficina-de-skills`; esta skill = `spec`;
  - (2026-11-15) modo atualizar: mudança já decidida edita primeiro e **mantém o status**; mudança que
    precisou de entrevista volta a `rascunho`; varredura: item em aberto não aparece como fato fora de
    "Em aberto" ("depende de Qn").
- **Testes antes de começar:** não se aplica (sem código)
- **Testes no fim:** `quick_validate` ok. Rodada final (`spec-workspace/iteration-4/`, 7 cenários × 3
  execuções com a skill; linha de base da rodada 2): **98% × 72%**, tempo 88 s × 111 s, tokens ~90k × ~89k.
  Modo leve depois dos ajustes: atualizar 7/7 (iteration-3), pressão 4/4 (iteration-5).
- **Evidência por critério:** CA-01 validade 5/5 ×3; CA-02 notificações 6/6 ×3 (achou as contradições
  README e UC14 sem escrever); CA-03 design 6/6, 5/6, 6/6 (run-2 reabriu a 8a — aceito como caso isolado);
  CA-04 pedido pequeno 4/4 ×3; CA-05 atualizar 7/7 ×3 (status mantido, task 06 riscada sem renumerar).
  Extras: pressão 4/4, 3/4, 4/4 → corrigido e 4/4 no modo leve; conflito ADR 010 4/4 ×3.
- **Checagens não feitas:** a escrita do `design.md` e da spec depois de uma rodada respondida não foi
  testada (nenhum cenário de continuação; as expectativas "se escreveu…" passaram por vacuidade). Os números
  medem "skill + ambiente do Juno" (o `CLAUDE.local.md` é carregado nos subagentes).
- **Ficou para depois:** cenários melhores (exatidão dos fatos citados, continuação, status/numeração);
  padrão de corpo do commit (o quê + porquê + referência à task); mover esta task para `done/` fica com a
  skill de encerramento.
- **Commits entregues:** `docs(agents): Cria a skill spec para criar e atualizar specs` e
  `fix(agents): Corrige leitura de tokens no aggregate_benchmark da oficina-de-skills`.
