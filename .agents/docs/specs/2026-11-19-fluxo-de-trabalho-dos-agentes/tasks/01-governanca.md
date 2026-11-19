# Task: Skill de governança

- **Status:** `em andamento`
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-19 — início da implementação (aprovada pelo Juno; branch criada por ele)
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-01` (criada pelo Juno)

## 1. Vínculo com a spec (task de spec)

- **Spec:** [spec.md](../spec.md) · **Design:** [design.md](../design.md)
- **Bloqueada por:** nenhuma
- **Critérios de aceite cobertos:** CA-04, CA-23, CA-24, CA-25, CA-26, CA-27, CA-30

## 3. O que fazer nesta tarefa

Decisões tomadas ao abrir (conversa de 2026-11-19):

- A base de achados (código da regra no `Finding`, comparação, oficina) saiu desta task e virou a task 09 do
  design — descartada: uma task só (PR grande, misturando a migração do verificador com os validadores).
- A skill nasce pela `oficina-de-skills` em modo enxuto: `SKILL.md` curto, `ORIGEM.md`, `quick_validate` e a
  própria governança, **sem rodada de eval com e sem a skill** — motivo: o comportamento está no script e é
  provado pelos testes dele; quem dispara a governança são o CI e os passos de outras skills (CA-30), não o texto
  desta. Descartada: fluxo completo da oficina (caro, mediria pouco).
- Os marcadores de modelo que a checagem nova acusaria hoje nos documentos canônicos são corrigidos aqui, sem
  exceção na regra — descartada: ignorar comentários e formatos em negrito (esconderia marcador esquecido).

1. **Criar a skill** `.agents/skills/governanca/` pela oficina (modo enxuto acima): `SKILL.md` curto (quando
   rodar, como ler a saída, o que é erro e o que é aviso), `ORIGEM.md` (o verificador geral deste projeto e a
   skill `governanca-compliance` do doe-palmas, com o que foi aproveitado e o que foi descartado, como diz a
   spec) e a linha na tabela de skills do `AGENTS.md`.
2. **Migrar as seis checagens** do verificador geral para o script único da skill, organizado em módulos
   (links e caminhos, tabela de skills, comandos `python3`, seções dos modelos, skills citadas, cabeçalho das
   skills), sem mudar o que elas acusam. Os testes e fixtures migram junto; o verificador antigo e a pasta de
   testes dele são apagados. Saída e exit code iguais aos de hoje (`arquivo:linha [SEVERIDADE] mensagem`,
   exit 1 com erro).
3. **Registros fechados** (task ou spec `concluída`, `cancelada` ou `substituída`, em qualquer pasta): sem
   conferência de links, caminhos ou conteúdo (CA-04); só entram nas checagens de lugar e status (passo 4).
4. **Checagens novas:**
   - status × pasta e task `em andamento` sem branch preenchida (CA-23);
   - a mesma task ou spec entre as abertas e entre as concluídas, comparando pelo nome do arquivo ou da pasta
     (CA-24);
   - comando sem `rtk` dentro de bloco de código `bash`/`sh` do `AGENTS.md`, das skills e dos guias, com a
     exceção marcada no próprio bloco por `# sem rtk: motivo` (CA-26);
   - placeholder esquecido (texto entre `<` e `>`, data `AAAA-MM-DD`, comentário do modelo) nos documentos
     canônicos (`AGENTS.md`, `.agents/README.md`, guias e os `.md`
     das skills, fora `evals/files/`, `testes/` e `*-workspace/`), reaproveitando a detecção que os
     validadores já usam (`find_placeholders`, que ignora o que está em código); os modelos ficam de fora
     (CA-27).
5. **Validadores das vivas** (CA-25): a governança importa o `validate()` do validador de task para cada task
   viva (`aberta`, `bloqueada`, `em andamento`) e uma função equivalente do validador de spec para cada pasta
   de spec viva (`rascunho`, `aprovada`, `em andamento`), e junta os achados sem regra de conteúdo própria. O
   validador de spec hoje só tem o `main()`: extrair dele uma função importável, sem mudar o que ele acusa.
   Link da lista de tasks do design para task ainda não criada segue a regra do validador de spec (aceito).
