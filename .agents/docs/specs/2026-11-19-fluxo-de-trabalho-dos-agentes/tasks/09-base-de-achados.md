# Task: Base de achados da governança

- **Status:** `aberta`
- **Criado em:** 2026-11-19
- **Atualizado em:** 2026-11-19 — rodada de abertura respondida (Q1 a Q5, "sigo as recomendações")
- **Tipo:** `docs`
- **Alcance:** `documentação`
- **Branch:** `docs/juno/fluxo-de-trabalho-dos-agentes-09` (sugerida; criada pelo Juno)

## 1. Vínculo com a spec (task de spec)

- **Spec:** [spec.md](../spec.md) · **Design:** [design.md](../design.md)
- **Bloqueada por:** 01-governanca.md
- **Critérios de aceite cobertos:** CA-28, CA-29

## 3. O que fazer nesta tarefa

Decisões que já vêm do design e da conversa de 2026-11-19 (não reabrir):

- Um achado é identificado por **arquivo + código da regra + mensagem sem números de linha**; o `Finding` ganha
  o campo do código (ex.: `task.subsecao-vazia`).
- A base fica num bloco fixo do Andamento da task (o "iniciar" grava, o "encerrar" relê); na oficina de skills,
  num arquivo temporário.
- Comparação em três grupos: novos (fazem falhar), antigos (só informados), corrigidos (aparecem como tal).
- A saída normal da governança mantém o caminho completo em cada linha, mas passa a sair **ordenada por arquivo,
  com uma linha em branco entre arquivos** (decisão 1C do Juno na revisão da task 01).

Decisões desta abertura (rodada de 2026-11-19, "sigo as recomendações"):

- O código da regra aparece em toda saída impressa, da governança e dos validadores de task e spec — descartadas:
  só na governança (o mesmo erro sairia com duas formas) e só na base (coluna que não se vê em outro lugar).
- A 09 entrega o formato da base, salvar e comparar com arquivo e as funções importáveis; gravar e ler o bloco no
  Andamento fica com as tasks 05 e 06, que já dependem da 02, e por isso a 09 não depende da 02 — descartadas:
  bloquear a 09 pela 02 (atrasa sem ganho) e criar o Andamento no modelo aqui (dois donos do modelo).
- Na oficina, a base fica em `.agents/skills/<nome>-workspace/base-de-achados.txt` — descartadas: pasta
  temporária do sistema (some num reboot, muda de agente para agente) e arquivo na raiz (uma oficina sobrescreve
  a de outra).
