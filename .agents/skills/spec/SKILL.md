---
name: spec
description: Cria ou atualiza uma spec do projeto (pasta em .agents/docs/specs/ com spec.md e design.md). Entrevista o usuário em rodadas até não sobrar decisão em aberto, escreve o spec.md (o quê e por quê), pede aprovação e então escreve o design.md (como, com a lista de tasks). Use quando um trabalho cumprir algum critério de spec do AGENTS.md, quando o usuário pedir uma spec, ou quando uma spec existente precisar mudar por algo descoberto na implementação (task nova, task cancelada, critério alterado). Não use para mudança pequena e já entendida (é task), para escrever os arquivos de task, para escrever ADR nem para implementar código.
license: MIT (ver ORIGEM.md)
---

# Spec

Transforma uma ideia com decisões em aberto em dois documentos que um agente sem o histórico da conversa
consegue executar: o `spec.md` (o quê e por quê) e o `design.md` (como, e em que ordem). Também altera uma
spec que já existe quando a implementação ensina algo novo.

Origem e licenças: [ORIGEM.md](ORIGEM.md).

**Não use esta skill para:** mudança pequena e já entendida (é task: diga isso e espere, ver passo 0);
os arquivos `tasks/NN-*.md` (skill `task`); ADR (skill `adr`; aqui ele só é identificado e vira uma task
da lista); código.

## Por que a ordem importa

Uma spec existe porque há decisões que ainda não foram tomadas. Se o agente escreve antes de perguntar, ele
preenche as lacunas com suposições, e o documento parece completo enquanto carrega decisões que ninguém
tomou. Por isso a regra mais importante desta skill:

**Nenhum arquivo é criado enquanto houver decisão em aberto que mude o escopo ou os critérios de aceite.**
Nem "um rascunho para começar", nem na primeira resposta. Primeiro entrevista, depois documento.

**Única exceção — o usuário pede para escrever mesmo assim.** Quando ele diz algo como "está tudo decidido,
pode escrever", mas você acha lacunas (ou contradições) no que ele entregou:

1. mostre as lacunas e as contradições encontradas, com o que cada uma afeta;
2. deixe-o escolher: **responder agora** (vira uma rodada) ou **receber o rascunho** com elas em
   "Decisões de produto → Em aberto";
3. se ele escolher o rascunho: status `rascunho`, nenhuma lacuna preenchida por você, e a spec **não pode
   ser aprovada** (nem o `design.md` começar) enquanto houver item em aberto que bloqueie a aprovação.

## Contradições bloqueiam a aprovação

Se o pedido, uma decisão do usuário ou o que você leu contradiz um requisito (`docs/`), o `README.md`, um
ADR (`api/docs/adr/`) ou uma spec existente, **aponte na primeira resposta** — com o trecho de cada lado
(`caminho:linha`) — e nunca escolha um lado em silêncio. A contradição pode constar do rascunho, mas a spec
só vai para `aprovada` depois que o usuário decidir qual lado vale. Se a decisão invalidar o requisito ou o
ADR, **atualizar esse documento vira uma task da lista** no `design.md`.

## 0. Antes de começar

1. **É mesmo spec?** Confira os critérios do `AGENTS.md` na seção "Spec ou task?". Se só o pedido do usuário aponta para spec e
   nenhum outro critério vale, diga "isto me parece task porque…" e espere: o critério 6 só vale quando o
   usuário mantém o pedido **depois** de ver essa recomendação. Um pedido pequeno tratado como spec gera
   burocracia sem decisão nenhuma para registrar.
2. **Spec nova ou existente?** Se já existe uma pasta em `.agents/docs/specs/` sobre o assunto, vá para o
   passo 6 (atualizar). Senão, siga a ordem abaixo.

**Exemplo — pedido pequeno.** Pedido: "Crie uma spec para restringir o `GET /clientes/:id` a prestador
logado ou ao próprio cliente (mesma regra da reputação)". Resposta esperada, sem criar nada:

