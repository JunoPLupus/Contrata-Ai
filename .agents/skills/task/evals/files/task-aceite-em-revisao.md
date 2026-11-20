# Task: Aceite de orçamento exige solicitação aberta

> Arquivo de apoio dos testes da skill `task` (cenário de aprovação do fechamento). Nos cenários,
> trate-o como `.agents/docs/tasks/2026-11-18-aceite-exige-solicitacao-aberta.md`.

- **Status:** `em andamento`
- **Criado em:** 2026-11-18
- **Atualizado em:** 2026-11-18 — fechamento preenchido, aguardando a revisão do Juno
- **Tipo:** `fix`
- **Alcance:** `só API`
- **Modo:** `agente implementa, Juno revisa`
- **Spec:** não se aplica
- **Bloqueada por:** não se aplica
- **Branch:** `fix/juno/aceite-exige-solicitacao-aberta` (sugerida; criada pelo Juno)

## 1. Contexto e critérios

### Problema

`AceitarOrcamentoUseCase` confere o dono da solicitação e se o orçamento está `pendente`, mas nunca o status
da **solicitação**. Cancelar a solicitação não encerra os orçamentos pendentes (`AtualizarSolicitacaoUseCase`
só troca o status), então dá para aceitar um orçamento de solicitação `cancelada`. O use-case grava o
orçamento como `aceito` e os outros como `encerrado` e **só depois** falha na transição
`cancelada → encerrada` do `AtualizarSolicitacaoUseCase`: o cliente recebe 422, o banco fica com estado
parcial e nenhum contrato é criado.

### Objetivo

O aceite só acontece com a solicitação `aberta`, e essa checagem é feita **antes de qualquer escrita**. Fora
disso: `OperacaoNaoPermitidaError` (422) e nada gravado.

### Referências

Decisões 1A, 2A e 3A (2026-11-18, `.notes/CLAUDE.md`, estacionamento);
`api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`; transições em
`api/src/domain/use-cases/solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case.ts`.

### CA-01: Aceite em solicitação cancelada é recusado sem gravar nada

- **Dado** um orçamento `pendente` de uma solicitação `cancelada` do cliente logado
- **Quando** o cliente aceita o orçamento (`PATCH /orcamentos/:id/aceitar`)
- **Então** recebe `OperacaoNaoPermitidaError` (422) com a mensagem
  "Só é possível aceitar orçamento de uma solicitação com status 'aberta'.", e nenhum orçamento é
  atualizado, a solicitação não é alterada e nenhum contrato é criado

### CA-02: Aceite em solicitação encerrada é recusado pela solicitação

- **Dado** um orçamento `encerrado` de uma solicitação `encerrada` do cliente logado (o caso real: o
  aceite de outro orçamento encerrou os dois)
- **Quando** o cliente aceita o orçamento
- **Então** recebe `OperacaoNaoPermitidaError` (422) com a mensagem do CA-01, e não a do orçamento
  `pendente`: a checagem da solicitação vem antes e aponta a causa real

### CA-03: Quem não é dono recebe 403 mesmo com a solicitação fechada

- **Dado** um orçamento de uma solicitação `cancelada` de **outro** cliente
- **Quando** o cliente logado tenta aceitar o orçamento
- **Então** recebe `AcessoProibidoError` (403), e não o erro de status (não revela o estado da
  solicitação de outro cliente — decisão 3A)

## 2. O que fazer nesta tarefa

### Fica fora

- cancelar a solicitação encerrar os orçamentos `pendente` (cascata no cancelamento — decisão 2B, no
  estacionamento; casa com o item 5e da remodelagem);
- transação Mongo no aceite (estacionamento "Transações");
- corrigir dados já gravados em estado parcial (não há produção).

### Decisões

- A checagem da solicitação vem depois da do dono e antes da do orçamento `pendente` e de qualquer escrita
  — descartada: antes da do dono (revelaria o estado da solicitação de outro cliente) — decisões 1A e 3A,
  2026-11-18.
- A regra mora num método da entidade (`Solicitacao.estaAberta()`), no padrão de `Servico.estaOfertado()`
  — descartada: comparar o status no use-case (o item 5e repetiria a regra) — decisão 2A, 2026-11-18.

### Em aberto

nada

### Passos

1. Na entidade `Solicitacao`, criar `estaAberta(): boolean` (status `aberta`), com JSDoc, no padrão de
   `Servico.estaOfertado()`: ponto único da regra, para o item 5e reaproveitar.
