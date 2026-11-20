# Task: Modelo e validador de task

- **Status:** `concluída`
- **Criado em:** 2026-11-20
- **Atualizado em:** 2026-11-20 — aprovada na revisão do Juno
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Modo:** `agente implementa, Juno revisa`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** 01-governanca.md
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-02` (criada pelo Juno)

## 1. Contexto e critérios

### Problema

No modelo atual (antes desta task), os itens rastreáveis são rótulos soltos ("Fica fora", "Arquivos
previstos", "Não deve mudar"…) que o validador não confere: se o agente apaga a linha, a task passa. Também
não há onde registrar o Modo, as decisões tomadas, o que está em aberto, o impacto por eixo e o andamento
datado, e a task avulsa e a de spec têm corpos diferentes (seção 1 só na de spec, seção 2 só na avulsa).

### Objetivo

Modelo de task com corpo único, subseções fixas, Impacto em seis eixos, Decisões, Em aberto, Andamento e Modo,
com o `validate_task.py` cobrando cada um e o `create_task.py` gerando a task já no formato.

### Referências

[spec.md](../spec.md) (problema e escopo da spec) e [design.md](../design.md) (seção "Modelos" e a lista de
tasks).

### Critérios de aceite

CA-01, CA-02, CA-03, CA-20

## 2. O que fazer nesta tarefa

### Fica fora

- o checklist de alcance do "Ler antes de começar" e o passo de leitura (task 07);
- o texto da skill `task` além do passo 4 dos Passos: iniciar, encerrar e fechar são das tasks 05 e 06;
- o bloco da base de achados dentro do Andamento (gravar e ler é das tasks 05 e 06);
- os modelos e o validador de spec e de design (task 03).

### Decisões

Vindas da spec e do design (não reabrir):

- Itens rastreáveis viram subseções fixas `###`, nunca apagadas; "não se aplica" é resposta válida — spec,
  rodada 3 (2026-11-19).
- Impacto com seis eixos fixos (contrato da API, banco, front, permissões e segurança, testes existentes que
  mudam de propósito, documentação), cada um "sim — o quê" ou "não" — spec, rodada 3 (2026-11-19).
- Decisões: só as tomadas, uma por linha (decisão, descartadas, motivo, data), no formato da skill `spec`, com
  "Em aberto" ao lado — spec, rodada 3 (2026-11-19).
- Seção de andamento com entradas datadas; o fechamento resume — spec, rodada 3 (2026-11-19).
- Metadados: Status, Criado em, Atualizado em, Tipo, Alcance, Modo e Branch; o Modo nasce com "agente
  implementa, Juno revisa" — spec, rodadas 2 e 3 (2026-11-19).
- "Commits entregues" com um bloco de código `text` por commit (a mensagem completa) seguido da lista "Arquivos:" —
  design, rodada 3 (2026-11-19).
- Tasks em `done/` e as fechadas na pasta da spec continuam no modelo antigo e não são validadas (CA-04, já
  entregue pela 01) — design, rodada 2 (2026-11-19).

Desta abertura (rodada de 2026-11-20):

- Estrutura: subseções `###` dentro das seções e duas seções novas, Andamento e Fechamento — descartada:
  seções planas como no doe-palmas (todo número citado nas skills e nos scripts mudaria) — Q1, 2026-11-20.
  A parte "as seções 1 a 4 mantêm os números" foi revista na revisão (próximas três decisões).
- Modo em conjunto fechado de dois valores, `agente implementa, Juno revisa` e `Juno implementa, agente guia e
  revisa` (o segundo com o "e revisa" pedido pelo Juno), conferido pelo validador — descartada: texto livre (o
  validador não pega erro de digitação e o "iniciar" não teria como ler o modo) — Q2, 2026-11-20.
- Andamento sempre presente; pode ficar vazio com `aberta` ou `bloqueada`; com `em andamento`, `concluída` ou
  `cancelada` exige pelo menos uma entrada; cada entrada é `- AAAA-MM-DD — texto` — descartada: o `create_task`
  gravar "criada" (repete o "Criado em") — Q3, 2026-11-20.
