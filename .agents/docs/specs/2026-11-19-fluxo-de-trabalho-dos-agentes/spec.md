# Spec: Fluxo de trabalho dos agentes

- **Status:** `aprovada`
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-24 — CA-39 (pendências revistas antes de encerrar a spec), decidido pelo Juno na
  abertura da task 04; aprovada pelo Juno em 2026-11-19
- **Requisitos relacionados:** nenhum (a spec trata do fluxo de trabalho com agentes, não do produto ContrataAí)
- **Substitui / substituída por:** nenhuma

## Referências de produto

Aqui, "produto" é o próprio fluxo de trabalho; quem usa é o Juno (revisa e aprova) e o agente (executa).

- Conversa de 2026-11-19 com o Juno: quatro rodadas de decisão, dois ajustes no resumo do entendimento e a
  revisão do rascunho (governança, base de achados, canceladas, modelo de spec, leitura também para specs).
- Estacionamento das notas do Juno, "Agentes — próximos ajustes" (2026-11-19): o ajuste do passo "ler antes de
  escrever" da skill de task, a skill de encerramento e o fluxo de fechamento com o texto do merge.
- Origem do ajuste de leitura: na task que restringiu o perfil público do cliente a prestadores (2026-11-19), a
  proposta criou uma checagem nova de "é prestador" quando a rota já tinha um mecanismo pronto para isso.
- Projeto doe-palmas (mesmo autor): a skill que cria a branch a partir de uma task aprovada, o modelo de task com
  seções rastreáveis, o modelo de spec (arquivo único, com entra e fica fora em subseções, premissas, diagnóstico
  do estado atual e riscos) e a skill de governança. Aproveitados: abrir a branch por script, dar um lugar fixo
  para cada item da task e da spec, e uma skill dona das checagens do conjunto. Descartados: o script de lá não
  verifica se ainda há decisão em aberto antes de abrir a branch; a governança de lá também confere o conteúdo do
  modelo de task (regra com dois donos); a spec de lá junta o quê e o como num arquivo só, e aqui eles continuam
  separados.
- Avaliação do Ponytail (conjunto de instruções para agentes), feita em 2026-11-17: só o checklist de alcance
  ("quem chama, testes, fixtures, config, exports") é compatível com o modo de trabalho deste projeto; o resto
  (resposta telegráfica, testes opcionais, implementar sem rodada de decisões) conflita.
- Modelo do texto do merge: o squash do PR do aceite de orçamento (commit `9d59084a`).

## 1. Problema e objetivo

### Problema

A cada task, o Juno repete à mão os mesmos passos (atualizar a `main`, criar a branch, mover a
task para a pasta de concluídas, pedir o texto do merge) e o agente muda o status da task sem nenhuma checagem
objetiva. O validador da task não percebe quando um item obrigatório (problema, objetivo, o que fica fora,
arquivos previstos, o que não deve mudar, impactos) é apagado em vez de preenchido, e o da spec tem a mesma
lacuna (só exige as seções principais; o que está dentro delas, como "fica fora" e "em aberto", pode sumir), além
de só reconhecer uma decisão em aberto escrita com um texto exato. E, ao propor onde uma regra deve morar, seja
numa task ou numa spec, o agente não levanta o que já existe no código, o que gera duplicação. As checagens do conjunto de
instruções para agentes cresceram num verificador geral sem dono (não há skill de governança), e nada separa
um erro que a mudança causou de um erro que já existia.

### Objetivo

Um fluxo de task e spec com começo e fim feitos por script, que só avança com a aprovação do Juno e com
a task ou a spec sem pendências; modelos de task, de spec e de design em que todo item obrigatório tem lugar fixo e é
cobrado pelo validador; um passo de leitura, nas tasks e nas specs, que obriga o levantamento do que já existe
antes de propor; e uma governança
com dono, que verifica o conjunto inteiro e separa os erros novos dos antigos. Skills curtas: toda verificação
objetiva fica num script, e o agente fica só com o que é ambíguo.

Ao final, isto é verdade:

1. O caminho feliz de uma task é: **ler** (o código e os documentos ligados ao pedido, levantando o padrão vigente
   e os mecanismos que já existem, para propor só o que cumpre o objetivo sem duplicar) → rodadas de decisão com
   propostas baseadas nessa leitura → abrir (task escrita) → Juno revisa e aprova → **iniciar** (script:
   atualiza a `main`, cria a branch, status `em andamento`) → agente implementa → **fechar** (fechamento com
   evidência, pede revisão) → Juno revisa e aprova → **encerrar** (script: valida, `concluída`, move para as
   concluídas, entrega os textos de commit) → Juno commita → agente confere os commits → agente entrega o texto
   do merge → Juno faz o merge.
2. Toda mudança de status depois da criação de uma task (iniciar, concluir, cancelar) ou de uma spec (aprovar,
   entrar em andamento, concluir) é feita por script, depois de uma aprovação do Juno: o agente nunca muda o status
   à mão.
