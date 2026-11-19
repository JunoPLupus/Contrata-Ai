# Origem da skill `task`

## Fontes

Nenhuma fonte encaixava inteira: a skill é uma **adaptação em pt-BR** que junta ideias de skills públicas
com o modelo do projeto (`.agents/docs/templates/task.md`) e um padrão já comprovado aqui (a task real
`2026-11-13-skill-spec.md` e a skill `spec`). Fontes lidas inteiras em 2026-11-16.

| Fonte | Repositório | Commit | Licença |
|---|---|---|---|
| `to-tickets` + doc `docs/engineering/to-tickets.md` (Matt Pocock) | https://github.com/mattpocock/skills — `skills/engineering/to-tickets/` | `5863806dd4e15c63174bee4e7515a4256792ecfa` | MIT — Copyright (c) 2026 Matt Pocock |
| `implement` e `implement-spec` (Matt Pocock) | https://github.com/mattpocock/skills — `skills/engineering/implement/`, `implement-spec/` | `5863806dd4e15c63174bee4e7515a4256792ecfa` | MIT — Copyright (c) 2026 Matt Pocock |
| `tasks-template.md`, `commands/tasks.md`, `commands/implement.md` (GitHub / spec-kit) | https://github.com/github/spec-kit — `templates/` | `2ee2b1e8005905db05f5717300a469b3068b908f` | MIT — Copyright GitHub, Inc. |

## O que veio de cada fonte

- **`to-tickets`** → fatia vertical e "bloqueada por" (já no modelo); da doc: "critério que já passa no
  commit de partida não prova nada" (vira a regra "o teste de cada `CA-NN` precisa falhar no código de
  hoje") e a pergunta "o que dá para demonstrar quando terminar?". Descartados: publicar em issue tracker,
  labels de triagem, `.scratch/`, e a regra "sem caminho de arquivo na task" — **contradiz o modelo do
  projeto** (que pede "Ler antes de começar" e "Arquivos previstos"); o projeto manda. A quebra da spec em
  tasks (e o *expand–contract* para refatoração larga) fica com a lista do `design.md`, não aqui.
- **`implement` / `implement-spec`** → a doc do `to-tickets` relata que o `implement` não fecha o ticket de
  forma confiável: motivo do modo **fechar** desta skill. Descartados: orquestração de subagentes, branch de
  integração, worktrees, commit pelo agente (aqui o Juno faz todo o git).
- **spec-kit** → testes escritos antes e falhando; valor de restrição citado literalmente; parar quando um
  passo falha e dizer o que falta. Descartados: hooks (`extensions.yml`), scripts de setup, fases
  Setup/Foundational/Polish, checklists e o marcador `[P]` de paralelismo.

Criado pelo projeto (sem fonte externa): os três modos (abrir, atualizar, fechar); não pedir confirmação
de tamanho quando usuário e agente concordam que é task; rodada curta (critérios e "Fica fora" antes das
decisões técnicas, que vão para a seção 3 porque avulsa não tem `design.md`); branch sugerida
`<tipo>/juno/<assunto>`; "Não deve mudar" e "testes que vão mudar de propósito" sempre procurados;
conferência com `rtk grep` (substituída pelos scripts, ver abaixo); fechamento só com evidência verificada pelo agente; dono único de cada campo
(o `done/` é da skill `encerramento`; a lista do `design.md` guarda só ordem e dependências, e o
status mora no arquivo da task — mudança de 2026-11-18). Testes da skill: cenários em `evals/`, com
critérios `[script]` conferidos por `evals/checks.py` (testado em `evals/test_checks.py`).

**Scripts (`scripts/`, 2026-11-18):** escritos neste projeto, no padrão dos scripts da skill `spec`.
`create_task.py` substitui a cópia manual do modelo (avulsa, ou de spec a partir da lista do `design.md`,
com status `bloqueada` quando a dependência não está concluída); `validate_task.py` substitui a
conferência com `rtk grep` e ganhou a flag `--fechar` para as regras de fechamento (não há
`close_task.py`: mover para `done/` é da futura skill `encerramento`, que cobre task e spec). As
checagens comuns com o `validate_spec.py` (placeholders, status, "Atualizado em", seções, `CA-NN`,
caminhos e links) moram na lib `.agents/scripts/lib/md_checks.py`, e o `evals/checks.py` chama o
`validate_task.py` em vez de repetir as regras. Testes em `scripts/testes/` (unittest).

## Licença MIT (todas as fontes acima)

```
MIT License

Copyright (c) 2026 Matt Pocock
Copyright GitHub, Inc.

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
