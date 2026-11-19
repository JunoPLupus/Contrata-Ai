# Task: Restringir o perfil público do cliente (GET /clientes/:id)

- **Status:** `aberta`
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-19 — criação
- **Tipo:** `fix`
- **Alcance:** `só API`
- **Branch:** `fix/juno/restringir-perfil-cliente` (sugerida; criada pelo Juno)

## 2. Contexto e critérios (task avulsa)

- **Problema:** `GET /clientes/:id` só exige token. Qualquer usuário logado, inclusive outro cliente,
  vê o perfil público de qualquer cliente, e esse perfil (`ClientePerfilPublicoDto`) traz o `whatsapp`.
  O `ClienteController.buscarPorId` repassa o id direto para o `BuscarClientePorIdUseCase`, que só busca
  (`usuarioRepository.buscarPorId(id)`), sem nenhuma regra de acesso. A rota irmã de reputação
  (`GET /clientes/:idCliente/avaliacoes`) já restringe a prestador logado ou o próprio cliente.
- **Objetivo:** `GET /clientes/:id` segue a mesma regra de acesso da reputação (prestador logado ou o
  próprio cliente; os outros recebem `AcessoProibidoError`, 403) e o perfil público deixa de trazer o
  `whatsapp`: fica `nome` e `reputacao_flag_cancelamento`.
- **Fica fora:**
  - conferir se o id é de um "perfil de cliente": todo usuário é cliente (`idCliente` do token é o
    `usuario.id`, em `login.use-case.ts`), então não há usuário que não seja cliente para recusar;
  - esconder cliente inativo (`ativo === false`) no perfil público;
  - mexer no perfil público do prestador (`GET /prestadores/:id`);
  - onde o contato (`whatsapp`) passa a aparecer para quem tem contrato: fica com o contrato.
- **Referências:** decisões de 2026-11-18 em `.notes/CLAUDE.md` (acesso igual ao da reputação; 4A, tirar
  o `whatsapp` do perfil público);
  `api/src/domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case.ts`
  (regra de acesso modelo).

### CA-01: Outro cliente não vê o perfil

- **Dado** um usuário logado sem perfil de prestador
- **Quando** ele busca o perfil de **outro** cliente (`GET /clientes/:id`)
- **Então** recebe `AcessoProibidoError` (403) com a mensagem
  "Você não têm permissão para acessar este recurso.", e o repositório não é consultado

### CA-02: Prestador logado vê o perfil de qualquer cliente

- **Dado** um usuário logado com perfil de prestador (`idPrestador` no token)
- **Quando** ele busca o perfil de um cliente que não é ele
- **Então** recebe 200 com o perfil público do cliente

### CA-03: O próprio cliente vê o seu perfil

- **Dado** um usuário logado sem perfil de prestador
- **Quando** ele busca o perfil com o próprio id
- **Então** recebe 200 com o perfil público

### CA-04: Perfil público sem whatsapp

- **Dado** um cliente com `whatsapp` cadastrado
- **Quando** quem tem acesso busca o perfil público dele
- **Então** a resposta tem só `nome` e `reputacao_flag_cancelamento`, sem o campo `whatsapp`

## 3. O que fazer nesta tarefa

1. Regra de acesso no domínio — **depende de Q1** (onde a regra mora, já que o
   `BuscarClientePorIdUseCase` também atende `GET /clientes`, o cliente logado). Seja qual for o lugar, a
   checagem vem **antes** da busca no repositório, como no modelo da reputação, com o `@throws
   {AcessoProibidoError}` no JSDoc.
2. `ClienteController.buscarPorId` passa a repassar `request.user!.idCliente` e
   `request.user!.idPrestador`, como o `AvaliacaoController.buscarDoCliente`.
3. `ClientePerfilPublicoDto` vira `Pick<Usuario, 'nome' | 'reputacao_flag_cancelamento'>` e
   `ClienteMapper.paraPerfilPublicoDto` deixa de copiar o `whatsapp`.
4. Testes unitários do use-case (CA-01 a CA-03) e do controller (repasse dos ids do token; CA-04 com o
   objeto literal esperado, sem comparar com a saída do próprio mapper).
