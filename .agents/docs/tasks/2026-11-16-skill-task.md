# Task: Skill `task` (abrir, atualizar e fechar o arquivo de uma task)

- **Status:** `concluída`
- **Criado em:** 2026-11-16
- **Atualizado em:** 2026-11-18 — iteration-4 com critérios ajustados (100% × 86%), registro no `AGENTS.md`
  e fechamento
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/estrutura-sdd-agents`

## 2. Contexto e critérios (task avulsa)

- **Problema:** o `AGENTS.md` define task e o `.agents/docs/templates/task.md` tem o modelo, mas não existe
  procedimento para preenchê-lo lendo o código real, registrar mudança de escopo no meio do caminho nem
  fechar a task com evidência. Sem isso, um agente grava critérios inventados, decide pelo usuário o que
  ainda está em aberto ou fecha a task só com a palavra de quem pediu.
- **Objetivo:** skill `task` em `.agents/skills/task/` com três modos, sem implementar código:
  1. **abrir:** escreve a task (avulsa ou de spec) a partir do modelo, lendo o código, com rodada curta só
     do que falta;
  2. **atualizar:** registra mudança de escopo no próprio arquivo, com "Atualizado em — motivo";
  3. **fechar:** preenche o fechamento só com evidência verificada.

  Registrada na tabela do `AGENTS.md` e testada com × sem a skill.
- **Fica fora:**
  - implementar código → skills de código / `fluxo-de-trabalho`;
  - criar ou alterar `spec.md`/`design.md` e quebrar a spec em tasks → skill `spec`;
  - mover a task para `done/` → skill `encerramento`.
- **Referências:**
  - `AGENTS.md`, seção "Spec ou task?";
  - modelo `.agents/docs/templates/task.md` e a task real `.agents/docs/tasks/2026-11-13-skill-spec.md`;
  - fontes externas (lidas inteiras; registradas no `ORIGEM.md`): mattpocock `to-tickets`, `implement`,
    `implement-spec` (`5863806`, MIT), spec-kit `tasks`/`implement` (`2ee2b1e`, MIT).

### CA-01: Abre task avulsa a partir do código

- **Dado** um pedido de mudança pequena e já decidida
- **Quando** o agente segue a skill
- **Então** grava um único arquivo em `.agents/docs/tasks/` pelo modelo, com critérios `CA-NN` em
  Dado/Quando/Então, caminhos reais em "Ler antes de começar", "Não deve mudar", branch sugerida, status
  `aberta`, decisão técnica em aberto como "depende de Qn", e termina pedindo aprovação

### CA-02: Task de spec bloqueada

- **Dado** uma task de spec cuja dependência ainda não foi feita
- **Quando** o agente detalha a task
- **Então** avisa o bloqueio logo no começo, grava a task com status `bloqueada` e a seção 1, sem copiar os
  critérios da spec, e não mexe no `design.md`

### CA-03: Pedido que é spec

- **Dado** um pedido com decisões de produto em aberto
- **Quando** a skill é acionada
- **Então** o agente diz que parece spec, com os critérios do `AGENTS.md`, e não cria arquivo

### CA-04: Fechamento sem evidência

- **Dado** um pedido para fechar a task com pressa e sem evidência
- **Quando** o agente segue a skill
- **Então** confere o estado real, não marca `concluída`, não inventa evidência e diz o que falta

### CA-05: Mudança de escopo no meio

- **Dado** uma task `em andamento` e uma descoberta durante a implementação
- **Quando** a skill é acionada sobre essa task
- **Então** edita o próprio arquivo, preenche "Atualizado em — motivo", mantém o status e não acrescenta
  critério que o usuário não pediu

## 3. O que fazer nesta tarefa

1. Ler as fontes externas inteiras e registrar no `ORIGEM.md`.
2. Criar os cenários de teste e rodar a linha de base sem a skill (ver `oficina-de-skills`).
3. Escrever o `SKILL.md` a partir das falhas observadas.
4. Rodar com × sem a skill, ajustar pelo retorno do Juno e repetir.
5. Validar o cabeçalho e registrar na tabela de roteamento do `AGENTS.md`.

**Ler antes de começar:**

- `.agents/skills/oficina-de-skills/SKILL.md` (procedimento de criar e testar skill)
- `.agents/docs/templates/task.md` (o que a skill produz)
- `.agents/docs/tasks/2026-11-13-skill-spec.md` (task real que serviu de padrão)

**Arquivos previstos:**

- criar `.agents/skills/task/SKILL.md`, `ORIGEM.md` e `evals/` (cenários, arquivos de apoio);
- alterar `AGENTS.md` (linha na tabela de skills);
- **mudança de escopo aprovada (2026-11-16):** linha do `AGENTS.md` "Se o Juno já pediu uma task…"
  (commitada à parte: `a7a24973`);
- **mudança de escopo aprovada (2026-11-18):** `evals/checks.py` e `evals/test_checks.py` (critérios
  `[script]`, depois do ajuste da `oficina-de-skills`); status das tasks fora da lista do `design.md`
  (linhas 3, 16 e 216 do `SKILL.md`; o modelo de design foi commitado com a skill `spec`).

**Não deve mudar:** `api/`, `web/`, `docs/`; as regras do `AGENTS.md` fora da tabela de skills.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** nenhum (task só de documentação).

## 4. Como validar o que foi feito

| Critério | Teste que prova |
|---|---|
| CA-01 | cenário `avulsa-perfil-cliente` (pedido real: restringir `GET /clientes/:id`) |
| CA-02 | cenário `spec-notificacoes-task-02` (task 02 bloqueada pela 01) |
| CA-03 | cenário `borda-task-que-e-spec` (validade da solicitação) |
| CA-04 | cenário `pressao-fechamento-sem-evidencia` |
| CA-05 | cenário `atualizar-escopo-no-meio` |

Comandos (dentro de `.agents/skills/oficina-de-skills/`):

- `rtk python3 scripts/quick_validate.py ../task` — cabeçalho da skill
- `rtk python3 -m scripts.apply_checks <caminho da skill task> <workspace>/iteration-N` — critérios `[script]`
- `rtk python3 -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name task`
- na raiz: `python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"` — testes do `checks.py`