```
Isto me parece task: a regra já está decidida e já existe no código (a reputação do cliente faz a
mesma checagem), mexe numa rota só e cabe numa branch. Só o seu pedido aponta para spec.
Sigo como task avulsa em `.agents/docs/tasks/`, ou você quer mesmo a spec?
```

## 1. Como entrevistar (vale para todas as fases)

Pense no assunto como uma **árvore de decisões**: cada decisão abre outras que dependem dela. A
**fronteira** são as decisões cujos pré-requisitos já estão decididos, ou seja, as perguntas que dá para
fazer agora sem chutar respostas que ainda não vieram.

- **Pergunte em rodadas de 3 a 5 decisões da fronteira**, independentes entre si. Fronteira com mais de 5:
  vão as 5 de maior impacto (as que mais mudam o resto). Com menos de 3: só as que existem. Nunca coloque
  na mesma rodada uma pergunta que depende da resposta de outra.
- **Fatos são seus; decisões são do usuário.** Antes de perguntar, veja se a resposta está no código, nos
  ADRs (`api/docs/adr/`), nos requisitos (`docs/`) ou nas specs anteriores. Se estiver, leia e cite
  (`caminho:linha`). Pergunte só o que exige escolha. Perguntar o que dava para ler gasta a atenção do
  usuário com o que não precisa dele.
- **Use os nomes do projeto** (solicitação, orçamento, prestador, contrato…), não termos genéricos.
- Depois de cada rodada: confirme cada decisão em uma frase, recalcule a fronteira (respostas abrem
  perguntas novas e às vezes resolvem pendentes) e faça a próxima rodada.
- **Atalho "siga as recomendações":** se o usuário responder assim (ou "todas A"), as recomendações
  daquela rodada viram decisões. Antes de escrever, mostre o **resumo do entendimento** (decisões, fora do
  escopo, critérios previstos) e espere a confirmação: aceitar tudo de uma vez é o jeito mais fácil de sair
  com uma spec que só o agente decidiu.
- "Não sei" é resposta válida: registre como decisão **em aberto**, diga o que ela bloqueia e siga.
- **Fim da entrevista:** a fronteira está vazia (nenhuma suposição ficou sem ser dita) **e** o usuário
  confirma que o entendimento é o mesmo. Não comece a escrever só porque as perguntas acabaram.
- Passou de umas 6 rodadas? Provavelmente o trabalho é grande demais para uma spec. Sugira quebrar em
  specs menores em vez de continuar.

Formato de uma rodada (o usuário responde por número, ex.: "1 A, 2 C, 3 A"):

```
❓ **Q1 — <título curto>**: <a pergunta, com o contexto que o usuário precisa para responder>
- A. <opção> — <consequência / trade-off>
- B. <opção> — <consequência / trade-off>

➡️ **<opção recomendada>**: <por quê, em uma ou duas frases>

---

❓ **Q2 — …**
```

### Exemplo — primeira resposta a um pedido com decisões em aberto

Pedido: "Quero uma spec para a validade da solicitação aberta: o cliente some e a solicitação fica
recebendo orçamento para sempre."

```
Isto me parece spec: depende de decisões ainda não tomadas (critério 2) e muda o contrato da API de
solicitação e de orçamento (critério 4). Ainda não criei nenhum arquivo.

**O que já li (fatos):**
- A solicitação tem três status: `aberta`, `cancelada`, `encerrada`
  (`api/src/domain/value-objects/solicitacao/status/status.vo.ts:4-8`); não há data de validade.
- O prestador só orça solicitação `aberta` (`cadastrar-orcamento.use-case.ts:45-48`): se ela sair de
  `aberta`, essa porta já se fecha.
- O UC12 já prevê a exceção "a solicitação expirou" (`docs/requisitos-e-casos-de-uso.md:721-725`).

❓ **Q1 — O que a solicitação vira ao vencer?**
- A. Status novo `expirada` — distingue sumiço de cancelamento; mexe no VO e no Swagger.
- B. Vira `cancelada` — sem status novo, mas mistura sumiço com cancelamento voluntário.

➡️ **A**: é um fato de negócio diferente, e o UC12 já usa o termo.

---

❓ **Q2 — Quem define o prazo?** …
```

