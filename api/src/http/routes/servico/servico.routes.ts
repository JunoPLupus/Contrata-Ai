import { Router } from 'express'
import { servicoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const servicoRouter = Router()
servicoRouter.post('/servicos', exigeAutenticacao, exigePerfilPrestador, (req, res) => servicoController.cadastrar(req, res))

export default servicoRouter
