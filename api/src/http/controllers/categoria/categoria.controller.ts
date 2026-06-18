import { Request, Response } from 'express';

import { BuscarTodasCategoriasUseCase } from "../../../domain/use-cases/categoria/buscar-todas-categorias/buscar-todas-categorias.use-case";
import { BuscarCategoriaPorIdUseCase } from "../../../domain/use-cases/categoria/buscar-categoria-por-id/buscar-categoria-por-id.use-case";
import { BuscarCategoriasPorCategoriaPaiIdUseCase } from "../../../domain/use-cases/categoria/buscar-categorias-por-categoria-pai-id/buscar-categorias-por-categoria-pai-id.use-case";
import { CategoriaMapper } from "../../mappers/categoria/categoria.mapper";

export class CategoriaController {
    constructor(
        private readonly buscarTodasCategoriasUseCase: BuscarTodasCategoriasUseCase,
        private readonly buscarCategoriaPorIdUseCase: BuscarCategoriaPorIdUseCase,
        private readonly buscarCategoriasPorCategoriaPaiIdUseCase: BuscarCategoriasPorCategoriaPaiIdUseCase
    ) {}

    /**
     * Retorna todas as categorias raiz com suas subcategorias aninhadas.
     * @param request - Sem parâmetros.
     * @param response - 200 com lista de categorias aninhadas por nivel.
     */
    public async buscarTodas(request: Request, response: Response): Promise<void> {
        const categorias = await this.buscarTodasCategoriasUseCase.execute()
        response.status(200).json(CategoriaMapper.paraListaAninhadaRespostaDTO(categorias))
    }

    /**
     * Retorna uma categoria pelo seu ID.
     * @param request - Params: `id` da categoria.
     * @param response - 200 com a categoria encontrada.
     * @throws {RecursoNaoEncontradoError} se a categoria nao existir — resulta em 404 via errorHandler.
     */
    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const categoria = await this.buscarCategoriaPorIdUseCase.execute(request.params.id as string)
        response.status(200).json(CategoriaMapper.paraDetalheRespostaDTO(categoria!))
    }

    /**
     * Retorna todas as subcategorias de uma categoria pai pelo seu ID.
     * @param request - Params: `id` da categoria pai.
     * @param response - 200 com a lista de subcategorias.
     */
    public async buscarSubcategorias(request: Request, response: Response): Promise<void> {
        const subcategorias = await this.buscarCategoriasPorCategoriaPaiIdUseCase.execute(request.params.id as string)
        response.status(200).json(subcategorias.map(c => CategoriaMapper.paraRespostaDTO(c)))
    }
}
