# Task: Restringir o perfil público do cliente a prestador logado ou ao próprio cliente

> Arquivo de apoio dos testes da skill `task` (cenário de fechamento). Nos cenários, trate-o como
> `.agents/docs/tasks/2026-11-16-restringir-perfil-cliente.md`.

- **Status:** `em andamento`
- **Criado em:** 2026-11-16
- **Atualizado em:** 2026-11-16 — início da implementação
- **Tipo:** `fix`
- **Alcance:** `só API`
- **Branch:** `fix/juno/restringir-perfil-cliente`

## 2. Contexto e critérios (task avulsa)

- **Problema:** `GET /clientes/:id` responde o perfil público de qualquer cliente a qualquer usuário
  logado. A decisão de 2026-11-11 (reputação do cliente) diz que clientes não veem o perfil nem as
  avaliações de outros clientes.
- **Objetivo:** a rota só responde a um prestador logado ou ao próprio cliente; os demais recebem 403.
- **Fica fora:** mudar os campos do `ClientePerfilPublico`; rota de reputação (já restrita); front.
- **Referências:** `api/src/domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case.ts`
  (mesma regra de acesso).

### CA-01: Prestador logado vê o perfil

- **Dado** um usuário logado com perfil de prestador
- **Quando** ele chama `GET /clientes/:id` de um cliente existente
- **Então** recebe 200 com o perfil público do cliente

### CA-02: O próprio cliente vê o perfil

- **Dado** um cliente logado sem perfil de prestador
- **Quando** ele chama `GET /clientes/:id` com o próprio id
- **Então** recebe 200 com o próprio perfil público

### CA-03: Outro cliente é recusado

- **Dado** um cliente logado sem perfil de prestador
- **Quando** ele chama `GET /clientes/:id` com o id de outro cliente
- **Então** recebe 403 (`AcessoProibidoError`)

## 3. O que fazer nesta tarefa

1. `BuscarClientePorIdUseCase.execute` passa a receber os ids do token e aplica a regra antes de buscar.
2. O controller repassa `request.user.idCliente` e `request.user.idPrestador`.
3. Testes unitários do use-case e do controller; Swagger com a resposta 403.

**Ler antes de começar:**

- `api/src/domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case.ts`
- `api/src/domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case.unit.spec.ts`

**Arquivos previstos:**

- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.unit.spec.ts`
- `api/src/http/controllers/usuario/cliente/cliente.controller.ts`
- `api/src/http/controllers/usuario/cliente/cliente.controller.unit.spec.ts`
- `api/src/http/routes/usuario/cliente/cliente.routes.ts` (Swagger)

**Não deve mudar:** campos do `ClientePerfilPublico`; demais rotas de cliente.

**Testes existentes que vão mudar de propósito:** `buscar-cliente-por-id.use-case.unit.spec.ts` e o teste
de `buscarPorId` do controller — passam a enviar os ids do token.

## 4. Como validar o que foi feito

**Antes de começar:** unit 80 suítes / 435 ✅; integração 9 / 105 ✅ (2026-11-16, Docker `node:22`).

| Critério | Teste que prova |
|---|---|
| CA-01 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve retornar o perfil para prestador logado (CA-01)" |
| CA-02 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve retornar o perfil para o próprio cliente (CA-02)" |
| CA-03 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve recusar outro cliente (CA-03)" |

Comandos (dentro de `api/`):

- `npx tsc --noEmit`
- `npm run test:unit`
- `npm run test:integration -- --runInBand`
- **Mutação manual:** inverter a comparação de ids; remover a checagem do prestador — as duas devem
  ser detectadas.

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
