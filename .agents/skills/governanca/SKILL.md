---
name: governanca
description: Confere o conjunto de instruções para agentes (AGENTS.md e .agents/) com um script só, sem LLM - links e caminhos citados, tabela de skills, cabeçalho das skills, seções dos modelos, placeholder esquecido, comando sem o prefixo rtk, status das tasks e specs que não bate com a pasta, duplicatas, e o validador de cada task e spec viva. Use antes de entregar qualquer mudança em AGENTS.md ou .agents/ (skill, guia, modelo, script, task, spec) e quando o CI das instruções falhar. Não use para validar uma task ou spec isolada (validate_task e validate_spec das skills task e spec) nem para revisar código da API ou do front.
---

# Governança

Um script confere o conjunto inteiro de instruções para agentes e diz o que está quebrado. O texto desta
skill só diz quando rodar e como ler a saída: toda regra objetiva mora no script, para não depender de o
agente lembrar dela.

Origem: [ORIGEM.md](ORIGEM.md).

## Quando rodar

- Antes de entregar uma mudança em `AGENTS.md` ou em `.agents/`: skill, guia, modelo, script, task ou spec.
- Quando o CI das instruções (`.github/workflows/agents-checks.yml`) falhar.

O script roda **sempre inteiro**, sem filtro por área. Uma mudança numa skill pode quebrar outra coisa
fora dela (uma task que a cita, a tabela do `AGENTS.md`), e um filtro esconderia justamente isso.

```bash
rtk python3 .agents/skills/governanca/scripts/governanca.py
```

## Como ler a saída

Uma linha por achado, no formato `arquivo:linha [SEVERIDADE] mensagem`, e um resumo no fim. O script sai
com código 1 se houver algum erro.

- **ERRO:** corrija antes de entregar. A mensagem começa pelo assunto (`caminho:`, `rtk:`, `lugar:`,
  `duplicata:`, `placeholder:`…), que diz que regra quebrou.
- **AVISO:** pendência conhecida (uma skill citada que ainda não existe, ou falta do `pyyaml`). Não
  bloqueia, mas diga ao usuário se a sua mudança criou um aviso novo.
- Erro de **task ou spec viva** vem do validador da skill dona (`task` ou `spec`), com a mesma mensagem:
  corrija como a skill dona manda. A governança não tem regra própria de conteúdo de task ou spec.
- Task e spec **fechadas** (`concluída`, `cancelada`, `substituída`) não têm o conteúdo conferido: são o
  registro do que aconteceu e não são editadas. Só o lugar delas é conferido.

**Exemplo — task concluída que voltou a `em andamento`:**

```
.agents/docs/tasks/done/2026-11-19-restringir-perfil-cliente.md:1 [ERRO] lugar: task em done/ com status `em andamento` (em done/ só `concluída` ou `cancelada`)
1 erro(s), 4 aviso(s)
```

A pasta `done/` quer dizer "fora de circulação". Ou o status foi mudado por engano (volte para
`concluída`), ou a task precisa de trabalho novo: aí abra uma task nova pela skill `task`, em vez de reabrir
um registro fechado. Rode de novo até sair `0 erro(s)`.

**Exemplo — comando de servidor num bloco de comando:**

```
.agents/skills/oficina-de-skills/SKILL.md:269 [ERRO] rtk: comando sem o prefixo `rtk`: nohup python3 …
```

Comando que o agente roda e termina sozinho leva `rtk` na frente, que condensa a saída. Processo longo
ou interativo (servidor, watcher) é a exceção do `AGENTS.md`: marque o próprio bloco com um comentário
`# sem rtk: motivo`, em vez de deixar o comando sem prefixo e sem explicação.
