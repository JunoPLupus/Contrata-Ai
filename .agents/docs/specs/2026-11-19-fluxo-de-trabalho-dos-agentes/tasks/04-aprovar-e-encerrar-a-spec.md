# Task: Aprovar e encerrar a spec

- **Status:** `concluída`
- **Criado em:** 2026-11-24
- **Atualizado em:** 2026-11-24 — aprovada na revisão do Juno
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Modo:** `agente implementa, Juno revisa`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** 03-modelos-e-validador-de-spec-e-design.md
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-04`

## 1. Contexto e critérios

### Problema

Aprovar uma spec é o agente trocar `rascunho` por `aprovada` à mão (passo 6 da fase 2 da skill `spec`); o
validador só acusa um item em "Em aberto" depois da troca, e nada registra que o Juno aprovou nem quando (nesta
spec, o registro está no motivo do "Atualizado em", que o "iniciar" da primeira task reescreve). Encerrar uma spec
não tem regra nenhuma: ninguém confere se todas as tasks terminaram, ninguém muda o status para `concluída` e a
pasta não vai para `specs/done/`, que ainda nem existe. E o que ficou de fora das tasks (o "ficou para depois"
dos fechamentos, as notas da lista do design, o estacionamento) some com a spec encerrada sem que ninguém
decida se ainda cabia nela.

### Objetivo

Dois scripts na skill `spec`, rodados só depois da aprovação do Juno na conversa: `approve_spec.py` leva a spec de
`rascunho` para `aprovada` (ou `em andamento`, numa reaprovação com task já iniciada) só com o validador sem
erro e "Em aberto" igual a "nada", e grava a data no metadado `Aprovada em`; `finish_spec.py` leva a spec de
`em andamento` para `concluída`, grava `Encerrada em` e move a pasta inteira para `specs/done/` só com o
validador sem erro e todas as tasks da lista concluídas ou canceladas, e senão lista os problemas e as tasks que
faltam; ele também lista as pendências versionadas que ficaram fora das tasks, numa consulta que não muda nada
(`--listar`), para o agente propor o destino de cada uma e o Juno decidir antes do encerramento. O validador
cobra os dois metadados, e o status mudado à mão deixa de passar. Os dois scripts param sem mudar nada quando uma
checagem falha, mostrando todos os problemas de uma vez. A contagem das pendências fica na lib, para o
"encerrar" da 06 avisar quando a última task de uma spec termina (CA-37). A skill `spec` passa a mandar rodar os
scripts em vez de mudar o status à mão.

### Referências

[spec.md](../spec.md) (CA-19, CA-35 e CA-39; decisões da revisão do rascunho sobre o status da spec por script,
o encerramento na branch da última task e as tasks de spec canceladas, e a da revisão das pendências antes de
encerrar, de 2026-11-24) e [design.md](../design.md) (decisão "um script por ação", tabela "Scripts e lib",
estratégia de testes e a nota da 04 abaixo da lista de tasks: bloco de encerramento no topo da spec concluída);
task `05-iniciar.md` (o `start_task.py` é o modelo dos dois scripts: blocos de checagem, recusa sem mudar nada,
saída e testes).

### Critérios de aceite

CA-19, CA-35, CA-39

## 2. O que fazer nesta tarefa

### Fica fora

- o "encerrar" e o cancelamento de task, o aviso de "última pendência" (CA-37) e o riscado na lista do design
  ao cancelar (CA-38): task 06, que usa a contagem de pendências entregue aqui;
- qualquer comando de git nos dois scripts (o encerramento roda na branch da task que fecha a última pendência,
  e quem commita é o Juno);
- a volta de uma spec para `rascunho` no "atualizar" (seção 6 da skill `spec`): continua como está;
- aprovar o `design.md` (não tem status próprio) e cancelar ou substituir uma spec;
- o passo de leitura da skill `spec` (task 07) e a passada geral para enxugar as skills (07);
- links de fora para a pasta movida: a governança já acusa link quebrado nos documentos vivos (hoje nenhum
  aponta para esta spec, conferido na abertura).

### Decisões

Vindas da spec e do design (não reabrir):

- Aprovar e encerrar a spec por script, como passos da skill `spec`; aprovar exige validação sem erro e "Em
  aberto" igual a "nada"; encerrar exige todas as tasks concluídas ou canceladas e muda para `concluída` e move a
  pasta — descartada: só a task por script — spec, revisão do rascunho (2026-11-19).
- Os scripts só rodam depois da aprovação do Juno na conversa — spec, revisão do rascunho (2026-11-19).
- `approve_spec.py` e `finish_spec.py` na skill `spec`; o comum ao fluxo na `.agents/scripts/lib/` —
  descartada: um `fluxo.py` com subcomandos — design, rodada 1 (2026-11-19).
- O encerramento da spec roda na branch da task que fecha a última pendência; sem branch, o commit vai para a
  `main` — spec, revisão do rascunho (2026-11-19).
- Task de spec cancelada fica na pasta da spec, riscada na lista do design — spec, revisão do rascunho
  (2026-11-19).
- Antes de encerrar, as pendências fora das tasks são revistas: o script mostra as versionadas ("Ficou para
  depois" dos fechamentos e notas da lista de tasks do design), também numa consulta que não muda nada; o agente
  junta o "Fica fora" da spec e as anotações locais do Juno (quando as instruções locais apontam para elas),
  propõe o destino de cada item pelo critério "serve ao objetivo da spec e não contradiz o Fica fora" e só roda
  o encerramento depois da decisão do Juno; o resultado fica só no efeito de cada decisão — spec, CA-39,
  decidido pelo Juno na abertura desta task (2026-11-24: 1B, 2A, 3A, 4A).

Desta abertura (leitura da spec, do design e do código, sem rodada própria):

- Pendências contadas pela lista "## 6. Tasks" do design (dona da ordem) e pelo status no arquivo de cada task:
  item riscado conta como cancelada; item sem link, ou com link para arquivo que não existe, é pendente ("não
  criada"); arquivo com status diferente de `concluída` e `cancelada` é pendente; arquivo em `tasks/` fora da
  lista também conta — derivado do CA-19 e do CA-37 ("contando as tasks que entraram na lista no meio do
  caminho") (2026-11-24).
- A função das pendências mora na lib (`.agents/scripts/lib/`), para o `finish_spec.py` e o "encerrar" da 06
  usarem a mesma contagem — derivado da decisão do design sobre o comum na lib (2026-11-24).
- A pasta vai para `.agents/docs/specs/done/<pasta>/` (o `done_spec_dirs` da governança e o
  `.agents/README.md`); o script cria `done/` se faltar e recusa se o destino já existir — derivado do código da
  governança (2026-11-24).
- Os scripts mudam só arquivos (status, `Aprovada em` ou `Encerrada em`, "Atualizado em", a pasta movida pelo
  sistema de arquivos), sem git: a exceção da regra de Git do `AGENTS.md` é só do `start_task.py` (CA-22) —
  derivado do `AGENTS.md` (2026-11-24).
- `approve_spec.py` só aceita spec em `rascunho` e recusa outro status dizendo qual é; `finish_spec.py` só
  aceita `em andamento` — derivado do "Dado" do CA-35 e do CA-19 (2026-11-24).
- Cada script confere tudo num bloco só e mostra todos os problemas de uma vez (aprovar: status, validador da
  pasta inteira, itens do "Em aberto" do `spec.md`; encerrar: status, validador da pasta inteira e pendências);
  nada muda antes de todas as checagens passarem; saída "… recusado" (pela função da lib, Q7 desta task) e
  exit 1 na recusa — segue a Q7 da 05 (2026-11-24).
- A aprovação é registrada sem argumento: o script grava "pelo Juno" com a data, como o "iniciar" — segue a Q4
  da 05 (2026-11-24).
- A consulta que não muda nada é o `finish_spec.py <pasta> --listar` (tasks pendentes e pendências
  versionadas), rodado pela skill antes da triagem; o encerramento sem a opção mostra as mesmas pendências
  versionadas na recusa e, no caminho feliz, na saída — derivado do CA-39 (a revisão precisa acontecer antes de
  a pasta mudar de lugar) (2026-11-24).
- "Ficou para depois" com "nada", "nenhum" ou "não se aplica" não é pendência; as notas da lista do design são
  as linhas não vazias da seção "## 6. Tasks" que não pertencem a um item (o `task_list_items` reconhece os
  itens e as linhas de continuação deles; o resto são as notas) — derivado do modelo de task e do design
  (2026-11-24).
- A skill `spec` muda pela `oficina-de-skills`, com o modo leve obrigatório (seção 3) — regra do Juno de
  2026-11-23 (Q10 da 05).

Desta abertura (rodada de 2026-11-24):

- Registro da aprovação num metadado fixo do `spec.md`, `- **Aprovada em:** AAAA-MM-DD, pelo Juno`, gravado
  pelo `approve_spec.py`. O modelo já traz o campo com o valor `rascunho` (sem placeholder: a data do modelo não
  preenchida é erro do validador). O validador cobra o campo em todo status: com `aprovada`, `em andamento` ou
  `concluída`, precisa ser a data com "pelo Juno"; com `rascunho`, `cancelada` ou `substituída`, aceita `rascunho`
  ou a data (spec que voltou a `rascunho` num "atualizar" ou foi cancelada depois de aprovada mantém a data, que
  continua sendo fato). Assim, status mudado à mão para `aprovada` vira erro — descartadas: motivo do "Atualizado
  em" (o "iniciar" da primeira task o reescreve, e o registro some); o metadado sem regra no validador (não pega a
  mudança à mão); valor inicial "não aprovada" (ambíguo: parece analisada e recusada, não à espera de aprovação;
  ajuste do Juno) — Q1, 2026-11-24.
- Encerramento registrado só num metadado, `- **Encerrada em:** AAAA-MM-DD, pelo Juno`, gravado pelo
  `finish_spec.py`; o modelo traz o valor `em aberto` (mesmo cuidado da Q1: não parecer recusa), e o validador
  exige a data só com `concluída` e, nos outros status, aceita `em aberto` — descartadas: bloco no topo com as
  tasks concluídas e canceladas (repete o "Fica fora" da spec e os itens riscados da lista do design); nada além
  do status e do "Atualizado em" — Q2, 2026-11-24 (atende a nota da 04 na lista do design).
- O "Atualizado em" continua: diz a última mudança de qualquer tipo e o motivo (atualizações da seção 6 da skill
  `spec`, a volta a `rascunho`, o "iniciar" da primeira task); os dois metadados novos registram só dois momentos
  fixos — resposta à pergunta do Juno na Q2, 2026-11-24.
- Spec reaprovada: o `approve_spec.py` grava `em andamento` quando alguma task da lista já saiu de `aberta` e
  `bloqueada` (está `em andamento`, `concluída` ou `cancelada`, ou é item riscado), e `aprovada` quando nenhuma
  saiu; a saída diz qual e por quê — descartadas: sempre `aprovada` (sem task para iniciar, ninguém a põe em
  `em andamento` e o `finish_spec.py` recusa); o `finish_spec.py` aceitar também `aprovada` (a spec fica com um
  status que não diz o que acontece) — Q3, 2026-11-24.
- O `finish_spec.py` também roda o `validate()` do `validate_spec.py` antes de encerrar e recusa com os erros,
  no mesmo bloco do status e das pendências: a governança só bloqueia erro novo (um erro antigo passa por todas
  as tasks) e não valida a spec depois que ela vai para `specs/done/`, então o erro seria congelado (ex.: um
  `Aprovada em` sem data, de status mudado à mão) — descartada: não validar (o CA-19 não pede; era a proposta
  inicial desta abertura) — pergunta do Juno na revisão da abertura, 2026-11-24.
- Título da task e do item da lista do design: "Aprovar e encerrar a spec" — descartado: "Status da spec por
  script" (parecia cobrir toda mudança de status da spec; a passagem para `em andamento` é do "iniciar", na 05) —
  pergunta do Juno na rodada, 2026-11-24.
- Modo leve com dois cenários de recusa: "aprovado" para uma spec com item em aberto e "encerra a spec" com uma
  task pendente; os caminhos felizes ficam com os testes e a checagem manual — descartada: também o caminho feliz
  de cada script — Q4, 2026-11-24. Com o CA-39, entra um terceiro cenário, de julgamento: a triagem das
  pendências antes do encerramento (2026-11-24).

Desta abertura (rodada do reaproveitamento, 2026-11-24; numerada aqui Q5 a Q8, respondida pelo Juno como
1A, 2A, 3A, 4A). Regra das quatro: a lógica muda de lugar sem mudar de comportamento, e os testes que já
existem continuam passando sem alteração:

- O status de uma task de spec pelo item da lista (`status_da_task`, hoje no `create_task.py`), a lista dos
  arquivos de `tasks/` de uma spec (`spec_tasks`), o status de um arquivo (`status_of`) e o conjunto de task
  fechada (`concluída`, `cancelada`; hoje na `coleta.py` e na `registros.py` da governança) vão para a lib; o
  `create_task.py` e a governança passam a importar de lá — descartadas: os scripts da skill `spec`
  importarem do `create_task.py` e da `coleta.py` (a skill `spec` dependeria de outras duas skills); copiar (a
  mesma regra em três lugares) — Q5, 2026-11-24.
- O `closing_labels` (hoje no `validate_task.py`) vai para a lib, recebendo a seção, como o `open_items` na 05;
  o `validate_task.py` passa a importar — descartada: o `finish_spec.py` importar o `validate_task.py` da skill
  `task` — Q6, 2026-11-24.
- A saída da recusa (`Iniciar recusado: … N problema(s); nada foi mudado.` seguida dos itens, com a ação no
  começo) vira uma função da lib, usada também pelo `start_task.py`, com a saída idêntica à de hoje —
  descartada: cada script montar a sua (a 06 seria o quarto lugar com o mesmo texto) — Q7, 2026-11-24.
- O regex próprio `_STATUS_SPEC` do `create_design.py` dá lugar ao `read_status` da lib — descartada: estacionar
  para o refactor da governança depois da spec (mantém uma cópia já achada) — Q8, 2026-11-24.

### Em aberto

nada

### Passos

0. **Reaproveitamento antes de escrever código novo** (Q5 a Q8), cada mudança com as suítes do dono rodando
   sem alteração nos testes: `status_da_task`, `spec_tasks`, `status_of` e o conjunto de task fechada para a lib,
   com o `create_task.py` e a governança (`checagens/coleta.py`, `checagens/registros.py`) importando; o
   `closing_labels` para a lib, recebendo a seção, com o `validate_task.py` importando; a função da saída da
   recusa na lib, com o `start_task.py` usando e a saída idêntica; o `create_design.py` usando o `read_status`.
1. **Lib** (`.agents/scripts/lib/md_checks.py`): função das pendências de uma pasta de spec (lista do design +
   status de cada arquivo em `tasks/`, inclusive os que não estão na lista), devolvendo cada task pendente com o
   número, o título e o motivo (`aberta`, `bloqueada`, `em andamento`, "não criada", "fora da lista com status
   …"). Usa `task_list_items` e `read_status`, que já existem, e as funções que vêm para a lib no passo 0.
   Ao lado, a função das pendências versionadas (CA-39): o "Ficou para depois" de cada task da pasta (pelo
   `closing_labels` da lib) e as notas da seção "## 6. Tasks" do design, cada uma com o arquivo e a linha.
2. **`approve_spec.py <pasta da spec>`**: bloco único — status `rascunho`; `validate()` do `validate_spec.py` na
   pasta sem erro; `open_items` do `spec.md` vazio (lista cada item com a linha) → status `aprovada`, ou
   `em andamento` se alguma task da lista já saiu de `aberta` e `bloqueada` (Q3, pela função do passo 1);
   `Aprovada em` com a data do dia e "pelo Juno" (Q1); "Atualizado em" do dia com "aprovada pelo Juno". Saída:
   o status gravado e o motivo, ou "Aprovar recusado" com os problemas (pela função da lib, Q7); exit 1 na
   recusa.
3. **`finish_spec.py <pasta da spec>`**: bloco único — status `em andamento`; `validate()` do `validate_spec.py`
   na pasta sem erro; nenhuma pendência (lista cada uma) → status `concluída`, `Encerrada em` com a data do dia e
   "pelo Juno" (Q2), "Atualizado em" do dia com "concluída (aprovada pelo Juno)" e a pasta movida para
   `.agents/docs/specs/done/`. Saída: o que mudou e o caminho novo, ou "Encerrar spec recusado" com os problemas
   (pela função da lib, Q7); exit 1 na recusa. As pendências versionadas (passo 1) aparecem na recusa e no
   caminho feliz; com `--listar`, o script só mostra as tasks pendentes e as
   pendências versionadas, sem mudar nada, e sai com 0 (CA-39).
4. **Modelo e validador** (Q1 e Q2): o modelo `spec.md` ganha `- **Aprovada em:** rascunho` e
   `- **Encerrada em:** em aberto` nos metadados; o `validate_spec.py` cobra os dois em todo status, com as
   regras da seção "Decisões" (código novo por regra, ex.: `spec.aprovada-sem-data`); as fixtures de spec e os
   arquivos de eval que são spec ganham as duas linhas; o `spec.md` desta spec ganha
   `Aprovada em: 2026-11-19, pelo Juno` (a aprovação registrada hoje no "Atualizado em") e
   `Encerrada em: em aberto`.
5. **Testes**: `test_approve_spec.py` e `test_finish_spec.py` em `.agents/skills/spec/scripts/testes/`, com a
   pasta da spec montada num diretório temporário; cada recusa confere que o `spec.md`, o `design.md` e o lugar
   da pasta não mudaram; os testes das duas funções de pendências (tasks e versionadas) em
   `.agents/scripts/lib/testes/test_lib.py`.
6. **Skill `spec`**: o passo 6 da fase 2 manda rodar o `approve_spec.py` depois do "aprovado" (não mudar o
   status à mão); seção nova e curta para encerrar a spec: rodar o `--listar`; juntar o "Fica fora" da spec e
   as anotações locais do usuário (quando as instruções locais apontarem para elas); propor o destino de cada
   item pelo critério do CA-39 numa rodada; aplicar as decisões (task nova pela seção 6, avulsa pela skill
   `task`); só então rodar o encerramento; o que fazer com a recusa.
   Texto direto, para o agente. Pela `oficina-de-skills`: base de achados coberta pela da task, modo leve
   obrigatório (seção 3) e `quick_validate`.

### Ler antes de começar

- `.agents/skills/task/scripts/start_task.py` — blocos de checagem, recusa sem mudar nada, saída e `main()`
- `.agents/skills/task/scripts/testes/test_start_task.py` — como monta a pasta da spec e confere que nada mudou
- `.agents/scripts/lib/md_checks.py` — `read_status`, `set_metadata`, `set_updated_at`, `open_items`,
  `task_list_items` e `TaskItem`
- `.agents/scripts/lib/projeto.py` — `get_project_root`, `relative_to_root`
- `.agents/skills/spec/scripts/validate_spec.py` — `validate()`, `open_items`, `_check_status`,
  `STATUS_SEM_ABERTO`
- `.agents/skills/spec/scripts/create_design.py` e `.agents/skills/spec/scripts/utils.py` — como os scripts da
  skill importam a lib
- `.agents/skills/spec/scripts/testes/test_validate_spec.py` e `test_create_design.py` — fixtures de spec
- `.agents/skills/governanca/scripts/checagens/coleta.py` e `registros.py` — `done_spec_dirs`, `spec_tasks`,
  `status_of`, `_TASK_FECHADA`, status × pasta (Q5)
- `.agents/skills/task/scripts/create_task.py` — `ler_lista` e `status_da_task` (Q5)
- `.agents/skills/task/scripts/validate_task.py` — `closing_labels` e `ROTULOS_FECHAMENTO` (Q6)
- `.agents/skills/spec/SKILL.md` — fase 2 (passos 5 e 6), seção 6 (atualizar)
- `.agents/docs/templates/spec.md` — metadados
- `.agents/docs/guides/testing.md` — seção 3 (comandos dos scripts) e 5.2 (mutação manual)
- `.agents/skills/oficina-de-skills/SKILL.md` — modo leve

### Arquivos previstos

- criados: `.agents/skills/spec/scripts/approve_spec.py`, `.agents/skills/spec/scripts/finish_spec.py`,
  `.agents/skills/spec/scripts/testes/test_approve_spec.py`,
  `.agents/skills/spec/scripts/testes/test_finish_spec.py`;
- alterados: `.agents/scripts/lib/md_checks.py` (pendências e o que vem da Q5 a Q7) e
  `.agents/scripts/lib/testes/test_lib.py` (pendências);
  `.agents/skills/spec/SKILL.md`; esta task;
- pela Q1 e Q2: `.agents/docs/templates/spec.md`, `.agents/skills/spec/scripts/validate_spec.py`,
  `test_validate_spec.py`, os `spec.md` das fixtures em `.agents/skills/spec/scripts/testes/`
  (`aprovada-com-aberto`, `so-spec`, `metadados-com-problemas`, `secoes-ausente-e-vazia`,
  `criterios-com-problemas`, `com-design`), `.agents/skills/spec/evals/files/spec-notificacoes-aprovada.md`,
  `.agents/skills/task/evals/files/spec-notificacoes-aprovada.md` e o `spec.md` desta spec;
- pela Q5 a Q8 (lógica que muda de lugar, sem mudar de comportamento):
  `.agents/skills/task/scripts/create_task.py`, `.agents/skills/task/scripts/validate_task.py`,
  `.agents/skills/task/scripts/start_task.py`, `.agents/skills/governanca/scripts/checagens/coleta.py`,
  `.agents/skills/governanca/scripts/checagens/registros.py`, `.agents/skills/spec/scripts/create_design.py`;
- o `design.md` desta spec só ganhou o link da 04 na abertura e não muda na implementação; o ambiente do modo
  leve fica no workspace da skill `spec` (fora do git).

### Não deve mudar

- o comportamento do `start_task.py` (inclusive a passagem de `aprovada` para `em andamento`, CA-36, e o texto
  da saída), do `create_task.py`, do `validate_task.py`, do `create_design.py` e da governança: eles só passam a
  importar da lib o que saiu deles (Q5 a Q8), e as suítes deles não mudam; a governança já lê `specs/done/`;
- o `AGENTS.md`, o `.agents/README.md` e os guias (task 08);
- as regras atuais do `validate_spec.py`, salvo as dos dois metadados novos (Q1 e Q2); o `create_spec.py` (o
  valor inicial dos metadados vem do modelo);
- as tasks concluídas e as tasks em `done/`; `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

