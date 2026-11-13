# Design: <título da funcionalidade>

<!--
Modelo de design: o COMO da spec da mesma pasta.
Copie para .agents/docs/specs/AAAA-MM-DD-<assunto>/design.md.
Leia antes o spec.md, o AGENTS.md e os ADRs listados abaixo. Apague estes comentários ao preencher.
-->

- **Spec:** [spec.md](spec.md)
- **Criado em:** AAAA-MM-DD
- **Atualizado em:** AAAA-MM-DD — <motivo da última mudança>
- **Branch:** <nome da branch, criada pelo Juno>

## Referências técnicas

<!--
Tudo o que rege o "como": ADRs, guias de .agents/docs/guides/, contratos existentes, documentação
externa de bibliotecas e serviços. Arquivos de código específicos a ler ou alterar vão nas tasks.
-->

- **ADRs aplicáveis:** <ex.: `api/docs/adr/010-duplicidade-index-banco.adoc`, `api/docs/adr/013-agregado-orcamento-e-aceite.adoc`>
- **Guias do projeto:** <ex.: `.agents/docs/guides/<guia>.md`>
- **Contratos existentes:** <ex.: `api/docs/Rotas.md` (seção), Swagger da rota>
- **Externas:** <ex.: documentação do ViaCEP — link + o que foi usado>

## 1. Decisões técnicas

- **Fechadas:**
  - <decisão> — <motivo, ou link para o ADR/decisão>
- **Em aberto:**
  - <pergunta> — bloqueia: <task NN>
- **ADR novo?** <não | sim: título provável e o que ele registra>

## 2. Mudanças no modelo e na API (antes → depois)

<!-- Liste só o que muda. Use os nomes do código (camelCase na API, snake_case no banco). -->

### Domínio (`api/src/domain/`)

| Item | Antes | Depois |
|---|---|---|
| <entidade / value object / use-case / interface de repositório> | <...> | <...> |

### Infra (`api/src/infra/`)

| Item | Antes | Depois |
|---|---|---|
| <model Mongoose / campo / índice (com nome) / repositório> | <...> | <...> |

### HTTP (`api/src/http/`)

| Rota | Antes | Depois | Compatível? |
|---|---|---|---|
| <VERBO /caminho> | <corpo, resposta, status> | <...> | <sim (só acrescenta campo opcional) \| **quebra** (campo renomeado, removido ou novo obrigatório)> |

## 3. Impacto

**Quem usa o que muda** (procure no código quem chama cada item alterado na seção 2):

| Item alterado | Quem usa | O que acontece com quem usa |
|---|---|---|
| <ex.: interface do repositório / factory / VO / rota> | <ex.: outros use-cases, controllers, telas do `web/`> | <ex.: precisa passar o novo parâmetro; teste X vai mudar> |

- **Front (`web/`):** <nenhum | o que quebra ou precisa mudar | adiado para a reconstrução>
- **Swagger e `api/docs/Rotas.md`:** <o que atualizar>
- **ADRs existentes:** <algum precisa de seção de atualização?>
- **Dados existentes:** <precisa de migração? qual estratégia? (pergunte antes de executar)>

## 4. Riscos

| Risco | Como evitar |
|---|---|
| <ex.: use-case com várias escritas sem transação (ver ADR 013)> | <...> |

## 5. Estratégia de testes

- **Unitários** (`*.unit.spec.ts`, ao lado do código): <entidades, value objects, use-cases, mappers, controllers>
- **Integração** (`*.integration.spec.ts`, com mongodb-memory-server): <repositórios, índices, errorHandler>
- **Códigos HTTP e erros de domínio** de cada critério de aceite: <ex.: CA-02 → `OperacaoNaoPermitidaError` → 422>
- **Mutação manual:** <regras novas onde vale mutar para provar que os testes detectam a mudança>
- Valores esperados escritos à mão; nunca comparar a saída com o mesmo mapper que a gera.

## 6. Tasks

<!--
Fatias verticais: cada task atravessa as camadas necessárias e pode ser testada sozinha.
Numeradas na ordem de dependência. Sem "bloqueada por" pendente = pode começar (ou rodar em paralelo,
se não mexer nos mesmos arquivos de outra task em andamento). Marque [x] quando a task for encerrada.
-->

- [ ] [01 — <título>](tasks/01-<assunto>.md) — bloqueada por: nenhuma
- [ ] [02 — <título>](tasks/02-<assunto>.md) — bloqueada por: 01
