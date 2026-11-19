# Task: Restringir o perfil público do cliente (GET /clientes/:id)

- **Status:** `concluída`
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-19 — aprovada na revisão do Juno
- **Tipo:** `fix`
- **Alcance:** `só API`
- **Branch:** `fix/juno/restringir-perfil-cliente` (sugerida; criada pelo Juno)

## 2. Contexto e critérios (task avulsa)

- **Problema:** `GET /clientes/:id` só exige token. Qualquer usuário logado, inclusive outro cliente,
  vê o perfil público de qualquer cliente, e esse perfil (`ClientePerfilPublicoDto`) traz o `whatsapp`.
  A rota é a visão **pública** do cliente, feita para o prestador decidir se vale orçar. O próprio
  cliente já tem a sua rota, `GET /clientes` (perfil completo).
- **Objetivo:** `GET /clientes/:id` passa a exigir o perfil de prestador, como as outras rotas só de
  prestador (`exigeAutenticacao, exigePerfilPrestador`), e o perfil público deixa de trazer o
  `whatsapp`: fica `nome` e `reputacao_flag_cancelamento`.
- **Fica fora:**
  - juntar `GET /clientes` e `GET /clientes/:id`: atendem públicos diferentes (o dono e o prestador)
    com respostas diferentes;
  - conferir se o id é de um "perfil de cliente": todo usuário é cliente (`idCliente` do token é o
    `usuario.id`, em `login.use-case.ts`), então não há usuário que não seja cliente para recusar;
  - a regra de acesso da reputação (`GET /clientes/:idCliente/avaliacoes`, prestador ou o próprio
    cliente): lá o "próprio cliente" faz sentido, porque ele não tem outra rota para ver a reputação;
  - esconder cliente inativo (`ativo === false`) no perfil público;
  - mexer no perfil público do prestador (`GET /prestadores/:id`);
  - onde o contato (`whatsapp`) passa a aparecer para quem tem contrato: fica com o contrato.
- **Referências:** decisões de 2026-11-18 em `.notes/CLAUDE.md` (4A, tirar o `whatsapp` do perfil
  público) e decisões de 2026-11-19 na revisão do Juno (só prestador; middleware; Q1 C; Q2 A);
  `api/src/http/routes/servico/servico.routes.ts` (rotas só de prestador, modelo).

### CA-01: Cliente sem perfil de prestador não vê o perfil

- **Dado** um usuário logado sem perfil de prestador (sem `idPrestador` no token), seja outro cliente
  ou o próprio
- **Quando** ele busca um perfil público (`GET /clientes/:id`)
- **Então** recebe 403 do `exigePerfilPrestador`, com a mensagem
  "Acesso negado! É necessário ter o perfil de prestador ativo.", e o controller não é chamado

### CA-02: Prestador logado vê o perfil de qualquer cliente

- **Dado** um usuário logado com perfil de prestador (`idPrestador` no token)
- **Quando** ele busca o perfil público de um cliente
- **Então** a requisição passa pela autenticação e pelo perfil de prestador e chega ao controller,
  que responde 200 com o perfil público

### CA-03: Perfil público sem whatsapp

- **Dado** um cliente com `whatsapp` cadastrado
- **Quando** um prestador busca o perfil público dele
- **Então** a resposta tem só `nome` e `reputacao_flag_cancelamento`, sem o campo `whatsapp`

## 3. O que fazer nesta tarefa

1. Em `cliente.routes.ts`, a rota vira
   `clienteRouter.get('/clientes/:id', exigeAutenticacao, exigePerfilPrestador, …)`, como as rotas de
   `servico.routes.ts`. A ordem importa: o `exigePerfilPrestador` lê o `req.user`, que só o
   `exigeAutenticacao` preenche. Invertida, a rota responde 403 para todo mundo, prestador incluído.
2. `ClientePerfilPublicoDto` vira `Pick<Usuario, 'nome' | 'reputacao_flag_cancelamento'>` e
   `ClienteMapper.paraPerfilPublicoDto` deixa de copiar o `whatsapp`.
3. `BuscarClientePorIdUseCase` e `ClienteController` **não mudam** de comportamento (decisão Q2 A: a regra
   fica num lugar só, o middleware).
4. Teste da rota (decisão Q1 C), novo: `cliente.routes.unit.spec.ts`, com `supertest`, um app Express
   mínimo com o `clienteRouter`, o `container` mockado e os dois middlewares trocados por mocks que só
   chamam `next()`. Ele prova a **ligação** e a **ordem** (pelo `mock.invocationCallOrder`): autenticação →
   perfil de prestador → controller. A lógica de cada middleware continua testada só no teste do próprio
   middleware.
