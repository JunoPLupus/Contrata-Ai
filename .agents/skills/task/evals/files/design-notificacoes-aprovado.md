# Design: Notificações in-app

> Arquivo de apoio dos testes da skill `task`, copiado dos testes da skill `spec`. Versão enxuta: traz as
> decisões técnicas fechadas (8a–8e-ii) e a lista de tasks; as seções de antes → depois e impacto foram
> resumidas. Nos cenários, trate-o como `.agents/docs/specs/2026-11-15-notificacoes/design.md`.

- **Spec:** [spec.md](spec.md)
- **Criado em:** 2026-11-15
- **Atualizado em:** 2026-11-15 — aprovação
- **Branch:** `feature/notificacoes`

## Referências técnicas

- **ADRs aplicáveis:** `api/docs/adr/005-errors-de-dominio-sem-status-http.adoc`,
  `api/docs/adr/011-padronizacao-rotas-http.adoc`, `api/docs/adr/013-agregado-orcamento-e-aceite.adoc`
- **Contratos existentes:** `api/docs/Rotas.md`

## 1. Decisões técnicas

- **Fechadas:**
  - Coleção `notificacoes { id_destinatario, tipo, mensagem, id_referencia?, data_criacao, data_leitura? }`
    — 8a, 8b-i, 8b-ii, 8c, 8d-i, 8d-ii.
  - Índices `{ id_destinatario: 1, data_criacao: -1 }` e TTL em `{ data_leitura: 1 }` com 30 dias numa
    constante nomeada — descartado: índice incluindo o tipo do destinatário (ObjectId é único) — 8d-ii, 8d-iii.
  - Serviço `INotificador` no domínio (classe abstrata) com implementação injetada pelo container; texto
    montado por modelo por `tipo` — descartados: repositório direto em cada use-case (texto espalhado) e
    EventEmitter (exagero no MVP) — 8e.
  - `notificar` nunca lança; try/catch na implementação, chamado depois da operação gravada, falha vai
    para `ILogger` (classe abstrata, console no MVP) — descartados: propagar e transação — 8e-ii.
- **Em aberto:** nenhuma.
- **ADR novo?** sim: "efeitos colaterais de melhor esforço e abstração de logger" (task 08).

## 2. Mudanças no modelo e na API (resumo)

- Domínio: entidade `Notificacao`, VO de `tipo` (eventos da spec), `INotificador`, `ILogger`, use-cases de
  listar, marcar uma, marcar todas e excluir lidas.
- Infra: model `notificacoes` com os índices acima; repositório; implementação do notificador e do logger.
- HTTP: `GET /notificacoes` → `{ notificacoes, naoLidas }` (50 mais recentes); `PATCH /notificacoes/{id}`;
  `PATCH /notificacoes` (todas); `DELETE /notificacoes/lidas`. Todas compatíveis (rotas novas).

## 5. Estratégia de testes

- CA-07 → `AcessoProibidoError` → 403; CA-04 a CA-08 com integração no repositório (índices e TTL).
- Valores esperados escritos à mão; nunca comparar a saída com o mesmo mapper que a gera.

## 6. Tasks

- [ ] [01 — Núcleo: entidade, model, repositório, INotificador e ILogger](tasks/01-nucleo.md) — bloqueada por: nenhuma — cobre CA-03, CA-09
- [ ] [02 — Rotas de leitura e ações (listar, marcar, excluir lidas)](tasks/02-rotas.md) — bloqueada por: 01 — cobre CA-04 a CA-08
- [ ] [03 — Eventos de solicitação e orçamento](tasks/03-eventos-orcamento.md) — bloqueada por: 01 — cobre CA-01, CA-02, CA-10
- [ ] [04 — Eventos de contrato (cancelado, status, concluído)](tasks/04-eventos-contrato.md) — bloqueada por: 01 — cobre CA-10
- [ ] [05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md) — bloqueada por: 01 — cobre CA-10
- [ ] [06 — Evento de avaliação recebida](tasks/06-evento-avaliacao.md) — bloqueada por: 01 — cobre CA-10
- [ ] [07 — Atualizar UC14 E01 nos requisitos (melhor esforço)](tasks/07-requisitos-uc14.md) — bloqueada por: nenhuma
- [ ] [08 — ADR: efeitos colaterais de melhor esforço e logger](tasks/08-adr-melhor-esforco.md) — bloqueada por: 01