3. O script nunca avança com a task pendente: decisão em aberto, erro de validação ou repositório num estado
   inseguro fazem o script parar sem mudar nada e dizer o motivo.
4. Cada item obrigatório da task, da spec e do design tem lugar fixo e o validador acusa quando ele falta ou está
   vazio; uma spec com decisão em aberto não é aprovada nem ganha o design.
5. Uma spec segue a mesma lógica: leitura antes das rodadas, aprovação só sem nada em aberto, e encerramento (a
   pasta vai para as concluídas) só com todas as tasks concluídas ou canceladas, depois de revistas as pendências
   que ficaram fora das tasks, e com a aprovação do Juno.
6. Nenhuma task e nenhuma mudança de skill termina deixando a governança com um erro que não existia antes dela.

| Comportamento | Hoje | Depois |
|---|---|---|
| Atualizar a `main` local depois de um merge no GitHub | o Juno dá o pull à mão | o "iniciar" faz o pull só se for avanço direto (fast-forward); se não der, para |
| Criar a branch da task | o Juno cria à mão; o agente é proibido de criar branch | o script do "iniciar" cria, depois da aprovação, a partir da `main` atualizada |
| Status da spec (`rascunho → aprovada → em andamento → concluída`) | o agente muda `aprovada` à mão (o validador só acusa depois); `em andamento` e `concluída` sem regra | aprovar e encerrar a spec por script; o "iniciar" da primeira task da spec a põe `em andamento` |
| Status `aberta → em andamento` | o agente muda à mão (ou ninguém muda) | o "iniciar" muda, e registra a aprovação, a branch e o commit de base |
| Status `em andamento → concluída` | o agente muda à mão no "fechar", depois da aprovação | o "encerrar" muda, só se a validação do fechamento passar |
| Mover a task para as concluídas | o Juno move à mão, depois de commitar | o "encerrar" move antes dos textos de commit, e a mudança entra no commit da própria branch |
| Texto do merge (squash do PR) | pedido a cada task | entregue pelo agente depois de conferir os commits, num formato fixo documentado |
| Decisão ainda em aberto na task | só aparece na mensagem do agente | fica numa seção própria da task; com ela preenchida, o "iniciar" recusa |
| Item obrigatório apagado da task (ex.: "o que fica fora") | passa sem aviso; só um marcador do modelo esquecido é acusado | o validador acusa a subseção ausente ou vazia; "não se aplica" é resposta válida |
| Impactos da task | só "testes existentes que vão mudar" | seis eixos fixos, cada um respondido com "sim — o quê" ou "não" |
| Decisões tomadas para a task | soltas no texto ou no fechamento | uma seção com uma linha por decisão (descartadas, motivo, data) |
| Comandos rodados e achados do meio do caminho | só no fechamento, no fim | numa seção de andamento, com data, preenchida durante a task |
| Quem implementa | não registrado | campo "Modo" (padrão: agente implementa, Juno revisa) |
| Pasta das tasks concluídas | a documentação diz "uma subpasta por mês"; na prática é uma pasta só | uma pasta só, para tudo que saiu de circulação (concluídas e canceladas), e a documentação acompanha |
| Pendências que ficaram fora das tasks (estacionadas, "ficou para depois") ao encerrar a spec | sem regra: somem quando a pasta vai para as concluídas | o encerramento as mostra e o agente propõe, item a item, virar task da spec, task avulsa, outra spec ou continuar estacionada; o Juno decide antes de encerrar |
| Cancelar uma task avulsa | sem regra: status mudado à mão, arquivo fica onde estiver | o mesmo passo do "encerrar" marca `cancelada` e move para as concluídas, sem textos de commit de implementação |
| Leitura antes de propor (task e spec) | a skill de task manda ler o código, mas não exige o levantamento dos mecanismos que já existem nem do alcance | levantamento obrigatório antes da primeira rodada, nas duas skills, com as propostas citando o que foi lido |
| Item obrigatório apagado da spec ou do design (ex.: "fica fora", "em aberto") | passa sem aviso; o validador só exige as seções principais | subseções fixas, cobradas pelo validador da spec como no da task |
| Decisão em aberto na spec | só trava a aprovação se o item trouxer um marcador de texto exato, procurado no documento inteiro (o mesmo texto citado numa tabela, fora do "Em aberto", também trava) | subseção "Em aberto" que precisa dizer "nada" para a spec ser aprovada |
| Checagens do conjunto (links, tabela de skills, modelos, status × pasta) | um verificador geral sem skill; status × pasta e duplicatas não são conferidos | skill de governança, dona de todas as checagens do conjunto, com um único ponto de entrada |
| Erro de governança que já existia antes da mudança | se confunde com o que a mudança causou | uma base salva antes da mudança separa novos, antigos e corrigidos; só os novos bloqueiam |

