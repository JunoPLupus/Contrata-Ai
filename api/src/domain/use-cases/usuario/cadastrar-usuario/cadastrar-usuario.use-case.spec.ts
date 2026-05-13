import bcrypt from "bcrypt";

import { CadastrarUsuarioUseCase } from "./cadastrar-usuario.use-case";
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { UsuarioCadastroDTO } from "../../../dto/usuario/usuario-cadastro.dto";
import { NomeUsuarioValueObject } from "../../../value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../../value-objects/usuario/email/email.vo";
import { Usuario } from "../../../entities/usuario/usuario.entity";

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('senha_hash_mockada'),
    compare: jest.fn()
}));

describe('CadastrarUsuarioUseCase', () => {
    let cadastrarUsuarioUseCase: CadastrarUsuarioUseCase;
    let usuarioRepositoryMock : jest.Mocked<IUsuarioRepository>;
    let usuarioValidoDTOMock : UsuarioCadastroDTO;

    beforeEach(() => {
        usuarioRepositoryMock = {
            buscarPorEmail : jest.fn(),
            inserir: jest.fn()
        }
        cadastrarUsuarioUseCase = new CadastrarUsuarioUseCase(usuarioRepositoryMock);

        usuarioValidoDTOMock = {
            nome: 'Fulano',
            email: 'fulano@gmail.com',
            senha: '123456',
            perfis: ['cliente', 'prestador']
        }
    });

    it('deve criar usuário com dados válidos', async () => {
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
        usuarioRepositoryMock.inserir.mockResolvedValue(usuarioMock);

        // Act
        const usuarioCadastrado = await cadastrarUsuarioUseCase.execute(usuarioValidoDTOMock);

        // Assert
        expect(bcrypt.hash).toHaveBeenCalledWith(usuarioValidoDTOMock.senha, 10)
        expect(usuarioRepositoryMock.buscarPorEmail).not.toHaveBeenCalled();
        expect(usuarioRepositoryMock.inserir).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'fulano@gmail.com',
                ativo: true,
                reputacao_flag_cancelamento: 0
            })
        );
        expect(usuarioCadastrado).not.toBeNull()
        expect(usuarioCadastrado).toBeInstanceOf(Usuario)
    });
});