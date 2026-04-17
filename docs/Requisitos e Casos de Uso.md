---
sticker: lucide//file-text
---
# Projeto de Extensão II - Plataforma de Prestadores de Serviço

| Versão | 0.0.1 |
| ------ | ----- |


## 🎭 Atores

| Ator          | Descrição                                          |
| ------------- | -------------------------------------------------- |
| **Cliente**   | Perfil de um usuário que busca e contrata serviços |
| **Prestador** | Perfil de um usuário que oferta e executa serviços |

---

## 📋 Requisitos
#### ✅ Requisitos Funcionais

| **ID** | **Descrição**                                                                                                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RF01   | O sistema deve permitir o cadastro de usuários com perfil de `Cliente` e/ou `Prestador` de serviços na mesma conta.                                                                                                                                                      |
| RF02   | O sistema deve permitir autenticação de usuários (_login_ e _logout_).                                                                                                                                                                                                   |
| RF03   | O sistema deve permitir edição de perfil pelo próprio usuário.                                                                                                                                                                                                           |
| RF04   | O sistema deve permitir exclusão de conta pelo próprio usuário.                                                                                                                                                                                                          |
| RF05   | O sistema deve permitir que o usuário alterne entre os perfis de `Cliente` e `Prestador` sem necessidade de _logout_.                                                                                                                                                    |
| RF06   | O sistema deve permitir que `clientes` busquem `prestadores` diretamente por categoria de serviço.                                                                                                                                                                       |
| RF07   | O sistema deve permitir que `clientes` busquem `prestadores` diretamente por localização próxima.                                                                                                                                                                        |
| RF08   | O sistema deve exibir o perfil do `prestador` com seus serviços cadastrados, avaliação, valores e prazo médio.                                                                                                                                                           |
| RF09   | O sistema deve permitir que o `cliente` solicite orçamento de forma geral (aberta a vários `prestadores` de uma determinada categoria).                                                                                                                                  |
| RF10   | O sistema deve permitir que o `cliente` solicite orçamento diretamente a um `prestador` específico.                                                                                                                                                                      |
| RF11   | O sistema deve permitir que `prestadores` respondam solicitações de orçamento informando valor e prazo estimado (_padrão: 15 dias se não preenchido_).                                                                                                                   |
| RF12   | O sistema deve permitir que o `cliente` aceite apenas um orçamento por solicitação, encerrando-a automaticamente para os demais `prestadores`.                                                                                                                           |
| RF13   | O sistema deve exibir, no momento do aceite do orçamento, um aviso informando que o pagamento pelo serviço é de responsabilidade exclusiva entre `cliente` e `prestador`, sem qualquer intermediação da plataforma, exigindo confirmação de ciência antes de prosseguir. |
| RF14   | O sistema deve notificar os demais `prestadores` quando um orçamento for aceito por outro.                                                                                                                                                                               |
| RF15   | O sistema deve disponibilizar o link de contato via Whatsapp do `prestador` ao `cliente` somente após o aceite do orçamento.                                                                                                                                             |
| RF16   | O sistema deve permitir que o `cliente` cancele uma solicitação antes do aceite do orçamento ou caso o serviço esteja em atraso.                                                                                                                                         |
| RF17   | O sistema deve permitir cancelamento pós-aceite por qualquer das partes, exigindo informação de motivo e gerando flag de reputação no perfil do responsável caso o serviço esteja dentro do prazo.                                                                       |
| RF18   | O sistema deve permitir que o `prestador` atualize o status do serviço (Aguardando início/ Em andamento /  Aguardando confirmação / Concluído) e registre a data estimada de início.                                                                                     |
| RF19   | O sistema deve permitir que qualquer uma das partes confirme manualmente a conclusão do serviço.                                                                                                                                                                         |
| RF20   | O sistema deve confirmar automaticamente a conclusão do serviço 7 dias após o prazo estimado (ou 7 dias após os 15 dias padrão, se nenhum prazo foi definido).                                                                                                           |
| RF21   | O sistema deve permitir que o `prestador` solicite extensão de prazo, sujeita à aprovação do `cliente`.                                                                                                                                                                  |
| RF22   | O sistema deve liberar a avaliação somente após a confirmação de conclusão do serviço.                                                                                                                                                                                   |
| RF23   | O sistema deve permitir avaliação anônima na exibição pública caso o cliente opte por isso, mantendo a identificação do avaliador apenas internamente.                                                                                                                   |
| RF24   | O sistema deve permitir que o `cliente` registre um problema na avaliação, mesmo nos casos em que o serviço não foi concluído adequadamente.                                                                                                                             |
| RF25   | O sistema deve permitir que `prestadores` cadastrem seus serviços com categoria, descrição e demais informações relevantes.                                                                                                                                              |

---

#### 🔒 Requisitos Não Funcionais

