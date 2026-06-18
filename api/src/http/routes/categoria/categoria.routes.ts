import { Router } from "express";

import { categoriaController } from "../../../shared/container";

const categoriaRouter = Router()
categoriaRouter.get('/categorias', (req, res) => categoriaController.buscarTodas(req, res))
categoriaRouter.get('/categorias/subcategorias/:id', (req, res) => categoriaController.buscarSubcategorias(req, res))
categoriaRouter.get('/categorias/:id', (req, res) => categoriaController.buscarPorId(req, res))

export default categoriaRouter
