import { Router } from 'express'

import { solicitacaoController, orcamentoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const solicitacaoRouter = Router()

//#region Documentação - GET /solicitacoes
/**
 * @openapi
 * /solicitacoes:
 *   get:
 *     tags: [Solicitações]
 *     summary: Lista as solicitações do cliente logado
 *     description: Retorna todas as solicitações de serviço criadas pelo cliente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitações do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SolicitacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
solicitacaoRouter.get('/solicitacoes', exigeAutenticacao, (req, res) => solicitacaoController.buscarDoCliente(req, res))
//#endregion

//#region Documentação - GET /solicitacoes/disponiveis
/**
 * @openapi
 * /solicitacoes/disponiveis:
 *   get:
 *     tags: [Solicitações]
 *     summary: Lista solicitações disponíveis para o prestador
 *     description: Retorna as solicitações abertas que o prestador logado pode orçar. Pode ser filtrada por categoria.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idCategoria
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra as solicitações por categoria.
 *     responses:
 *       200:
 *         description: Lista de solicitações disponíveis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SolicitacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
solicitacaoRouter.get('/solicitacoes/disponiveis', exigeAutenticacao, exigePerfilPrestador, (req, res) => solicitacaoController.buscarDisponiveis(req, res))
//#endregion

//#region Documentação - POST /solicitacoes
/**
 * @openapi
 * /solicitacoes:
 *   post:
 *     tags: [Solicitações]
 *     summary: Cadastra uma solicitação
 *     description: O cliente logado cria uma solicitação de serviço. Quando `idPrestadorDireto` é informado, a solicitação é direcionada a um prestador específico.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitacaoCadastroRequest'
 *     responses:
 *       201:
 *         description: Solicitação criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
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
solicitacaoRouter.post('/solicitacoes', exigeAutenticacao, (req, res) => solicitacaoController.cadastrar(req, res))
//#endregion

//#region Documentação - GET /solicitacoes/{id}/orcamentos
/**
 * @openapi
 * /solicitacoes/{id}/orcamentos:
 *   get:
 *     tags: [Orçamentos]
 *     summary: Lista os orçamentos de uma solicitação
 *     description: Retorna os orçamentos recebidos para a solicitação. Restrito ao cliente dono da solicitação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação.
 *     responses:
 *       200:
 *         description: Lista de orçamentos da solicitação.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrcamentoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Solicitacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
solicitacaoRouter.get('/solicitacoes/:id/orcamentos', exigeAutenticacao, (req, res) => orcamentoController.buscarDaSolicitacao(req, res))
//#endregion

//#region Documentação - GET /solicitacoes/{id}
/**
 * @openapi
 * /solicitacoes/{id}:
 *   get:
 *     tags: [Solicitações]
 *     summary: Busca uma solicitação por ID
 *     description: Retorna uma solicitação acessível ao usuário logado (cliente dono ou prestador envolvido).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação.
 *     responses:
 *       200:
 *         description: Solicitação encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Solicitacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
solicitacaoRouter.get('/solicitacoes/:id', exigeAutenticacao, (req, res) => solicitacaoController.buscarPorId(req, res))
//#endregion

//#region Documentação - PATCH /solicitacoes/{id}
/**
 * @openapi
 * /solicitacoes/{id}:
 *   patch:
 *     tags: [Solicitações]
 *     summary: Atualiza uma solicitação
 *     description: O cliente dono atualiza a `descricao` e/ou o `status` da solicitação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitacaoAtualizacaoRequest'
 *     responses:
 *       200:
 *         description: Solicitação atualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Solicitacao'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "A descrição só pode ser alterada enquanto a solicitação estiver com status 'aberta'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
solicitacaoRouter.patch('/solicitacoes/:id', exigeAutenticacao, (req, res) => solicitacaoController.atualizar(req, res))
//#endregion

export default solicitacaoRouter