| ID    | Descrição                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------- |
| RNF01 | O sistema deve utilizar geolocalização para viabilizar a busca por prestadores próximos                                     |
| RNF02 | O _frontend_ deve ser desenvolvido em **_Angular_**                                                                         |
| RNF03 | O _backend_ deve ser desenvolvido em **_Node.js_**                                                                          |
| RNF04 | O banco de dados deve ser **_MongoDB_**.                                                                                    |
| RNF05 | Os dados de contato (_WhatsApp_) devem ser protegidos e exibidos somente após a condição de negócio ser satisfeita (_RF14_) |
| RNF06 | A interface deve ser simples e acessível, priorizando usuários com baixo letramento digital.                                |
| RNF07 | Buscas por profissionais devem retornar resultados em até 3 segundos.                                                       |
| RNF08 | Senhas devem ser armazenadas com criptografia (_ex.: BCrypt_).                                                              |
| RNF09 | O sistema deve tratar dados pessoais em conformidade com a _LGPD_.                                                          |
| RNF10 | A plataforma deve estar disponível ao menos 95% do tempo.                                                                   |
| RNF11 | A plataforma web deve ser responsiva e funcionar nos principais navegadores modernos                                        |
| RNF12 | A arquitetura deve permitir expansão futura para aplicativo _mobile_.                                                       |

---

#### 💼 Requisitos de Negócio

| ID       | Descrição                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| RN01     | O pagamento pelos serviços é de responsabilidade exclusiva do Cliente e do Prestador, sem intermediação da plataforma.        |
| RN02     | Cada solicitação de serviço comporta o aceite de apenas um orçamento.                                                         |
| RN03     | O contato via WhatsApp entre Cliente e Prestador é liberado somente após o aceite formal do orçamento.                        |
| RN04     | Cancelamentos realizados após o aceite do orçamento impactam negativamente a reputação do ator responsável pelo cancelamento. |
| **RN05** | A ausência de confirmação de conclusão pelo cliente em até 7 dias após o prazo equivale a aceite tácito.<br>                  |
| **RN06** | Prestadores envolvidos em uma solicitação encerrada devem ser notificados.                                                    |
| **RN07** | O prestador pode solicitar extensão de prazo, cabendo ao cliente aprovar ou recusar.                                          |
| **RN08** | Avaliações são anônimas publicamente para preservar a imparcialidade do avaliado caso o cliente opte por isso.                |

---



---
## 🧐 Casos de Uso

### 📐 Diagrama de Casos de Uso

![](./diagrams/casos_de_uso.svg)

---

### ✍️ Detalhamento dos Casos de Uso


#### 🧑‍🤝‍🧑 Gestão de Contas
##### UC01 - Cadastrar Conta

| **Requisitos**    | RF01                                                                                                                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente, Prestador                                                                                                                                                                                                                                  |
| **Objetivo**      | Permitir que um usuário inicie o acesso pela mesma entrada de login/cadastro e crie sua conta conforme o perfil desejado.                                                                                                                           |
| **Pré-condições** | - O sistema está disponível.<br>    <br>- O usuário possui um e-mail válido.                                                                                                                                                                        |
| **Pós-condições** | - Conta criada com sucesso.<br>    <br>- Perfil `Cliente` sempre ativo por padrão.<br>    <br>- Perfil `Prestador` ativo automaticamente quando o cadastro inicial for feito como prestador.<br>    <br>- Usuário apto a realizar autenticação.<br> |

###### Fluxo Principal

1. O usuário acessa a tela de _login_/cadastro.
    
2. O sistema exibe uma tela única com um campo de **_e-mail_**.
    
3. O usuário preenche o _e-mail_ e seleciona `Continuar`.
    
4. O sistema verifica se o _e-mail_ já está cadastrado.
    
5. O sistema identifica que o _e-mail_ **não existe**.
    
6. O sistema redireciona o usuário para a tela de cadastro.
    
7. O usuário informa nome, senha, telefone/_WhatsApp_ e define o tipo inicial de uso.
    
8. O sistema valida os dados obrigatórios.
    
9. O sistema criptografa a senha.
    
10. O sistema cria a conta com perfil `Cliente` ativo por padrão.
    
11. Caso o cadastro inicial seja como `Prestador`, o sistema ativa automaticamente também o perfil de prestador e solicita os campos extras necessários.
    
12. O sistema salva a conta no banco de dados.
    
13. O sistema confirma o cadastro com mensagem de sucesso.
    

###### Fluxos Alternativos

- **A01 - E-mail já cadastrado**
	
	- No `passo 4`, o sistema identifica que o _e-mail_ já existe.
	    
	- O sistema redireciona o usuário para a tela de _login_.
	    
	- O fluxo de cadastro é encerrado.
    

-  **A02 - Cadastro inicial como cliente**
	
	- No `passo 7`, o usuário segue o cadastro apenas com os dados básicos.
	    
	- O sistema ativa somente o perfil `Cliente`.
	    
	- O perfil `Prestador` poderá ser habilitado posteriormente em `UC05 - Alternar/Ativar perfil`.
    

-  **A03 - Cadastro inicial como prestador**
	
	- No `passo 7`, o usuário escolhe se cadastrar como prestador.
	    
	- O sistema mantém o perfil `Cliente` ativo por padrão.
	    
	- O sistema solicita os campos adicionais profissionais.
	    
	- Após a conclusão, ambos os perfis ficam disponíveis.
    

###### Fluxos de Exceção

-  **E01 - E-mail inválido**
	
	- No `passo 3`, o sistema identifica formato inválido.
	    
	- O sistema exibe mensagem de erro.
	    
	- O usuário deve corrigir o _e-mail_ para continuar.
	    

