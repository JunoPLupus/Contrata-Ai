# Task: Iniciar

- **Status:** `aberta`
- **Criado em:** 2026-11-20
- **Atualizado em:** 2026-11-23 — Q6 a Q11 decididas, campo Branch só com o nome, modo leve obrigatório antes
  do encerramento e releitura antes da aprovação
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Modo:** `agente implementa, Juno revisa`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** 02-modelo-e-validador-de-task.md, 03-modelos-e-validador-de-spec-e-design.md, 09-base-de-achados.md
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-05` (sugerida; criada pelo Juno)

## 1. Contexto e critérios

### Problema

Hoje, começar uma task é manual: o Juno dá o pull na `main`, cria a branch e ninguém muda o status de
`aberta` para `em andamento` (ou o agente muda à mão, sem checagem). Nada impede começar uma task com decisão em
aberto, com erro de validação ou com o repositório num estado inseguro (mudanças pendentes, fora da `main`,
`main` divergente do GitHub, como no pós-merge da 01). A base de achados da governança é salva à mão (o
`--salvar-base` das tasks 02, 03 e desta), e o status da spec não passa a `em andamento` quando a primeira task
começa. O sinal de que a task talvez seja spec (impacto no banco, no contrato, em muitos eixos) depende só do
julgamento do agente. E, depois de uma rodada de decisões, trechos da task continuam dizendo a versão antiga (o
"depende de Qn" esquecido, um Objetivo que não acompanhou a decisão), e nada pede a releitura antes da
aprovação.

### Objetivo

Um `start_task.py` na skill `task` que, depois da aprovação do Juno, faz o "iniciar" na ordem do design:
confere a task, a spec e o repositório em dois blocos (a task primeiro, o repositório depois), mostra todos os
problemas do bloco e para sem mudar nada; atualiza a `main` só por fast-forward; salva a base de achados no
Andamento; cria a branch; marca a task `em andamento` (e a spec, na primeira task); e avisa, sem bloquear,
quando a regra dos eixos aponta um critério de spec. O que é comum ao fluxo (metadados, entrada no Andamento,
itens do "Em aberto", comandos de git) fica na lib, para o "encerrar" (06) e os scripts da spec (04) usarem. A
task chega ao iniciar já relida: a skill manda reler antes da aprovação, e o validador acusa decisão
respondida e não aplicada.

### Referências

[spec.md](../spec.md) (CA-05 a CA-13 e CA-36; decisões de produto da rodada 4 e da revisão do rascunho sobre o
"iniciar", a `main` por fast-forward e o status da spec) e [design.md](../design.md) (decisões técnicas
fechadas, "Ordem do iniciar" na seção 2, estratégia de testes, lista de tasks); no projeto doe-palmas, o script
que cria a branch de uma task aprovada (`create_task_implementation_branch.py`), referência da ideia (lá não
confere decisão em aberto).

### Critérios de aceite

CA-05, CA-06, CA-07, CA-08, CA-09, CA-10, CA-11, CA-12, CA-13, CA-36

## 2. O que fazer nesta tarefa

### Fica fora

- o "encerrar", o cancelamento, a conferência dos commits e a leitura da base do Andamento (task 06);
- aprovar e encerrar a spec por script (`approve_spec.py`, `finish_spec.py`: task 04); aqui só a passagem de
  `aprovada` para `em andamento` (CA-36);
- no `AGENTS.md`, tudo além da frase da exceção na regra de Git (o fluxo novo, a governança na tabela), o
  `.agents/README.md` e os guias (task 08), e a busca de que só o "iniciar" muda o repositório (CA-22, task 08);
- a oficina usar a base do Andamento em vez do arquivo do workspace (task 08);
- o passo de leitura e o checklist de alcance (task 07);
- push, PR e merge: continuam com o Juno; o script não faz push da branch nova;
- a branch desta própria task: criada pelo Juno (a 05 é a última no fluxo manual);
- enxugar a `task/SKILL.md` além do que a 05 toca (07, Q8); a regra do modo leve obrigatório no validador e
  no texto da oficina (07, Q10).

### Decisões

Vindas da spec e do design (não reabrir):

- O "iniciar" é um modo da skill `task`, com o trabalho objetivo num script; o agente só roda depois da
  aprovação do Juno na conversa — spec, rodada 1 e fluxo descrito pelo Juno (2026-11-19).
- O script cria a branch a partir da `main` atualizada só por fast-forward; a recusa por divergência, rede ou
  autenticação é a própria falha do `git pull --ff-only`, com a mensagem do Git — spec, rodada 4 e ajuste no
  resumo (2026-11-19).
- "Em aberto" diferente de "nada" faz o "iniciar" recusar — descartada: reaproveitar `bloqueada` — spec,
  rodada 1 (2026-11-19).
- O Andamento recebe a aprovação, a branch e o commit de base — spec, rodada 4 (2026-11-19).
- A primeira task põe a spec `em andamento`; task de spec só inicia com a spec `aprovada` ou `em andamento` —
  spec, revisão do rascunho (2026-11-19).
- `start_task.py` na skill `task`; o comum (status, "Atualizado em", entrada no Andamento, git) em
  `.agents/scripts/lib/` — descartada: um `fluxo.py` com subcomandos — design, rodada 1 (2026-11-19).
- A base de achados fica num bloco fixo dentro do Andamento — descartadas: JSON fora do git; arquivo e bloco
  juntos — design, rodada 1 (2026-11-19).
- Testes de git com git real, repositório temporário e remoto `git init --bare`; a falha de rede é simulada
  apagando o remoto — descartada: mock do subprocess — design, rodada 2 (2026-11-19).
- Aviso de possível spec pela regra fixa dos eixos: banco "sim" → critério 1; contrato da API "sim" → critério
  4; quatro ou mais eixos "sim" → critério 3; só avisa, não bloqueia — descartada: o agente marcar os critérios
  — design, rodada 3 (2026-11-19).
- Nome da branch pelo padrão `tipo/juno/assunto` (avulsa: nome do arquivo sem a data; de spec: assunto da spec
  + `-NN`) — design, derivado do `validate_task.py` (2026-11-19).
- A 05 é a última task com base de achados manual (`--salvar-base` antes, `--comparar` no fim) — Q6 da 02
  (2026-11-20).

Desta abertura (leitura do design e do código, sem rodada própria):

- O nome da branch é montado pelo script com o padrão acima (Tipo da task + assunto), e o campo Branch é
  regravado com ele; o texto que o `create_task.py` deixou ali não decide nada — derivado da decisão do design
  sobre o nome (2026-11-20).
- A leitura dos itens do "Em aberto" (`open_items`, hoje no `validate_spec.py`, presa à seção da spec) vai para
  a lib, recebendo a seção, e serve à spec e à task — mesmo motivo da Q4 da 03: duas cópias divergem
  (2026-11-20).
- "Commit de base" é o SHA da `main` depois do pull, do qual a branch sai; "primeira task da spec" é a spec
  ainda `aprovada` no momento do "iniciar" (o script não conta tasks) — derivado do CA-05 e do CA-36
  (2026-11-20).
- O texto do modo Iniciar na skill `task` entra aqui (a tabela "Skills e instruções" do design dá à skill
  `task` o iniciar; o Fica fora da 02 o deixou para a 05) — derivado do design (2026-11-20).

Desta abertura (rodada de 2026-11-20):

- Bloco da base no Andamento: entrada `- AAAA-MM-DD — base de achados da governança (N):` seguida de um bloco
  `text` com as linhas no formato do arquivo do `--salvar-base` (o `read_base` da 09 lê); sem achado, a entrada
  diz "nenhum" e não tem bloco — descartada: lista Markdown, um achado por item (parser novo, e os itens se
  confundem com as entradas do Andamento) — Q2, 2026-11-20.
- O `start_task.py` importa `run` e `format_base` do `governanca.py`, com a governança injetável nos testes —
  descartada: subprocesso com `--salvar-base` num arquivo temporário (mais lento, e o teste dependeria do
  repositório real) — Q3, 2026-11-20; segue a rodada 2 do design (a governança importa o `validate()`).
- A aprovação é registrada sem argumento: o script grava "aprovada pelo Juno" com a data, e a skill manda rodar
  só depois do "aprovado" na conversa — descartada: opção obrigatória `--aprovada-pelo-juno` (quem a passa é o
  próprio agente; não prova nada) — Q4, 2026-11-20.
- O "(sugerida; criada pelo Juno)" sai nesta task, no `create_task.py`, no modelo `task.md` e no passo 1.4 da
  skill; os arquivos de eval de tasks antigas ficam como estão — descartada: deixar para a 08 (toda task nova
  contradiria o "iniciar" já existente) — Q5, 2026-11-20. Ajuste do Juno (2026-11-23): o campo Branch traz só o
  nome, sem dizer quem cria — descartada: "(sugerida; criada pelo iniciar)" (o status já diz se a branch existe,
  `aberta` ou `em andamento`, e a entrada do iniciar no Andamento registra a criação, a data e o commit de base).
- A regra dos eixos mora na lib; o `start_task.py` a chama, e o `validate_task.py` também, só pela linha de
  comando (`main()`), fora do `validate()`: o "atualizar" já roda o validador, e a governança (que importa o
  `validate()`) não vê o aviso nem o guarda na base — descartadas: achado de aviso dentro do `validate()` (a
  governança mostraria o aviso em toda execução para toda task viva com banco ou contrato "sim", sem como
  silenciar depois da decisão do Juno); comando à parte para o "atualizar" (passo a mais para o agente lembrar)
  — Q1, 2026-11-20.
- A exceção da regra de Git entra no `AGENTS.md` já nesta task, numa frase: o `start_task.py`, rodado depois
  da aprovação do Juno, atualiza a `main` com `git pull --ff-only` e cria a branch da task, e o agente não roda
  esses comandos à mão; o resto do texto e a prova do CA-22 continuam na 08, avisada por uma nota na lista do
  design — descartadas: só a skill explicar a exceção até a 08 (a contradição continua no arquivo de mais peso,
  e uma skill se autorizando a contrariar a regra geral abre precedente); deixar tudo para a 08 (a 04 e a 06
  passariam pelo "iniciar" com a regra proibindo o que a skill manda fazer) — Q6, 2026-11-23 (o Juno apontou
  a contradição; ajusta a divisão da tabela "Skills e instruções" do design, que dava o texto todo à 08).
- As checagens de leitura do "iniciar" vão em dois blocos, cada um mostrando todos os problemas dele: primeiro
  o da task (status, spec, validador, Em aberto); só com a task ok, o do repositório (árvore limpa, na `main`,
  branch inexistente); o pull só depois dos dois; nada muda antes disso; a "Ordem do iniciar" do design acompanha
  — descartadas: parar na primeira checagem (uma execução por problema); todas as checagens de leitura juntas
  (mostra problemas que são consequência de outro, como "branch já existe" numa task `em andamento`, e o estado
  do repositório fica velho assim que a task é corrigida, porque a correção suja a árvore) — Q7, 2026-11-23 (o
  Juno perguntou se seria preciso rodar o script várias vezes).
- A 05 só escreve na `task/SKILL.md` o que toca (modo Iniciar, passo 1.4, aviso no Atualizar); a passada geral
  para enxugar o arquivo inteiro fica para a 07, depois da 06, provada pelo eval completo da oficina já anotado
  para ela — descartadas: só o que a 05 toca, sem passada geral (o arquivo continua com 301 linhas); enxugar o
  Abrir e o Atualizar já aqui (a 06 reescreve o Fechar e o corte seria refeito, e um ou dois cenários de modo
  leve não provam que o corte não perdeu nada) — Q8, 2026-11-23 (pedido do Juno: skill mais enxuta sem perder o
  que importa).
- Modo leve da oficina obrigatório em toda mudança de `SKILL.md`; sem o resultado no fechamento, a task não é
  encerrada; limite de tokens só adia o modo leve (para depois do reset), nunca dispensa. Na 05, vale já (seção
  3). A regra por script (abertura: `SKILL.md` nos Arquivos previstos exige o modo leve na seção 3; fechamento:
  exige o resultado) e o texto da oficina ficam para a 07, com nota na lista do design — descartadas: só texto na
  skill `task` e na oficina (o lembrete por texto vem falhando); só a memória do agente (fora do git, não vale
  para outras ferramentas) — Q10, 2026-11-23 (o Juno apontou que o agente esquece o modo leve com frequência).
- Modo leve com dois cenários: o "iniciar" recusado por item em aberto e o "atualizar" que dispara o aviso de
  spec; nenhum dos dois chega a comando de git — descartadas: só o do "iniciar" (o aviso no "atualizar" é o outro
  comportamento que a 05 muda); também o caminho feliz do "iniciar" (exige repositório git próprio no ambiente,
  com risco de pull e branch no repositório real se mal montado; a versão antiga não tem "iniciar" para comparar;
  o caminho feliz já tem a checagem manual com o script) — Q9, 2026-11-23.
- Informação desatualizada na task é conferida antes da aprovação: o fim do Abrir e do Atualizar manda reler a
  task inteira contra as decisões novas antes de pedir a aprovação; no Iniciar, o agente não edita a task (a
  aprovação vale para o texto commitado): se achar algo desatualizado, para e mostra ao Juno. A parte objetiva
  vira regra no `validate_task.py`: "depende de Qn" fora de código com "Em aberto" igual a "nada" é erro
  (decisão respondida e não aplicada, ligada ao CA-07; o iniciar a pega pelo validador). Amplia o que a 05
  escreve na skill (Q8) com esses dois trechos — descartadas: releitura só no Iniciar, antes do script
  (corrigir ali invalida a aprovação e suja a árvore); só texto, sem a regra (o lembrete por texto vem
  falhando, Q10) — Q11, 2026-11-23 (proposta do Juno: conferir informação desatualizada antes do iniciar).

### Em aberto

nada

### Passos

1. **Lib** (`.agents/scripts/lib/`): trocar o valor de um metadado (Status, Branch) e o "Atualizado em";
   acrescentar uma entrada datada no fim do Andamento; `open_items` recebendo a seção (sai do
   `validate_spec.py`, que passa a importar); módulo novo de git do fluxo (árvore limpa com a lista de
   pendentes, branch atual, branch existe, `pull --ff-only` devolvendo a mensagem do Git, `switch -c`, SHA do
   `HEAD`), sem nenhum comando além desses.
2. **Regra dos eixos e decisão não aplicada** — eixos (CA-13): função que lê os seis eixos do Impacto e
   devolve os critérios de spec que parecem valer (1, 4, 3), com o motivo. Chamada pelo `start_task.py` e pelo
   `main()` do `validate_task.py`, que imprime o aviso depois dos achados e da linha de resumo, sem mudar o
   exit; o aviso não entra no `validate()` (Q1).
   **Decisão não aplicada** (Q11, CA-07): no `validate()` do `validate_task.py`, "depende de Q" seguido de
   número, fora de código e de comentário, com "Em aberto" igual a "nada", é erro com a linha (código
   `task.decisao-nao-aplicada`); com item no "Em aberto", o marcador é aceito.
3. **`start_task.py <caminho-da-task>`** na ordem do design, sem mudar nada antes de todas as checagens
   passarem (Q7): **bloco da task**, todos os problemas juntos — status `aberta` (CA-06), (task de spec) spec
   `aprovada` ou `em andamento` (CA-36), validador sem erro (CA-08), "Em aberto" igual a "nada" (CA-07; sem a
   subseção, fica com o erro do validador) → só com a task ok, **bloco do repositório**, todos juntos — árvore
   limpa (CA-09), na `main` (CA-10), branch inexistente (CA-11) → `git pull --ff-only` (CA-12) → governança
   e base (passo 4) → `git switch -c` → task `em andamento`, Branch, "Atualizado em" e entrada no Andamento
   com a data, "aprovada pelo Juno" (sem argumento, Q4), a branch e o commit de base (CA-05) → spec
   `em andamento` se estava `aprovada`, com "Atualizado em" (CA-36) → aviso dos eixos (CA-13). Saída: o que
   fez, ou a recusa com os problemas do bloco; exit 1 na recusa.
4. **Base no Andamento** (CA-05): a governança roda na `main` atualizada, importada (`run` e `format_base`,
   Q3), e os achados vão para o bloco `text` da entrada da base (Q2); sem achado, a entrada diz "nenhum".
   Erros antigos não impedem o "iniciar".
5. **Testes** (`.agents/skills/task/scripts/testes/test_start_task.py`, mais os da lib): repositório temporário
   com remoto `--bare`; um teste por recusa conferindo que o arquivo da task, a spec, a branch atual e a lista
   de branches não mudaram; o pull que falha por divergência e por remoto apagado; a governança injetável
   para o teste não depender do repositório real.
6. **Skill `task`**: modo Iniciar curto (linha na tabela do passo 0 e uma seção: quando rodar, o comando, o
   que fazer com a recusa e com o aviso de spec); o passo 5 do "atualizar" diz o que fazer com o aviso que o
   validador mostra (reavaliar e perguntar ao Juno; Q1); o passo 1.4 acompanha a Q5 (passo 7); o fim do
   Abrir e do Atualizar manda reler a task inteira contra as decisões novas antes de pedir a aprovação, e o
   Iniciar diz que o agente não edita a task: se achar algo desatualizado, para e mostra (Q11). O resto não é
   enxugado aqui (passada geral na 07, Q8; o "fechar" é da 06). Texto novo curto e direto, para o agente.
   Pela `oficina-de-skills`: base de achados coberta pela da task (passo 9), modo leve obrigatório (seção 3)
   e `quick_validate`.
7. **"Criada pelo Juno"** (Q5): o `create_task.py` passa a gravar só o nome da branch, sem o parêntese; o
   "iniciar" regrava o campo do mesmo jeito; o modelo `task.md` (`<nome da branch, criada pelo Juno>`) e o
   passo 1.4 da skill acompanham (a skill diz que o "iniciar" cria a branch); os testes e a fixture que
   esperam o texto antigo mudam de propósito.
8. **`AGENTS.md`** (Q6): só a frase da exceção na regra de Git ("Regras de trabalho"), restrita ao
   `start_task.py` e à aprovação do Juno; antes de entregar, a skill `governanca` (a tabela de skills do
   `AGENTS.md` pede isso para mudança nele).
9. **Base de achados desta task**: salvar antes da primeira edição e comparar no fim (seção 3).

### Ler antes de começar

- `.agents/scripts/lib/md_checks.py` — `read_status`, `check_updated_at`, `subsections`, `subsection_body`,
  `labels`, `check_impact_axes`, `task_list_items`
- `.agents/scripts/lib/md_utils.py` e `.agents/scripts/lib/projeto.py` — `mask_code`, `get_project_root`,
  `slugify`
- `.agents/skills/task/scripts/validate_task.py` — `validate()`, `task_type`, `spec_dir`, `task_branch`,
  `progress_entries`, `check_progress`
- `.agents/skills/task/scripts/create_task.py` — como monta a branch sugerida e o assunto da spec
- `.agents/skills/spec/scripts/validate_spec.py` — `open_items` e `_check_status`
- `.agents/skills/governanca/scripts/governanca.py` — `run`, `format_base`, `read_base`, `--salvar-base`
- `.agents/skills/governanca/scripts/testes/test_governanca.py` — como monta repositório temporário
- `.agents/skills/task/scripts/testes/test_validate_task.py` e `test_create_task.py` — fixtures de task e o par
  de spec e design dos evals
- `.agents/skills/task/SKILL.md` — modos atuais (Abrir, Atualizar, Fechar), o passo 1.4 (branch, conferência
  e mensagem ao entregar) e os passos 4 a 6 do Atualizar
- `.agents/docs/templates/task.md` — Branch, Andamento
- `.agents/docs/guides/testing.md` — seção 3 (comandos dos scripts) e 5.2 (mutação manual)
- `AGENTS.md` — regra de Git em "Regras de trabalho"; `.agents/skills/governanca/SKILL.md` — conferência
  antes de entregar mudança no `AGENTS.md`
- `.agents/skills/oficina-de-skills/SKILL.md` — modo leve e base de achados (a rodada da 03 está no Andamento
  da task `03-modelos-e-validador-de-spec-e-design.md`)

### Arquivos previstos

- criados: `.agents/skills/task/scripts/start_task.py`; `.agents/skills/task/scripts/testes/test_start_task.py`;
  o módulo de git da lib (nome decidido na implementação, em `.agents/scripts/lib/`);
- alterados: `.agents/scripts/lib/md_checks.py` (metadados, Andamento, `open_items`, regra dos eixos) e
  `.agents/scripts/lib/testes/test_lib.py`; `.agents/skills/spec/scripts/validate_spec.py` (importa
  `open_items` da lib); `.agents/skills/task/SKILL.md` (modo Iniciar, passo 1.4, fim do Abrir e do Atualizar); esta task;
- pela Q5: `.agents/skills/task/scripts/create_task.py`, `.agents/docs/templates/task.md`,
  `test_create_task.py`, `test_validate_task.py` e `.agents/skills/task/scripts/testes/avulsa-ok.md`;
- pela Q1 e Q11: `.agents/skills/task/scripts/validate_task.py` (o aviso no `main()` e a regra da decisão não
  aplicada);
- pela Q6: `AGENTS.md` (só a frase da exceção);
- o `design.md` desta spec já foi ajustado na abertura (ordem do iniciar, notas da 07 e da 08) e não muda na
  implementação; o ambiente do modo leve fica no workspace da skill `task` (fora do git).

### Não deve mudar

- o `AGENTS.md` além da frase da exceção, o `.agents/README.md` e os guias (task 08);
- a governança (`governanca.py` e `checagens/`): o `start_task.py` importa `run` e `format_base` como estão
  (Q3);
- as regras do `validate_task.py` e do `validate_spec.py`, salvo a mudança de lugar do `open_items`, o aviso no
  `main()` do `validate_task.py` (Q1) e a regra da decisão não aplicada (Q11); fora isso, o `validate()` dos
  dois devolve os mesmos achados;
- as tasks concluídas e as tasks em `done/`; `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

