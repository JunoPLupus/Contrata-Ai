import { Categoria } from "../../../entities/categoria/categoria.entity";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { BuscarTodasCategoriasUseCase } from "./buscar-todas-categorias.use-case";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";

describe('Testes unitários do Use-Case: Buscar Todas Categorias', () => {
    let useCase : BuscarTodasCategoriasUseCase
    let categoriaRepositoryMock : jest.Mocked<ICategoriaRepository>
    let categoriasMock : Categoria[]

    beforeEach(()=> {
        categoriaRepositoryMock = CategoriaMother.criarRepositoryMock()
        useCase = new BuscarTodasCategoriasUseCase(categoriaRepositoryMock)

        categoriasMock = CategoriaMother.criarLista(5)
    })

    it('deve retornar todas as categorias', async () => {
        // Arrange
        categoriaRepositoryMock.buscarTodas.mockResolvedValue(categoriasMock)
        // Act
        const categoriasEncontradas = await useCase.execute()
        // Assert
        expect(categoriasEncontradas).toHaveLength(5)
    })
})