import { Router } from "express";

import { categoriaController } from "../../../shared/container";

const categoriaRouter = Router()

//#region Documentação - GET /categorias
/**
 * @openapi
 * /categorias:
 *   get:
 *     tags: [Categorias]
 *     summary: Lista todas as categorias (aninhadas)
 *     description: Rota pública. Retorna as categorias raiz com suas subcategorias aninhadas.
 *     responses:
 *       200:
 *         description: Lista de categorias raiz com subcategorias.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaAninhadaResposta'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
categoriaRouter.get('/categorias', (req, res) => categoriaController.buscarTodas(req, res))
//#endregion

//#region Documentação - GET /categorias/subcategorias/{id}
/**
 * @openapi
 * /categorias/subcategorias/{id}:
 *   get:
 *     tags: [Categorias]
 *     summary: Lista as subcategorias de uma categoria pai
 *     description: Rota pública. Retorna todas as subcategorias diretas da categoria pai informada.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria pai.
 *     responses:
 *       200:
 *         description: Lista de subcategorias.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaResposta'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
categoriaRouter.get('/categorias/subcategorias/:id', (req, res) => categoriaController.buscarSubcategorias(req, res))
//#endregion

//#region Documentação - GET /categorias/{id}
/**
 * @openapi
 * /categorias/{id}:
 *   get:
 *     tags: [Categorias]
 *     summary: Busca uma categoria por ID
 *     description: Rota pública. Retorna os detalhes de uma categoria, incluindo o `categoriaPaiId`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria.
 *     responses:
 *       200:
 *         description: Categoria encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaDetalheResposta'
 *       404:
 *         $ref: '#/components/responses/Erro404Categoria'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
categoriaRouter.get('/categorias/:id', (req, res) => categoriaController.buscarPorId(req, res))
//#endregion

export default categoriaRouter