- O checklist de alcance do "Ler antes de começar" fica para a 07, junto do passo de leitura e do eval que o
  prova — descartada: entrar já aqui (o conteúdo seria decidido antes do passo que o usa) — Q4, 2026-11-20.
- O `create_task.py` aceita `--modo agente` (padrão) ou `--modo juno`, para o Modo nascer certo quando o Juno
  já disse que vai implementar; a troca registrada no Andamento vale só para mudança depois que a task existe —
  descartada: sempre o padrão, com o agente editando o campo depois (passo manual que a spec quer tirar dele) —
  Q5, 2026-11-20.
- Até a 05, esta task, a 03 e a 07 salvam a base de achados antes de começar e comparam no fim, registrando o
  resultado no fechamento — descartada: só as suítes antes, como na 01 e na 09 (erro antigo se confunde com
  novo) — Q6, 2026-11-20.
- No eixo de impacto, "sim" exige o travessão e um texto depois dele (`sim — rota GET /x passa a exigir
  prestador`); "sim" sozinho ou "sim —" sem texto é erro, com o nome do eixo; o travessão aceita as variantes do
  "Atualizado em" (`—`, `–` ou `-`); "não" pode vir sozinho ou com um comentário — descartada: aceitar "sim"
  sozinho (o eixo não diria o que muda) — CA-03, 2026-11-20.

Da revisão do Juno (rodada de 2026-11-20, reabre a parte da Q1 que mantinha a divisão avulsa × de spec; motivo
novo: toda task tem o mesmo corpo):

- A mudança entra nesta task, antes da aprovação — descartada: aprovar como está e abrir task nova (o modelo
  publicado mudaria logo depois e as tasks seriam convertidas duas vezes) — revisão, Q1 A.
