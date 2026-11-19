# Task: Skill de governança

- **Status:** `aberta`
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-19 — criação
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-01` (sugerida; criada pelo Juno)

## 1. Vínculo com a spec (task de spec)

- **Spec:** [spec.md](../spec.md) · **Design:** [design.md](../design.md)
- **Bloqueada por:** nenhuma
- **Critérios de aceite cobertos:** CA-04, CA-23, CA-24, CA-25, CA-26, CA-27, CA-30

## 3. O que fazer nesta tarefa

Decisões tomadas ao abrir (conversa de 2026-11-19):

- A base de achados (código da regra no `Finding`, comparação, oficina) saiu desta task e virou a task 09 do
  design — descartada: uma task só (PR grande, misturando a migração do verificador com os validadores).
- A skill nasce pela `oficina-de-skills` em modo enxuto: `SKILL.md` curto, `ORIGEM.md`, `quick_validate` e a
  própria governança, **sem rodada de eval com e sem a skill** — motivo: o comportamento está no script e é
  provado pelos testes dele; quem dispara a governança são o CI e os passos de outras skills (CA-30), não o texto
  desta. Descartada: fluxo completo da oficina (caro, mediria pouco).
- Os marcadores de modelo que a checagem nova acusaria hoje nos documentos canônicos são corrigidos aqui, sem
  exceção na regra — descartada: ignorar comentários e formatos em negrito (esconderia marcador esquecido).

1. **Criar a skill** `.agents/skills/governanca/` pela oficina (modo enxuto acima): `SKILL.md` curto (quando
   rodar, como ler a saída, o que é erro e o que é aviso), `ORIGEM.md` (o verificador geral deste projeto e a
   skill `governanca-compliance` do doe-palmas, com o que foi aproveitado e o que foi descartado, como diz a
   spec) e a linha na tabela de skills do `AGENTS.md`.
2. **Migrar as seis checagens** do verificador geral para o script único da skill, organizado em módulos
   (links e caminhos, tabela de skills, comandos `python3`, seções dos modelos, skills citadas, cabeçalho das
   skills), sem mudar o que elas acusam. Os testes e fixtures migram junto; o verificador antigo e a pasta de
   testes dele são apagados. Saída e exit code iguais aos de hoje (`arquivo:linha [SEVERIDADE] mensagem`,
   exit 1 com erro).
3. **Registros fechados** (task ou spec `concluída`, `cancelada` ou `substituída`, em qualquer pasta): sem
   conferência de links, caminhos ou conteúdo (CA-04); só entram nas checagens de lugar e status (passo 4).
4. **Checagens novas:**
   - status × pasta e task `em andamento` sem branch preenchida (CA-23);
   - a mesma task ou spec entre as abertas e entre as concluídas, comparando pelo nome do arquivo ou da pasta
     (CA-24);
   - comando sem `rtk` dentro de bloco de código `bash`/`sh` do `AGENTS.md`, das skills e dos guias, com a
     exceção marcada no próprio bloco por `# sem rtk: motivo` (CA-26);
   - marcador de modelo esquecido nos documentos canônicos (`AGENTS.md`, `.agents/README.md`, guias e os `.md`
     das skills, fora `evals/files/`, `testes/` e `*-workspace/`), reaproveitando a detecção que os
     validadores já usam (`find_placeholders`, que ignora o que está em código); os modelos ficam de fora
     (CA-27).
5. **Validadores das vivas** (CA-25): a governança importa o `validate()` do validador de task para cada task
   viva (`aberta`, `bloqueada`, `em andamento`) e uma função equivalente do validador de spec para cada pasta
   de spec viva (`rascunho`, `aprovada`, `em andamento`), e junta os achados sem regra de conteúdo própria. O
   validador de spec hoje só tem o `main()`: extrair dele uma função importável, sem mudar o que ele acusa.
   Link da lista de tasks do design para task ainda não criada segue a regra do validador de spec (aceito).
6. **Corrigir os marcadores** que o passo 4 acusa hoje: o formato "Atualizado em" em negrito no `SKILL.md` da
   `spec` (linha 269) e da `task` (linha 195), os marcadores do passo 8 do fechar no `SKILL.md` da `task`
   (linha 245) e o comentário do topo do guia de commits (vira texto normal).
7. **Trocar quem chama o verificador antigo** pela governança inteira, sem filtro (CA-30): o workflow
   `agents-checks.yml`, o guia de testes (tabela e parágrafo do CI) e o passo 6.3 da `oficina-de-skills`.

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- `.agents/scripts/check_agents.py` — as seis checagens, a coleta dos `.md` e o `_load` que importa scripts
  de skill pelo caminho
