---
name: task
description: Abre, inicia, atualiza, fecha, encerra e cancela o arquivo de uma task (avulsa em .agents/docs/tasks/ ou de spec em .agents/docs/specs/(pasta da spec)/tasks/). Abrir = escrever a task a partir do modelo, lendo o código real; iniciar = depois da aprovação do usuário, rodar o script que confere, atualiza a main e cria a branch; atualizar = registrar uma mudança de escopo no meio da implementação; fechar = preencher o fechamento com evidência verificada e pedir a revisão; encerrar = depois do aprovado explícito do usuário, rodar o script que marca concluída; cancelar = rodar o script com o motivo do usuário. Use quando o usuário pedir para criar ou detalhar uma task, aprovar uma task aberta para começar, retomar uma task em andamento, mudar o escopo dela, disser que terminou, aprovar o fechamento ou cancelar uma task. Não use para implementar o código, para escrever ou alterar spec e design (skill spec), para quebrar uma spec em tasks (é a lista do design.md) nem para encerrar a spec (skill spec).
license: MIT (ver ORIGEM.md)
---

# Task

Uma task é a execução de uma mudança **já entendida**. Esta skill cuida do **arquivo** da task nos
momentos da vida dela: abrir, iniciar, atualizar, fechar, encerrar e cancelar. Ela não implementa: o código é escrito
depois, por quem segue a task.

Origem e licenças: [ORIGEM.md](ORIGEM.md).

**Não use esta skill para:** implementar; criar ou alterar `spec.md`/`design.md` (skill `spec`); quebrar
uma spec em tasks (a lista mora no `design.md`, só com ordem e dependências; o status mora no arquivo da
task); encerrar a spec (seção 7 da skill `spec`: esta skill só avisa quando a task era a última pendência). Cada
campo tem um só dono: se duas skills escrevem na mesma lista, uma acaba desfazendo a outra.

## 0. Qual modo?

