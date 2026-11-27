# AGENTS.md — ContrataAí

Instruções para agentes de IA que trabalham neste repositório (Claude Code, Codex, Cursor, Gemini,
Copilot ou qualquer outro). Este arquivo é a porta de entrada: leia-o inteiro antes de agir.
O material de apoio fica em [`.agents/`](.agents/README.md).

## Sobre o projeto

ContrataAí é uma plataforma web que conecta **clientes** e **prestadores** de serviço. Ela é só a ponte
de contato: pagamento e execução ficam por conta das partes, fora da plataforma. É um projeto de
extensão universitário (disciplina Extensão III), num monorepo com dois projetos:

- `api/` — backend em TypeScript + Express + MongoDB (Mongoose), em camadas / DDD.
- `web/` — frontend em Angular (standalone components).

Documentação existente: requisitos e casos de uso em `docs/`, rotas em `api/docs/Rotas.md`,
decisões de arquitetura (ADRs, em AsciiDoc) em `api/docs/adr/`.

## Estrutura do backend (`api/src/`)

| Pasta | Conteúdo |
|---|---|
| `domain/` | entities, value-objects, use-cases, factories, repositories (interfaces), dtos, errors |
| `http/` | controllers, routes, mappers, middlewares, dtos |
| `infra/` | models (Mongoose) e repositories (implementações) + mappers |
| `shared/` | config e container (injeção de dependências) |
| `test-helpers/` | object mothers para os testes |

## Comandos

**Prefixo `rtk` obrigatório em todos os comandos** — não só nos da tabela abaixo (`rtk git diff`,
`rtk grep …`, `rtk npm test`…). O rtk condensa a saída e economiza contexto.

- **Exceção:** processos longos ou interativos, que não terminam sozinhos (`npm run dev`, watchers).
  Rode-os sem `rtk`, em segundo plano, e leia só o trecho do log que precisar — nunca o fluxo inteiro.
- **rtk não instalado** (`rtk: command not found`): **pare**, avise o usuário, aponte a instalação
  (ver README, seção "Desenvolvimento com agentes de IA") e espere ele instalar ou autorizar seguir sem.
  Não contorne em silêncio nem instale por conta própria.

Comandos da API (rodar dentro de `api/`):

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe a API com nodemon + ts-node (exceção: sem `rtk`) |
| `rtk npm run build` | compila com `tsc` |

- Sem Node na máquina? Rode pela imagem Docker `node:22`, montando a pasta `api/`. O `rtk` vai no
  comando da máquina (`rtk docker run …`), nunca dentro do container.
- Comandos de teste (API e scripts de `.agents/`) e o CI: guia
  [`testing.md`](.agents/docs/guides/testing.md), seção 3.

## Convenções do código

- Antes de propor mudança, **leia o código real** e siga o padrão vigente. Não introduza estilo novo
  sem motivo; se achar que o padrão deve mudar, proponha e explique antes.
- Regras de negócio ficam nos **use-cases** (um por pasta, com `.unit.spec.ts` ao lado) e em
  **métodos da entidade** (ex.: `podeSerAlterada()`, `estaOfertado()`).
- **Value objects** guardam invariantes (email, telefone, cep) e enums/status de conjunto fechado.
  Siga o padrão dos VOs de status já existentes.
- Erros de domínio próprios (`domain/errors`), sem status HTTP no domínio.
- DTOs separados por camada, com mappers entre elas.
- Autenticação por JWT; senhas com bcrypt.
- Decisões que valem para o projeto inteiro viram ADR em `api/docs/adr/`.

## Regras de trabalho

- **Idioma:** responda e escreva documentação em **português (pt-BR)**.
- **Git:** o agente **não** faz commit, push, merge, rebase nem cria branch. Pode usar só comandos de
  leitura (`git status`, `git diff`, `git log`). Exceção: depois da aprovação do Juno, o `start_task.py`
  (skill `task`, modo Iniciar) atualiza a `main` com `git pull --ff-only` e cria a branch da task; o agente
  não roda esses comandos à mão. Ao fim de cada tarefa, entregue:
  - o **texto do commit** em Conventional Commits, seguindo o guia
    [`.agents/docs/guides/commits.md`](.agents/docs/guides/commits.md). O guia cobre o título, o
    corpo em lista, os rodapés `BREAKING CHANGE:` e `Task:` e a ordem recomendada dos tipos;
  - a **lista de arquivos** de cada commit e o que muda em cada um. Se um mesmo arquivo tiver mudanças
    de commits diferentes, avise: quem commita precisa usar o staging area da IDE.
  - Não inclua trailer de coautoria de IA (`Co-Authored-By: ...`) no texto do commit.
  - Estas duas últimas regras (staging e coautoria) também estão no `commits.md`. A repetição é de
    propósito: este arquivo está sempre no contexto, e são regras que as ferramentas quebram por padrão.
- **Concluir:** task ou spec só vira `concluída` (e só vai para `done/`) com a **aprovação explícita do
  Juno**, depois de ele revisar o que foi feito. Testes verdes não bastam: o agente entrega o fechamento
  com status `em andamento` e pede a revisão.
