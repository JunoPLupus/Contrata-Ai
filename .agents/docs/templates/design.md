# Design: <título da funcionalidade>

<!--
Modelo de design: o COMO da spec da mesma pasta.
Copie para .agents/docs/specs/AAAA-MM-DD-<assunto>/design.md.
Leia antes o spec.md, o AGENTS.md e os ADRs listados abaixo.
Toda subseção "###" é obrigatória e nunca é apagada: "não se aplica" é resposta válida (as subseções de
"2. Mudanças" são exemplos: use as que a spec pede).
Sem branch aqui: cada task tem a sua.
Apague estes comentários ao preencher.
-->

- **Spec:** [spec.md](spec.md)
- **Criado em:** AAAA-MM-DD
- **Atualizado em:** AAAA-MM-DD — <motivo da última mudança>

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

### Fechadas

- <decisão> — <motivo> — descartadas: <alternativa (motivo)> — <link para o ADR/decisão, se houver>

### Em aberto

<!-- Decisões técnicas ainda sem resposta e o que bloqueiam; sem nenhuma: "nada". -->

- <pergunta> — bloqueia: <task NN>

### ADR novo?

<não | sim: título provável e o que ele registra>

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

### Impacto

<!-- Os mesmos seis eixos da task. Cada um responde "sim — o que muda" ou "não" (o "não" pode levar um
comentário depois). Banco: inclua os dados existentes (migração? qual estratégia? pergunte antes de
executar). Contrato da API: Swagger e `api/docs/Rotas.md`. Documentação: ADRs existentes que precisam de
seção de atualização. -->

- **Contrato da API:** <sim — o que muda | não>
- **Banco:** <sim — o que muda | não>
- **Front:** <sim — o que muda | não>
- **Permissões e segurança:** <sim — o que muda | não>
- **Testes existentes que mudam de propósito:** <sim — teste e motivo | não>
- **Documentação:** <sim — o que muda | não>

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
se não mexer nos mesmos arquivos de outra task em andamento). A lista guarda só ordem, dependências e
critérios cobertos: o status de cada task mora no arquivo dela (tasks/NN-*.md), criado pela skill task.
Cada item: "NN — título" (com o link quando o arquivo da task existir) — bloqueada por: <nenhuma | NN, NN>
— cobre: <CA-NN, CA-NN | nenhum>. "cobre: nenhum" é para a task que não prova critério (ex.: refactor que a
spec pede no meio do caminho); sem "cobre", o validador acusa e o create_task.py recusa.
Task cancelada fica riscada, com data e motivo.
-->

- [01 — <título>](tasks/01-<assunto>.md) — bloqueada por: nenhuma — cobre: <CA-01>
- [02 — <título>](tasks/02-<assunto>.md) — bloqueada por: 01 — cobre: <CA-02>
