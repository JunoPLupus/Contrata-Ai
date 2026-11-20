---
name: oficina-de-skills
description: Cria, adapta, traduz ou melhora skills do projeto em .agents/skills/ e prova que funcionam, comparando o agente com e sem a skill. Use sempre que for escrever uma skill nova, trazer uma skill externa para o projeto (traduzir ou adaptar), alterar uma skill existente ou verificar se uma skill realmente muda o comportamento do agente. Não use para executar uma skill existente nem para escrever documentação que não seja skill.
license: Apache-2.0 (ver LICENSE.txt e ORIGEM.md)
---

# Oficina de skills

Adaptação da `skill-creator` da Anthropic com o "cenário de pressão" da `writing-skills` (obra) e a
checagem estática da `skill-creator` do okjpg. Origem, licenças e o que mudou: [ORIGEM.md](ORIGEM.md).

O ciclo, em resumo:

1. Entender o que a skill deve fazer, **de onde ela vem** e **que tipo é**.
2. **Ver o agente falhar primeiro:** criar 2–3 cenários e rodá-los **sem** a skill. Anotar as falhas.
3. Escrever o rascunho para corrigir **essas** falhas e passar pela checagem estática.
4. Rodar os mesmos cenários **com** a skill, revisar os critérios e mostrar a comparação ao usuário.
5. Reescrever a skill a partir do retorno e repetir até ficar boa.
6. Rodada final de confirmação, registro na tabela do `AGENTS.md` e texto do commit.

Descubra em que ponto o usuário está e entre dali. Se ele já tem um rascunho, rode a linha de base
(passo 2) com ele de lado e siga para o passo 3.4. Se ele disser que não quer testes, pode pular, mas
avise o que se perde: sem comparar, não há prova de que a skill muda alguma coisa.

**Modo leve:** para um **ajuste pequeno numa skill que já existe** (corrigir um passo, reescrever um
trecho), sugira ao usuário o modo leve — ele decide: 1 cenário que exercite a mudança, rodado com a
versão antiga e com a nova, e a comparação resumida no chat (sem tela). **Skill nova usa sempre o ciclo
completo:** foi ele que pegou os problemas que o modo leve deixaria passar.

**Base de achados, antes da primeira edição** (em qualquer modo, inclusive o leve): salve o que a
governança acusa hoje no workspace da skill, para no fim separar o que a sua mudança causou do que já
existia (passo 6.3). Não confunda com a "linha de base" dos cenários (a rodada sem a skill, passo 2).

```bash
rtk python3 .agents/skills/governanca/scripts/governanca.py --salvar-base .agents/skills/<nome>-workspace/base-de-achados.txt
```

## Falando com o usuário

Os termos de avaliação de skill (cenário, critério de verificação, linha de base, JSON…) não são
conhecidos de todos: evite jargão e explique cada termo em uma frase na primeira vez. Decisões em rodadas, pela seção "Decisões em rodadas" do `AGENTS.md`.

---

## 1. Entender a intenção e a fonte

Se a conversa já mostra o fluxo que o usuário quer transformar em skill, extraia dela as respostas
(ferramentas usadas, ordem dos passos, correções que ele fez) e peça confirmação.

1. O que a skill deve fazer o agente fazer?
2. Em que situação ela deve ser usada — e em qual **não** deve? (vira a linha da tabela de roteamento
   do `AGENTS.md` e o "não use para" da `description`)
3. Qual o formato da saída?
4. **De onde ela vem?** Regra do projeto: **nenhuma skill nasce da imaginação.** Toda skill parte de:
   - uma **skill externa** — leia-a **inteira** (instruções, referências e scripts) antes de adotar,
     confira a licença e registre repositório, commit e licença no `ORIGEM.md`; ou
   - um **padrão já comprovado no código do projeto** — cite os arquivos que servem de modelo.

   Se não houver nenhuma das duas, pare e diga isso ao usuário em vez de inventar.
5. **Que tipo de skill é?** Isso decide como testar (ver passo 2):

