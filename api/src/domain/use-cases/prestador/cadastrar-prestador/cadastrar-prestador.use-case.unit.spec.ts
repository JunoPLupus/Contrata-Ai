import { CadastrarPrestadorUseCase } from "./cadastrar-prestador.use-case";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { Prestador } from "../../../entities/prestador/prestador.entity";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";

describe('CadastrarPrestadorUseCase', () => {
    let cadastrarPrestadorUseCase : CadastrarPrestadorUseCase
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>

    beforeEach(() => {
        prestadorRepositoryMock = {
            inserir : jest.fn()
        }
        cadastrarPrestadorUseCase = new CadastrarPrestadorUseCase(prestadorRepositoryMock)
    })

    it('deve criar um prestador com dados válidos', async () => {
        // Arrange
        const dtoMock = PrestadorMother.criarDTO()
        const prestadorMock : Prestador = PrestadorMother.criarValido(dtoMock)
        prestadorRepositoryMock.inserir.mockResolvedValue(prestadorMock)
        // Act
        const prestadorCriado = await cadastrarPrestadorUseCase.execute(dtoMock)
        // Assert
        expect(prestadorRepositoryMock.inserir).toHaveBeenCalled()
        expect(prestadorCriado).not.toBeNull()
        expect(prestadorCriado).toBeInstanceOf(Prestador)
        expect(prestadorCriado.idCliente).toEqual(dtoMock.idCliente)
    })

    it.each([
        ['vazio', { idCliente : ''}],
        ['só espaços', { idCliente : '   '}],
    ])('deve lançar erro quando o id de cliente for %s', async (_, prestadorInvalido) => {
        await expect(
            cadastrarPrestadorUseCase.execute(prestadorInvalido))
            .rejects.toThrow(
                expect.objectContaining({ message: "O campo 'idCliente' é obrigatório." }))
    })
})