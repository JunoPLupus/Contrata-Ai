import { Router } from 'express'

import { avaliacaoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";

const avaliacaoRouter = Router()

//#region Documentação - GET /avaliacoes
/**
 * @openapi
 * /avaliacoes:
 *   get:
 *     tags: [Avaliações]
 *     summary: Lista as avaliações feitas pelo cliente logado
 *     description: Retorna todas as avaliações criadas pelo cliente autenticado (visão completa, sempre com `idCliente`).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de avaliações do cliente logado.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AvaliacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
avaliacaoRouter.get('/avaliacoes', exigeAutenticacao, (req, res) => avaliacaoController.buscarDoClienteLogado(req, res))
//#endregion

//#region Documentação - GET /avaliacoes/{id}
/**
 * @openapi
 * /avaliacoes/{id}:
 *   get:
 *     tags: [Avaliações]
 *     summary: Busca uma avaliação pública por ID
 *     description: Rota pública. Retorna a avaliação na visão pública — `idCliente` é omitido quando `anonima === true` (RN08).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação.
 *     responses:
 *       200:
 *         description: Avaliação encontrada (visão pública).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvaliacaoPublicaResposta'
 *       404:
 *         $ref: '#/components/responses/Erro404Avaliacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
avaliacaoRouter.get('/avaliacoes/:id', (req, res) => avaliacaoController.buscarPorId(req, res))
//#endregion

//#region Documentação - POST /avaliacoes
/**
 * @openapi
 * /avaliacoes:
 *   post:
 *     tags: [Avaliações]
 *     summary: Cadastra uma avaliação
 *     description: Cria uma avaliação do cliente logado para um contrato concluído. A `nota` deve estar entre 1 e 5.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvaliacaoCadastroRequest'
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvaliacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O campo 'nota' deve ser no máximo 5."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
avaliacaoRouter.post('/avaliacoes', exigeAutenticacao, (req, res) => avaliacaoController.cadastrar(req, res))
//#endregion

//#region Documentação - PATCH /avaliacoes/{id}
/**
 * @openapi
 * /avaliacoes/{id}:
 *   patch:
 *     tags: [Avaliações]
 *     summary: Atualiza uma avaliação
 *     description: Atualiza parcialmente uma avaliação do cliente logado. Editável por até 7 dias após a criação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvaliacaoAtualizacaoRequest'
 *     responses:
 *       200:
 *         description: Avaliação atualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvaliacaoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Avaliacao'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "A avaliação só pode ser alterada até 7 dias após o registro."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
avaliacaoRouter.patch('/avaliacoes/:id', exigeAutenticacao, (req, res) => avaliacaoController.atualizar(req, res))
//#endregion

//#region Documentação - DELETE /avaliacoes/{id}
/**
 * @openapi
 * /avaliacoes/{id}:
 *   delete:
 *     tags: [Avaliações]
 *     summary: Remove uma avaliação
 *     description: Exclui uma avaliação do cliente logado. Permitido por até 7 dias após a criação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação.
 *     responses:
 *       204:
 *         description: Avaliação removida com sucesso (sem conteúdo).
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Avaliacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
avaliacaoRouter.delete('/avaliacoes/:id', exigeAutenticacao, (req, res) => avaliacaoController.deletar(req, res))
//#endregion

export default avaliacaoRouter
