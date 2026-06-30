import { Categoria } from "../../../entities/categoria/categoria.entity";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { BuscarCategoriaPorIdUseCase } from "./buscar-categoria-por-id.use-case";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";

describe('Testes unitários do Use-case: Buscar categoria por id', () => {
    let useCase : BuscarCategoriaPorIdUseCase
    let categoriaRepositoryMock : jest.Mocked<ICategoriaRepository>
    let categoriaMock : Categoria

    beforeEach(()=> {
        categoriaRepositoryMock = CategoriaMother.criarRepositoryMock()
        useCase = new BuscarCategoriaPorIdUseCase(categoriaRepositoryMock)

        categoriaMock = CategoriaMother.criarValido()
    })

    it('deve retornar a categoria quando existir', async() => {
        // Arrange
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(categoriaMock)
        // Act
        const categoriaEncontrada = await useCase.execute(<string>categoriaMock.id)
        // Assert
        expect(categoriaRepositoryMock.buscarPorId).toHaveBeenCalledWith(categoriaMock.id)
        expect(categoriaEncontrada).toBeInstanceOf(Categoria)
    })

    it('deve lançar RecursoNaoEncontradoError quando a categoria não existir', async() => {
        // Arrange
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute(<string>categoriaMock.id))
            .rejects.toEqual(
                expect.objectContaining({ message: 'Categoria não encontrado.' }))
    })
})