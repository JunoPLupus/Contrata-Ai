import { Router } from 'express'
import { prestadorController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const prestadorRouter = Router()
prestadorRouter.post('/prestadores', exigeAutenticacao, (req, res) => prestadorController.cadastrar(req, res))
prestadorRouter.get('/prestadores', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.buscarLogado(req, res))
prestadorRouter.put('/prestadores', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.atualizar(req, res))
prestadorRouter.patch('/prestadores/inativar', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.inativar(req, res))
prestadorRouter.patch('/prestadores/ativar', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.ativar(req, res))
prestadorRouter.get('/prestadores/:id', exigeAutenticacao, (req, res) => prestadorController.buscarPorId(req, res))

export default prestadorRouter
