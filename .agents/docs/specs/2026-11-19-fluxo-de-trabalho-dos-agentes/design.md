# Design: Fluxo de trabalho dos agentes

- **Spec:** [spec.md](spec.md)
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-20 — link da task 03 na lista e notas do modelo do doe-palmas para a 04 e a 07
  (decisões do Juno ao abrir a 03)

## Referências técnicas

- **ADRs aplicáveis:** nenhum (a mudança fica em `.agents/`, não toca a arquitetura da API).
- **Guias do projeto:** `.agents/docs/guides/testing.md` (seção 3: comandos e CI dos scripts de `.agents/`;
  seção 5.2: mutação manual), `.agents/docs/guides/commits.md` (texto de commit; recebe o formato do texto do
  merge), `.agents/README.md` (mapa das pastas; `done/` documentado com subpasta por mês).
- **Contratos existentes:**
  - `.agents/scripts/lib/md_checks.py`: o `Finding` (arquivo, linhas, severidade, mensagem) e as checagens
    comuns; `.agents/scripts/lib/projeto.py`: raiz, `fill_template`, `slugify`.
  - `.agents/skills/task/scripts/validate_task.py`: `validate()` importável, devolve `list[Finding]`; padrão
    de branch `tipo/juno/assunto`; leitura da branch do design para tasks de spec.
  - `.agents/skills/spec/scripts/validate_spec.py`: seções obrigatórias por título e o marcador de texto exato
    que trava a aprovação.
  - `.agents/scripts/check_agents.py`: o verificador geral (links e caminhos, tabela de skills, comandos que
    apontam para scripts, seções dos modelos, cabeçalho das skills pelo `quick_validate` da oficina).
  - `.github/workflows/agents-checks.yml`: roda o `check_agents.py` e toda pasta com `test_*.py`.
- **Externas:** projeto doe-palmas (mesmo autor): o script único que cria a branch de uma task aprovada
  (`create_task_implementation_branch.py`) e o modelo de spec de lá (só as
  subseções fixas de escopo foram aproveitadas, ver decisões).

## 1. Decisões técnicas