- **Testes:** toda mudança de comportamento vem com teste. Rode os testes antes de dizer que terminou e
  informe o resultado real (inclusive falhas). Como escrever, rodar e provar com mutação manual: guia
  [`testing.md`](.agents/docs/guides/testing.md).

## Decisões em rodadas

Quando houver decisões para o usuário tomar (numa spec, numa task, numa skill, numa revisão), pergunte em
rodadas. Perguntas soltas, ou uma que depende da resposta de outra, fazem a pessoa decidir sobre suposições.

- **3 a 5 perguntas por rodada**, independentes entre si, numeradas, cada uma com opções, consequências e
  a recomendação. A pessoa responde por número ("1 A, 2 C").
- **Só a fronteira:** decisões cujos pré-requisitos já estão decididos. Mais de 5 → as 5 de maior impacto;
  menos de 3 → só as que existem. Nunca junte na rodada uma pergunta que depende de outra ainda em aberto.
- **Fatos você lê** (código, `docs/`, ADRs, specs); pergunte só o que exige escolha.
- **Depois da resposta:** confirme cada decisão em uma frase, aponte o que ficou sem resposta antes de
  avançar e recalcule a próxima rodada a partir das respostas.

Formato de cada pergunta:

```
❓ **Q1 — <título curto>**: <a pergunta, com o contexto necessário para responder>
- A. <opção> — <consequência / trade-off>
- B. <opção> — <consequência / trade-off>

➡️ **<opção recomendada>**: <por quê, em uma ou duas frases>
```

Prefere outro ritmo ou formato? Configure no seu arquivo local de instruções (ex.: `CLAUDE.local.md`, fora
do git): a preferência local prevalece sobre esta seção.

## Spec ou task?

Antes de começar um trabalho, decida o tamanho dele:

- **Spec** = desenho antes de implementar. É uma pasta `.agents/docs/specs/AAAA-MM-DD-<assunto>/` com:
  - `spec.md` — o quê e por quê: problema, escopo, decisões de produto, critérios de aceite (`CA-NN`);
  - `design.md` — como: decisões técnicas, mudanças no modelo e na API, impacto, testes, lista de tasks;
  - `tasks/NN-<assunto>.md` — fatias verticais, numeradas na ordem de dependência.
- **Task** = execução de uma mudança já entendida. Task avulsa fica em
  `.agents/docs/tasks/AAAA-MM-DD-<assunto>.md`.
- Modelos: [`.agents/docs/templates/`](.agents/docs/templates/) (`spec.md`, `design.md`, `task.md`).

**Vira spec** se valer qualquer um destes:

1. Cria um agregado ou coleção nova, ou muda como os agregados se relacionam.
2. Depende de decisões ainda não tomadas (de modelagem ou arquitetura), ou vai gerar um ADR novo.
3. Vai virar mais de uma task (não cabe numa branch só, com poucos commits).
4. Muda o contrato da API (campos ou rotas) em mais de um recurso.
5. Integra um serviço externo (envio de email, ViaCEP, IBGE…).
6. O Juno pediu uma spec **depois** de ver a recomendação de task (o agente sempre diz antes o que o
   trabalho parece e por quê; se o Juno mantiver o pedido, vale spec).

Senão, é **task**.

Antes de começar, diga em palavras simples "isto me parece spec/task porque…" e espere a confirmação.
Se o Juno já pediu uma task e você concorda que é task, não precisa esperar: siga (a confirmação
existe para quando você discorda do tamanho). Se uma task crescer no meio do caminho, pare, avise e
proponha transformá-la em spec.

Estes critérios podem mudar com o uso: proponha o ajuste com o motivo e só aplique depois de aprovado.

## Skills

Skills são procedimentos passo a passo para tarefas recorrentes. Ficam em
`.agents/skills/<nome>/SKILL.md`.

- **Antes de executar uma tarefa da tabela abaixo, leia o `SKILL.md` correspondente inteiro** e siga-o.
  Nenhuma ferramenta descobre essas skills sozinha: é esta tabela que diz quando usá-las.
- Toda skill nova precisa entrar nesta tabela; skill fora dela nunca é lida.
- Nenhuma skill nasce "da imaginação": toda skill parte de uma skill pública (lida inteira, com origem
  registrada) ou de um padrão já comprovado no código deste projeto.

| Situação | Skill |
|---|---|
| Criar, adaptar, traduzir ou melhorar uma skill | [`oficina-de-skills`](.agents/skills/oficina-de-skills/SKILL.md) |
| Criar ou atualizar uma spec (`spec.md` + `design.md`) | [`spec`](.agents/skills/spec/SKILL.md) |
| Abrir, iniciar, retomar, atualizar, fechar, encerrar ou cancelar uma task (avulsa ou de spec) | [`task`](.agents/skills/task/SKILL.md) |
| Conferir o conjunto de instruções (antes de entregar mudança em `AGENTS.md` ou `.agents/`, ou quando o CI delas falhar) | [`governanca`](.agents/skills/governanca/SKILL.md) |
