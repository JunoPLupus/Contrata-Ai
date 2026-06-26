import { usuarioController, clientePrestadorController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { Router } from "express";

const usuarioRouter = Router()

//#region Documentação - POST /clientes-prestadores
/**
 * @openapi
 * /clientes-prestadores:
 *   post:
 *     tags: [Usuários]
 *     summary: Cadastra um cliente e prestador simultaneamente
 *     description: Rota pública. Cria um usuário com os perfis de cliente e prestador ao mesmo tempo, retornando também o `idPrestador` vinculado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCadastroRequest'
 *     responses:
 *       201:
 *         description: Usuário (cliente + prestador) cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientePrestadorRespostaCadastro'
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
usuarioRouter.post('/clientes-prestadores', (req, res) => clientePrestadorController.cadastrar(req, res))
//#endregion

//#region Documentação - GET /usuarios
/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags: [Usuários]
 *     summary: Busca um usuário por e-mail
 *     description: Rota pública. Verifica a existência de um usuário pelo e-mail. Retorna 404 com corpo `null` quando não encontrado.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: E-mail do usuário a verificar.
 *     responses:
 *       200:
 *         description: Usuário encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteRespostaCadastro'
 *       404:
 *         description: Usuário não encontrado (corpo `null`).
 *         content:
 *           application/json:
 *             schema: {}
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
usuarioRouter.get('/usuarios', (req, res) => usuarioController.buscarPorEmail(req, res))
//#endregion

//#region Documentação - PATCH /usuarios
/**
 * @openapi
 * /usuarios:
 *   patch:
 *     tags: [Usuários]
 *     summary: Inativa o usuário logado
 *     description: Torna o perfil do usuário autenticado (cliente/prestador) inativo permanentemente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Usuário inativado (sem conteúdo).
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
usuarioRouter.patch('/usuarios', exigeAutenticacao, (req, res) => usuarioController.inativar(req, res))
//#endregion

export default usuarioRouter
