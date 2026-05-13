import { CadastrarPrestadorUseCase } from "./cadastrar-prestador.use-case";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { Prestador } from "../../../entities/prestador/prestador.entity";

describe('CadastrarPrestadorUseCase', () => {

    let cadastrarPrestadorUseCase : CadastrarPrestadorUseCase;
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>;

    beforeEach(() => {
        prestadorRepositoryMock = {
            inserir : jest.fn()
        }
        cadastrarPrestadorUseCase = new CadastrarPrestadorUseCase(prestadorRepositoryMock)
    })

    it('deve criar um prestador com dados válidos', async () => {
        // Arrange
        const idCliente = "321"
        const propsPrestador = {
            idCliente : idCliente
        }
        const prestadorMock : Prestador = Prestador.criarPrestador(propsPrestador);
        prestadorRepositoryMock.inserir.mockResolvedValue(prestadorMock);
        // Act
        const prestadorCriado = await cadastrarPrestadorUseCase.execute(idCliente);
        // Assert
        expect(prestadorRepositoryMock.inserir).toHaveBeenCalled()
        expect(prestadorCriado).not.toBeNull()
        expect(prestadorCriado).toBeInstanceOf(Prestador)
        expect(prestadorCriado.idCliente).toEqual(idCliente)
    })

    it.each([
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando o id de cliente for %s', async (_, idClienteInvalido) => {
        await expect(
            cadastrarPrestadorUseCase.execute(idClienteInvalido))
            .rejects.toThrow(
                expect.objectContaining({message: "O campo 'idCliente' é obrigatório."}))
    })
})