## 2. Escopo

### Entra

- Modelo de task reestruturado: subseções fixas para cada item obrigatório; seção de impacto com seis eixos;
  seção de decisões tomadas e seção "Em aberto"; seção de andamento; metadados Status, Criado em, Atualizado
  em, Tipo, Alcance, Modo e Branch.
- Validador da task acompanhando o modelo novo (subseções, eixos de impacto, "Em aberto", Modo).
- Modelos de spec e de design com o mesmo tratamento (subseções fixas, "Em aberto" que precisa dizer "nada",
  cada item da lista de tasks com "bloqueada por" e os critérios cobertos; sem branch única no design), mantendo a divisão entre o quê
  (spec) e o como (design); validador da spec acompanhando; esta própria spec convertida para o modelo novo.
- Modo "iniciar" na skill de task, com script.
- Modo "encerrar" na skill de task, com script, incluindo a conferência dos commits feitos pelo Juno e o texto
  do merge; o mesmo passo cancela uma task (avulsa: `cancelada` e movida para as concluídas; de spec:
  `cancelada`, fica na pasta da spec e é riscada na lista do design) e, quando fecha a última pendência de uma
  spec, oferece encerrar a spec na mesma branch.
- O "fechar" passa a só preencher o fechamento e pedir a revisão (deixa de mudar o status).
- Aprovar e encerrar uma spec por script, como passos da skill de spec (encerrar = mudar para concluída e mover a
  pasta quando todas as tasks terminam); o "iniciar" da primeira task de uma spec a põe `em andamento`.
- Passo de leitura das skills de task e de spec (antes da primeira rodada de decisão): levantamento de todos os
  mecanismos já usados para o tipo de regra (na rota, no caso de uso, na entidade) e das rotas irmãs, mais o
  checklist de alcance (quem chama, testes, fixtures, configuração, o que é exportado).
- Formato do texto do merge no guia de commits.
- Atualização das instruções gerais para agentes: exceção à regra de Git restrita aos scripts do fluxo
  (buscar e avançar a `main`, criar a branch da task); fluxo novo descrito; pasta única de concluídas.
- Skill de governança, dona das checagens do conjunto de instruções para agentes: absorve o verificador geral
  atual (que deixa de existir como peça à parte) e acrescenta status × pasta, duplicatas, task em andamento sem
  branch, comando de agente sem o prefixo de economia de saída e marcador de modelo esquecido em documento
  canônico; roda os validadores de cada task e spec abertas e junta o resultado, sem regra de conteúdo própria.
- Base de achados da governança: salva antes da mudança e comparada depois (novos, antigos, corrigidos), usada
  pelo "iniciar" e pelo "encerrar" de toda task e pela oficina de skills.
- Quem chamava o verificador geral (integração contínua, guia de testes, oficina de skills) passa a chamar a
  governança inteira.

### Fica fora

- Guias de padrões e de restrições do código: outra spec ou task (decisão de 2026-11-19; o Juno observou que
  eles vão influenciar o fluxo depois).
- Skill de implementação e o restante do Ponytail.
- Subpastas por mês nas concluídas e pasta própria para as canceladas (estacionados: só se for simples depois).
- Reescrever ou revalidar as tasks que já estão nas concluídas: continuam no modelo antigo.
- Abrir PR, fazer merge, push ou commit pelo agente: continuam com o Juno.

## 3. Decisões de produto

### Fechadas

- É spec, não tasks avulsas — descartada: tasks avulsas (as peças dependem umas das outras e mudam uma regra que
  vale para o projeto inteiro) — conversa de 2026-11-19, rodada 1.
- Iniciar é um modo novo da skill de task, com o trabalho objetivo num script — descartada: skill própria de
  aprovação (duas skills escrevendo o status do mesmo arquivo); motivo do Juno: menos texto na skill e menos
  responsabilidade no agente, que fica só com o que é ambíguo — rodada 1.
- O script cria a branch, a partir da `main` — descartada: o script só imprimir o comando (passo manual
  repetido); exige uma exceção restrita na regra de Git das instruções gerais — rodada 1.
- Decisões em aberto ficam numa seção própria da task, e o "iniciar" recusa se ela não estiver como "nada" —
  descartada: reaproveitar o status `bloqueada` (mistura "depende de outra task" com "falta decidir") — rodada 1.
- Campo "Modo" na task, com o padrão "agente implementa, Juno revisa"; uma troca no meio fica registrada no
  andamento; como guiar o Juno quando ele implementa fica nas preferências pessoais dele — descartada: modo só
  nas preferências pessoais, sem registro na task — rodada 2.
- Do Ponytail entra só o checklist de alcance, junto do passo de leitura — descartadas: skill de implementação
  no estilo Ponytail; nada do Ponytail — rodada 2.
- Guias de padrões e de restrições ficam fora — descartada: incluí-los (juntaria um levantamento grande do
  código ao redesenho do fluxo) — rodada 2.