2. No `AceitarOrcamentoUseCase.execute`, depois da checagem do dono e **antes** da checagem do orçamento
   `pendente`, lançar `OperacaoNaoPermitidaError` com a mensagem do CA-01 quando
   `!solicitacao.estaAberta()`. Ordem final: orçamento existe → solicitação existe → dono → solicitação
   aberta → orçamento pendente → escritas. Atualizar o JSDoc (`@throws`).
3. Testes unitários do use-case para CA-01, CA-02 e CA-03, conferindo também que nenhuma escrita
   aconteceu (`orcamentoRepoMock.atualizar`, `atualizarSolicitacaoUseCaseMock.execute` e
   `criarContratoUseCaseMock.execute` não chamados).
4. Documentação da rota: no Swagger de `PATCH /orcamentos/{id}/aceitar`, citar a regra na `description`
   e na resposta 422; em `api/docs/Rotas.md`, a linha do aceite passa a citar "solicitação `aberta`".

### Ler antes de começar

- `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`
- `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.unit.spec.ts` (modelo dos testes; o de "não pendente" é o mais próximo)
- `api/src/domain/entities/servico/servico.entity.ts` (`estaOfertado()`, modelo do método)
- `api/src/domain/entities/solicitacao/solicitacao.entity.ts`
- `api/src/test-helpers/solicitacao.mother.ts` (aceita `status`; o padrão é `aberta`)
- `api/src/http/routes/orcamento/orcamento.routes.ts`

### Arquivos previstos

- alterados: `api/src/domain/entities/solicitacao/solicitacao.entity.ts`,
  `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`,
  `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.unit.spec.ts`,
  `api/src/http/routes/orcamento/orcamento.routes.ts` (só o comentário do Swagger),
  `api/docs/Rotas.md`
- criados: nenhum

### Não deve mudar

A rota e o contrato de `PATCH /orcamentos/:id/aceitar` (entrada, resposta 200,
códigos); `AtualizarSolicitacaoUseCase` e a tabela de transições; o cancelamento da solicitação; o
`errorHandler`; o schema/model da solicitação e do orçamento; a cascata do aceite feliz (encerrar os
outros pendentes, encerrar a solicitação, criar o contrato com o prazo em horas).

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

### Impacto

- **Contrato da API:** não — a rota, a entrada e os códigos continuam; muda só quando o 422 acontece
- **Banco:** não
- **Front:** não
- **Permissões e segurança:** não — a checagem do dono continua a primeira (CA-03)
- **Testes existentes que mudam de propósito:** não — procurado `aceitar` nos `.spec.ts`: os do use-case
  usam `SolicitacaoMother.criarValido` com status padrão `aberta` e continuam valendo; o do controller
  (`orcamento.controller.unit.spec.ts`) só confere a delegação ao use-case
- **Documentação:** sim — Swagger de `PATCH /orcamentos/{id}/aceitar` e a linha do aceite em `api/docs/Rotas.md`

Teste que quebrar e não estiver no eixo de testes é regressão até prova em contrário.

## 3. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-01 | `aceitar-orcamento.use-case.unit.spec.ts` — "deve recusar o aceite de solicitação cancelada sem gravar nada (CA-01)" |
| CA-02 | `aceitar-orcamento.use-case.unit.spec.ts` — "deve recusar o aceite de solicitação encerrada pela regra da solicitação (CA-02)" |
| CA-03 | `aceitar-orcamento.use-case.unit.spec.ts` — "deve lançar AcessoProibidoError para quem não é dono mesmo com a solicitação cancelada (CA-03)" |

CA-01 e CA-02 falham no código de hoje (CA-01: o use-case grava e segue; CA-02: sai a mensagem do
orçamento `pendente`). O CA-03 **já passa hoje** (o dono é
conferido primeiro): ele só prova junto da mutação que inverte a ordem das checagens (abaixo).

Comandos (dentro de `api/`; sem Node, pela imagem Docker `node:22`):

- `rtk npx tsc --noEmit`
- `rtk npm run test:unit`
- `rtk npm run test:integration -- --runInBand` (nada de integração muda; roda para provar que não quebrou)
- **Mutação manual** nas regras novas (como fazer: `.agents/docs/guides/testing.md`, seção 5.2):
  1. remover a checagem `!solicitacao.estaAberta()` → CA-01 e CA-02 devem falhar;
  2. `estaAberta()` sempre `true` → CA-01 e CA-02 devem falhar;
  3. `estaAberta()` sempre `false` → os testes do aceite feliz devem falhar;
  4. mover a checagem de status para **antes** da do dono → CA-03 deve falhar;
  5. mover a checagem de status para **depois** da do orçamento `pendente` → CA-02 deve falhar (sai a
     mensagem do orçamento);
  6. mover a checagem para depois de `orcamentoRepository.atualizar` → CA-01 deve falhar (escrita feita).

