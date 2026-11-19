# Task: Aceite de orçamento exige solicitação aberta

> Arquivo de apoio dos testes da skill `task` (cenário de fechamento com evidência completa). Nos
> cenários, trate-o como `.agents/docs/tasks/2026-11-18-aceite-exige-solicitacao-aberta.md`.

- **Status:** `em andamento`
- **Criado em:** 2026-11-18
- **Atualizado em:** 2026-11-18 — início da implementação
- **Tipo:** `fix`
- **Alcance:** `só API`
- **Branch:** `fix/juno/aceite-exige-solicitacao-aberta` (sugerida; criada pelo Juno)

## 2. Contexto e critérios (task avulsa)

- **Problema:** `AceitarOrcamentoUseCase` confere o dono da solicitação e se o orçamento está `pendente`,
  mas nunca o status da **solicitação**. Cancelar a solicitação não encerra os orçamentos pendentes
  (`AtualizarSolicitacaoUseCase` só troca o status), então dá para aceitar um orçamento de solicitação
  `cancelada`. O use-case grava o orçamento como `aceito` e os outros como `encerrado` e **só depois**
  falha na transição `cancelada → encerrada` do `AtualizarSolicitacaoUseCase`: o cliente recebe 422,
  o banco fica com estado parcial e nenhum contrato é criado.
- **Objetivo:** o aceite só acontece com a solicitação `aberta`, e essa checagem é feita **antes de
  qualquer escrita**. Fora disso: `OperacaoNaoPermitidaError` (422) e nada gravado.
- **Fica fora:**
  - cancelar a solicitação encerrar os orçamentos `pendente` (cascata no cancelamento — decisão 2B,
    no estacionamento; casa com o item 5e da remodelagem);
  - transação Mongo no aceite (estacionamento "Transações");
  - corrigir dados já gravados em estado parcial (não há produção).
- **Referências:** decisões 1A, 2A e 3A (2026-11-18, `.notes/CLAUDE.md`, estacionamento);
  `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`;
  transições em `api/src/domain/use-cases/solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case.ts`.

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

## 3. O que fazer nesta tarefa

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

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`
- `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.unit.spec.ts` (modelo dos testes; o de "não pendente" é o mais próximo)
- `api/src/domain/entities/servico/servico.entity.ts` (`estaOfertado()`, modelo do método)
- `api/src/domain/entities/solicitacao/solicitacao.entity.ts`
- `api/src/test-helpers/solicitacao.mother.ts` (aceita `status`; o padrão é `aberta`)
- `api/src/http/routes/orcamento/orcamento.routes.ts`

**Arquivos previstos:**

- alterados: `api/src/domain/entities/solicitacao/solicitacao.entity.ts`,
  `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.ts`,
  `api/src/domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case.unit.spec.ts`,
  `api/src/http/routes/orcamento/orcamento.routes.ts` (só o comentário do Swagger),
  `api/docs/Rotas.md`
- criados: nenhum

**Não deve mudar:** a rota e o contrato de `PATCH /orcamentos/:id/aceitar` (entrada, resposta 200,
códigos); `AtualizarSolicitacaoUseCase` e a tabela de transições; o cancelamento da solicitação; o
`errorHandler`; o schema/model da solicitação e do orçamento; a cascata do aceite feliz (encerrar os
outros pendentes, encerrar a solicitação, criar o contrato com o prazo em horas).

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** nenhum. Procurado `aceitar` nos `.spec.ts`: os do
use-case usam `SolicitacaoMother.criarValido` com status padrão `aberta` e continuam valendo; o do
controller (`orcamento.controller.unit.spec.ts`) só confere a delegação ao use-case.

## 4. Como validar o que foi feito

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

Comandos (a partir da raiz, pela imagem Docker `node:22`; a máquina tem pouca memória, então esta task
roda só o que a mudança afeta):

- `docker run --rm -v "$PWD/api":/app -w /app node:22 npx tsc --noEmit`
- `docker run --rm -v "$PWD/api":/app -w /app node:22 npx jest src/domain/use-cases/orcamento/aceitar-orcamento`

- **Checagem manual**, quando fizer sentido: não necessária (a rota não muda; a regra é toda do use-case).

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

- **O que foi feito:**
- **Arquivos alterados:**
- **Decisões tomadas no caminho:**
- **Testes antes de começar:** `npx tsc --noEmit` ok; `aceitar-orcamento`: 1 suíte / 9 testes passando
  (Docker `node:22`).
- **Testes no fim:**
- **Evidência por critério:**
- **Checagens não feitas:**
- **Ficou para depois:**
- **Commits entregues:**
