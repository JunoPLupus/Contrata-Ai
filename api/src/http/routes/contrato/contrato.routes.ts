import { Router } from 'express'

import { contratoController, extensaoPrazoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const contratoRouter = Router()

contratoRouter.get('/contratos', exigeAutenticacao, (req, res) => contratoController.buscarDoUsuario(req, res))
contratoRouter.get('/contratos/:id', exigeAutenticacao, (req, res) => contratoController.buscarPorId(req, res))
contratoRouter.patch('/contratos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => contratoController.atualizar(req, res))
contratoRouter.patch('/contratos/:id/atualizar-status', exigeAutenticacao, exigePerfilPrestador, (req, res) => contratoController.atualizarStatus(req, res))
contratoRouter.patch('/contratos/:id/concluir', exigeAutenticacao, (req, res) => contratoController.concluir(req, res))
contratoRouter.patch('/contratos/:id/cancelar', exigeAutenticacao, (req, res) => contratoController.cancelar(req, res))
contratoRouter.post('/contratos/:id/estender-prazo', exigeAutenticacao, exigePerfilPrestador, (req, res) => extensaoPrazoController.solicitarExtensao(req, res))
contratoRouter.patch('/contratos/:id/estender-prazo/:idExtensao/responder', exigeAutenticacao, (req, res) => extensaoPrazoController.responderExtensao(req, res))

export default contratoRouter