-  **E02 - Dados obrigatórios inválidos**
	
	- No `passo 8`, o sistema identifica campos vazios ou inconsistentes.
	    
	- O sistema destaca os campos com erro.
	    
	- O usuário deve corrigir para prosseguir.
    

---

##### UC02 - Autenticar login/logout

| **Requisitos**    | RF02                                            |
| ----------------- | ----------------------------------------------- |
| **Atores**        | Cliente, Prestador                              |
| **Objetivo**      | Permitir entrada e saída segura da plataforma.  |
| **Pré-condições** | - Usuário cadastrado.<br>    <br>- Conta ativa. |
| **Pós-condições** | - Sessão autenticada iniciada ou encerrada.<br> |

###### Fluxo Principal — Login

1. O usuário acessa a tela de _login_.
    
2. O sistema solicita _e-mail_ e senha.
    
3. O usuário informa as credenciais.
    
4. O sistema valida os dados.
    
5. O sistema compara a senha informada com o _hash_ armazenado.
    
6. O sistema autentica o usuário.
    
7. O sistema redireciona para a área principal.
    

###### Fluxo Principal — Logout

1. O usuário seleciona a opção `Sair`.
    
2. O sistema encerra a sessão.
    
3. O sistema redireciona para a tela inicial.
    

###### Fluxos Alternativos

- **A01 - Redirecionamento por último perfil usado**
	
	- Após o `passo 6`, o sistema abre o último perfil ativo (`Cliente` ou `Prestador`).
    

###### Fluxos de Exceção

-  **E01 - Credenciais inválidas**
	
	- No `passo 5`, a senha não confere.
	    
	- O sistema informa falha na autenticação.
	    
	- O usuário permanece na tela de _login_.
    

- **E02 - Conta inativa**
	
	- No `passo 4`, o sistema detecta conta indisponível.
	    
	- O acesso é negado.
    

---

##### UC03 - Editar perfil

| **Requisitos**    | RF03                                                           |
| ----------------- | -------------------------------------------------------------- |
| **Atores**        | Cliente, Prestador                                             |
| **Objetivo**      | Permitir atualização dos dados do perfil pelo próprio usuário. |
| **Pré-condições** | - Usuário autenticado.                                         |
| **Pós-condições** | - Dados do perfil atualizados.<br>                             |

###### Fluxo Principal

1. O usuário acessa a área de perfil.
    
2. O sistema exibe os dados atuais.
    
3. O usuário altera as informações desejadas.
    
4. O usuário confirma a atualização.
    
5. O sistema valida os novos dados.
    
6. O sistema salva as alterações.
    
7. O sistema exibe confirmação de sucesso.
    

###### Fluxos Alternativos

- **A01 - Atualização de dados do prestador**
	
	- No `passo 3`, se o perfil ativo for `Prestador`, o usuário pode atualizar descrição profissional, categorias atendidas, localização e _WhatsApp_.
    

###### Fluxos de Exceção

- **E01 - Campo inválido**
	
	- No `passo 5`, o sistema detecta formato inválido.
	    
	- O sistema impede o salvamento até correção.
    

---

##### UC04 - Excluir conta

| **Requisitos**    | RF04                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Atores**        | Cliente, Prestador                                                                  |
| **Objetivo**      | Permitir que o próprio usuário remova sua conta da plataforma.                      |
| **Pré-condições** | - Usuário autenticado.<br>    <br>- Não possuir serviço ativo em andamento.         |
| **Pós-condições** | - Conta removida ou anonimizada conforme _LGPD_.<br>    <br>- Sessão encerrada.<br> |

###### Fluxo Principal

1. O usuário acessa as configurações da conta.
    
2. O usuário seleciona `Excluir conta`.
    
3. O sistema exibe aviso sobre a remoção permanente.
    
4. O usuário confirma a exclusão.
    
5. O sistema verifica se há serviços ativos.
    
6. O sistema remove ou anonimiza os dados.
    
7. O sistema encerra a sessão.
    
8. O sistema exibe mensagem de exclusão concluída.
    

###### Fluxos de Exceção

- **E01 - Serviço ativo em andamento**
	
	- No `passo 5`, o sistema identifica solicitação ativa.
	    
	- O sistema bloqueia a exclusão.
	    
	- O sistema orienta concluir ou cancelar o serviço antes.
    

---

##### UC05 - Alternar perfil

| **Requisitos**    | RF05                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| **Atores**        | Cliente, Prestador                                                         |
| **Objetivo**      | Permitir troca entre os perfis da mesma conta sem logout.                  |
| **Pré-condições** | - Usuário autenticado.<br>    <br>- Conta com ambos os perfis habilitados. |
| **Pós-condições** | - Perfil ativo alterado.<br>    <br>- Interface adaptada ao novo contexto. |

###### Fluxo Principal

1. O usuário acessa o seletor de perfil.
    
2. O sistema exibe os perfis disponíveis.
    
3. O usuário seleciona `Cliente` ou `Prestador`.
    
4. O sistema altera o contexto da sessão.
    
5. O sistema atualiza menus, permissões e funcionalidades.
    
6. O sistema redireciona para a _dashboard_ do perfil escolhido.
    

###### Fluxos de Exceção

- **E01 - Perfil não habilitado**
	
	- No `passo 2`, se houver apenas um perfil disponível, o sistema informa que não é possível alternar.
	

