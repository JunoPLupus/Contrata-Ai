import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { VerificarEmailUseCase } from "./verificar-email.use-case";
import { UsuarioCadastroDTO } from "../../../dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../entities/usuario/usuario.entity";
import { NomeUsuarioValueObject } from "../../../value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../../value-objects/usuario/email/email.vo";

describe('VerificarEmailUseCase', () => {

    let verificarEmailUseCase : VerificarEmailUseCase;
    let usuarioRepositoryMock : jest.Mocked<IUsuarioRepository>;
    let usuarioValidoDTOMock : UsuarioCadastroDTO;

    beforeEach(() => {
        usuarioRepositoryMock = {
            buscarPorEmail : jest.fn(),
            inserir: jest.fn()
        }
        verificarEmailUseCase = new VerificarEmailUseCase(usuarioRepositoryMock);

        usuarioValidoDTOMock = {
            nome: 'Fulano',
            email: 'fulano@gmail.com',
            senha: '123456',
            perfis: ['cliente', 'prestador']
        }
    })

    it('deve retornar um usuário caso existe uma conta com aquele e-mail', async () => {
        // Arrange
        const usuarioProps = {
            nome: new NomeUsuarioValueObject(usuarioValidoDTOMock.nome),
            senha: new SenhaUsuarioValueObject(usuarioValidoDTOMock.senha),
            email: new EmailUsuarioValueObject(usuarioValidoDTOMock.email),
            perfis: usuarioValidoDTOMock.perfis,
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        }
        const usuarioMock = Usuario.criarUsuario(usuarioProps)
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(usuarioMock)

        // Act
        const usuarioEncontrado = await verificarEmailUseCase.execute(usuarioValidoDTOMock.email)

        // Assert
        expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith(usuarioValidoDTOMock.email)
        expect(usuarioEncontrado).not.toBeNull()
        expect(usuarioEncontrado).toBeInstanceOf(Usuario)
    })

    it('deve retornar null caso não existe uma conta com aquele e-mail', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorEmail.mockResolvedValue(null)
        // Act
        const usuarioEncontrado = await verificarEmailUseCase.execute(usuarioValidoDTOMock.email)
        // Assert
        expect(usuarioRepositoryMock.buscarPorEmail).toHaveBeenCalledWith(usuarioValidoDTOMock.email)
        expect(usuarioEncontrado).toBeNull()
    })
})