6. **Corrigir os marcadores** que o passo 4 acusa hoje: o formato "Atualizado em" em negrito no `SKILL.md` da
   `spec` (linha 269) e da `task` (linha 195), os marcadores do passo 8 do fechar no `SKILL.md` da `task`
   (linha 245) e o comentário do topo do guia de commits (vira texto normal).
7. **Trocar quem chama o verificador antigo** pela governança inteira, sem filtro (CA-30): o workflow
   `agents-checks.yml`, o guia de testes (tabela e parágrafo do CI) e o passo 6.3 da `oficina-de-skills`.

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- o verificador geral `check_agents.py` e a suíte `test_check_agents.py`, em `.agents/scripts/` na `main`
  (esta task os apaga) — as seis checagens, a coleta dos `.md`, o `_load` que importa scripts de skill pelo
  caminho e o `ProjetoFalso` (projeto temporário) que os testes novos seguem
- `.agents/scripts/lib/md_checks.py` — `Finding`, `erro`/`aviso`, `find_placeholders`, `read_status`
- `.agents/skills/task/scripts/validate_task.py` — `validate()` importável (linha 344)
- `.agents/skills/spec/scripts/validate_spec.py` — o `main()` de onde sai a função importável
- `.agents/skills/oficina-de-skills/SKILL.md` — passos 3.1 e 6 (checagem estática e finalização)
- `.agents/skills/oficina-de-skills/scripts/quick_validate.py`
- `.github/workflows/agents-checks.yml`
- `.agents/docs/guides/testing.md` — seção 3 (tabela de comandos e CI) e seção 4 (regras dos testes)
- Fora do repositório: a skill `governanca-compliance` do doe-palmas, só como origem (`ORIGEM.md`)

**Arquivos previstos:**

- criados (pasta nova `governanca/` em `.agents/skills/`): `SKILL.md`, `ORIGEM.md`, o script único e os
  módulos em `scripts/`, os testes e fixtures em `scripts/testes/`;
- alterados: `.agents/skills/spec/scripts/validate_spec.py` (função importável), `AGENTS.md` (linha na
  tabela de skills), `.agents/skills/oficina-de-skills/SKILL.md`, `.agents/skills/spec/SKILL.md`,
  `.agents/skills/task/SKILL.md`, `.agents/docs/guides/commits.md`, `.agents/docs/guides/testing.md`,
  `.github/workflows/agents-checks.yml`, esta task;
- apagados: `.agents/scripts/check_agents.py` e `.agents/scripts/testes/`.

**Não deve mudar:**

- o que os validadores de task e de spec acusam (as suítes deles passam sem alteração);
- o `Finding` e as mensagens das checagens migradas (código da regra é da task 09);
- os modelos em `.agents/docs/templates/` (são das tasks 02 e 03);
- as tasks e specs fechadas, inclusive em `done/`;
- `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** `test_check_agents.py` migra para a pasta de testes da
governança, com os mesmos casos e o import novo; os casos que conferem caminhos de uma task fechada passam a
esperar nenhum achado (CA-04). As suítes de `validate_task` e `validate_spec` não mudam. Teste que quebrar e não
estiver nesta lista é regressão até prova em contrário.

## 4. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-04 | `test_governanca.py` — "task concluída em done/ que cita arquivo que não existe mais não é acusada (CA-04)" |
| CA-23 | `test_governanca.py` — "status que não bate com a pasta é acusado com o arquivo (CA-23)" |
| CA-24 | `test_governanca.py` — "o mesmo arquivo de task em tasks/ e em done/ é acusado com os dois caminhos (CA-24)" |
| CA-25 | `test_governanca.py` — "erro de conteúdo de task viva sai com a mensagem do validador (CA-25)" |
| CA-26 | `test_governanca.py` — "comando sem rtk em bloco bash é acusado com a linha (CA-26)" |
| CA-27 | `test_governanca.py` — "placeholder esquecido numa skill ou guia é acusado; no modelo e em código não (CA-27)" |
| CA-30 | `test_governanca.py` — "nenhuma instrução cita o verificador antigo (CA-30)" |

Em Python, o nome do teste é a primeira linha da docstring (é o que o `unittest -v` mostra). CA-04 já passa
hoje só em parte (as skills citadas por registros fechados já ficam de fora): prova junto da mutação manual.
CA-30 roda contra o repositório real, não contra fixture.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/scripts/testes` — antes de começar (a suíte que migra)
- `rtk python3 -m unittest discover -s <pasta scripts/testes da governança>` — no fim
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes` e
  `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes` — não devem mudar
- o script da governança na raiz do projeto: 0 erros (avisos de skill futura são aceitos)
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../governanca`
- **Mutação manual** (guia de testes, seção 5.2): aceitar qualquer status em `done/`; não pular registros
  fechados; comparar duplicatas pelo caminho inteiro em vez do nome; ignorar a marca `# sem rtk`; conferir
  marcador dentro de código. Todas devem ser detectadas por algum teste.

