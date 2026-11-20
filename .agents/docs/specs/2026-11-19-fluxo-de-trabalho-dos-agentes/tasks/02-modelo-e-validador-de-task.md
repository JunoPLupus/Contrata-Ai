# Task: Modelo e validador de task

- **Status:** `aberta`
- **Criado em:** 2026-11-20
- **Atualizado em:** 2026-11-20 — rodadas de abertura respondidas (Q1 a Q6)
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-02` (sugerida; criada pelo Juno)

## 1. Vínculo com a spec (task de spec)

- **Spec:** [spec.md](../spec.md) · **Design:** [design.md](../design.md)
- **Bloqueada por:** 01-governanca.md
- **Critérios de aceite cobertos:** CA-01, CA-02, CA-03, CA-20

## 3. O que fazer nesta tarefa

Decisões que já vêm da spec e do design (não reabrir):

- Itens rastreáveis viram subseções fixas `###`, nunca apagadas; "não se aplica" é resposta válida.
- Impacto com seis eixos fixos (contrato da API, banco, front, permissões e segurança, testes existentes que
  mudam de propósito, documentação), cada um "sim — o quê" ou "não".
- Decisões: só as tomadas, uma por linha (decisão, descartadas, motivo, data), no formato da skill `spec`, com
  "Em aberto" ao lado.
- Seção de andamento com entradas datadas; o fechamento resume.
- Metadados: Status, Criado em, Atualizado em, Tipo, Alcance, Modo e Branch; o Modo nasce com "agente
  implementa, Juno revisa".
- "Commits entregues" com um bloco ```text por commit (a mensagem completa) seguido da lista "Arquivos:".
- Tasks em `done/` e as fechadas na pasta da spec continuam no modelo antigo e não são validadas (CA-04, já
  entregue pela 01).

Decisões desta abertura (rodada de 2026-11-20):

- Estrutura: as seções 1 a 4 mantêm os números; as subseções `###` ficam dentro da 2 e da 3; entram
  `## 5. Andamento` e `## 6. Fechamento` — descartada: seções planas como no doe-palmas (todo número citado nas
  skills e nos scripts mudaria, e a divisão avulsa × de spec seria refeita).
- Modo em conjunto fechado de dois valores, `agente implementa, Juno revisa` e `Juno implementa, agente guia e
  revisa` (o segundo com o "e revisa" pedido pelo Juno), conferido pelo validador — descartada: texto livre (o
  validador não pega erro de digitação e o "iniciar" não teria como ler o modo).
- Andamento sempre presente; pode ficar vazio com `aberta` ou `bloqueada`; com `em andamento`, `concluída` ou
  `cancelada` exige pelo menos uma entrada; cada entrada é `- AAAA-MM-DD — texto` — descartada: o `create_task`
  gravar "criada" (repete o "Criado em").
- O checklist de alcance do "Ler antes de começar" fica para a 07, junto do passo de leitura e do eval que o
  prova — descartada: entrar já aqui (o conteúdo seria decidido antes do passo que o usa).
- O `create_task.py` aceita `--modo agente` (padrão) ou `--modo juno`, para o Modo nascer certo quando o Juno
  já disse que vai implementar; a troca registrada no Andamento vale só para mudança depois que a task existe —
  descartada: sempre o padrão, com o agente editando o campo depois (passo manual que a spec quer tirar dele).
- Até a 05, esta task, a 03 e a 07 salvam a base de achados antes de começar e comparam no fim, registrando o
  resultado no fechamento — descartada: só as suítes antes, como na 01 e na 09 (erro antigo se confunde com
  novo).

