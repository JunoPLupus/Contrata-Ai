# Origem da skill `spec`

## Fontes

Nenhuma fonte encaixava inteira: a skill é uma **adaptação em pt-BR** que junta trechos de quatro skills
públicas e os modelos do projeto (`.agents/docs/templates/spec.md` e `design.md`). Fontes lidas inteiras
em 2026-11-13 (wunki e okjpg em 2026-11-15) (instruções, referências e o que cada uma carrega).

| Fonte | Repositório | Commit | Licença |
|---|---|---|---|
| `grilling` (Matt Pocock) | https://github.com/mattpocock/skills — `skills/productivity/grilling/` | `5863806dd4e15c63174bee4e7515a4256792ecfa` | MIT — Copyright (c) 2026 Matt Pocock |
| `to-spec` (Matt Pocock) | https://github.com/mattpocock/skills — `skills/engineering/to-spec/` | `5863806dd4e15c63174bee4e7515a4256792ecfa` | MIT — Copyright (c) 2026 Matt Pocock |
| `spec` (Garry Tan / gstack) | https://github.com/garrytan/gstack — `spec/` | `43c815be88ddd6351d08b402ac486c13c45267bb` | MIT — Copyright (c) 2026 Garry Tan |
| `clarify` (GitHub / spec-kit) | https://github.com/github/spec-kit — `templates/commands/clarify.md` | `2ee2b1e8005905db05f5717300a469b3068b908f` | MIT — Copyright GitHub, Inc. |
| `create-spec` (wunki / amplify) | https://github.com/wunki/amplify — `skills/create-spec/` | `2ebe24d92cb44cb557b55dbe753eb08a3959da12` | MIT (declarada no README do repositório; sem arquivo LICENSE) |
| `skill-creator` (Bruno Okamoto / okjpg) — só a checagem estática | https://github.com/okjpg/skill-creator | `1ce4d61196d9c82ab99a7a1cea8ab083da09857c` | MIT — Copyright (c) 2026 Bruno Okamoto |

## O que veio de cada fonte

- **`grilling`** → seção "Como entrevistar": árvore de decisões, fronteira, rodadas com recomendação,
  "fatos são do agente, decisões são do usuário", fim com fronteira vazia **e** confirmação.
  Mudança: teto de 3 a 5 perguntas por rodada (vindo do gstack) e formato de opções com trade-off.
- **`to-spec`** → regras de escrita do `spec.md`: a spec registra decisões e não cria novas; afirmação
  que o usuário nunca fez é defeito; sem caminho de arquivo nem código na spec; "fora do escopo" com
  recusas reais. Descartados: publicar em issue tracker, lista longa de histórias de usuário (o projeto
  usa critérios Dado/Quando/Então), spec descartável depois da entrega (aqui a spec é documento vivo).
- **gstack `spec`** → fases (porquê → escopo → técnica → rascunho revisado), as perguntas de cada fase,
  a trava "nenhum documento antes da entrevista", "leia o código antes de perguntar e cite
  `caminho:linha`", critérios sem adjetivo, sugestão de quebrar trabalho grande e a ideia do revisor
  externo com nota de executabilidade (aqui opcional e manual). Descartados: preâmbulo e telemetria,
  checagem de duplicidade no GitHub, filtro de segredos, nota automática do codex, criação de issue,
  arquivo em `~/.gstack` e abertura de agente em worktree.
- **spec-kit `clarify`** → "Varredura de lacunas" depois do rascunho (categorias clara/parcial/faltando,
  reduzidas às que valem para o projeto) e a regra de substituir o texto que a resposta invalida.
  Descartados: scripts, hooks, `extensions.yml`, limite de 5 perguntas e seção de log separada (as
  respostas viram "Decisões de produto").

- **wunki `create-spec`** (2026-11-15) → exceção "o usuário pede para escrever mesmo assim": lacunas viram
  itens "Em aberto" em vez de texto inventado, e contradição entre fontes é mostrada, nunca escolhida em
  silêncio. Mudança: aqui o usuário escolhe entre responder agora ou receber o rascunho, e a spec não pode
  ser aprovada com lacuna bloqueante. Descartados: `SPEC.md` único na raiz, seções de segurança/UI fixas,
  "Decisions Log" separado (as decisões ficam em "Decisões de produto").
- **okjpg `skill-creator`** (2026-11-15, via checagem estática da `oficina-de-skills`) → "quando não usar"
  na `description` e no topo, exemplos concretos de entrada → saída e formato da mensagem final.

Criado pelo projeto (sem fonte externa), em parte a partir da revisão do Gemini (NotebookLM do Juno,
2026-11-15): contradição bloqueia a aprovação, conferência com `rtk grep` antes de mostrar, atalho "siga
as recomendações" com resumo antes de escrever, lista de tasks só no `design.md`, modo de atualizar spec existente, lista de tasks sem gerar os
arquivos de task, ADR como task da lista, conferência manual no fim de cada documento, pt-BR e nomes do
domínio do ContrataAí.

## Licença MIT (todas as fontes acima)

O texto abaixo é o mesmo em todas; os avisos de copyright estão na tabela acima.

```
MIT License

Copyright (c) 2026 Matt Pocock
Copyright (c) 2026 Garry Tan
Copyright GitHub, Inc.
Copyright (c) 2026 Bruno Okamoto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
