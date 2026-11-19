# Task: Task só é concluída com a aprovação do Juno

- **Status:** `concluída`
- **Criado em:** 2026-11-18
- **Atualizado em:** 2026-11-19 — aprovada na revisão do Juno
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/encerramento-com-aprovacao` (criada pelo Juno)

## 2. Contexto e critérios (task avulsa)

- **Problema:** o modo Fechar da skill `task` (passo 3.5 do `SKILL.md`) manda marcar `concluída` assim
  que os comandos passam e todo `CA-NN` tem evidência. Na primeira task real
  (`2026-11-18-aceite-exige-solicitacao-aberta.md`) o agente seguiu isso e marcou `concluída` antes de o
  Juno revisar. Para o Juno, `concluída` quer dizer **revisada e aprovada por ele**, não só "testes
  verdes"; e a futura skill `encerramento` (mover para `done/`) não pode rodar antes disso.
- **Objetivo:** a skill `task` entrega o fechamento com status `em andamento` e pede a aprovação; só com
  o "aprovado" explícito do Juno o status vira `concluída`, e o "Atualizado em" recebe a data da
  aprovação com o motivo "aprovada na revisão do Juno". A mesma regra vira uma linha em "Regras de trabalho" do `AGENTS.md`, para valer em
  qualquer agente, para specs e para a `encerramento`.
- **Fica fora:**
  - campo novo de aprovação no modelo `task.md` e no `validate_task.py` (decisão 2A: o "Atualizado em"
    basta);
  - criar a skill `encerramento`;
  - mudar a skill `spec` (ela não marca `concluída`; a linha do `AGENTS.md` cobre as specs);
  - rodada completa da oficina com os 5 cenários antigos (decisão 1A: modo leve).
- **Referências:** decisões 1A, 2A e 3A de 2026-11-18 (ajuste da skill `task`);
  `.agents/skills/task/SKILL.md` (seção "3. Fechar"); `.agents/skills/oficina-de-skills/SKILL.md`
  (modo leve); task `2026-11-18-aceite-exige-solicitacao-aberta.md` (o caso real).

### CA-01: Fechar com evidência completa não marca concluída

- **Dado** uma task `em andamento` com a implementação feita e os testes passando
- **Quando** o usuário pede para fechar a task
- **Então** o agente confere o estado real, preenche o fechamento com a evidência que verificou, mantém o
  status `em andamento`, não move a task para `done/` e pede a revisão e a aprovação do usuário

### CA-02: Com a aprovação, a task vira concluída

- **Dado** uma task `em andamento` com o fechamento preenchido e verificado
- **Quando** o usuário diz que revisou e aprova
- **Então** o agente muda o status para `concluída` e o "Atualizado em" para a data com o motivo
  "aprovada na revisão do Juno", sem mexer no resto do fechamento e sem mover a task para `done/`

### CA-03: A regra vale para qualquer agente

- **Dado** o `AGENTS.md`
- **Quando** um agente lê "Regras de trabalho"
- **Então** encontra que task ou spec só vira `concluída` (ou vai para `done/`) com a aprovação explícita
  do Juno

## 3. O que fazer nesta tarefa

1. Seguir a `oficina-de-skills` em modo leve: snapshot da skill atual em `task-workspace/` (feito) e
   linha de base **antes** de editar a skill e o `AGENTS.md`.
2. Cenários novos em `evals/evals.json`: 6 `fechamento-com-evidencia-completa` (CA-01) e 7
   `aprovar-fechamento` (CA-02), com arquivos de apoio em `evals/files/`. São dois cenários, e não um como
   diz o modo leve, porque o CA-02 é um passo novo que nenhum cenário exercita.
3. Critérios `[script]` dos cenários 6 e 7 em `evals/checks.py`, com teste que passa e que falha em
   `evals/test_checks.py` e mutação manual.
4. Rodar 6 e 7 com a skill antiga (`old_skill`), editar o `SKILL.md` (passo 3.5, tabela do modo 0 com
   "aprovado", mensagem de entrega e o exemplo do modo Fechar) e a linha do `AGENTS.md`, e rodar 6 e 7
   com a skill nova (`with_skill`). Rodar também o cenário 4 (pressão) uma vez com a skill nova, para
   conferir que ele não regrediu.
5. Avaliação às cegas, `apply_checks`, comparação resumida no chat e `check_agents`.
6. Commit à parte (decisão 2A da branch): mover as 3 tasks concluídas para
   `.agents/docs/tasks/done/2026-11/` (o Juno faz o `git mv`), com as 2 citações por caminho trocadas
   pelo nome do arquivo.

**Ler antes de começar:**

- `.agents/skills/oficina-de-skills/SKILL.md` (modo leve, passo 2.2 e 4)
- `.agents/skills/task/SKILL.md` (seção "3. Fechar")
- `.agents/skills/task/evals/checks.py` e `.agents/skills/task/evals/test_checks.py` (modelo dos critérios `[script]`)
- `.agents/skills/task/evals/files/task-perfil-cliente-em-andamento.md` (modelo de arquivo de apoio)

**Arquivos previstos:**

- alterados: `.agents/skills/task/SKILL.md`, `AGENTS.md` (uma linha em "Regras de trabalho"),
  `.agents/skills/task/evals/evals.json`, `.agents/skills/task/evals/checks.py`,
  `.agents/skills/task/evals/test_checks.py`;
- criados: `.agents/skills/task/evals/files/task-aceite-implementada.md`,
  `.agents/skills/task/evals/files/task-aceite-em-revisao.md`;
- commit à parte (feito, `badde433`): task `2026-11-16-skill-task.md` e `.agents/skills/task/ORIGEM.md` (citação
  pelo nome) e o movimento das 3 tasks concluídas para `done/2026-11/`.

**Não deve mudar:** `api/`, `web/`; o modelo `.agents/docs/templates/task.md`; o `validate_task.py` e os
testes dele; os modos Abrir e Atualizar da skill `task`; o comportamento do cenário 4 (fechar sem
evidência continua não marcando `concluída`).

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** nenhum. Os testes de `evals/test_checks.py` dos
cenários 1 a 5 continuam iguais; entram classes novas para os cenários 6 e 7.

## 4. Como validar o que foi feito

| Critério | Teste que prova |
|---|---|
| CA-01 | `evals/evals.json` — "[script] Mantém o status em andamento ao fechar com evidência completa (CA-01)" |
| CA-02 | `evals/evals.json` — "[script] Marca concluída com Atualizado em de aprovação (CA-02)" |
| CA-03 | `AGENTS.md` — "linha de aprovação em Regras de trabalho (CA-03)", conferida na revisão do Juno |

CA-01 deve falhar com a skill antiga (é a falha real). CA-02 provavelmente já passa em parte com a skill
antiga (marcar `concluída` com o "aprovado" é o comportamento de hoje); o que é novo é o motivo no
"Atualizado em" e não mover para `done/`.

Comandos (a partir da raiz, salvo indicação):

- `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"` — testes do `checks.py`
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes` — scripts da `task` (não devem mudar)
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../task` e
  `rtk python3 -m scripts.apply_checks <caminho absoluto da skill task> <workspace>/iteration-6`