- **Fechadas:**
  - Um script por ação, na pasta da skill dona: `start_task.py` e `finish_task.py` na skill `task`;
    `approve_spec.py` e `finish_spec.py` na skill `spec`; o que é comum (status, "Atualizado em", entrada no
    Andamento, comandos de git) vai para `.agents/scripts/lib/` — segue o padrão `create_*`/`validate_*` e
    mantém cada campo com um só dono — descartada: um `fluxo.py` com subcomandos na lib (a skill deixa de ser
    dona dos próprios scripts) — rodada 1 do design, 2026-11-19.
  - A base de achados da governança fica num bloco fixo dentro do Andamento da task; o "encerrar" relê de lá; na
    oficina de skills (sem task), a base vai para um arquivo temporário indicado na própria rodada — descartadas:
    arquivo JSON fora do git (perde-se ao trocar de máquina) e os dois juntos (a mesma informação em dois
    lugares) — rodada 1 do design.
  - O arquivo da oficina é uma ponte até o "iniciar" e o "encerrar" (tasks 05 e 06): fica em
    `.agents/skills/<nome>-workspace/base-de-achados.txt` e cobre as tasks que mexem em skills antes da 05
    (02, 03, 07) — descartada: tirar a oficina da 09 e passar o CA-29 para a 05 (essas tasks ficariam sem
    base) — conversa de 2026-11-19, ao abrir a 09 (todo ajuste de skill que importa acontece dentro de uma task).
  - Depois da 05 e da 06, a oficina dentro de uma task usa a base do Andamento e não cria o arquivo; sem task,
    roda a governança simples (0 erros), como antes da base. Entra na task 08 — descartada: manter o arquivo
    para a oficina sem task (um parágrafo a mais na skill para um caso raro, em geral ajuste que nem passa pela
    oficina) — conversa de 2026-11-19, ao abrir a 09.
  - A conferência dos commits é feita por script: "Commits entregues" ganha formato fixo e é comparado com
    `git log main..HEAD --name-only` — descartada: o agente comparar lendo o log (é a parte objetiva que se quer
    tirar dele) — rodada 1 do design.
  - O passo de leitura é provado por eval da oficina com o cenário real do perfil do cliente, nas skills `task` e
    `spec` — descartadas: só o cenário da task (o CA-21 da spec ficaria sem prova) e revisão manual do texto —
    rodada 1 do design.
  - A lista de tasks começa pela governança; as tasks anteriores ao "iniciar" seguem o fluxo manual de hoje (o
    Juno cria a branch) — descartada: modelo de task primeiro (o "iniciar" esperaria duas peças) — rodada 1 do
    design.
  - Um achado é identificado por arquivo + código da regra + mensagem sem números de linha; o `Finding` ganha o
    campo do código (ex.: `task.subsecao-vazia`) — descartadas: só arquivo + mensagem (ajuste de texto vira erro
    novo) e arquivo + mensagem + linha (qualquer edição gera falso novo) — rodada 2 do design.
  - A governança importa o `validate()` de cada validador e junta os `Finding` — descartada: rodar como
    subprocesso e ler o texto (parse frágil, mais lento) — rodada 2 do design.
  - A governança valida o conteúdo só das tasks e specs vivas (task `aberta`, `bloqueada`, `em andamento`; spec
    `rascunho`, `aprovada`, `em andamento`), em qualquer pasta; concluídas e canceladas ficam fora mesmo na pasta
    da spec — descartada: tudo fora de `done/` (as primeiras tasks desta spec, no modelo antigo, passariam a
    acusar erro) — rodada 2 do design.
  - Os comandos de git do "iniciar" são testados com git real, num repositório temporário com remoto local
    (`git init --bare`) — descartada: mock do subprocess (a causa do erro do CA-12 viraria texto inventado) —
    rodada 2 do design.
  - Do modelo de spec do doe-palmas entram só as subseções fixas (Entra e Fica fora como subseções) —
    descartadas: Premissas (suposição sem dono) e Hotspots como seções do `spec.md` (já cabem no Impacto do
    design) — rodada 2 do design.
  - A governança procura comando sem `rtk` só nos blocos de código `bash`/`sh`; a exceção (processo longo ou
    interativo) é marcada no próprio bloco com um comentário `# sem rtk: motivo` — descartada: também código em
    linha (acusaria citações como `git log` e `git status` do `AGENTS.md` e dos guias) — rodada 3 do design.
  - O aviso de possível spec segue uma regra fixa sobre os eixos de impacto: banco "sim" → critério 1;
    contrato da API "sim" → critério 4; quatro ou mais eixos "sim" → critério 3; o aviso só pergunta e não
    bloqueia — descartada: subseção com os seis critérios marcada pelo agente (o sinal volta a ser julgamento
    dele) — rodada 3 do design.
  - "Commits entregues" tem um bloco de código `text` por commit, com a mensagem completa, seguido da lista
    "Arquivos:"; o script compara a primeira linha do bloco e a lista — descartada: só título e arquivos, com o
    corpo apenas no chat (o texto commitado não fica registrado) — rodada 3 do design.
  - A base de achados (código da regra no `Finding`, comparação, oficina) é uma task própria, a 09, separada
    da governança (01); a 05 passa a depender dela — descartada: uma task só (PR grande que mistura a migração
    do verificador com a mudança nos validadores de task e spec) — conversa de 2026-11-19, ao abrir a 01.
  - Nome da branch montado pelo "iniciar" a partir do padrão que o validador já cobra (`tipo/juno/assunto`):
    avulsa usa o nome do arquivo sem a data (como `fix/juno/restringir-perfil-cliente`); task de spec usa o
    assunto da spec mais o número da task — derivado do padrão vigente no `validate_task.py`, sem rodada própria.
- **Em aberto:**
  - nada.
- **ADR novo?** não: a mudança é do fluxo de trabalho com agentes, registrada nesta spec e no `AGENTS.md`.

## 2. Mudanças no modelo e na API (antes → depois)

Nada muda na API nem no banco. As mudanças são nos scripts, modelos e instruções de `.agents/`.

### Scripts e lib (`.agents/scripts/`, `.agents/skills/*/scripts/`)

