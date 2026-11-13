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

## Comandos (rodar dentro de `api/`)

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe a API com nodemon + ts-node |
| `npm run build` | compila com `tsc` |
| `npm test` | todos os testes (Jest) |
| `npm run test:unit` | só unitários |
| `npm run test:integration` | só integração (mongodb-memory-server) |

- Sem Node na máquina? Rode pela imagem Docker `node:22`, montando a pasta `api/`.
- Os testes de integração precisam de `--runInBand` (rodar em série), por causa de memória.
- O CI (`.github/workflows/api-tests.yml`) roda `npm ci` + `npm test` em `api/` a cada push e PR.

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
  leitura (`git status`, `git diff`, `git log`). Ao fim de cada tarefa, entregue:
  - o **texto do commit** em Conventional Commits, no padrão do histórico
    (`tipo(escopo): Descrição em português`, ex.: `feat(avaliacao): Remodelagem da avaliação`);
  - a **lista de arquivos** de cada commit e o que muda em cada um. Se um mesmo arquivo tiver mudanças
    de commits diferentes, avise: quem commita precisa usar o staging area da IDE.
  - Não inclua trailer de coautoria de IA (`Co-Authored-By: ...`) no texto do commit.
- **Testes:** toda mudança de comportamento vem com teste. Rode os testes antes de dizer que terminou e
  informe o resultado real (inclusive falhas).

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
| Criar, adaptar, traduzir ou melhorar uma skill | [`criar-skill`](.agents/skills/criar-skill/SKILL.md) |
