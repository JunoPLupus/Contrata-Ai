import { CadastrarServicoUseCase } from "./cadastrar-servico.use-case";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { Servico } from "../../../entities/servico/servico.entity";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
import { ValorLimiteError } from "../../../errors/valor-limite.error";

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

    it('deve cadastrar com prazoMedioHoras inteiro', async () => {
        // Arrange
        const dtoMock = ServicoMother.criarDTO({ prazoMedioHoras: 72 })
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        servicoRepositoryMock.inserir.mockImplementation(async servico => servico)
        // Act
        const servicoCadastrado = await cadastrarServicoUseCase.execute(dtoMock)
        // Assert
        expect(servicoCadastrado.prazoMedioHoras).toBe(72)
    })

    it.each([
        ['fracionado', 1.5, FormatoInvalidoError],
        ['zero', 0, ValorLimiteError]
    ])('deve lançar erro de domínio quando prazoMedioHoras for %s', async (_, prazoInvalido, erroEsperado) => {
        // Arrange
        const dtoMock = ServicoMother.criarDTO({ prazoMedioHoras: prazoInvalido })
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        // Act & Assert
        await expect(cadastrarServicoUseCase.execute(dtoMock)).rejects.toThrow(erroEsperado)
        expect(servicoRepositoryMock.inserir).not.toHaveBeenCalled()
    })
})
