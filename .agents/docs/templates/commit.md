# Commit: modelo da mensagem

<!--
Modelo e regras da mensagem de commit. O agente não commita: ele entrega o texto pronto (num bloco
de código, para colar) e a lista de arquivos de cada commit (AGENTS.md, "Regras de trabalho").
Base: Conventional Commits 1.0.0, regra 50/72 (Chris Beams), adaptada ao que o histórico já pratica,
e o commits.md do doe-palmas.
-->

```
tipo(escopo): Descrição no presente, com a primeira letra maiúscula

- o que mudou e, quando não for óbvio, por quê;
- item que passa de 72 caracteres continua na linha de baixo, com
  2 espaços de recuo;
- último item termina com ponto.

BREAKING CHANGE: <o que quebra e o que quem usa (front) precisa mudar>
Task: <identificador da task>
```

## Título

- **Formato:** `tipo(escopo): Descrição`, em português do Brasil e sem ponto final.
- **Tom:** verbo no presente, na 3ª pessoa: `Adiciona`, `Ajusta`, `Corrige`, `Remove`, `Renomeia`,
  `Registra`.
- **Tamanho:** meta de **72 caracteres**. Se passar disso, o commit provavelmente faz coisa demais, ou
  um detalhe do título deveria ir para o corpo.
- **Tipos:** `feat` (comportamento novo), `fix` (correção), `refactor` (muda a estrutura sem mudar o
  comportamento), `test` (só testes), `docs` (só documentação), `chore` (manutenção: dependências,
  configuração).
- **Escopo:** o agregado ou a área afetada, como nos commits que já existem: `orcamento`, `avaliacao`,
  `servico`, `cliente`, `prestador`, `auth`, `layout`, `web` e `agents` (para o `.agents/` e o
  `AGENTS.md`). Se a mudança atravessa tudo, o escopo fica de fora: `chore: …`.

## Corpo

- Vem depois de uma linha em branco e é obrigatório, mesmo que tenha um item só.
- É uma lista com `- `, e cada item termina em `;`. O último item termina em `.`.
- Cada item diz **o que mudou** e, quando não for óbvio, **por quê**. O motivo pode ficar no mesmo item.
- Quebre as linhas em **72 caracteres**. A continuação de um item leva 2 espaços de recuo. O
  `git log` no terminal não quebra linha sozinho.
- Cada parte tem um papel:
  - o **título** diz o quê;
  - o **corpo** traz o detalhe e o porquê que não couberam no título;
  - a **task** guarda o contexto completo.

  O corpo não repete a task: o rodapé `Task:` já aponta para ela.

## Rodapé

Fica depois de uma linha em branco, no formato `Token: valor`. Quando um valor ocupa mais de uma
linha, a continuação leva 2 espaços de recuo.

- **`BREAKING CHANGE:`** é obrigatório quando o commit quebra o contrato da API, ou seja, quando
  alguma linha da coluna "Compatível?" do `design.md` diz `quebra`. Diga o que quebra e o que quem
  usa (o front) precisa mudar. Nesse caso o título também leva `!` antes dos dois-pontos:
  `refactor(orcamento)!: …`.
- **`Task:`** só entra quando o commit pertence a uma task que existe em arquivo. O agente nunca
  inventa uma. O identificador não leva a pasta que muda quando a task é encerrada (`done/`):
  - task avulsa: só o nome do arquivo, como em `Task: 2026-11-13-skill-spec.md`;
  - task de spec: a pasta da spec mais o arquivo, como em
    `Task: 2026-11-20-notificacoes/tasks/01-modelo.md`, porque `01-modelo.md` se repete entre specs.
- O rodapé não leva trailer de coautoria de IA (`Co-Authored-By: …`).

## Um commit por tipo dentro da task

Esta seção é uma recomendação, não uma ordem obrigatória. Ela será reavaliada quando existir a skill
de divisão de commits.

- Quando couber, separe um commit por tipo, nesta ordem: `feat` → `fix` → `refactor` → `test` →
  `docs`.
- O teste de uma regra nova ou corrigida vai **no mesmo commit** do `feat` ou do `fix`. Toda mudança
  de comportamento vem com teste, e um commit sem o teste dele deixa o histórico sem cobertura
  naquele ponto.
- Um commit `test` separado serve para mudanças só de teste: reforço de cobertura, teste que dava
  falso positivo ou ajuste depois de uma mutação manual.
- Se um mesmo arquivo tiver mudanças de commits diferentes, avise. Quem commita vai precisar do
  staging area da IDE.

## Exemplos

Task avulsa (reescrita de `25963f77` neste formato):

```
fix(agents): Corrige leitura de tokens no aggregate_benchmark

- o script só lia o total_tokens do timing.json quando o grading.json
  não tinha o campo timing; nos outros casos, mostrava ~1k tokens;
- o benchmark da skill spec volta a mostrar ~90k tokens, e a comparação
  de custo com e sem a skill fica útil de novo.

Task: 2026-11-13-skill-spec.md
```

Task de spec com quebra de contrato (ilustrativo, baseado na renomeação de `280cf44f`):

```
refactor(orcamento)!: Renomeia valor para valorEstimado

- valor vira valorEstimado (valor_estimado no JSON), em simetria com o
  prazo_estimado_horas: os dois são estimativas do prestador;
- Swagger e docs/Rotas.md acompanham o nome novo.

BREAKING CHANGE: o cadastro, a edição e a leitura de /orcamentos trocam
  o campo valor por valor_estimado; o front precisa enviar e ler o novo.
Task: 2026-11-20-remodelagem-orcamento/tasks/02-renomeacoes.md
```

Sem task (reescrita de `af1b6804` neste formato):

```
chore(web): Aumenta o limite de CSS por componente no angular.json

- o anyComponentStyle passa de 4kB/8kB para 100kb/200kb (aviso/erro),
  porque o build de produção falhava no deploy do Vercel.
```