- **Contrato da API:** não
- **Banco:** não
- **Front:** não
- **Permissões e segurança:** não — os scripts mudam só os arquivos da spec e o lugar da pasta, sem git; a
  exceção da regra de Git continua só no `start_task.py`
- **Testes existentes que mudam de propósito:** sim — com os dois metadados cobrados (Q1 e Q2), as fixtures de
  spec dos Arquivos previstos e os testes do `test_validate_spec.py` e do `test_create_design.py` que trocam o
  status (`aprovada` ↔ `rascunho` ↔ `em andamento`) passam a ajustar também `Aprovada em`; as specs mínimas
  montadas em `test_governanca.py` e `test_start_task.py` são conferidas na implementação (se algum teste mudar,
  é de propósito e entra aqui); a mudança de lugar da Q5 a Q8 não muda nenhum teste (`test_create_task.py`,
  `test_validate_task.py`, `test_start_task.py`, `test_governanca.py` e `test_create_design.py` passam como
  estão: é a prova de que só o lugar mudou)
- **Documentação:** sim — skill `spec` (aprovar pelo script; encerrar com a revisão das pendências antes, CA-39) e
  o modelo `spec.md` (dois metadados); a spec já ganhou o CA-39 na abertura

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
Andamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-35 | `test_approve_spec.py` — "spec em rascunho sem erro e sem item em aberto fica aprovada, com o Atualizado em do dia e o registro da aprovação (CA-35)" |
| CA-35 | `test_approve_spec.py` — "spec com item em aberto é recusada com os itens, sem mudar nada (CA-35)" |
| CA-35 | `test_approve_spec.py` — "spec com erro de validação é recusada com os erros, sem mudar nada (CA-35)" |
| CA-35 | `test_approve_spec.py` — "spec fora de rascunho é recusada com o status atual, sem mudar nada (CA-35)" |
| CA-35 | `test_approve_spec.py` — "problemas do bloco aparecem juntos numa execução só (CA-35)" |
| CA-35 | `test_approve_spec.py` — "spec reaprovada com task já iniciada fica em andamento, e sem task iniciada fica aprovada (CA-35)" |
| CA-35 | `test_validate_spec.py` — "Aprovada em sem data com status aprovada, em andamento ou concluída é erro; com rascunho, aceita rascunho ou a data (CA-35)" |
| CA-19 | `test_finish_spec.py` — "spec em andamento com todas as tasks concluídas ou canceladas fica concluída e a pasta vai para specs/done (CA-19)" |
| CA-19 | `test_finish_spec.py` — "spec com task aberta, bloqueada ou em andamento não é movida, e a saída lista as tasks que faltam (CA-19)" |
| CA-19 | `test_finish_spec.py` — "spec fora de em andamento é recusada com o status, sem mover a pasta (CA-19)" |
| CA-19 | `test_finish_spec.py` — "spec com erro de validação é recusada com os erros, junto das tasks pendentes, sem mover a pasta (CA-19)" |
| CA-19 | `test_finish_spec.py` — "destino já existente em specs/done é recusado, sem mover a pasta (CA-19)" |
| CA-19 | `test_validate_spec.py` — "Encerrada em sem data com status concluída é erro; nos outros status, aceita em aberto (CA-19)" |
| CA-19 | `test_lib.py` — "pendências da spec: item riscado é cancelada, item sem arquivo é pendente e task fora da lista conta (CA-19)" |
| CA-39 | `test_finish_spec.py` — "--listar mostra as tasks pendentes, o Ficou para depois e as notas do design, sem mudar nada (CA-39)" |
| CA-39 | `test_finish_spec.py` — "a recusa por task pendente e o caminho feliz também mostram as pendências versionadas (CA-39)" |
| CA-39 | `test_lib.py` — "pendências versionadas: Ficou para depois com nada ou nenhum fica de fora, e notas do design entram com a linha (CA-39)" |