| Tipo | O que faz | Exemplo |
|---|---|---|
| **Regra** | Obriga uma disciplina que o agente tende a pular | "nunca compare a saída com o mesmo mapper que a gera" |
| **Técnica** | Ensina um passo a passo | "como criar um use-case" |
| **Padrão** | Ensina um jeito de pensar | "quando usar value object" |
| **Referência** | Guarda informação para consulta | "lista de rotas e seus contratos" |

### Traduzir ou adaptar?

- A skill externa **encaixa quase inteira** → traduza para pt-BR e só ajuste nomes e caminhos do
  projeto. Mantenha scripts e código como estão (traduzir código só cria risco).
- **Encaixa em parte** → use como base e reescreva com o padrão do projeto.
- Em ambos os casos, o que contradiz o `AGENTS.md` ou o código real perde: o projeto manda.

## 2. Linha de base: ver o agente falhar primeiro

**Por quê:** uma skill escrita antes de ver o agente errar trata o que **você** acha que vai dar errado,
não o que dá errado. No primeiro uso desta oficina, a skill nasceu sem exemplos e sem formato de saída
justamente por isso.

### 2.1 Criar os cenários

Escreva 2–3 pedidos realistas, do jeito que alguém do projeto pediria de verdade (com nomes de
arquivos, entidades e contexto reais). Cubra o caminho principal **e** pelo menos um caso de borda (um
pedido em que a skill **não** deveria ser usada também conta). Mostre ao usuário e pergunte se
representam bem o uso. Salve em `evals/evals.json` dentro da pasta da skill (formato em
[references/schemas.md](references/schemas.md)).

**Skill do tipo regra?** Além dos pedidos normais, monte **cenários de pressão**: situações em que o
agente tem um bom motivo para pular a regra (pressa, trabalho já feito, alguém mandando pular).
Leia [references/cenario-de-pressao.md](references/cenario-de-pressao.md) antes de escrevê-los.

| Tipo de skill | Como testar |
|---|---|
| Regra | cenários de pressão com 3+ pressões combinadas; anotar as desculpas do agente |
| Técnica | aplicar a técnica num caso novo e num caso de borda |
| Padrão | reconhecer quando o padrão se aplica **e** quando não se aplica |
| Referência | achar a informação certa e usá-la corretamente |

### 2.2 Rodar sem a skill

Os resultados ficam em `.agents/skills/<nome>-workspace/` (ignorado pelo git), por rodada
(`iteration-1/`, `iteration-2/`…) e, dentro dela, uma pasta por cenário com nome descritivo
(`eval-teste-do-mapper/`, não `eval-0/`). A linha de base de cada cenário vai em
`.../without_skill/run-1/outputs/` (skill nova) ou `.../old_skill/run-1/outputs/` (skill existente:
antes de editar, copie a versão atual com `cp -r <skill> <workspace>/skill-snapshot/` e use a cópia).
Essa linha de base é **reaproveitada** nas iterações seguintes e na rodada final (regras no passo 5): ela
custa metade dos subagentes de cada rodada e só muda quando o cenário ou o ambiente mudam.

Regras para **todo** subagente de teste (com ou sem a skill), escritas no pedido que ele recebe:

- **Não pode alterar o repositório.** O que ele criaria vai para a pasta `outputs/` da rodada, mantendo
  o caminho relativo; a mensagem que mandaria ao usuário vai em `outputs/resposta.md`.
- **Não pode ler as notas pessoais do usuário** (`.notes/`). Elas guardam decisões e contexto que
  facilitam o teste e não existem para outra pessoa que clone o repositório.
- Sem usuário para responder, ele faz o que faria na **primeira resposta** e para (ou recebe no pedido
  as respostas que precisa, quando o cenário mede uma etapa posterior).

**Limitação conhecida:** a ferramenta carrega as preferências pessoais do usuário (ex.: `CLAUDE.local.md`)
nos subagentes, e não há como desligá-las de forma confiável. Os números medem "a skill + o ambiente do
usuário", não um agente puro: diga isso ao apresentar os resultados.