---

#### 🔎 Buscas e Descobertas

##### UC06 - Buscar por categoria

| **Requisitos**    | RF06                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                                                  |
| **Objetivo**      | Permitir que o cliente encontre prestadores por categoria de serviço.                                    |
| **Pré-condições** | - Usuário autenticado como cliente.<br>- Existirem prestadores com serviços cadastrados.                 |
| **Pós-condições** | - Lista de prestadores compatíveis exibida.<br>- Cliente apto a visualizar perfis e solicitar orçamento. |

###### Fluxo Principal

1. O cliente acessa a área de busca de serviços.
    
2. O sistema exibe as categorias disponíveis.
    
3. O cliente seleciona uma categoria.
    
4. O sistema consulta os prestadores que possuem serviços cadastrados naquela categoria.
    
5. O sistema ordena e exibe os resultados com informações resumidas.
    
6. O cliente visualiza a lista e pode selecionar um prestador para mais detalhes.
    

###### Fluxos Alternativos

- **A01 - Busca por subcategoria**
    
    - No `passo 3`, o cliente seleciona uma subcategoria específica.
        
    - O sistema refina a busca para resultados mais aderentes.
        
- **A02 - Ordenação dos resultados**
    
    - No `passo 5`, o cliente escolhe ordenar por avaliação, prazo médio ou valor.
        
    - O sistema reorganiza a listagem conforme o critério selecionado.
        

###### Fluxos de Exceção

- **E01 - Nenhum prestador encontrado**
    
    - No `passo 4`, o sistema não encontra prestadores na categoria.
        
    - O sistema exibe mensagem informando indisponibilidade.
        
    - O sistema sugere categorias relacionadas ou busca por localização.
        
- **E02 - Falha na consulta**
    
    - No `passo 4`, ocorre erro na consulta ao banco de dados.
        
    - O sistema exibe mensagem de indisponibilidade temporária.
        

---

##### UC07 - Buscar por localização

| **Requisitos**    | RF07, RNF01                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                                                               |
| **Objetivo**      | Permitir que o cliente encontre prestadores próximos à sua localização.                                               |
| **Pré-condições** | - Usuário autenticado como cliente.<br>- Permissão de geolocalização concedida ou localização informada manualmente.  |
| **Pós-condições** | - Prestadores próximos exibidos em ordem de proximidade.<br>- Cliente apto a visualizar perfis e solicitar orçamento. |

###### Fluxo Principal

1. O cliente acessa a busca por localização.
    
2. O sistema solicita a localização atual do usuário.
    
3. O cliente autoriza a geolocalização ou informa manualmente sua região.
    
4. O sistema identifica a posição de referência.
    
5. O sistema consulta os prestadores próximos.
    
6. O sistema ordena os resultados por distância.
    
7. O sistema exibe a lista de prestadores encontrados.
    

###### Fluxos Alternativos

- **A01 - Busca com filtro de categoria**
    
    - No `passo 1`, o cliente combina a localização com uma categoria.
        
    - O sistema retorna apenas prestadores próximos daquela categoria.
        
- **A02 - Busca por bairro/cidade manual**
    
    - No `passo 3`, o cliente informa bairro, CEP ou cidade.
        
    - O sistema usa a localização informada como referência.
        

###### Fluxos de Exceção

- **E01 - Geolocalização negada**
    
    - No `passo 3`, o cliente nega a permissão.
        
    - O sistema solicita a localização manual.
        
- **E02 - Nenhum prestador próximo**
    
    - No `passo 5`, nenhum resultado é encontrado.
        
    - O sistema sugere ampliar o raio de busca.
        

---

##### UC08 - Visualizar perfil do prestador

| **Requisitos**    | RF08                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                     |
| **Objetivo**      | Permitir que o cliente visualize as informações detalhadas de um prestador. |
| **Pré-condições** | - Cliente autenticado.<br>- Prestador selecionado em uma busca.             |
| **Pós-condições** | - Dados do perfil exibidos.<br>- Cliente apto a solicitar orçamento.        |

###### Fluxo Principal

1. O cliente seleciona um prestador na listagem.
    
2. O sistema abre a página de perfil do prestador.
    
3. O sistema exibe descrição profissional, serviços cadastrados, avaliações, valores médios e prazo médio.
    
4. O cliente analisa as informações.
    
5. O cliente escolhe entre solicitar orçamento geral ou direto.
    

###### Fluxos Alternativos

- **A01 - Visualização de avaliações**
    
    - No `passo 3`, o cliente acessa a seção de avaliações.
        
    - O sistema exibe comentários e notas anteriores.
        
- **A02 - Visualização de serviços específicos**
    
    - No `passo 3`, o cliente seleciona um serviço cadastrado.
        
    - O sistema destaca os detalhes daquele serviço.
        

###### Fluxos de Exceção

- **E01 - Perfil indisponível**
    
    - No `passo 2`, o perfil foi removido ou desativado.
        
    - O sistema informa indisponibilidade e retorna à busca.
        

---

#### 💵 Orçamento
##### UC09 - Solicitar orçamento geral

