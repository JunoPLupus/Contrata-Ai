import { Router } from 'express'

import { contratoController, extensaoPrazoController, avaliacaoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const contratoRouter = Router()

//#region Documentação - GET /contratos
/**
 * @openapi
 * /contratos:
 *   get:
 *     tags: [Contratos]
 *     summary: Lista os contratos do usuário logado
 *     description: Retorna os contratos em que o usuário autenticado participa como cliente e/ou como prestador.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contratos do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.get('/contratos', exigeAutenticacao, (req, res) => contratoController.buscarDoUsuario(req, res))
//#endregion

//#region Documentação - GET /contratos/{id}
/**
 * @openapi
 * /contratos/{id}:
 *   get:
 *     tags: [Contratos]
 *     summary: Busca um contrato por ID
 *     description: Retorna um contrato do qual o usuário logado participa (como cliente ou prestador). O campo `whatsappPrestador` só é incluído quando `whatsappLiberado === true`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     responses:
 *       200:
 *         description: Contrato encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.get('/contratos/:id', exigeAutenticacao, (req, res) => contratoController.buscarPorId(req, res))
//#endregion

//#region Documentação - PATCH /contratos/{id}
/**
 * @openapi
 * /contratos/{id}:
 *   patch:
 *     tags: [Contratos]
 *     summary: Atualiza datas de planejamento do contrato
 *     description: Atualiza `dataInicioEstimada` e/ou `prazoEstimado`. Restrito ao prestador do contrato.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContratoAtualizacaoRequest'
 *     responses:
 *       200:
 *         description: Contrato atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O contrato só pode ser alterado enquanto estiver com status 'aguardando_inicio'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.patch('/contratos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => contratoController.atualizar(req, res))
//#endregion

//#region Documentação - PATCH /contratos/{id}/atualizar-status
/**
 * @openapi
 * /contratos/{id}/atualizar-status:
 *   patch:
 *     tags: [Contratos]
 *     summary: Atualiza o status do contrato
 *     description: Altera o `status` do contrato. Restrito ao prestador do contrato.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContratoStatusRequest'
 *     responses:
 *       200:
 *         description: Status do contrato atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Transição de status inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "Transição de status inválida: 'aguardando_inicio' → 'concluido'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.patch('/contratos/:id/atualizar-status', exigeAutenticacao, exigePerfilPrestador, (req, res) => contratoController.atualizarStatus(req, res))
//#endregion

//#region Documentação - PATCH /contratos/{id}/concluir
/**
 * @openapi
 * /contratos/{id}/concluir:
 *   patch:
 *     tags: [Contratos]
 *     summary: Conclui um contrato
 *     description: Marca o contrato como concluído. Disponível para o cliente ou prestador participante (conforme as regras de negócio).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     responses:
 *       200:
 *         description: Contrato concluído.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O contrato só pode ser concluído quando estiver com status 'aguardando_confirmacao'."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.patch('/contratos/:id/concluir', exigeAutenticacao, (req, res) => contratoController.concluir(req, res))
//#endregion

//#region Documentação - PATCH /contratos/{id}/cancelar
/**
 * @openapi
 * /contratos/{id}/cancelar:
 *   patch:
 *     tags: [Contratos]
 *     summary: Cancela um contrato
 *     description: Cancela o contrato registrando o `motivo` e quem cancelou. Disponível para o cliente ou prestador participante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContratoCancelamentoRequest'
 *     responses:
 *       200:
 *         description: Contrato cancelado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Campo obrigatório vazio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O campo 'motivo' é obrigatório."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.patch('/contratos/:id/cancelar', exigeAutenticacao, (req, res) => contratoController.cancelar(req, res))
//#endregion

//#region Documentação - POST /contratos/{id}/estender-prazo
/**
 * @openapi
 * /contratos/{id}/estender-prazo:
 *   post:
 *     tags: [Extensões de Prazo]
 *     summary: Solicita extensão de prazo de um contrato
 *     description: O prestador solicita uma extensão de prazo informando `novoPrazo` e `justificativa`. A extensão nasce com status `pendente`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExtensaoPrazoCadastroRequest'
 *     responses:
 *       201:
 *         description: Extensão de prazo solicitada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtensaoPrazoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Prestador'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O novo prazo deve ser posterior ao prazo estimado atual do contrato."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.post('/contratos/:id/estender-prazo', exigeAutenticacao, exigePerfilPrestador, (req, res) => extensaoPrazoController.solicitarExtensao(req, res))
//#endregion

//#region Documentação - PATCH /contratos/{id}/estender-prazo/{idExtensao}/responder
/**
 * @openapi
 * /contratos/{id}/estender-prazo/{idExtensao}/responder:
 *   patch:
 *     tags: [Extensões de Prazo]
 *     summary: Responde a uma solicitação de extensão de prazo
 *     description: O cliente aprova ou recusa a extensão de prazo solicitada pelo prestador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *       - in: path
 *         name: idExtensao
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação de extensão de prazo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExtensaoPrazoDecisaoRequest'
 *     responses:
 *       200:
 *         description: Extensão de prazo respondida (aprovada ou recusada).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtensaoPrazoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404ExtensaoPrazo'
 *       422:
 *         description: Operação não permitida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "Só é possível responder a uma extensão de prazo com status pendente."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.patch('/contratos/:id/estender-prazo/:idExtensao/responder', exigeAutenticacao, (req, res) => extensaoPrazoController.responderExtensao(req, res))
//#endregion

//#region Documentação - PATCH /contratos/{id}/relatar-problema
/**
 * @openapi
 * /contratos/{id}/relatar-problema:
 *   patch:
 *     tags: [Contratos]
 *     summary: Relata um problema em um contrato
 *     description: O cliente registra um problema no contrato informando `tipo` e `descricao`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContratoProblemaRequest'
 *     responses:
 *       200:
 *         description: Problema registrado no contrato.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratoResposta'
 *       403:
 *         $ref: '#/components/responses/Erro403Autenticacao'
 *       404:
 *         $ref: '#/components/responses/Erro404Contrato'
 *       422:
 *         description: Formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *             example:
 *               message: "O 'tipo' inserido é inválido. Verifique o formato e tente novamente."
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.patch('/contratos/:id/relatar-problema', exigeAutenticacao, (req, res) => contratoController.relatarProblema(req, res))
//#endregion

//#region Documentação - GET /contratos/{idContrato}/avaliacao
/**
 * @openapi
 * /contratos/{idContrato}/avaliacao:
 *   get:
 *     tags: [Avaliações]
 *     summary: Busca a avaliação de um contrato
 *     description: Rota pública. Retorna a avaliação vinculada ao contrato na visão pública (respeita anonimato — RN08).
 *     parameters:
 *       - in: path
 *         name: idContrato
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contrato.
 *     responses:
 *       200:
 *         description: Avaliação do contrato (visão pública).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvaliacaoPublicaResposta'
 *       404:
 *         $ref: '#/components/responses/Erro404Avaliacao'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
contratoRouter.get('/contratos/:idContrato/avaliacao', (req, res) => avaliacaoController.buscarDoContrato(req, res))
//#endregion

export default contratoRouter
