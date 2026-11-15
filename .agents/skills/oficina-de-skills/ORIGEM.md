# Origem da skill `oficina-de-skills`

## Fontes

| Fonte | Repositório | Commit | Licença |
|---|---|---|---|
| `skill-creator` (Anthropic) | https://github.com/anthropics/skills — `skills/skill-creator/` | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | Apache License 2.0 (`LICENSE.txt` nesta pasta) |
| `writing-skills` (Jesse Vincent / obra) | https://github.com/obra/superpowers — `skills/writing-skills/` | `22f0b463e7a5e579904dd6211a520321035526f7` | MIT — Copyright (c) 2025 Jesse Vincent |
| `skill-creator` (Bruno Okamoto / okjpg) | https://github.com/okjpg/skill-creator — `SKILL.md`, `references/skill-anatomy.md` | `1ce4d61196d9c82ab99a7a1cea8ab083da09857c` | MIT — Copyright (c) 2026 Bruno Okamoto |
| Artigo "Do saber usar ao dominar: como criar um skill de forma eficaz" | https://dev.to/captaincc/do-saber-usar-ao-dominar-como-criar-um-skill-de-forma-eficaz-41j0 | — | artigo (só ideias de processo, nenhum texto copiado) |

Lidas em 2026-11-13 (okjpg e o artigo, em 2026-11-15).

## Arquivos copiados sem alteração (em inglês)

Da `skill-creator`: `LICENSE.txt`, `agents/grader.md`, `agents/comparator.md`, `agents/analyzer.md`,
`references/schemas.md`, `eval-viewer/generate_review.py`, `eval-viewer/viewer.html`,
`scripts/__init__.py`, `scripts/aggregate_benchmark.py`, `scripts/quick_validate.py`.

## Modificações (exigência da Apache License 2.0, seção 4b)

Em relação à `skill-creator` original:

- `SKILL.md` **traduzido para pt-BR e adaptado** ao projeto ContrataAí:
  - nome `skill-creator` → `criar-skill` (evita conflito com a skill global de mesmo nome), renomeada
    depois para `oficina-de-skills` (padrão de nomes por substantivo, 2026-11-13);
  - acrescentado o passo "de onde a skill vem" (regra do projeto: nenhuma skill nasce da imaginação;
    fonte externa lida inteira e registrada, ou padrão comprovado no código);
  - acrescentada a classificação por tipo (regra, técnica, padrão, referência) e o teste adequado a
    cada tipo, vindos da `writing-skills`;
  - a descoberta das skills passa a ser pela tabela de roteamento do `AGENTS.md` (projeto agnóstico de
    ferramenta de IA); por isso **removidos** a otimização automática da `description`, o
    empacotamento `.skill` e as seções específicas de Claude.ai e Cowork;
  - workspace de testes em `.agents/skills/<nome>-workspace/`, ignorado pelo git;
  - etapa final de registrar a skill no `AGENTS.md` e de não commitar (entregar texto do commit);
  - linguagem ajustada para quem está aprendendo o assunto.
- **Não copiados** (usados só pelas partes removidas): `scripts/run_loop.py`, `scripts/run_eval.py`,
  `scripts/improve_description.py`, `scripts/generate_report.py`, `scripts/package_skill.py`,
  `scripts/utils.py`, `assets/eval_review.html`.

Em relação à `writing-skills`:

- `references/cenario-de-pressao.md` é uma **adaptação em pt-BR** de
  `references/testing-skills-with-subagents.md`, `references/bulletproofing.md` e da seção
  "Match the Form to the Failure" do `SKILL.md`, com exemplos trocados por situações do ContrataAí.

Em relação à `skill-creator` do okjpg e ao artigo (2026-11-15, depois do primeiro uso real):

- **Checagem estática** (passo 3.1) adaptada do "QA automático" de 10 itens do okjpg: `description` com
  "quando não usar", ≥ 2 exemplos concretos de entrada → saída, formato de saída definido, sem linguagem
  vaga, sem credencial. Deixados de fora: gatilhos para disparo automático, 1Password/`.env`, deploy em
  `~/.claude/skills/`, backup no GitHub.
- **Ordem "falha primeiro"** (passo 2: linha de base antes do rascunho), "cada regra nova corresponde a uma
  falha ou a um cenário" e "cenário novo para cada falha nova": ideias do artigo e da `writing-skills`,
  reforçadas pelo primeiro uso (skill `spec`).
- Criados pelo projeto a partir do primeiro uso: revisão dos critérios depois da primeira execução, modo
  leve para ajuste pequeno, 1 execução por cenário nas iterações e 3 na rodada final, proibição de ler
  `.notes/` nos subagentes e a limitação conhecida das preferências do usuário na linha de base.

### Licença MIT (writing-skills)

```
MIT License

Copyright (c) 2025 Jesse Vincent

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

### Licença MIT (skill-creator do okjpg)

```
MIT License

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
