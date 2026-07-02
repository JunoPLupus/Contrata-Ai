import { Categoria } from "../../../entities/categoria/categoria.entity";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { BuscarCategoriasPorCategoriaPaiIdUseCase } from "./buscar-categorias-por-categoria-pai-id.use-case";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";

describe('Testes unitários do Use-Case: Buscar categorias por categoriaPaiId', () => {
    let useCase : BuscarCategoriasPorCategoriaPaiIdUseCase
    let categoriaRepositoryMock : jest.Mocked<ICategoriaRepository>
    const categoriaMock : Categoria = CategoriaMother.criarValido()
    let categoriasMock : Categoria[]

    beforeEach(()=> {
        categoriaRepositoryMock = CategoriaMother.criarRepositoryMock()
        useCase = new BuscarCategoriasPorCategoriaPaiIdUseCase(categoriaRepositoryMock)

        categoriasMock = CategoriaMother.criarLista(3, { categoriaPaiId: categoriaMock.id })
    })

    it('deve retornar as categorias filhas de uma categoria', async () => {
        // Arrange
        categoriaRepositoryMock.buscarPorCategoriaPaiId.mockResolvedValue(categoriasMock)
        // Act
        const filhasEncontradas = await useCase.execute(<string>categoriaMock.id)
        // Assert
        expect(filhasEncontradas).toHaveLength(3)
        expect(filhasEncontradas.every(c => c.categoriaPaiId === categoriaMock.id)).toBe(true)
    })

    it('deve retornar uma lista vazia quando nenhuma categoria for encontrada', async () => {
        // Arrange
        categoriaRepositoryMock.buscarPorCategoriaPaiId.mockResolvedValue([])
        // Act
        const categoriasFilhasEncontradas = await useCase.execute(<string>categoriaMock.id)
        // Assert
        expect(categoriasFilhasEncontradas).toHaveLength(0)
    })
})