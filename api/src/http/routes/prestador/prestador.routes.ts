import { Router } from 'express'
import { prestadorController } from "../../../shared/container";

const prestadorRouter = Router()
prestadorRouter.post('/prestadores', (req, res) => prestadorController.cadastrar(req, res))

export default prestadorRouter