# `.agents/` — material de apoio para agentes de IA

Esta pasta é independente de ferramenta: serve para qualquer agente (Claude Code, Codex, Cursor,
Gemini, Copilot…). A porta de entrada é o [`AGENTS.md`](../AGENTS.md) na raiz, que diz quando usar
cada coisa daqui. Para pessoas, a documentação do projeto continua em `docs/` e `api/docs/`.

## Organização

| Pasta | Responde a | Exemplo |
|---|---|---|
| `skills/` | **O que fazer agora**, passo a passo? | criar uma skill, implementar um use-case |
| `docs/architecture/` | **O que é** o sistema? (fatos) | camadas, módulos, dependências entre agregados |
| `docs/decisions/` | **Por que** é assim? | decisões de modelagem já firmadas |
| `docs/guides/` | **Como fazemos** aqui? (convenções) | padrão dos value objects, testes, commits |
| `docs/templates/` | Modelos prontos para copiar | modelo de ADR, de prompt de implementação |

As pastas de `docs/` são criadas quando o primeiro conteúdo delas for escrito. Assim nenhuma pasta
fica vazia nem com arquivo provisório.

## Skills

Cada skill é uma pasta `skills/<nome>/` com um `SKILL.md` (obrigatório) e, se precisar, `references/`
(textos de apoio), `scripts/` (código executável) e `agents/` (instruções para subagentes).

- Toda skill precisa estar na tabela de roteamento do `AGENTS.md`.
- Skill baseada em material externo registra a origem (repositório, commit e licença) num
  `ORIGEM.md` dentro da própria pasta.
- Para criar ou alterar uma skill, use a skill [`criar-skill`](skills/criar-skill/SKILL.md).