Repare: os status atuais foram **lidos**, não perguntados; as perguntas são só de escolha.

## 2. Fase 1 — o porquê e o escopo

Entreviste até conseguir responder, sem enrolação, tudo isto (não é um questionário para ler em voz alta:
muitas respostas já estão na conversa ou no código):

- **Quem** é afetado (cliente, prestador, os dois)?
- **Como é hoje?** Verificado no código, não lembrado. Se a spec altera algo existente, isso vira a tabela
  "Hoje / Depois".
- **Como deve ficar?**
- **Por que agora?** (bloqueia outra frente, é bug, é requisito do ciclo…)
- **Como saber que terminou?** Comportamento observável, que vira critério de aceite.
- **O que fica fora**, mesmo parecendo relacionado. Feche isso cedo: é o que segura o escopo depois.
- **O que já existe e é tocado** (agregados, rotas, telas).
- **Qual a menor versão que entrega o valor?**
- **O que dá errado se for entregue errado?** (dados, contratos com o front, regra de negócio)

## 3. Fase 2 — escrever o `spec.md`

1. **Crie a pasta e o `spec.md` com o script** (não copie o modelo à mão):
   ```bash
   rtk python3 .agents/skills/spec/scripts/create_spec.py "<assunto curto>" --titulo "<Título com acentos>"
   ```
   Ele cria `.agents/docs/specs/AAAA-MM-DD-<assunto>/spec.md` com título, datas e status `rascunho`
   preenchidos e imprime o caminho. Não cria o `design.md` (fase 3). Se a pasta já existir, ele recusa:
   é sinal de spec existente (passo 6).
2. Leia o `spec.md` criado (as regras do modelo estão nos comentários dele) e a tabela "Onde fica cada
   coisa numa spec" do `.agents/README.md`.
3. Preencha seguindo as regras do modelo e estas:
   - **A spec registra decisões; não cria decisões.** Tudo que estiver nela precisa ter vindo da conversa,
     do código ou de um documento citado. Uma afirmação que o usuário nunca fez é defeito, mesmo que pareça
     óbvia. Se faltou algo para preencher uma seção, isso é uma pergunta, não um texto inventado.
   - **Decisões de produto:** cada decisão fechada leva a opção escolhida, as alternativas descartadas e o
     motivo, e onde foi tomada. As em aberto dizem o que bloqueiam (a aprovação da spec ou o design: as
     tasks ainda não existem nesta fase). Exemplo real:
     ```
     - O texto da notificação é montado pela API no momento do evento e guardado pronto — descartadas:
       montar no front (uma consulta extra por notificação) e guardar dados soltos para o front montar
       (campo sem formato fixo) — conversa de 2026-10-13
     ```
   - **Fora do escopo** lista recusas reais da entrevista: são as linhas mais úteis para quem implementa.
   - **Sem caminho de arquivo, nome de classe ou código.** Isso envelhece rápido e é assunto do `design.md`.
     Decisões técnicas que vierem junto (índices, abstrações, camadas) ficam guardadas para o design.
   - **Critérios de aceite** em Dado/Quando/Então, com ID `CA-NN`, um por comportamento observável. Inclua
     os caminhos de erro (sem permissão, dado inválido, estado que não permite a ação) com a mensagem que
     o usuário vê, e, se a spec altera algo existente, os critérios de não-regressão. Nada de adjetivo sem
     medida ("rápido", "robusto"): troque pelo comportamento ou número. O modelo traz um exemplo real
     (avaliação) no comentário da seção 4.
   - **Status:** `rascunho` (o script já preenche).