| **Requisitos**    | RF09                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                                            |
| **Objetivo**      | Permitir que o cliente abra uma solicitação de orçamento para vários prestadores de uma categoria. |
| **Pré-condições** | - Cliente autenticado.<br>- Categoria selecionada.                                                 |
| **Pós-condições** | - Solicitação registrada e disponibilizada aos prestadores da categoria.                           |

###### Fluxo Principal

1. O cliente acessa a opção de solicitação geral.
    
2. O sistema exibe formulário da solicitação.
    
3. O cliente informa categoria, descrição do problema/serviço, localização e prazo desejado.
    
4. O cliente confirma o envio.
    
5. O sistema valida os dados.
    
6. O sistema registra a solicitação.
    
7. O sistema disponibiliza a solicitação para os prestadores compatíveis.
    
8. O sistema confirma o envio.
    

###### Fluxos Alternativos

- **A01 - Solicitação com imagens**
    
    - No `passo 3`, o cliente adiciona imagens de referência.
        
    - O sistema vincula os arquivos à solicitação.
        
- **A02 - Solicitação urgente**
    
    - No `passo 3`, o cliente marca prioridade alta.
        
    - O sistema destaca a solicitação aos prestadores.
        

###### Fluxos de Exceção

- **E01 - Dados incompletos**
    
    - No `passo 5`, campos obrigatórios não foram preenchidos.
        
    - O sistema solicita correção.
        

---

##### UC10 - Solicitar orçamento direto

| **Requisitos**    | RF10                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                          |
| **Objetivo**      | Permitir que o cliente solicite orçamento diretamente a um prestador específico. |
| **Pré-condições** | - Cliente autenticado.<br>- Perfil do prestador aberto.                          |
| **Pós-condições** | - Solicitação enviada ao prestador selecionado.                                  |

###### Fluxo Principal

1. O cliente acessa o perfil do prestador.
    
2. O cliente seleciona `Solicitar orçamento`.
    
3. O sistema exibe o formulário da solicitação.
    
4. O cliente preenche descrição, prazo desejado e demais detalhes.
    
5. O cliente confirma o envio.
    
6. O sistema valida os dados.
    
7. O sistema registra a solicitação vinculada ao prestador.
    
8. O sistema notifica o prestador.
    
9. O sistema confirma o envio ao cliente.
    

###### Fluxos Alternativos

- **A01 - Solicitação baseada em serviço cadastrado**
    
    - No `passo 2`, o cliente inicia a solicitação a partir de um serviço específico.
        
    - O sistema preenche automaticamente a categoria e parte da descrição.
        

###### Fluxos de Exceção

- **E01 - Prestador indisponível**
    
    - No `passo 7`, o sistema detecta que o prestador está inativo.
        
    - O sistema impede o envio e sugere outros profissionais.


---

##### UC11 - Responder orçamento

| **Requisitos**    | RF11                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **Atores**        | Prestador                                                                                                 |
| **Objetivo**      | Permitir que o prestador responda uma solicitação de orçamento com valor e prazo estimado.                |
| **Pré-condições** | - Prestador autenticado.<br>- Existir solicitação de orçamento disponível e compatível com sua categoria. |
| **Pós-condições** | - Orçamento enviado ao cliente.<br>- Prazo padrão de 15 dias aplicado caso não informado.                 |

###### Fluxo Principal

1. O prestador acessa a lista de solicitações disponíveis.
    
2. O prestador seleciona uma solicitação.
    
3. O sistema exibe os detalhes da solicitação.
    
4. O prestador informa valor e prazo estimado.
    
5. O prestador confirma o envio.
    
6. O sistema valida os dados.
    
7. Caso o prazo não tenha sido preenchido, o sistema define automaticamente **15 dias**.
    
8. O sistema registra a proposta.
    
9. O sistema notifica o cliente.
    

###### Fluxos Alternativos

- **A01 - Resposta com mensagem adicional**
    
    - No `passo 4`, o prestador adiciona observações sobre materiais, visita técnica ou condições.
        
    - O sistema vincula a mensagem à proposta.
        

###### Fluxos de Exceção

- **E01 - Solicitação encerrada**
    
    - No `passo 2`, a solicitação já foi aceita por outro orçamento ou cancelada.
        
    - O sistema impede a resposta e informa indisponibilidade.
        

---

##### UC12 - Aceitar orçamento

| **Requisitos**    | RF12                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                                                       |
| **Objetivo**      | Permitir que o cliente aceite uma proposta de orçamento, encerrando a solicitação para os demais prestadores. |
| **Pré-condições** | - Cliente autenticado.<br>- Existirem propostas recebidas para a solicitação.                                 |
| **Pós-condições** | - Um orçamento aceito.<br>- Solicitação encerrada para os demais prestadores.                                 |

###### Fluxo Principal

1. O cliente acessa a solicitação com propostas recebidas.
    
2. O sistema exibe a lista de orçamentos.
    
3. O cliente seleciona a proposta desejada.
    
4. O sistema aciona o `UC13 - Exibir aviso de pagamento`.
    
5. O cliente confirma ciência do aviso.
    
6. O sistema registra o aceite.
    
7. O sistema encerra a solicitação para os demais prestadores.
    
8. O sistema aciona o `UC14 - Notificar demais prestadores`.
    
9. O sistema aciona o `UC15 - Liberar WhatsApp do prestador`.
    