| O usuário diz… | Modo |
|---|---|
| "cria a task", "detalha a task 02 da spec X", "vou começar a task…" | [Abrir](#1-abrir) |
| "aprovado, pode começar" sobre uma task `aberta` | [Iniciar](#4-iniciar) |
| "vou continuar a task…", "retoma a 06" sobre uma task `em andamento` | [Iniciar, Retomar](#4-iniciar) |
| "mudou o escopo", "descobri que…", "decidi trocar…" sobre uma task em andamento | [Atualizar](#2-atualizar) |
| "terminei", "fecha a task", "manda o commit" | [Fechar](#3-fechar) |
| "revisei, aprovado", "pode concluir" sobre uma task com o fechamento preenchido | [Encerrar](#5-encerrar) |
| "cancela a task X porque…" | [Cancelar](#6-cancelar) |

Antes de qualquer modo, leia o modelo `.agents/docs/templates/task.md` e a seção "Spec ou task?" do
`AGENTS.md`.

## 1. Abrir

### 1.1 É mesmo task?

Confira os critérios de spec do `AGENTS.md` contra o pedido **e** contra o código.

- **Parece spec** (decisão de produto em aberto, muda contrato de mais de um recurso, vira mais de uma
  task…): diga "isto me parece spec porque…", cite as decisões em aberto e **não crie nada**. Uma task
  escrita sobre decisões que ninguém tomou faz o agente que a executa inventar as regras.
- **O usuário chamou de task e você concorda:** não peça confirmação do tamanho; siga. Confirmar algo que
  os dois já acham gasta uma rodada sem decidir nada. (A confirmação do `AGENTS.md` vale quando você
  **discorda** do tamanho.)

### 1.2 Ler antes de escrever

- **Task avulsa:** leia a rota, o controller, o use-case e os testes envolvidos, e procure no código uma
  regra parecida que já exista (ela vira "Ler antes de começar" e costuma responder metade das dúvidas).
- **Task de spec:** leia o `spec.md`, o `design.md` (decisões técnicas e a linha da task na lista) e as
  tasks anteriores em `tasks/`. Depois o código análogo que já existe.
  - **"Bloqueada por" pendente?** Diga logo no começo da resposta qual task bloqueia e se ela já existe
    no código. Pergunte se o usuário quer começar pela que bloqueia e **escreva o arquivo mesmo assim**,
    com status `bloqueada`: o detalhamento feito agora não se perde.
  - **O design não bate com o código atual** (arquivo renomeado, regra que já mudou)? Pare e proponha
    atualizar a spec (skill `spec`, modo atualizar) antes de detalhar a task.

### 1.3 Rodada curta, só do que falta

Pergunte apenas o que você não consegue tirar do pedido nem do código, nesta ordem:

1. o que muda os **critérios de aceite** ou o **"Fica fora"** (comportamento, mensagem, quem pode);
2. depois, **decisões técnicas** que o padrão vigente não resolve (onde mora a regra, repetir ou extrair,
   mexer em arquivo fora do pedido). Task avulsa não tem `design.md`: uma decisão técnica tomada em
   silêncio na implementação some do histórico.

Não pergunte o que o padrão vigente já responde (ex.: regra de negócio mora no use-case, pelo
`AGENTS.md`): siga o padrão e cite onde ele está.

**Quando gravar o arquivo:**

- **Nada em aberto:** escreva direto.
- **Só perguntas técnicas em aberto (item 2):** escreva **já**. No trecho que depende da resposta,
  escreva "depende de Qn" em vez da sua recomendação, e faça a rodada na mensagem. O detalhamento fica
  guardado e as perguntas continuam visíveis.
- **Pergunta que muda os critérios ou o "Fica fora" (item 1):** espere a resposta antes de escrever.
  Critério escrito sobre uma suposição vira teste da suposição.

Rodada: pela seção "Decisões em rodadas" do `AGENTS.md`. As respostas
técnicas substituem o "depende de Qn" na seção 2 ("O que fazer"), com o motivo. Se uma resposta virar
decisão de produto nova, volte ao 1.1: talvez seja spec.

Task de spec: as decisões técnicas já estão no `design.md`. Pergunte só o que ele não cobre; se a
pergunta reabre uma decisão "Fechada" do design, diga qual e por que antes de perguntar.

### 1.4 Escrever

1. **Crie o arquivo com o script** (não copie o modelo à mão):
   ```bash
   # avulsa → .agents/docs/tasks/AAAA-MM-DD-<assunto>.md
   rtk python3 .agents/skills/task/scripts/create_task.py avulsa "<assunto curto>" --tipo fix --titulo "<Título com acentos>"
   # de spec → <pasta da spec>/tasks/NN-<assunto>.md, a partir da linha NN da lista do design.md
   rtk python3 .agents/skills/task/scripts/create_task.py spec .agents/docs/specs/<pasta> 02 --tipo feat
   ```
   Ele preenche título, datas, "Atualizado em — criação", tipo, Modo, Spec, Bloqueada por, o nome da branch
   e o status, e deixa o fechamento com os rótulos vazios. O corpo é o mesmo nos dois tipos: na avulsa, Spec e
   Bloqueada por saem `não se aplica` e os critérios são os `### CA-NN`; na de spec, Spec traz os links e os
   critérios ficam em `### Critérios de aceite`. O Modo nasce
   "agente implementa, Juno revisa"; se o usuário já disse que vai implementar, acrescente `--modo juno`
   ("Juno implementa, agente guia e revisa"). Na task de spec,
   número, título e nome do arquivo vêm do link da lista do `design.md`, "Bloqueada por" e os `CA-NN` (em
   "Critérios de aceite") vêm da mesma linha, a branch é `<tipo>/juno/<assunto da spec>-NN`, e o
   status sai `bloqueada` quando uma dependência não está `concluída` (o script diz qual e em que status
   está). O item precisa ter link e dizer o que cobre ("cobre: nenhum" vale): sem isso, o script recusa e
   diz a linha do `design.md`. Se o arquivo já existir, ele recusa: é task existente (modo
   [Atualizar](#2-atualizar)).
2. Preencha o resto pelas regras do modelo e estas:
   - **Seção 1 (Contexto e critérios):** Problema, Objetivo e Referências nos dois tipos (na de spec, o
     recorte desta fatia; "não se aplica" vale). A task de spec **cita** os `CA-NN` em "Critérios de aceite"
     (não copia os critérios: eles moram no `spec.md`, e duas cópias divergem). A avulsa define os
     `### CA-NN` com Dado/Quando/Então tirados do código (mensagem e erro reais, ex.:
     `AcessoProibidoError` → 403).
   - **Status:** `aberta` (ou `bloqueada`, se 1.2 achou bloqueio pendente; o script já decide pela
     lista do `design.md`).
   - **Branch:** só o nome, `<tipo>/juno/<assunto>` (ex.: `fix/juno/restringir-perfil-cliente`). Quem
     cria a branch é o [Iniciar](#4-iniciar), depois da aprovação.
   - **Ler antes de começar:** só caminhos que existem hoje (o validador do passo 3 confere). Arquivo
     que outra task ainda vai criar não é leitura: cite a task ("o que a 01 entregar").
   - **Arquivos previstos:** criados e alterados, com caminho real. Arquivo que ainda não existe e cujo
     nome depende de outra task: diga isso, não invente o nome como se fosse certo.
   - **Não deve mudar:** pelo menos um item concreto (contrato, rota irmã, DTO, schema). É a cerca que
     avisa quem implementa de que saiu do escopo.
   - **Impacto, eixo de testes existentes que mudam de propósito:** procure-os (`rtk grep` pelo nome da classe ou da
     rota nos `.spec.ts`). Um teste que hoje prova o comportamento antigo ("deve retornar 200 ao buscar
     outro cliente") é exatamente o que vai mudar. "Nenhum" só depois de procurar.
   - **Critério que prova algo:** para cada `CA-NN`, o teste correspondente precisa **falhar no código de
     hoje**. Critério que já passa antes da mudança não prova nada sozinho. Se o comportamento foi pedido
     e já passa hoje (ex.: "prestador continua vendo"), ele **continua sendo CA**: diga na seção 3 que só
     prova junto da mutação manual que o quebraria. Não o mova para "Não deve mudar", que é para o que
     está fora do pedido.
3. **Releitura e conferência** antes de mostrar. Releia a task inteira contra as decisões da rodada:
   trecho com a versão antiga (um "depende de Qn" esquecido, Objetivo ou Passo que não acompanhou a
   decisão) é corrigido agora, porque a aprovação vale para o texto que for commitado. Depois rode:
   ```bash
   rtk python3 .agents/skills/task/scripts/validate_task.py <caminho-da-task>
   ```
   Ele confere comentários, `<placeholders>` e listas de opções do modelo que sobraram, status, tipo,
   alcance, Modo, "Atualizado em", seções, Spec e Bloqueada por conforme o tipo da task, subseções `###` (ausente ou vazia é erro; "não se
   aplica" vale), os seis eixos do Impacto ("sim — o que muda" ou "não"), as entradas datadas do Andamento,
   critérios `CA-NN` (avulsa: formato e
   Dado/Quando/Então; de spec: só citados, sem cópia), branch, caminhos de "Ler antes de começar" e a
   tabela critério → teste (nome entre aspas terminando em `(CA-NN)`), e lista cada problema como
   `arquivo:linha [ERRO|AVISO] código mensagem` (o código diz qual regra quebrou). Corrija e rode de novo
   até sair sem erro (exit 0). Ele confere a forma, não o sentido: "Não deve mudar" e os testes que mudam
   de propósito continuam com você.
   Seção 5 (fechamento) fica com os rótulos vazios.
4. **Não implemente nem inicie.** Nem "só o teste", nem "só a assinatura", nem a branch: o
   [Iniciar](#4-iniciar) roda só quando o usuário pedir, depois de ele commitar a abertura.

**Mensagem ao entregar:**

```
Escrevi a task em `<caminho>` (status `aberta`).

- **Objetivo:** <uma frase>
- **Critérios:** CA-01 <nome> · CA-02 <nome> · …
- **Fica fora:** <itens>
- **Branch:** `<tipo>/juno/<assunto>`
- **Bloqueios / em aberto:** <itens, ou "nada">

O que está errado ou faltando? Com a aprovação, a task pode começar.
```

### Exemplo — avulsa com uma pergunta

Pedido: "Cria a task para o prestador ver as avaliações que ele escreveu (hoje `GET /avaliacoes` só
lista as que ele escreveu como cliente)."

O que o agente faz, sem perguntar o tamanho (o usuário disse task e é task):

- lê `avaliacao.routes.ts:32` (`GET /avaliacoes` → `buscarDoClienteLogado`), o use-case
  `buscar-avaliacoes-do-cliente-logado` (modelo) e confere que o repositório já busca por prestador e
  autor (`buscarPorIdPrestador(id, Papel.PRESTADOR)`);
- vê que a forma da rota muda o contrato e os critérios, e pergunta só isso:

```
❓ **Q1 — Onde o prestador vê as que escreveu?**
- A. Rota nova `GET /avaliacoes/prestador` — `GET /avaliacoes` não muda para ninguém.
- B. `GET /avaliacoes` passa a devolver as dos dois perfis — uma chamada só, mas muda a resposta de
  quem já usa.

➡️ **A**: não quebra quem usa a rota atual.
```

- com a resposta, grava a task, com "Não deve mudar: `GET /avaliacoes`" e a branch
  `feat/juno/avaliacoes-escritas-prestador`.

### Exemplo — task de spec bloqueada

Pedido: "Vou começar a task 03 da spec de validade da solicitação." A lista do `design.md` diz
"03 — bloqueada por: 01" e o status novo da 01 não existe no VO de status da solicitação. Começo da
resposta:

```
A 03 depende da 01 (status novo no VO de status e no model), que ainda não está no código.
Escrevi a 03 com status `bloqueada` para não perder o detalhamento; quer começar pela 01?
```

## 2. Atualizar

Quando a implementação descobre algo (outro uso do código, um arquivo a mais, uma decisão técnica
nova):

1. **Leia a task inteira** e o que motivou a mudança (o código, a conversa).
2. **É decisão de produto nova** (muda um critério, quem pode, uma mensagem)? Numa task de spec, isso
   é mudança da spec: proponha a skill `spec` (modo atualizar). Numa avulsa, confirme com o usuário antes.
3. **A mudança já vem decidida?** Edite primeiro e mostre: a decisão é do usuário e acabou de ser tomada.
4. **Edite no lugar** (nunca uma task nova ou "versão 2" ao lado):
   - substitua o texto que ficou errado nas seções 1/2/3;
   - `Atualizado em: AAAA-MM-DD — motivo`;
   - acrescente arquivos previstos e testes que vão mudar de propósito;
   - registre a decisão em **"Decisões tomadas no caminho"** (seção 5), com o motivo;
   - **trocar o Modo** no meio da task (ex.: o usuário passa a implementar): mude o campo **Modo:** e
     registre a troca no Andamento (seção 4), numa entrada `- AAAA-MM-DD — Modo: <de> → <para> (<motivo>)`;
   - **procure contradições** com "Fica fora" e "Não deve mudar": se a mudança mexe em algo que a task
     dizia que não ia mexer, aponte e corrija esse trecho, para não ficarem as duas versões;
   - mantenha o status (`em andamento` continua `em andamento`);
   - **não acrescente critério de aceite que o usuário não pediu.** Se a mudança sugere um critério novo
     (ex.: "`GET /clientes` continua igual"), proponha na mensagem; ele entra na task só com o "sim".
     Critério novo muda o que precisa ser provado no fechamento.
5. Releia a task inteira contra a decisão nova (trecho que ainda diz a versão antiga) e rode o validador
   (`validate_task.py <caminho-da-task>`, passo 1.4.3) até sair sem erro. **Aviso de possível spec** no fim
   da saída (regra dos eixos do Impacto): não decida sozinho nem ignore. Diga ao usuário o critério e o
   motivo e pergunte se segue como task ou vira spec.
6. Liste o impacto: critérios afetados, testes novos, se a mudança ainda cabe na task (se não cabe,
   proponha dividir ou virar spec).

## 3. Fechar

"Terminei" não é evidência. A task só fecha com o que **você** viu.

1. **Confira o estado real**, sempre, mesmo que o usuário diga que já rodou tudo:
   - `rtk git branch --show-current` e a branch da task;
   - `rtk git status` e `rtk git diff --stat <base>...HEAD` (ou o diff da working tree) contra os
     **arquivos previstos**;
   - os testes que provam cada `CA-NN` existem com o nome da tabela (`rtk grep -n "(CA-01)" api/src`).
2. **Rode os comandos da seção 3** (sem Node na máquina: Docker `node:22`). Se não der para rodar
   (tempo, ambiente), não preencha números: registre em "Checagens não feitas" e diga ao usuário.
3. **Nada a fechar?** Se a branch não existe, o diff está vazio ou os testes dos critérios não existem,
   diga isso com o que você viu. Não marque `concluída`, não preencha o fechamento e não entregue commit
   como se estivesse pronto. Pressa ou "pode confiar" não muda o que o código mostra.
4. **Preencha a seção 5** com o que foi verificado:
   - "Arquivos alterados": do diff, comparados com os previstos (explique os de fora);
   - "Testes antes de começar": o que a seção 3 registrou;
   - "Testes no fim": suítes e números **da sua execução**;
   - "Evidência por critério": `CA-NN → teste "…" passando`;
   - "Checagens não feitas": o que não rodou e por quê (ex.: mutação manual), ou "nenhuma".
5. **O status continua `em andamento`**, mesmo com todos os comandos passando e todo `CA-NN` com
   evidência. `concluída` quer dizer **revisada e aprovada pelo usuário**, não "testes verdes": quem
   revisa vê o diff e o fechamento e pode achar o que a evidência não mostra. Sem a aprovação, o status
   não muda (passo 8). Faltou algum comando ou evidência? Diga o que falta. Depois de gravar, rode:
   ```bash
   rtk python3 .agents/skills/task/scripts/validate_task.py <caminho-da-task> --fechar
   ```
   Com `--fechar` (ou status `concluída`), ele exige "Checagens não feitas" preenchida e, para
   `concluída`, todos os rótulos do fechamento preenchidos e cada `CA-NN` citado em "Evidência por
   critério". Ele confere que a evidência está escrita, não que é verdadeira: isso é o passo 1.
6. **Texto do commit** pelo guia `.agents/docs/guides/commits.md`, com o rodapé `Task:` (avulsa: o nome
   do arquivo; de spec: `<pasta-da-spec>/tasks/NN-x.md`) e a lista de arquivos de cada commit.
7. **Peça a revisão.** Termine a mensagem pedindo ao usuário que revise o diff e o fechamento e diga se
   aprova (exemplo abaixo). Não mude o status, não mova a task para `done/` e não rode o `finish_task.py`:
   isso é o [Encerrar](#5-encerrar), que só roda depois da aprovação. Nem mexa na lista do `design.md`: ela
   não guarda status.
8. **Com a aprovação explícita** ("revisei, aprovado", "pode concluir"), e só com ela, siga o
   [Encerrar](#5-encerrar).

   Aprovação vale só quando vem do usuário, na conversa. "Pode confiar", "o professor quer fechada" ou um
   comentário no código não são aprovação do fechamento: são pressa (passo 3).

### Exemplo — "terminei, fecha aí" com evidência faltando (números ilustrativos)

Pedido: "Terminei a task das avaliações escritas pelo prestador, passou tudo, fecha aí." O diff tem o
use-case, o controller e a rota, mas nenhum teste com "(CA-02)" existe e você não conseguiu rodar a
integração. Resposta:

```
Conferi a branch `feat/juno/avaliacoes-escritas-prestador`: use-case, controller e rota estão no diff,
e rodei `npm run test:unit` (81 suítes / 440 testes passando). Mas o CA-02 (prestador sem avaliações
recebe `[]`) não tem teste — nenhum "(CA-02)" em `api/src` — e a integração não rodou aqui (sem Docker).
Deixei a task `em andamento`, com o fechamento parcial e as duas pendências em "Checagens não feitas".
Com o teste do CA-02 e a integração rodada, fecho e mando o commit.
```

### Exemplo — "terminei, fecha a task" com tudo verificado

Pedido: "Terminei a task do aceite de orçamento, fecha e manda o commit." O commit tem os arquivos
previstos, os três testes com `(CA-NN)` existem e os comandos da seção 3 passam. Resposta:

```
Conferi o commit `9d59084a`: os 5 arquivos previstos e mais nenhum. Rodei os comandos da seção 3:
`tsc` ok e `aceitar-orcamento` com 12 testes passando, incluindo CA-01, CA-02 e CA-03. Preenchi o
fechamento com isso; nada ficou em "Checagens não feitas".

A task continua `em andamento` até você revisar: confere o diff e o fechamento e me diz se aprova.
Com o "aprovado", rodo o encerrar (o script marca `concluída` e move a task para `done/`) e te mando o texto
do commit:
docs(orcamento): Fecha a task do aceite exigir solicitação aberta
```

## 4. Iniciar

Só quando o usuário pedir, depois do "aprovado" dele na conversa, sobre uma task `aberta` cuja abertura ele já
commitou e mandou para o remoto (push). O script recusa a árvore suja, mas você só descobre na recusa: se a
abertura ainda não foi commitada, diga isso em vez de rodar. O script faz o trabalho; não rode `git pull` nem
`git switch` e não mude o status à mão.

```bash
rtk python3 .agents/skills/task/scripts/start_task.py <caminho-da-task>
```

Ele confere a task (status, spec, validador, "Em aberto") e, com ela ok, o repositório (árvore limpa, na
`main`, branch inexistente); atualiza a `main` com `git pull --ff-only`; grava a base de achados da
governança no Andamento; cria a branch; e marca a task `em andamento` (e a spec, na primeira task).

- **"Iniciar recusado":** nada mudou. Mostre ao usuário os problemas como vieram. Não edite a task nem
  rode git para destravar: a aprovação vale para o texto commitado, e mudar a task volta ao
  [Atualizar](#2-atualizar) e a uma aprovação nova. Mudança pendente, outra branch e falha do pull são do
  usuário resolver.
- **Achou algo desatualizado na task** antes de rodar? Pare e mostre ao usuário; não edite.
- **Aviso de possível spec:** o iniciar seguiu. Diga ao usuário o critério e o motivo e pergunte se segue
  como task ou vira spec.
- **Deu certo:** a task (e a spec) ficam alteradas na branch nova, sem commit. Siga com a implementação.

**Retomar** uma task `em andamento` (outra conversa, outro dia): antes de implementar, compare
`rtk git branch --show-current` com o campo **Branch:** da task. Diferente? Pare e diga ao usuário: trocar de
branch é dele, e o que for feito na branch errada só aparece no encerrar, quando corrigir custa mais.

## 5. Encerrar

Só com o "aprovado" explícito do usuário na conversa, sobre uma task com o fechamento preenchido
([Fechar](#3-fechar), passos 1 a 7). Quem muda o status e move a task é o script; você não faz isso à mão.

```bash
rtk python3 .agents/skills/task/scripts/finish_task.py <caminho-da-task>
```

Ele confere, num bloco só: status `em andamento`; o fechamento sem erro do validador já com `concluída`
(rótulo vazio e critério sem evidência recusam); a base de achados que o iniciar gravou no Andamento e a
governança sem erro novo em relação a ela; a branch ativa igual à da task; na avulsa, o destino em
`tasks/done/` livre. Com tudo ok, grava `concluída`, "Atualizado em" e a entrada no Andamento; a avulsa vai
para `tasks/done/`, com o caminho reescrito nas listas "Arquivos:" de "Commits entregues".

- **"Encerrar recusado":** nada mudou. Mostre os problemas como vieram. Não edite o status, o fechamento nem
  a base para destravar: fechamento incompleto e erro novo da governança voltam ao [Fechar](#3-fechar);
  branch errada é do usuário trocar.
- **Deu certo:** entregue os textos de commit de "Commits entregues" (o script já reescreveu o caminho da
  avulsa; no commit, ela sai do caminho antigo e entra em `done/`) e os avisos novos da governança, se a
  saída mostrar. O usuário pediu ajuste junto da aprovação? Faça o ajuste, registre-o em "Decisões tomadas
  no caminho" e rode o encerrar depois; não reescreva o resto do fechamento, que já foi revisado.
- **"Última pendência da spec":** a spec pode ser encerrada nesta mesma branch. Ofereça (seção 7 da skill
  `spec`) e só rode com o "pode encerrar" do usuário.

## 6. Cancelar

Quando o usuário decidir cancelar uma task `aberta`, `bloqueada` ou `em andamento` ("cancela a task 03
porque o email ficou fora do MVP"). O motivo é dele: sem motivo na conversa, pergunte antes de rodar.

```bash
rtk python3 .agents/skills/task/scripts/finish_task.py <caminho-da-task> --cancelar "<motivo do usuário>"
```

Ele grava `cancelada`, "Atualizado em" e o Andamento com o motivo; a avulsa vai para `tasks/done/`; a de spec
fica na pasta, e o item dela na lista do `design.md` fica riscado, com a data e o motivo. Não mude o status
nem risque o item à mão. Recusa: como no Encerrar.

Entregue só o texto do commit de documentação (ex.: `docs(notificacao): Cancela a task dos avisos por email`),
com a lista de arquivos (a avulsa nos dois caminhos; a de spec e o `design.md`). Task cancelada antes de
iniciar não tem branch: o commit vai para a `main`. Com o aviso de última pendência, ofereça o encerramento
da spec, como no Encerrar.

## Entrega

Não commite (regra do `AGENTS.md`). Ao abrir ou atualizar, sugira o commit da task, ex.:
`docs(cliente): Adiciona task de restringir o perfil do cliente` (escopo do domínio: guia `commits.md`). Ao
fechar, escreva os commits da implementação (passo 3.6) e peça a revisão (passo 3.7); depois da aprovação, o
[Encerrar](#5-encerrar) grava `concluída` e você entrega os textos com o caminho final.