5. No teste do controller, o CA-03 confere o objeto literal esperado (sem comparar com a saída do
   próprio mapper).
6. Documentação: no Swagger de `GET /clientes/{id}`, a `description` cita a regra e a resposta 403 usa
   `Erro403Prestador`, como as rotas de serviço; o schema `ClientePerfilPublico` em `swagger.config.ts`
   perde o `whatsapp`; em `api/docs/Rotas.md`, a linha de `GET /clientes/{id}` cita "só prestador
   logado".

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- `api/src/http/routes/usuario/cliente/cliente.routes.ts`
- `api/src/http/routes/servico/servico.routes.ts` (rotas só de prestador e o Swagger com `Erro403Prestador`)
- `api/src/http/middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware.ts` e o `.unit.spec.ts` ao lado
- `api/src/http/middlewares/exige-autenticacao/exige-autenticacao.middleware.ts` (quem preenche o `req.user`)
- `api/src/http/controllers/usuario/cliente/cliente.controller.unit.spec.ts`
- `api/src/http/mappers/usuario/cliente/cliente.mapper.ts`
- `api/src/http/dto/usuario/cliente/cliente-perfil-publico.dto.ts`
- `api/src/http/docs/swagger.config.ts` (schema `ClientePerfilPublico` e `Erro403Prestador`)

**Arquivos previstos:**

- alterados: `api/src/http/routes/usuario/cliente/cliente.routes.ts` (middleware e Swagger),
  `api/src/http/controllers/usuario/cliente/cliente.controller.unit.spec.ts` (CA-03),
  `api/src/http/mappers/usuario/cliente/cliente.mapper.ts`,
  `api/src/http/dto/usuario/cliente/cliente-perfil-publico.dto.ts`,
  `api/src/http/docs/swagger.config.ts` (só o schema `ClientePerfilPublico`),
  `api/docs/Rotas.md`
- criados: `api/src/http/routes/usuario/cliente/cliente.routes.unit.spec.ts`

**Não deve mudar:** `BuscarClientePorIdUseCase` e `ClienteController` (código e assinatura);
`GET /clientes` (perfil completo do logado, `ClientePerfilDto` com `whatsapp`), `PUT /clientes` e
`POST /clientes`; `GET /clientes/:idCliente/avaliacoes` e o `BuscarAvaliacoesDoClienteUseCase`; os dois
middlewares e os testes deles; o perfil público do prestador (`PrestadorMapper`, `GET /prestadores/:id`);
o model/schema do usuário; o `package.json` (o `supertest` já está nas `devDependencies`); o front
(`web/` não chama `/clientes/:id`).

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** procurado `buscarPorId`, `paraPerfilPublicoDto` e
`BuscarClientePorId` nos `.spec.ts`:

- `cliente.controller.unit.spec.ts` — "deve retornar resposta com sucesso 200 e o perfil público ao buscar
  o id de outro cliente" hoje compara com a saída do próprio mapper e passaria com o `whatsapp` de volta;
  vira o teste do CA-03, com o objeto literal. O de "ao buscar o próprio id" continua provando só o
  repasse do id ao use-case e o 200.

## 4. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-01 | `cliente.routes.unit.spec.ts` — "deve exigir autenticação e depois o perfil de prestador em GET /clientes/:id (CA-01)" |
| CA-02 | `cliente.routes.unit.spec.ts` — "deve chegar ao controller e responder 200 depois dos dois middlewares (CA-02)" |
| CA-03 | `cliente.controller.unit.spec.ts` — "deve retornar o perfil público sem o whatsapp (CA-03)" |

O teste da rota prova a ligação e a ordem; o 403 e a mensagem do CA-01 são provados pelo teste do
próprio `exigePerfilPrestador` (que já existe e não muda). CA-02 já passa hoje (a rota já chega ao
controller): só prova algo junto das mutações abaixo. CA-01 e CA-03 falham no código de hoje.

Comandos (dentro de `api/`; sem Node, pela imagem Docker `node:22`):

- `rtk npx tsc --noEmit`
- `rtk npm run test:unit`
- `rtk npm run test:integration -- --runInBand` (nenhum teste de integração cobre a rota, mas o DTO e o
  mapper mudam)
- **Mutação manual** nas regras novas (como fazer: `.agents/docs/guides/testing.md`, seção 5.2):
  1. tirar o `exigePerfilPrestador` da rota → CA-01 deve falhar;
  2. inverter a ordem (`exigePerfilPrestador, exigeAutenticacao`) → CA-01 deve falhar;
  3. tirar o `exigeAutenticacao` da rota → CA-01 deve falhar;
  4. ligar a rota em outro método do controller (ex.: `buscarLogado`) → CA-02 deve falhar;
  5. devolver `whatsapp` no DTO e no `paraPerfilPublicoDto` → CA-03 deve falhar.