- **Checagem manual**, quando fizer sentido: não necessária (a rota não muda; a regra é toda do use-case).

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 4. Andamento

- 2026-11-18 — início da implementação; antes de começar: `npx tsc --noEmit` ok, unitários 80 / 435,
  integração 9 / 105 (Docker `node:22`).
- 2026-11-18 — implementação no commit `9d59084a`; 6 mutantes, 6 mortos.
- 2026-11-18 — fechamento preenchido; aguardando a revisão do Juno.

## 5. Fechamento

- **O que foi feito:** `Solicitacao.estaAberta()` criado; `AceitarOrcamentoUseCase` recusa com
  `OperacaoNaoPermitidaError` (422) quando a solicitação não está `aberta`, conferido depois do dono e
  antes do orçamento `pendente` e de qualquer escrita; JSDoc, Swagger e `api/docs/Rotas.md` atualizados.
- **Arquivos alterados:** exatamente os previstos: `solicitacao.entity.ts`, `aceitar-orcamento.use-case.ts`,
  `aceitar-orcamento.use-case.unit.spec.ts`, `orcamento.routes.ts` (só o comentário do Swagger) e
  `api/docs/Rotas.md`. Mais esta task (status e fechamento).
- **Decisões tomadas no caminho:**
  - Swagger da resposta 422 passou de `example` para `examples` (um por mensagem), como já faz
    `avaliacao.routes.ts`: a rota agora tem dois motivos de 422;
  - `Rotas.md` dizia "apenas prestador/dono" no aceite; corrigido para "o cliente dono" (quem aceita é o
    cliente, conforme o use-case).
- **Testes antes de começar:** `npx tsc --noEmit` ok; unitários 80 suítes / 435 testes passando;
  integração 9 suítes / 105 testes passando (Docker `node:22`). Com os testes novos e o código antigo:
  CA-01 e CA-02 falhando, CA-03 passando (como previsto na seção 3).
- **Testes no fim:** `npx tsc --noEmit` ok; unitários 80 suítes / 438 testes passando; integração 9
  suítes / 105 testes passando. Mutação: 6 mutantes (os 6 da seção 3), 6 mortos, nenhum vivo: remover a
  guarda e `estaAberta()` sempre `true` → CA-01 e CA-02; `estaAberta()` sempre `false` → os 5 testes do
  aceite feliz; guarda antes do dono → CA-03; guarda depois do `pendente` → CA-02; guarda depois da
  escrita → CA-01 e CA-02.
- **Evidência por critério:**
  - CA-01 → teste "deve recusar o aceite de solicitação cancelada sem gravar nada (CA-01)" passando;
  - CA-02 → teste "deve recusar o aceite de solicitação encerrada pela regra da solicitação (CA-02)" passando;
  - CA-03 → teste "deve lançar AcessoProibidoError para quem não é dono mesmo com a solicitação cancelada (CA-03)" passando (prova junto do mutante 4, morto).
- **Checagens não feitas:** checagem manual pelo Swagger (a seção 3 a dispensou: a rota não muda).
- **Ficou para depois:** cascata no cancelamento da solicitação (2B, estacionamento); task do
  `GET /clientes/:id` com o `whatsapp` fora do perfil público (4A).
- **Commits entregues:**

  ```text
  fix(orcamento): Recusa aceite de orçamento de solicitação não aberta

  - Solicitacao.estaAberta() concentra a regra, no padrão de
    Servico.estaOfertado();
  - o aceite confere a solicitação depois do dono e antes de qualquer
    escrita.

  Task: 2026-11-18-aceite-exige-solicitacao-aberta.md
  ```

  Arquivos:
  - `api/src/domain/entities/solicitacao/solicitacao.entity.ts`
  - `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`
  - `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.unit.spec.ts`

  ```text
  docs(orcamento): Documenta a regra de solicitação aberta no aceite

  - Swagger e Rotas.md citam a solicitação aberta no aceite.

  Task: 2026-11-18-aceite-exige-solicitacao-aberta.md
  ```

  Arquivos:
  - `api/src/http/routes/orcamento/orcamento.routes.ts`
  - `api/docs/Rotas.md`

  ```text
  docs(orcamento): Fecha a task do aceite exigir solicitação aberta

  - fechamento preenchido com a evidência de cada critério.

  Task: 2026-11-18-aceite-exige-solicitacao-aberta.md
  ```

  Arquivos:
  - `.agents/docs/tasks/2026-11-18-aceite-exige-solicitacao-aberta.md`