10. O sistema confirma o aceite.
    

###### Fluxos Alternativos

- **A01 - Comparação entre propostas**
    
    - No `passo 2`, o cliente compara prazo, valor e avaliação dos prestadores.
        
    - O sistema destaca as diferenças entre as propostas.
        

###### Fluxos de Exceção

- **E01 - Proposta indisponível**
    
    - No `passo 3`, a proposta foi removida ou a solicitação expirou.
        
    - O sistema impede o aceite e solicita atualização da lista.
        

---

##### UC13 - Exibir aviso de pagamento

|**Requisitos**|RF13, RN01|
|---|---|
|**Atores**|Cliente, Sistema|
|**Objetivo**|Informar formalmente que o pagamento é responsabilidade exclusiva entre cliente e prestador.|
|**Pré-condições**|- Cliente em processo de aceite de orçamento.|
|**Pós-condições**|- Cliente confirma ciência para prosseguir com o aceite.|

###### Fluxo Principal

1. Durante o aceite do orçamento, o sistema exibe o aviso legal.
    
2. O sistema informa que não há intermediação financeira da plataforma.
    
3. O cliente lê o aviso.
    
4. O cliente marca a confirmação de ciência.
    
5. O sistema permite continuar o aceite.
    

###### Fluxos de Exceção

- **E01 - Cliente não confirma ciência**
    
    - No `passo 4`, o cliente não marca a confirmação.
        
    - O sistema bloqueia a continuidade do aceite.
        

---

##### UC14 - Notificar demais prestadores

|**Requisitos**|RF14, RN06|
|---|---|
|**Atores**|Sistema|
|**Objetivo**|Informar automaticamente aos demais prestadores que a solicitação foi encerrada.|
|**Pré-condições**|- Um orçamento foi aceito pelo cliente.|
|**Pós-condições**|- Prestadores participantes notificados.|

###### Fluxo Principal

1. O sistema identifica todos os prestadores que responderam a solicitação.
    
2. O sistema exclui o prestador vencedor da lista.
    
3. O sistema envia notificação aos demais informando o encerramento.
    
4. O sistema marca a solicitação como finalizada para esses prestadores.
    

###### Fluxos de Exceção

- **E01 - Falha no envio da notificação**
    
    - No `passo 3`, ocorre falha temporária.
        
    - O sistema registra tentativa pendente e agenda reenvio.
        

---

##### UC15 - Liberar WhatsApp do prestador

| **Requisitos**    | RF15, RN03, RNF05                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Atores**        | Sistema, Cliente                                                                            |
| **Objetivo**      | Disponibilizar o contato do prestador ao cliente somente após o aceite formal do orçamento. |
| **Pré-condições** | - Orçamento aceito formalmente.                                                             |
| **Pós-condições** | - Link do _WhatsApp_ exibido ao cliente.                                                    |

###### Fluxo Principal

1. Após o aceite do orçamento, o sistema valida a condição de negócio.
    
2. O sistema recupera o número de WhatsApp protegido do prestador.
    
3. O sistema gera o link de contato.
    
4. O sistema exibe o botão de WhatsApp ao cliente.
    
5. O cliente pode iniciar o contato externo.
    

###### Fluxos de Exceção

- **E01 - Aceite não concluído**
    
    - No `passo 1`, a solicitação ainda não possui aceite formal.
        
    - O sistema mantém o contato oculto.
        
- **E02 - Prestador sem contato válido**
    
    - No `passo 2`, o número não está cadastrado corretamente.
        
    - O sistema informa indisponibilidade temporária do contato.

---

#### 🛎️ Gestão do Serviço


##### UC16 - Cadastrar serviços

| **Requisitos**    | RF25                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| **Atores**        | Prestador                                                                |
| **Objetivo**      | Permitir que o prestador cadastre os serviços que oferece na plataforma. |
| **Pré-condições** | - Prestador autenticado.<br>- Perfil de prestador ativo.                 |
| **Pós-condições** | - Serviço cadastrado e disponível para busca por clientes.               |

###### Fluxo Principal

1. O prestador acessa a área `Meus serviços`.
    
2. O prestador seleciona `Cadastrar serviço`.
    
3. O sistema exibe o formulário de cadastro.
    
4. O prestador informa categoria, descrição, faixa de preço e demais informações relevantes.
    
5. O prestador confirma o cadastro.
    
6. O sistema valida os dados.
    
7. O sistema salva o serviço.
    
8. O sistema confirma o cadastro.
    

###### Fluxos de Exceção

- **E01 - Dados obrigatórios não preenchidos**
    
    - No `passo 6`, o sistema identifica campos obrigatórios ausentes.
        
    - O sistema solicita correção antes de salvar.
        

---

##### UC17 - Cancelar solicitação

|**Requisitos**|RF16|
|---|---|
|**Atores**|Cliente|
|**Objetivo**|Permitir que o cliente cancele uma solicitação antes do aceite do orçamento ou em caso de atraso do serviço.|
|**Pré-condições**|- Cliente autenticado.- Solicitação ainda sem aceite ou serviço em atraso.|
|**Pós-condições**|- Solicitação cancelada.- Prestadores envolvidos notificados quando aplicável.|

###### Fluxo Principal

1. O cliente acessa os detalhes da solicitação.
    
