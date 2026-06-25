import { Router } from 'express'
import { prestadorController, avaliacaoController, servicoController } from "../../../../shared/container";
import { exigeAutenticacao } from "../../../middlewares/exige-autenticacao/exige-autenticacao.middleware";
import { exigePerfilPrestador } from "../../../middlewares/exige-perfil-prestador/exige-perfil-prestador.middleware";

const prestadorRouter = Router()
prestadorRouter.post('/prestadores', exigeAutenticacao, (req, res) => prestadorController.cadastrar(req, res))
prestadorRouter.get('/prestadores', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.buscarLogado(req, res))
prestadorRouter.put('/prestadores', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.atualizar(req, res))
prestadorRouter.patch('/prestadores/inativar', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.inativar(req, res))
prestadorRouter.patch('/prestadores/ativar', exigeAutenticacao, exigePerfilPrestador, (req, res) => prestadorController.ativar(req, res))

// Literais antes de /:id para evitar captura pelo parâmetro dinâmico
prestadorRouter.get('/prestadores/buscar', exigeAutenticacao, (req, res) => prestadorController.buscar(req, res))
prestadorRouter.get('/prestadores/buscar-por-distancia', exigeAutenticacao, (req, res) => prestadorController.buscarPorDistancia(req, res))

prestadorRouter.get('/prestadores/:idPrestador/servicos', exigeAutenticacao, (req, res) => servicoController.buscarDoPrestador(req, res))
prestadorRouter.get('/prestadores/:idPrestador/avaliacoes', (req, res) => avaliacaoController.buscarDoPrestador(req, res))

// Rota dinâmica por último
prestadorRouter.get('/prestadores/:id', exigeAutenticacao, (req, res) => prestadorController.buscarPorId(req, res))

export default prestadorRouter
