import { CadastrarClientePrestadorUseCase } from "./cadastrar-cliente-prestador.use-case";
import { CadastrarUsuarioUseCase } from "../cadastrar-usuario/cadastrar-usuario.use-case";
import { CadastrarPrestadorUseCase } from "../../prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { Usuario } from "../../../entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../../test-helpers/usuario.mother";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";

describe('CadastrarClientePrestadorUseCase', () => {
    let criarClientePrestadorUseCase: CadastrarClientePrestadorUseCase
    let cadastrarUsuarioUseCaseMock: jest.Mocked<CadastrarUsuarioUseCase>
    let cadastrarPrestadorUseCaseMock: jest.Mocked<CadastrarPrestadorUseCase>

    beforeEach(() => {
        cadastrarUsuarioUseCaseMock = { execute: jest.fn() } as unknown as jest.Mocked<CadastrarUsuarioUseCase>
        cadastrarPrestadorUseCaseMock = { execute: jest.fn() } as unknown as jest.Mocked<CadastrarPrestadorUseCase>
        criarClientePrestadorUseCase = new CadastrarClientePrestadorUseCase(
            cadastrarUsuarioUseCaseMock,
            cadastrarPrestadorUseCaseMock
        )
    })

    it('deve cadastrar usuario e prestador em sequencia e retornar usuario com idPrestador', async () => {
        // Arrange
        const dtoMock = UsuarioMother.criarDTOValido()
        const usuarioMock = UsuarioMother.criarUsuarioValido()
        const prestadorMock = PrestadorMother.criarValido()
        cadastrarUsuarioUseCaseMock.execute.mockResolvedValue(usuarioMock)
        cadastrarPrestadorUseCaseMock.execute.mockResolvedValue(prestadorMock)
        // Act
        const resultado = await criarClientePrestadorUseCase.execute(dtoMock)
        // Assert
        expect(cadastrarUsuarioUseCaseMock.execute).toHaveBeenCalledWith(dtoMock)
        expect(cadastrarPrestadorUseCaseMock.execute).toHaveBeenCalledWith({ idCliente: usuarioMock.id })
        expect(resultado).toBeInstanceOf(Usuario)
        expect(resultado.idPrestador).toBe(prestadorMock.id)
    })
})
