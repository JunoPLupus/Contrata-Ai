import { Router } from "express";

import { authController } from "../../../shared/container";
import { bloqueiaUsuarioAutenticado } from "../../middlewares/bloqueia-usuario-autenticado/bloqueia-usuario-autenticado.middleware";

const authRouter = Router()
authRouter.post('/login', bloqueiaUsuarioAutenticado, (req, res) => authController.login(req, res))

export default authRouter