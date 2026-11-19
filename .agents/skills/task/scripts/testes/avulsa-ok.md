# Task: Restringir o perfil do cliente

- **Status:** `aberta`
- **Criado em:** 2026-11-18
- **Atualizado em:** 2026-11-18 — criação
- **Tipo:** `fix`
- **Alcance:** `só API`
- **Branch:** `fix/juno/restringir-perfil-cliente` (sugerida; criada pelo Juno)

## 2. Contexto e critérios (task avulsa)

- **Problema:** qualquer usuário logado vê o perfil de qualquer cliente.
- **Objetivo:** só prestador logado ou o próprio cliente veem; os demais recebem 403.
- **Fica fora:** front.
- **Referências:** decisão de 2026-11-11.

### CA-01: Prestador vê o perfil

- **Dado** um prestador logado
- **Quando** ele chama `GET /clientes/:id`
- **Então** recebe 200

### CA-02: Outro cliente é recusado

- **Dado** um cliente logado sem perfil de prestador
- **Quando** ele chama `GET /clientes/:id` de outro cliente
- **Então** recebe 403 (`AcessoProibidoError`)

## 3. O que fazer nesta tarefa

1. O use-case recebe os ids do token e aplica a regra.
2. O controller repassa os ids.

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
- api/src/http/controllers/usuario/cliente/cliente.controller.ts:40 (método `buscarPorId`).

**Arquivos previstos:** `api/src/domain/regras/pode-ver-perfil.ts` (novo)

**Não deve mudar:** campos do `ClientePerfilPublico`.

**Testes existentes que vão mudar de propósito:** nenhum (procurado com `rtk grep`).

## 4. Como validar o que foi feito

| Critério | Teste que prova |
|---|---|
| CA-01 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve retornar o perfil para prestador (CA-01)" |
| CA-02 | `buscar-cliente-por-id.use-case.unit.spec.ts` — “deve recusar outro cliente (CA-02)” |

Comandos: `npm run test:unit`.

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