- **Checagem manual:** pelo Swagger, com o token de um cliente sem perfil de prestador, chamar
  `GET /clientes/{id}` (403) e, com o de um prestador, chamar de novo (200, sem `whatsapp`).

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

- **O que foi feito:** `GET /clientes/:id` passou a usar `exigeAutenticacao, exigePerfilPrestador`.
  O `ClientePerfilPublicoDto` e o `ClienteMapper.paraPerfilPublicoDto` não têm mais `whatsapp`. Teste
  novo da rota (ligação e ordem dos middlewares) e teste do controller com o objeto literal do perfil
  público. Swagger (rota com `Erro403Prestador` e schema sem `whatsapp`) e `Rotas.md` atualizados.
  `BuscarClientePorIdUseCase` e `ClienteController` ficaram como estavam.
- **Arquivos alterados:** exatamente os 6 alterados e o 1 criado previstos, mais esta task.
- **Decisões tomadas no caminho:**
  - Q1 A (2026-11-19), depois revista: a regra "prestador ou o próprio cliente" morou no
    `BuscarClientePorIdUseCase`. Na revisão, o Juno apontou que o próprio cliente já tem `GET /clientes`,
    então `GET /clientes/:id` é só para prestador.
  - Só prestador, pelo middleware `exigePerfilPrestador` (2026-11-19): é o padrão de todas as rotas só
    de prestador. A regra no use-case foi desfeita (Q2 A: a regra fica num lugar só).
  - Teste da rota com `supertest` e middlewares mockados (Q1 C, 2026-11-19): prova só a ligação e a
    ordem, sem repetir a lógica do middleware, que já tem teste próprio. É o primeiro teste de rota do
    projeto: nenhum teste conferia se uma rota usa o middleware certo, na ordem certa. A ordem entrou
    por pedido do Juno: invertida, a rota recusa todo mundo.
  - Ajuste da revisão do Juno (2026-11-19): as strings repetidas nos testes viraram constantes locais
    (`idCliente` e `rotaPerfilPublico` no teste da rota; `nomeCliente` no CA-03 do controller). Depois do
    ajuste: `tsc` ok, unitários 81 suítes / 440 testes passando e as 5 mutações ainda mortas
    (integração não rodou de novo: só mudaram arquivos de teste unitário).
- **Testes antes de começar:** `tsc --noEmit` ok; unitários 80 suítes / 438 testes passando; integração
  9 suítes / 105 testes passando (Docker `node:22`, no commit `74d06dfb`).
- **Testes no fim:** `tsc --noEmit` ok; unitários 81 suítes / 440 testes passando (+1 suíte e +2
  testes: o da rota); integração 9 suítes / 105 testes passando. Mutação: 5 mutantes, 5 mortos — M1 sem
  `exigePerfilPrestador` → 2 falhas no teste da rota; M2 ordem invertida → 1 falha; M3 sem
  `exigeAutenticacao` → 1 falha; M4 rota ligada no `buscarLogado` → 1 falha; M5 `whatsapp` de volta no
  DTO e no mapper → 1 falha (CA-03).
- **Evidência por critério:** CA-01 → "deve exigir autenticação e depois o perfil de prestador em
  GET /clientes/:id (CA-01)" passando (o 403 e a mensagem, pelo teste do `exigePerfilPrestador`, que já
  existia); CA-02 → "deve chegar ao controller e responder 200 depois dos dois middlewares (CA-02)"
  passando; CA-03 → "deve retornar o perfil público sem o whatsapp (CA-03)" passando.
- **Checagens não feitas:** a checagem manual pelo Swagger (403 para cliente sem perfil de prestador,
  200 sem `whatsapp` para prestador): não subi a API nem um Mongo local nesta sessão. A ligação está
  coberta pelo teste da rota e pelas mutações.
- **Ficou para depois:** as outras rotas também não têm teste de ligação dos middlewares. O
  `cliente.routes.unit.spec.ts` pode servir de modelo, se valer a pena (estacionamento). Os itens de
  "Fica fora" continuam como estavam.
- **Commits entregues:**
  1. `fix(cliente): Restringe o perfil público do cliente a prestadores` — `cliente.routes.ts`,
     `cliente.routes.unit.spec.ts` (novo), `cliente.controller.unit.spec.ts`, `cliente.mapper.ts`,
     `cliente-perfil-publico.dto.ts`, `swagger.config.ts`, `Rotas.md`.
  2. `docs(cliente): Conclui a task de restringir o perfil público do cliente` — a task (a criação
     já foi commitada em `74d06dfb`).
