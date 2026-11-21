# Task: Modelos e validador de spec e design

- **Status:** `concluída`
- **Criado em:** 2026-11-20
- **Atualizado em:** 2026-11-20 — aprovada na revisão do Juno
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Modo:** `agente implementa, Juno revisa`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** 01-governanca.md
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-03` (criada pelo Juno)

## 1. Contexto e critérios

### Problema

Hoje (antes desta task), o `validate_spec.py` só exige as seções `##` do `spec.md` e do `design.md`: o que está
dentro delas ("Fica fora", "Em aberto", "Fechadas"…) são rótulos soltos, e se o agente apaga a linha a spec
passa. Uma decisão em aberto só trava a aprovação se trouxer o marcador de texto exato do modelo, procurado no
documento inteiro (a tabela "Hoje → Depois" desta spec já deu falso positivo por citá-lo). O
`create_design.py` só confere o status da spec. Um item da lista de tasks do design sem "bloqueada por" ou sem
"cobre" passa no validador, e o `create_task.py` grava "nenhum" em silêncio quando falta o "cobre" (e corta o
"cobre" de um item que quebra linha). O design ainda tem o campo Branch, que o `validate_task.py` lê, embora
a spec tenha decidido uma branch por task.

### Objetivo

Modelos `spec.md` e `design.md` com subseções fixas para os itens obrigatórios; o `validate_spec.py` cobrando
cada uma (ausente ou vazia é erro, "não se aplica" vale), exigindo "Em aberto" igual a "nada" para a spec
`aprovada` e "bloqueada por" e "cobre" em cada item da lista de tasks; o `create_design.py` recusando spec com
algo em aberto; o campo Branch fora do design; e esta spec e este design convertidos ao modelo novo.

### Referências

[spec.md](../spec.md) (seção "Entra": modelos de spec e de design; CA-31 a CA-33) e [design.md](../design.md)
(tabelas "Scripts e lib" e "Modelos", risco "o validador novo de spec acusa esta spec", lista de tasks);
modelo de task da 02 (corpo único), em `.agents/docs/templates/task.md`.

### Critérios de aceite

CA-31, CA-32, CA-33

## 2. O que fazer nesta tarefa

### Fica fora

- aprovar e encerrar a spec por script (`approve_spec.py`, `finish_spec.py`: task 04);
- o "iniciar" (task 05), inclusive qualquer recusa por item em aberto no design;
- o passo de leitura e o checklist de alcance na skill `spec` (task 07);
- o texto da skill `spec` além dos trechos que descrevem o modelo e o validador (passo 8);
- o modelo de task, salvo o que o passo 7 tira do `validate_task.py`;
- as tasks concluídas desta spec (`01-governanca.md`, `02-modelo-e-validador-de-task.md`,
  `09-base-de-achados.md`): continuam como estão.

### Decisões

Vindas da spec e do design (não reabrir):