| Item | Antes | Depois |
|---|---|---|
| `lib/md_checks.py` → `Finding` | arquivo, linhas, severidade, mensagem | ganha o código da regra; todas as checagens existentes passam a informá-lo |
| `scripts/check_agents.py` (+ `testes/`) | verificador geral sem skill | deixa de existir; as checagens vão para a skill `governanca` |
| `skills/governanca/scripts/governanca.py` | não existe | ponto de entrada único, sem filtro por área; módulos internos (links e caminhos, skills, documentos, status × pasta, base); importa o `validate()` dos validadores de task e spec para as vivas; modo de salvar a base e de comparar (novos, antigos, corrigidos; só os novos falham) |
| `lib/` (comum ao fluxo) | `projeto.py`, `md_utils.py`, `md_checks.py`, `links.py` | ganha as funções de metadados (status, "Atualizado em"), entrada datada no Andamento, leitura das subseções e os comandos de git do fluxo |
| `task/scripts/validate_task.py` | seções 1 a 5, rótulos do fechamento, sem conferir Problema, Fica fora, Arquivos previstos nem Não deve mudar | subseções fixas cobradas (ausente ou vazia é erro, "não se aplica" vale), seis eixos de impacto, Em aberto, Decisões, Andamento, Modo, formato de "Commits entregues" |
| `task/scripts/create_task.py` | preenche título, datas e status | também o Modo (padrão "agente implementa, Juno revisa") |
| `task/scripts/start_task.py` | não existe | o "iniciar" (ver ordem abaixo) |
| `task/scripts/finish_task.py` | não existe | o "encerrar" (concluir), o cancelamento e a conferência dos commits |
| `spec/scripts/validate_spec.py` | seções principais; Em aberto só pelo marcador de texto exato | subseções fixas no `spec.md` e no `design.md`; "Em aberto" precisa ser "nada" para `aprovada`; item da lista de tasks com "bloqueada por" e "cobre" |
| `spec/scripts/create_design.py` | recusa spec não aprovada | também recusa com "Em aberto" diferente de "nada" e lista os itens |
| `spec/scripts/approve_spec.py`, `finish_spec.py` | não existem | aprovar e encerrar a spec |

**Ordem do "iniciar"** (para no primeiro problema, sem mudar nada): status `aberta` → (task de spec) spec
`aprovada` ou `em andamento` → validador sem erro → "Em aberto" igual a "nada" → árvore limpa → na `main` →
branch ainda inexistente → `git pull --ff-only` (a falha devolve a mensagem do git) → governança roda e a base é
guardada → `git switch -c` → task `em andamento`, Branch e "Atualizado em" preenchidos, entrada no Andamento
(data, aprovada pelo Juno, branch, commit de base, bloco da base) → (primeira task da spec) spec `em andamento` →
aviso de possível spec, se a regra dos eixos disparar.

**Ordem do "encerrar"** (concluir): status `em andamento` → validador com o fechamento sem erro → comparação com
a base do Andamento sem erro novo → `concluída`, "Atualizado em" e entrada no Andamento → avulsa vai para
`tasks/done/` (task de spec fica na pasta) → se era a última pendência da lista do design, avisa que a spec pode
ser encerrada na mesma branch. **Cancelar:** status `aberta`, `bloqueada` ou `em andamento` e motivo obrigatório
→ `cancelada` e entrada "cancelada pelo Juno" com o motivo → avulsa vai para `tasks/done/`; de spec fica na pasta
e o item da lista do design é riscado com data e motivo → mesmo aviso da última pendência. **Conferir:** compara
"Commits entregues" com `git log main..HEAD --name-only` e com os arquivos alterados que não entraram em commit.

### Modelos (`.agents/docs/templates/`)

| Item | Antes | Depois |
|---|---|---|
| `task.md` | rótulos soltos; Branch "criada pelo Juno"; um campo de impacto | subseções fixas para cada item obrigatório; Impacto com seis eixos; Decisões (uma linha por decisão) e Em aberto; Andamento; metadados Status, Criado em, Atualizado em, Tipo, Alcance, Modo, Branch (preenchida pelo script); "Commits entregues" no formato fixo; checklist de alcance na leitura |
| `spec.md` | seções principais com rótulos | Entra, Fica fora, Fechadas e Em aberto como subseções fixas |
| `design.md` | campo Branch; Em aberto com "bloqueia" | sem Branch; Em aberto como subseção fixa; item da lista com "bloqueada por" e "cobre" |