- **Checagem manual:** rodar a governança no repositório com um erro plantado de cada tipo novo e conferir a
  saída; desfazer depois.

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

- **O que foi feito:** a skill `governanca` (`SKILL.md`, `ORIGEM.md`, script único `governanca.py`, com as checagens em
  `scripts/checagens/`: `coleta`, `referencias`, `skills`, `instrucoes`, `registros`) substitui o verificador geral, que foi apagado
  com a suíte dele. As seis checagens migraram sem mudar o que acusam nas instruções; entraram status × pasta,
  task em andamento sem branch, duplicatas, `rtk` em blocos `bash`/`sh` (com a exceção `# sem rtk: motivo`),
  placeholder em documento canônico e os validadores de task e spec nas vivas. O `validate_spec.py` ganhou
  `validate()`/`validate_file()` importáveis, sem mudar o que acusa. CI, guia de testes e oficina chamam a
  governança; a skill entrou na tabela do `AGENTS.md`. Os 6 placeholders e o bloco do `nohup` da oficina
  foram corrigidos.
- **Arquivos alterados:** os previstos, e mais nenhum. Criados em `.agents/skills/governanca/`: `SKILL.md`,
  `ORIGEM.md`, `scripts/governanca.py`, `scripts/checagens/` (`coleta.py`, `referencias.py`, `skills.py`,
  `instrucoes.py`, `registros.py`) e `scripts/testes/test_governanca.py`. Alterados:
  `validate_spec.py`, `AGENTS.md`, `oficina-de-skills/SKILL.md` (chamada e marca `# sem rtk` no bloco do
  `nohup`), `spec/SKILL.md`, `task/SKILL.md`, `commits.md`, `testing.md`, `agents-checks.yml`, esta task.
  Apagados: o verificador geral e a pasta `testes/` dele em `.agents/scripts/`. Nenhuma fixture nova em
  arquivo: os testes montam o projeto falso no próprio teste, como a suíte antiga.
- **Decisões tomadas no caminho:**
  - **Tasks e specs saem de todas as checagens de instrução**, não só as fechadas (links, caminhos, comandos
    `python3`, skills citadas, placeholder, `rtk`): o conteúdo das vivas é do validador da skill dona (CA-25,
    "sem regra de conteúdo própria"), e o das fechadas de ninguém (CA-04). Rodar as duas coisas nas vivas
    daria o mesmo link quebrado duas vezes e acusaria o link da lista do design para task ainda não criada e
    os caminhos de "Arquivos previstos" que a task vai criar. Consequência: task viva que cita uma skill que
    ainda não existe deixa de gerar aviso (o validador de task não tem essa regra). Aprovada pelo Juno em
    2026-11-19 (mudava o que é acusado além do previsto no passo 2); se o aviso fizer falta, a regra vai para
    o validador de task, não para a governança.
  - Os testes `test_registro_fechado_nao_gera_aviso` e `test_task_aberta_continua_gerando_aviso` saíram da
    suíte migrada (a decisão acima): o primeiro virou o teste do CA-04; o segundo deixou de valer.
  - "Ler antes de começar" desta task deixou de citar o caminho do verificador e da suíte dele, que esta task
    apaga (o validador acusaria caminho inexistente): agora aponta a versão da `main`.
  - O bloco do `nohup` da tela de comparação da oficina é processo longo: ganhou `# sem rtk: …` em vez de
    `rtk` (exceção do `AGENTS.md`).
  - As checagens ficam numa subpasta `scripts/checagens/`, e o `governanca.py` fica sozinho em `scripts/`,
    como ponto de entrada — pedido do Juno na revisão (2026-11-19), para não confundir qual arquivo se roda;
    descartadas: deixar tudo solto em `scripts/` (seis arquivos sem dizer qual é a entrada) e prefixo no nome
    (a lista continuaria misturada). O nome não é `utils`: os módulos são as regras, não funções de apoio.
  - Os exemplos da `SKILL.md` usam caminhos que existem: a checagem de caminhos também olha dentro de código.
  - Spec `concluída` ainda fora de `specs/done/` não é acusada: não é caso do CA-23 (o encerramento da spec
    é da task 04).