2. O cliente seleciona a opção `Cancelar solicitação`.
    
3. O sistema valida se a solicitação ainda não foi aceita ou se está em atraso.
    
4. O cliente confirma o cancelamento.
    
5. O sistema registra o cancelamento.
    
6. O sistema encerra a solicitação.
    
7. O sistema notifica os prestadores envolvidos.
    

###### Fluxos Alternativos

- **A01 - Cancelamento por atraso**
    
    - No `passo 3`, o sistema identifica que o prazo estimado foi ultrapassado.
        
    - O cancelamento é permitido mesmo após o aceite.
        

###### Fluxos de Exceção

- **E01 - Solicitação não cancelável**
    
    - No `passo 3`, existe orçamento aceito dentro do prazo.
        
    - O sistema impede o cancelamento.
        

---

##### UC18 - Cancelar serviço pós-aceite

| **Requisitos**    | RF17, RN04                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente, Prestador                                                                                                                |
| **Objetivo**      | Permitir cancelamento do serviço após aceite por qualquer das partes, registrando motivo e impacto reputacional quando aplicável. |
| **Pré-condições** | - Serviço aceito e ativo.                                                                                                         |
| **Pós-condições** | - Serviço cancelado.<br>- Motivo registrado.<br>- Flag de reputação aplicada ao responsável quando dentro do prazo.               |

###### Fluxo Principal

1. O ator acessa os detalhes do serviço.
    
2. O ator seleciona `Cancelar serviço`.
    
3. O sistema solicita o motivo do cancelamento.
    
4. O ator informa o motivo.
    
5. O sistema verifica se o serviço ainda está dentro do prazo.
    
6. O sistema registra o cancelamento.
    
7. Se estiver dentro do prazo, o sistema aplica flag de reputação ao responsável.
    
8. O sistema notifica a outra parte.
    

###### Fluxos Alternativos

- **A01 - Cancelamento fora do prazo**
    
    - No `passo 5`, o sistema identifica atraso do serviço.
        
    - O cancelamento é realizado sem penalidade ao cliente.
        

###### Fluxos de Exceção

- **E01 - Motivo não informado**
    
    - No `passo 4`, o ator tenta prosseguir sem preencher o motivo.
        
    - O sistema bloqueia a continuidade até preenchimento.
        

---

##### UC19 - Atualizar status do serviço

| **Requisitos**    | RF18                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Atores**        | Prestador                                                                                   |
| **Objetivo**      | Permitir que o prestador atualize o andamento do serviço e informe data estimada de início. |
| **Pré-condições** | - Prestador autenticado.<br>- Serviço aceito e ativo.                                       |
| **Pós-condições** | - Novo status registrado no histórico do serviço.                                           |

###### Fluxo Principal

1. O prestador acessa o serviço em andamento.
    
2. O sistema exibe o status atual.
    
3. O prestador seleciona um novo status (`Aguardando início`, `Em andamento`, `Aguardando confirmação`, `Concluído`).
    
4. O prestador informa a data estimada de início, quando aplicável.
    
5. O prestador confirma a atualização.
    
6. O sistema valida os dados.
    
7. O sistema registra o novo status.
    
8. O sistema notifica o cliente.
    

###### Fluxos Alternativos

- **A01 - Marcação de conclusão pelo prestador**
    
    - No `passo 3`, o prestador seleciona `Concluído`.
        
    - O sistema prepara o serviço para confirmação posterior.
        

###### Fluxos de Exceção

- **E01 - Transição inválida de status**
    
    - No `passo 6`, o novo status não respeita a ordem lógica.
        
    - O sistema impede a atualização e exibe orientação.
        

---

##### UC20 - Solicitar extensão de prazo

| **Requisitos**    | RF21, RN07                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Atores**        | Prestador, Cliente                                                                                 |
| **Objetivo**      | Permitir que o prestador solicite prorrogação do prazo do serviço, sujeita à aprovação do cliente. |
| **Pré-condições** | - Serviço ativo.<br>- Prazo vigente definido.                                                      |
| **Pós-condições** | - Novo prazo aprovado e registrado ou solicitação recusada.                                        |

###### Fluxo Principal

1. O prestador acessa o serviço ativo.
    
2. O prestador seleciona `Solicitar extensão de prazo`.
    
3. O sistema solicita novo prazo e justificativa.
    
4. O prestador informa os dados.
    
5. O sistema envia a solicitação ao cliente.
    
6. O cliente analisa a justificativa.
    
7. O cliente aprova a extensão.
    
8. O sistema atualiza o prazo do serviço.
    
9. O sistema notifica ambas as partes.
    

###### Fluxos Alternativos

- **A01 - Extensão recusada**
    
    - No `passo 7`, o cliente recusa a solicitação.
        
    - O sistema mantém o prazo original e notifica o prestador.
        

###### Fluxos de Exceção

- **E01 - Novo prazo inválido**
    
    - No `passo 4`, o novo prazo informado é anterior ao prazo atual.
        
    - O sistema impede o envio da solicitação.

---

##### UC21 - Confirmar conclusão manualmente

