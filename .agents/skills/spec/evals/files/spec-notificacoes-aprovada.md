# Spec: Notificações in-app

> Arquivo de apoio dos testes da skill `spec` (rodada 2): spec aprovada usada como ponto de partida dos
> cenários de design e de atualização. Escrita com a skill a partir das decisões 8a–8e-ii, da triagem e
> das respostas do Juno de 2026-11-15. Pode virar a spec real depois de revisada.

- **Status:** `aprovada`
- **Criado em:** 2026-11-15
- **Atualizado em:** 2026-11-15 — aprovação
- **Requisitos relacionados:** RF14, RN06, UC10, UC11, UC12, UC14, UC17, UC18, UC19, UC20, UC21, UC23 de
  `docs/requisitos-e-casos-de-uso.md`
- **Substitui / substituída por:** —

## Referências de produto

- `docs/requisitos-e-casos-de-uso.md` — RF14, RN06 e os passos "o sistema notifica…" dos UCs acima.
- Decisões do item 8 da remodelagem (conversa de 2026-10-13): 8a, 8b-i, 8b-ii, 8c, 8d-i, 8d-iii, 8e, 8e-ii;
  triagem de 2026-10-13 ("excluir notificações lidas" entra no MVP).
- Respostas da rodada de escopo (conversa de 2026-11-15): eventos, ações, limite da lista, UC14.

## 1. Problema e objetivo

### Problema

Cliente e prestador só ficam sabendo do que aconteceu com solicitações, orçamentos,
contratos e avaliações abrindo cada tela. Os requisitos pedem aviso em vários pontos, e nada disso existe.

### Objetivo

Cada perfil (cliente ou prestador) recebe dentro da plataforma um aviso curto, pronto para
ler, quando algo que o envolve acontece; vê a lista com o total de não lidas, marca como lida (uma ou
todas) e limpa as lidas. Avisos lidos somem sozinhos depois de um tempo.

Ao final, isto é verdade:

1. Cada evento da lista do MVP gera uma notificação para o perfil afetado, com texto pronto.
2. A notificação pertence a um perfil (cliente ou prestador), não à conta.
3. A pessoa vê as suas notificações mais recentes e quantas ainda não leu.
4. Marcar como lida e excluir as lidas só afetam as notificações da própria pessoa.
5. Lidas somem 30 dias depois da leitura; não lidas não expiram.
6. Falhar ao notificar nunca faz a operação principal falhar.

## 2. Escopo

### Entra

- Eventos do MVP (tabela abaixo), com texto pronto montado pela API.
- Listar as notificações do usuário logado (as 50 mais recentes) com o total de não lidas.
- Marcar uma notificação como lida; marcar todas como lidas.
- Excluir as notificações lidas do usuário logado.
- Expiração automática das lidas 30 dias após a leitura.
- Atualizar o UC14 E01 nos requisitos para "melhor esforço" (task desta spec).

| Evento | Quem recebe | Requisito |
|---|---|---|
| Solicitação direta recebida | prestador escolhido | UC10 |
| Orçamento recebido | cliente da solicitação | UC11 |
| Orçamento aceito | prestador do orçamento aceito | UC12 |
| Orçamento encerrado (outro foi aceito) | demais prestadores com orçamento pendente | RF14, UC14 |
| Solicitação cancelada | prestadores com orçamento pendente | RN06, UC17 |
| Contrato cancelado | a outra parte do contrato | UC18 |
| Status do contrato atualizado | cliente do contrato | UC19 |
| Extensão de prazo pedida | cliente do contrato | UC20 |
| Extensão de prazo aprovada / recusada | as duas partes / o prestador | UC20 |
| Contrato concluído | as duas partes | UC21 |
| Avaliação recebida | o avaliado | UC23 (sem passo de notificação; incluído na conversa de 2026-11-15) |

### Fica fora

- Email, push ou WhatsApp: o MVP é só in-app.
- Reenvio ou agendamento de notificação que falhou.
- Eventos de UCs sem use-case implementado (ex.: conclusão automática do contrato).
- Paginação completa da lista (só o limite de 50).
- Expiração das não lidas.
- Tempo real (websocket): o front consulta a API.

## 3. Decisões de produto

### Fechadas

- A notificação é endereçada a um perfil (cliente ou prestador) — descartadas: endereçar à conta
  (misturava os papéis) e guardar o tipo do perfil (nenhuma consulta precisa) — 8a, 2026-10-13.
