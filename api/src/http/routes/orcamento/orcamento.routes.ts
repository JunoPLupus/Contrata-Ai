import { Router } from 'express'

import { orcamentoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const orcamentoRouter = Router()


orcamentoRouter.get('/orcamentos', exigeAutenticacao, exigePerfilPrestador, (req, res) => orcamentoController.buscarDoPrestador(req, res))
orcamentoRouter.post('/orcamentos', exigeAutenticacao, exigePerfilPrestador, (req, res) => orcamentoController.cadastrar(req, res))
orcamentoRouter.patch('/orcamentos/:id/aceitar', exigeAutenticacao, (req, res) => orcamentoController.aceitar(req, res))
orcamentoRouter.get('/orcamentos/:id', exigeAutenticacao, (req, res) => orcamentoController.buscarPorId(req, res))
orcamentoRouter.patch('/orcamentos/:id', exigeAutenticacao, exigePerfilPrestador, (req, res) => orcamentoController.atualizar(req, res))

export default orcamentoRouter