Em Python, o nome do teste é a primeira linha da docstring.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/scripts/lib/testes`
- `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"`
- `rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes`
- `rtk python3 .agents/skills/spec/scripts/validate_spec.py .agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes`
- no fim: o bloco da base de achados que o "iniciar" grava no Andamento, copiado para
  `.agents/skills/governanca-workspace/base-04.txt`, e `rtk python3
  .agents/skills/governanca/scripts/governanca.py --comparar .agents/skills/governanca-workspace/base-04.txt`:
  sem erro novo
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../spec`
- **Mutação manual** (guia de testes, seção 5.2): tirar cada recusa do aprovar (status, validador, Em aberto) e
  do encerrar (status, validador, pendência, destino existente); parar no primeiro problema do bloco; mudar o
  arquivo antes das checagens; contar item riscado como pendente; deixar de contar item sem arquivo ou task fora da lista;
  aceitar `em andamento` como task encerrada; mover a pasta sem mudar o status (ou o contrário); reaprovar sempre
  como `aprovada`; aceitar `rascunho` em `Aprovada em` com status `aprovada`; aceitar `em aberto` em `Encerrada
  em` com status `concluída`; `--listar` mudando algum arquivo ou a pasta; tirar as pendências versionadas da
  recusa; contar "Ficou para depois: nada" como pendência; deixar de ler as notas do design; na lib, contar
  task em `done/` como não concluída no status da task de spec, tirar `cancelada` do conjunto de fechada, trocar
  o texto da recusa (o `test_start_task.py` precisa pegar). Todas devem ser detectadas por algum teste.
- **Checagem manual:** numa cópia de fixture no workspace da skill `spec`, rodar o `approve_spec.py` (uma recusa
  com item em aberto e o caminho feliz) e o `finish_spec.py` (uma recusa com task pendente e o caminho feliz);
  conferir o diff e o lugar da pasta; nenhum arquivo do repositório alterado.
- **Modo leve da oficina** (obrigatório): versão antiga × nova da skill `spec`, em ambiente fechado no workspace
  da skill, um subagente por vez, asserções fixadas antes de rodar, nenhum arquivo do repositório alterado
  (conferido). Perguntar ao Juno antes de rodar só para decidir quando: com o limite de tokens no fim, adiar para
  depois do reset e registrar o adiamento no Andamento. Sem o resultado no fechamento, a task não é encerrada.
  Cenários (Q4; o terceiro, do CA-39, é de julgamento, não de recusa: é o comportamento novo que só o texto da
  skill garante):
  1. "aprovado" para uma spec em `rascunho` com item em aberto. Asserções: roda o `approve_spec.py`; relata a
     recusa com o item; não muda o status nem o `Aprovada em` à mão.
  2. "encerra a spec" com uma task da lista ainda `em andamento`. Asserções: roda o `finish_spec.py`; lista a
     task que falta; não muda o status nem move a pasta à mão.
  3. "encerra a spec" com todas as tasks concluídas, um "Ficou para depois" preenchido numa delas e uma nota
     na lista do design. Asserções: roda o `--listar` antes; propõe um destino para cada item com o critério do
     CA-39; pergunta ao Juno; não roda o encerramento antes da resposta.

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

- 2026-11-24 — iniciar: aprovada pelo Juno; branch `docs/juno/fluxo-de-trabalho-dos-agentes-04` criada a partir da `main` no commit de base `7f5386e9`.
- 2026-11-24 — base de achados da governança (5):

```text
.agents/skills/spec/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'adr' citada, ainda não existe
.agents/skills/task/ORIGEM.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/ORIGEM.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
```

- 2026-11-24 — antes de começar (comandos da seção 3): lib 10 testes ok; spec 20 ok; task 96 ok; evals da task
  42 ok; governança 74 ok; `validate_spec.py` desta spec sem problema; `quick_validate.py ../spec` válido.
- 2026-11-24 — passo 0 feito: `spec_task_status`, `spec_tasks`, `status_of`, `TASK_FECHADA`,
  `closing_labels(texto, secao)` e `refusal_lines` na lib (nomes em inglês, como o resto da lib); o
  `create_task.py`, o `validate_task.py`, o `start_task.py`, a `coleta.py`/`registros.py` e o
  `create_design.py` (`read_status`) importam de lá. Suítes da lib, spec, task, evals e governança passaram
  sem mudar nenhum teste.
- 2026-11-24 — passos 1 a 6 feitos. As fixtures de spec ganharam duas linhas de metadado logo abaixo do
  "Atualizado em", e os números de linha do `spec.md` citados no `test_validate_spec.py` e no
  `test_create_design.py` subiram 2 (mudança de propósito, prevista no Impacto). Mutação manual: 28/28
  detectadas. Checagem manual em `spec-workspace/checagem-04/`: aprovar (recusa com item em aberto e caminho
  feliz) e encerrar (recusa com a 06 `em andamento` e caminho feliz, pasta em `specs/done/` da cópia) ok;
  nenhum arquivo do repositório mudou. `--comparar base-04.txt`: 0 erros novos, 0 avisos novos, 5 já
  existiam. Modo leve preparado em `spec-workspace/modo-leve-04/` (`montar.sh`, `asercoes.json`, asserções
  fixadas antes de rodar); aguardando o Juno dizer quando rodar.
- 2026-11-24 — modo leve adiado para depois do reset do limite de tokens (18:00), por decisão do Juno (limite
  da sessão em 79%). Sem o resultado, a task não é encerrada.
- 2026-11-24 — modo leve rodado depois do reset: 3 cenários × (antiga, nova), um subagente por vez, cada um
  num ambiente do `montar.sh` (cópia fechada com `git init`); `git status` limpo nos seis ambientes e o do
  repositório igual ao de antes. Asserções do `asercoes.json`:
  - cenário 1 (aprovar com item em aberto): antiga — A2, A3 ok (A1 não conta), mas planeja gravar o status e o
    `Aprovada em` à mão depois da resposta; nova — A1, A2, A3 ok: roda o `approve_spec.py`, relata a recusa
    com `spec.md:105` e, depois da resposta, roda o script de novo;
  - cenário 2 (encerrar com a 06 `em andamento`): antiga — B2, B3 ok (B1 não conta), acha a 06 lendo as
    tasks à mão, diz que a skill `encerramento` não existe e propõe mover a pasta à mão; nova — B1, B2, B3 ok:
    roda o `--listar` e descreve o caminho depois da 06 (rodada das pendências, encerramento na branch da
    última task);
  - cenário 3 (encerrar com pendências): antiga — C3, C4 ok (C1 não conta), C2 falha: acha as duas
    pendências, mas não cruza a paginação com o "Fica fora", propõe fazer o encerramento à mão e toma o
    "Encerra" como a aprovação; nova — C1 a C4 ok: roda o `--listar` antes de tudo, diz que a paginação
    contradiz o "Fica fora" (`spec.md:75`) e que o índice do TTL serve ao objetivo, propõe destino para cada
    uma (e para os itens do "Fica fora") numa rodada e só roda o encerramento depois do "pode encerrar".

## 5. Fechamento

- **O que foi feito:** passo 0 (o comum ao fluxo na lib, sem mudar comportamento nem teste); na lib, as
  pendências da spec (`spec_task_states`, `pending_tasks`) e as versionadas (`versioned_leftovers`,
  `task_list_notes`); `approve_spec.py` (rascunho → `aprovada` ou `em andamento` na reaprovação, com
  `Aprovada em`) e `finish_spec.py` (em andamento → `concluída`, `Encerrada em`, pasta para `done/`; `--listar`
  sem mudar nada); modelo `spec.md` com os dois metadados e o `validate_spec.py` cobrando-os; skill `spec`:
  passo 6 da fase 2 pelo script, seção 7 "Encerrar a spec" com a revisão das pendências (CA-39).
- **Arquivos alterados:** os previstos e mais nenhum: criados `approve_spec.py`, `finish_spec.py`,
  `test_approve_spec.py`, `test_finish_spec.py`; alterados `md_checks.py`, `test_lib.py`, `create_task.py`,
  `validate_task.py`, `start_task.py`, `coleta.py`, `registros.py`, `create_design.py`, `validate_spec.py`,
  `test_validate_spec.py`, `test_create_design.py`, o modelo `spec.md`, as seis fixtures de spec, os dois
  `spec-notificacoes-aprovada.md` dos evals, a `spec/SKILL.md`, o `spec.md` desta spec e esta task.
- **Decisões tomadas no caminho:**
  - nomes em inglês na lib (`spec_task_status`, `status_of`, `spec_tasks`, `TASK_FECHADA`, `closing_labels`,
    `refusal_lines`), como o resto dela; `TaskItem` ganhou `linha_fim` para separar item de nota;
  - nota do design = item de lista ou parágrafo, com as linhas recuadas juntadas (como o "Em aberto"), não
    cada linha; a linha "Notas para abrir as tasks:" também aparece como nota;
  - o "Ficou para depois" é lido das tasks de `tasks/` (as de spec não vão para `done/`);
  - destino = `done/` ao lado da pasta da spec (na spec real, `specs/done/`): a cópia de teste no workspace
    não move nada para dentro do repositório;
  - as fixtures ganharam duas linhas de metadado: os números de linha do `spec.md` no
    `test_validate_spec.py` e no `test_create_design.py` subiram 2 (previsto no Impacto); o passo 0 foi
    provado antes dessa troca;
  - o comentário do modelo `spec.md` diz que os dois metadados são gravados pelos scripts; a `description` e
    o passo 0 da skill `spec` citam o aprovar e o encerrar;
  - rodada do `--listar` com o Juno (2026-11-24): 1A — a frase de introdução do bloco de notas continua
    aparecendo como nota (a triagem a descarta), descartadas: ignorar parágrafo terminado em ":" (frágil) e
    subseção própria para as notas agora (fora dos previstos; vai para a 07); 2A — pendência que já diz o
    destino ("→ task 03") continua listada, e a triagem final confere se ele aconteceu, descartada: marcar a
    resolvida (riscada) para o script ignorar (convenção nova, fora do escopo; avaliar na 06 ou na 07).
- **Testes antes de começar:** lib 10, spec 20, task 96, evals 42, governança 74, todos OK; `validate_spec`
  desta spec sem problema; governança 0 erros, 5 avisos (base no Andamento).
- **Testes no fim:** lib 12, spec 37, task 96, evals 42, governança 74, todos OK; `validate_spec` desta spec
  sem problema; `quick_validate ../spec` válida; `--comparar base-04.txt`: 0 erros novos, 0 avisos novos, 5 já
  existiam. Mutação manual 28/28 (todas as da seção 3). Checagem manual em `spec-workspace/checagem-04/` ok.
  Modo leve (3 cenários, antiga × nova): a nova passa em todas as asserções (A1–A3, B1–B3, C1–C4); a antiga
  falha na C2 e não tem os scripts (A1, B1, C1 não contam); nenhum arquivo do repositório mudou (Andamento).
- **Evidência por critério:**
  - CA-35 → os seis testes do `test_approve_spec.py` da tabela e "Aprovada em sem data com status aprovada,
    em andamento ou concluída é erro; com rascunho, aceita rascunho ou a data (CA-35)" passando;
  - CA-19 → os cinco testes do `test_finish_spec.py` da tabela, "Encerrada em sem data com status concluída é
    erro; nos outros status, aceita em aberto (CA-19)" e "pendências da spec: item riscado é cancelada, item
    sem arquivo é pendente e task fora da lista conta (CA-19)" passando;
  - CA-39 → "--listar mostra as tasks pendentes, o Ficou para depois e as notas do design, sem mudar nada
    (CA-39)", "a recusa por task pendente e o caminho feliz também mostram as pendências versionadas (CA-39)" e
    "pendências versionadas: Ficou para depois com nada ou nenhum fica de fora, e notas do design entram com a
    linha (CA-39)" passando.
- **Checagens não feitas:** nenhuma.
- **Ficou para depois:** subseção própria para as notas da lista de tasks no modelo do design (`### Notas`),
  lida pelo `--listar` → task 07 (1C da rodada do `--listar`); marcar pendência já resolvida para o script
  não listá-la → avaliar na 06 ou na 07 (2B da mesma rodada); na abertura da 06, pôr a `task/SKILL.md` e o
  `task/ORIGEM.md` nos Arquivos previstos, com o objetivo de tirar a citação da skill `encerramento` (o modo
  encerrar da `task` substitui a skill planejada; no `ORIGEM.md`, nota de que o plano mudou, sem reescrever o
  histórico), o que remove os quatro avisos `governanca.skill-pendente` da base (sugestão aceita pelo Juno,
  2026-11-24).