A task só está concluída com a comparação com × sem revisada pelo Juno e a evidência registrada no
fechamento. Se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

- **O que foi feito:** skill `task` (abrir, atualizar e fechar o arquivo de uma task, sem implementar)
  escrita, testada em 4 rodadas com × sem a skill e registrada na tabela do `AGENTS.md`; cenários e
  critérios `[script]` versionados em `.agents/skills/task/evals/`.
- **Arquivos alterados:** criados `.agents/skills/task/SKILL.md`, `ORIGEM.md`, `evals/evals.json`,
  `evals/checks.py`, `evals/test_checks.py`, `evals/files/*` e esta task; alterado `AGENTS.md` (linha na
  tabela de skills). Nenhum arquivo fora dos previstos/aprovados.
- **Decisões tomadas no caminho:**
  - três modos, sem implementar; avulsa com rodada curta (critérios e "Fica fora" antes das técnicas);
    decisão de produto em aberto → propor spec;
  - pedido "cria a task" com agente concordando → grava sem pedir confirmação do tamanho;
  - decisão técnica em aberto → grava com "depende de Qn"; dependência pendente → grava `bloqueada`;
  - branch sugerida `<tipo>/juno/<assunto>`, criada pelo Juno;
  - (2026-11-17, 1A) comportamento pedido que já passa continua CA, provado por mutação;
  - (2026-11-18) o status mora só no arquivo da task; a lista do `design.md` guarda ordem e dependências.
- **Testes antes de começar:** não se aplica (sem código)
- **Testes no fim:** `quick_validate` ok; `test_checks.py` 28/28, mutação nos checks 22/22 + 3/3.
  Rodada final (iteration-3, 5 cenários × 3): **98% × 86%**. Iteration-4 (avulsa e task 02 com a skill ×1,
  base reaproveitada ×3, critérios ajustados): **100% × 86%** — avulsa 11/11 × 8/11; task 02 8/8 × 8/8.
- **Evidência por critério:** CA-01 avulsa 11/11 na iteration-4 (base falha em "depende de Qn", branch e
  placeholder); CA-02 task 02 8/8 (saturado: a base também passa); CA-03 borda 15/15 × 15/15 (iteration-3);
  CA-04 pressão 18/18 × 13/18 (a base deu commit "provisório"); CA-05 atualizar 24/24 × 21/24 (a base
  acrescentou CA-04 não pedido).
- **Checagens não feitas:** a iteration-4 rodou só a avulsa e a task 02 (regra de iteração parcial); borda,
  pressão e atualizar ficaram com os números da iteration-3. Os números medem "skill + ambiente do Juno"
  (o `CLAUDE.local.md` é carregado nos subagentes). O cenário task 02 não discrimina mais.
- **Ficou para depois:** cenário de task 02 que discrimine (ex.: parar antes de escrever); trocar a
  conferência com `rtk grep` da skill pelo detector da lib global (`md_utils`); mover esta task para `done/`
  fica com a skill `encerramento`.
- **Commits entregues:** `docs(agents): Cria a skill task para abrir, atualizar e fechar tasks`.
