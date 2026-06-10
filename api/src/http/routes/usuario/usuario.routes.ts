import { clienteController, usuarioController, clientePrestadorController } from "../../../shared/container";
import { Router } from "express";


const usuarioRouter = Router()
usuarioRouter.post('/usuarios/prestador', (req, res) => clientePrestadorController.cadastrar(req, res))
usuarioRouter.post('/usuarios', (req, res) => clienteController.cadastrar(req, res))
usuarioRouter.get('/usuarios', (req, res) => usuarioController.buscarPorEmail(req, res))

export default usuarioRouter