- Concluídas numa pasta só, corrigindo a documentação — descartada: subpastas por mês (estacionada) — rodada 2.
- Itens rastreáveis como subseções fixas, nunca apagadas; "não se aplica" é resposta válida — descartada:
  rótulos dentro das seções atuais (mais frágeis para o validador). Motivo do Juno: o validador atual não confere
  problema, objetivo, o que fica fora, arquivos previstos nem o que não deve mudar — rodada 3.
- Impacto com seis eixos fixos (contrato da API, banco, front, permissões e segurança, testes existentes que
  mudam de propósito, documentação), cada um "sim — o quê" ou "não" — descartada: lista livre — rodada 3.
- A task registra só as decisões tomadas, uma por linha (decisão, descartadas, motivo, data), no mesmo formato da
  spec — descartada: tabela de perguntas e opções com as respostas (repete a rodada do chat e incha a task) —
  rodada 3.
- Seção de andamento com entradas datadas (comandos e resultado, achados, mudança de escopo), preenchida durante
  a task; o fechamento resume — descartada: tudo só no fechamento — rodada 3.
- Metadados: Status, Criado em, Atualizado em, Tipo, Alcance, Modo e Branch — descartados: prioridade,
  responsável, solicitante e branch base (sempre os mesmos neste projeto; a base é sempre a `main`) — rodada 3.
- Encerrar é um modo novo da skill de task, com script; encerrar uma spec é passo da skill de spec — descartada:
  skill de encerramento própria — rodada 4.
- O "encerrar" move a task para as concluídas antes de entregar os textos de commit — descartada: o Juno mover
  depois de commitar (passo manual e commit a mais) — rodada 4.
- O "iniciar" atualiza a `main` só por avanço direto (fast-forward) e para se não der — descartadas: buscar e
  recusar, deixando o pull com o Juno (passo manual a cada task); só checar localmente (branch a partir de uma
  `main` velha) — rodada 4, depois da explicação do pull com fast-forward.
- O "iniciar" avisa quando o impacto aponta para um critério de spec; o agente reavalia e o Juno decide; o modo
  "atualizar" refaz a checagem — descartada: só o agente reavaliar, sem sinal objetivo — rodada 4.
- O "iniciar" registra no andamento a aprovação, a branch e o commit de base — descartada: só status e branch —
  rodada 4.
- A recusa por "`main` divergiu do GitHub" é a falha do próprio pull com fast-forward (divergência, sem rede,
  autenticação), não uma checagem à parte — ajuste do Juno no resumo, 2026-11-19.
- Quem marca `concluída` é o "encerrar", depois da aprovação e só se a validação do fechamento passar; o
  "fechar" deixa o status em `em andamento` — ajuste do Juno no resumo, 2026-11-19.
- A aprovação do Juno é dada na conversa; o agente só roda o "iniciar" e o "encerrar" depois dela, e o registro
  no andamento diz quem aprovou e quando — conversa de 2026-11-19 (fluxo descrito pelo Juno).
- Com diferença na conferência dos commits, o texto do merge só sai depois que o Juno corrige ou aceita cada
  uma; uma spec é encerrada quando todas as tasks estão concluídas ou canceladas, e só com a aprovação do Juno —
  propostas pelo agente no rascunho, confirmadas pelo Juno na revisão de 2026-11-19.
- Tasks avulsas canceladas também vão para a pasta de concluídas (que passa a significar "fora de circulação"),
  com status `cancelada`, movidas pelo mesmo passo do "encerrar", sem textos de commit de implementação; tasks
  de spec canceladas ficam na pasta da spec, riscadas na lista do design. O Juno pode, conforme o caso, só apagar
  o arquivo de uma task cancelada que nunca foi para o repositório — descartadas: pasta própria de canceladas
  (uma pasta e uma regra a mais para um caso raro; estacionada, junto das subpastas por mês); deixar nas abertas
  (a pasta deixa de significar "vivas") — revisão do rascunho, 2026-11-19.
- Modelos de spec e de design recebem o mesmo tratamento do modelo de task, nesta spec, e esta spec é convertida
  para o modelo novo — descartada: spec ou task separada depois (os dois validadores ficariam com regras
  diferentes para a mesma ideia). O modelo de spec do doe-palmas (arquivo único) serve de referência, respeitando
  a divisão deste projeto entre spec e design; o que aproveitar dele é decisão do design — revisão do rascunho,
  2026-11-19.
- Cancelar uma task avulsa é feito pelo script, no passo do "encerrar": vale para task `aberta`, `bloqueada` ou
  `em andamento`, registra no andamento "cancelada pelo Juno" e o motivo, e o agente entrega só o texto do commit
  de documentação que move o arquivo — proposto pelo agente na revisão de coerência, confirmado pelo Juno em
  2026-11-19.
