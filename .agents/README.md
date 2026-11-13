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
| `docs/specs/` | **O que vamos construir** (quê, por quê, como, em que ordem)? | uma pasta por spec: `spec.md`, `design.md`, `tasks/` |
| `docs/tasks/` | Tarefas avulsas (sem spec) | correção localizada, ajuste pequeno |
| `docs/templates/` | Modelos prontos para copiar | `spec.md`, `design.md`, `task.md` |

As pastas de `docs/` são criadas quando o primeiro conteúdo delas for escrito. Assim nenhuma pasta
fica vazia nem com arquivo provisório.

## Specs e tasks

```
docs/
├── specs/
│   ├── AAAA-MM-DD-<assunto>/        spec.md, design.md, tasks/NN-<assunto>.md
│   └── done/AAAA-MM-DD-<assunto>/   a pasta inteira vem para cá quando todas as tasks terminam
└── tasks/
    ├── AAAA-MM-DD-<assunto>.md      avulsas abertas
    └── done/AAAA-MM/                avulsas concluídas, por mês
```

- Data ISO no começo do nome: a ordem alfabética fica igual à cronológica.
- O status fica no cabeçalho de cada arquivo; a lista de tasks de uma spec fica no `design.md`.
- Quando usar spec ou task: seção "Spec ou task?" do [`AGENTS.md`](../AGENTS.md).

### Onde fica cada coisa numa spec

Cada arquivo tem um nível de detalhe. Isso evita que a spec envelheça a cada mudança de código.

| | `spec.md` (o quê e por quê) | `design.md` (como) | `tasks/NN-*.md` (execução) |
|---|---|---|---|
| **Referências** | de produto: requisitos (RF), decisões de modelagem, conversas, fontes externas de produto | técnicas: ADRs, guias do `.agents/`, contratos (`Rotas.md`, Swagger), documentação externa | código real a ler antes, testes que servem de modelo |
| **Antes → depois** | comportamento visto por quem usa (tabela "Hoje / Depois") | modelo e API por camada, com coluna "Compatível?" | arquivos previstos e o que não deve mudar |
| **Impacto** | critérios de não-regressão | quem usa o que muda, front, docs, migração, riscos | testes existentes que vão mudar de propósito |
| **Prova** | critérios de aceite `CA-NN` (Dado/Quando/Então) | código HTTP e erro de domínio de cada `CA-NN` | teste que prova cada `CA-NN`, comandos e evidência no fechamento |
| **Nunca entra** | caminhos de arquivo, nomes de classe, código | detalhes de uma task específica | decisões de produto novas (volte à spec) |

## Skills

Cada skill é uma pasta `skills/<nome>/` com um `SKILL.md` (obrigatório) e, se precisar, `references/`
(textos de apoio), `scripts/` (código executável) e `agents/` (instruções para subagentes).

- Toda skill precisa estar na tabela de roteamento do `AGENTS.md`.
- Skill baseada em material externo registra a origem (repositório, commit e licença) num
  `ORIGEM.md` dentro da própria pasta.
- Para criar ou alterar uma skill, use a skill [`criar-skill`](skills/criar-skill/SKILL.md).
