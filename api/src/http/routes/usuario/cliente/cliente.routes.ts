import { clienteController, avaliacaoController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { Router } from "express";

const clienteRouter = Router()

//#region Documentação - GET /clientes
/**
 * @openapi
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Retorna o cliente logado (dados completos)
 *     description: Retorna o perfil completo do cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil completo do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientePerfil'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
clienteRouter.get('/clientes', exigeAutenticacao, (req, res) => clienteController.buscarLogado(req, res))
//#endregion

//#region Documentação - POST /clientes
/**
 * @openapi
 * /clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Cadastra um cliente
 *     description: Rota pública. Cria um novo usuário com perfil de cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCadastroRequest'
 *     responses:
 *       201:
 *         description: Cliente cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteRespostaCadastro'
 *       422:
 *         description: Campo obrigatório vazio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O campo 'nome' é obrigatório."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
clienteRouter.post('/clientes', (req, res) => clienteController.cadastrar(req, res))
//#endregion

//#region Documentação - PUT /clientes
/**
 * @openapi
 * /clientes:
 *   put:
 *     tags: [Clientes]
 *     summary: Atualiza o cliente logado
 *     description: Atualiza parcialmente os dados do cliente autenticado (apenas os campos enviados).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarClienteRequest'
 *     responses:
 *       200:
 *         description: Perfil completo atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientePerfil'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Cliente'
 *       422:
 *         description: Formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O 'localizacaoCep' inserido é inválido. Verifique o formato e tente novamente."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
clienteRouter.put('/clientes', exigeAutenticacao, (req, res) => clienteController.atualizar(req, res))
//#endregion

//#region Documentação - GET /clientes/{id}
/**
 * @openapi
 * /clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Retorna os dados públicos de um cliente
 *     description: Retorna o perfil público/parcial de um cliente pelo seu ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente.
 *     responses:
 *       200:
 *         description: Perfil público do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientePerfilPublico'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Cliente'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
clienteRouter.get('/clientes/:id', exigeAutenticacao, (req, res) => clienteController.buscarPorId(req, res))
//#endregion

//#region Documentação - GET /clientes/{idCliente}/avaliacoes
/**
 * @openapi
 * /clientes/{idCliente}/avaliacoes:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista as avaliações recebidas por um cliente (reputação)
 *     description: >
 *       Retorna as avaliações que o cliente recebeu de prestadores, na visão pública
 *       (o id do prestador autor é omitido quando `anonima === true`), com média e total.
 *       Acesso restrito a prestadores logados e ao próprio cliente — outros clientes recebem 403.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCliente
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente.
 *     responses:
 *       200:
 *         description: Avaliações recebidas pelo cliente com média e total.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumoAvaliacoesResposta'
 *       403:
 *         description: Usuário sem token válido, ou que não é prestador nem o próprio cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "Você não têm permissão para acessar este recurso."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
clienteRouter.get('/clientes/:idCliente/avaliacoes', exigeAutenticacao, (req, res) => avaliacaoController.buscarDoCliente(req, res))
//#endregion

export default clienteRouter
