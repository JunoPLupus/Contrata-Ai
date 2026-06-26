import { Router } from 'express'

import { orcamentoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const orcamentoRouter = Router()

//#region Documentação - GET /orcamentos
/**
 * @openapi
 * /orcamentos:
 *   get:
 *     tags: [Orçamentos]
 *     summary: Lista os orçamentos do prestador logado
 *     description: Retorna todos os orçamentos enviados pelo prestador autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de orçamentos do prestador.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrcamentoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
orcamentoRouter.get('/orcamentos', exigeAutenticacao, exigePerfilPrestador, (req, res) => orcamentoController.buscarDoPrestador(req, res))
//#endregion

//#region Documentação - POST /orcamentos
/**
 * @openapi
 * /orcamentos:
 *   post:
 *     tags: [Orçamentos]
 *     summary: Cadastra um orçamento
 *     description: O prestador envia um orçamento para uma solicitação informando `valor` e, opcionalmente, `prazoDias`.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrcamentoCadastroRequest'
 *     responses:
 *       201:
 *         description: Orçamento criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrcamentoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Solicitacao'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "Só é possível enviar orçamento para solicitações com status 'aberta'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
orcamentoRouter.post('/orcamentos', exigeAutenticacao, exigePerfilPrestador, (req, res) => orcamentoController.cadastrar(req, res))
//#endregion

//#region Documentação - PATCH /orcamentos/{id}/aceitar
/**
 * @openapi
 * /orcamentos/{id}/aceitar:
 *   patch:
 *     tags: [Orçamentos]
 *     summary: Aceita um orçamento
 *     description: O cliente aceita um orçamento recebido. Gera o contrato correspondente (conforme regras de negócio) e encerra os demais orçamentos da solicitação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do orçamento.
 *     responses:
 *       200:
 *         description: Orçamento aceito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrcamentoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Orcamento'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "Só é possível aceitar um orçamento com status 'pendente'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
orcamentoRouter.patch('/orcamentos/:id/aceitar', exigeAutenticacao, (req, res) => orcamentoController.aceitar(req, res))
//#endregion

//#region Documentação - GET /orcamentos/{id}
/**
 * @openapi
 * /orcamentos/{id}:
 *   get:
 *     tags: [Orçamentos]
 *     summary: Busca um orçamento por ID
 *     description: Retorna um orçamento do qual o usuário logado participa (cliente da solicitação ou prestador autor).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do orçamento.
 *     responses:
 *       200:
 *         description: Orçamento encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrcamentoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Orcamento'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
orcamentoRouter.get('/orcamentos/:id', exigeAutenticacao, (req, res) => orcamentoController.buscarPorId(req, res))
//#endregion

//#region Documentação - PATCH /orcamentos/{id}
/**
 * @openapi
 * /orcamentos/{id}:
 *   patch:
 *     tags: [Orçamentos]
 *     summary: Atualiza um orçamento
 *     description: O prestador autor atualiza `valor`, `prazoDias` e/ou `status` de um orçamento pendente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do orçamento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrcamentoAtualizacaoRequest'
 *     responses:
 *       200:
 *         description: Orçamento atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrcamentoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Orcamento'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O orçamento só pode ser alterado enquanto estiver com status 'pendente'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
orcamentoRouter.patch('/orcamentos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => orcamentoController.atualizar(req, res))
//#endregion

export default orcamentoRouter
