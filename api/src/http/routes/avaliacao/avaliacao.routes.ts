import { Router } from 'express'

import { avaliacaoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";

const avaliacaoRouter = Router()

avaliacaoRouter.get('/avaliacoes', exigeAutenticacao, (req, res) => avaliacaoController.buscarDoClienteLogado(req, res))
avaliacaoRouter.get('/avaliacoes/:id', (req, res) => avaliacaoController.buscarPorId(req, res))
avaliacaoRouter.post('/avaliacoes', exigeAutenticacao, (req, res) => avaliacaoController.cadastrar(req, res))
avaliacaoRouter.patch('/avaliacoes/:id', exigeAutenticacao, (req, res) => avaliacaoController.atualizar(req, res))
avaliacaoRouter.delete('/avaliacoes/:id', exigeAutenticacao, (req, res) => avaliacaoController.deletar(req, res))

export default avaliacaoRouter
