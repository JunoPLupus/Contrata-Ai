import { usuarioController, usuarioPrestadorController } from "../../../shared/container";
import { Router } from "express";


const usuarioRouter = Router()
usuarioRouter.post('/usuarios/prestador', (req, res) => usuarioPrestadorController.cadastrar(req, res))
usuarioRouter.post('/usuarios', (req, res) => usuarioController.cadastrar(req, res))
usuarioRouter.get('/usuarios', (req, res) => usuarioController.buscarPorEmail(req, res))

export default usuarioRouter