- **Testes antes de começar:** suíte do verificador geral 40 testes OK; scripts da `task` 47 OK; scripts da
  `spec` 8 OK; critérios `[script]` dos evals da `task` 42 OK; `apply_checks` da oficina OK; verificador geral
  no repositório: 0 erros, 10 avisos.
- **Testes no fim:** governança 59 testes OK; scripts da `task` 47 OK; scripts da `spec` 8 OK (sem
  alteração); evals da `task` 42 OK; oficina 5 OK (o laço do CI, rodado localmente com Python 3.14.5);
  governança no repositório: 0 erros, 5 avisos (skills `adr` e `encerramento` citadas, ainda não existem);
  `quick_validate ../governanca`: válida. Mutação manual: 8 mutantes, 8 mortos (aceitar qualquer status em
  `done/`; não pular tasks e specs; duplicata pelo caminho inteiro; ignorar `# sem rtk`; placeholder dentro
  de código; validar também as fechadas; aceitar avulsa fechada fora de `done/`; aceitar em andamento sem
  branch). Checagem manual: com uma cópia de task concluída fora de `done/`, uma task avulsa `concluída`
  plantada e um placeholder e um `npm test` sem `rtk` no guia de commits, a governança deu os 5 erros
  esperados; desfeito, voltou a 0 erros.
- **Evidência por critério:** CA-04 → teste "task concluída em done/ que cita arquivo que não existe mais não
  é acusada (CA-04)" passando, e a mutação "não pular tasks e specs" morta; CA-23 → "status que não bate com a
  pasta é acusado com o arquivo (CA-23)"; CA-24 → "o mesmo arquivo de task em tasks/ e em done/ é acusado com
  os dois caminhos (CA-24)"; CA-25 → "erro de conteúdo de task viva sai com a mensagem do validador (CA-25)"
  e "O validador é chamado para cada task e spec viva, e para nenhuma fechada"; CA-26 → "comando sem rtk em
  bloco bash é acusado com a linha (CA-26)"; CA-27 → "placeholder esquecido numa skill ou guia é acusado; no
  modelo e em código não (CA-27)"; CA-30 → "nenhuma instrução cita o verificador antigo (CA-30)" e "O
  workflow das instruções roda o script da governança, sem filtro" — todos passando.
- **Checagens não feitas:** o CI no GitHub (só o laço equivalente, localmente: roda no push da branch); a
  rodada com e sem a skill na oficina (decisão de 2026-11-19, ver seção 3).
- **Ficou para depois:** o `create_task.py` corta a lista de CAs quando o item da lista do design quebra
  linha (CAs desta task preenchidos à mão) → task 03; os avisos de skill `encerramento` citada → tasks 06 e
  08; o código da regra no `Finding` e a base de achados → task 09.
- **Commits entregues:** quatro, nesta ordem (cada um deixa a governança e os testes verdes), todos com o
  rodapé `Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/01-governanca.md`:
  1. `refactor(agents): Expõe a validação da spec como função importável` — `validate_spec.py`;
  2. `docs(agents): Corrige placeholders esquecidos nas skills e guias` — `commits.md`, `spec/SKILL.md`,
     `task/SKILL.md`;
  3. `feat(agents): Adiciona a skill de governança no lugar do check_agents` — a pasta `governanca/` inteira,
     o verificador geral e a suíte dele (apagados), `AGENTS.md`, `oficina-de-skills/SKILL.md`, `testing.md`,
     `agents-checks.yml`;
  4. `docs(agents): Registra a implementação da task 01 do fluxo de trabalho` — esta task.