- As mudanças de status da spec também são feitas por script: aprovar (valida, exige "Em aberto" igual a "nada",
  registra a aprovação), entrar em andamento (pelo "iniciar" da primeira task) e encerrar (confere as tasks,
  `concluída`, move a pasta) — descartada: só a task por script, com o agente mudando o status da spec à mão —
  revisão do rascunho, 2026-11-19 (o Juno ajustou o objetivo para "fluxo de task e spec"). Uma task de spec só
  pode ser iniciada com a spec `aprovada` ou `em andamento` — proposto pelo agente, confirmado pelo Juno.
- Uma branch por task, também nas tasks de spec, sempre a partir da `main` atualizada, cada uma com o seu PR; as
  mudanças na spec acompanham a task que as causou; o campo de branch única no design deixa de existir —
  descartada: uma branch por spec (PR grande, a `main` espera até o fim, e o "iniciar" precisaria de exceções
  para estar fora da `main` e para a branch já existente) — revisão do rascunho, 2026-11-19.
- O encerramento da spec roda na branch da task que fecha a última pendência, descoberta pelo script na hora (o
  "encerrar" da task confere se sobrou alguma task da lista não concluída nem cancelada; uma task nova no meio do
  caminho entra na contagem); se a última pendência foi cancelada sem branch, o encerramento vai para a `main`
  como commit só de documentação — descartada: sempre direto na `main` depois do último merge (status da spec
  atrasado e um commit a mais) — revisão do rascunho, 2026-11-19.
- Task de spec é cancelada pelo mesmo passo de cancelamento do "encerrar" (status `cancelada`, motivo no
  andamento), mas fica na pasta da spec, riscada na lista do design com o motivo; sem branch, o commit vai para
  a `main` — descartada: só riscar na lista (o arquivo continuaria aberto para a governança e para o
  encerramento da spec) — revisão do rascunho, 2026-11-19.
- A criação e a aprovação da spec entram por commit direto do Juno na `main`, com push antes do "iniciar" da
  primeira task, como os commits só de documentação de hoje — descartada: branch e PR próprios para a spec (um
  ciclo de PR para documentos já revisados nas rodadas) — revisão do rascunho, 2026-11-19.
- Skills curtas: toda verificação objetiva vai para um script, e o texto da skill fica com o que é ambíguo;
  cada passo novo de skill precisa justificar por que não é script — pedido repetido do Juno, 2026-11-19.
- Skill de governança dona das checagens do conjunto, com um script só, organizado por área internamente —
  descartadas: ampliar o verificador geral sem skill (mantém o acúmulo sem dono); dois scripts, um para skills
  e outro para documentos (várias checagens cruzam as duas áreas e ficariam com dono escolhido caso a caso);
  governança dona também do conteúdo de cada task e spec (a mesma regra com dois donos, e as skills de task e
  spec dependendo de outra skill) — revisão do rascunho, 2026-11-19.
- A governança roda sempre inteira, sem filtro por área — descartada: filtro por área (esconderia o que uma
  mudança numa skill quebra fora dela, como uma task que a cita) — revisão do rascunho, 2026-11-19.
- Erros antigos × novos por base salva pelo script e comparação em três grupos (novos bloqueiam; antigos só
  informados; corrigidos aparecem como tal) — descartadas: exigir governança limpa antes de mexer (um erro alheio
  trava qualquer trabalho); o agente julgar pela leitura (é a parte ambígua que se quer tirar dele) — revisão do
  rascunho, 2026-11-19.
- A base vale para a oficina de skills e para toda task: o "iniciar" salva e registra os antigos no andamento; o
  "encerrar" compara e recusa se houver erro novo — descartada: só na oficina (tasks também mexem nas instruções
  e nos modelos) — revisão do rascunho, 2026-11-19.

- Antes de encerrar uma spec, as pendências que ficaram fora das tasks são revistas: o script de encerramento
  mostra as que estão registradas no repositório (o que ficou para depois no fechamento de cada task e as notas
  da lista de tasks do design), também numa consulta que não muda nada, e o agente junta a elas o "fica fora" da
  spec e as anotações locais do Juno, quando as instruções locais apontam para elas. Um item vira task da spec
  se serve ao objetivo dela e não contradiz o "fica fora"; senão, o agente propõe task avulsa, outra spec ou
  deixar estacionado. O Juno decide cada item; o resultado fica só no efeito de cada decisão (task nova na lista,
  avulsa criada, item que segue estacionado) — descartadas: só texto na skill (o agente pode esquecer); o script
  exigir uma opção de "pendências revistas" (quem a passa é o próprio agente); sem critério escrito; registrar a
  triagem na spec (a mesma informação em dois lugares) — proposta do Juno na abertura da task 04, 2026-11-24.

### Em aberto

nada

## 4. Critérios de aceite

Nos critérios abaixo, "quem usa" vê o resultado na saída do script ou do validador, no terminal.

