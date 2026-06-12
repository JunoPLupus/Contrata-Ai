import { clienteController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { Router } from "express";

const clienteRouter = Router()
clienteRouter.get('/clientes', exigeAutenticacao, (req, res) => clienteController.buscarLogado(req, res))
clienteRouter.post('/clientes', (req, res) => clienteController.cadastrar(req, res))
clienteRouter.put('/clientes', exigeAutenticacao, (req, res) => clienteController.atualizar(req, res))
clienteRouter.get('/clientes/:id', exigeAutenticacao, (req, res) => clienteController.buscarPorId(req, res))

export default clienteRouter