- `rtk python3 .agents/scripts/check_agents.py`
- **Mutação manual** nos critérios novos do `checks.py`: inverter a comparação de status do cenário 6;
  aceitar qualquer "Atualizado em" no cenário 7; não olhar `done/` nos dois. Todas devem ser detectadas
  pelos testes de `test_checks.py`.

A task só está concluída com a comparação antiga × nova revisada e **aprovada pelo Juno** e a evidência
registrada no fechamento. Se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

- **O que foi feito:** modo Fechar da skill `task` reescrito nos passos 5 a 8: a task fica `em andamento`
  mesmo com tudo verificado, o agente pede a revisão, e só com a aprovação explícita marca `concluída`
  com "Atualizado em — aprovada na revisão do Juno", sem reescrever o fechamento; tabela de modos,
  `description`, exemplo "com tudo verificado" e seção "Entrega" acompanham. Regra "Concluir" em
  "Regras de trabalho" do `AGENTS.md`. Cenários 6 e 7 com critérios `[script]` e testes.
- **Arquivos alterados:** os previstos (`SKILL.md`, `AGENTS.md`, `evals.json`, `checks.py`,
  `test_checks.py`, os 2 arquivos de apoio) e esta task. Fora da lista: nenhum. O commit à parte do
  movimento para `done/` foi feito pelo Juno (`badde433`).