Grave um `eval_metadata.json` por cenário (formato em `references/schemas.md`).

### 2.3 Anotar as falhas

Leia as saídas da linha de base e liste, por cenário: o que o agente fez de errado, o que pulou, o que
inventou e — em skill de regra — as desculpas **palavra por palavra**. Essa lista é o que o rascunho tem
de corrigir. Mostre-a ao usuário antes de escrever.

**Ferramenta sem subagentes?** Rode os cenários um por um, você mesmo. É menos rigoroso (quem escreveu a
skill também a executa), então a revisão do usuário pesa mais. Nesse caso pule a medição de
tempo/tokens.

## 3. Escrever o SKILL.md

### Anatomia

```
.agents/skills/<nome>/
├── SKILL.md          (obrigatório: cabeçalho YAML + instruções)
├── ORIGEM.md         (obrigatório quando vier de fonte externa)
├── evals/            (cenários de teste: evals.json e arquivos de apoio)
├── references/       (textos lidos só quando necessário)
├── scripts/          (código para tarefas repetitivas e exatas)
├── agents/           (instruções para subagentes, se a skill usar subagentes)
└── assets/           (opcional: modelos e arquivos usados na saída)
```

Nome da pasta: o **substantivo do assunto** (`spec`, `task` e a futura `adr`), não um verbo — regra do
`.agents/README.md`.

Cabeçalho YAML:

- **name**: nome da pasta, em kebab-case (minúsculas e hífens).
- **description**: o que a skill faz, **quando usar e quando não usar**. Outras ferramentas podem usar
  esse texto para decidir sozinhas; neste projeto, quem decide é a tabela do `AGENTS.md`, mas a
  descrição continua sendo o resumo que o agente lê primeiro. Sem `<` nem `>`, até 1024 caracteres.
- **license**: quando vier de fonte externa.

### Carregamento em camadas

1. A linha da tabela do `AGENTS.md` + a `description` — sempre visíveis.
2. O corpo do `SKILL.md` — lido quando a situação aparece (ideal: menos de 500 linhas).
3. `references/` e `scripts/` — só quando o `SKILL.md` mandar.

Se o `SKILL.md` passar de ~500 linhas, mova detalhes para `references/` e diga no `SKILL.md`
**quando** ler cada arquivo. Arquivo de referência com mais de 300 linhas ganha sumário no topo.

### Como escrever

- Escreva para corrigir as falhas anotadas no passo 2.3. Cada regra nova tem de corresponder a uma
  falha observada ou a um cenário que a teste; regra que nenhum cenário exercita é palpite.
- Use o imperativo ("leia", "rode", "entregue").
- **Explique o porquê** de cada instrução. Modelos atuais entendem razões e generalizam melhor a
  partir delas do que de ordens soltas. Se você se pegar escrevendo SEMPRE/NUNCA em maiúsculas, é
  sinal de alerta: troque pela explicação. A exceção são as skills de **regra** que, no teste, o agente
  quebrou sob pressão — aí a proibição explícita é a forma certa (ver
  [references/cenario-de-pressao.md](references/cenario-de-pressao.md)).
- **Mostre, não só descreva:** exemplos concretos de entrada → saída ensinam o formato melhor que
  qualquer regra. Resultado genérico no teste costuma ser falta de exemplo.
- Formato de saída fixo: mostre o modelo exato.
- Escreva um rascunho e depois releia com olhos de quem nunca viu o projeto.
- Nada de conteúdo malicioso ou que surpreenda o usuário se descrito em voz alta.

### 3.1 Checagem estática (antes de rodar com a skill)

Confira item por item e corrija o que faltar **antes** de gastar subagentes:

- [ ] `description` diz o que faz, **quando usar** e **quando não usar**;
- [ ] pelo menos **2 exemplos concretos** de entrada → saída (caminho principal + um caso de borda),
      com dados do projeto, não abstratos;
