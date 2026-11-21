# Spec: <título da funcionalidade>

<!--
Modelo de spec: O QUÊ e POR QUÊ, sem detalhes de implementação.
Copie para .agents/docs/specs/AAAA-MM-DD-<assunto>/spec.md.
O COMO vai no design.md da mesma pasta; as tasks, em tasks/NN-<assunto>.md.
Nada de caminhos de arquivo, nomes de classe ou trechos de código aqui: isso envelhece rápido
e pertence ao design.md.
Toda subseção "###" é obrigatória e nunca é apagada: "não se aplica" é resposta válida.
Apague estes comentários ao preencher.
-->

- **Status:** `rascunho` | `aprovada` | `em andamento` | `concluída` | `cancelada` | `substituída`
- **Criado em:** AAAA-MM-DD
- **Atualizado em:** AAAA-MM-DD — <motivo da última mudança>
- **Requisitos relacionados:** <ex.: RF08, RF15 de `docs/requisitos-e-casos-de-uso.md`>
- **Substitui / substituída por:** <caminho da outra spec, se houver>

## Referências de produto

<!--
Só fontes de produto e negócio: requisitos, decisões de modelagem, conversas, pesquisa com usuários,
referências externas de produto. Referências técnicas (ADRs, guias, código) vão no design.md;
arquivos de código a ler, nas tasks.
-->

- <ex.: `docs/requisitos-e-casos-de-uso.md` — RF08>
- <ex.: decisão "1c — quem pode avaliar" (onde está registrada)>
- <ex.: fonte externa: link + o que foi aproveitado dela>

## 1. Problema e objetivo

### Problema

<o que falta ou está errado, do ponto de vista de quem usa: cliente, prestador>

### Objetivo

<como fica depois da entrega, em termos de produto>

Ao final, isto é verdade:

1. <afirmação curta sobre o comportamento do sistema>
2. <...>

<!-- Só quando a spec ALTERA algo que já existe; numa funcionalidade nova, apague a tabela. -->

| Comportamento | Hoje | Depois |
|---|---|---|
| <ex.: descrição do serviço> | <ex.: obrigatória> | <ex.: opcional (5–500 caracteres quando enviada)> |

## 2. Escopo

### Entra

- <capacidade>

### Fica fora

- <o que não deve ser feito agora, mesmo parecendo relacionado>

## 3. Decisões de produto

<!-- Decisões técnicas (camadas, índices, padrões de código) vão no design.md. -->

### Fechadas

<!-- Não se rediscutem nesta spec. Uma por item. -->

- <decisão> — descartadas: <alternativa (motivo)> — <onde foi tomada: link para a decisão/ADR ou data da conversa>

### Em aberto

<!-- Perguntas e contradições ainda sem resposta (com requisito ou ADR: o trecho de cada lado). Qualquer
item aqui impede a aprovação da spec e a criação do design.md; sem nenhum: "nada". -->

- <pergunta ou contradição>

## 4. Critérios de aceite

<!--
Um cenário por comportamento observável, no formato Dado / Quando / Então (use "E" para somar
condições ou resultados). Cada critério tem um ID (CA-NN) que as tasks citam e que aparece no nome
do teste que o prova. Inclua os caminhos de erro (sem permissão, dado inválido, estado que não
permite a ação). Descreva o que quem usa observa (o que acontece, a mensagem); o código HTTP e o
tipo de erro ficam no design.md.

Se a spec altera algo existente, inclua também critérios de NÃO-REGRESSÃO: o que tem de continuar
funcionando como antes (ex.: "Dado um orçamento aceito, Quando o prestador tenta editar a descrição,
Então a edição continua recusada").

Exemplo real (avaliação, já implementada):

### CA-01: cliente avalia contrato concluído
- Dado um contrato com status concluído que o cliente ainda não avaliou
- Quando o cliente do contrato envia a avaliação
- Então a avaliação é registrada com autor "cliente"
- E o prestador do contrato é o avaliado

### CA-02: avaliação antes da conclusão
- Dado um contrato que ainda não foi concluído
- Quando qualquer uma das partes tenta avaliá-lo
- Então a avaliação é recusada com a mensagem "A avaliação só é liberada após a conclusão do serviço."

### CA-03: segunda avaliação do mesmo lado
- Dado um contrato concluído que o cliente já avaliou
- Quando o cliente tenta avaliar de novo
- Então a avaliação é recusada com a mensagem "Você já avaliou este contrato."
-->

### CA-01: <nome do cenário — caminho principal>

- **Dado** <estado inicial / pré-condição>
- **Quando** <ação>
- **Então** <resultado observável>

### CA-02: <nome do cenário — erro ou validação>

- **Dado** <estado inicial>
- **Quando** <ação inválida>
- **Então** <erro esperado: tipo de erro de domínio e o que o usuário recebe>