- **Contrato da API:** não
- **Banco:** não
- **Front:** não
- **Permissões e segurança:** sim — um script passa a mudar o repositório (`git pull --ff-only` e
  `git switch -c`), só depois das checagens e só no "iniciar"; a regra de Git do `AGENTS.md` ganha a exceção
  restrita a esse script (Q6)
- **Testes existentes que mudam de propósito:** sim — `test_validate_spec.py` só se o `open_items` mudar de
  assinatura ao ir para a lib; pela Q5, os de `test_create_task.py` (3) e `test_validate_task.py` (1) que
  esperam "(sugerida; criada pelo Juno)" e a fixture `avulsa-ok.md`; a regra da Q11 não muda nenhum (fora dos
  workspaces, nenhum arquivo de `.agents/` tem "depende de Q" seguido de número; conferido na abertura)
- **Documentação:** sim — skill `task` (modo Iniciar, passo 1.4, aviso e releitura no Atualizar, releitura no
  fim do Abrir), o modelo `task.md` (Q5) e a frase da exceção na regra de Git do `AGENTS.md` (Q6)

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
Andamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-05 | `test_start_task.py` — "iniciar no caminho feliz avança a main, cria a branch e marca a task em andamento com a entrada no Andamento (CA-05)" |
| CA-05 | `test_start_task.py` — "a base da governança vai para o Andamento e erro antigo não impede o iniciar (CA-05)" |
| CA-06 | `test_start_task.py` — "task com status diferente de aberta é recusada com o status, sem mudar nada (CA-06)" |
| CA-06 | `test_start_task.py` — "problemas do mesmo bloco aparecem juntos e o bloco do repositório só roda com a task ok (CA-06)" |
| CA-07 | `test_start_task.py` — "task com item em aberto é recusada com os itens, sem mudar nada (CA-07)" |
| CA-07 | `test_validate_task.py` — "'depende de Qn' sobrando com 'Em aberto' igual a 'nada' é acusado com a linha, e com item em aberto é aceito (CA-07)" |
| CA-08 | `test_start_task.py` — "task com erro de validação é recusada com os erros, sem mudar nada (CA-08)" |
| CA-09 | `test_start_task.py` — "repositório com mudanças pendentes é recusado com os arquivos, sem mudar nada (CA-09)" |
| CA-10 | `test_start_task.py` — "fora da main é recusado com a branch atual, sem mudar nada (CA-10)" |
| CA-11 | `test_start_task.py` — "branch da task já existente é recusada, sem mudar nada (CA-11)" |
| CA-12 | `test_start_task.py` — "main divergente do remoto é recusada com a mensagem do git, sem criar a branch (CA-12)" |
| CA-12 | `test_start_task.py` — "remoto inacessível é recusado com a mensagem do git, sem criar a branch (CA-12)" |
| CA-13 | `test_lib.py` — "a regra dos eixos aponta o critério 1 com banco, o 4 com contrato e o 3 com quatro eixos sim (CA-13)" |
| CA-13 | `test_start_task.py` — "o aviso de possível spec aparece e não impede o iniciar (CA-13)" |
| CA-13 | `test_validate_task.py` — "o validador pela linha de comando mostra o aviso de possível spec sem mudar o exit, e o validate() não o devolve (CA-13)" |
| CA-36 | `test_start_task.py` — "a primeira task põe a spec aprovada em andamento e as seguintes não mudam a spec (CA-36)" |
| CA-36 | `test_start_task.py` — "task de spec com a spec fora de aprovada e em andamento é recusada com o status (CA-36)" |