- [ ] **formato da saída** definido (o que o agente entrega, em que ordem, onde grava);
- [ ] passos no imperativo, um por vez, em ordem;
- [ ] sem linguagem vaga ("trate adequadamente", "quando relevante", "conforme necessário") — troque
      pelo comportamento concreto;
- [ ] nada de credencial, token ou caminho pessoal da máquina;
- [ ] cada falha anotada no passo 2.3 tem um trecho da skill que a corrige;
- [ ] `ORIGEM.md` com repositório, commit, licença e o que mudou (se veio de fonte externa).

Valide o cabeçalho com o script (exige Python 3 com `pyyaml`):

```bash
rtk python3 <pasta-desta-skill>/scripts/quick_validate.py .agents/skills/<nome>
```

## 4. Testar com a skill

**A ideia é a mesma da mutação manual dos testes:** só vale a pena manter a skill se ela muda o
comportamento do agente. Se o agente faz a mesma coisa com ou sem ela, a skill não ensina nada.

### 4.1 Rodar com a skill

Para cada cenário, um subagente recebe o pedido, as regras do passo 2.2 e a instrução "antes de
começar, leia `<caminho>/SKILL.md` inteiro e siga-o". Saída em `.../with_skill/run-1/outputs/`. Rode
os cenários em paralelo.

**Número de execuções:** 1 por cenário nas iterações (barato enquanto a skill muda). Na **rodada final**
(passo 6), 3 por cenário **só com a skill**, para a média não depender de uma execução só; a linha de
base é reaproveitada (passo 5).

### 4.2 Critérios de verificação

Critério de verificação = uma afirmação objetiva sobre a saída, que dá para conferir como
"passou/não passou" (ex.: "o teste do mapper usa valores literais, não chama o mapper"). Dê nomes
que se entendam sozinhos na tela de comparação. Coisas subjetivas (estilo, clareza) ficam para a
avaliação do usuário. Escreva-os a partir das falhas do passo 2.3 e grave em `evals/evals.json` e nos
`eval_metadata.json`.

**Critério que um script confere sozinho** (arquivo existe, placeholder sobrando, ID no formato, texto
proibido presente) **não vai para o avaliador LLM:** escreva-o com o prefixo `[script] ` e implemente-o em
`evals/checks.py` da skill testada (contrato em [references/schemas.md](references/schemas.md), seção
"checks.py"). Script não erra por cansaço nem gasta tokens; o avaliador LLM fica só com o que exige
leitura de sentido. Reaproveite os scripts da própria skill quando existirem (ex.: a `spec` tem o
`validate_spec.py`).
O `checks.py` também é código: teste cada critério com um caso que passa e um que falha (saídas
sintéticas, ex.: `task/evals/test_checks.py`) e faça mutação nele (guia `.agents/docs/guides/testing.md`,
seção 5). Rodá-lo só nas saídas reais não basta:
nelas pode não haver nenhum exemplo do erro (no primeiro uso, 5 de 8 mutações sobreviveram assim).

**Revise os critérios depois da primeira execução com a skill**, antes de confiar nos números: algum
critério premia um comportamento errado ou pune uma trava que a skill tem de propósito? Exemplo real: um
cenário esperava "escreve o `spec.md`", e a skill foi punida por perguntar antes de inventar — o defeito
estava no critério. Critério corrigido vale para as duas configurações (reavalie a linha de base também).

### 4.3 Guardar tempo e tokens

Quando cada subagente termina, a notificação traz `total_tokens` e `duration_ms`. Salve na hora em
`timing.json` na pasta da rodada — essa informação não fica guardada em outro lugar.

### 4.4 Avaliar, agregar e mostrar