1. **Modelo `.agents/docs/templates/task.md`**:
   - metadados: os de hoje mais `**Modo:**`, com os dois valores como lista do modelo;
   - `## 1. Vínculo com a spec` sem mudança;
   - `## 2. Contexto e critérios` (avulsa): `### Problema`, `### Objetivo`, `### Referências` e os `### CA-NN`;
   - `## 3. O que fazer nesta tarefa`: `### Fica fora`, `### Decisões`, `### Em aberto`, `### Passos`,
     `### Ler antes de começar`, `### Arquivos previstos`, `### Não deve mudar` e `### Impacto` (os seis eixos,
     um rótulo por eixo); "Testes existentes que vão mudar de propósito" passa a ser o eixo de testes;
   - `## 4. Como validar o que foi feito` sem mudança de estrutura;
   - `## 5. Andamento` (nova, com a regra da entrada datada) e `## 6. Fechamento` (a atual seção 5, com "Commits
     entregues" no formato fixo).
2. **Validador `validate_task.py`** acompanhando o modelo (CA-01, CA-02, CA-03), com o código da regra de cada
   achado (`task.…`, padrão da 09):
   - cada subseção obrigatória do tipo da task existe e não está vazia; "não se aplica" vale (CA-01, CA-02);
   - os seis eixos existem e respondem "sim" ou "não" (CA-03). "Sim" exige o travessão e um texto depois
     dele, dizendo o que muda (`sim — rota GET /x passa a exigir prestador`); "sim" sozinho ou "sim —" sem
     texto é erro, com o nome do eixo. O travessão aceita as mesmas variantes do "Atualizado em" (`—`, `–` ou
     `-`). "Não" pode vir sozinho ou com um comentário depois;
   - Modo presente, um dos dois valores; "Em aberto" e "Decisões" não vazios ("nada" e "nenhuma" valem);
   - Andamento presente; com `em andamento`, `concluída` ou `cancelada`, pelo menos uma entrada; toda entrada
     no formato `- AAAA-MM-DD — texto`;
   - com `--fechar` ou `concluída`: "Commits entregues" no formato fixo (bloco ```text com a mensagem e a lista
     "Arquivos:" logo depois);
   - as regras de hoje continuam, adaptadas aos títulos novos (rótulos do fechamento, "Ler antes de começar",
     tabela critério → teste).
3. **`create_task.py`**: preenche o Modo com "agente implementa, Juno revisa" (CA-20), ou com "Juno
   implementa, agente guia e revisa" com a flag `--modo juno` (`--modo agente` é o padrão; só esses dois), acompanha os títulos novos
   (seção 6 nasce só com os rótulos) e sugere a branch de task de spec com o número no fim
   (`<tipo>/juno/<assunto-da-spec>-NN`), como o design manda para o "iniciar" (hoje sai sem o número e é
   corrigida à mão).
4. **Skill `task`**: os trechos que citam a seção 5 como fechamento passam a citar a 6; no passo 1.4 (abrir),
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

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

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

**Arquivos previstos:**

- alterados: `.agents/docs/templates/task.md`; `.agents/skills/task/scripts/validate_task.py`,
  `create_task.py` e os testes deles (`test_validate_task.py`, `test_create_task.py`, `avulsa-ok.md`);
  `.agents/skills/task/evals/checks.py` e `test_checks.py`, se dependerem dos títulos antigos; os três arquivos
  de task em `.agents/skills/task/evals/files/`; `.agents/skills/task/SKILL.md` (passo 4 acima); esta task;
- possivelmente `.agents/skills/governanca/scripts/checagens/skills.py`, se a lista de seções esperadas mudar de
  forma (subseções); conferir na implementação.

**Não deve mudar:**

- as tasks em `.agents/docs/tasks/done/` e as tasks concluídas desta spec (`01-governanca.md`,
  `09-base-de-achados.md`): continuam no modelo antigo;
- os modelos de spec e de design e o `validate_spec.py` (task 03), inclusive a leitura da Branch do design no
  `validate_task.py`, que sai junto com o campo na 03;
- o texto da skill `task` além do passo 4 acima (iniciar, encerrar e fechar são das tasks 05 e 06; leitura e
  checklist, da 07);
- a governança, salvo o ajuste de seções esperadas (arquivos previstos); `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:**

- `test_validate_task.py`: a fixture `avulsa-ok.md`, a `TASK_SPEC_OK` e a `FECHAMENTO_OK` passam para o modelo
  novo; os testes que montam seções pelo título antigo (seção 5 como fechamento, rótulos soltos na seção 3)
  mudam junto;
- `test_create_task.py`: o conteúdo esperado ganha o Modo, a seção 6 e a branch com o número (e testes novos
  para o `--modo`);
- `evals/test_checks.py`, se os cenários dependerem dos arquivos de `evals/files/` convertidos.

Teste que quebrar e não estiver nesta lista é regressão até prova em contrário.

## 4. Como validar o que foi feito

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

## 5. Fechamento

- **O que foi feito:**
- **Arquivos alterados:**
- **Decisões tomadas no caminho:**
- **Testes antes de começar:**
- **Testes no fim:**
- **Evidência por critério:**
- **Checagens não feitas:**
- **Ficou para depois:**
- **Commits entregues:**
