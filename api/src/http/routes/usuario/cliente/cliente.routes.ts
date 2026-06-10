import { clienteController } from "../../../../shared/container";
import { Router } from "express";

const clienteRouter = Router()
clienteRouter.post('/clientes', (req, res) => clienteController.cadastrar(req, res))

export default clienteRouter