import { Router } from 'express'

import { servicoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const servicoRouter = Router()

//#region Documentação - POST /servicos
/**
 * @openapi
 * /servicos:
 *   post:
 *     tags: [Serviços]
 *     summary: Cadastra um serviço
 *     description: O prestador logado cadastra um novo serviço vinculado a uma categoria.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicoCadastroRequest'
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Categoria'
 *       422:
 *         description: Campo obrigatório vazio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O campo 'descricao' é obrigatório."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
servicoRouter.post('/servicos', exigeAutenticacao, exigePerfilPrestador, (req, res) => servicoController.cadastrar(req, res))
//#endregion

//#region Documentação - GET /servicos
/**
 * @openapi
 * /servicos:
 *   get:
 *     tags: [Serviços]
 *     summary: Lista os serviços do prestador logado
 *     description: Retorna todos os serviços cadastrados pelo prestador autenticado.
 *     security:
 *       - bearerAuth: []
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
 *         $ref: '#/components/responses/Erro403Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
servicoRouter.get('/servicos', exigeAutenticacao, exigePerfilPrestador, (req, res) => servicoController.buscarTodos(req, res))
//#endregion

//#region Documentação - GET /servicos/{id}
/**
 * @openapi
 * /servicos/{id}:
 *   get:
 *     tags: [Serviços]
 *     summary: Busca um serviço por ID
 *     description: Retorna um serviço do prestador logado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do serviço.
 *     responses:
 *       200:
 *         description: Serviço encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Servico'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
servicoRouter.get('/servicos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => servicoController.buscarPorId(req, res))
//#endregion

//#region Documentação - PATCH /servicos/{id}
/**
 * @openapi
 * /servicos/{id}:
 *   patch:
 *     tags: [Serviços]
 *     summary: Atualiza um serviço
 *     description: O prestador dono atualiza parcialmente os dados de um serviço.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do serviço.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicoAtualizacaoRequest'
 *     responses:
 *       200:
 *         description: Serviço atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Servico'
 *       422:
 *         description: Valor fora do limite.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O campo 'descricao' deve conter no mínimo 5 caracteres."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
servicoRouter.patch('/servicos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => servicoController.atualizar(req, res))
//#endregion

//#region Documentação - DELETE /servicos/{id}
/**
 * @openapi
 * /servicos/{id}:
 *   delete:
 *     tags: [Serviços]
 *     summary: Remove um serviço
 *     description: O prestador dono exclui permanentemente um serviço.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do serviço.
 *     responses:
 *       204:
 *         description: Serviço removido com sucesso (sem conteúdo).
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Servico'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
servicoRouter.delete('/servicos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => servicoController.deletar(req, res))
//#endregion

export default servicoRouter
