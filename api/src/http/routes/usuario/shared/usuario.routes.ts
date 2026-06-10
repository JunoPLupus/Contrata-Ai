import { usuarioController, clientePrestadorController } from "../../../../shared/container";
import { Router } from "express";

const usuarioRouter = Router()
usuarioRouter.post('/clientes-prestadores', (req, res) => clientePrestadorController.cadastrar(req, res))
usuarioRouter.get('/usuarios', (req, res) => usuarioController.buscarPorEmail(req, res))

export default usuarioRouter