- Avisos entram na base; aviso novo é informado e não falha — descartada: só erros (o "diga se criou aviso
  novo" da skill `governanca` continuaria dependendo da memória do agente).
- O código é obrigatório em `erro()` e `aviso()`, no formato `<dono>.<regra>` (`md.` para a lib comum, `task.`,
  `spec.`, `governanca.`) — descartada: opcional com valor padrão (achado sem código cai numa identidade frágil).

1. **Código da regra no `Finding`** (`.agents/scripts/lib/md_checks.py`): campo novo `codigo`, parâmetro
   obrigatório de `erro()` e `aviso()`, no formato `<dono>.<regra>` (dono = quem define a regra: `md.` para as
   checagens da lib comum, `task.`, `spec.`, `governanca.`; regra em minúsculas com hífen, ex.:
   `task.subsecao-vazia`). Todas as checagens passam a informá-lo: as da lib comum, as do `validate_task.py`, do
   `validate_spec.py` e dos módulos de `governanca/scripts/checagens/`. Nenhuma mensagem muda de texto, com uma exceção: a de CA repetido cita
   "(já na linha N)", e número de linha na mensagem faria a mesma pendência parecer nova a cada edição; ela
   passa a citar o CA ou a linha sai da mensagem (a linha continua no `Finding`).
2. **Código na saída impressa:** em toda saída (`Finding.__str__` dos validadores e `format_finding` da
   governança), logo depois da severidade: `arquivo:linha [SEVERIDADE] codigo mensagem`. As mensagens mantêm o
   assunto no começo (`data:`, `rtk:`…), como hoje.
3. **Saída ordenada por arquivo** (decisão 1C): ordem por arquivo e, dentro dele, por linha, com uma linha em
   branco entre arquivos; o resumo `N erro(s), M aviso(s)` continua no fim. Hoje a ordem é erros primeiro, depois
   avisos.
4. **Formato da base:** uma linha por achado, sem número de linha, com caminho relativo à raiz, severidade,
   código e mensagem. Achados iguais na mesma base contam pela quantidade (dois links quebrados iguais no mesmo
   arquivo são dois achados; corrigir um deles aparece como um corrigido). Avisos também entram: na comparação,
   aviso novo aparece num grupo próprio, só informado, e nunca faz falhar.
   O formato é o mesmo no arquivo da oficina e no bloco do Andamento, para as tasks 05 e 06 só copiarem.
5. **Salvar e comparar:** o `governanca.py` ganha `--salvar-base <arquivo>` (roda tudo, imprime como hoje e
   grava a base; sai com 0 mesmo com erros antigos, que é justamente o que a base registra) e
   `--comparar <arquivo>` (roda tudo e imprime os três grupos com um resumo por grupo; sai com 1 só se houver
   erro novo). As funções de formatar, ler e comparar ficam importáveis, para o "iniciar" e o "encerrar" usarem
   sem subprocesso. Quem grava e lê o bloco dentro do Andamento são as tasks 05 e 06 (esta task não mexe no
   modelo de task).
6. **Oficina de skills** (CA-29): salvar a base no começo, antes da primeira edição na skill, e comparar no
   passo 6.3 no lugar da execução simples; com erro novo, a skill não é dada como pronta. O arquivo é
   `.agents/skills/<nome>-workspace/base-de-achados.txt` (pasta já ignorada pelo git; no modo leve, ela é criada
   só para isso), um por skill. O texto chama de "base de achados", para não confundir com a "linha de base" dos cenários
   da oficina (rodada sem a skill).
7. **Skill `governanca`:** a seção "Como ler a saída" ganha a ordem por arquivo e o modo de comparação (os três
   grupos e o que bloqueia), com um exemplo curto.

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- `.agents/scripts/lib/md_checks.py` — `Finding`, `erro`, `aviso`, a mensagem do CA repetido
- `.agents/skills/governanca/scripts/governanca.py` — `run`, `format_finding`, `exit_code` e o `main` (ordem
  atual da saída)
- `.agents/skills/governanca/scripts/checagens/` — os cinco módulos que criam achados
- `.agents/skills/governanca/scripts/testes/test_governanca.py` — o `ProjetoFalso` e a classe da saída
  ("run, exit_code e formato da saída"), modelo dos testes novos
- `.agents/skills/task/scripts/validate_task.py` e `.agents/skills/spec/scripts/validate_spec.py` — as checagens
  que ganham código
- `.agents/skills/spec/scripts/testes/test_validate_spec.py` — os testes que conferem a linha impressa
- `.agents/skills/oficina-de-skills/SKILL.md` — começo (em que ponto o usuário entra) e passo 6.3
- `.agents/skills/governanca/SKILL.md` — "Como ler a saída"

**Arquivos previstos:**

- alterados: `.agents/scripts/lib/md_checks.py`; `.agents/skills/governanca/scripts/governanca.py` e os módulos
  em `scripts/checagens/` que criam achados (`instrucoes.py`, `referencias.py`, `registros.py`, `skills.py`);
  `.agents/skills/task/scripts/validate_task.py`; `.agents/skills/spec/scripts/validate_spec.py`; os testes da
  governança, da `task` e da `spec` que conferem a linha impressa;
  `.agents/skills/governanca/SKILL.md`; `.agents/skills/oficina-de-skills/SKILL.md`; esta task;
- criados: possivelmente um módulo da base em `governanca/scripts/checagens/` (nome decidido na implementação,
  seguindo os nomes em português dos módulos irmãos), se o `governanca.py` ficar grande demais para ser só o
  ponto de entrada.

**Não deve mudar:**

- o que cada checagem acusa (arquivo, linha, severidade, texto da mensagem), salvo a mensagem do CA repetido
  (passo 1);
- o modelo de task e o de spec em `.agents/docs/templates/` (tasks 02 e 03) e a seção Andamento, que ainda não
  existe;
- os scripts `create_task.py`, `create_spec.py`, `create_design.py`;
- o workflow `.github/workflows/agents-checks.yml` e o guia de testes (a governança continua sendo chamada do
  mesmo jeito, sem filtro);
- as tasks e specs fechadas, inclusive em `done/`;
- `api/` e `web/`.

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:**

- `test_governanca.py`, "Saída 'arquivo:linha [SEVERIDADE] mensagem', com o caminho relativo à raiz" e os
  testes da ordem da saída: passam a esperar o código depois da severidade e a ordem por arquivo, com linha em
  branco entre arquivos;
- `test_validate_spec.py` e `test_validate_task.py`, os testes que conferem a linha impressa com a severidade
  (`spec.md:11 [ERRO] data: …`, `ruim.md:3 [ERRO] status: …`, `34 [AVISO] ler antes: …` e semelhantes):
  passam a esperar o código depois da severidade;
- nenhum pela mensagem de CA repetido: o único teste dela (`test_validate_spec.py`) confere só o começo
  ("critério: CA-02 repetido") e continua passando.

Teste que quebrar e não estiver nesta lista é regressão até prova em contrário.

## 4. Como validar o que foi feito

**Antes de começar:** rode as suítes que a task afeta (lista abaixo) e anote o resultado no
fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-28 | `test_governanca.py` — "a comparação separa erros novos, antigos e corrigidos, e só os novos falham (CA-28)" |
| CA-29 | `test_governanca.py` — "base salva em arquivo: erro antigo corrigido aparece entre os corrigidos e não falha (CA-29)" |

Em Python, o nome do teste é a primeira linha da docstring (é o que o `unittest -v` mostra). O CA-29 tem duas
partes: a comparação com base em arquivo é provada pelo teste acima; a parte da oficina ("com erro novo, a
skill não é dada como pronta") é texto da `SKILL.md`, provada pela rodada manual abaixo.

Comandos (a partir da raiz):

- `rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes`
- `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes`
- os critérios `[script]` dos evals da `task` (seção 3 do guia de testes), porque o `Finding` muda
- `rtk python3 .agents/skills/governanca/scripts/governanca.py` — 0 erros
- dentro de `.agents/skills/oficina-de-skills/`: `rtk python3 scripts/quick_validate.py ../governanca` e
  `rtk python3 scripts/quick_validate.py ../oficina-de-skills`
- **Mutação manual** (guia de testes, seção 5.2): comparar com o número da linha na identidade; tratar erro
  antigo como novo (e o contrário); ignorar o código na identidade; contar achados repetidos uma vez só; sair
  com 1 quando só há erros antigos; sair com 1 por aviso novo; aceitar `erro()` sem código; não ordenar por
  arquivo. Todas devem ser detectadas por algum teste.
- **Checagem manual** (a parte da oficina do CA-29): seguir o passo novo da oficina num ajuste pequeno de
  skill, com a base salva antes; plantar um erro novo e conferir que a comparação falha; corrigir um erro antigo
  plantado antes de salvar a base e conferir que ele aparece entre os corrigidos; desfazer depois.

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
