# Task: Encerrar e cancelar a task

- **Status:** `concluída`
- **Criado em:** 2026-11-24
- **Atualizado em:** 2026-11-27 — concluída (aprovada pelo Juno)
- **Tipo:** `feat`
- **Alcance:** `documentação`
- **Modo:** `agente implementa, Juno revisa`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** 04-aprovar-e-encerrar-a-spec.md, 05-iniciar.md
- **Branch:** `feat/juno/fluxo-de-trabalho-dos-agentes-06`

## 1. Contexto e critérios

### Problema

Depois do "aprovado" do Juno, o agente troca o status da task para `concluída` à mão (passo 8 do Fechar da skill
`task`), sem nenhuma checagem objetiva: nada confere se o fechamento está completo nem se a task deixou a
governança com um erro novo em relação à base que o "iniciar" grava no Andamento. A task avulsa concluída fica
na pasta das abertas até o Juno movê-la à mão para `tasks/done/`, num commit a mais. Cancelar uma task não tem
regra: o status muda à mão, a avulsa fica onde estiver e, numa task de spec, o item da lista do design não é
riscado. Ninguém avisa quando a task encerrada era a última pendência da spec. A skill `task` ainda manda mover
para `done/` uma skill `encerramento` que não vai existir (o plano mudou: o encerrar é um modo da skill `task`,
e o da spec ficou na skill `spec`, na 04), o que gera os quatro avisos `governanca.skill-pendente` da base.

### Objetivo

Um script na skill `task`, `finish_task.py`, rodado só depois da aprovação do Juno na conversa, com dois usos.
**Encerrar** (`finish_task.py caminho-da-task`): com a task `em andamento`, o fechamento sem erro do validador (como o
`--fechar`) e nenhum erro novo da governança em relação à base do Andamento, a task fica `concluída`, com
"Atualizado em" e uma entrada no Andamento ("aprovada pelo Juno"); a avulsa vai para `tasks/done/`, com o
caminho reescrito nas listas "Arquivos:" de "Commits entregues". **Cancelar** (`finish_task.py caminho-da-task --cancelar
"motivo"`): com a task `aberta`, `bloqueada` ou `em andamento` e um motivo, a task fica `cancelada`, com o motivo
no Andamento; a avulsa vai para `tasks/done/`; a de spec fica na pasta e o item dela na lista do design fica
riscado, com a data e o motivo. Nos dois usos, quando a task era a última pendência da spec, a saída avisa que a
spec pode ser encerrada na mesma branch. Qualquer checagem que falha para o script sem mudar nada, com todos os
problemas de uma vez. A skill `task` passa a mandar rodar o script (o Fechar só preenche e pede a revisão, e o
status sai do agente) e deixa de citar a skill `encerramento`.

### Referências

