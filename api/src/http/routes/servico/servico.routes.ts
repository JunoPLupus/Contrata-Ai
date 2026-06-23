import { Router } from 'express'

import { servicoController } from "../../../shared/container";
import { exigeAutenticacao } from "../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const servicoRouter = Router()
servicoRouter.post('/servicos', [exigeAutenticacao, exigePerfilPrestador], (req, res) => servicoController.cadastrar(req, res))
servicoRouter.get('/servicos', [exigeAutenticacao, exigePerfilPrestador], (req, res) => servicoController.buscarTodos(req, res))
servicoRouter.get('/servicos/:id', [exigeAutenticacao, exigePerfilPrestador], (req, res) => servicoController.buscarPorId(req, res))
servicoRouter.patch('/servicos/:id', [exigeAutenticacao, exigePerfilPrestador], (req, res) => servicoController.atualizar(req, res))
servicoRouter.delete('/servicos/:id', [exigeAutenticacao, exigePerfilPrestador], (req, res) => servicoController.deletar(req, res))

export default servicoRouter
