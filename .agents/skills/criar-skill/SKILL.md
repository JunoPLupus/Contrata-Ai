---
name: criar-skill
description: Cria, adapta, traduz ou melhora skills do projeto em .agents/skills/ e prova que funcionam, comparando o agente com e sem a skill. Use sempre que for escrever uma skill nova, trazer uma skill externa para o projeto (traduzir ou adaptar), alterar uma skill existente ou verificar se uma skill realmente muda o comportamento do agente.
license: Apache-2.0 (ver LICENSE.txt e ORIGEM.md)
---

# Criar skill

Adaptação da `skill-creator` da Anthropic com o "cenário de pressão" da `writing-skills` (obra).
Origem, licenças e o que mudou: [ORIGEM.md](ORIGEM.md).

O ciclo, em resumo:

1. Entender o que a skill deve fazer e **de onde ela vem** (fonte externa ou padrão do projeto).
2. Escrever um rascunho.
3. Criar 2–3 cenários de teste e rodar o agente **com** e **sem** a skill.
4. Mostrar a comparação ao usuário e ouvir o que ele achou.
5. Reescrever a skill a partir disso e repetir até ficar boa.
6. Registrar a skill na tabela do `AGENTS.md` e entregar o texto do commit.

Descubra em que ponto o usuário está e entre dali. Se ele já tem um rascunho, vá direto ao teste.
Se ele disser que não quer testes, pode pular, mas avise o que se perde: sem comparar, não há prova
de que a skill muda alguma coisa.

## Falando com o usuário

O usuário deste projeto está aprendendo o assunto. Evite jargão; quando um termo técnico for
necessário (avaliação, cenário, critério de verificação, JSON), explique em uma frase na primeira
vez. Uma decisão por vez.

---

## 1. Entender a intenção e a fonte

Se a conversa já mostra o fluxo que o usuário quer transformar em skill, extraia dela as respostas
(ferramentas usadas, ordem dos passos, correções que ele fez) e peça confirmação.

1. O que a skill deve fazer o agente fazer?
2. Em que situação ela deve ser usada? (vira a linha da tabela de roteamento do `AGENTS.md`)
3. Qual o formato da saída?
4. **De onde ela vem?** Regra do projeto: **nenhuma skill nasce da imaginação.** Toda skill parte de:
   - uma **skill externa** — leia-a **inteira** (instruções, referências e scripts) antes de adotar,
     confira a licença e registre repositório, commit e licença no `ORIGEM.md`; ou
   - um **padrão já comprovado no código do projeto** — cite os arquivos que servem de modelo.

   Se não houver nenhuma das duas, pare e diga isso ao usuário em vez de inventar.
5. **Que tipo de skill é?** Isso decide como testar (ver passo 3):

| Tipo | O que faz | Exemplo |
|---|---|---|
| **Regra** | Obriga uma disciplina que o agente tende a pular | "nunca compare a saída com o mesmo mapper que a gera" |
| **Técnica** | Ensina um passo a passo | "como criar um use-case" |
| **Padrão** | Ensina um jeito de pensar | "quando usar value object" |
| **Referência** | Guarda informação para consulta | "lista de rotas e seus contratos" |

### Traduzir ou adaptar?

- A skill externa **encaixa quase inteira** → traduza para pt-BR e só ajuste nomes e caminhos do
  projeto. Mantenha scripts e código como estão (traduzir código só cria risco).
- **Encaixa em parte** → use como base e reescreva com o padrão do projeto.
- Em ambos os casos, o que contradiz o `AGENTS.md` ou o código real perde: o projeto manda.

## 2. Escrever o SKILL.md

### Anatomia

```
.agents/skills/<nome>/
├── SKILL.md          (obrigatório: cabeçalho YAML + instruções)
├── ORIGEM.md         (obrigatório quando vier de fonte externa)
├── references/       (textos lidos só quando necessário)
├── scripts/          (código para tarefas repetitivas e exatas)
└── assets/           (modelos e arquivos usados na saída)
```

Cabeçalho YAML:

- **name**: nome da pasta, em kebab-case (minúsculas e hífens).
- **description**: o que a skill faz **e** quando usar. Outras ferramentas podem usar esse texto para
  decidir sozinhas; neste projeto, quem decide é a tabela do `AGENTS.md`, mas a descrição continua
  sendo o resumo que o agente lê primeiro. Sem `<` nem `>`, até 1024 caracteres.
- **license**: quando vier de fonte externa.

### Carregamento em camadas

1. A linha da tabela do `AGENTS.md` + a `description` — sempre visíveis.
2. O corpo do `SKILL.md` — lido quando a situação aparece (ideal: menos de 500 linhas).
3. `references/` e `scripts/` — só quando o `SKILL.md` mandar.