- `.agents/scripts/testes/test_check_agents.py` — o `ProjetoFalso` (projeto temporário) que os testes novos
  seguem
- `.agents/scripts/lib/md_checks.py` — `Finding`, `erro`/`aviso`, `find_placeholders`, `read_status`
- `.agents/skills/task/scripts/validate_task.py` — `validate()` importável (linha 344)
- `.agents/skills/spec/scripts/validate_spec.py` — o `main()` de onde sai a função importável
- `.agents/skills/oficina-de-skills/SKILL.md` — passos 3.1 e 6 (checagem estática e finalização)
- `.agents/skills/oficina-de-skills/scripts/quick_validate.py`
- `.github/workflows/agents-checks.yml`
- `.agents/docs/guides/testing.md` — seção 3 (tabela de comandos e CI) e seção 4 (regras dos testes)
- Fora do repositório: a skill `governanca-compliance` do doe-palmas, só como origem (`ORIGEM.md`)

**Arquivos previstos:**

- criados (pasta nova `governanca/` em `.agents/skills/`): `SKILL.md`, `ORIGEM.md`, o script único e os
  módulos em `scripts/`, os testes e fixtures em `scripts/testes/`;
- alterados: `.agents/skills/spec/scripts/validate_spec.py` (função importável), `AGENTS.md` (linha na
  tabela de skills), `.agents/skills/oficina-de-skills/SKILL.md`, `.agents/skills/spec/SKILL.md`,
  `.agents/skills/task/SKILL.md`, `.agents/docs/guides/commits.md`, `.agents/docs/guides/testing.md`,
  `.github/workflows/agents-checks.yml`, esta task;
- apagados: `.agents/scripts/check_agents.py` e `.agents/scripts/testes/`.

**Não deve mudar:**

- o que os validadores de task e de spec acusam (as suítes deles passam sem alteração);
- o `Finding` e as mensagens das checagens migradas (código da regra é da task 09);
- os modelos em `.agents/docs/templates/` (são das tasks 02 e 03);
- as tasks e specs fechadas, inclusive em `done/`;
- `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** `test_check_agents.py` migra para a pasta de testes da
governança, com os mesmos casos e o import novo; os casos que conferem caminhos de uma task fechada passam a
esperar nenhum achado (CA-04). As suítes de `validate_task` e `validate_spec` não mudam. Teste que quebrar e não
estiver nesta lista é regressão até prova em contrário.

## 4. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-04 | `test_governanca.py` — "task concluída em done/ com caminho inexistente não é acusada (CA-04)" |
| CA-23 | `test_governanca.py` — "status que não bate com a pasta é acusado com o arquivo (CA-23)" |
| CA-24 | `test_governanca.py` — "a mesma task aberta e concluída é acusada com os dois caminhos (CA-24)" |
| CA-25 | `test_governanca.py` — "erro de conteúdo de task viva sai com a mensagem do validador (CA-25)" |
| CA-26 | `test_governanca.py` — "comando sem rtk em bloco bash é acusado com a linha (CA-26)" |
| CA-27 | `test_governanca.py` — "marcador de modelo em documento canônico é acusado, no modelo não (CA-27)" |
| CA-30 | `test_governanca.py` — "nenhuma instrução cita o verificador antigo (CA-30)" |

Em Python, o nome do teste é a primeira linha da docstring (é o que o `unittest -v` mostra). CA-04 já passa
hoje só em parte (as skills citadas por registros fechados já ficam de fora): prova junto da mutação manual.
CA-30 roda contra o repositório real, não contra fixture.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/scripts/testes` — antes de começar (a suíte que migra)
- `rtk python3 -m unittest discover -s <pasta scripts/testes da governança>` — no fim
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes` e
  `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes` — não devem mudar
- o script da governança na raiz do projeto: 0 erros (avisos de skill futura são aceitos)
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../governanca`
- **Mutação manual** (guia de testes, seção 5.2): aceitar qualquer status em `done/`; não pular registros
  fechados; comparar duplicatas pelo caminho inteiro em vez do nome; ignorar a marca `# sem rtk`; conferir
  marcador dentro de código. Todas devem ser detectadas por algum teste.

- **Checagem manual:** rodar a governança no repositório com um erro plantado de cada tipo novo e conferir a
  saída; desfazer depois.

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
