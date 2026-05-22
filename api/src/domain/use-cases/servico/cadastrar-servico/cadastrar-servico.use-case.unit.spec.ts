import { CadastrarServicoUseCase } from "./cadastrar-servico.use-case";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { Servico } from "../../../entities/servico/servico.entity";
import { ServicoMother } from "../../../../test-helpers/servico.mother";

describe('CadastrarServicoUseCase', () => {
    let cadastrarServicoUseCase: CadastrarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    beforeEach(() => {
        servicoRepositoryMock = {
            buscarPorId: jest.fn(),
            buscarPorIdPrestador: jest.fn(),
            inserir: jest.fn()
        }
        cadastrarServicoUseCase = new CadastrarServicoUseCase(servicoRepositoryMock)
    })

    it('deve cadastrar um serviço com dados válidos', async () => {
        // Arrange
        const dtoMock = ServicoMother.criarDTO()
        const servicoMock: Servico = ServicoMother.criarValido(dtoMock)
        servicoRepositoryMock.inserir.mockResolvedValue(servicoMock)
        // Act
        const servicoCadastrado = await cadastrarServicoUseCase.execute(dtoMock)
        // Assert
        expect(servicoRepositoryMock.inserir).toHaveBeenCalled()
        expect(servicoCadastrado).not.toBeNull()
        expect(servicoCadastrado).toBeInstanceOf(Servico)
        expect(servicoCadastrado.idPrestador).toEqual(dtoMock.idPrestador)
        expect(servicoCadastrado.idCategoria).toEqual(dtoMock.idCategoria)
        expect(servicoCadastrado.descricao).toEqual(dtoMock.descricao)
    })
})