5. Documentação: no Swagger de `GET /clientes/{id}`, a `description` e a resposta 403 citam a regra (como
   em `GET /clientes/{idCliente}/avaliacoes`); o schema `ClientePerfilPublico` em `swagger.config.ts`
   perde o `whatsapp`; em `api/docs/Rotas.md`, a linha de `GET /clientes/{id}` cita "só prestador logado
   ou o próprio cliente".

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.unit.spec.ts`
- `api/src/domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case.ts` (regra modelo)
- `api/src/domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case.unit.spec.ts` (modelo dos testes de acesso)
- `api/src/http/controllers/usuario/cliente/cliente.controller.ts`
- `api/src/http/controllers/usuario/cliente/cliente.controller.unit.spec.ts`
- `api/src/http/controllers/avaliacao/avaliacao.controller.ts` (`buscarDoCliente`, repasse dos ids do token)
- `api/src/http/mappers/usuario/cliente/cliente.mapper.ts`
- `api/src/http/dto/usuario/cliente/cliente-perfil-publico.dto.ts`
- `api/src/http/routes/usuario/cliente/cliente.routes.ts`
- `api/src/http/docs/swagger.config.ts` (schema `ClientePerfilPublico`)

**Arquivos previstos:**

- alterados: `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
  e o `.unit.spec.ts` ao lado (ou, conforme Q1, o use-case novo e seu teste),
  `api/src/http/controllers/usuario/cliente/cliente.controller.ts`,
  `api/src/http/controllers/usuario/cliente/cliente.controller.unit.spec.ts`,
  `api/src/http/mappers/usuario/cliente/cliente.mapper.ts`,
  `api/src/http/dto/usuario/cliente/cliente-perfil-publico.dto.ts`,
  `api/src/http/routes/usuario/cliente/cliente.routes.ts` (só o comentário do Swagger),
  `api/src/http/docs/swagger.config.ts` (só o schema `ClientePerfilPublico`),
  `api/docs/Rotas.md`
- criados: nenhum (depende de Q1: na opção B, a pasta do use-case novo e o registro em
  `api/src/shared/container.ts`)

**Não deve mudar:** `GET /clientes` (perfil completo do logado, `ClientePerfilDto` com `whatsapp`),
`PUT /clientes` e `POST /clientes`; `GET /clientes/:idCliente/avaliacoes` e o
`BuscarAvaliacoesDoClienteUseCase`; o perfil público do prestador (`PrestadorMapper`, `GET /prestadores/:id`);
o `AcessoProibidoError` e o `errorHandler`; o model/schema do usuário; o front (`web/` não chama
`/clientes/:id`).

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** procurado `buscarPorId`, `paraPerfilPublicoDto` e
`BuscarClientePorId` nos `.spec.ts`:

- `cliente.controller.unit.spec.ts` — "deve retornar resposta com sucesso 200 e o perfil público ao buscar
  o id de outro cliente": hoje prova o comportamento antigo (cliente vê outro cliente). Muda para o caso
  do prestador, e os dois testes de `buscarPorId` passam a esperar o repasse de `idCliente`/`idPrestador`
  do token. Ao trocar a asserção do `res.json` para o objeto literal, eles deixam de passar com o
  `whatsapp` de volta.
- `buscar-cliente-por-id.use-case.unit.spec.ts` — os dois testes atuais mudam de chamada se a assinatura
  do `execute` mudar (Q1, opção A).
- O teste de `buscarLogado` no controller muda só se a assinatura mudar (Q1, opção A).

## 4. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-01 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve lançar AcessoProibidoError quando outro cliente busca o perfil (CA-01)" |
| CA-02 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve retornar o cliente quando quem busca é prestador (CA-02)" |
| CA-03 | `buscar-cliente-por-id.use-case.unit.spec.ts` — "deve retornar o cliente quando ele busca o próprio perfil (CA-03)" |
| CA-04 | `cliente.controller.unit.spec.ts` — "deve retornar o perfil público sem o whatsapp (CA-04)" |

Os nomes dos testes de CA-01 a CA-03 valem para a opção A de Q1; na opção B, os mesmos nomes vão para o
`.unit.spec.ts` do use-case novo.

CA-02 e CA-03 já passam hoje (não há regra nenhuma): só provam algo junto das mutações abaixo. CA-01 e
CA-04 falham no código de hoje.

Comandos (dentro de `api/`; sem Node, pela imagem Docker `node:22`):

- `rtk npx tsc --noEmit`
- `rtk npm run test:unit`
- `rtk npm run test:integration -- --runInBand` (nenhum teste de integração cobre a rota, mas o DTO e o
  mapper mudam)
- **Mutação manual** nas regras novas (como fazer: `.agents/docs/guides/testing.md`, seção 5.2):
  1. remover a checagem de acesso → CA-01 deve falhar;
  2. trocar `!idPrestadorLogado && !ehOProprioCliente` por `!idPrestadorLogado` → CA-03 deve falhar;
  3. trocar por `!ehOProprioCliente` → CA-02 deve falhar;
  4. devolver `whatsapp` no `paraPerfilPublicoDto` → CA-04 deve falhar;
  5. no controller, repassar `undefined` no lugar de `request.user!.idPrestador` → o teste de repasse
     deve falhar.

- **Checagem manual:** pelo Swagger, com o token de um cliente sem perfil de prestador, chamar
  `GET /clientes/{id}` com o id de outro cliente (403) e com o próprio id (200, sem `whatsapp`).

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

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