### Skills e instruções

| Item | Antes | Depois |
|---|---|---|
| skill `governanca` | não existe | dona das checagens do conjunto; entra na tabela de skills do `AGENTS.md` |
| skill `task` | abrir, atualizar, fechar (o fechar marca `concluída`) | + iniciar e encerrar, curtos, chamando os scripts; o fechar só preenche e pede revisão; passo 1.2 com levantamento dos mecanismos e checklist de alcance |
| skill `spec` | aprovação à mão | aprovar e encerrar por script; leitura com levantamento antes das rodadas |
| skill `oficina-de-skills` | chama o `check_agents.py` | salva a base no começo e compara no fim (task 09, arquivo no workspace); depois da 05, dentro de uma task, usa a base do Andamento (task 08) |
| `AGENTS.md` | agente não cria branch | exceção restrita ao script do "iniciar"; fluxo novo; governança na tabela |
| `.agents/README.md` | `tasks/done/AAAA-MM/` | `tasks/done/` numa pasta só (concluídas e canceladas) |
| `guides/commits.md` | sem texto do merge | formato do texto do merge (modelo: squash do `9d59084a`) |
| `guides/testing.md`, `agents-checks.yml` | chamam o `check_agents.py` | chamam a governança |

## 3. Impacto

**Quem usa o que muda:**

| Item alterado | Quem usa | O que acontece com quem usa |
|---|---|---|
| `check_agents.py` | CI (`agents-checks.yml`), `testing.md`, `oficina-de-skills/SKILL.md`, a task concluída `2026-11-18-encerramento-com-aprovacao.md` | os três primeiros passam a chamar a governança; a task concluída não muda e não é conferida pelo conteúdo |
| `Finding` | `validate_task.py`, `validate_spec.py`, `check_agents.py`, testes e evals da skill `task` | cada checagem informa o código; os testes que montam `Finding` à mão mudam de propósito |
| modelo de task | `create_task.py`, `validate_task.py`, testes em `task/scripts/testes/`, `evals/files/` da skill `task` | modelo, validador e fixtures mudam juntos; os arquivos de eval que são tasks vivas são convertidos |
| modelo de spec e design | `create_spec.py`, `create_design.py`, `validate_spec.py`, `spec/scripts/testes/`, esta spec | idem; esta spec e este design são convertidos na task 03 |
| leitura da Branch no design | `validate_task.py` (task de spec usa a branch do design) | a regra sai junto com o campo |

- **Front (`web/`):** nenhum.
- **Swagger e `api/docs/Rotas.md`:** nenhum.
- **ADRs existentes:** nenhum.
- **Dados existentes:** as tasks em `tasks/done/` continuam no modelo antigo (fora do escopo); nenhuma task avulsa
  está aberta hoje.

## 4. Riscos

| Risco | Como evitar |
|---|---|
| Tasks concluídas citam caminhos que deixam de existir (ex.: `check_agents.py`) e a checagem de caminhos as acusaria | a governança não confere caminhos nem conteúdo de registros fechados; só status × pasta e duplicatas (CA-04) |
| As tasks 01 a 04 não têm "iniciar" nem base salva | fluxo manual de hoje; a task 01 registra no fechamento a saída do `check_agents.py` antes de começar, como base informal |
| O validador novo de spec (task 03) acusa esta spec no modelo antigo | a conversão desta spec e deste design entra na mesma task 03 |
| O "iniciar" troca de branch com arquivos abertos no IntelliJ | árvore limpa é exigida antes; a troca só acontece depois de todas as checagens |
| Formato rígido da base e dos commits entregues quebra com uma edição à mão | o validador cobra o formato; o script recusa com a linha do problema em vez de comparar errado |
| O verificador geral acusa como erro o link da lista de tasks para um arquivo ainda não criado, que o validador da spec aceita (a mesma regra com dois donos); por isso, cada item da lista só ganha o link quando o arquivo da task é criado | a governança (task 01) segue a regra do validador da spec: link da lista para task ainda não criada é aceito |
| Rodar os evals da task 07 com outros agentes pesados trava o notebook | um agente pesado por vez (nota do Juno) |