### CA-01: subseção obrigatória ausente ou vazia

- **Dado** uma task aberta no modelo novo sem uma das subseções obrigatórias (ex.: "Fica fora"), ou com ela vazia
- **Quando** o validador roda
- **Então** acusa erro com a linha e o nome da subseção que falta ou está vazia

### CA-02: "não se aplica" é resposta válida

- **Dado** uma task aberta em que uma subseção obrigatória diz só "não se aplica"
- **Quando** o validador roda
- **Então** não acusa erro por essa subseção

### CA-03: eixo de impacto sem resposta

- **Dado** uma task em que um dos seis eixos de impacto está ausente, vazio ou sem "sim — …" / "não"
- **Quando** o validador roda
- **Então** acusa erro dizendo qual eixo ficou sem resposta

### CA-04: tasks concluídas continuam como estão

- **Dado** as tasks já concluídas, escritas no modelo antigo
- **Quando** a governança roda
- **Então** nenhuma delas é acusada pelo conteúdo nem alterada (as checagens de lugar e status, CA-23 e CA-24, valem
  para elas)

### CA-05: iniciar, caminho feliz

- **Dado** uma task `aberta`, sem erro de validação, com "Em aberto" igual a "nada", o repositório sem mudanças
  pendentes, na `main`, e a branch da task ainda inexistente
- **Quando** o agente roda o "iniciar" depois da aprovação do Juno
- **Então** a `main` avança até a do GitHub, a branch da task é criada a partir dela e fica ativa
- **E** a task fica `em andamento`, com a branch preenchida, "Atualizado em" do dia e uma entrada no andamento com
  a data, "aprovada pelo Juno", o nome da branch e o commit de base
- **E** a base de achados da governança é salva, e o andamento lista os erros que já existiam (ou "nenhum"); erros
  antigos não impedem o "iniciar"

### CA-06: iniciar com status diferente de aberta

- **Dado** uma task com status diferente de `aberta`
- **Quando** o agente roda o "iniciar"
- **Então** o script para sem mudar nada e diz o status atual

### CA-07: iniciar com decisão em aberto

- **Dado** uma task cuja seção "Em aberto" tem algum item
- **Quando** o agente roda o "iniciar"
- **Então** o script para sem mudar nada e lista os itens em aberto

### CA-08: iniciar com erro de validação

- **Dado** uma task que o validador acusa com pelo menos um erro
- **Quando** o agente roda o "iniciar"
- **Então** o script para sem mudar nada e mostra os erros do validador

### CA-09: iniciar com mudanças pendentes

- **Dado** o repositório com arquivos alterados e não commitados
- **Quando** o agente roda o "iniciar"
- **Então** o script para sem mudar nada e lista os arquivos pendentes

### CA-10: iniciar fora da main

- **Dado** o repositório em outra branch que não a `main`
- **Quando** o agente roda o "iniciar"
- **Então** o script para sem mudar nada e diz em que branch está

### CA-11: iniciar com a branch já existente

- **Dado** uma branch com o nome da branch da task que já existe
- **Quando** o agente roda o "iniciar"
- **Então** o script para sem mudar nada e diz que a branch já existe

### CA-12: iniciar com falha ao atualizar a main

- **Dado** a `main` local que não pode avançar direto até a do GitHub (divergência, sem rede ou falha de
  autenticação)
- **Quando** o agente roda o "iniciar"
- **Então** o script para antes de criar a branch, a task não muda, e a mensagem traz a causa informada pelo Git

### CA-13: aviso de possível spec

- **Dado** uma task cujo impacto aponta para um critério de spec (ex.: contrato da API em mais de um recurso)
- **Quando** o agente roda o "iniciar" ou registra uma mudança de escopo pelo "atualizar"
- **Então** aparece um aviso dizendo qual critério de spec parece valer
- **E** o aviso não impede o "iniciar": o agente reavalia e o Juno decide se a task segue ou vira spec

### CA-14: fechar não muda o status

- **Dado** uma task `em andamento` com a implementação terminada
- **Quando** o agente fecha a task (fechamento com evidência)
- **Então** o status continua `em andamento` e o agente pede a revisão do Juno

### CA-15: encerrar recusa task sem condições

- **Dado** uma task que não está `em andamento`, cujo fechamento o validador acusa (rótulo vazio, critério sem
  evidência), ou cuja comparação com a base da governança mostra erro novo
- **Quando** o agente roda o "encerrar"
- **Então** o script para sem mudar nada, nem o status nem o lugar do arquivo, e lista os problemas (no caso da
  governança, só os erros novos)

### CA-16: encerrar, caminho feliz

- **Dado** uma task `em andamento`, com o fechamento sem erro de validação, nenhum erro novo de governança em
  relação à base, e a aprovação do Juno na conversa