- **Decisões tomadas no caminho:**
  - linha de base refeita depois que o notebook travou (2 agentes em paralelo + Jest no Docker + IntelliJ
    em 7,5 GB): rodadas uma por vez, cenário 6 só com `tsc` e o teste do aceite (rodada de 2026-11-19:
    1A 2A 3A);
  - a 1ª linha de base do cenário 6 foi descartada: proibir as suítes completas fez a skill antiga
    deixar a task `em andamento` por falta de evidência, não por regra de aprovação. O arquivo de apoio
    passou a listar só os dois comandos leves na seção 4, para a evidência completa ser possível
    (execução descartada guardada em `task-workspace/descartado-iter6-c6-old_skill-suites-proibidas/`);
  - a própria task citava tasks pelo caminho (erro do `check_agents` depois do movimento para `done/`):
    trocado pelo nome do arquivo, como manda o modelo.
- **Testes antes de começar:** `test_checks.py` com 31 testes (contados no `HEAD`; a suíte rodou verde
  logo após os testes novos, 42); scripts da `task` não rodados antes (os arquivos deles não mudaram);
  `check_agents` 0 erros (numa cópia com o movimento para `done/` simulado).
- **Testes no fim:** `test_checks.py` 42 testes passando (11 novos); scripts da `task` 47 passando (sem
  mudança); `quick_validate` ok; `check_agents` 0 erros, 7 avisos (citações à skill futura
  `encerramento`). Mutação no `checks.py`: 6 mutantes, 6 mortos. Comparação (iteration-6, 1 execução por
  configuração, avaliador às cegas + `apply_checks`): cenário 6, skill antiga 4/6 (marcou `concluída` sem
  pedir aprovação) × nova 6/6; cenário 7, antiga 4/4 × nova 4/4; cenário 4 (regressão), nova 6/6.
- **Evidência por critério:**
  - CA-01 → critério "[script] Mantém o status em andamento ao fechar com evidência completa (CA-01)": falha com a skill antiga (status `concluída`), passa com a nova; avaliador às cegas: só a nova pede a aprovação;
  - CA-02 → critério "[script] Marca concluída com Atualizado em de aprovação (CA-02)" passando com a skill nova ("2026-11-19 — aprovada na revisão do Juno"); a antiga também passa, como a seção 4 previa;
  - CA-03 → linha "Concluir" em "Regras de trabalho" do `AGENTS.md`, para a revisão do Juno.
- **Checagens não feitas:** rodada com 3 execuções por cenário (modo leve, decisão 1A); cenários 1, 2, 3
  e 5 não rodaram (não passam pelo modo Fechar). Os subagentes carregam as preferências e a memória do
  usuário; mesmo assim a skill antiga falhou no cenário 6, então isso não mascarou a diferença.
- **Ficou para depois:** o `check_agents` não pegou a citação por caminho no `ORIGEM.md` (só nas tasks):
  vale ver por quê; a skill `encerramento` deve respeitar a regra "Concluir".
- **Commits entregues:**
  - `docs(agents): Exige a aprovação do Juno para concluir task` — `SKILL.md`, `AGENTS.md`, `evals/`;
  - `docs(agents): Adiciona a task de concluir só com aprovação` — esta task (depois da aprovação, com
    status `concluída`).