## 5. Estratégia de testes

- **Unitários** (`unittest`, pasta `testes/` ao lado de cada script, fixtures `.md` de propósito quebradas,
  como hoje): validadores, governança e os scripts de fluxo. O CI já roda toda pasta com `test_*.py`.
- **Integração:** os testes de git do "iniciar" e da conferência usam repositório temporário com remoto local
  (`git init --bare`); a falha de rede é simulada apagando o remoto.
- **Erros de cada critério** (não há HTTP: o "erro" é a saída do script ou do validador e o exit 1):
  - CA-01, 02, 03 → `validate_task.py`, códigos de subseção e de eixo; CA-20 → `create_task.py` e validador.
  - CA-04, 23 a 28, 30 → governança (CA-30 também por busca: nenhuma instrução cita o verificador antigo).
  - CA-29 → teste da comparação com base em arquivo, mais a rodada da oficina na task 09.
  - CA-05 a 13, 36 → `start_task.py`, um teste por recusa, conferindo que nada mudou (arquivo e branches).
  - CA-14 → texto da skill `task` (eval da task 06: o fechar não muda o status).
  - CA-15 a 17, 34, 37, 38 → `finish_task.py`; CA-18 → formato no `commits.md`, conferido no eval da task 06.
  - CA-19, 35 → `approve_spec.py`, `finish_spec.py`; CA-31 a 33 → `validate_spec.py` e `create_design.py`.
  - CA-21 → eval da oficina com o cenário do perfil do cliente, nas skills `task` e `spec`.
  - CA-22 → texto do `AGENTS.md` e busca por comandos de git nos scripts (só o "iniciar" muda o repositório).
- **Mutação manual:** nas recusas do "iniciar" e do "encerrar", na regra "Em aberto igual a nada", na comparação
  da base (novo × antigo) e na regra dos eixos do aviso de spec.
- Valores esperados escritos à mão; nunca comparar a saída com a mesma função que a gera.

## 6. Tasks

- [01 — Skill de governança](tasks/01-governanca.md) — bloqueada por: nenhuma — cobre: CA-04, CA-23,
  CA-24, CA-25, CA-26, CA-27, CA-30
- [02 — Modelo e validador de task](tasks/02-modelo-e-validador-de-task.md) — bloqueada por: 01 — cobre: CA-01, CA-02, CA-03, CA-20
- [03 — Modelos e validador de spec e design](tasks/03-modelos-e-validador-de-spec-e-design.md) — bloqueada por: 01 — cobre: CA-31, CA-32, CA-33
- 04 — Status da spec por script — bloqueada por: 03 — cobre: CA-19, CA-35
- 05 — Iniciar — bloqueada por: 02, 03, 09 — cobre: CA-05, CA-06, CA-07, CA-08, CA-09, CA-10,
  CA-11, CA-12, CA-13, CA-36
- 06 — Encerrar, cancelar e texto do merge — bloqueada por: 04, 05 — cobre: CA-14, CA-15,
  CA-16, CA-17, CA-18, CA-34, CA-37, CA-38
- 07 — Passo de leitura nas skills de task e spec — bloqueada por: 02, 03 —
  cobre: CA-21
- 08 — Instruções gerais e guias — bloqueada por: 05, 06 — cobre: CA-22
- [09 — Base de achados da governança](tasks/09-base-de-achados.md) — bloqueada por: 01 — cobre: CA-28, CA-29

Notas para abrir as tasks (do modelo de spec do doe-palmas, avaliado ao abrir a 03; cada task decide):

- **04:** bloco de encerramento no topo da spec concluída (data, task que encerrou e o que ficou fora).
- **07:** "fonte dos fatos" (o que foi lido, com a data) e a marca "[a verificar]" para o que não foi
  confirmado, no passo de leitura.