1. **Avaliar:** **um subagente avaliador por cenário**, com contexto limpo e **às cegas**: ele recebe
   todas as execuções daquele cenário (com e sem a skill, todas as repetições) embaralhadas e rotuladas
   A, B, C…, sem saber qual é qual; o mapa rótulo → execução fica só com você. Ele segue
   `agents/grader.md`, avalia **só os critérios sem `[script]`** e devolve um resultado por rótulo; você
   grava cada um como `grading.json` na pasta da execução. Use exatamente os campos `text`, `passed` e
   `evidence` (a tela de comparação depende deles). Um avaliador por cenário, em vez de um por execução,
   divide o custo pelo número de execuções e compara as saídas lado a lado.
   Depois, se a skill tiver `evals/checks.py`, aplique os critérios `[script]` (a partir da pasta desta
   skill):
   ```bash
   rtk python3 -m scripts.apply_checks <caminho absoluto da skill> <workspace>/iteration-N
   ```
2. **Agregar** (a partir da pasta desta skill):
   ```bash
   rtk python3 -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <nome>
   ```
   Gera `benchmark.json` e `benchmark.md` com taxa de acerto, tempo e tokens de cada lado.
3. **Analisar:** leia os números procurando o que a média esconde (ver `agents/analyzer.md`):
   critério que passa com e sem a skill (não mede nada), cenário instável, custo alto, e a limitação do
   passo 2.2 (preferências do usuário na linha de base).