[spec.md](../spec.md) (CA-14, CA-15, CA-16, CA-34, CA-37 e CA-38; decisões da rodada 4 e da revisão do rascunho
sobre o encerrar, o cancelamento, o encerramento da spec na branch da última task e as tasks de spec canceladas)
e [design.md](../design.md) (decisão "um script por ação", tabela "Scripts e lib", "Ordem do encerrar", a decisão
da divisão da antiga 06 e a nota da 06 abaixo da lista de tasks: o texto do Iniciar e do Abrir na skill `task`);
tasks `05-iniciar.md` (o `start_task.py`, que grava a base, é o modelo do script) e
`04-aprovar-e-encerrar-a-spec.md` (`pending_tasks`, `refusal_lines` e o `finish_spec.py`; no "Ficou para
depois", tirar a citação da skill `encerramento` da skill `task`).

### Critérios de aceite

CA-14, CA-15, CA-16, CA-34, CA-37, CA-38

## 2. O que fazer nesta tarefa

### Fica fora

- a conferência dos commits feitos pelo Juno e o texto do merge (CA-17, CA-18, o formato no `commits.md`): task
  10 (Q1 desta abertura);
- marcar uma pendência já resolvida para o `--listar` da spec não mostrá-la (2B da 04): task 07 (Q2 desta
  abertura);
- qualquer comando de git que mude o repositório: o script só muda arquivos (status, Andamento, lugar da task,
  lista do design) e só lê a branch ativa (Q8); quem commita é o Juno, e a exceção da regra de Git continua só no `start_task.py` (CA-22);
- o encerramento da spec em si (o `finish_spec.py` e a seção 7 da skill `spec`, da 04): o script só avisa que
  ele pode rodar;
- cancelar um item da lista do design que ainda não tem arquivo (continua pela seção 6 da skill `spec`);
- o resto do `AGENTS.md` (só a linha da skill `task` na tabela muda, Q10), o `.agents/README.md` e os guias
  (task 08); a passada geral para enxugar a skill `task` (07);
- o eval completo da oficina na skill `task` (fica para a passada da 07; aqui, o modo leve e o ajuste do eval 7);
- o exemplo de item riscado da seção 6 da skill `spec`, que passa a divergir do formato da Q5: ajuste para a 07.

### Decisões

Vindas da spec e do design (não reabrir):

- Encerrar é um modo da skill `task`, com script — descartada: skill de encerramento própria — spec, rodada 4
  (2026-11-19).
- Quem marca `concluída` é o encerrar, depois da aprovação do Juno e só com a validação do fechamento passando;
  o Fechar deixa `em andamento` — spec, ajuste do Juno no resumo (2026-11-19).
- O encerrar move a task avulsa para `tasks/done/` antes dos textos de commit; a de spec fica na pasta —
  descartada: o Juno mover depois de commitar — spec, rodada 4 (2026-11-19).
- O encerrar compara com a base do Andamento e recusa com erro novo; erro antigo só é informado — spec, revisão do
  rascunho (2026-11-19).
- Cancelar pelo mesmo script: avulsa `cancelada` e em `tasks/done/`, só com o texto do commit de documentação que
  a move; de spec `cancelada`, na pasta, riscada na lista do design com data e motivo; motivo obrigatório —
  spec, revisão do rascunho (2026-11-19).
- O encerramento da spec roda na branch da task que fecha a última pendência (contada na hora, inclusive tasks
  que entraram na lista no meio do caminho); sem branch, vai para a `main` — spec, revisão do rascunho
  (2026-11-19).
- `finish_task.py` na skill `task`; o comum na lib — design, rodada 1 (2026-11-19).

Desta abertura (rodada de 2026-11-24):

- A antiga 06 vira a 06 (encerrar, cancelar, Fechar sem status) e a 10 (conferência e texto do merge), com o
  design atualizado — descartada: uma task só — Q1.
- Marcar pendência resolvida vai para a 07 — descartada: entrar na 06 (mexe no `finish_spec.py` e na skill
  `spec`, segunda skill com modo leve) — Q2.
- Sem a entrada "base de achados da governança" no Andamento, o encerrar recusa ("sem base de achados no
  Andamento"); a entrada com "nenhum" (o que o "iniciar" grava quando a governança não acha nada) é base vazia
  válida — descartada: comparar com base vazia (os erros antigos apareceriam como novos e esconderiam a causa) —
  Q3 (o Juno lembrou do caso "nenhum").
- Ao mover a avulsa, o script reescreve o caminho da task nas listas "Arquivos:" de "Commits entregues" e diz na
  saída que reescreveu — descartada: o agente editar à mão depois (dá para esquecer) — Q4.

Desta abertura (leitura do código, sem rodada própria):

- Uso: `finish_task.py caminho-da-task` encerra; `finish_task.py caminho-da-task --cancelar "motivo"` cancela (motivo vazio é
  recusa). A conferência entra como outra opção na 10 — derivado do "um script por ação" do design.
- Bloco único de checagens em cada uso, todos os problemas de uma vez, nada muda antes; saída pelo
  `refusal_lines` da lib ("Encerrar recusado" / "Cancelar recusado") e exit 1 na recusa — segue o
  `start_task.py` e o `finish_spec.py` (Q7 da 05 e da 04).
- Encerrar confere: status `em andamento`; `validate(…, fechar=True)` do `validate_task.py` sem erro; base do
  Andamento presente (Q3) e `compare` da governança sem erro novo (a governança roda como no `start_task.py`,
  pelo `run` importado); branch ativa igual ao campo Branch (Q8); avulsa: destino em `tasks/done/` ainda
  inexistente — derivado do CA-15 e do `finish_spec.py`.
- Cancelar confere: status `aberta`, `bloqueada` ou `em andamento`; motivo não vazio; avulsa: destino livre; de
  spec: o item da task na lista do design existe. Sem validador nem governança (não há implementação a
  conferir) — derivado do CA-34 e do CA-38.
- Textos gravados, sempre com a data do dia: encerrar → status `concluída`, "Atualizado em" com "concluída
  (aprovada pelo Juno)", Andamento "encerrada: aprovada pelo Juno; governança sem erro novo (N antigos)";
  cancelar → status `cancelada`, "Atualizado em" e Andamento com "cancelada pelo Juno: " e o motivo — segue o
  `set_updated_at` e o `add_progress_entry` da lib e o texto do `finish_spec.py`.
- Última pendência (CA-37, CA-38): só para task de spec, pelo `pending_tasks` da lib contado com a própria task já
  fechada; sem outra pendência, a saída diz que a spec pode ser encerrada nesta branch pela seção 7 da skill `spec`
  (no cancelamento, também que sem branch o commit vai para a `main`); com outra pendência, nenhum aviso.
- A skill `task` muda pela `oficina-de-skills`, com o modo leve obrigatório (seção 3) — regra do Juno de
  2026-11-23 (Q10 da 05).

Desta abertura (segunda rodada, 2026-11-24):

- Ao cancelar uma task de spec, o item inteiro da lista do design fica entre `~~` (o link, o "bloqueada por" e
  o "cobre"), seguido de " — cancelada em", a data do dia, dois-pontos e o motivo (o item de várias linhas é
  juntado numa só) — descartada: riscar só o link, como no
  exemplo da seção 6 da skill `spec` (o histórico perde o que a task cobria) — Q5. O exemplo da skill `spec`
  passa a divergir: ajuste para a 07 (fora daqui).
- Modo leve com três cenários, antiga × nova: "revisei, aprovado" numa avulsa com o fechamento completo (roda o
  `finish_task.py`, não muda o status à mão; CA-16); "terminei, fecha" com evidência completa (status continua
  `em andamento`, pede a revisão; CA-14); "cancela a task X porque Y" (roda o `--cancelar` com o motivo) —
  descartada: só os dois do script (o CA-14 não tem teste de script e o passo 8 do Fechar muda aqui) — Q6.
- O eval 7 da skill `task` ("aprovar-fechamento") é atualizado aqui: mesmo prompt, as asserções passam a
  esperar o `finish_task.py` (status pelo script, a avulsa em `done/`), com o `checks.py` e o `test_checks.py`
  acompanhando; o eval completo da oficina continua na 07 — descartada: deixar para a 07 (o eval descreveria o
  comportamento antigo até lá) — Q7.

Desta abertura (item do estacionamento do Juno "Ao abrir a 06", achado depois da aprovação, 2026-11-24):

- O encerrar recusa quando a branch ativa (`current_branch` do `git_fluxo.py`, só leitura) é diferente do campo
  Branch da task: "branch ativa X; a task é da Y" — descartada: deixar no estacionamento, com a conferência
  manual no Fechar (é a checagem objetiva que pega o encerrar na branch errada) — Q8. O cancelar não confere
  (task de spec cancelada sem branch é commitada na `main`, CA-38).
- A skill `task` ganha uma linha: ao retomar uma task `em andamento`, conferir a branch antes de implementar —
  descartadas: nada no texto (o script só pega no fim, quando corrigir custa mais); uma linha no `AGENTS.md`
  (fica sempre no contexto) — Q9.
- A linha da skill `task` na tabela "Skills" do `AGENTS.md` passa a "Abrir, iniciar, retomar, atualizar, fechar,
  encerrar ou cancelar uma task (avulsa ou de spec)": hoje ela só cita abrir, atualizar e fechar, e o agente que
  retoma uma task ou recebe o "aprovado" do fechamento pode não ler a skill — descartada: deixar para a 08 (até lá,
  o modo Encerrar e a Q9 dependeriam de o agente abrir a skill por conta própria) — Q10, pergunta do Juno; segue
  a Q6 da 05 (a 08 continua dona do resto do `AGENTS.md`).

### Em aberto

nada

### Passos

1. **Lib** (`.agents/scripts/lib/md_checks.py`): função que lê a base de achados da entrada do Andamento
   (o bloco ```text depois de "base de achados da governança (N):", ou "nenhum"; ausente → None), para o
   encerrar e, na 10, a conferência; função que reescreve um caminho nas listas "Arquivos:" de "Commits
   entregues"; função que risca o item NN da lista "## 6. Tasks" do design (pelas linhas do `TaskItem`), com a
   data e o motivo (Q5).
2. **`finish_task.py caminho-da-task`** (encerrar): bloco único (status, validador com o fechamento, base presente e sem erro
   novo, branch ativa igual à da task, destino livre na avulsa) → status, "Atualizado em", entrada no Andamento → avulsa: caminho reescrito nos
   "Commits entregues" e arquivo movido para `tasks/done/` (criada se faltar) → task de spec: aviso de última
   pendência. Saída: o que mudou, o caminho novo e os antigos da governança, ou "Encerrar recusado".
3. **`finish_task.py caminho-da-task --cancelar "motivo"`**: bloco único (status, motivo, destino ou item da lista) →
   status, "Atualizado em", Andamento → avulsa para `tasks/done/`; de spec, item riscado no design (Q5), com o
   "Atualizado em" do design (Q1 da implementação), e aviso de última pendência. Saída: o que mudou, ou "Cancelar recusado".
4. **Testes**: `test_finish_task.py` em `.agents/skills/task/scripts/testes/`, com a task (avulsa e de spec, com o
   design) montada num diretório temporário e a governança injetada (como o `test_start_task.py`); cada recusa
   confere que a task, o design e o lugar do arquivo não mudaram; os testes das funções novas da lib em
   `test_lib.py`.
5. **Modelo de task**: o comentário do fechamento deixa de citar "a futura skill de encerramento" e passa a dizer
   que o encerrar (`finish_task.py`) lê o fechamento.
6. **Skill `task`** (pela `oficina-de-skills`, texto direto para o agente): a `description` e o "Não use" deixam
   de citar a skill `encerramento`; o modo Encerrar (novo, curto) roda o script depois do "aprovado" e entrega
   os textos de commit; o cancelamento ("cancela a task X", com o motivo do Juno) roda o `--cancelar`; o passo 8
   do Fechar troca a mudança de status à mão pelo modo Encerrar; com o aviso de última pendência, o agente
   oferece o encerramento da spec (seção 7 da skill `spec`); a tabela "Qual modo?" ganha as linhas novas; nota
   da 06 no design: no Iniciar, a abertura precisa estar commitada e com push feitos pelo Juno antes, e o agente
   roda o script só quando o Juno pedir; no Abrir, "não inicie"; ao retomar uma task `em andamento`, conferir a
   branch antes de implementar (Q9). No `AGENTS.md`, só a linha da skill `task` na tabela (Q10), conferida
   pela skill `governanca`. No `ORIGEM.md`, as duas citações (linhas 35 e 43)
   dizem que o encerramento foi planejado como skill própria e virou o modo Encerrar desta skill (o da spec, a
   seção 7 da skill `spec`), sem a forma "skill `encerramento`" que a governança lê como skill citada: o
   histórico continua contado, e os quatro avisos `governanca.skill-pendente` (dois na `SKILL.md`, dois no
   `ORIGEM.md`) saem como corrigidos na comparação com a base. O eval 7 passa a
   esperar o `finish_task.py` (Q7). Base de achados coberta pela da task, modo leve (seção 3) e `quick_validate`.

### Ler antes de começar

- `.agents/skills/task/scripts/start_task.py` — blocos, recusa, governança injetável, entrada da base no
  Andamento (`_base_entry`) e `main()`
- `.agents/skills/task/scripts/testes/test_start_task.py` — como monta a task e a spec e confere que nada mudou
- `.agents/skills/spec/scripts/finish_spec.py` e `.agents/skills/spec/scripts/testes/test_finish_spec.py` — mover para `done/`, destino
  existente, `pending_tasks`
- `.agents/scripts/lib/md_checks.py` — `read_status`, `set_metadata`, `set_updated_at`, `add_progress_entry`,
  `section_body`, `closing_labels`, `task_list_items`/`TaskItem`, `pending_tasks`, `refusal_lines`
- `.agents/skills/governanca/scripts/governanca.py` — `run`, `read_base`, `compare`, `format_comparison`
- `.agents/skills/task/scripts/validate_task.py` — `validate(…, fechar=True)` e a checagem de "Commits
  entregues"
- `.agents/skills/task/SKILL.md` — tabela "Qual modo?", Abrir, Fechar (passos 5 a 8), Iniciar, Entrega
- `.agents/skills/task/ORIGEM.md` — as duas citações da skill `encerramento`
- `.agents/skills/task/evals/evals.json` e `.agents/skills/task/evals/checks.py` — eval 7 (Q7)
- `.agents/skills/spec/SKILL.md` — seção 7 (encerrar a spec), para onde o aviso de última pendência aponta
- `.agents/docs/templates/task.md` — comentário do fechamento
- `.agents/docs/guides/testing.md` — seção 3 (comandos dos scripts) e 5.2 (mutação manual)
- `.agents/skills/oficina-de-skills/SKILL.md` — modo leve
- `.agents/skills/governanca/SKILL.md` — conferir o conjunto antes de entregar mudança no `AGENTS.md` (Q10)
- `.agents/scripts/lib/git_fluxo.py` — `current_branch` (Q8)

### Arquivos previstos

- criados: `.agents/skills/task/scripts/finish_task.py`, `.agents/skills/task/scripts/testes/test_finish_task.py`;
- alterados: `.agents/scripts/lib/md_checks.py` e `.agents/scripts/lib/testes/test_lib.py` (base do Andamento,
  caminho nos "Commits entregues", item riscado); `.agents/skills/task/SKILL.md`; `.agents/skills/task/ORIGEM.md`;
  `.agents/docs/templates/task.md` (comentário do fechamento); `AGENTS.md` (linha da skill `task`, Q10); esta
  task;
- pela Q7: `.agents/skills/task/evals/evals.json`, `.agents/skills/task/evals/checks.py` e
  `.agents/skills/task/evals/test_checks.py` (eval 7); pela Q2 da implementação,
  `.agents/skills/task/evals/files/task-aceite-em-revisao.md` (a entrada da base no Andamento);
- o `design.md` desta spec só muda na abertura (link da 06, a 10 nova e a dependência da 08); o ambiente do modo
  leve fica no workspace da skill `task` (fora do git).

### Não deve mudar

- o comportamento do `start_task.py`, do `create_task.py`, do `validate_task.py`, do `finish_spec.py` e da
  governança (o `finish_task.py` importa deles, como o `start_task.py` já faz);
- o `git_fluxo.py` (o script só importa o `current_branch`, que já existe);
- a skill `spec`, o resto do `AGENTS.md` (Q10), o `.agents/README.md` e os guias (07, 08 e 10);
- as tasks concluídas e as tasks em `done/`; `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

- **Contrato da API:** não
- **Banco:** não
- **Front:** não
- **Permissões e segurança:** não — o script muda só arquivos da task e do design, sem git; a exceção da regra de
  Git continua só no `start_task.py`
- **Testes existentes que mudam de propósito:** sim — o eval 7 da skill `task` ("aprovar-fechamento") espera a
  mudança de status à mão e a task fora de `done/`, o oposto do encerrar: as asserções, o `_eval_7` do `checks.py` e os testes dele no
  `test_checks.py` mudam (Q7), e o arquivo de apoio dele ganha a base no Andamento (Q2 da implementação); os testes do
  `test_lib.py`, do `test_start_task.py` e do `test_finish_spec.py` não mudam (procurado: nenhum monta o
  comentário do fechamento do modelo nem a skill `encerramento`)
- **Documentação:** sim — linha da skill `task` na tabela do `AGENTS.md` (Q10); skill `task` (Encerrar, cancelar, Fechar sem status, notas do Iniciar e do Abrir, sem a
  skill `encerramento`), `ORIGEM.md` e o comentário do modelo de task; o design já ganhou a divisão na abertura

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
Andamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-14 | modo leve da skill `task` (cenário 2, Q6) — "fechar com evidência completa mantém em andamento e pede a revisão (CA-14)" |
| CA-15 | `test_finish_task.py` — "task fora de em andamento é recusada com o status, sem mudar nada (CA-15)" |
| CA-15 | `test_finish_task.py` — "fechamento com erro do validador é recusado com os erros, sem mudar nada (CA-15)" |
| CA-15 | `test_finish_task.py` — "erro novo da governança em relação à base recusa só com os novos, sem mudar nada (CA-15)" |
| CA-15 | `test_finish_task.py` — "task sem base de achados no Andamento é recusada; base 'nenhum' vale (CA-15)" |
| CA-15 | `test_finish_task.py` — "branch ativa diferente da branch da task é recusada, sem mudar nada (CA-15)" |
| CA-15 | `test_finish_task.py` — "problemas do bloco aparecem juntos numa execução só (CA-15)" |
| CA-16 | `test_finish_task.py` — "avulsa encerrada fica concluída, com Atualizado em e Andamento, vai para tasks/done e tem o caminho reescrito nos Commits entregues (CA-16)" |
| CA-16 | `test_finish_task.py` — "task de spec encerrada fica concluída e continua na pasta da spec (CA-16)" |
| CA-34 | `test_finish_task.py` — "avulsa aberta, bloqueada ou em andamento cancelada com motivo fica cancelada, com o motivo no Andamento, e vai para tasks/done (CA-34)" |
| CA-34 | `test_finish_task.py` — "cancelar sem motivo ou com status concluída é recusado, sem mudar nada (CA-34)" |
| CA-37 | `test_finish_task.py` — "encerrar a última pendência da spec avisa que a spec pode ser encerrada; com outra pendência, nenhum aviso (CA-37)" |
| CA-38 | `test_finish_task.py` — "task de spec cancelada fica na pasta, cancelada, e o item da lista do design fica riscado com data e motivo (CA-38)" |
| CA-38 | `test_finish_task.py` — "cancelar a última pendência da spec avisa o encerramento da spec e o commit na main sem branch (CA-38)" |

Em Python, o nome do teste é a primeira linha da docstring.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/scripts/lib/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"`
- `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes`
- `rtk python3 .agents/skills/spec/scripts/validate_spec.py .agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes`
- no fim: o bloco da base de achados que o "iniciar" grava no Andamento, copiado para
  `.agents/skills/governanca-workspace/base-06.txt`, e `rtk python3
  .agents/skills/governanca/scripts/governanca.py --comparar .agents/skills/governanca-workspace/base-06.txt`:
  sem erro novo (os quatro avisos `governanca.skill-pendente` da skill `encerramento` devem sair como corrigidos)
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../task`
- **Mutação manual** (guia de testes, seção 5.2): tirar cada recusa do encerrar (status, branch ativa, validador, base
  ausente, erro novo, destino existente) e do cancelar (status, motivo vazio, destino, item da lista); parar no
  primeiro problema do bloco; mudar o arquivo antes das checagens; tratar erro antigo como novo; tratar "nenhum"
  como base ausente; mover a avulsa sem mudar o status (ou o contrário); mover a task de spec; não reescrever o
  caminho nos "Commits entregues"; não riscar o item ao cancelar a de spec; avisar a última pendência com outra
  ainda aberta (e não avisar sem nenhuma); contar a própria task como pendente. Todas devem ser detectadas por
  algum teste.
- **Checagem manual:** numa cópia no workspace da skill `task`, encerrar uma avulsa (recusa por erro novo e
  caminho feliz) e cancelar uma task de spec (item riscado no design); conferir o diff e o lugar dos arquivos;
  nenhum arquivo do repositório alterado.
- **Modo leve da oficina** (obrigatório): versão antiga × nova da skill `task`, em ambiente fechado no workspace
  da skill, um subagente por vez, asserções fixadas antes de rodar, nenhum arquivo do repositório alterado
  (conferido). Com o limite de tokens no fim, adiar para depois do reset e registrar no Andamento; sem o
  resultado no fechamento, a task não é encerrada. Cenários (Q6):
  1. "revisei, aprovado" numa avulsa `em andamento` com o fechamento completo e a base no Andamento. Asserções:
     roda o `finish_task.py`; não muda o status nem move a task à mão; entrega os textos de commit com o caminho
     novo.
  2. "terminei, fecha a task" com a implementação e a evidência completas. Asserções: preenche o fechamento; o
     status continua `em andamento`; pede a revisão do Juno; não roda o `finish_task.py`.
  3. "cancela a task X porque Y" numa task de spec `aberta`. Asserções: roda o `--cancelar` com o motivo; não
     muda o status nem risca o item à mão; com o aviso de última pendência (se houver), oferece o encerramento da
     spec em vez de rodá-lo.

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

- 2026-11-25 — iniciar: aprovada pelo Juno; branch `feat/juno/fluxo-de-trabalho-dos-agentes-06` criada a partir da `main` no commit de base `ce8da902`.
- 2026-11-25 — base de achados da governança (5):

```text
.agents/skills/spec/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'adr' citada, ainda não existe
.agents/skills/task/ORIGEM.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/ORIGEM.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
```

- 2026-11-25 — testes antes da primeira edição (seção 3): lib 12 OK; scripts da `task` 96 OK; evals da `task` 42
  OK; scripts da `spec` 37 OK; governança 74 OK; `validate_spec.py` da spec sem problema; `quick_validate ../task`
  válido.
- 2026-11-25 — passos 1 a 6 implementados: lib (`progress_base`, `rewrite_commit_paths`, `strike_task_item`),
  `finish_task.py` e `test_finish_task.py`, comentário do modelo, `ORIGEM.md`, skill `task` (Encerrar,
  Cancelar, Retomar, Fechar sem status, notas do Abrir e do Iniciar), linha do `AGENTS.md` e eval 7. O encerrar
  valida o texto já encerrado (status `concluída`): só assim o validador acusa rótulo vazio e critério sem
  evidência, como o CA-15 pede (com `em andamento`, o `--fechar` aceita fechamento parcial).
- 2026-11-25 — mutação manual: 34 mutantes; 33 mortos de primeira; o vivo ("base procurada fora do Andamento")
  morreu depois de corrigir o teste da lib, que usava um texto fora do formato de entrada.
- 2026-11-25 — checagem manual numa cópia em `.agents/skills/task-workspace/modo-leve-06/checagem-manual/`
  (git e governança da cópia): recusa só com o erro novo; encerrar move a avulsa e reescreve o caminho;
  cancelar a 02 de notificações risca o item sem erro novo no `validate_spec`; o repositório real não mudou.
- 2026-11-25 — modo leve: ambiente (`montar.sh`) e asserções (`asercoes.json`) fixados em
  `.agents/skills/task-workspace/modo-leve-06/`, antes de rodar; aguardando o Juno dizer quando rodar.
- 2026-11-25 — rodada da implementação (Juno: 1A, 2A, 3A): o cancelar grava também o "Atualizado em" do design;
  o arquivo de apoio do eval 7 ganha `base de achados da governança: nenhum`; modo leve agora. Mutante novo
  (cancelar sem o "Atualizado em" do design) morto: 35 de 35.
- 2026-11-25 — modo leve rodado (6 subagentes, um por vez; resultado em
  `.agents/skills/task-workspace/modo-leve-06/resultado.md`): a nova passa nas 10 asserções; a antiga falha
  em A2, A3, C2 e C3 (status e design à mão, sem `done/`, sem oferecer o encerramento da spec) e passa em B1 a
  B3. Repositório real sem mudança dos subagentes.
- 2026-11-25 — fechamento: comandos da seção 3 de novo, todos verdes; governança `--comparar` com a base: 

```text
Já existiam antes da mudança (só informados):
.agents/skills/spec/SKILL.md:16 [AVISO] governanca.skill-pendente pendência: skill 'adr' citada, ainda não existe

Corrigidos:
.agents/skills/task/ORIGEM.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/ORIGEM.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe
.agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'encerramento' citada, ainda não existe

0 erro(s) novo(s), 0 aviso(s) novo(s), 1 já existiam, 4 corrigido(s)
```
- 2026-11-27 — encerrada: aprovada pelo Juno; governança sem erro novo (1 antigos).

## 5. Fechamento

- **O que foi feito:** `finish_task.py` na skill `task`, com o encerrar (status, validador no texto já
  encerrado, base do Andamento e governança sem erro novo, branch ativa, destino livre → `concluída`, Andamento,
  avulsa em `tasks/done/` com o caminho reescrito nos "Commits entregues") e o `--cancelar "motivo"` (status,
  motivo, destino ou item da lista → `cancelada`, avulsa em `done/`, item da spec riscado e "Atualizado em" do
  design); aviso de última pendência da spec nos dois. Na lib, `progress_base`, `rewrite_commit_paths` e
  `strike_task_item`. Skill `task` com os modos Encerrar, Cancelar e Retomar, o Fechar sem status, as notas
  do Abrir e do Iniciar e sem a skill `encerramento`; `ORIGEM.md`, comentário do modelo, linha do `AGENTS.md`
  (Q10) e o eval 7 (Q7).
- **Arquivos alterados:** os previstos, e mais o arquivo de apoio do eval 7
  (`evals/files/task-aceite-em-revisao.md`), pela Q2 da implementação. Fora do git: o ambiente do modo leve e
  da checagem manual em `.agents/skills/task-workspace/modo-leve-06/` e a `base-06.txt` da governança.
- **Decisões tomadas no caminho:**
  - o encerrar valida o texto já encerrado (status `concluída`): só assim o validador acusa rótulo vazio e
    critério sem evidência (CA-15); com `em andamento`, o `--fechar` aceita fechamento parcial;
  - Q1 (1A): ao cancelar uma task de spec, o script grava também o "Atualizado em" do design, com a
    data do dia, "task NN cancelada:" e o motivo (regra da seção 6 da skill `spec`); design sem a linha é recusa — descartada: só riscar;
  - Q2 (2A): o arquivo de apoio do eval 7 ganha `base de achados da governança: nenhum` no Andamento, senão o
    `finish_task.py` recusaria e os critérios novos nunca passariam — descartada: deixar para a 07;
  - Q3 (3A): modo leve rodado nesta sessão, sem adiar.
- **Testes antes de começar:** lib 12 OK; scripts da `task` 96 OK; evals da `task` 42 OK; scripts da `spec` 37
  OK; governança 74 OK; `validate_spec.py` sem problema; `quick_validate ../task` válido.
- **Testes no fim:** lib 16 OK; scripts da `task` 115 OK (19 do `test_finish_task.py`); evals da `task` 45 OK;
  scripts da `spec` 37 OK; governança 74 OK; `validate_spec.py` sem problema; `quick_validate ../task` válido;
  `governanca.py --comparar base-06.txt`: 0 erro novo, 0 aviso novo, 1 antigo, 4 corrigidos (os
  `governanca.skill-pendente` da skill `encerramento`). Mutação manual: 35 mutantes, 35 mortos (o único vivo da
  primeira passada morreu com o teste da lib corrigido). Checagem manual na cópia com git próprio: recusa só
  com o erro novo, encerrar e cancelar como esperado, repositório real sem mudança. Modo leve: nova 10/10.
- **Evidência por critério:**
  - CA-14 → modo leve, cenário 2: "fechar com evidência completa mantém em andamento e pede a revisão (CA-14)"
    passando na nova (B1 a B4);
  - CA-15 → testes "task fora de em andamento…", "fechamento com erro do validador…", "erro novo da
    governança…", "task sem base de achados…", "branch ativa diferente…" e "problemas do bloco aparecem
    juntos…" (CA-15) passando;
  - CA-16 → "avulsa encerrada fica concluída…" e "task de spec encerrada fica concluída…" (CA-16) passando;
  - CA-34 → "avulsa aberta, bloqueada ou em andamento cancelada…" e "cancelar sem motivo ou com status
    concluída…" (CA-34) passando;
  - CA-37 → "encerrar a última pendência da spec avisa…" (CA-37) passando;
  - CA-38 → "task de spec cancelada fica na pasta…" e "cancelar a última pendência da spec avisa…" (CA-38)
    passando.
- **Checagens não feitas:** nenhuma.
- **Ficou para depois:** cancelar a única task que cobre um grupo de `CA-NN` deixa a spec encerrável com
  critérios sem task, e nem o `finish_spec.py` nem a skill `spec` avisam (achado do modo leve, cenário 3: os
  dois agentes perceberam sozinhos) → decidir com o Juno (07 ou avulsa); o exemplo de item riscado da seção 6
  da skill `spec` diverge do formato da Q5 (já previsto para a 07).
- **Commits entregues:**

  ```text
  feat(agents): Adiciona o encerrar e o cancelar da task por script

  - finish_task.py encerra a task aprovada: confere status, fechamento
    já como concluída, governança contra a base do Andamento e a branch
    ativa num bloco só; grava concluída e move a avulsa para done/,
    com o caminho reescrito nos Commits entregues;
  - --cancelar "motivo" grava cancelada, move a avulsa para done/ e,
    na task de spec, risca o item do design e atualiza a data dele;
  - os dois avisam quando a task era a última pendência da spec;
  - a lib ganha a leitura da base do Andamento, a troca de caminho nos
    Commits entregues e o item riscado da lista de tasks;
  - o comentário do fechamento no modelo de task aponta o encerrar.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/06-encerrar-e-cancelar-a-task.md
  ```

  Arquivos:
  - `.agents/scripts/lib/md_checks.py`
  - `.agents/scripts/lib/testes/test_lib.py`
  - `.agents/skills/task/scripts/finish_task.py`
  - `.agents/skills/task/scripts/testes/test_finish_task.py`
  - `.agents/docs/templates/task.md`

  ```text
  docs(agents): Ensina a skill task o encerrar, o cancelar e o retomar

  - a skill task ganha os modos Encerrar e Cancelar pelo finish_task.py
    e a conferência da branch ao retomar; o Fechar não muda o status;
  - o Abrir não inicia, e o Iniciar só roda com a abertura commitada;
  - sai a citação da skill encerramento, que virou o modo Encerrar;
  - o eval 7 passa a esperar o finish_task.py, e o arquivo de apoio
    dele ganha a base no Andamento;
  - a linha da skill task na tabela do AGENTS.md cobre todos os modos.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/06-encerrar-e-cancelar-a-task.md
  ```

  Arquivos:
  - `.agents/skills/task/SKILL.md`
  - `.agents/skills/task/ORIGEM.md`
  - `.agents/skills/task/evals/evals.json`
  - `.agents/skills/task/evals/checks.py`
  - `.agents/skills/task/evals/test_checks.py`
  - `.agents/skills/task/evals/files/task-aceite-em-revisao.md`
  - `AGENTS.md`

  ```text
  docs(agents): Fecha a task 06 da spec do fluxo de trabalho

  - task 06 (encerrar e cancelar a task) com o fechamento, a mutação, a
    checagem manual e o modo leve registrados.

  Task: 2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/06-encerrar-e-cancelar-a-task.md
  ```

  Arquivos:
  - `.agents/docs/specs/2026-11-19-fluxo-de-trabalho-dos-agentes/tasks/06-encerrar-e-cancelar-a-task.md`
