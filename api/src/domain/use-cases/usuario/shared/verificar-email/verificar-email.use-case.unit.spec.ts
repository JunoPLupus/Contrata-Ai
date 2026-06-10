import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { VerificarEmailUseCase } from "./verificar-email.use-case";
import { UsuarioCadastroDTO } from "../../../../dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../../entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../../../test-helpers/usuario.mother";

describe('VerificarEmailUseCase', () => {

    let verificarEmailUseCase : VerificarEmailUseCase
    let usuarioRepositoryMock : jest.Mocked<IUsuarioRepository>
    let dtoValidoMock : UsuarioCadastroDTO

    beforeEach(() => {
        usuarioRepositoryMock = UsuarioMother.criarRepositoryMock()
        dtoValidoMock = UsuarioMother.criarDTOValido()
        verificarEmailUseCase = new VerificarEmailUseCase(usuarioRepositoryMock)
    })

    it('deve retornar um usuário caso existe uma conta com aquele e-mail', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido()
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock)

        // Act
        const usuarioEncontrado = await verificarEmailUseCase.execute(dtoValidoMock.email)

        // Assert
        expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith(dtoValidoMock.email)
        expect(usuarioEncontrado).not.toBeNull()
        expect(usuarioEncontrado).toBeInstanceOf(Usuario)
    })

    it('deve retornar null caso não existe uma conta com aquele e-mail', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(null)
        // Act
        const usuarioEncontrado = await verificarEmailUseCase.execute(dtoValidoMock.email)
        // Assert
        expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith(dtoValidoMock.email)
        expect(usuarioEncontrado).toBeNull()
    })
})