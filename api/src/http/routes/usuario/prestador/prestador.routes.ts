import { Router } from 'express'
import { prestadorController, avaliacaoController, servicoController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const prestadorRouter = Router()

//#region Documentação - POST /prestadores
/**
 * @openapi
 * /prestadores:
 *   post:
 *     tags: [Prestadores]
 *     summary: Cadastra um prestador a partir do usuário logado
 *     description: Cria o perfil de prestador vinculado ao cliente autenticado. Não exige corpo — o `idCliente` é obtido do token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Prestador cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrestadorRespostaCadastro'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       422:
 *         description: Cadastro duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "Este cadastro já existe."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.post('/prestadores', exigeAutenticacao, (req, res) => prestadorController.cadastrar(req, res))
//#endregion

//#region Documentação - GET /prestadores
/**
 * @openapi
 * /prestadores:
 *   get:
 *     tags: [Prestadores]
 *     summary: Retorna o prestador logado (dados completos)
 *     description: Retorna o perfil completo do prestador autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil completo do prestador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrestadorPerfilCompleto'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.get('/prestadores', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.buscarLogado(req, res))
//#endregion

//#region Documentação - PUT /prestadores
/**
 * @openapi
 * /prestadores:
 *   put:
 *     tags: [Prestadores]
 *     summary: Atualiza o prestador logado
 *     description: Atualiza parcialmente `telefone` e/ou `descricao` do prestador autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarPrestadorRequest'
 *     responses:
 *       200:
 *         description: Dados do prestador atualizados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrestadorAtualizado'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       422:
 *         description: Formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O 'telefone' inserido é inválido. Verifique o formato e tente novamente."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.put('/prestadores', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.atualizar(req, res))
//#endregion

//#region Documentação - PATCH /prestadores/inativar
/**
 * @openapi
 * /prestadores/inativar:
 *   patch:
 *     tags: [Prestadores]
 *     summary: Inativa o perfil de prestador logado
 *     description: Torna o perfil de prestador autenticado inativo.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Prestador inativado (sem conteúdo).
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.patch('/prestadores/inativar', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.inativar(req, res))
//#endregion

//#region Documentação - PATCH /prestadores/ativar
/**
 * @openapi
 * /prestadores/ativar:
 *   patch:
 *     tags: [Prestadores]
 *     summary: Ativa o perfil de prestador logado
 *     description: Reativa o perfil de prestador autenticado previamente inativado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Prestador ativado (sem conteúdo).
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.patch('/prestadores/ativar', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.ativar(req, res))
//#endregion

//#region Documentação - GET /prestadores/buscar
/**
 * @openapi
 * /prestadores/buscar:
 *   get:
 *     tags: [Prestadores]
 *     summary: Busca prestadores por categoria e/ou nome (RF06)
 *     description: Retorna prestadores ativos filtrados por categoria de serviço e/ou nome de usuário semelhante. Ambos os filtros são opcionais.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idCategoria
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra prestadores que oferecem serviços nessa categoria.
 *       - in: query
 *         name: nomePrestador
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra prestadores por nome semelhante.
 *     responses:
 *       200:
 *         description: Lista de prestadores encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrestadorBuscaResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
// Literais antes de /:id para evitar captura pelo parâmetro dinâmico
prestadorRouter.get('/prestadores/buscar', exigeAutenticacao, (req, res) => prestadorController.buscar(req, res))
//#endregion

//#region Documentação - GET /prestadores/buscar-por-distancia
/**
 * @openapi
 * /prestadores/buscar-por-distancia:
 *   get:
 *     tags: [Prestadores]
 *     summary: Busca prestadores por cidade (RF07)
 *     description: Retorna prestadores ativos localizados na cidade informada.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cidade
 *         required: true
 *         schema:
 *           type: string
 *         description: Cidade usada como filtro (atributo `localizacaoCidade` do usuário).
 *     responses:
 *       200:
 *         description: Lista de prestadores da cidade informada.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrestadorBuscaResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       422:
 *         description: Campo obrigatório vazio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O campo 'cidade' é obrigatório."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.get('/prestadores/buscar-por-distancia', exigeAutenticacao, (req, res) => prestadorController.buscarPorDistancia(req, res))
//#endregion

//#region Documentação - GET /prestadores/{idPrestador}/servicos
/**
 * @openapi
 * /prestadores/{idPrestador}/servicos:
 *   get:
 *     tags: [Prestadores]
 *     summary: Lista os serviços de um prestador (RF08)
 *     description: Retorna a lista pública de serviços oferecidos por um prestador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPrestador
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do prestador.
 *     responses:
 *       200:
 *         description: Lista de serviços do prestador.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServicoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.get('/prestadores/:idPrestador/servicos', exigeAutenticacao, (req, res) => servicoController.buscarDoPrestador(req, res))
//#endregion

//#region Documentação - GET /prestadores/{idPrestador}/avaliacoes
/**
 * @openapi
 * /prestadores/{idPrestador}/avaliacoes:
 *   get:
 *     tags: [Prestadores]
 *     summary: Lista as avaliações de um prestador (RF08)
 *     description: Rota pública. Retorna as avaliações públicas do prestador acompanhadas da média e do total.
 *     parameters:
 *       - in: path
 *         name: idPrestador
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do prestador.
 *     responses:
 *       200:
 *         description: Avaliações do prestador com média e total.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvaliacoesDoPrestadorResposta'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
prestadorRouter.get('/prestadores/:idPrestador/avaliacoes', (req, res) => avaliacaoController.buscarDoPrestador(req, res))
//#endregion

//#region Documentação - GET /prestadores/{id}
/**
 * @openapi
 * /prestadores/{id}:
 *   get:
 *     tags: [Prestadores]
 *     summary: Retorna os dados públicos de um prestador
 *     description: Retorna o perfil público de um prestador pelo seu ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do prestador.
 *     responses:
 *       200:
 *         description: Perfil público do prestador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrestadorPerfilPublico'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
// Rota dinâmica por último
prestadorRouter.get('/prestadores/:id', exigeAutenticacao, (req, res) => prestadorController.buscarPorId(req, res))
//#endregion

export default prestadorRouter
