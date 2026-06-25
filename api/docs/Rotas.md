# Rotas

## **Usuários**

```typescript
[X] GET '/usuarios?email={email}' # retorna um usuário pelo email

[X] POST '/clientes-prestadores' # cadastra um cliente e prestador simultaneamente
[X] PATCH '/usuarios' # torna perfil de usuário(cliente/prestador) inativo permanentemente
```

## **Clientes**

```typescript
  [X] GET '/clientes' # retorna o cliente logado (dados completos)
  [X] GET '/clientes/{id}' # retorna um cliente (dados parciais)

  [X] POST '/clientes' # cadastra um cliente
  [X] PUT '/clientes' # atualiza dados de um cliente
```

## **Prestadores**

```typescript
  [X] GET '/prestadores' # retorna os dados completos do prestador logado
  [X] GET '/prestadores/{id}' # retorna os dados parciais/públicos de um prestador
  [X] GET '/prestadores?idCategoria=&nomePrestador=' # busca prestadores por categoria de serviços prestados e/ou com nome de usuário semelhante
  [X] GET '/prestadores/{idPrestador}/servicos' # retorna todos os serviços de um prestador (visão pública/cliente)
  [X] GET '/prestadores/buscar-por-distancia?cidade=' # retorna todos os prestadores que estão até uma distância (KM, enviada pelo body) de distancia da latitude e longitude enviadas pelo body e/ou pela cidade (usar atributo localizacao_cidade dos usuarios).

  [X] POST '/prestadores' # cadastra um prestador a partir do usuário logado
  [X] PUT '/prestadores' # atualiza dados de prestador logado
  [X] PATCH '/prestadores/inativar' # torna perfil de prestador inativo
  [X] PATCH '/prestadores/ativar' # torna perfil de prestador ativo
```

## **Categorias**

```typescript
  [X] GET '/categorias' # retorna todas as categorias
  [X] GET '/categorias/subcategorias/{id}' # retorna todas as subcategorias de uma categoria
  [X] GET '/categorias/{id}' # retorna uma categoria
```

##   

## **Serviços**

```typescript
  [X] GET '/servicos' # retorna todos os serviços do prestador logado
  [X] GET '/servicos/{id}' # retorna um serviço

  [X] POST '/servicos' # cadastra um serviço de um prestador (apenas prestador)
  [X] PATCH '/servicos/{id}' # atualiza os dados de um serviço (apenas prestador/dono)
  [X] DELETE '/servicos/{id}' # deleta permanentemente um serviço (apenas prestador/dono)
```

## **Solicitações**

```typescript
  [X] GET '/solicitacoes' # retorna todas as solicitações do cliente logado
  [X] GET '/solicitacoes/disponiveis?idCategoria={idCategoria}' # retorna todas as solicitações abertas de uma categoria (visão do prestador) caso essa categoria esteja presente em algum dos serviços do prestador, sem query param pode só retornar todas as solicitações relacionadas a estas categorias relacionadas aos serviços do prestador, as que possuem id_prestador_direto preenchido só o prestador específico e o cliente que podem ver.
  [X] GET '/solicitacoes/{idSolicitacao}/orcamentos' # retorna todos os orçamentos feitos (status 'pendente') para uma solicitação (visão de cliente/dono daquela solicitação)
  [X] GET '/solicitacoes/{id}' # retorna uma solicitação (para o prestaodr: caso seja uma solicitacao direta ou uma geral que a categoria está presente nos seus serviços, para cliente: o cliente que realizou a solicitação pode ver, qualquer um que não cumpra esses requisitos não têm permissão)

  [X] POST '/solicitacoes' # cadastra uma solicitação (apenas cliente)
  [X] PATCH '/solicitacoes/{id}' # atualiza os dados de uma solicitação (apenas cliente/dono), podendo alterar descrição ou status
```

## **Orçamentos**

```typescript
  [X] GET '/orcamentos' # retorna todos os orçamentos do prestador logado 
  [X] GET '/orcamentos/{id}' # retorna um orçamento (apenas cliente/dono da solicitação e prestador/dono do orçamento podem ver)

  [X] POST '/orcamentos' # cadastra um orçamento (apenas prestador)
  [X] PATCH '/orcamentos/{id}' # atualiza os dados de um orçamento (apenas prestador/dono, podendo alterar valor, prazo_dias ou status (apenas se o status está 'pendente', o prestador pode apenas mudar para 'cancelado')
  [X] PATCH '/orcamentos/{id}/aceitar' # atualiza o status do orçamento para 'aceito' (apenas prestador/dono e apenas se o status está 'pendente')
```

## **Contratos**

```typescript
  [X] GET '/contratos' # retorna todos os contratos vinculados ao cliente/prestador logado
  [X] GET '/contratos/{id}' # retorna um contrato (apenas cliente/prestador vinculado pode ver)
  [X] PATCH '/contratos/{id}' # atualiza um contrato (apenas cliente e prestador vinculados), pode alterar os campos (caso o status não seja 'concluído' ou 'cancelado'): status, data_inicio_estimada (caso o status seja 'aguardando_inicio' apenas), prazo_estim
  [X] PATCH '/contratos/{id}/atualizar-status' # atualiza o status de um contrato (apenas prestador vinculado e apenas atualização sequencial).
  [X] PATCH '/contratos/{id}/concluir' # conclui um contrato
  [X] PATCH '/contratos/{id}/cancelar' # cancela um contrato
  [X] PATCH '/contratos/{id}/relatar-problema' # cancela um contrato (apenas cliente vinculado)
  [X] POST '/contratos/{id}/estender-prazo' # solicita extensão de prazo
  [X] PATCH '/contratos/{id}/estender-prazo/:idExtensao/responder' # responde a solicitação de extensão de prazo, aceitando ou negando.
```

## **Avaliações**

```typescript
  [X] GET '/avaliacoes' # retorna todas as avaliações feitas pelo cliente logado
  [X] GET '/avaliacoes/{id}' # retorna uma avaliação (rota pública)
  [X] GET '/contratos/{idContrato}/avaliacao' # retorna a avaliação de um contrato (rota pública)
  [X] GET '/prestadores/{idPrestador}/avaliacoes' # retorna todas as avaliações feitas a contratos de um prestador (rota pública)

  [X] POST '/avaliacoes' # cadastrar uma avaliação de um contrato realizado (apenas cliente vinculado ao contrato, e só pode avaliar contratos 'concluido')
  [X] PATCH '/avaliacoes/{id}' # atualiza os dados de uma avaliação (apenas cliente/dono), podendo alterar apenas 'anonima', 'nota' e 'comentario'.
  [X] DELETE '/avaliacoes/{id}' # deleta permanentemente uma avaliação (apenas autor da avaliação pode fazer isso, só pode deletar até 7 dias após a inserção da avaliação no banco)
```