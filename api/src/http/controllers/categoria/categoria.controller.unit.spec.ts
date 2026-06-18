import { Request, Response } from 'express';

import { CategoriaController } from "./categoria.controller";
import { BuscarTodasCategoriasUseCase } from "../../../domain/use-cases/categoria/buscar-todas-categorias/buscar-todas-categorias.use-case";
import { BuscarCategoriaPorIdUseCase } from "../../../domain/use-cases/categoria/buscar-categoria-por-id/buscar-categoria-por-id.use-case";
import { BuscarCategoriasPorCategoriaPaiIdUseCase } from "../../../domain/use-cases/categoria/buscar-categorias-por-categoria-pai-id/buscar-categorias-por-categoria-pai-id.use-case";
import { CategoriaMother } from "../../../test-helpers/categoria.mother";

describe('CategoriaController', () => {
    let controller: CategoriaController
    let buscarTodasUseCaseMock: jest.Mocked<BuscarTodasCategoriasUseCase>
    let buscarPorIdUseCaseMock: jest.Mocked<BuscarCategoriaPorIdUseCase>
    let buscarSubcategoriasUseCaseMock: jest.Mocked<BuscarCategoriasPorCategoriaPaiIdUseCase>
    let req: Partial<Request>
    let res: Partial<Response>

    beforeEach(() => {
        buscarTodasUseCaseMock = { execute: jest.fn() } as any
        buscarPorIdUseCaseMock = { execute: jest.fn() } as any
        buscarSubcategoriasUseCaseMock = { execute: jest.fn() } as any
        controller = new CategoriaController(buscarTodasUseCaseMock, buscarPorIdUseCaseMock, buscarSubcategoriasUseCaseMock)

        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
    })

    describe('buscarTodas', () => {
        it('deve retornar 200 com categorias raiz aninhadas com suas subcategorias', async () => {
            // Arrange
            const raiz = CategoriaMother.criarValido({ id: 'id-raiz' })
            const filha = CategoriaMother.criarValido({ id: 'id-filha', categoriaPaiId: 'id-raiz' })
            const raizSemFilhas = CategoriaMother.criarValido({ id: 'id-raiz-2' })
            buscarTodasUseCaseMock.execute.mockResolvedValue([raiz, filha, raizSemFilhas])
            // Act
            await controller.buscarTodas(req as any, res as any)
            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith([
                {
                    id: raiz.id,
                    nome: raiz.nome,
                    descricao: raiz.descricao,
                    subcategorias: [{ id: filha.id, nome: filha.nome, descricao: filha.descricao }]
                },
                {
                    id: raizSemFilhas.id,
                    nome: raizSemFilhas.nome,
                    descricao: raizSemFilhas.descricao,
                    subcategorias: []
                }
            ])
        })

        it('deve retornar 200 com lista vazia quando nao houver categorias', async () => {
            // Arrange
            buscarTodasUseCaseMock.execute.mockResolvedValue([])
            // Act
            await controller.buscarTodas(req as any, res as any)
            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith([])
        })
    })

    describe('buscarPorId', () => {
        it('deve retornar 200 com a categoria encontrada incluindo categoriaPaiId', async () => {
            // Arrange
            const categoriaMock = CategoriaMother.criarValido({ categoriaPaiId: 'id-pai-mock' })
            req = { params: { id: categoriaMock.id! } }
            buscarPorIdUseCaseMock.execute.mockResolvedValue(categoriaMock)
            // Act
            await controller.buscarPorId(req as any, res as any)
            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                id: categoriaMock.id,
                nome: categoriaMock.nome,
                descricao: categoriaMock.descricao,
                categoriaPaiId: categoriaMock.categoriaPaiId
            })
        })
    })

    describe('buscarSubcategorias', () => {
        it('deve retornar 200 com as subcategorias da categoria pai', async () => {
            // Arrange
            const idPai = 'id-pai-mock'
            const subcategoriasMock = CategoriaMother.criarLista(2, { categoriaPaiId: idPai })
            req = { params: { id: idPai } }
            buscarSubcategoriasUseCaseMock.execute.mockResolvedValue(subcategoriasMock)
            // Act
            await controller.buscarSubcategorias(req as any, res as any)
            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                subcategoriasMock.map(c => ({ id: c.id, nome: c.nome, descricao: c.descricao }))
            )
        })

        it('deve retornar 200 com lista vazia quando nao houver subcategorias', async () => {
            // Arrange
            req = { params: { id: 'id-pai-sem-filhas' } }
            buscarSubcategoriasUseCaseMock.execute.mockResolvedValue([])
            // Act
            await controller.buscarSubcategorias(req as any, res as any)
            // Assert
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith([])
        })
    })
})
