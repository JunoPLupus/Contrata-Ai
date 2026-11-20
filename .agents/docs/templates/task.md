# Task: <título curto e objetivo>

<!--
Modelo único de task: o corpo é o mesmo para os dois tipos.
- Task de spec: .agents/docs/specs/AAAA-MM-DD-<assunto>/tasks/NN-<assunto>.md. Spec e Bloqueada por
  preenchidos; os critérios ficam em "Critérios de aceite", citando os CA-NN do spec.md (sem copiar);
  apague o exemplo "### CA-01".
- Task avulsa: .agents/docs/tasks/AAAA-MM-DD-<assunto>.md. Spec e Bloqueada por com "não se aplica"; os
  critérios são os "### CA-NN" com Dado / Quando / Então; apague a subseção "Critérios de aceite".
Crie com o create_task.py, que já faz essas escolhas.
Cite outras tasks pelo nome do arquivo, não pelo caminho (o caminho muda quando vão para done/).
Toda subseção "###" é obrigatória e nunca é apagada (fora a escolha acima entre "Critérios de aceite" e os
"### CA-NN"): "não se aplica" é resposta válida.
Apague estes comentários ao preencher.
-->

- **Status:** `aberta` | `em andamento` | `bloqueada` | `concluída` | `cancelada`
- **Criado em:** AAAA-MM-DD
- **Atualizado em:** AAAA-MM-DD — <motivo da última mudança>
- **Tipo:** `feat` | `fix` | `refactor` | `test` | `docs` | `chore`
- **Alcance:** `só API` | `API + front` | `só front` | `documentação`
- **Modo:** `agente implementa, Juno revisa` | `Juno implementa, agente guia e revisa`
- **Spec:** <links para o spec.md e o design.md da spec | não se aplica>
- **Bloqueada por:** <nenhuma | NN-<assunto>.md | não se aplica>
- **Branch:** <nome da branch, criada pelo Juno>

## 1. Contexto e critérios

### Problema

<o que está errado ou faltando>

### Objetivo

<resultado esperado, verificável>

### Referências

<requisito, ADR, issue, arquivo que motivou>

### Critérios de aceite

<CA-01, CA-02 do spec.md>

### CA-01: <nome do cenário>

- **Dado** <estado inicial>
- **Quando** <ação>
- **Então** <resultado observável>

## 2. O que fazer nesta tarefa

### Fica fora

<o que não fazer nesta task, ou "não se aplica">

### Decisões

<!-- Só as decisões já tomadas, uma por item: a decisão — descartadas: as alternativas (motivo) — onde e
quando foi tomada. Sem nenhuma: "nenhuma". -->

- <decisão> — descartada: <alternativa> (<motivo>) — <rodada ou conversa, com a data>

### Em aberto

<!-- O que ainda falta decidir e o que bloqueia; sem nada: "nada". -->

<itens e o que bloqueiam, ou "nada">

### Passos

<!-- Fatia vertical: o caminho completo pelas camadas necessárias, testável sozinho. -->

1. <passo>
2. <passo>

### Ler antes de começar

<!-- Código real que serve de ponto de partida ou de modelo; só caminhos que existem hoje. -->

- <ex.: `api/src/domain/use-cases/avaliacao/cadastrar-avaliacao/cadastrar-avaliacao.use-case.ts`>
- <teste existente que serve de modelo>

### Arquivos previstos

<criados e alterados; ajuda a dividir os commits>

### Não deve mudar

<contratos, rotas, schemas, arquivos que esta task não pode tocar>

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

<!-- Cada eixo responde "sim — o que muda" ou "não" (o "não" pode levar um comentário depois). No eixo
de testes, procure os testes que provam o comportamento antigo (ex.: o teste do mapper passa a esperar o
campo novo); "não" só depois de procurar. -->

- **Contrato da API:** <sim — o que muda | não>
- **Banco:** <sim — o que muda | não>
- **Front:** <sim — o que muda | não>
- **Permissões e segurança:** <sim — o que muda | não>
- **Testes existentes que mudam de propósito:** <sim — teste e motivo | não>
- **Documentação:** <sim — o que muda | não>

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
Andamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-01 | `<arquivo>.unit.spec.ts` — "<nome do teste> (CA-01)" |

O nome do teste termina com o ID do critério, ex.: `it('deve recusar a avaliação antes da conclusão do contrato (CA-02)', ...)`.
Assim dá para achar, com uma busca, qual teste prova cada critério.

Comandos: os da seção 3 do `.agents/docs/guides/testing.md` que o alcance da task afeta (API: tipos,
unitários e integração; scripts de `.agents/`: a suíte do script).

- <comando>
- **Mutação manual** nas regras novas (como fazer: `.agents/docs/guides/testing.md`, seção 5.2): <quais
  mutações; todas devem ser detectadas por algum teste>

- **Checagem manual**, quando fizer sentido: <ex.: chamar a rota pelo Swagger com um caso de erro>

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

<!-- Uma entrada por item, na ordem em que acontece: "- AAAA-MM-DD — texto" (início, comandos rodados,
achados, mudança de escopo, troca de Modo com o motivo). Pode ficar vazia com `aberta` ou `bloqueada`; a
partir de `em andamento`, tem pelo menos uma entrada. O fechamento resume o que está aqui. -->

## 5. Fechamento

<!-- Preencher ao terminar. É o que a futura skill de encerramento vai ler. -->

- **O que foi feito:** <resumo>
- **Arquivos alterados:** <lista; compare com os previstos e explique os que ficaram fora da lista>
- **Decisões tomadas no caminho:** <o que foi decidido durante a implementação e por quê>
- **Testes antes de começar:** <suítes e resultado; falhas que já existiam>
- **Testes no fim:** <suítes e testes passando; mutação: N mutantes, N mortos, os vivos e o que foi feito com eles>
- **Evidência por critério:** <CA-01 → teste "…" passando; CA-02 → …>
- **Checagens não feitas:** <qual e por quê, ou "nenhuma">
- **Ficou para depois:** <pendências, riscos, ideias — com destino: nova task, estacionamento>
- **Commits entregues:** <um bloco de código "text" por commit, com a mensagem completa, seguido da lista "Arquivos:">

<!-- Formato de cada commit (o "encerrar" compara a primeira linha do bloco e a lista com o git log):

  ```text
  tipo(escopo): Descrição

  - o que mudou;
  - o último item termina com ponto.

  Task: <identificador da task>
  ```

  Arquivos:
  - `caminho/do/arquivo`
-->

