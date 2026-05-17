import { usuarioController } from "../../../shared/container";
import { Router } from "express";


const usuarioRouter = Router()
usuarioRouter.post('/usuarios', (req, res) => usuarioController.cadastrar(req, res))
usuarioRouter.get('/usuarios', (req, res) => usuarioController.buscarPorEmail(req, res))

export default usuarioRouter