4. **Varredura de lacunas** no rascunho, antes de mostrar. Para cada categoria, a spec está clara, parcial
   ou faltando?
   - papéis e permissões (quem pode, quem não pode);
   - entidades, campos e unicidade;
   - ciclo de vida e estados (transições permitidas e proibidas);
   - erros e casos de borda (vazio, duplicado, chamado duas vezes, papel errado);
   - compatibilidade: o que muda para quem já usa (front, rotas);
   - termos: o mesmo nome para a mesma coisa em todo o documento;
   - consistência interna: uma regra geral de um critério (ex.: "quem age não recebe o aviso") vale também
     nas tabelas e nos outros critérios, e o que a spec diz bate com os requisitos que ela cita;
   - critérios testáveis: cada `CA-NN` vira um teste com resultado passa/não passa?
   - itens em aberto: nenhum aparece como fato fora de "Em aberto" (objetivo, escopo, tabela "Hoje |
     Depois", critérios). Onde o texto precisar dele, escreva "depende de Qn" em vez da sua recomendação.

   O que estiver parcial ou faltando **e** mudar a implementação ou os testes vira uma nova rodada de
   perguntas. Ao integrar a resposta, **substitua** o texto que ela invalida: não deixe duas versões
   convivendo no documento.
5. **Conferência antes de mostrar.** Rode o validador da pasta:
   ```bash
   rtk python3 .agents/skills/spec/scripts/validate_spec.py .agents/docs/specs/<pasta>
   ```
   Ele confere comentários, `<placeholders>` e datas do modelo que sobraram, seções obrigatórias (título
   exato do modelo, não vazias), status, critérios `CA-NN` (formato, repetidos, Dado/Quando/Então) e links
   relativos, e lista cada problema como `arquivo:linha [ERRO|AVISO] mensagem`. Corrija e rode de novo até
   sair sem erro (exit 0); o que for genuinamente desconhecido vai para "Em aberto", não para o texto.
   Aviso de lacuna na sequência dos `CA-NN` é aceitável só quando um critério foi removido numa
   atualização (os IDs não são renumerados). O validador não substitui a varredura do passo 4: ele confere
   a forma, não o sentido.
6. **Peça aprovação** com a mensagem do formato abaixo e revise até o usuário aprovar. Só então mude o
   status para `aprovada` — e só se não houver item em aberto que bloqueie a aprovação nem contradição sem
   decisão — e rode o validador de novo: com `aprovada`, ele acusa item "Em aberto" com
   `bloqueia: aprovação`.

**Formato da mensagem ao entregar o `spec.md`:**

```
Escrevi o rascunho em `.agents/docs/specs/<pasta>/spec.md`.

- **Objetivo:** <uma frase>
- **Fica fora:** <itens>
- **Critérios:** CA-01 <nome> · CA-02 <nome> · …
- **Em aberto:** <itens e o que bloqueiam, ou "nada">

O que está errado ou faltando? Com a aprovação, sigo para o `design.md`.
(Opcional: posso preparar o pedido para uma sessão nova do Claude, sem esta conversa e com acesso ao
repositório, revisar se a spec se sustenta sozinha.)
```

## 4. Fase 3 — escrever o `design.md`

Só depois do `spec.md` aprovado: o design responde ao "como" de um "o quê" que já não muda.

1. **Leia o código antes de perguntar.** Para cada camada afetada (`domain/`, `infra/`, `http/`), abra as
   entidades, use-cases, models, rotas e testes envolvidos, e os ADRs da área. Descubra sozinho tudo o que
   é fato: o padrão vigente, quem usa o que vai mudar, índices existentes, contratos com o front.
2. **Entreviste só as decisões técnicas em aberto**, em rodadas (seção 1), citando o código que motivou
   cada pergunta (ex.: "o `errorHandler` já traduz E11000 por nome de índice
   (`error-handler.middleware.ts:30`): o índice novo ganha mensagem própria ou usa a genérica?"). Siga o
   padrão vigente do projeto; propor padrão novo é uma decisão, não um detalhe.
3. **Crie o `design.md` com o script** e leia o arquivo criado (as regras do modelo estão nos comentários):
   ```bash
   rtk python3 .agents/skills/spec/scripts/create_design.py .agents/docs/specs/<pasta>
   ```
   O título vem do `spec.md`. O script recusa se a spec não estiver `aprovada` ou se o `design.md` já
   existir.
4. **Preencha** pelas regras do modelo, mais estas:
   - cada decisão técnica com alternativas descartadas e motivo, como no `spec.md`;
   - **ADR:** se uma decisão vale para o projeto inteiro, ou altera um ADR existente, registre em
     "ADR novo?" / "ADRs existentes" e coloque a escrita do ADR **como uma task da lista**. Não escreva o
     ADR aqui: ele registra o que foi feito, e o "feito" ainda não aconteceu;
   - código HTTP e erro de domínio de cada `CA-NN` na estratégia de testes;
   - **lista de tasks:** fatias verticais (cada uma atravessa as camadas necessárias e pode ser testada
     sozinha), numeradas na ordem de dependência, com "bloqueada por". Cada uma diz quais `CA-NN` cobre.
     A lista guarda só a ordem, o "bloqueada por" e os `CA-NN` cobertos; o **status** de cada task mora no
     arquivo dela (skill `task`), não na lista. **Não crie os arquivos `tasks/NN-*.md`**: cada task é
     detalhada na hora de começar (skill `task`), com o código como estiver naquele momento. O validador
     aceita os links da lista para tasks que ainda não existem.
5. **Conferência** (o mesmo `validate_spec.py` do passo 5 da fase 2: com o `design.md` na pasta, ele o
   valida também e confere se ele só cita `CA-NN` que existem no `spec.md`) e **aprovação** do design.
6. Encerre dizendo qual task pode começar primeiro (a que não tem "bloqueada por" pendente).

## 5. Entrega

Não commite (regra do `AGENTS.md`). Entregue o texto do commit e a lista de arquivos. Sugestão:
`docs(<escopo>): Adiciona spec de <assunto>`.

## 6. Atualizar uma spec existente

A spec é um documento vivo: a implementação descobre coisas, tasks são canceladas ou acrescentadas,
critérios mudam. Quando isso acontecer:

1. **Leia a spec inteira** (`spec.md`, `design.md` e as tasks que já existem em `tasks/`) e o que motivou
   a mudança (a task em andamento, o código, a conversa).
2. **A mudança já vem decidida?** (ex.: "tira o evento X do MVP") Então **edite primeiro e mostre**: a
   decisão é do usuário e acabou de ser tomada; a regra "nenhum arquivo com decisão em aberto" protege
   decisões que ninguém tomou, não esta. Antes de editar, pergunte só o que muda o escopo **e** não dá para
   deduzir do pedido — na dúvida, aplique a leitura mais literal e aponte a alternativa junto da edição.
   Detalhes de forma (como registrar, criar ou não um critério) vão como sugestão depois da edição, nunca
   como bloqueio. **A mudança ainda está em aberto?** Entreviste só sobre ela, em rodadas. Em qualquer caso,
   não reabra decisões fechadas sem motivo novo; se o motivo existir, diga qual é.
3. **Edite no lugar:**
   - substitua o texto que ficou errado (não acrescente uma "versão nova" ao lado da antiga);
   - registre a decisão nova com alternativas e motivo, e a data da conversa;
   - preencha "Atualizado em: AAAA-MM-DD — <motivo>" em cada documento alterado;
   - status: mudança que já veio decidida **mantém** o status; mudança que precisou de entrevista volta a
     spec para `rascunho` até o usuário aprovar de novo;
   - na lista de tasks do `design.md`: task nova entra com número e "bloqueada por"; task cancelada fica na
     lista, riscada, com o motivo, para que o histórico não se perca (se o arquivo dela já existir, o status
     dele também vira `cancelada`). Exemplo:
     ```
     - ~~[03 — Aviso por email](tasks/03-aviso-email.md)~~ — cancelada em 2026-11-20: email ficou fora do MVP
     ```
   - critério removido não renumera os outros (tasks e testes citam os IDs): o validador mostra a lacuna
     como aviso;
4. **Liste o que a mudança afeta:** quais `CA-NN` mudaram e quais tasks os cobrem; tasks já concluídas
   que agora estão erradas; tasks abertas que precisam ser revistas.
5. Conferência (`validate_spec.py` na pasta), aprovação do usuário e texto do commit (ex.:
   `docs(<escopo>): Atualiza spec de <assunto>`).