- "Contexto e critérios" é seção de toda task, com Problema, Objetivo e Referências nos dois tipos ("não se
  aplica" vale); na avulsa, os critérios são `### CA-NN` com Dado/Quando/Então; na de spec, a subseção
  `### Critérios de aceite` cita os `CA-NN` do `spec.md`, sem copiar — descartada: a de spec copiar os
  critérios (duas cópias divergem) — revisão, Q2 A.
- O vínculo com a spec vira metadado: `**Spec:**` (links da spec e do design, ou `não se aplica`) e
  `**Bloqueada por:**` (`nenhuma`, `NN-x.md` ou `não se aplica`); as seções são renumeradas: 1 Contexto e
  critérios, 2 O que fazer, 3 Como validar, 4 Andamento, 5 Fechamento — descartada: manter a seção 1 em todas,
  com "não se aplica" na avulsa (seção vazia de propósito) — revisão, Q3 A.

### Em aberto

nada

### Passos

1. **Modelo `.agents/docs/templates/task.md`**:
   - metadados: os de hoje mais `**Modo:**`, com os dois valores como lista do modelo, e `**Spec:**` e
     `**Bloqueada por:**` (o antigo "Vínculo com a spec"; `não se aplica` na avulsa);
   - `## 1. Contexto e critérios` em toda task: `### Problema`, `### Objetivo`, `### Referências` e os critérios
     (avulsa: os `### CA-NN`; de spec: `### Critérios de aceite`, citando os `CA-NN` do `spec.md`);
   - `## 2. O que fazer nesta tarefa`: `### Fica fora`, `### Decisões`, `### Em aberto`, `### Passos`,
     `### Ler antes de começar`, `### Arquivos previstos`, `### Não deve mudar` e `### Impacto` (os seis eixos,
     um rótulo por eixo); "Testes existentes que vão mudar de propósito" passa a ser o eixo de testes;
   - `## 3. Como validar o que foi feito` sem mudança de estrutura;
   - `## 4. Andamento` (nova, com a regra da entrada datada) e `## 5. Fechamento` (com "Commits entregues" no
     formato fixo).
2. **Validador `validate_task.py`** acompanhando o modelo (CA-01, CA-02, CA-03), com o código da regra de cada
   achado (`task.…`, padrão da 09):
   - cada subseção obrigatória existe e não está vazia; "não se aplica" vale (CA-01, CA-02);
   - `**Spec:**` e `**Bloqueada por:**` presentes; `não se aplica` na avulsa e só nela;
   - os seis eixos existem e respondem "sim" ou "não" (CA-03). "Sim" exige o travessão e um texto depois
     dele, dizendo o que muda (`sim — rota GET /x passa a exigir prestador`); "sim" sozinho ou "sim —" sem
     texto é erro, com o nome do eixo. O travessão aceita as mesmas variantes do "Atualizado em" (`—`, `–` ou
     `-`). "Não" pode vir sozinho ou com um comentário depois;
   - Modo presente, um dos dois valores; "Em aberto" e "Decisões" não vazios ("nada" e "nenhuma" valem);
   - Andamento presente; com `em andamento`, `concluída` ou `cancelada`, pelo menos uma entrada; toda entrada
     no formato `- AAAA-MM-DD — texto`;
   - com `--fechar` ou `concluída`: "Commits entregues" no formato fixo (bloco de código `text` com a mensagem e a lista
     "Arquivos:" logo depois);
   - as regras de hoje continuam, adaptadas aos títulos novos (rótulos do fechamento, "Ler antes de começar",
     tabela critério → teste).
3. **`create_task.py`**: preenche o Modo com "agente implementa, Juno revisa" (CA-20), ou com "Juno
   implementa, agente guia e revisa" com a flag `--modo juno` (`--modo agente` é o padrão; só esses dois), acompanha os títulos novos
   (metadados Spec e Bloqueada por; na de spec, os `CA-NN` da lista do design em "Critérios de aceite" e sem o
   exemplo `### CA-01`; na avulsa, sem "Critérios de aceite"; o fechamento nasce só com os rótulos) e sugere a branch de task de spec com o número no fim
   (`<tipo>/juno/<assunto-da-spec>-NN`), como o design manda para o "iniciar" (hoje sai sem o número e é
   corrigida à mão).
4. **Skill `task`**: os trechos que citam as seções pelo número passam aos números novos (fechamento = 5,
   Andamento = 4) e o passo 1.4 descreve o corpo único (Spec e Bloqueada por nos metadados); no passo 1.4 (abrir),
   usar `--modo juno` quando o Juno já disse que vai implementar; no modo "atualizar",
   uma linha nova: trocar o Modo no meio da task muda o campo e registra a troca no Andamento, com data e motivo
   (segunda parte do CA-20). O resto do texto da skill (iniciar, encerrar, fechar, leitura) é das tasks 05, 06 e
   07.
5. **Converter para o modelo novo** as tasks vivas que o validador passa a cobrar: esta própria task (fica
   `em andamento` durante a implementação e a governança a valida) e os arquivos de eval da skill `task` que são
   tasks vivas (`task-aceite-em-revisao.md`, `task-aceite-implementada.md`, `task-perfil-cliente-em-andamento.md`),
   além da fixture `avulsa-ok.md` e das tasks montadas dentro dos testes.
6. **Base de achados nesta task:** antes da primeira edição, salvar a base (seção 4); no fim, comparar e
   registrar no fechamento os três grupos.

### Ler antes de começar

- `.agents/docs/templates/task.md` — o modelo atual
- `.agents/skills/task/scripts/validate_task.py` — as regras de hoje (seções, rótulos do fechamento, "Ler
  antes de começar", tabela) e o padrão de código de regra da 09
- `.agents/skills/task/scripts/create_task.py` — `montar`, `_limpar_fechamento` e a branch sugerida
- `.agents/skills/task/scripts/testes/test_validate_task.py` e `test_create_task.py`, com a fixture
  `.agents/skills/task/scripts/testes/avulsa-ok.md`
- `.agents/skills/task/evals/checks.py`, `.agents/skills/task/evals/test_checks.py` e os arquivos de
  `.agents/skills/task/evals/files/`
- `.agents/skills/spec/scripts/validate_spec.py` — como a skill `spec` cobra "Em aberto" e as decisões (formato
  a seguir)
- `.agents/scripts/lib/md_checks.py` — `check_sections`, `section_body` e o `Finding` com código
- `.agents/skills/governanca/scripts/checagens/skills.py` — `load_expected_sections`, que lê do validador as
  seções que o modelo precisa ter
- `.agents/skills/task/SKILL.md` — passos 1.4 (abrir), 2 (atualizar) e 3 (fechar)

### Arquivos previstos

- alterados: `.agents/docs/templates/task.md`; `.agents/skills/task/scripts/validate_task.py`,
  `create_task.py` e os testes deles (`test_validate_task.py`, `test_create_task.py`, `avulsa-ok.md`);
  `.agents/skills/task/evals/checks.py` e `test_checks.py`, se dependerem dos títulos antigos; os três arquivos
  de task em `.agents/skills/task/evals/files/`; `.agents/skills/task/SKILL.md` (passo 4 acima); esta task;
- possivelmente `.agents/skills/governanca/scripts/checagens/skills.py`, se a lista de seções esperadas mudar de
  forma (subseções); conferir na implementação;
- acrescentados na implementação, com a aprovação do Juno (2026-11-20): `.agents/skills/governanca/scripts/testes/test_governanca.py`
  (o teste que lê as seções reais do validador esperava "5. Fechamento") e `.agents/skills/task/evals/evals.json`
  (critério "Não altera a seção 5" e duas expectativas com o nome antigo do item de testes).
- na revisão (corpo único, 1 A, 2 A, 3 A): o `skills.py` da governança (o "possivelmente" acima) passa a ler
  só `_SECOES_SEMPRE`, porque as constantes da seção 1 e da 2 saíram do validador; no `test_governanca.py`,
  as duas linhas que conferem as seções reais; no `evals.json`, os critérios dos cenários 1 e 2, que citavam
  as seções antigas.

### Não deve mudar

- as tasks em `.agents/docs/tasks/done/` e as tasks concluídas desta spec (`01-governanca.md`,
  `09-base-de-achados.md`): continuam no modelo antigo;
- os modelos de spec e de design e o `validate_spec.py` (task 03), inclusive a leitura da Branch do design no
  `validate_task.py`, que sai junto com o campo na 03;
- o texto da skill `task` além do passo 4 acima (iniciar, encerrar e fechar são das tasks 05 e 06; leitura e
  checklist, da 07);
- a governança, salvo o ajuste de seções esperadas no `skills.py` e as linhas do `test_governanca.py`
  aprovadas pelo Juno; `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

- **Contrato da API:** não
- **Banco:** não
- **Front:** não
- **Permissões e segurança:** não
- **Testes existentes que mudam de propósito:** sim — os que montam task pelo modelo antigo:
  - `test_validate_task.py`: a fixture `avulsa-ok.md`, a `TASK_SPEC_OK` e a `FECHAMENTO_OK` passam para o
    modelo novo; os testes que montam seções pelo título antigo (seção 5 como fechamento, rótulos soltos na
    seção 3) mudam junto;
  - `test_create_task.py`: o conteúdo esperado ganha o Modo, Spec e Bloqueada por, o corpo único (seção 1
    nos dois tipos, fechamento na 5) e a branch com o número (e testes novos para o `--modo`);
  - `evals/test_checks.py`, se os cenários dependerem dos arquivos de `evals/files/` convertidos;
  - `test_governanca.py`, "As seções vêm dos validadores do repositório (fonte única)…": passa a esperar
    "1. Contexto e critérios" e "5. Fechamento" (acrescentado com a aprovação do Juno).
- **Documentação:** sim — o modelo `task.md`, a skill `task` (passos 1.4, atualizar e fechar) e os arquivos de
  eval que são tasks vivas

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-01 | `test_validate_task.py` — "subseção obrigatória ausente ou vazia é acusada com o nome dela (CA-01)" |
| CA-02 | `test_validate_task.py` — "subseção que diz só 'não se aplica' não é acusada (CA-02)" |
| CA-03 | `test_validate_task.py` — "eixo de impacto ausente, vazio, sem sim/não ou com sim sem dizer o quê é acusado com o nome do eixo (CA-03)" |
| CA-20 | `test_create_task.py` — "task nova nasce com o Modo 'agente implementa, Juno revisa' (CA-20)" |
| CA-20 | `test_create_task.py` — "--modo juno grava 'Juno implementa, agente guia e revisa' (CA-20)" |

Em Python, o nome do teste é a primeira linha da docstring. A segunda parte do CA-20 (troca de Modo registrada
no Andamento) é texto do modo "atualizar" da skill `task`: provada na revisão do texto, sem eval (alcance
`documentação`).

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"`
- `rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes` — não deve mudar
- antes da primeira edição: `rtk python3 .agents/skills/governanca/scripts/governanca.py --salvar-base
  .agents/skills/governanca-workspace/base-02.txt`; no fim, o mesmo comando com `--comparar` no lugar de
  `--salvar-base`: sem erro novo
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../task`
- **Mutação manual** (guia de testes, seção 5.2): aceitar subseção vazia; recusar "não se aplica"; aceitar eixo
  sem sim/não; aceitar "sim" sem o texto depois do travessão; pular um dos eixos; aceitar Modo fora do
  conjunto; aceitar entrada do Andamento sem data; aceitar Andamento vazio `em andamento`; `create_task` sem o
  Modo; `create_task` ignorando o `--modo`. Todas devem ser detectadas por algum teste.
- **Checagem manual:** criar uma task avulsa e uma de spec com o `create_task.py` numa pasta temporária, conferir
  que nascem no modelo novo e que o validador só acusa o que falta preencher; desfazer depois.

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

- 2026-11-20 — início da implementação (Juno aprovou a abertura e criou a branch). Suítes antes: scripts da
  `task` 47 OK, evals da `task` 42 OK, governança 74 OK, scripts da `spec` 8 OK; governança no repositório 0
  erros, 5 avisos; `quick_validate ../task` válida. Base salva em
  `.agents/skills/governanca-workspace/base-02.txt` (5 achados).
- 2026-11-20 — passos 1 a 5 implementados. Scripts da `task` 70 OK, evals 42 OK, `spec` 8 OK; governança 73
  de 74: `test_le_as_secoes_dos_validadores_reais` (`test_governanca.py`) ainda espera "5. Fechamento" no
  modelo, arquivo fora dos previstos (pergunta ao Juno). Mutação: 22 mutantes no validador e no
  `create_task.py`, 22 mortos; 1 no `checks.py`, morto. `--comparar`: 0 erros novos, 0 avisos novos, 5 já
  existiam. Checagem manual em pasta temporária: avulsa e de spec (`--modo juno`) nascem no modelo novo.
- 2026-11-20 — achado: três crases soltas no meio de uma linha abrem um bloco de código para a máscara
  da lib (`mask_code`) e escondem os títulos até as próximas três crases; reescrito nesta task como
  "bloco de código `text`".
- 2026-11-20 — Juno aprovou (1 A, 2 A) mexer em `test_governanca.py` ("5. Fechamento" → "6. Fechamento") e no
  `evals.json` (critério "Não altera a seção 6" e o eixo de testes do Impacto nas expectativas dos cenários 1 e
  5), com a chave igual no `checks.py` e no `test_checks.py`. Tudo de novo: `task` 70, evals 42, governança 74,
  `spec` 8, todos OK; `--comparar` sem erro novo.
- 2026-11-20 — fechamento preenchido; aguardando a revisão do Juno.
- 2026-11-20 — Juno pediu o modo leve da oficina para a segunda parte do CA-20: cenário "troca de Modo" (o
  Juno passa a implementar no meio da task do perfil do cliente), um subagente com a skill antiga (cópia da
  `HEAD`) e um com a nova, em `.agents/skills/task-workspace/modo-leve-02/`. Antiga: registrou a troca num
  bloco solto da seção 3 e em "Decisões tomadas no caminho", sem campo Modo nem Andamento. Nova: 5 de 5
  asserções (só a task gravada; **Modo:** `Juno implementa, agente guia e revisa`; entrada
  `- 2026-11-20 — Modo: … → … (tokens apertaram…)` no Andamento; `em andamento` e "Atualizado em" novo; mesmos
  CA e validador sem erro, conferido por mim). Repositório sem mudança.
- 2026-11-20 — revisão do Juno: a task avulsa e a de spec tinham corpos diferentes (seção 1 só na de spec, 2
  só na avulsa). Rodada 1 A, 2 A, 3 A: corpo único nesta task; "Contexto e critérios" em toda task (de spec
  cita os CA em "Critérios de aceite"); Spec e Bloqueada por nos metadados; seções renumeradas de 1 a 5.
  Modelo, validador, `create_task.py`, testes, evals, `skills.py` da governança, a skill e esta task
  ajustados. Mutação: 32 mutantes, 31 mortos na primeira rodada; o vivo (CA lidos do texto inteiro, e não só
  de "Critérios de aceite") levou a um teste novo e morreu. O modo leve não foi refeito: o texto do
  "atualizar" (troca de Modo) não mudou.
- 2026-11-20 — Problema reescrito para dizer que descreve o modelo antes desta task (pedido do Juno na
  revisão). Aprovada na revisão do Juno; status `concluída`.

## 5. Fechamento

- **O que foi feito:** o modelo `task.md` passou a ter um corpo só para os dois tipos de task: metadados com
  Modo, Spec e Bloqueada por (`não se aplica` na avulsa); `## 1. Contexto e critérios` com Problema, Objetivo
  e Referências, e os critérios (avulsa: `### CA-NN`; de spec: `### Critérios de aceite`, citando o
  `spec.md`); `## 2. O que fazer nesta tarefa` com subseções fixas e o Impacto em seis eixos; `## 3. Como
  validar`; `## 4. Andamento`; `## 5. Fechamento`, com "Commits entregues" no formato fixo. O `validate_task.py`
  cobra subseção ausente ou vazia (`task.subsecao-ausente`, `task.subsecao-vazia`), Spec e Bloqueada por
  (`task.spec-…`, `task.bloqueada-por-…`, `task.criterios-na-avulsa`), os eixos (`task.impacto-…`), o Modo
  (`task.modo-…`), o Andamento (`task.andamento-…`) e o formato dos commits ao fechar (`task.commits-…`). O
  `create_task.py` grava o Modo (`--modo agente`, o padrão, ou `--modo juno`), Spec e Bloqueada por, monta os
  critérios do tipo e sugere a branch de task de spec com `-NN`. A skill `task` descreve o corpo único, cita
  as seções pelos números novos, o `--modo juno` no passo 1.4 e a troca de Modo no Andamento. Fixture, tasks
  dos testes, os três arquivos de eval e esta task foram convertidos.
- **Arquivos alterados:** os previstos: `task.md` (modelo), `validate_task.py`, `create_task.py`,
  `test_validate_task.py`, `test_create_task.py`, `avulsa-ok.md`, `checks.py`, `test_checks.py`, os três
  arquivos de `evals/files/`, a `SKILL.md` da `task`, o `skills.py` da governança (o "possivelmente": as
  constantes da seção 1 e da 2 saíram do validador) e esta task. Fora dos previstos, com a aprovação do Juno:
  `test_governanca.py` (duas linhas) e `evals.json` (critérios e expectativas com os nomes antigos).
- **Decisões tomadas no caminho:**
  - Corpo único para os dois tipos, Spec e Bloqueada por nos metadados e seções renumeradas de 1 a 5
    (revisão do Juno, 1 A, 2 A, 3 A; ver Decisões).
  - A leitura das subseções (`subsections`, `subsection_body`) e dos rótulos (`labels`) mora no
    `validate_task.py`, não na lib: a lib não estava nos previstos; a task 03, que precisa do mesmo para a
    spec, pode levá-la para `md_checks.py`.
  - Os CA de uma task de spec são só os de "Critérios de aceite": um CA citado no texto (ex.: "o CA-07 é da
    task 03") não entra na cobrança da tabela.
  - O Andamento fica fora da checagem de seção vazia da lib (pode ficar vazio com `aberta` ou `bloqueada`);
    a presença dele tem código próprio (`task.andamento-ausente`).
  - Linha recuada no Andamento é continuação da entrada anterior; texto solto sem recuo é entrada fora do
    formato.
  - Placeholder do modelo num eixo ou em Spec e Bloqueada por não é acusado duas vezes (como no "Atualizado
    em").
  - O aviso `task.ler-antes-ausente` saiu: a subseção ausente já é erro (`task.subsecao-ausente`).
  - "Commits entregues" vazio continua aceito ao fechar com `em andamento` (fechamento parcial); quando há
    conteúdo, o formato é cobrado com `--fechar` ou `concluída`.
  - O valor dos rótulos do fechamento deixou de incluir comentários HTML (o modelo traz o exemplo do
    formato dos commits num comentário).
  - O texto "Antes de começar" da seção 3 do modelo manda anotar as suítes no Andamento (o fechamento
    resume).
  - Os eixos do teste do CA-03 estão escritos à mão no teste, não lidos do validador (um eixo tirado da
    tupla seria aceito em silêncio; mutante morto).
  - Commits em três, com esta task por último, depois da skill (ajuste do Juno junto da aprovação): ela
    registra o fim do trabalho. O primeiro não se divide mais sem deixar uma suíte vermelha (os testes do
    `create_task`, os evals e a governança dependem do modelo e do validador novos). Nos dois primeiros
    commits, a governança acusaria a 02 ainda no modelo antigo (`aberta`, viva); só o terceiro fecha isso.
- **Testes antes de começar:** scripts da `task` 47 OK; evals da `task` 42 OK; governança 74 OK; scripts da
  `spec` 8 OK; governança no repositório 0 erros, 5 avisos; `quick_validate ../task` válida; base salva em
  `base-02.txt` (5 achados).
- **Testes no fim:** scripts da `task` 73 OK (26 novos); evals da `task` 42 OK; governança 74 OK; scripts da
  `spec` 8 OK (não mudou); `quick_validate ../task` válida; governança no repositório 0 erros, 5 avisos;
  `--comparar base-02.txt`: 0 erros novos, 0 avisos novos, 5 já existiam, 0 corrigidos. Mutação: 32 mutantes
  no validador e no `create_task.py`, 32 mortos (um sobreviveu à primeira rodada, os CA lidos do texto
  inteiro, e morreu com o teste novo); no `checks.py`, o fechamento procurado pelo número antigo da seção,
  morto. Checagem manual: em pasta temporária, a avulsa (padrão) e a de spec 03 (`--modo juno`) nasceram com o
  mesmo corpo, os metadados certos (`não se aplica` × links da spec e "Bloqueada por: 01-governanca.md") e a
  branch `docs/juno/fluxo-de-trabalho-dos-agentes-03`; o validador só acusou placeholders, o Alcance a
  escolher e a tabela a preencher. Arquivos temporários apagados. Modo leve da oficina (cenário "troca de
  Modo", skill antiga × nova): a antiga não registrou Modo nem Andamento; a nova passou nas 5 asserções.
- **Evidência por critério:** CA-01 → teste "subseção obrigatória ausente ou vazia é acusada com o nome dela
  (CA-01)" passando (mutantes "subseção vazia aceita" e "subseção ausente aceita" mortos); CA-02 → teste
  "subseção que diz só 'não se aplica' não é acusada (CA-02)" passando (mutante "não se aplica recusado"
  morto); CA-03 → teste "eixo de impacto ausente, vazio, sem sim/não ou com sim sem dizer o quê é acusado com
  o nome do eixo (CA-03)" passando (cinco mutantes dos eixos mortos); CA-20 → testes "task nova nasce com o
  Modo 'agente implementa, Juno revisa' (CA-20)" e "--modo juno grava 'Juno implementa, agente guia e revisa'
  (CA-20)" passando (mutantes do `create_task` mortos); a segunda parte do CA-20 (troca registrada no
  Andamento) está no modo "atualizar" da `SKILL.md`, provada pelo modo leve da oficina: com a skill nova, o
  agente trocou o **Modo:** e registrou a entrada datada com o motivo; com a antiga, não.
- **Checagens não feitas:** o CI no GitHub (roda no push da branch; localmente rodei as mesmas suítes e a
  governança); os sete cenários com agente dos evals da skill `task` (os `[script]` rodaram pelos testes do
  `checks.py`; com agente, só o cenário do modo leve, rodado antes do corpo único, num trecho da skill que
  não mudou depois). O modo leve mede "a skill + o ambiente do Juno" (as preferências locais entram nos
  subagentes).
- **Ficou para depois:** três crases soltas no meio de uma linha abrem um bloco de código para a máscara da
  lib (`mask_code`) e escondem títulos até as próximas três crases (aconteceu na conversão desta task) →
  estacionamento, ou a task 03 ao levar a leitura de subseções para a lib; mover `subsections`/`labels` para
  a lib → task 03.
- **Commits entregues:** três, nesta ordem: a implementação, a skill e, por último, esta task concluída
  (ajuste pedido pelo Juno depois da aprovação).

  ```text
  feat(agents): Adiciona corpo único, Impacto, Modo e Andamento à task

  - o modelo task.md tem um corpo só para a task avulsa e a de spec:
    Spec e Bloqueada por nos metadados, Contexto e critérios em toda
    task, subseções ### fixas, o Impacto com seis eixos, o Andamento
    e o fechamento com "Commits entregues" em formato fixo;
  - o validate_task cobra subseção ausente ou vazia ("não se aplica"
    vale), Spec e Bloqueada por pelo tipo, os eixos ("sim — o quê" ou
    "não"), o Modo, as entradas datadas do Andamento e o formato dos
    commits ao fechar;
  - o create_task grava o Modo (--modo agente|juno), Spec e Bloqueada
    por, e sugere a branch da task de spec com o número no fim;
  - fixture, tasks dos testes, arquivos de eval e a governança
    acompanham o modelo novo.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/02-modelo-e-validador-de-task.md
  ```

  Arquivos:
  - `.agents/docs/templates/task.md`
  - `.agents/skills/task/scripts/validate_task.py`
  - `.agents/skills/task/scripts/create_task.py`
  - `.agents/skills/task/scripts/testes/test_validate_task.py`
  - `.agents/skills/task/scripts/testes/test_create_task.py`
  - `.agents/skills/task/scripts/testes/avulsa-ok.md`
  - `.agents/skills/task/evals/checks.py`
  - `.agents/skills/task/evals/test_checks.py`
  - `.agents/skills/task/evals/evals.json`
  - `.agents/skills/task/evals/files/task-aceite-em-revisao.md`
  - `.agents/skills/task/evals/files/task-aceite-implementada.md`
  - `.agents/skills/task/evals/files/task-perfil-cliente-em-andamento.md`
  - `.agents/skills/governanca/scripts/checagens/skills.py`
  - `.agents/skills/governanca/scripts/testes/test_governanca.py`

  ```text
  docs(agents): Ensina a skill task o corpo único, o Modo e o Andamento

  - o passo 1.4 descreve o corpo único (Spec e Bloqueada por nos
    metadados, critérios pelo tipo), o --modo juno, a branch com -NN e
    as regras novas do validador;
  - o modo atualizar registra a troca de Modo no Andamento;
  - as seções passam a ser citadas pelos números novos (fechamento 5).

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/02-modelo-e-validador-de-task.md
  ```

  Arquivos:
  - `.agents/skills/task/SKILL.md`

  ```text
  docs(agents): Conclui a task 02 do fluxo de trabalho

  - a task passa ao modelo novo e registra a implementação no
    Andamento e no fechamento;
  - aprovada na revisão do Juno.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/02-modelo-e-validador-de-task.md
  ```

  Arquivos:
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/02-modelo-e-validador-de-task.md`