- Modelos de spec e de design com o mesmo tratamento do modelo de task (subseções fixas, nunca apagadas, "não
  se aplica" vale), mantendo a divisão entre o quê (spec) e o como (design), e esta spec convertida — descartada:
  spec ou task separada depois (regras diferentes para a mesma ideia nos dois validadores) — spec, revisão do
  rascunho (2026-11-19).
- Do modelo de spec do doe-palmas entram só as subseções fixas (Entra e Fica fora como subseções) — descartadas:
  Premissas e Hotspots — design, rodada 2 (2026-11-19).
- Uma branch por task, também nas de spec; o campo Branch do design deixa de existir, e com ele a leitura da
  branch do design no `validate_task.py` — descartada: uma branch por spec — spec, revisão do rascunho
  (2026-11-19); design, tabela "Impacto".
- "Em aberto" da spec precisa dizer "nada" para a spec ser `aprovada`, escrito de qualquer jeito o item (sem
  marcador exato); o `create_design.py` recusa com algo em aberto e lista os itens — spec, CA-32 (2026-11-19).
- Cada item da lista de tasks traz "bloqueada por" e os critérios que cobre — spec, "Entra" e CA-33 (2026-11-19).
- Todo achado tem o código da regra (`spec.…`) — design, rodada 2 (2026-11-19); padrão entregue pela 09.
- Os validadores de task e de spec terminam a saída com a linha `N erro(s), M aviso(s)` — revisão da 01, Q2 A
  (2026-11-19).
- Até a 05, a 03 salva a base de achados antes de começar e compara no fim — Q6 da 02 (2026-11-20).

Desta abertura (leitura do design, sem rodada própria):

- "Em aberto" do design é subseção obrigatória e não vazia ("nada" vale), sem formato de item nem regra de
  aprovação: o design não tem status, nenhum CA cobra mais que isso e a tabela "Modelos" do design tira o
  "bloqueia" dele — derivado do design (2026-11-20).

Desta abertura (rodada de 2026-11-20):

- No `spec.md`, viram subseções `###` as quatro do design (Entra, Fica fora, Fechadas, Em aberto) e também
  Problema e Objetivo; o "Ao final, isto é verdade" e a tabela "Hoje → Depois" ficam no corpo da seção 1 — a
  tabela "Modelos" do design ganha esse ajuste — descartada: só as quatro do design (Problema e Objetivo
  continuariam podendo sumir, a lacuna que o Problema da spec descreve) — Q1, 2026-11-20.
- `subsections`, `subsection_body` e `labels` vão do `validate_task.py` para o `md_checks.py`, e os dois
  validadores importam de lá; junto, o `mask_code` passa a abrir bloco de código só com três crases no começo
  da linha (até três espaços de recuo, como no CommonMark) — descartadas: só mover as funções, com o
  `mask_code` no estacionamento (três crases soltas esconderiam títulos `###` da spec); copiar as funções no
  `validate_spec.py` (duas cópias divergem) — Q4, 2026-11-20.
- A linha `N erro(s), M aviso(s)` entra nos dois validadores nesta task (a 02 não a entregou), com uma função
  de resumo comum na lib — descartada: só no `validate_spec.py`, com a do `validate_task.py` numa task avulsa —
  Q5, 2026-11-20.
- No `design.md`, viram subseções `###` as de "1. Decisões técnicas" (`### Fechadas`, `### Em aberto`,
  `### ADR novo?`) e o Impacto ganha os mesmos seis eixos da task (contrato da API, banco, front, permissões e
  segurança, testes existentes que mudam de propósito, documentação), cada um "sim — o quê" ou "não"; a tabela
  "Quem usa o que muda" fica no corpo da seção 3 e a checagem dos eixos vai para a lib, usada pelos dois
  validadores — descartadas: só as de decisões (o Impacto continuaria podendo sumir); os quatro rótulos atuais
  como subseções de texto livre (segundo vocabulário para a mesma ideia) — Q2, 2026-11-20 (o Juno apontou que
  "não se aplica" resolve o eixo que não toca a spec).
- Task de spec sem critério escreve "cobre: nenhum" explicitamente na lista do design, e o `create_task.py`
  recusa item sem "cobre" em vez de gravar "nenhum" sozinho — descartada: toda task de spec cobrir pelo menos
  um CA (um refactor pedido pela spec no meio do caminho, como a T2.4 do doe-palmas, teria de virar avulsa) —
  Q3, 2026-11-20.
- Do modelo de spec do doe-palmas, "fonte dos fatos" com "[a verificar]" e o bloco de encerramento no topo da
  spec fechada ficam anotados no design, para a 07 e a 04 decidirem ao abrir; Premissas, AS-IS/Hotspots,
  riscos com probabilidade e IDs de decisão continuam fora (rodada 2 do design mantida) — descartadas: só no
  estacionamento (esquecível); trazer para a 03 (decide pela leitura e pelo encerramento) — Q6, 2026-11-20.

### Em aberto

nada

### Passos

1. **Modelo `.agents/docs/templates/spec.md`**: `### Problema` e `### Objetivo` na seção 1 (o "Ao final" e a
   tabela continuam no corpo), `### Entra` e `### Fica fora` na 2, `### Fechadas` e `### Em aberto` na 3;
   "Em aberto" sem o "bloqueia", com "nada" quando não houver item.
2. **Modelo `.agents/docs/templates/design.md`**: sem o campo Branch; `### Fechadas`, `### Em aberto` e
   `### ADR novo?` na seção 1; `### Impacto` da seção 3 com os seis eixos da task (a tabela "Quem usa o que
   muda" fica no corpo; saem os rótulos Front, Swagger, ADRs existentes e Dados existentes); o comentário da
   lista de tasks diz o formato do item (`bloqueada por: … — cobre: …`) e que task sem critério escreve
   "cobre: nenhum".
3. **Lib `.agents/scripts/lib/`**: `subsections`, `subsection_body` e `labels` saem do `validate_task.py`
   para o `md_checks.py`; função comum da linha `N erro(s), M aviso(s)`; `mask_code` (`md_utils.py`) só abre
   bloco com três crases no começo da linha (até três espaços de recuo), com teste; a checagem dos seis eixos
   do Impacto sai do `validate_task.py` (`check_impact`) para a lib, com o prefixo do código por quem chama
   (`task.impacto-…`, `spec.impacto-…`).
4. **`validate_spec.py`**, com código em cada achado:
   - subseção obrigatória ausente ou vazia, no `spec.md` e no `design.md`, com a linha e o nome; "não se
     aplica" vale (CA-31);
   - spec `aprovada` com "Em aberto" diferente de "nada": erro que lista os itens; sai o marcador de texto exato
     (CA-32);
   - os seis eixos do Impacto do design, pela checagem da lib;
   - item da lista de tasks sem "bloqueada por" ou sem "cobre": erro com a linha do item e o que falta, lendo o
     item inteiro mesmo quando ele quebra linha (CA-33); item é o marcador de lista seguido do número da task
     (`NN —`, com ou sem link, riscado ou não), para as notas logo abaixo da lista não contarem;
   - a linha `N erro(s), M aviso(s)` no fim da saída (função da lib).
5. **`create_design.py`**: recusa a spec com "Em aberto" diferente de "nada" e lista os itens (CA-32), além da
   recusa de hoje (status diferente de `aprovada`).
6. **`create_task.py`**: lê o item da lista do design mesmo quando ele quebra linha (hoje corta o "cobre");
   item sem "cobre" é recusado com a linha do design (deixa de gravar "nenhum"); "cobre: nenhum" vale.
7. **`validate_task.py`**: sai a leitura da Branch do design (`_design_branch`, o parâmetro `branch_design` e o
   código `task.branch-diferente-do-design`) e o teste dela; importa `subsections`, `subsection_body` e
   `labels` e a checagem dos eixos da lib; termina a saída com a linha `N erro(s), M aviso(s)`.
8. **Skill `spec`**: os trechos que descrevem o modelo e o validador passam ao modelo novo (subseções, "Em
   aberto" igual a "nada" no lugar do marcador, item da lista com "cobre", design sem Branch), como a 02 fez com
   a skill `task`.
9. **Converter ao modelo novo**: o `spec.md` e o `design.md` desta spec; as fixtures de
   `.agents/skills/spec/scripts/testes/`; os arquivos de spec e design em `.agents/skills/spec/evals/files/` (o
   `test_validate_task.py` usa o par `spec-notificacoes-aprovada.md` e `design-notificacoes-aprovado.md` como a
   spec das tasks de spec); a linha do `spec.md` na tabela "Modelos" do design ganha Problema e Objetivo (Q1) e a do
   `design.md`, o Impacto com os seis eixos (Q2).
10. **Base de achados nesta task:** salvar antes da primeira edição e comparar no fim (seção 3), registrando os
    três grupos no fechamento.

### Ler antes de começar

- `.agents/docs/templates/spec.md` e `.agents/docs/templates/design.md` — os modelos atuais
- `.agents/docs/templates/task.md` — o corpo único da 02, referência para as subseções
- `.agents/skills/spec/scripts/validate_spec.py` — seções por título, o marcador exato e `validate()` importado
  pela governança
- `.agents/skills/spec/scripts/create_design.py` e `.agents/skills/spec/scripts/create_spec.py`
- `.agents/skills/spec/scripts/testes/test_validate_spec.py` e as pastas-fixture ao lado
- `.agents/skills/task/scripts/validate_task.py` — `subsections`, `subsection_body`, `labels`, `_design_branch`
  e `check_branch`
- `.agents/skills/task/scripts/create_task.py` — `ler_lista` (`_ITEM_LISTA`, `_COBRE`, o "nenhum")
- `.agents/skills/task/scripts/testes/test_validate_task.py` e `test_create_task.py`
- `.agents/scripts/lib/md_checks.py` e `.agents/scripts/lib/md_utils.py` — `section_body`, `check_sections`,
  `mask_code`
- `.agents/skills/governanca/scripts/checagens/skills.py` — `load_expected_sections` lê `_SECOES_OBRIGATORIAS`
  do validador da spec
- `.agents/skills/spec/SKILL.md` — fases 2 e 3 (modelo, validador, aprovação, criação do design)
- `.agents/skills/spec/evals/evals.json` e `.agents/skills/spec/evals/files/`

### Arquivos previstos

- alterados: `.agents/docs/templates/spec.md` e `design.md`; `.agents/skills/spec/scripts/validate_spec.py`,
  `create_design.py`, `test_validate_spec.py` e as pastas-fixture; os arquivos de spec e design de
  `.agents/skills/spec/evals/files/`; `.agents/skills/spec/SKILL.md` (passo 8);
  `.agents/skills/task/scripts/validate_task.py`, `create_task.py`, `test_validate_task.py` e
  `test_create_task.py`; o `spec.md`, o `design.md` e esta task;
- a lib: `.agents/scripts/lib/md_checks.py` e `md_utils.py`, e os testes dela (conferir na implementação onde
  moram; se não houver, criar ao lado);
- possivelmente `.agents/skills/governanca/scripts/checagens/skills.py` e `test_governanca.py`, se a lista de
  seções esperadas mudar de forma (como na 02); conferir na implementação;
- teste novo do `create_design.py` (hoje não tem), na pasta de testes da skill `spec`;
- acrescentados na implementação, com a aprovação do Juno (2026-11-20, 1 A e 2 A): as cópias de spec e design
  em `.agents/skills/task/evals/files/` (são as que os testes da `task` usam) e o passo 1.4 da
  `.agents/skills/task/SKILL.md` (citava a branch do design).

### Não deve mudar

- as tasks em `.agents/docs/tasks/done/` e as concluídas desta spec;
- o modelo `task.md` e as regras do `validate_task.py` além do passo 7;
- a governança, salvo o ajuste de seções esperadas no `skills.py` (se preciso); `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

- **Contrato da API:** não
- **Banco:** não
- **Front:** não
- **Permissões e segurança:** não
- **Testes existentes que mudam de propósito:** sim — os que montam spec ou design pelo modelo antigo:
  - `test_validate_spec.py`: a fixture `aprovada-com-bloqueio` (prova o marcador exato, que sai) passa a provar
    "Em aberto" diferente de "nada"; as outras fixtures passam ao modelo novo;
  - `test_validate_task.py`: sai `test_branch_diferente_da_do_design`; as tasks de spec usam o par de evals
    convertido;
  - `test_create_task.py`: "Task sem dependência e sem critério nasce … com 'nenhum'" passa a usar
    "cobre: nenhum" explícito, e item sem "cobre" passa a ser recusado (Q3);
  - `test_governanca.py`, se conferir as seções reais do validador da spec.
- **Documentação:** sim — os modelos `spec.md` e `design.md`, a skill `spec` (passo 8), os arquivos de eval
  da skill `spec` e o `spec.md`/`design.md` desta spec

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
Andamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-31 | `test_validate_spec.py` — "subseção obrigatória ausente ou vazia no spec.md ou no design.md é acusada com o nome dela (CA-31)" |
| CA-31 | `test_validate_spec.py` — "subseção que diz só 'não se aplica' não é acusada (CA-31)" |
| CA-32 | `test_validate_spec.py` — "spec aprovada com 'Em aberto' diferente de 'nada' é acusada com os itens (CA-32)" |
| CA-32 | `test_create_design.py` — "create_design recusa spec com algo em aberto e lista os itens (CA-32)" |
| CA-33 | `test_validate_spec.py` — "item da lista de tasks sem 'bloqueada por' ou sem 'cobre' é acusado com a linha (CA-33)" |

Em Python, o nome do teste é a primeira linha da docstring.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"`
- `rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes`
- `rtk python3 .agents/skills/spec/scripts/validate_spec.py .agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes`
  — esta spec convertida, sem erro
- antes da primeira edição: `rtk python3 .agents/skills/governanca/scripts/governanca.py --salvar-base
  .agents/skills/governanca-workspace/base-03.txt`; no fim, o mesmo comando com `--comparar` no lugar de
  `--salvar-base`: sem erro novo
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../spec`
- **Mutação manual** (guia de testes, seção 5.2): aceitar subseção vazia; recusar "não se aplica"; aceitar
  "Em aberto" com item numa spec `aprovada`; `create_design` sem a recusa de "Em aberto"; aceitar item da lista
  sem "cobre"; aceitar item sem "bloqueada por"; ler só a primeira linha do item da lista. Todas devem ser
  detectadas por algum teste.
- **Checagem manual:** criar uma spec com o `create_spec.py` numa pasta temporária, conferir que nasce no modelo
  novo e que o validador só acusa o que falta preencher; tentar o `create_design.py` com um item em aberto
  (recusa) e com "nada" (cria); desfazer depois.

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

- 2026-11-20 — task aprovada pelo Juno (commit `3c4c6382` na `main`); branch criada por ele. Suítes antes:
  scripts da `spec` 8 OK, scripts da `task` 73 OK, governança 74 OK, evals da `task` 42 OK;
  `quick_validate ../spec` válida; governança no repositório 0 erros, 5 avisos. Base salva em
  `.agents/skills/governanca-workspace/base-03.txt` (5 achados). A lib não tem testes próprios hoje.

- 2026-11-20 — lib: `subsections`, `subsection_body`, `labels`, a checagem de subseções e a dos seis eixos
  (com o dono no código) saem do `validate_task.py` para o `md_checks.py`; `summary_line`; leitura da lista de
  tasks (`task_list_items`, item inteiro mesmo quebrando linha), usada pelo `create_task.py` e pelo
  `validate_spec.py`; `mask_code` com a cerca só no começo da linha. Testes da lib em `.agents/scripts/lib/testes/`.
- 2026-11-20 — decisão no caminho: a cerca aceita qualquer recuo (não só até três espaços, como dizia a Q4): a
  `SKILL.md` da `spec` tem blocos recuados 5 espaços dentro de lista, que deixariam de ser mascarados. Continua
  corrigindo o caso das três crases no meio da linha.
- 2026-11-20 — achado: o `create_task.py` também lia a Branch do design (`_BRANCH_DESIGN`); saiu junto com a
  do `validate_task.py` (arquivo já previsto).
- 2026-11-20 — achado: a skill `task` tem cópias próprias de `spec-notificacoes-aprovada.md` e
  `design-notificacoes-aprovado.md` em `.agents/skills/task/evals/files/` (só o cabeçalho difere das da `spec`);
  são elas que o `test_validate_task.py` e o `test_create_task.py` usam, e não as da `spec`, como dizia o passo 9.
  Convertidas também (fora dos previstos; os testes da `task` não passam sem isso) — pergunta ao Juno.
- 2026-11-20 — decisões no caminho: "Em aberto" igual a "nada" vale a partir de `aprovada` (também `em
  andamento` e `concluída`); item riscado da lista (task cancelada) fica fora do CA-33 (o exemplo da skill
  `spec` não tem "bloqueada por" nem "cobre"); "Ao final" e a tabela "Hoje → Depois" ficam dentro de
  `### Objetivo` (Markdown não tem como voltar ao corpo da seção depois de um `###`).
- 2026-11-20 — modelos, `validate_spec.py`, `create_design.py`, skill `spec`, fixtures (regeneradas do par
  convertido; `aprovada-com-bloqueio` virou `aprovada-com-aberto`), os dois pares de evals e o `spec.md` e
  `design.md` desta spec convertidos. Suítes: lib 4, `spec` 20, `task` 76, governança 74, evals 42, todos
  OK. Mutação: 20 mutantes, 19 mortos na primeira rodada; o vivo (`mask_code` antigo) levou a reforçar o
  teste (crases soltas antes de uma cerca de verdade) e morreu. Checagem manual numa spec temporária ok.
  `--comparar base-03.txt`: 0 erros novos, 0 avisos novos, 5 já existiam.
- 2026-11-20 — achado fora do escopo: o passo 1.4 da `task/SKILL.md` ainda diz "a branch é a do `design.md`
  (se houver…)"; não mexi (arquivo fora dos previstos) — pergunta ao Juno.
- 2026-11-20 — fechamento preenchido; aguardando a revisão do Juno.
- 2026-11-20 — Juno aprovou (1 A) as cópias de `task/evals/files/` convertidas e pediu (2 A) corrigir nesta
  task o passo 1.4 da `task/SKILL.md`: branch sugerida sempre `<tipo>/juno/<assunto da spec>-NN` e recusa do
  item sem link ou sem "cobre". `quick_validate ../task` válida; suítes e `--comparar` de novo sem mudança.
- 2026-11-20 — revisão do Juno: "Referências técnicas" do design ficou com rótulos livres (fora da Q2); se
  "ADRs aplicáveis" vira subseção fixa fica para a 07, anotado nas notas da lista de tasks do design.
- 2026-11-20 — Juno perguntou pelo modo leve (não oferecido antes de editar as skills, como a oficina manda) e
  escolheu um cenário na skill `spec`: spec em `rascunho` com um item em "Em aberto" sem marcador, pedido
  "aprova e cria o design". Ambientes fechados em `.agents/skills/spec-workspace/modo-leve-03/` (skill,
  scripts, lib e modelos da `HEAD` × atuais), um subagente por vez. Asserções fixadas antes: status não vira
  `aprovada`; `design.md` não é criado; aponta o item; pede a decisão. Primeira rodada (item: email além do
  in-app) descartada depois da antiga: o item contradizia o "Fica fora" e a antiga recusou pela regra de
  contradição, sem separar as versões; refeita com um item que nada na spec responde (data relativa ou
  absoluta). Antiga: 4 de 4, mas recusou por "o item não diz o que bloqueia" e ofereceu como saída marcar
  "bloqueia: design" e aprovar com o item em aberto (a brecha que a 03 fecha). Nova: 4 de 4, citou a regra
  "Em aberto igual a nada" e a recusa do `create_design.py`, sem caminho para aprovar com item em aberto.
  Nenhum arquivo alterado nas duas rodadas (conferido).
- 2026-11-20 — aprovada na revisão do Juno; status `concluída`.

## 5. Fechamento

- **O que foi feito:** os modelos `spec.md` e `design.md` ganharam subseções fixas: no `spec.md`, Problema,
  Objetivo, Entra, Fica fora, Fechadas e Em aberto ("nada" quando vazio, sem o "bloqueia"); no `design.md`,
  Fechadas, Em aberto e ADR novo?, e o `### Impacto` com os seis eixos da task; o design perdeu o campo Branch e
  o comentário da lista de tasks diz o formato do item ("cobre: nenhum" vale). O `validate_spec.py` cobra
  subseção ausente ou vazia (`spec.subsecao-…`), os eixos do Impacto do design (`spec.impacto-…`), "Em aberto"
  igual a "nada" a partir de `aprovada`, com um achado por item (`spec.aprovada-com-aberto`, no lugar do
  marcador exato), e "bloqueada por"/"cobre" em cada item da lista (`spec.task-sem-…`). O `create_design.py`
  recusa spec com item em aberto e lista as linhas. O `create_task.py` lê o item inteiro (o "cobre" que quebra
  linha não é mais cortado), recusa item sem "cobre" ou sem link e sempre sugere `<tipo>/juno/<assunto>-NN`. A
  lib passou a ter a leitura de subseções, rótulos, eixos e lista de tasks, a `summary_line` (os dois
  validadores terminam com `N erro(s), M aviso(s)`) e o `mask_code` com a cerca só no começo da linha. A skill
  `spec` descreve o modelo e o validador novos. Esta spec, este design, as fixtures e os dois pares de evals
  foram convertidos.
- **Arquivos alterados:** os previstos: modelos `spec.md` e `design.md`; `validate_spec.py`, `create_design.py`,
  `test_validate_spec.py`, as pastas-fixture (com `aprovada-com-bloqueio` renomeada para `aprovada-com-aberto`)
  e o `test_create_design.py` novo; `.agents/skills/spec/evals/files/` (spec e design); `spec/SKILL.md`;
  `validate_task.py`, `create_task.py`, `test_validate_task.py`, `test_create_task.py`; `md_checks.py`,
  `md_utils.py` e os testes novos da lib (`.agents/scripts/lib/testes/test_lib.py`); o `spec.md`, o `design.md`
  e esta task. Fora dos previstos, com a aprovação do Juno: as cópias de spec e design em
  `.agents/skills/task/evals/files/` (as que os testes da `task` usam) e o passo 1.4 da `task/SKILL.md`. Não
  mudaram: a governança (o
  `skills.py` não precisou de ajuste), o modelo `task.md`, `api/` e `web/`.
- **Decisões tomadas no caminho:**
  - A cerca de código aceita qualquer recuo no começo da linha, não só até três espaços: a skill `spec` tem
    blocos recuados 5 espaços dentro de lista.
  - "Em aberto" do `spec.md` precisa dizer "nada" a partir de `aprovada`, também em `em andamento` e
    `concluída`: sem isso, a regra sumiria quando o "iniciar" da primeira task mudasse o status.
  - Item do "Em aberto": cada item de lista ou, sem lista, cada parágrafo; um achado por item, com a linha e o
    começo do texto.
  - Item riscado da lista de tasks (cancelada) fica fora do CA-33.
  - "Ao final" e a tabela "Hoje → Depois" ficam dentro de `### Objetivo`.
  - A leitura da lista de tasks mora na lib (`task_list_items`), usada pelo `create_task.py` e pelo
    `validate_spec.py`: a mesma regra de "o que é um item" nos dois. O `create_task.py` passou a enxergar item
    sem link (dependência ainda não criada aparece como "não criada" em vez de "não está na lista") e recusa
    criar a task de um item sem link.
  - O `create_task.py` também deixou de ler a Branch do design; o passo 1.4 da skill `task` acompanha (2 A).
  - A linha do achado de subseção ausente é a do começo do corpo da seção (comportamento da lib desde a 02).
- **Testes antes de começar:** scripts da `spec` 8 OK; scripts da `task` 73 OK; governança 74 OK; evals da
  `task` 42 OK; `quick_validate ../spec` válida; governança 0 erros, 5 avisos; base `base-03.txt` (5 achados).
- **Testes no fim:** lib 4 OK (novos); scripts da `spec` 20 OK (12 novos ou reescritos, 3 deles do
  `create_design`); scripts da `task` 76 OK (sai o teste da branch do design, entram 4: item sem cobre, item que
  quebra linha, item sem link, branch de spec mesmo com Branch no design; mais a linha de resumo); governança
  74 OK; evals da `task` 42 OK; `quick_validate` da `spec` e da `task` válidas; `validate_spec.py` nesta spec
  sem problema; `--comparar base-03.txt`: 0 erros novos, 0 avisos novos, 5 já existiam, 0 corrigidos.
  Mutação: 20 mutantes (subseção vazia e ausente aceitas, "não se aplica" recusado, Em aberto ignorado na
  `aprovada`, só `aprovada` travando, qualquer texto valendo "nada", parágrafo solto ignorado, `create_design`
  sem a recusa, item sem cobre e sem bloqueada por aceitos, riscado cobrado, Impacto do design ignorado, item
  lido só na primeira linha, nota virando item, `create_task` gravando "nenhum", `mask_code` antigo, as duas
  linhas de resumo, a conta do resumo, o cobre do riscado), 20 mortos; o do `mask_code` sobreviveu à primeira
  rodada e morreu com o teste reforçado. Checagem manual: spec temporária criada pelo `create_spec.py` só com
  placeholders acusados (34); `create_design.py` recusou com o item do modelo em aberto (linha 77) e criou o
  design, sem Branch, com "nada"; pasta apagada. Modo leve da oficina (skill `spec`, cenário "aprova com item
  em aberto sem marcador"): antiga e nova pararam (4 de 4 asserções), mas a antiga ofereceu aprovar com o item
  marcado "bloqueia: design"; a nova não deixa caminho para isso (detalhes no Andamento).
- **Evidência por critério:** CA-31 → testes "subseção obrigatória ausente ou vazia no spec.md ou no design.md
  é acusada com o nome dela (CA-31)" e "subseção que diz só 'não se aplica' não é acusada (CA-31)" passando
  (mutantes de subseção mortos); CA-32 → testes "spec aprovada com 'Em aberto' diferente de 'nada' é acusada
  com os itens (CA-32)" e "create_design recusa spec com algo em aberto e lista os itens (CA-32)" passando
  (mutantes do Em aberto e do `create_design` mortos); CA-33 → teste "item da lista de tasks sem 'bloqueada
  por' ou sem 'cobre' é acusado com a linha (CA-33)" passando (mutantes da lista mortos).
- **Checagens não feitas:** o CI no GitHub (roda no push; localmente rodei as mesmas suítes e a governança);
  os cenários completos com agente dos evals da skill `spec` (rodado só o modo leve, um cenário); o passo 1.4
  da skill `task` sem cenário (descreve o que o `create_task.py` faz, coberto pelos testes). O modo leve mede
  "a skill + o ambiente do Juno" (as preferências locais entram nos subagentes).
- **Ficou para depois:** a linha dos achados de subseção ausente aponta o
  começo do corpo da seção, não o título (lib, desde a 02) → estacionamento.
- **Commits entregues:** três, nesta ordem: a implementação, a skill `spec` e, depois da aprovação, esta
  task concluída.

  ```text
  feat(agents): Adiciona subseções fixas e Em aberto cobrado à spec e ao design

  - os modelos spec.md e design.md ganham subseções ### fixas, o
    Impacto do design com os seis eixos da task e o design sem Branch;
  - o validate_spec cobra subseção ausente ou vazia, os eixos do
    design, "Em aberto" igual a "nada" a partir de aprovada e
    "bloqueada por" e "cobre" em cada item da lista de tasks;
  - o create_design recusa spec com item em aberto;
  - o create_task lê o item da lista inteiro e recusa item sem
    "cobre"; a branch da task de spec não vem mais do design;
  - a lib reúne subseções, rótulos, eixos, lista de tasks e a linha
    de resumo dos validadores, e o mask_code só abre bloco com a
    cerca no começo da linha;
  - esta spec, o design, as fixtures e os evals acompanham o modelo.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/03-modelos-e-validador-de-spec-e-design.md
  ```

  Arquivos:
  - `.agents/docs/templates/spec.md`
  - `.agents/docs/templates/design.md`
  - `.agents/scripts/lib/md_checks.py`
  - `.agents/scripts/lib/md_utils.py`
  - `.agents/scripts/lib/testes/test_lib.py`
  - `.agents/skills/spec/scripts/validate_spec.py`
  - `.agents/skills/spec/scripts/create_design.py`
  - `.agents/skills/spec/scripts/testes/test_validate_spec.py`
  - `.agents/skills/spec/scripts/testes/test_create_design.py`
  - `.agents/skills/spec/scripts/testes/aprovada-com-bloqueio/spec.md` (removido)
  - `.agents/skills/spec/scripts/testes/aprovada-com-aberto/spec.md`
  - `.agents/skills/spec/scripts/testes/com-design/design.md`
  - `.agents/skills/spec/scripts/testes/com-design/spec.md`
  - `.agents/skills/spec/scripts/testes/criterios-com-problemas/spec.md`
  - `.agents/skills/spec/scripts/testes/metadados-com-problemas/spec.md`
  - `.agents/skills/spec/scripts/testes/secoes-ausente-e-vazia/spec.md`
  - `.agents/skills/spec/scripts/testes/so-spec/spec.md`
  - `.agents/skills/spec/evals/files/design-notificacoes-aprovado.md`
  - `.agents/skills/spec/evals/files/spec-notificacoes-aprovada.md`
  - `.agents/skills/task/evals/files/design-notificacoes-aprovado.md`
  - `.agents/skills/task/evals/files/spec-notificacoes-aprovada.md`
  - `.agents/skills/task/scripts/validate_task.py`
  - `.agents/skills/task/scripts/create_task.py`
  - `.agents/skills/task/scripts/testes/test_validate_task.py`
  - `.agents/skills/task/scripts/testes/test_create_task.py`
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/spec.md`
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/design.md`

  ```text
  docs(agents): Ensina as skills spec e task o modelo novo de spec

  - o modelo tem subseções fixas que nunca são apagadas ("não se
    aplica" vale);
  - "Em aberto" precisa dizer "nada" para aprovar e criar o design,
    sem o marcador "bloqueia";
  - o design não tem branch, o Impacto usa os seis eixos e cada item
    da lista diz o que cobre ("cobre: nenhum" vale);
  - na skill task, a branch da task de spec é sempre
    <tipo>/juno/<assunto da spec>-NN, e o create_task recusa item sem
    link ou sem "cobre".

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/03-modelos-e-validador-de-spec-e-design.md
  ```

  Arquivos:
  - `.agents/skills/spec/SKILL.md`
  - `.agents/skills/task/SKILL.md`

  ```text
  docs(agents): Conclui a task 03 do fluxo de trabalho

  - a task registra a implementação no Andamento e no fechamento;
  - aprovada na revisão do Juno.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/03-modelos-e-validador-de-spec-e-design.md
  ```

  Arquivos:
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/03-modelos-e-validador-de-spec-e-design.md`