Se o `SKILL.md` passar de ~500 linhas, mova detalhes para `references/` e diga no `SKILL.md`
**quando** ler cada arquivo. Arquivo de referência com mais de 300 linhas ganha sumário no topo.

### Como escrever

- Use o imperativo ("leia", "rode", "entregue").
- **Explique o porquê** de cada instrução. Modelos atuais entendem razões e generalizam melhor a
  partir delas do que de ordens soltas. Se você se pegar escrevendo SEMPRE/NUNCA em maiúsculas, é
  sinal de alerta: troque pela explicação. A exceção são as skills de **regra** que, no teste, o agente
  quebrou sob pressão — aí a proibição explícita é a forma certa (ver
  [references/cenario-de-pressao.md](references/cenario-de-pressao.md)).
- Formato de saída fixo: mostre o modelo exato. Exemplos: mostre entrada → saída.
- Escreva um rascunho e depois releia com olhos de quem nunca viu o projeto.
- Nada de conteúdo malicioso ou que surpreenda o usuário se descrito em voz alta.

## 3. Testar: com e sem a skill

**A ideia é a mesma da mutação manual dos testes:** só vale a pena manter a skill se ela muda o
comportamento do agente. Se o agente faz a mesma coisa com ou sem ela, a skill não ensina nada.

### 3.1 Criar os cenários

Escreva 2–3 pedidos realistas, do jeito que alguém do projeto pediria de verdade (com nomes de
arquivos, entidades e contexto reais). Mostre ao usuário e pergunte se representam bem o uso. Salve em
`evals/evals.json` dentro da pasta da skill (formato em
[references/schemas.md](references/schemas.md)), ainda sem os critérios de verificação.

**Skill do tipo regra?** Além dos pedidos normais, monte **cenários de pressão**: situações em que o
agente tem um bom motivo para pular a regra (pressa, trabalho já feito, alguém mandando pular).
Leia [references/cenario-de-pressao.md](references/cenario-de-pressao.md) antes de escrevê-los.

| Tipo de skill | Como testar |
|---|---|
| Regra | cenários de pressão com 3+ pressões combinadas; anotar as desculpas do agente |
| Técnica | aplicar a técnica num caso novo e num caso de borda |
| Padrão | reconhecer quando o padrão se aplica **e** quando não se aplica |
| Referência | achar a informação certa e usá-la corretamente |

### 3.2 Rodar com e sem

Os resultados ficam em `.agents/skills/<nome>-workspace/` (ignorado pelo git), organizados por
rodada (`iteration-1/`, `iteration-2/`…) e, dentro dela, uma pasta por cenário com nome descritivo
(`eval-teste-do-mapper/`, não `eval-0/`).

Para cada cenário, rode **os dois** ao mesmo tempo, para terminarem juntos:

- **Com a skill:** um subagente recebe o pedido e a instrução "antes de começar, leia
  `<caminho>/SKILL.md` inteiro e siga-o". Saída em `.../with_skill/outputs/`.
- **Sem a skill (linha de base):**
  - skill **nova** → o mesmo pedido, sem mencionar a skill. Saída em `.../without_skill/outputs/`.
  - skill **existente sendo melhorada** → antes de editar, copie a versão atual
    (`cp -r <skill> <workspace>/skill-snapshot/`) e use-a. Saída em `.../old_skill/outputs/`.

Grave um `eval_metadata.json` por cenário (formato em `references/schemas.md`).

**Ferramenta sem subagentes?** Rode os cenários um por um, você mesmo, lendo a skill antes de cada
um. É menos rigoroso (quem escreveu a skill também a executa), então a revisão do usuário pesa mais.
Nesse caso pule a linha de base e a medição de tempo/tokens.

### 3.3 Enquanto rodam, escrever os critérios de verificação

Critério de verificação = uma afirmação objetiva sobre a saída, que dá para conferir como
"passou/não passou" (ex.: "o teste do mapper usa valores literais, não chama o mapper"). Dê nomes
que se entendam sozinhos na tela de comparação. Coisas subjetivas (estilo, clareza) ficam para a
avaliação do usuário. Atualize `evals/evals.json` e os `eval_metadata.json` e explique ao usuário o
que ele vai ver.

### 3.4 Guardar tempo e tokens

Quando cada subagente termina, a notificação traz `total_tokens` e `duration_ms`. Salve na hora em
`timing.json` na pasta da rodada — essa informação não fica guardada em outro lugar.

### 3.5 Avaliar, agregar e abrir a comparação

1. **Avaliar cada rodada:** um subagente avaliador (ou você mesmo) segue `agents/grader.md` e grava
   `grading.json`. Use exatamente os campos `text`, `passed` e `evidence` (a tela de comparação
   depende deles). Critério que dá para checar com script? Escreva o script.
