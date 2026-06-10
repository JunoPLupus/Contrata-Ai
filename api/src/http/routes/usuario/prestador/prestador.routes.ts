import { Router } from 'express'
import { prestadorController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";

const prestadorRouter = Router()
prestadorRouter.post('/prestadores', exigeAutenticacao, (req, res) => prestadorController.cadastrar(req, res))

export default prestadorRouter