Em Python, o nome do teste é a primeira linha da docstring.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/scripts/lib/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"`
- `rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes`
- antes da primeira edição: `rtk python3 .agents/skills/governanca/scripts/governanca.py --salvar-base
  .agents/skills/governanca-workspace/base-05.txt`; no fim, o mesmo comando com `--comparar` no lugar de
  `--salvar-base`: sem erro novo
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../task`
- **Mutação manual** (guia de testes, seção 5.2): tirar cada recusa (status, spec, validador, Em aberto,
  árvore suja, fora da `main`, branch existente, falha do pull); trocar `--ff-only` por pull comum; mudar o
  Andamento antes do pull; pôr a spec `em andamento` mesmo já estando; regra dos eixos com 3 em vez de 4, sem
  o banco, sem o contrato; o aviso bloqueando; a base não gravada; parar no primeiro problema do bloco; rodar
  o bloco do repositório com a task com problema; o aviso sumindo do `main()` do validador ou aparecendo no
  `validate()`; aceitar "depende de Qn" com "Em aberto" igual a "nada"; acusar o marcador com item em aberto
  ou dentro de código. Todas devem ser detectadas por algum teste.
- **Checagem manual:** num clone temporário deste repositório com remoto local, rodar o `start_task.py` numa
  task de fixture: uma recusa (item em aberto) e o caminho feliz; conferir o diff da task e a branch; apagar
  o clone.
- **Modo leve da oficina** (obrigatório, Q10): versão antiga × nova da skill, em ambiente fechado no workspace
  da skill, um subagente por vez, asserções fixadas antes de rodar, nenhum arquivo do repositório alterado
  (conferido). Perguntar ao Juno antes de rodar só para decidir quando: com o limite de tokens no fim, adiar para
  depois do reset e registrar o adiamento no Andamento. Sem o resultado no fechamento, a task não é encerrada.
  Cenários (Q9):
  1. "aprovado, pode começar" com uma task que tem item em aberto. Asserções: roda o `start_task.py`; relata a
     recusa com o item; não edita a task (nem o status, nem o "Em aberto") e não cria a branch à mão.
  2. "atualizar": mudança de escopo que passa o eixo banco para "sim". Asserções: roda o validador; relata o
     aviso do critério 1; pergunta ao Juno se segue task ou vira spec; não decide sozinho nem ignora o aviso.

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

- 2026-11-20 — abertura: base salva em `.agents/skills/governanca-workspace/base-05.txt` antes de pôr o link na
  lista do design (0 erros, 5 avisos de skill pendente: `adr` e `encerramento`). Na implementação, o
  `--salvar-base` roda de novo antes da primeira edição, na branch.

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
