import { CadastrarServicoUseCase } from "./cadastrar-servico.use-case";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { Servico } from "../../../entities/servico/servico.entity";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

describe('Testes unitários do Use-Case: Cadastrar Serviço', () => {
    let cadastrarServicoUseCase: CadastrarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>
    let categoriaRepositoryMock: jest.Mocked<ICategoriaRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        categoriaRepositoryMock = CategoriaMother.criarRepositoryMock()
        cadastrarServicoUseCase = new CadastrarServicoUseCase(servicoRepositoryMock, categoriaRepositoryMock)
    })

    it('deve cadastrar um serviço com dados válidos', async () => {
        // Arrange
        const dtoMock = ServicoMother.criarDTO()
        const servicoMock: Servico = ServicoMother.criarValido(dtoMock)
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        servicoRepositoryMock.inserir.mockResolvedValue(servicoMock)
        // Act
        const servicoCadastrado = await cadastrarServicoUseCase.execute(dtoMock)
        // Assert
        expect(categoriaRepositoryMock.buscarPorId).toHaveBeenCalledWith(dtoMock.idCategoria)
        expect(servicoRepositoryMock.inserir).toHaveBeenCalled()
        expect(servicoCadastrado).not.toBeNull()
        expect(servicoCadastrado).toBeInstanceOf(Servico)
        expect(servicoCadastrado.idPrestador).toEqual(dtoMock.idPrestador)
        expect(servicoCadastrado.idCategoria).toEqual(dtoMock.idCategoria)
        expect(servicoCadastrado.descricao).toEqual(dtoMock.descricao)
    })

    it('deve lançar RecursoNaoEncontradoError quando idCategoria não existir', async () => {
        // Arrange
        const dtoMock = ServicoMother.criarDTO()
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            cadastrarServicoUseCase.execute(dtoMock)
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.inserir).not.toHaveBeenCalled()
    })
})