- **Quando** o agente roda o "encerrar"
- **Então** a task fica `concluída`, com "Atualizado em" do dia e uma entrada no andamento com a data e "aprovada
  pelo Juno"
- **E** a task passa para a pasta de concluídas
- **E** o agente entrega os textos de commit e a lista de arquivos de cada um, já com o caminho novo da task

### CA-17: conferência acha diferença nos commits

- **Dado** commits feitos pelo Juno na branch da task que diferem dos entregues (título diferente, arquivo a mais,
  a menos ou no commit errado, ou arquivo que ficou fora de todos)
- **Quando** o agente confere os commits
- **Então** cada diferença é apontada, e o texto do merge não é entregue até o Juno resolver ou aceitar cada uma

### CA-18: texto do merge

- **Dado** os commits conferidos sem diferença (ou com as diferenças aceitas pelo Juno)
- **Quando** o agente entrega o texto do merge
- **Então** o texto segue o formato do guia de commits: título no padrão de commit com o número do PR, e corpo
  com resumo, problema, mudanças, testes, o que fica para depois e o rodapé da task

### CA-19: encerrar uma spec

- **Dado** uma spec `em andamento` cujas tasks estão todas concluídas ou canceladas
- **Quando** o agente roda o encerramento da spec, depois da aprovação do Juno
- **Então** a spec fica `concluída`, com "Atualizado em" do dia, e a pasta inteira passa para a pasta de specs
  concluídas
- **E** uma spec com alguma task ainda aberta, bloqueada ou em andamento não é movida, e o agente diz quais tasks
  faltam

### CA-37: encerrar a última task oferece encerrar a spec

- **Dado** uma task de spec que é a única da lista ainda não concluída nem cancelada (contando as tasks que
  entraram na lista no meio do caminho)
- **Quando** o agente roda o "encerrar" dessa task
- **Então** o script avisa que a spec pode ser encerrada na mesma branch, e o encerramento da spec (CA-19) roda ali
  com a aprovação do Juno, entrando nos mesmos textos de commit
- **E** se ainda houver outra task pendente na lista, nenhum aviso aparece

### CA-38: cancelar uma task de spec

- **Dado** uma task de spec `aberta`, `bloqueada` ou `em andamento` que o Juno decidiu cancelar, com o motivo
- **Quando** o agente roda o passo de cancelamento do "encerrar"
- **Então** a task fica `cancelada`, com o motivo no andamento, e o arquivo continua na pasta da spec
- **E** o item dela na lista do design fica riscado, com a data e o motivo
- **E** se ela era a última pendência, o encerramento da spec é oferecido como no CA-37; sem branch da task, o
  commit desse encerramento vai para a `main`

### CA-39: pendências revistas antes de encerrar a spec

- **Dado** uma spec `em andamento` com pendências registradas fora das tasks (o que ficou para depois no
  fechamento de uma task, notas da lista de tasks do design)
- **Quando** o agente vai encerrar a spec, depois da aprovação do Juno
- **Então** antes de encerrar, o agente consulta o encerramento sem mudar nada, e a saída lista essas
  pendências (a recusa por task pendente também as lista)
- **E** o agente propõe um destino para cada item (task da spec, task avulsa, outra spec, continuar estacionado)
  e só roda o encerramento depois da decisão do Juno; um item que vira task da spec entra na lista e impede o
  encerramento até terminar (CA-19)

### CA-20: modo registrado na task

- **Dado** uma task nova
- **Quando** ela é criada
- **Então** o campo "Modo" nasce com "agente implementa, Juno revisa"
- **E** se o modo mudar no meio da task, o campo muda e o andamento registra a troca com a data e o motivo

### CA-21: levantamento do que já existe antes de propor

- **Dado** o pedido que originou o ajuste: restringir o perfil público do cliente a prestadores, numa rota que já
  tem um mecanismo pronto para exigir o perfil de prestador
- **Quando** o agente abre a task
- **Então** a task cita o mecanismo existente (e as rotas irmãs que já o usam) e propõe reaproveitá-lo, em vez de
  criar uma checagem nova
- **E** a task traz o checklist de alcance preenchido (quem chama, testes, fixtures, configuração, o que é
  exportado)
- **E** a leitura acontece antes da primeira rodada de decisão: cada proposta da rodada cita o código ou documento
  lido que a sustenta, e o que dava para ler não vira pergunta
- **E** o mesmo vale quando o agente entrevista para uma spec: o levantamento e o checklist de alcance vêm antes
  das rodadas, e as propostas citam o que foi lido

### CA-22: Git do agente continua restrito

- **Dado** as instruções gerais atualizadas
- **Quando** o agente trabalha numa task
- **Então** os únicos comandos de Git que mudam o repositório são os do script do "iniciar" (avançar a `main` e
  criar a branch); commit, push, merge e rebase continuam com o Juno

### CA-23: status que não bate com o lugar