4. **Mostrar ao usuário.** Resuma no chat, por cenário: o que mudou com a skill, o que falhou e o que os
   números não mostram. Se ele quiser ver as respostas lado a lado, abra a tela de comparação:
   ```bash
   # sem rtk: servidor da tela de comparação, fica rodando em segundo plano
   nohup python3 <pasta-desta-skill>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "<nome>" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   A partir da 2ª rodada, acrescente `--previous-workspace <workspace>/iteration-<N-1>`.
   Sem navegador disponível: `--static <arquivo.html>` gera um HTML para abrir depois; o botão
   "Submit All Reviews" baixa um `feedback.json`, que deve ser copiado para o workspace.
   A aba "Outputs" mostra cada cenário com caixa de comentário; a aba "Benchmark" mostra os números.

### 4.5 Ler o retorno

Leia o retorno do usuário (no chat ou no `feedback.json`). Comentário vazio = estava bom. Concentre-se
nos cenários com reclamação. Se abriu a tela, encerre-a: `kill $VIEWER_PID 2>/dev/null`.

## 5. Melhorar a skill

1. **Generalize.** A skill vai ser usada em muitos pedidos, não só nos 3 cenários. Evite remendos
   que só servem para os exemplos.
2. **Enxugue.** Leia o passo a passo dos subagentes, não só o resultado final. Se a skill faz o agente
   perder tempo com algo improdutivo, corte o trecho e veja o que acontece.
3. **Explique o porquê** (ver passo 3).
4. **Procure trabalho repetido.** Se todos os subagentes escreveram o mesmo script auxiliar, coloque-o
   em `scripts/` e mande a skill usá-lo.
5. **Skill de regra que o agente quebrou?** Siga o ciclo de fechar brechas de
   [references/cenario-de-pressao.md](references/cenario-de-pressao.md).
6. **Cenário novo para cada falha nova** que aparecer no uso real ou no retorno do usuário.

Depois: aplique as mudanças, passe de novo pela checagem estática (3.1) e rode uma nova
`iteration-<N+1>/` com estas regras de economia:

- **Só os cenários que a mudança pode afetar** rodam com a skill. Diga ao usuário quais ficaram de fora
  e por quê (ex.: "mudei só a regra de critérios da task avulsa: rodo só o cenário avulsa"). A rodada
  final roda todos.
- **Linha de base reaproveitada:** copie as pastas `without_skill/` (ou `old_skill/`) da iteração
  anterior para a nova (`cp -r`, sem gastar subagente). Rode a base de novo **só** para o cenário cujo
  pedido ou arquivos de apoio mudaram, ou quando mudar o ambiente que o cenário lê (`AGENTS.md`,
  modelos em `.agents/docs/templates/`, a skill vizinha que ele usa). Exemplo real: uma linha nova no
  `AGENTS.md` mudou o comportamento da base da `task` entre duas rodadas.
- **Critério novo ou corrigido não pede execução nova:** reavalie as saídas que já existem.

Mostre a comparação e espere o retorno. Pare quando o usuário estiver satisfeito, quando os comentários
vierem vazios ou quando não houver mais progresso.

### Comparação às cegas (opcional)

Para saber se a versão nova é mesmo melhor: entregue as duas saídas a um agente independente sem dizer
qual é qual e peça que julgue. Detalhes em `agents/comparator.md` e `agents/analyzer.md`.

## 6. Finalizar

1. **Rodada final de confirmação:** com a skill aprovada pelo usuário, rode todos os cenários **3 vezes
   com a skill** e confira se o resultado se mantém. A linha de base é a da última iteração, pelas regras
   do passo 5: ela mostra que a falha existe sem a skill (essas falhas costumam ser sistemáticas), e a
   variação que importa medir é a da skill. Se um cenário variar muito entre as execuções, a skill ainda
   está ambígua nesse ponto: volte ao passo 5.
2. **Registrar na tabela de roteamento do `AGENTS.md`** ("Situação → Skill"). Sem isso a skill nunca
   é lida.
3. **Conferir o conjunto** com a governança (skill `governanca`), que roda o `quick_validate` em todas
   as skills e confere a linha da tabela, os links e caminhos citados, os comandos `python3` e o prefixo
   `rtk` dos blocos de comando e os placeholders esquecidos da skill nova. Compare com a base de achados
   salva antes da primeira edição:
   ```bash
   rtk python3 .agents/skills/governanca/scripts/governanca.py --comparar .agents/skills/<nome>-workspace/base-de-achados.txt
   ```
   Com **erro novo**, a skill não está pronta: corrija até a comparação sair com 0. Erro que já existia é
   só informado; os corrigidos aparecem em grupo próprio (confira se foram de propósito). Aviso novo não
   bloqueia, mas diga ao usuário. Sem a base salva (você esqueceu, ou entrou no meio do ciclo), rode a
   governança sem `--comparar` e corrija até sair sem erro.
4. **`ORIGEM.md`** (se veio de fonte externa): repositório, commit, licença e o que foi mudado.
   Licenças que exigem a mesma licença na obra derivada (ex.: CC BY-SA) precisam ser respeitadas.
5. **Não commitar.** Entregue o texto do commit e a lista de arquivos, conforme o `AGENTS.md`. O
   workspace de testes fica fora do git; os cenários em `evals/` podem ser versionados, se o usuário
   quiser repetir os testes depois.

---

## Arquivos de apoio

- `agents/grader.md` — como avaliar os critérios de verificação contra as saídas.
- `agents/comparator.md` — comparação às cegas entre duas saídas.
- `agents/analyzer.md` — por que uma versão venceu a outra; padrões nos números.
- `references/schemas.md` — formatos dos arquivos JSON (`evals.json`, `grading.json`…) e o contrato do `evals/checks.py`.
- `scripts/apply_checks.py` — aplica os critérios `[script]` de uma skill em todas as execuções de uma iteração.
- `references/cenario-de-pressao.md` — cenários de pressão e como fechar brechas (skills de regra).

Esses arquivos (exceto o cenário de pressão) e os scripts estão em inglês, como no original. Os nomes
de campos JSON e de pastas também ficam em inglês, porque os scripts e a tela dependem deles.

### Glossário (termos deste SKILL.md ↔ termos dos arquivos em inglês)

| Aqui | Nos arquivos de apoio |
|---|---|
| cenário de teste | eval, test case |
| critério de verificação | assertion, expectation |
| linha de base (sem a skill) | baseline, `without_skill` / `old_skill` |
| com a skill | `with_skill` |
| rodada | iteration |
| execução | run (`run-1`, `run-2`…) |
| avaliador | grader |
| comparação às cegas | blind comparison, comparator |
| tela de comparação | eval viewer, review |
| números agregados | benchmark |
| retorno do usuário | feedback |
