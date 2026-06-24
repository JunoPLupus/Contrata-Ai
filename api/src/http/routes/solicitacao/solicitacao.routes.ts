import { Router } from 'express'

import { solicitacaoController, orcamentoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const solicitacaoRouter = Router()

solicitacaoRouter.get('/solicitacoes', exigeAutenticacao, (req, res) => solicitacaoController.buscarDoCliente(req, res))
solicitacaoRouter.get('/solicitacoes/disponiveis', exigeAutenticacao, exigePerfilPrestador, (req, res) => solicitacaoController.buscarDisponiveis(req, res))
solicitacaoRouter.post('/solicitacoes', exigeAutenticacao, (req, res) => solicitacaoController.cadastrar(req, res))
solicitacaoRouter.get('/solicitacoes/:id/orcamentos', exigeAutenticacao, (req, res) => orcamentoController.buscarDaSolicitacao(req, res))
solicitacaoRouter.get('/solicitacoes/:id', exigeAutenticacao, (req, res) => solicitacaoController.buscarPorId(req, res))
solicitacaoRouter.patch('/solicitacoes/:id', exigeAutenticacao, (req, res) => solicitacaoController.atualizar(req, res))

export default solicitacaoRouter