2. **Agregar** (a partir da pasta desta skill):
   ```bash
   python3 -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <nome>
   ```
   Gera `benchmark.json` e `benchmark.md` com taxa de acerto, tempo e tokens de cada lado.
3. **Analisar:** leia os números procurando o que a média esconde (ver `agents/analyzer.md`):
   critério que passa com e sem a skill (não mede nada), cenário instável, custo alto.
4. **Abrir a tela de comparação:**
   ```bash
   nohup python3 <pasta-desta-skill>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "<nome>" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   A partir da 2ª rodada, acrescente `--previous-workspace <workspace>/iteration-<N-1>`.
   Sem navegador disponível: `--static <arquivo.html>` gera um HTML para abrir depois; o botão
   "Submit All Reviews" baixa um `feedback.json`, que deve ser copiado para o workspace.
   Gere a tela **antes** de tirar suas próprias conclusões: o usuário precisa ver os resultados cedo.
5. **Avise o usuário:** a aba "Outputs" mostra cada cenário com caixa de comentário; a aba
   "Benchmark" mostra os números. Ele volta aqui quando terminar.

### 3.6 Ler o retorno

Leia `feedback.json`. Comentário vazio = estava bom. Concentre-se nos cenários com reclamação.
Encerre a tela: `kill $VIEWER_PID 2>/dev/null`.

## 4. Melhorar a skill

1. **Generalize.** A skill vai ser usada em muitos pedidos, não só nos 3 cenários. Evite remendos
   que só servem para os exemplos.
2. **Enxugue.** Leia o passo a passo dos subagentes, não só o resultado final. Se a skill faz o agente
   perder tempo com algo improdutivo, corte o trecho e veja o que acontece.
3. **Explique o porquê** (ver passo 2).
4. **Procure trabalho repetido.** Se todos os subagentes escreveram o mesmo script auxiliar, coloque-o
   em `scripts/` e mande a skill usá-lo.
5. **Skill de regra que o agente quebrou?** Siga o ciclo de fechar brechas de
   [references/cenario-de-pressao.md](references/cenario-de-pressao.md).

Depois: aplique as mudanças, rode tudo de novo numa nova `iteration-<N+1>/` (com linha de base),
abra a tela com `--previous-workspace` e espere o retorno. Pare quando o usuário estiver satisfeito,
quando os comentários vierem vazios ou quando não houver mais progresso.

### Comparação às cegas (opcional)

Para saber se a versão nova é mesmo melhor: entregue as duas saídas a um agente independente sem dizer
qual é qual e peça que julgue. Detalhes em `agents/comparator.md` e `agents/analyzer.md`.

## 5. Finalizar

1. **Validar o cabeçalho** (exige Python 3 com `pyyaml`):
   ```bash
   python3 <pasta-desta-skill>/scripts/quick_validate.py .agents/skills/<nome>
   ```
2. **Registrar na tabela de roteamento do `AGENTS.md`** ("Situação → Skill"). Sem isso a skill nunca
   é lida.
3. **`ORIGEM.md`** (se veio de fonte externa): repositório, commit, licença e o que foi mudado.
   Licenças que exigem a mesma licença na obra derivada (ex.: CC BY-SA) precisam ser respeitadas.
4. **Não commitar.** Entregue o texto do commit e a lista de arquivos, conforme o `AGENTS.md`. O
   workspace de testes fica fora do git; os cenários em `evals/` podem ser versionados, se o usuário
   quiser repetir os testes depois.

---

## Arquivos de apoio

- `agents/grader.md` — como avaliar os critérios de verificação contra as saídas.
- `agents/comparator.md` — comparação às cegas entre duas saídas.
- `agents/analyzer.md` — por que uma versão venceu a outra; padrões nos números.
- `references/schemas.md` — formatos dos arquivos JSON (`evals.json`, `grading.json`…).
- `references/cenario-de-pressao.md` — cenários de pressão e como fechar brechas (skills de regra).

Esses arquivos (exceto o cenário de pressão) e os scripts estão em inglês, como no original. Os nomes
de campos JSON e de pastas também ficam em inglês, porque os scripts e a tela dependem deles.

### Glossário (termos deste SKILL.md ↔ termos dos arquivos em inglês)

| Aqui | Nos arquivos de apoio |
|---|---|
| cenário de teste | eval, test case |
| critério de verificação | assertion, expectation |
| linha de base (sem a skill) | baseline, `without_skill` / `old_skill` |
| com a skill | `with_skill` |
| rodada | iteration |
| avaliador | grader |
| comparação às cegas | blind comparison, comparator |
| tela de comparação | eval viewer, review |
| números agregados | benchmark |
| retorno do usuário | feedback |