| **Requisitos**    | RF19, RF22                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente, Prestador                                                                                       |
| **Objetivo**      | Permitir que qualquer uma das partes confirme manualmente a conclusão do serviço, liberando a avaliação. |
| **Pré-condições** | - Serviço com status `Aguardando confirmação` ou `Concluído`.                                            |
| **Pós-condições** | - Serviço marcado como concluído.<br>- Avaliação liberada.                                               |

###### Fluxo Principal

1. O ator acessa os detalhes do serviço.
    
2. O sistema exibe a opção `Confirmar conclusão`.
    
3. O ator confirma a conclusão.
    
4. O sistema registra a data de conclusão.
    
5. O sistema altera o status final para `Concluído`.
    
6. O sistema libera a funcionalidade de avaliação.
    

###### Fluxos de Exceção

- **E01 - Serviço ainda incompatível para conclusão**
    
    - No `passo 2`, o serviço ainda está em status anterior (`Em andamento`, por exemplo).
        
    - O sistema bloqueia a confirmação manual.
        

---

##### UC22 - Confirmar conclusão automaticamente

| **Requisitos**    | RF20, RN05                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Atores**        | Sistema                                                                                                                                        |
| **Objetivo**      | Confirmar automaticamente a conclusão do serviço após 7 dias do prazo estimado sem manifestação do cliente.                                    |
| **Pré-condições** | - Serviço com prazo definido ou prazo padrão de 15 dias.<br>- Ausência de confirmação manual do cliente dentro do período adicional de 7 dias. |
| **Pós-condições** | - Serviço concluído automaticamente.<br>- Avaliação liberada.                                                                                  |

###### Fluxo Principal

1. O sistema monitora os serviços com prazo ativo.
    
2. O sistema identifica que o prazo estimado foi atingido.
    
3. O sistema aguarda 7 dias adicionais.
    
4. O sistema verifica ausência de confirmação manual ou contestação.
    
5. O sistema registra a conclusão automática.
    
6. O sistema altera o status para `Concluído`.
    
7. O sistema libera a avaliação.
    
8. O sistema notifica ambas as partes.
    

###### Fluxos Alternativos

- **A01 - Uso do prazo padrão**
    
    - No `passo 2`, se não houver prazo definido pelo prestador, o sistema utiliza o padrão de **15 dias**.
        
    - A confirmação automática ocorre 7 dias após esse prazo padrão.
        

###### Fluxos de Exceção

- **E01 - Serviço contestado antes do prazo tácito**
    
    - No `passo 4`, o cliente registra problema ou solicita cancelamento.
        
    - O sistema interrompe a conclusão automática.
        

---

##### UC23 - Avaliar serviço

| **Requisitos**    | RF22, RF23                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                                     |
| **Objetivo**      | Permitir que o cliente avalie o serviço após sua conclusão, com opção de anonimato público. |
| **Pré-condições** | - Serviço concluído manual ou automaticamente.                                              |
| **Pós-condições** | - Avaliação registrada no histórico.<br>- Nota refletida na reputação pública do prestador. |

###### Fluxo Principal

1. O cliente acessa o serviço concluído.
    
2. O sistema exibe a opção `Avaliar serviço`.
    
3. O cliente informa nota e comentário.
    
4. O sistema oferece a opção de anonimato público.
    
5. O cliente escolhe se deseja anonimato.
    
6. O cliente confirma o envio.
    
7. O sistema registra a avaliação.
    
8. O sistema atualiza a reputação do prestador.
    
9. O sistema exibe a avaliação conforme a preferência de anonimato.
    

###### Fluxos Alternativos

- **A01 - Avaliação anônima**
    
    - No `passo 5`, o cliente ativa o anonimato.
        
    - O sistema oculta a identidade na exibição pública, mantendo o vínculo internamente.
        

###### Fluxos de Exceção

- **E01 - Tentativa de avaliação antes da conclusão**
    
    - No `passo 2`, o serviço ainda não foi concluído.
        
    - O sistema bloqueia a avaliação.
        

---

##### UC24 - Registrar problema na avaliação

| **Requisitos**    | RF24                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Atores**        | Cliente                                                                                                                                |
| **Objetivo**      | Permitir que o cliente registre problemas relacionados ao serviço no momento da avaliação, inclusive em casos de conclusão inadequada. |
| **Pré-condições** | - Existir serviço concluído ou encerrado inadequadamente.<br>- Funcionalidade de avaliação disponível.                                 |
| **Pós-condições** | - Problema registrado e vinculado à avaliação e ao histórico do serviço.                                                               |

###### Fluxo Principal

1. Durante a avaliação do serviço, o cliente seleciona `Registrar problema`.
    
2. O sistema exibe categorias e campo descritivo do problema.
    
3. O cliente informa o tipo do problema e detalha a ocorrência.
    
4. O cliente confirma o envio.
    
5. O sistema registra a ocorrência no histórico.
    
6. O sistema associa o problema à reputação interna do prestador.
    

###### Fluxos Alternativos

- **A01 - Problema com serviço não concluído adequadamente**
    
    - No `passo 1`, o cliente acessa um serviço encerrado por cancelamento ou conclusão inadequada.
        
    - O sistema mantém a opção de registrar problema ativa.
        

###### Fluxos de Exceção

- **E01 - Descrição insuficiente**
    
    - No `passo 3`, o cliente informa descrição vaga ou vazia.
        
    - O sistema solicita detalhamento mínimo antes do envio.


