import { usuarioController, clientePrestadorController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { Router } from "express";

const usuarioRouter = Router()
usuarioRouter.post('/clientes-prestadores', (req, res) => clientePrestadorController.cadastrar(req, res))
usuarioRouter.get('/usuarios', (req, res) => usuarioController.buscarPorEmail(req, res))
usuarioRouter.patch('/usuarios', exigeAutenticacao, (req, res) => usuarioController.inativar(req, res))

export default usuarioRouter