- **Commits entregues:** (o `refactor` vem antes do `feat`, fora da ordem recomendada, porque o `feat` usa
  o que ele leva para a lib; o `md_checks.py` está nos dois e precisa do staging area da IDE: no primeiro,
  só a região "Status das tasks (de spec e avulsas) e rótulos do fechamento" e a função `refusal_lines`, na
  região "Resumo da saída"; o `__all__` vai inteiro no segundo, porque nenhum import depende dele)

  ```text
  refactor(agents): Leva para a lib o status das tasks e a recusa

  - spec_task_status, spec_tasks, status_of, TASK_FECHADA,
    closing_labels e refusal_lines saem do create_task, do
    validate_task, do start_task e da governança e vão para o
    md_checks, para o aprovar e o encerrar da spec usarem também;
  - create_design lê o status pelo read_status da lib;
  - nenhum comportamento nem teste muda.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/04-aprovar-e-encerrar-a-spec.md
  ```

  Arquivos:
  - `.agents/scripts/lib/md_checks.py` (só a região do passo 0 e a `refusal_lines`)
  - `.agents/skills/task/scripts/create_task.py`
  - `.agents/skills/task/scripts/validate_task.py`
  - `.agents/skills/task/scripts/start_task.py`
  - `.agents/skills/governanca/scripts/checagens/coleta.py`
  - `.agents/skills/governanca/scripts/checagens/registros.py`
  - `.agents/skills/spec/scripts/create_design.py`

  ```text
  feat(agents): Adiciona o aprovar e o encerrar da spec por script

  - approve_spec.py aprova a spec em rascunho sem item em aberto nem
    erro do validador e grava o "Aprovada em"; na reaprovação com task
    já iniciada, volta para em andamento;
  - finish_spec.py encerra a spec em andamento sem task pendente: grava
    concluída e o "Encerrada em" e move a pasta para specs/done/; com
    --listar, só mostra as tasks pendentes e as pendências versionadas
    (Ficou para depois das tasks e notas do design), sem mudar nada;
  - a recusa dos dois mostra todos os problemas juntos e não muda nada;
  - o modelo de spec ganha "Aprovada em" e "Encerrada em", cobrados
    pelo validate_spec conforme o status; fixtures, evals e o spec.md
    desta spec ganham as duas linhas (o deste também traz o status em
    andamento gravado pelo iniciar da task 04).

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/04-aprovar-e-encerrar-a-spec.md
  ```

  Arquivos:
  - `.agents/scripts/lib/md_checks.py` (o resto: pendências da spec e `linha_fim`/`task_list_notes`)
  - `.agents/scripts/lib/testes/test_lib.py`
  - `.agents/skills/spec/scripts/approve_spec.py`
  - `.agents/skills/spec/scripts/finish_spec.py`
  - `.agents/skills/spec/scripts/validate_spec.py`
  - `.agents/skills/spec/scripts/testes/test_approve_spec.py`
  - `.agents/skills/spec/scripts/testes/test_finish_spec.py`
  - `.agents/skills/spec/scripts/testes/test_validate_spec.py`
  - `.agents/skills/spec/scripts/testes/test_create_design.py`
  - `.agents/skills/spec/scripts/testes/aprovada-com-aberto/spec.md`
  - `.agents/skills/spec/scripts/testes/com-design/spec.md`
  - `.agents/skills/spec/scripts/testes/criterios-com-problemas/spec.md`
  - `.agents/skills/spec/scripts/testes/metadados-com-problemas/spec.md`
  - `.agents/skills/spec/scripts/testes/secoes-ausente-e-vazia/spec.md`
  - `.agents/skills/spec/scripts/testes/so-spec/spec.md`
  - `.agents/skills/spec/evals/files/spec-notificacoes-aprovada.md`
  - `.agents/skills/task/evals/files/spec-notificacoes-aprovada.md`
  - `.agents/docs/templates/spec.md`
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/spec.md`

  ```text
  docs(agents): Ensina a skill spec a aprovar e encerrar por script

  - o passo 6 da fase 2 aprova pelo approve_spec.py e diz o que fazer
    na recusa; a seção 6 cobre a reaprovação;
  - a seção 7 nova encerra a spec: --listar, destino de cada pendência
    proposto ao Juno numa rodada (serve ao objetivo e não contradiz o
    Fica fora) e o finish_spec.py só depois do "pode encerrar".

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/04-aprovar-e-encerrar-a-spec.md
  ```

  Arquivos:
  - `.agents/skills/spec/SKILL.md`

  ```text
  docs(agents): Fecha a task 04 da spec do fluxo de trabalho

  - task 04 (aprovar e encerrar a spec) concluída, com o fechamento, o
    modo leve e as pendências para a 06 e a 07 registrados.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/04-aprovar-e-encerrar-a-spec.md
  ```

  Arquivos:
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/04-aprovar-e-encerrar-a-spec.md`
