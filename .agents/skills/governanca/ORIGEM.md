# Origem da skill `governanca`

## Fontes

A skill parte de um padrão já comprovado neste projeto e de uma skill do mesmo autor em outro projeto. Lida
inteira em 2026-11-19.

| Fonte | Onde | Commit | Licença |
|---|---|---|---|
| Verificador geral das instruções (`check_agents.py` e a suíte dele) | este repositório, `.agents/scripts/` até a task `01-governanca.md` da spec do fluxo de trabalho dos agentes | `db167b09` | a do projeto |
| `governanca-compliance` (`SKILL.md` e `check_ia_governance.py`) | projeto doe-palmas (mesmo autor), `.ia/skills/governanca-compliance/` | `b2203f16` | MIT |

## O que veio de cada fonte

- **Verificador geral deste projeto** → as seis checagens (links e caminhos, tabela de skills, comandos
  `python3`, seções dos modelos, skills citadas, cabeçalho das skills), migradas sem mudar o que acusam, e o
  formato da saída. Ele deixa de existir como peça à parte.
- **`governanca-compliance`** → a ideia de uma skill dona das checagens do conjunto, com um único comando;
  as regras de placeholder em documento canônico, status × pasta, a mesma task em duas pastas e comando de
  agente sem `rtk`. Descartados: conferir o conteúdo do modelo de task (aqui é dos validadores das skills
  `task` e `spec`: a mesma regra com dois donos); os contratos de data e de nome de arquivo e os termos de
  stack daquele projeto; a busca de comando sem `rtk` em código em linha (aqui, só nos blocos `bash`/`sh`,
  porque o código em linha das instruções é quase sempre citação, como `git log`).

Criado pelo projeto (sem fonte externa): rodar os validadores de task e spec nas vivas, importando o
`validate()` de cada um, sem regra de conteúdo própria; não conferir o conteúdo de task e spec fechadas; a
exceção do `rtk` marcada no próprio bloco (`# sem rtk: motivo`).

## Teste da skill

Sem rodada com e sem a skill na oficina (decisão de 2026-11-19, na task `01-governanca.md`): o comportamento
está no script e é provado pelos testes dele; quem dispara a governança são o CI e os passos de outras
skills, não o texto desta.