- O tipo é o evento (ex.: orçamento recebido) — descartada: tipo misturando canal e evento — 8b-i.
- O texto é montado pela API no momento do evento e guardado pronto — descartadas: montar no front (uma
  consulta extra por notificação) e guardar dados soltos (campo sem formato fixo) — 8b-ii.
- A notificação aponta opcionalmente para um recurso; para onde o front leva é decisão do front — 8c.
- Lida = tem data de leitura; lidas expiram 30 dias depois — descartado: campo "lida" sim/não (não
  permite expirar pela data) — 8d-i, 8d-iii.
- Notificar é melhor esforço: depois da operação principal gravada, nunca a faz falhar, falha vai para o
  log — descartados: propagar o erro (a pessoa veria erro de algo que deu certo) e transação (invasivo)
  — 8e, 8e-ii.
- Eventos do MVP = os dos UCs com use-case implementado (tabela da seção 2) — descartados: só os
  obrigatórios RF14/RN06 (sino quase vazio) e incluir UCs sem use-case (puxa agendador) — 2026-11-15.
- Ações: listar, marcar uma, marcar todas, contador de não lidas, excluir lidas — descartada: sem
  "marcar todas" e sem contador (cliques um a um; front contando a lista) — 2026-11-15.
- Lista limitada às 50 mais recentes, com o contador — descartadas: sem limite (não lidas acumulam) e
  paginação completa (padrão novo na API) — 2026-11-15.
- UC14 E01 ("agenda reenvio") deixa de valer; vale o melhor esforço da 8e-ii; atualizar o requisito é
  task desta spec — descartado: reabrir a 8e-ii (exige fila) — 2026-11-15.

### Em aberto

nada

## 4. Critérios de aceite

### CA-01: evento gera notificação para o perfil afetado

- **Dado** um cliente com uma solicitação aberta
- **Quando** um prestador envia um orçamento para ela
- **Então** o cliente passa a ter uma notificação não lida de orçamento recebido, com texto pronto
- **E** o prestador que enviou não recebe notificação

### CA-02: aceite avisa o vencedor e os demais

- **Dado** uma solicitação com três orçamentos pendentes
- **Quando** o cliente aceita um deles
- **Então** o prestador do orçamento aceito recebe a notificação de orçamento aceito
- **E** os outros dois prestadores recebem a notificação de orçamento encerrado

### CA-03: falha ao notificar não desfaz a operação

- **Dado** que gravar a notificação falha
- **Quando** o cliente aceita um orçamento
- **Então** o aceite é concluído e a resposta é a mesma de quando a notificação funciona
- **E** a falha fica registrada no log

### CA-04: listar com contador

- **Dado** um usuário com 60 notificações, 5 delas não lidas
- **Quando** ele consulta as notificações
- **Então** recebe as 50 mais recentes, da mais nova para a mais antiga, e o total de não lidas (5)

### CA-05: marcar uma como lida

- **Dado** uma notificação não lida do usuário logado
- **Quando** ele a marca como lida
- **Então** ela passa a constar como lida, e o contador diminui em 1

### CA-06: marcar todas como lidas

- **Dado** um usuário com notificações não lidas
- **Quando** ele marca todas como lidas
- **Então** todas as suas passam a constar como lidas e o contador fica 0
- **E** notificações de outros perfis não mudam

### CA-07: marcar notificação de outra pessoa

- **Dado** uma notificação de outro perfil
- **Quando** o usuário tenta marcá-la como lida
- **Então** a ação é recusada e a notificação continua como estava

### CA-08: excluir as lidas

- **Dado** um usuário com notificações lidas e não lidas
- **Quando** ele exclui as lidas
- **Então** as lidas dele são apagadas e as não lidas continuam

### CA-09: expiração das lidas

- **Dado** uma notificação lida há mais de 30 dias
- **Quando** o banco faz a limpeza automática
- **Então** ela deixa de existir, e não lidas de qualquer idade continuam

### CA-10: não-regressão das operações que passam a notificar

- **Dado** uma operação que passa a notificar (ex.: aceitar orçamento)
- **Quando** ela é recusada por regra (ex.: orçamento que não está pendente)
- **Então** a resposta é a mesma de antes e nenhuma notificação é gerada