- **Dado** uma task avulsa na pasta de concluídas com status diferente de `concluída` ou `cancelada`, uma spec na
  pasta de specs concluídas com status diferente de `concluída`, `cancelada` ou `substituída`, uma task avulsa
  fora da pasta de concluídas com status `concluída` ou `cancelada`, ou uma task `em andamento` sem branch
  preenchida
- **Quando** a governança roda
- **Então** acusa erro com o arquivo e o que não bate

### CA-24: a mesma task em dois lugares

- **Dado** uma task (ou spec) que existe ao mesmo tempo entre as abertas e entre as concluídas
- **Quando** a governança roda
- **Então** acusa erro com os dois caminhos

### CA-25: governança junta os validadores das abertas

- **Dado** uma task ou spec aberta com um erro de conteúdo (ex.: subseção vazia)
- **Quando** a governança roda
- **Então** o erro aparece na saída dela com a mesma mensagem que o validador daquele arquivo dá
- **E** a governança não tem regra de conteúdo própria: mudar uma regra no validador muda o que ela acusa

### CA-26: comando sem o prefixo de economia de saída

- **Dado** um comando de terminal para o agente rodar, nas instruções gerais ou numa skill, sem o prefixo `rtk`
  (fora das exceções documentadas: processos longos ou interativos)
- **Quando** a governança roda
- **Então** acusa erro com a linha do comando

### CA-27: marcador de modelo esquecido

- **Dado** um documento canônico (instruções gerais, guias, skills) com um marcador de modelo não preenchido, como
  `<título>`
- **Quando** a governança roda
- **Então** acusa erro com a linha; os próprios modelos não são acusados

### CA-28: base e comparação

- **Dado** uma base de achados salva antes de uma mudança
- **Quando** a governança compara o estado atual com ela
- **Então** a saída separa três grupos: erros novos, erros que já existiam e erros corrigidos
- **E** só os novos fazem a comparação falhar

### CA-29: oficina de skills com a base

- **Dado** uma skill criada ou alterada pela oficina de skills
- **Quando** a oficina termina a mudança
- **Então** a comparação com a base salva no começo não pode ter erro novo; com erro novo, a skill não é dada como
  pronta
- **E** uma mudança feita para corrigir um erro antigo mostra esse erro no grupo dos corrigidos

### CA-30: um único ponto de entrada

- **Dado** a governança no lugar do verificador geral
- **Quando** a integração contínua roda, ou alguém segue o guia de testes ou a oficina de skills
- **Então** todos chamam a governança inteira, sem filtro, e nenhuma instrução cita mais o verificador antigo

### CA-31: subseção obrigatória da spec ou do design

- **Dado** uma spec aberta no modelo novo sem uma subseção obrigatória (ex.: "Fica fora", "Em aberto"), ou com
  ela vazia, no documento do quê ou no do como
- **Quando** o validador da spec roda
- **Então** acusa erro com a linha e o nome da subseção; "não se aplica" é resposta válida

### CA-32: spec com decisão em aberto

- **Dado** uma spec cuja subseção "Em aberto" tem algum item, escrito de qualquer jeito
- **Quando** a spec é marcada como aprovada, ou o documento do como é criado
- **Então** o validador acusa erro (ou a criação do documento do como é recusada) e lista os itens em aberto

### CA-33: item da lista de tasks incompleto

- **Dado** um item da lista de tasks do documento do como sem "bloqueada por" ou sem os critérios que cobre
- **Quando** o validador da spec roda
- **Então** acusa erro com a linha do item e o que falta

### CA-34: cancelar uma task avulsa

- **Dado** uma task avulsa `aberta`, `bloqueada` ou `em andamento` que o Juno decidiu cancelar, com o motivo
- **Quando** o agente roda o passo de cancelamento do "encerrar"
- **Então** a task fica `cancelada`, com "Atualizado em" do dia e uma entrada no andamento com a data, "cancelada
  pelo Juno" e o motivo
- **E** a task passa para a pasta de concluídas, e o agente entrega só o texto do commit de documentação que a move

### CA-35: aprovar a spec

- **Dado** uma spec em `rascunho`, sem erro de validação e com "Em aberto" igual a "nada"
- **Quando** o agente roda a aprovação da spec, depois da aprovação do Juno na conversa
- **Então** a spec fica `aprovada`, com "Atualizado em" do dia e o registro de que o Juno aprovou e quando
- **E** com erro de validação ou algo em aberto, o script para sem mudar nada e lista os problemas

### CA-36: primeira task põe a spec em andamento

- **Dado** uma spec `aprovada` e a primeira das tasks dela pronta para iniciar
- **Quando** o agente roda o "iniciar" dessa task
- **Então** além do que o CA-05 descreve, a spec fica `em andamento`
- **E** o "iniciar" das tasks seguintes não muda o status da spec
- **E** uma task de spec cuja spec não está `aprovada` nem `em andamento` não pode ser iniciada: o script para e diz o
  status da spec
